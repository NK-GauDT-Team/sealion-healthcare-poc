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

interface PharmacyMatch {
  medicineName: string;
  status: "in_stock" | "likely_in_stock" | "call_to_confirm" | "out_of_stock";
  score: number;
  url?: string;
}

interface Pharmacy {
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
  pharmacies: Pharmacy[];
  source?: string;
  fallbackUsed?: boolean;
  message?: string;
  radius_km?: number;
}

interface PharmacyMapProps {
  country?: string;
  className?: string;
  medicines?: Array<{
    name: string;
    dosage?: string;
    description?: string;
    localAvailability?: string;
  }>;
  websocketUrl?: string;
}

type TravelMode = "walking" | "driving";

export default function PharmacyMap2({
  country = "Vietnam",
  className = "",
  medicines = [],

  websocketUrl = " https://prove-penguin-img-exercise.trycloudflare.com",
  //websocketUrl = "ws://localhost:8765",
}: PharmacyMapProps) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);
  const [onlyMatches, setOnlyMatches] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ source?: string; fallbackUsed?: boolean; message?: string }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [center, setCenter] = useState<{ lat: number; lon: number } | null>(null);
  const [showAllMedicines, setShowAllMedicines] = useState(false);

  // NEW: travel mode state
  const [mode, setMode] = useState<TravelMode>("walking");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);

  // latest good GPS
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
              setPharmacies(Array.isArray((payload as any).pharmacies) ? (payload as any).pharmacies : []);
              setMeta({ source: (payload as any).source, fallbackUsed: (payload as any).fallbackUsed, message: (payload as any).message });
              setCenter(payload.center ?? null);
              setLoading(false);
              return;
            }
          } catch {
            setLoading(false);
          }
        };

        wsRef.current.onerror = () => {
          setIsConnected(false);
          setConnectionStatus("Connection error");
          setLoading(false);
        };

        wsRef.current.onclose = () => {
          setIsConnected(false);
          setConnectionStatus("Disconnected - Reconnecting...");
          setLoading(false);
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

  // GPS-only payload
  const requestPayload = useMemo(
    () => ({
      radius_km: 2,
      limit: 4,
      mode, // NEW
      medicines: (medicines || []).map((m) => ({
        name: m?.name ?? "",
        dosage: m?.dosage ?? "",
      })),
    }),
    [medicines, mode]
  );

  // Auto-search when medicines or mode change AND we have a fresh GPS (≤60s old)
  useEffect(() => {
    if (!isConnected) return;
    if (!(requestPayload.medicines?.length > 0)) return;
    const fresh = gpsRef.current && gpsTsRef.current && (Date.now() - gpsTsRef.current) <= 60_000;
    if (!fresh) return;
    sendSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(requestPayload), isConnected]);

  const sendSearch = (extra?: Partial<typeof requestPayload> & { user_location?: any }) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    const rid = String(Date.now());
    setLoading(true);
    const payload: any = {
      ...requestPayload,
      ...(extra || {}),
    };

    if (extra?.user_location) {
      payload.user_location = extra.user_location;
    } else if (gpsRef.current) {
      payload.user_location = {
        lat: gpsRef.current.lat,
        lon: gpsRef.current.lon,
        accuracy_m: gpsAccRef.current ?? undefined,
        ts: gpsTsRef.current ?? undefined,
      };
    }

    wsRef.current.send(JSON.stringify({ type: "pharmacy_search", rid, payload }));
  };

  const stopWatch = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    stopWatch();
    const started = Date.now();
    let best: GeolocationPosition | null = null;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (!best || (accuracy && accuracy < best.coords.accuracy)) best = pos;

        const goodEnough = accuracy !== null && accuracy !== undefined && accuracy <= 80;
        const waitedTooLong = Date.now() - started > 15_000;

        if (goodEnough || waitedTooLong) {
          stopWatch();
          if (!best) return;
          gpsRef.current = { lat: best.coords.latitude, lon: best.coords.longitude };
          gpsAccRef.current = Math.round(best.coords.accuracy || 0);
          gpsTsRef.current = best.timestamp;

          sendSearch({
            user_location: {
              lat: gpsRef.current.lat,
              lon: gpsRef.current.lon,
              accuracy_m: gpsAccRef.current,
              ts: gpsTsRef.current,
            },
          });
        }
      },
      (err) => {
        stopWatch();
        alert(`Location error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 25_000,
        maximumAge: 0,
      }
    );
  };

  const filteredPharmacies = useMemo(() => {
    if (!onlyMatches) return pharmacies;
    return pharmacies.filter((p) => (p.matches || []).some((m) => m.status !== "out_of_stock"));
  }, [pharmacies, onlyMatches]);

  const statusLabel = (status: PharmacyMatch["status"]) => {
    switch (status) {
      case "in_stock":
        return "In stock";
      case "likely_in_stock":
        return "Likely in stock";
      case "call_to_confirm":
        return "Call to confirm";
      case "out_of_stock":
      default:
        return "Out of stock";
    }
  };

  const statusBadge = (status: PharmacyMatch["status"], count?: number) => {
    const text = statusLabel(status) + (count && count > 1 ? ` (${count})` : "");
    switch (status) {
      case "in_stock":
        return <Badge className="text-xs bg-green-100 text-green-800">{text}</Badge>;
      case "likely_in_stock":
        return <Badge className="text-xs bg-emerald-100 text-emerald-800">{text}</Badge>;
      case "call_to_confirm":
        return <Badge className="text-xs bg-amber-100 text-amber-800">{text}</Badge>;
      case "out_of_stock":
      default:
        return <Badge className="text-xs bg-red-100 text-red-800">{text}</Badge>;
    }
  };

  // Open Google Maps — origin forced if available; mode from dropdown
  const handleNavigation = (p: Pharmacy) => {
    if (!p.latitude || !p.longitude) return;
    const origin = center || gpsRef.current;
    const dest = `${p.latitude},${p.longitude}`;
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lon}&destination=${dest}&travelmode=${mode}&dir_action=navigate`
      : `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=${mode}&dir_action=navigate`;
    window.open(url, "_blank");
  };

  const renderStatusSummary = (p: Pharmacy) => {
    const counts = (p.matches || []).reduce<Record<PharmacyMatch["status"], number>>((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {} as any);
    const entries = Object.entries(counts) as Array<[PharmacyMatch["status"], number]>;
    if (entries.length === 0) return null;
    if (entries.length === 1) return statusBadge(entries[0][0]);
    return (
      <div className="flex flex-wrap gap-2">
        {entries.map(([status, cnt]) => (
          <span key={status}>{statusBadge(status, cnt)}</span>
        ))}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection status */}
      <div className="flex items-center justify-end text-xs text-medical-gray">
        {isConnected ? <Wifi size={14} className="text-green-500 mr-1" /> : <WifiOff size={14} className="text-red-500 mr-1" />}
        <span>{connectionStatus}</span>
      </div>

      {/* Recommended Medicines */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <MapPin className="mr-2" size={20} />
              Recommended Medicines
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {medicines?.length ? (
            <div className="space-y-3">
              {(showAllMedicines ? medicines : medicines.slice(0, 2)).map((m, i) => (
                <div key={i} className="bg-medical-light p-3 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="pr-3">
                      <h4 className="font-semibold text-sm">{m.name}</h4>
                      {m.description && <p className="text-xs text-medical-gray mt-1">{m.description}</p>}
                    </div>
                    {m.localAvailability && (
                      <Badge className="text-xs bg-green-100 text-green-800 self-start">{m.localAvailability}</Badge>
                    )}
                  </div>
                </div>
              ))}
              {medicines.length > 2 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setShowAllMedicines((v) => !v)}
                    data-testid="button-toggle-medicines"
                  >
                    {showAllMedicines ? 'Show Less' : 'Show All'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-medical-gray">
              <p className="text-sm">No medicines recommended yet.</p>
              <p className="text-xs mt-2">Describe your symptoms to get recommendations.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nearby Pharmacies */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MapPin className="mr-2" size={20} />
            Nearby Pharmacies
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2">
              <Button variant="outline" onClick={handleUseMyLocation} disabled={!isConnected || loading}>
                <Crosshair size={16} className="mr-1" />
                Use my location
              </Button>

              <div className="flex items-center gap-2">
                <label htmlFor="travel-mode" className="text-sm text-medical-gray">Mode</label>
                <select
                  id="travel-mode"
                  className="border rounded-md px-2 py-1 text-sm"
                  value={mode}
                  onChange={(e) => setMode((e.target.value as TravelMode) || "walking")}
                  disabled={loading}
                >
                  <option value="walking">Walking</option>
                  <option value="driving">Driving</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-medical-gray">
              <input type="checkbox" checked={onlyMatches} onChange={(e) => setOnlyMatches(e.target.checked)} />
              Only show pharmacies with my medicines
            </label>
          </div>

          {(meta.source || meta.fallbackUsed || meta.message) && (
            <div className="text-xs text-gray-500 mb-2">
              {meta.source ? <>Source: {meta.source}. </> : null}
              {meta.fallbackUsed ? <>Fallback used. </> : null}
              {meta.message ? <>{meta.message}</> : null}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" />
              <p className="text-sm text-medical-gray mt-4">Finding pharmacies and checking availability…</p>
            </div>
          ) : filteredPharmacies.length ? (
            <div className="space-y-3">
              {filteredPharmacies.map((p) => (
                <div
                  key={p.id}
                  className={`border rounded-lg p-3 transition-all cursor-pointer ${
                    selectedPharmacy === p.id ? "border-medical-blue bg-medical-light" : "border-gray-200 hover:border-medical-blue/50"
                  }`}
                  onClick={() => setSelectedPharmacy(p.id)}
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
                          handleNavigation(p);
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-medical-gray">
              <p className="text-sm">No pharmacies found for this location/filters.</p>
              <p className="text-xs mt-2">Tap “Use my location” to search from your GPS.</p>
            </div>
          )}

          {/* Map placeholder */}
          {/* <div className="mt-4 bg-gray-100 rounded-lg h-48 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto mb-2" size={32} />
              <p className="text-sm text-medical-gray">Interactive map view</p>
              <p className="text-xs text-gray-500 mt-1">Click a pharmacy to see on map</p>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
