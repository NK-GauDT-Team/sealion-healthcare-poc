import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Shield, Clock, Loader2, WifiOff, Wifi } from "lucide-react";

interface MedicineRecommendation {
  name: string;
  dosage: string;
  description: string;
  localAvailability: string;
}

interface Analysis {
  severity: "low" | "medium" | "high";
  analysis: string;
  seekEmergencyCare: boolean;
}

interface UiLabels {
  recommended?: string;   // heading for recommended meds
  dosage?: string;        // label before dosage
  availability?: string;  // availability phrase/pill
  emergency?: string;     // short emergency warning
}

interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  medicines?: MedicineRecommendation[];
  analysis?: Analysis;
  uiLabels?: UiLabels;
  language?: string | null;
}

interface ChatInterface2Props {
  initialMessages?: ChatMessage[];
  websocketUrl?: string;
  onMedicinesUpdate?: (medicines: MedicineRecommendation[]) => void;
  onLocationUpdate?: (location: { city: string; country: string }) => void;
}

// ######################################### THE HARDCODED SCRIPT STARTED HERE ###################################################################
// const SCRIPTED_CONVERSATION = [
//   {
//     // First script of discussion between User and System
//     userMessage: "Nama saya Indra, saya dari Indonesia dan sekarang sedang berkunjung ke Ho Chi Minh City, Vietnam. Saya biasanya minum Tolak Angin untuk masuk angin tapi tidak bisa menemukannya di sini. Apa obat klinis yang serupa di sini?",
//     systemResponse: "Mengquery database farmasi GraphRAG untuk alternatif klinis...\
//                           Menganalisis 2.341 profil obat yang cocok dengan senyawa aktif Tolak Angin.\
//                           GraphRAG mengidentifikasi obat-obatan yang tersedia di apotek Vietnam dengan efek terapeutik serupa.\
//                           Berdasarkan analisis pengelompokan gejala: manajemen mual, kembung, dan kelelahan.",
//     medicines: [
//       {
//         name: "Domperidone 10mg (Motilium)",
//         description: "Obat anti-muntah untuk mual dan kembung. Tersedia tanpa resep di Vietnam. GraphRAG mencocokkan ini berdasarkan profil peredaan gejala pencernaan yang mirip dengan efek anti-mual Tolak Angin.",
//         dosage: "Minum 1 tablet (10mg) 30 menit sebelum makan, 3 kali sehari"
//       },
//       {
//         name: "Simethicone 40mg (Air-X)",
//         description: "Obat anti-kembung untuk meredakan gas dan kembung. Skor korelasi GraphRAG: 78% untuk gejala ketidaknyamanan perut yang biasanya diobati dengan Tolak Angin.",
//         dosage: "Minum 1-2 tablet setelah makan dan sebelum tidur sesuai kebutuhan"
//       }
//     ],
//     analysis: {
//       severity: "rendah",
//       analysis: "Analisis GraphRAG menunjukkan gejala 'masuk angin' Anda sesuai dengan dispepsia funktional dalam istilah klinis. Obat yang direkomendasikan menargetkan gejala spesifik.",
//       seekEmergencyCare: false
//     }
//   },
//   {
//     // Second script of discussion between User and System
//     userMessage: "Saya sudah minum Domperidone tapi masih merasa mual dan sekarang juga sakit kepala",
//     systemResponse: "GraphRAG memperbarui protokol pengobatan berdasarkan perkembangan gejala...\
//                         Menganalisis 458 kasus dengan pola tidak responsif serupa terhadap pengobatan awal.\
//                         GraphRAG menyarankan pendekatan terapi kombinasi yang tersedia di apotek Vietnam.",
//     medicines: [
//       {
//         name: "Metoclopramide 10mg (Primperan)",
//         description: "Antiemetik yang lebih kuat yang juga membantu motilitas lambung. GraphRAG menunjukkan efektivitas 82% ketika Domperidone tidak cukup.",
//         usage: "Minum 1 tablet 30 menit sebelum makan, maksimal 3 kali sehari"
//       },
//       {
//         name: "Paracetamol 500mg (Panadol Extra)",
//         description: "Untuk meredakan sakit kepala dengan tambahan kafein untuk penyerapan yang lebih baik. Tersedia luas di Vietnam. Aman dikombinasikan dengan antiemetik.",
//         dosage: "Minum 1-2 tablet setiap 4-6 jam sesuai kebutuhan, maksimal 8 tablet sehari"
//       }
//     ],
//     analysis: {
//       severity: "sedang",
//       analysis: "Pengenalan pola GraphRAG menunjukkan kemungkinan gastroenteritis atau penyakit terkait makanan yang umum pada pelancong. Pantau tanda-tanda dehidrasi.",
//       seekEmergencyCare: false
//     }
//   },
//   {
//     // Third script of discussion between User and System
//     userMessage: "Apakah ini sesuatu yang serius? Saya sekarang mengalami demam dan kram perut disertai diare.",
//     systemResponse: "Penilaian tingkat keparahan GraphRAG menunjukkan eskalasi yang memerlukan intervensi klinis...\
//                         Berdasarkan 1.892 kasus diare pelancong dalam database, gejala Anda cocok dengan pola gastroenteritis akut.\
//                         Intervensi farmasi segera direkomendasikan dengan terapi rehidrasi.",
//     medicines: [
//       {
//         name: "Loperamide 2mg (Imodium)",
//         description: "Obat anti-diare. GraphRAG merekomendasikan untuk mengontrol gejala sambil mencari perawatan medis.",
//         dosage: "Minum 2 tablet pada awalnya, lalu 1 setelah setiap buang air besar cair, maksimal 8 tablet sehari"
//       },
//       {
//         name: "ORS (Oresol) Sachets",
//         description: "Garam rehidrasi oral yang penting untuk mencegah dehidrasi. Kritis berdasarkan skor risiko dehidrasi GraphRAG: 7.2/10",
//         dosage: "Campur 1 sachet dalam 200ml air, minum setelah setiap buang air besar"
//       }
//     ],
//     analysis: {
//       severity: "sedang",
//       analysis: "GraphRAG merekomendasikan mengunjungi klinik jika gejala berlanjut lebih dari 24 jam. Klinik internasional di HCMC: FV Hospital atau Columbia Asia.",
//       seekEmergencyCare: false
//     }
//   }
// ];
// ######################################### THE SCRIPT ENDED HERE ###################################################################

export default function ChatInterface2({
  initialMessages = [],
  //websocketUrl = "https://allocation-burner-ky-surgery.trycloudflare.com",
  websocketUrl = "ws://localhost:8765",
  onMedicinesUpdate,
  onLocationUpdate,
}: ChatInterface2Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "assistant",
      content:
        "Hello! I'm your medical assistant powered by GraphRAG. I can help you understand your symptoms and find local medicines. How are you feeling today?",
      timestamp: new Date(),
    },
    ...initialMessages,
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }

        wsRef.current = new WebSocket(websocketUrl);

        wsRef.current.onopen = () => {
          setIsConnected(true);
          setConnectionStatus("Connected");
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
          console.log("Connected to GraphRAG server");
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const rawType = (data?.type ?? "").toString().toLowerCase();
            const isResponseLike = ["response", "medical_response", "analysis", "result"].includes(rawType);

            if (rawType !== "status" && rawType !== "connection") {
              setIsTyping(false);
            }

            if (rawType === "connection") {
              setConnectionStatus(data.status === "ready" ? "GraphRAG Ready" : "Waiting for documents...");
              return;
            }

            if (rawType === "status") return;

            if (rawType === "error") {
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  type: "system",
                  content: `Error: ${data.message ?? "Unknown error"}`,
                  timestamp: new Date(),
                },
              ]);
              return;
            }

            if (isResponseLike) {
              let parsedFromMessage: any | null = null;
              if (typeof data.message === "string") {
                try {
                  // Remove ```json or ``` wrappers if present
                  const clean = data.message.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
                  parsedFromMessage = JSON.parse(clean);
                } catch {}
              }


              // Text to display in the bubble
              const analysisText =
                (typeof parsedFromMessage?.analysis === "string" && parsedFromMessage.analysis) ||
                (typeof parsedFromMessage?.disclaimer === "string" && parsedFromMessage.disclaimer) ||
                (typeof data?.analysis === "string" && data.analysis) ||
                (typeof data?.disclaimer === "string" && data.disclaimer) ||
                "";

              const displayMessage: string =
                  (parsedFromMessage && (analysisText || "Analysis complete.")) ||
                  (typeof data.message === "string" && data.message) ||
                  "Analysis complete.";

              // severity
              const severityRaw =
                (parsedFromMessage?.severity ?? data?.severity ?? "low").toString().toLowerCase();
              const severity: Analysis["severity"] =
                severityRaw === "high" ? "high" : severityRaw === "medium" ? "medium" : "low";
              const seekEmergencyCare =
                Boolean(parsedFromMessage?.seekEmergencyCare) || Boolean(data?.seekEmergencyCare);

              // localized UI labels from backend
              const uiLabels: UiLabels | undefined =
                (parsedFromMessage?.uiLabels as UiLabels) || (data?.uiLabels as UiLabels);

              // optional language code
              const language: string | null =
                (parsedFromMessage?.language as string) || (data?.language as string) || null;

              // medicines (preserve localAvailability from backend; fallback uses uiLabels.availability)
              const sourceMeds =
                (Array.isArray(data.medicines) && data.medicines) ||
                (parsedFromMessage?.medicines && Array.isArray(parsedFromMessage.medicines) && parsedFromMessage.medicines) ||
                [];
              const fallbackAvail = uiLabels?.availability || "Check availability";
              const medicines: MedicineRecommendation[] = sourceMeds.map((m: any) => ({
                name: m?.name ?? "",
                dosage: m?.dosage ?? "",
                description: m?.description ?? "",
                localAvailability: m?.localAvailability ?? fallbackAvail,
              }));

              if (medicines.length > 0 && onMedicinesUpdate) onMedicinesUpdate(medicines);

              const loc = (data as any).location || parsedFromMessage?.location;
              if (loc && onLocationUpdate) onLocationUpdate(loc);

              const analysisData: Analysis | undefined =
                severity || analysisText || seekEmergencyCare
                  ? { severity, analysis: analysisText, seekEmergencyCare }
                  : undefined;

              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  type: "assistant",
                  content: displayMessage,
                  timestamp: new Date(),
                  medicines,
                  analysis: analysisData,
                  uiLabels,
                  language,
                },
              ]);

              return;
            }

            // Fallback for unexpected message types
            setIsTyping(false);
            if (data?.message) {
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  type: "assistant",
                  content: String(data.message),
                  timestamp: new Date(),
                },
              ]);
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
            setIsTyping(false);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
          setConnectionStatus("Connection error");
          setIsTyping(false);
        };

        wsRef.current.onclose = () => {
          console.log("WebSocket connection closed");
          setIsConnected(false);
          setConnectionStatus("Disconnected - Reconnecting...");
          setIsTyping(false);

          if (!reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectTimeoutRef.current = null;
              connectWebSocket();
            }, 3000);
          }
        };
      } catch (e) {
        console.error("Failed to create WebSocket connection:", e);
        setConnectionStatus("Failed to connect");
        setIsTyping(false);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) wsRef.current.close();
    };
  }, [websocketUrl, onMedicinesUpdate, onLocationUpdate]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "user",
        content: inputMessage,
        timestamp: new Date(),
      },
    ]);
    setIsTyping(true);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "query", message: inputMessage }));
    }

    setInputMessage("");
  };

  return (
    <div className="w-full h-[600px] bg-white rounded-lg border border-gray-200 shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-medical-light flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-medical-blue rounded-full flex items-center justify-center">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">GraphRAG Medical Assistant</h3>
            <p className="text-xs text-medical-gray">Powered by Graph-enhanced RAG</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected ? <Wifi size={16} className="text-green-500" /> : <WifiOff size={16} className="text-red-500" />}
          <span className="text-xs">{connectionStatus}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const labels: UiLabels = {
            recommended: message.uiLabels?.recommended || "Recommended medicines:",
            dosage: message.uiLabels?.dosage || "Dosage",
            availability: message.uiLabels?.availability || "Check availability",
            emergency: message.uiLabels?.emergency || "Seek emergency medical care immediately",
          };

          return (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "items-start space-x-3"}`}
            >
              {message.type === "assistant" && (
                <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`rounded-lg p-3 max-w-sm ${
                  message.type === "user"
                    ? "bg-medical-blue text-white"
                    : message.type === "system"
                    ? "bg-red-50 border border-red-200"
                    : "bg-medical-light"
                }`}
              >
                <p className="text-sm">{message.content}</p>

                {/* Medicines */}
                {message.medicines && message.medicines.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium">{labels.recommended}</p>
                    {message.medicines.map((m, idx) => (
                      <div key={idx} className="bg-white p-2 rounded border">
                        <p className="font-medium text-xs">{m.name}</p>
                        {m.description && <p className="text-xs text-medical-gray">{m.description}</p>}
                        {m.dosage && (
                          <p className="text-xs text-medical-gray">
                            {labels.dosage}: {m.dosage}
                          </p>
                        )}
                        <p className="text-xs text-green-600">{m.localAvailability || labels.availability}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Severity */}
                {message.analysis?.severity && (
                  <div className="mt-2">
                    <Badge
                      variant={
                        message.analysis.severity === "high"
                          ? "destructive"
                          : message.analysis.severity === "medium"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {message.analysis.severity.toUpperCase()}
                    </Badge>
                  </div>
                )}

                {/* Emergency prompt */}
                {message.analysis?.seekEmergencyCare && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
                    <p className="text-xs text-red-800 font-medium">
                      ⚠️ {labels.emergency}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center text-white text-sm">
              <Bot size={16} />
            </div>
            <div className="bg-medical-light rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="animate-spin text-medical-blue" size={16} />
                <span className="text-sm text-medical-gray">Analyzing with GraphRAG...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={isConnected ? "Describe your symptoms..." : "Connecting to server..."}
            disabled={!isConnected}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!isConnected || !inputMessage.trim()}
            className="bg-medical-blue hover:bg-medical-blue/90"
          >
            <Send size={16} />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-medical-gray">
          <div className="flex items-center space-x-1">
            <Shield size={12} />
            <span>AI-powered medical guidance</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={12} />
            <span>Always consult healthcare professionals</span>
          </div>
        </div>
      </div>
    </div>
  );
}
