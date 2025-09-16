import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, Shield, Clock, AlertTriangle, Check } from "lucide-react";
import { EventSource } from "eventsource";
type EventSourceMessageEvent = { data: string };

type ProgressMsg = {
  step: number;
  total: number;
  percent: number;
  message: string;
};

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  medicines?: any[];
  nonPharmacologic?: any[];
  analysis?: any;
  error?: boolean;
}

interface ChatInterfaceProps {
  initialMessages?: ChatMessage[];
  onMedicinesUpdate?: (medicines: { name: string; explanation: string; [key: string]: any }[]) => void;
}

export default function ChatInterface({ initialMessages = [], onMedicinesUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your medical assistant. I can help you understand your symptoms and find local medicines. Please describe your symptoms and location so I can provide appropriate recommendations.",
      timestamp: new Date()
    },
    ...initialMessages
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingStep, setTypingStep] = useState(0);
  const [progressSteps, setProgressSteps] = useState<string[]>([]);
  const [progressStartAt, setProgressStartAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [expandedMedicines, setExpandedMedicines] = useState<{[key: string]: boolean}>({});
  const [expandedMethods, setExpandedMethods] = useState<{[key: string]: boolean}>({});

  // Handle typing step rotation
  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setTypingStep((prev) => (prev + 1) % 3);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTypingStep(0);
    }
  }, [isTyping]);

  // Elapsed time ticker once progress has started
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

  const callMedicalAPI = async (query: string) => {
    return new Promise<any>((resolve, reject) => {
      try {
        const backend = "http://ec2-54-234-165-21.compute-1.amazonaws.com:5000";
        // const backend = "http://localhost:5002"
        const es = new EventSource(`${backend}/stream?query=${query}`, { withCredentials: false });
        es.onopen = () => console.log('SSE open, readyState=', es.readyState)

        es.addEventListener("status", (ev: EventSourceMessageEvent) => {
          try {
            console.log("status:", ev.data);
            if (progressStartAt == null) {
              setProgressStartAt(Date.now());
              setElapsedMs(0);
            }
          } catch {}
        });

        es.addEventListener("progress", (ev: EventSourceMessageEvent) => {
          try {
            const payload = JSON.parse(ev.data as string) as { step?: number | string; message?: string; data?: any };
            console.log(payload)
            if (progressStartAt == null) {
              setProgressStartAt(Date.now());
              setElapsedMs(0);
            }
            const message = payload.message ?? '';

            setProgressSteps((prev) => {
              if (!message) return prev;
              if (prev.length === 0) return [message];
              if (prev[prev.length - 1] !== message) return [...prev, message];
              return prev;
            });
          } catch (e) {
            // ignore parsing issues during testing
          }
        });

        const handleCompleted = (ev: EventSourceMessageEvent) => {
          try { es.close(); } catch {}
          // finalize elapsed
          if (progressStartAt != null) {
            setElapsedMs(Date.now() - progressStartAt);
          }
          setProgressSteps((prev) => (prev.length && prev[prev.length - 1] === "Completed" ? prev : [...prev, "Completed"]));
          try {
            const payload = JSON.parse(ev.data as string) as { step?: number; message?: string; data?: any };
            console.log(payload)
            const resultData = payload?.data ?? {};
            try { localStorage.setItem('lastMedicalApiResponse', JSON.stringify(resultData)); } catch {}
            resolve(resultData.result);
          } catch (e) {
            // If parsing fails, resolve with an empty structure
            resolve({ result: { ok: true } });
          }
        };

        es.addEventListener("completed", (ev: EventSourceMessageEvent) => handleCompleted(ev));
        // es.addEventListener("complete", (ev: EventSourceMessageEvent) => handleCompleted(ev));

        es.onerror = (e: Event) => {
          try {
            es.close();
          } catch {}
          reject(e);
        };
      } catch (error) {
        reject(error);
      }
<<<<<<< HEAD
    });
=======
      
      const data = await response.json();
      console.log('API Response:', data);
      return data.result;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
>>>>>>> main
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

    try {
      const apiResponse = await callMedicalAPI(currentQuery);
      
      // Create response message based on API data
      let responseContent = "🔎 I've analyzed your symptoms and found some recommendations based on traditional medicine practices.\n\n";
      
      // Add analysis if available
      if (apiResponse.analysis) {
        responseContent += `📋 **Analysis:** ${apiResponse.analysis}\n\n`;
      }
      
      // Add severity information
      if (apiResponse.severity) {
        const severityEmoji = apiResponse.severity === 'high' ? '🔴' : 
                             apiResponse.severity === 'medium' ? '🟡' : '🟢';
        responseContent += `${severityEmoji} **Severity Level:** ${apiResponse.severity.toUpperCase()}\n\n`;
      }

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        medicines: apiResponse.medicine_details || [],
        nonPharmacologic: apiResponse.non_pharmacologic_methods || [],
        analysis: {
          severity: apiResponse.severity || 'low',
          analysis: apiResponse.analysis || '',
          seekEmergencyCare: apiResponse.severity === 'high'
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Share medicines with parent if requested
      try {
        if (onMedicinesUpdate) {
          const normalized = (apiResponse.medicine_details || []).map((m: any) => ({
            name: m?.name || m?.medicine_name || '',
            explanation: m?.explanation || m?.medicine_instruction || m?.description || '',
            dosage: m?.dosage,
            availability: m?.availability,
            source: 'chat-api',
            original: m,
          }));
          onMedicinesUpdate(normalized);
        }
      } catch (err) {
        // no-op for parent sharing
      }
    } catch (error) {
      // Handle API error
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to the medical database right now. Please try again in a moment, or consult with a healthcare professional if your symptoms are severe.",
        timestamp: new Date(),
        error: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
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
            <h3 className="font-semibold text-lg" data-testid="text-assistant-title">Medical Assistant</h3>
            <p className="text-sm opacity-90" data-testid="text-subtitle">SEALION MCP - Local & Traditional Medicine</p>
            <p className="text-xs opacity-75" data-testid="text-location">Online • Global Coverage</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm" data-testid="text-secure-connection">Secure Connection</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4" data-testid="chat-messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'items-start space-x-3'}`}>
            {message.type === 'assistant' && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 ${message.error ? 'bg-red-500' : 'bg-blue-600'}`}>
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
                      <p className="text-sm font-semibold text-green-700">Traditional Medicines:</p>
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
                            <p className="font-semibold text-sm text-green-800 capitalize">{medicine.medicine_name}</p>
                            <p className="text-xs text-gray-700 mt-1 leading-relaxed">{medicine.medicine_instruction}</p>
                            {medicine.dosage && (
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Dosage: {medicine.dosage}
                                </Badge>
                              </div>
                            )}
                          </div>
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
                  {progressSteps.length > 0 ? progressSteps[progressSteps.length - 1] : "Working..."}
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  {formatElapsed(elapsedMs)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Describe your symptoms and location (e.g., 'I'm Kevin from Jakarta, currently in Vietnam, and I have a cough with phlegm...')"
              // value={inputMessage}
              value = "Saya Shem dari Jakarta, saya sedang sakit kembung dan berada di Vietnam. Tolong rekomendasi obat untuk d minum"
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