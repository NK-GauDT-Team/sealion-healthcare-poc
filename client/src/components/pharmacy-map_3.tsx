import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Crosshair,
  Wifi,
  WifiOff,
} from "lucide-react";

type TravelMode = "walking" | "driving";

interface MedIn {
  name: string;
  dosage?: string;
  description?: string;
  localAvailability?: string;
  source?: "sealion" | "graphrag"; // sealion => MCP/local remedy; graphrag => clinical
}

interface PharmacyMatch {
  medicineName: string;
  status: "in_stock" | "likely_in_stock" | "call_to_confirm" | "out_of_stock";
  score: number;
  url?: string;
}

interface Place {
  id: string;
  name: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  country?: string;
  city?: string;
  phoneNumber?: string;
  openingHours?: string;
  matches?: PharmacyMatch[];
  bestScore?: number;
  distance_km?: number;
  duration_min?: number;
}

interface WSResultPayload {
  center?: { lat: number; lon: number } | null;
  city?: string | null;
  pharmacies?: Place[];
  convenience?: Place[];
  source?: string;
  fallbackUsed?: boolean;
  message?: string;
  radius_km?: number;
}

interface Props {
  country?: string;
  className?: string;
  medicines?: MedIn[];
  websocketUrl?: string;
}

export default function PharmacyMap3({
  country = "",
  className = "",
  medicines = [],
  websocketUrl = "https://acquisitions-induction-considerable-webmaster.trycloudflare.com",
  //websocketUrl = "ws://localhost:8765",
}: Props) {
  // Split meds by source to decide which search each belongs to
  const medsGraph = useMemo(
    () => (medicines || []).filter((m) => m.source === "graphrag"),
    [medicines]
  );
  const medsMcp = useMemo(
    () => (medicines || []).filter((m) => m.source === "sealion"),
    [medicines]
  );
  const medsCombined = useMemo(() => [...medsGraph, ...medsMcp], [medsGraph, medsMcp]);
  const hasMedsGraph = medsGraph.length > 0;
  const hasMedsMcp = medsMcp.length > 0;
  const hasAnyMeds = medsCombined.length > 0;

  const [pharmacies, setPharmacies] = useState<Place[]>([]);
  const [stores, setStores] = useState<Place[]>([]);
  const [loadingPharm, setLoadingPharm] = useState(false);
  const [loadingStore, setLoadingStore] = useState(false);
  const [onlyMatches, setOnlyMatches] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [metaPharm, setMetaPharm] = useState<{ source?: string; fallbackUsed?: boolean; message?: string }>({});
  const [metaStore, setMetaStore] = useState<{ source?: string; fallbackUsed?: boolean; message?: string }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [center, setCenter] = useState<{ lat: number; lon: number } | null>(null);
  const [showAllMeds, setShowAllMeds] = useState(false);
  const [mode, setMode] = useState<TravelMode>("walking");

  // ws / gps refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const gpsRef = useRef<{ lat: number; lon: number } | null>(null);
  const gpsAccRef = useRef<number | null>(null);
  const gpsTsRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Connect WS
  useEffect(() => {
    const connect = () => {
      try {
        if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.close();
        wsRef.current = new WebSocket(websocketUrl);

        wsRef.current.onopen = () => {
          setIsConnected(true);
          setConnectionStatus("Connected");
          if (reconnectRef.current) {
            clearTimeout(reconnectRef.current);
            reconnectRef.current = null;
          }
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const t = String(data?.type || "").toLowerCase();
            if (t === "connection") {
              setConnectionStatus(data.status === "ready" ? "GraphRAG Ready" : "Waiting for documents...");
              return;
            }
            if (t === "pharmacy_search_result") {
              const payload = data as WSResultPayload;
              setPharmacies(Array.isArray(payload.pharmacies) ? payload.pharmacies : []);
              setMetaPharm({ source: payload.source, fallbackUsed: payload.fallbackUsed, message: payload.message });
              if (payload.center) setCenter(payload.center);
              setLoadingPharm(false);
              return;
            }
            if (t === "convenience_search_result") {
              const payload = data as WSResultPayload;
              setStores(Array.isArray(payload.convenience) ? payload.convenience : []);
              setMetaStore({ source: payload.source, fallbackUsed: payload.fallbackUsed, message: payload.message });
              if (payload.center) setCenter(payload.center);
              setLoadingStore(false);
              return;
            }
          } catch {
            setLoadingPharm(false);
            setLoadingStore(false);
          }
        };

        wsRef.current.onerror = () => {
          setIsConnected(false);
          setConnectionStatus("Connection error");
          setLoadingPharm(false);
          setLoadingStore(false);
        };

        wsRef.current.onclose = () => {
          setIsConnected(false);
          setConnectionStatus("Disconnected - Reconnecting...");
          setLoadingPharm(false);
          setLoadingStore(false);
          if (!reconnectRef.current) {
            reconnectRef.current = setTimeout(() => {
              reconnectRef.current = null;
              connect();
            }, 2000);
          }
        };
      } catch {
        setConnectionStatus("Failed to connect");
      }
    };
    connect();
    return () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
      if (wsRef.current) wsRef.current.close();
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [websocketUrl]);

  // Build payloads
  const basePayload = (list: MedIn[]) => ({
    radius_km: 2,
    limit: 4,
    mode,
    medicines: (list || []).map((m) => ({ name: m?.name ?? "", dosage: m?.dosage ?? "" })),
    country,
  });

  // Send searches
  const sendPharmacySearch = (extraUserLoc?: any) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN || medsGraph.length === 0) return;
    setLoadingPharm(true);
    const rid = String(Date.now()) + "_ph";
    const payload: any = { ...basePayload(medsGraph) };
    payload.user_location =
      extraUserLoc ??
      (gpsRef.current && {
        lat: gpsRef.current.lat,
        lon: gpsRef.current.lon,
        accuracy_m: gpsAccRef.current ?? undefined,
        ts: gpsTsRef.current ?? undefined,
      });
    wsRef.current.send(JSON.stringify({ type: "pharmacy_search", rid, payload }));
  };

  const sendConvenienceSearch = (extraUserLoc?: any) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN || medsMcp.length === 0) return;
    setLoadingStore(true);
    const rid = String(Date.now()) + "_cv";
    const payload: any = { ...basePayload(medsMcp) };
    payload.user_location =
      extraUserLoc ??
      (gpsRef.current && {
        lat: gpsRef.current.lat,
        lon: gpsRef.current.lon,
        accuracy_m: gpsAccRef.current ?? undefined,
        ts: gpsTsRef.current ?? undefined,
      });
    wsRef.current.send(JSON.stringify({ type: "convenience_search", rid, payload }));
  };

  // Auto-search when meds/mode change and GPS is fresh
  useEffect(() => {
    if (!isConnected) return;
    if (!(gpsRef.current && gpsTsRef.current && Date.now() - (gpsTsRef.current as number) <= 60_000)) return;
    // Only trigger if we have meds for the respective route
    if (hasMedsGraph) sendPharmacySearch();
    if (hasMedsMcp) sendConvenienceSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(medsGraph), JSON.stringify(medsMcp), mode, isConnected]);

  // Location button
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    // stop previous watcher if any
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);

    const started = Date.now();
    let best: GeolocationPosition | null = null;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { accuracy } = pos.coords;
        if (!best || (accuracy && accuracy < best.coords.accuracy)) best = pos;

        const goodEnough = accuracy !== null && accuracy !== undefined && accuracy <= 80;
        const waitedTooLong = Date.now() - started > 15000;

        if (goodEnough || waitedTooLong) {
          if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
          if (!best) return;

          gpsRef.current = { lat: best.coords.latitude, lon: best.coords.longitude };
          gpsAccRef.current = Math.round(best.coords.accuracy || 0);
          gpsTsRef.current = best.timestamp;

          const userLoc = {
            lat: gpsRef.current.lat,
            lon: gpsRef.current.lon,
            accuracy_m: gpsAccRef.current,
            ts: gpsTsRef.current,
          };

          if (hasMedsGraph) sendPharmacySearch(userLoc);
          if (hasMedsMcp) sendConvenienceSearch(userLoc);
        }
      },
      (err) => {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        alert(`Location error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 }
    );
  };

  // Filters & helpers
  const filtered = (list: Place[]) =>
    !onlyMatches ? list : list.filter((p) => (p.matches || []).some((m) => m.status !== "out_of_stock"));

  const statusBadge = (status: PharmacyMatch["status"], count?: number) => {
    const text = (status === "in_stock"
      ? "In stock"
      : status === "likely_in_stock"
      ? "Likely in stock"
      : status === "call_to_confirm"
      ? "Call to confirm"
      : "Out of stock") + (count && count > 1 ? ` (${count})` : "");
    switch (status) {
      case "in_stock":
        return <Badge className="text-xs bg-green-100 text-green-800">{text}</Badge>;
      case "likely_in_stock":
        return <Badge className="text-xs bg-emerald-100 text-emerald-800">{text}</Badge>;
      case "call_to_confirm":
        return <Badge className="text-xs bg-amber-100 text-amber-800">{text}</Badge>;
      default:
        return <Badge className="text-xs bg-red-100 text-red-800">{text}</Badge>;
    }
  };

  const renderStatusSummary = (p: Place) => {
    const counts = (p.matches || []).reduce<Record<PharmacyMatch["status"], number>>((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {} as any);
    const entries = Object.entries(counts) as Array<[PharmacyMatch["status"], number]>;
    if (!entries.length) return null;
    if (entries.length === 1) return statusBadge(entries[0][0]);
    return (
      <div className="flex flex-wrap gap-2">
        {entries.map(([s, c]) => (
          <span key={s}>{statusBadge(s, c)}</span>
        ))}
      </div>
    );
  };

  const handleNavigation = (p: Place) => {
    if (!p.latitude || !p.longitude) return;
    const origin = center || gpsRef.current;
    const dest = `${p.latitude},${p.longitude}`;
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lon}&destination=${dest}&travelmode=${mode}&dir_action=navigate`
      : `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=${mode}&dir_action=navigate`;
    window.open(url, "_blank");
  };

  // ────────────────────────────────────────────────────────────────────────────
  // UI Blocks
  // ────────────────────────────────────────────────────────────────────────────

  const MedList = () => (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <MapPin className="mr-2" size={20} />
          Recommended Medicines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {medsCombined?.length ? (
          <div className="space-y-3">
            {(showAllMeds ? medsCombined : medsCombined.slice(0, 2)).map((m, i) => (
              <div key={i} className="bg-medical-light p-3 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="pr-3">
                    <h4 className="font-semibold text-sm">{m.name}</h4>
                    {m.description && <p className="text-xs text-medical-gray mt-1">{m.description}</p>}
                    {m.dosage && <p className="text-xs text-medical-gray mt-1">Dosage: {m.dosage}</p>}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant="outline" className="text-xs">
                      {m.source === "graphrag" ? "Pharmacy (Clinical)" : "Convenience (Local Remedy)"}
                    </Badge>
                    {m.localAvailability && (
                      <Badge className="text-xs bg-green-100 text-green-800 self-end">{m.localAvailability}</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {medsCombined.length > 2 && (
              <div className="text-center">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowAllMeds((v) => !v)}>
                  {showAllMeds ? "Show Less" : "Show All"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-medical-gray">
            <p className="text-sm">No medicines yet.</p>
            <p className="text-xs mt-2">Describe your symptoms to get recommendations.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const NearbyPlaces = () => {
    const pharmList = filtered(pharmacies);
    const storeList = filtered(stores);

    return (
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MapPin className="mr-2" size={20} />
            Nearby Places
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleUseMyLocation}
                disabled={!isConnected || loadingPharm || loadingStore}
              >
                <Crosshair size={16} className="mr-1" />
                Use my location
              </Button>

              <div className="flex items-center gap-2">
                <label htmlFor="travel-mode" className="text-sm text-medical-gray">
                  Mode
                </label>
                <select
                  id="travel-mode"
                  className="border rounded-md px-2 py-1 text-sm"
                  value={mode}
                  onChange={(e) => setMode((e.target.value as TravelMode) || "walking")}
                  disabled={loadingPharm || loadingStore}
                >
                  <option value="walking">Walking</option>
                  <option value="driving">Driving</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-medical-gray">
              <input
                type="checkbox"
                checked={onlyMatches}
                onChange={(e) => setOnlyMatches(e.target.checked)}
              />
              Only show places with my medicines
            </label>
          </div>

          {/* Before medicines exist, show a single neutral empty state */}
          {!hasAnyMeds && <EmptyBlock />}

          {/* Once medicines exist, show the two labeled sections (only if they have meds) */}
          {hasAnyMeds && (
            <>
              {(metaPharm.source || metaPharm.message || metaStore.source || metaStore.message) && (
                <div className="text-xs text-gray-500 mb-2">
                  {metaPharm.source ? <>Pharmacy source: {metaPharm.source}. </> : null}
                  {metaStore.source ? <>Convenience source: {metaStore.source}. </> : null}
                  {metaPharm.message ? <>{metaPharm.message} </> : null}
                  {metaStore.message ? <>{metaStore.message}</> : null}
                </div>
              )}

              {/* Pharmacies — Clinical (GraphRAG) */}
              {hasMedsGraph && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      Pharmacies — Clinical (GraphRAG)
                    </Badge>
                  </div>

                  {loadingPharm ? (
                    <div className="text-sm text-medical-gray">Searching pharmacies…</div>
                  ) : pharmList.length ? (
                    <div className="space-y-3">
                      {pharmList.map((p) => (
                        <PlaceItem
                          key={p.id}
                          p={p}
                          selectedId={selectedId}
                          setSelectedId={setSelectedId}
                          onNavigate={() => handleNavigation(p)}
                          renderStatusSummary={renderStatusSummary}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyBlock />
                  )}
                </div>
              )}

              {/* Convenience Stores — Local Remedy (MCP) */}
              {hasMedsMcp && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800">
                      Convenience Stores — Local Remedy (MCP)
                    </Badge>
                  </div>

                  {loadingStore ? (
                    <div className="text-sm text-medical-gray">Searching convenience stores…</div>
                  ) : storeList.length ? (
                    <div className="space-y-3">
                      {storeList.map((p) => (
                        <PlaceItem
                          key={p.id}
                          p={p}
                          selectedId={selectedId}
                          setSelectedId={setSelectedId}
                          onNavigate={() => handleNavigation(p)}
                          renderStatusSummary={renderStatusSummary}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyBlock />
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection status */}
      <div className="flex items-center justify-end text-xs text-medical-gray">
        {isConnected ? <Wifi size={14} className="text-green-500 mr-1" /> : <WifiOff size={14} className="text-red-500 mr-1" />}
        <span>{connectionStatus}</span>
      </div>

      {/* unified meds list (badged by source) */}
      <MedList />

      {/* single "Nearby Places" card (reveals subsections once meds exist) */}
      <NearbyPlaces />
    </div>
  );
}

/* ---------- helpers (small components) ---------- */

function EmptyBlock() {
  return (
    <div className="text-center py-8 text-medical-gray">
      <p className="text-sm">No places found for this location/filters.</p>
      <p className="text-xs mt-2">Tap “Use my location” to search from your GPS.</p>
    </div>
  );
}

function PlaceItem({
  p,
  selectedId,
  setSelectedId,
  onNavigate,
  renderStatusSummary,
}: {
  p: Place;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  onNavigate: () => void;
  renderStatusSummary: (p: Place) => JSX.Element | null;
}) {
  return (
    <div
      className={`border rounded-lg p-3 transition-all cursor-pointer ${
        selectedId === p.id ? "border-medical-blue bg-medical-light" : "border-gray-200 hover:border-medical-blue/50"
      }`}
      onClick={() => setSelectedId(p.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">{p.name}</h4>
          {typeof p.distance_km === "number" ? (
            <Badge variant="outline" className="text-xs">
              {p.distance_km} km
            </Badge>
          ) : null}
        </div>
        {p.latitude && p.longitude ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate();
            }}
          >
            <Navigation size={14} className="mr-1" />
            <span className="text-xs">Navigate</span>
          </Button>
        ) : null}
      </div>

      <div className="space-y-1 text-xs text-medical-gray">
        {p.address && (
          <div className="flex items-center">
            <MapPin size={12} className="mr-2 flex-shrink-0" />
            {p.address}
          </div>
        )}
        {p.phoneNumber && (
          <div className="flex items-center">
            <Phone size={12} className="mr-2 flex-shrink-0" />
            {p.phoneNumber}
          </div>
        )}
        {p.openingHours && (
          <div className="flex items-center">
            <Clock size={12} className="mr-2 flex-shrink-0" />
            {p.openingHours}
          </div>
        )}
      </div>

      {!!(p.matches && p.matches.length) && (
        <>
          <div className="mt-2 flex flex-wrap gap-2">
            {p.matches!.map((m, i) => (
              <Badge key={i} variant="secondary" className="text-xs bg-gray-900 text-white">
                {m.medicineName}
              </Badge>
            ))}
          </div>
          <div className="mt-2">{renderStatusSummary(p)}</div>
        </>
      )}
    </div>
  );
}
