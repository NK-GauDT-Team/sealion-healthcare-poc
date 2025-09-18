import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, Shield, Clock, AlertTriangle, Wifi, WifiOff } from "lucide-react";

// Types
interface EventSourceMessageEvent {
  data: string;
}

interface MedicineRecommendation {
  name?: string;
  medicine_name?: string;
  dosage?: string;
  description?: string;
  medicine_instruction?: string;
  explanation?: string;
  localAvailability?: string;
  availability?: string;
  source?: 'sealion' | 'graphrag';
}

interface NonPharmacologicMethod {
  method_name?: string;
  instructions?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
}

interface Analysis {
  severity: "low" | "medium" | "high";
  analysis: string;
  seekEmergencyCare: boolean;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  medicines?: MedicineRecommendation[];
  nonPharmacologic?: NonPharmacologicMethod[];
  analysis?: Analysis;
  source?: 'sealion' | 'graphrag' | 'combined';
  error?: boolean;
}

interface ChatInterface3Props {
  initialMessages?: ChatMessage[];
  websocketUrl?: string;
  onMedicinesUpdate?: (medicines: Array<{ name: string; dosage?: string; description?: string; localAvailability?: string; source?: 'sealion' | 'graphrag' }>) => void;
}

export default function ChatInterface3({ 
  initialMessages = [], 
  websocketUrl = " https://prove-penguin-img-exercise.trycloudflare.com",
  //websocketUrl = "ws://localhost:8765",
  onMedicinesUpdate 
}: ChatInterface3Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your medical assistant combining SEALION Graph-RAG and MCP to provide both modern and traditional medicine recommendations. How are you feeling today?",
      timestamp: new Date()
    },
    ...initialMessages
  ]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  
  // Progress tracking for SEALION API
  const [progressSteps, setProgressSteps] = useState<string[]>([]);
  const [progressStartAt, setProgressStartAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  
  // WebSocket ref for GraphRAG
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Store responses from both systems
  const sealionResponseRef = useRef<any>(null);
  const graphragResponseRef = useRef<any>(null);
  
  // Expanded state for medicines and methods
  const [expandedMedicines, setExpandedMedicines] = useState<{[key: string]: boolean}>({});
  const [expandedMethods, setExpandedMethods] = useState<{[key: string]: boolean}>({});

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Elapsed time ticker
  useEffect(() => {
    if (!isTyping || progressStartAt == null) return;
    const t = setInterval(() => {
      setElapsedMs(Date.now() - progressStartAt);
    }, 500);
    return () => clearInterval(t);
  }, [isTyping, progressStartAt]);

  const formatElapsed = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // WebSocket connection for GraphRAG
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }

        wsRef.current = new WebSocket(websocketUrl);

        wsRef.current.onopen = () => {
          setIsConnected(true);
          setConnectionStatus("GraphRAG Connected");
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
            
            if (rawType === "connection") {
              setConnectionStatus(data.status === "ready" ? "GraphRAG Ready" : "Waiting for documents...");
              return;
            }

            if (rawType === "status") return;

            if (rawType === "error") {
              console.error("GraphRAG error:", data.message);
              return;
            }

            if (["response", "medical_response", "analysis", "result"].includes(rawType)) {
              // Store GraphRAG response
              graphragResponseRef.current = data;
              
              // Check if we have both responses
              if (sealionResponseRef.current && graphragResponseRef.current) {
                createCombinedResponse();
              }
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
          setConnectionStatus("Connection error");
        };

        wsRef.current.onclose = () => {
          console.log("WebSocket connection closed");
          setIsConnected(false);
          setConnectionStatus("Disconnected - Reconnecting...");
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
  }, [websocketUrl]);

  // Call SEALION API (from Journey #1)
  const callSealionAPI = async (query: string): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      try {
        const EventSource = (window as any).EventSource || require('eventsource');
        const backend = "https://api.sealionmcp.com";
        const es = new EventSource(`${backend}/stream?query=${encodeURIComponent(query)}`, { 
          withCredentials: false 
        });

        es.addEventListener("status", () => {
          if (progressStartAt == null) {
            setProgressStartAt(Date.now());
            setElapsedMs(0);
          }
        });

        es.addEventListener("progress", (ev: EventSourceMessageEvent) => {
          try {
            const payload = JSON.parse(ev.data as string) as { message?: string };
            if (progressStartAt == null) {
              setProgressStartAt(Date.now());
              setElapsedMs(0);
            }
            const message = payload.message ?? '';
            if (message) {
              setProgressSteps((prev) => {
                if (prev.length === 0) return [message];
                if (prev[prev.length - 1] !== message) return [...prev, message];
                return prev;
              });
            }
          } catch (e) {
            // ignore parsing issues
          }
        });

        const handleCompleted = (ev: EventSourceMessageEvent) => {
          try { es.close(); } catch {}
          if (progressStartAt != null) {
            setElapsedMs(Date.now() - progressStartAt);
          }
          setProgressSteps((prev) => (prev.length && prev[prev.length - 1] === "Completed" ? prev : [...prev, "Completed"]));
          try {
            const payload = JSON.parse(ev.data as string) as { data?: any };
            const resultData = payload?.data ?? {};
            resolve(resultData.result || resultData);
          } catch (e) {
            resolve({ ok: true });
          }
        };

        es.addEventListener("completed", handleCompleted);
        es.addEventListener("complete", handleCompleted);
        
        es.onerror = (e: Event) => {
          try { es.close(); } catch {}
          reject(new Error("SEALION API connection failed"));
        };
      } catch (error) {
        reject(error);
      }
    });
  };

  // Call GraphRAG via WebSocket
  const callGraphRAG = (query: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "query", message: query }));
    }
  };

  // Combine responses from both systems
  const createCombinedResponse = () => {
    const sealion = sealionResponseRef.current;
    const graphrag = graphragResponseRef.current;
    
    // Parse GraphRAG response if it's a JSON string in the message field
    let parsedGraphRAG: any = null;
    if (graphrag?.message && typeof graphrag.message === 'string') {
      try {
        // Remove ```json wrapper if present
        const cleanMessage = graphrag.message.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
        parsedGraphRAG = JSON.parse(cleanMessage);
      } catch (e) {
        console.error('Failed to parse GraphRAG JSON:', e);
      }
    }
    
    // Build combined analysis text
    let combinedContent = "";
    
    if (sealion?.analysis) {
      combinedContent += sealion.analysis;
    }
    if (parsedGraphRAG?.analysis) {
      if (combinedContent) combinedContent += "\n\n";
      combinedContent += parsedGraphRAG.analysis;
    } else if (graphrag?.analysis && typeof graphrag.analysis === 'string') {
      if (combinedContent) combinedContent += "\n\n";
      combinedContent += graphrag.analysis;
    }
    if (!combinedContent) combinedContent = "Analysis complete. Please see the recommendations below.";
    
    // Combine medicines
    const allMedicines: Array<{ name: string; dosage?: string; description?: string; localAvailability?: string; source?: 'sealion' | 'graphrag' }> = [];
    
    if (sealion?.medicine_details && Array.isArray(sealion.medicine_details)) {
      allMedicines.push(...sealion.medicine_details.map((m: any) => ({
        name: m.medicine_name || m.name,
        dosage: m.dosage,
        description: m.medicine_instruction || m.description || m.explanation,
        localAvailability: m.availability || m.localAvailability,
        source: 'sealion' as const
      })));
    }
    if (parsedGraphRAG?.medicines && Array.isArray(parsedGraphRAG.medicines)) {
      allMedicines.push(...parsedGraphRAG.medicines.map((m: any) => ({
        name: m.name,
        dosage: m.dosage,
        description: m.description,
        localAvailability: m.localAvailability,
        source: 'graphrag' as const
      })));
    } else if (graphrag?.medicines && Array.isArray(graphrag.medicines)) {
      allMedicines.push(...graphrag.medicines.map((m: any) => ({
        name: m.name,
        dosage: m.dosage,
        description: m.description,
        localAvailability: m.localAvailability,
        source: 'graphrag' as const
      })));
    }
    
    // Non-pharmacologic methods
    const allMethods: NonPharmacologicMethod[] = [
      ...(sealion?.non_pharmacologic_methods || [])
    ];
    
    // Severity
    const severities = ['low', 'medium', 'high'];
    const sealionSeverity = severities.indexOf(sealion?.severity || 'low');
    const graphragSeverity = severities.indexOf((parsedGraphRAG?.severity || graphrag?.severity || 'low') as string);
    const maxSeverity = severities[Math.max(sealionSeverity, graphragSeverity)] as 'low' | 'medium' | 'high';
    
    const seekEmergencyCare = sealion?.severity === 'high' || 
                              Boolean(parsedGraphRAG?.seekEmergencyCare) || 
                              Boolean(graphrag?.seekEmergencyCare);
    
    const combinedMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: combinedContent,
      timestamp: new Date(),
      medicines: allMedicines,
      nonPharmacologic: allMethods,
      analysis: {
        severity: maxSeverity,
        analysis: combinedContent,
        seekEmergencyCare
      },
      source: 'combined'
    };
    
    setMessages(prev => [...prev, combinedMessage]);
    setIsTyping(false);
    
    if (onMedicinesUpdate && allMedicines.length > 0) {
      onMedicinesUpdate(allMedicines);
    }
    
    // Clear refs for next query
    sealionResponseRef.current = null;
    graphragResponseRef.current = null;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputMessage;
    setInputMessage("");
    setIsTyping(true);
    setProgressSteps([]);
    setProgressStartAt(null);
    
    // Reset response refs
    sealionResponseRef.current = null;
    graphragResponseRef.current = null;

    try {
      // Call both systems in parallel
      const [sealionPromise] = await Promise.allSettled([
        callSealionAPI(currentQuery)
      ]);
      
      // Also call GraphRAG
      callGraphRAG(currentQuery);
      
      // Store SEALION response
      if (sealionPromise.status === 'fulfilled') {
        sealionResponseRef.current = sealionPromise.value;
        
        // If GraphRAG already responded, create combined response
        if (graphragResponseRef.current) {
          createCombinedResponse();
        }
      } else {
        console.error('SEALION API error:', sealionPromise.reason);
      }
      
      // Timeout to still show something if one side is slow
      setTimeout(() => {
        if (isTyping && (sealionResponseRef.current || graphragResponseRef.current)) {
          createCombinedResponse();
        }
      }, 10000);
      
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I'm having trouble connecting to the medical databases. Please try again in a moment.`,
        timestamp: new Date(),
        error: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg h-[700px] max-w-5xl w-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg" data-testid="text-assistant-title">Combined Medical Assistant</h3>
            <p className="text-sm opacity-90" data-testid="text-subtitle">SEALION MCP + GraphRAG</p>
            <p className="text-xs opacity-75" data-testid="text-location">Online • Global Coverage</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi size={16} className="text-green-400" />
          ) : (
            <WifiOff size={16} className="text-red-400" />
          )}
          <span className="text-sm" data-testid="text-connection-status">{connectionStatus}</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4" data-testid="chat-messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'items-start space-x-3'}`}>
            {message.type === 'assistant' && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 ${
                message.error ? 'bg-red-500' : 'bg-blue-600'
              }`}>
                {message.error ? <AlertTriangle size={16} /> : <Bot size={16} />}
              </div>
            )}
            
            <div className={`rounded-lg p-4 max-w-2xl ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white ml-auto' 
                : message.error 
                ? 'bg-red-50 border border-red-200'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <p className="text-sm whitespace-pre-line leading-relaxed" data-testid={`message-${message.type}-${message.id}`}>
                {message.content}
              </p>
              
              {/* Medicine recommendations */}
              {message.medicines && message.medicines.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🌿</span>
                      <p className="text-sm font-semibold text-green-700">Recommended Medicines:</p>
                    </div>
                    {message.medicines.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedMedicines(prev => ({
                          ...prev,
                          [message.id]: !prev[message.id]
                        }))}
                        className="text-xs text-green-600 hover:text-green-700 p-2 h-auto"
                      >
                        {expandedMedicines[message.id] ? 'Show Less' : `Show All (${message.medicines.length})`}
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3">
                    {(expandedMedicines[message.id] ? message.medicines : message.medicines.slice(0, 2)).map((medicine, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-green-100 shadow-sm" data-testid={`medicine-recommendation-${idx}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-green-800 capitalize">
                              {medicine.name || medicine.medicine_name}
                            </p>
                            <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                              {medicine.description || medicine.medicine_instruction || medicine.explanation}
                            </p>
                            {medicine.dosage && (
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Dosage: {medicine.dosage}
                                </Badge>
                              </div>
                            )}
                            {medicine.localAvailability && (
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {medicine.localAvailability}
                                </Badge>
                              </div>
                            )}
                          </div>
                          {medicine.source && (
                            <Badge variant="outline" className="text-xs ml-2">
                              {medicine.source === 'sealion' ? 'MCP' : 'GraphRAG'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Non-pharmacologic methods */}
              {message.nonPharmacologic && message.nonPharmacologic.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🏠</span>
                      <p className="text-sm font-semibold text-blue-700">Home Care Methods:</p>
                    </div>
                    {message.nonPharmacologic.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedMethods(prev => ({
                          ...prev,
                          [message.id]: !prev[message.id]
                        }))}
                        className="text-xs text-blue-600 hover:text-blue-700 p-2 h-auto"
                      >
                        {expandedMethods[message.id] ? 'Show Less' : `Show All (${message.nonPharmacologic.length})`}
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3">
                    {(expandedMethods[message.id] ? message.nonPharmacologic : message.nonPharmacologic.slice(0, 2)).map((method, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm" data-testid={`method-recommendation-${idx}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-blue-800 capitalize">{method.method_name}</p>
                            <p className="text-xs text-gray-700 mt-1 leading-relaxed">{method.instructions}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {method.frequency && (
                                <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  Frequency: {method.frequency}
                                </Badge>
                              )}
                              {method.duration && (
                                <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  Duration: {method.duration}
                                </Badge>
                              )}
                            </div>
                            {method.notes && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-start space-x-1">
                                <span>⚠️</span>
                                <span>{method.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Severity indicator and emergency warning */}
              {message.analysis?.severity && (
                <div className="mt-4 space-y-2">
                  <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border shadow-sm ${getSeverityColor(message.analysis.severity)}`} data-testid={`severity-${message.analysis.severity}`}>
                    <span className="mr-2">{getSeverityIcon(message.analysis.severity)}</span>
                    {message.analysis.severity.toUpperCase()} PRIORITY
                  </div>
                  {message.analysis.seekEmergencyCare && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-300 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-800">Immediate Medical Attention Recommended</p>
                          <p className="text-xs text-red-700 mt-1">Please consider consulting with a healthcare professional or visiting the nearest medical facility.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Source indicator */}
              {message.source && (
                <div className="mt-3">
                  <Badge variant="outline" className="text-xs">
                    Source: {message.source === 'combined' ? 'SEALION + GraphRAG' : message.source}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              <Bot size={16} />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-w-md border border-gray-200">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span data-testid="typing-indicator" className="animate-pulse">
                  {progressSteps.length > 0 
                    ? progressSteps[progressSteps.length - 1] 
                    : "Analyzing with SEALION and GraphRAG..."}
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  {formatElapsed(elapsedMs)}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Describe your symptoms and location..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={isTyping}
              data-testid="input-chat-message"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2"
            data-testid="button-send-message"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Shield size={12} className="text-green-600" />
              <span data-testid="text-disclaimer-privacy">Private & Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={12} className="text-blue-600" />
              <span data-testid="text-disclaimer-availability">24/7 Available</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 max-w-md text-right" data-testid="text-medical-disclaimer">
            For informational purposes only. Consult a healthcare professional for serious conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
