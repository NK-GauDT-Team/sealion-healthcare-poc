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

interface ConvenienceMatch {
  medicineName: string;
  status: "in_stock" | "likely_in_stock" | "call_to_confirm" | "out_of_stock";
  score: number;
  url?: string;
}

interface ConveniencePlace {
  id: string;
  name: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  country?: string;
  city?: string;
  phoneNumber?: string;
  openingHours?: string;
  matches?: ConvenienceMatch[];
  bestScore?: number;
  distance_km?: number | null;
  duration_min?: number | null;
}

interface WSConveniencePayload {
  center?: { lat: number; lon: number } | null;
  city?: string | null;
  convenience: ConveniencePlace[];
  source?: string;
  fallbackUsed?: boolean;
  message?: string;
  radius_km?: number;
}

interface PharmacyMapProps {
  country?: string;           
  city?: string;               
  className?: string;
  medicines?: Array<{
    name: string;
    dosage?: string;
    explanation?: string;      
    description?: string;      
    availability?: string;     
  }>;
  websocketUrl?: string;       
}

export default function PharmacyMap({
  country = "Thailand",
  city = "Bangkok",
  className = "",
  medicines = [],
  websocketUrl = "wss://rag.apisealionrag.com/ws",
}: PharmacyMapProps) {
  const [stores, setStores] = useState<ConveniencePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [onlyMatches, setOnlyMatches] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ source?: string; fallbackUsed?: boolean; message?: string }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting…");
  const [center, setCenter] = useState<{ lat: number; lon: number } | null>(null);
  const [showAllMedicines, setShowAllMedicines] = useState(false);
  const [mode, setMode] = useState<TravelMode>("walking");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);

  // latest good GPS fix
  const gpsRef = useRef<{ lat: number; lon: number } | null>(null);
  const gpsAccRef = useRef<number | null>(null);
  const gpsTsRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

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
              setConnectionStatus("MCP Ready");
              return;
            }

            if (t === "convenience_search_result") {
              const payload = data as WSConveniencePayload;
              const list = Array.isArray((payload as any).convenience)
                ? ((payload as any).convenience as ConveniencePlace[])
                : [];
              setStores(list);
              setMeta({
                source: (payload as any).source,
                fallbackUsed: (payload as any).fallbackUsed,
                message: (payload as any).message,
              });
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
          setConnectionStatus("Disconnected — Reconnecting…");
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

  // ---- Build request payload (GPS-only)
  const requestPayload = useMemo(
    () => ({
      radius_km: 2,
      limit: 4,
      mode,
      medicines: (medicines || []).map((m) => ({
        name: m?.name ?? "",
        dosage: m?.dosage ?? "",
      })),
    }),
    [medicines, mode]
  );

  // ---- Auto-search when medicines/mode change AND GPS fix is fresh (≤60s)
  useEffect(() => {
    if (!isConnected) return;
    if (!(requestPayload.medicines?.length > 0)) return;
    const fresh = gpsRef.current && gpsTsRef.current && Date.now() - gpsTsRef.current <= 60_000;
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

    wsRef.current.send(JSON.stringify({ type: "convenience_search", rid, payload }));
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

  const filteredStores = useMemo(() => {
    if (!onlyMatches) return stores;
    return stores.filter((p) => (p.matches || []).some((m) => m.status !== "out_of_stock"));
  }, [stores, onlyMatches]);

  const statusLabel = (status: ConvenienceMatch["status"]) => {
    switch (status) {
      case "in_stock": return "In stock";
      case "likely_in_stock": return "Likely in stock";
      case "call_to_confirm": return "Call to confirm";
      case "out_of_stock":
      default: return "Out of stock";
    }
  };

  const statusBadge = (status: ConvenienceMatch["status"], count?: number) => {
    const text = statusLabel(status) + (count && count > 1 ? ` (${count})` : "");
    switch (status) {
      case "in_stock":        return <Badge className="text-xs bg-green-100 text-green-800">{text}</Badge>;
      case "likely_in_stock": return <Badge className="text-xs bg-emerald-100 text-emerald-800">{text}</Badge>;
      case "call_to_confirm": return <Badge className="text-xs bg-amber-100 text-amber-800">{text}</Badge>;
      case "out_of_stock":
      default:                return <Badge className="text-xs bg-red-100 text-red-800">{text}</Badge>;
    }
  };

  const renderStatusSummary = (p: ConveniencePlace) => {
    const counts = (p.matches || []).reduce<Record<ConvenienceMatch["status"], number>>((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {} as any);
    const entries = Object.entries(counts) as Array<[ConvenienceMatch["status"], number]>;
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

  const handleNavigation = (p: ConveniencePlace) => {
    if (!p.latitude || !p.longitude) return;
    const origin = center || gpsRef.current;
    const dest = `${p.latitude},${p.longitude}`;
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lon}&destination=${dest}&travelmode=${mode}&dir_action=navigate`
      : `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=${mode}&dir_action=navigate`;
    window.open(url, "_blank");
  };

  // ---- UI
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection status */}
      <div className="flex items-center justify-end text-xs text-medical-gray">
        {isConnected ? <Wifi size={14} className="text-green-500 mr-1" /> : <WifiOff size={14} className="text-red-500 mr-1" />}
        <span>{connectionStatus}</span>
      </div>

      {/* Recommended Medicines (from ChatInterface) */}
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
              {(showAllMedicines ? medicines : medicines.slice(0, 2)).map((m, i) => {
                // prefer explanation/description for the text body
                const desc = m.description ?? m.explanation ?? "";
                return (
                  <div key={i} className="bg-medical-light p-3 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="pr-3">
                        <h4 className="font-semibold text-sm">{m.name}</h4>
                        {desc && <p className="text-xs text-medical-gray mt-1">{desc}</p>}
                      </div>
                      {m.availability && (
                        <Badge className="text-xs bg-green-100 text-green-800 self-start">{m.availability}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              {medicines.length > 2 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setShowAllMedicines((v) => !v)}
                    data-testid="button-toggle-medicines"
                  >
                    {showAllMedicines ? "Show Less" : "Show All"}
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

      {/* Nearby Convenience Stores */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MapPin className="mr-2" size={20} />
            Nearby Convenience Stores
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
              Only show stores with my medicines
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
              <p className="text-sm text-medical-gray mt-4">Finding stores and checking availability…</p>
            </div>
          ) : filteredStores.length ? (
            <div className="space-y-3">
              {filteredStores.map((p) => (
                <div
                  key={p.id}
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
              <p className="text-sm">No convenience stores found for this location/filters.</p>
              <p className="text-xs mt-2">Tap “Use my location” to search from your GPS.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
