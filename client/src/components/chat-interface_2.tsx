import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, Shield, Clock } from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  medicines?: any[];
  analysis?: any;
}

interface ChatInterfaceProps {
  initialMessages?: ChatMessage[];
}

// ######################################### THE HARDCODED SCRIPT STARTED HERE ###################################################################
const SCRIPTED_CONVERSATION = [
  {
    // First script of discussion between User and System
    userMessage: "Nama saya Indra, saya dari Indonesia dan sekarang sedang berkunjung ke Ho Chi Minh City, Vietnam. Saya biasanya minum Tolak Angin untuk masuk angin tapi tidak bisa menemukannya di sini. Apa obat klinis yang serupa di sini?",
    systemResponse: "Mengquery database farmasi GraphRAG untuk alternatif klinis...\
                          Menganalisis 2.341 profil obat yang cocok dengan senyawa aktif Tolak Angin.\
                          GraphRAG mengidentifikasi obat-obatan yang tersedia di apotek Vietnam dengan efek terapeutik serupa.\
                          Berdasarkan analisis pengelompokan gejala: manajemen mual, kembung, dan kelelahan.",
    medicines: [
      {
        name: "Domperidone 10mg (Motilium)",
        description: "Obat anti-muntah untuk mual dan kembung. Tersedia tanpa resep di Vietnam. GraphRAG mencocokkan ini berdasarkan profil peredaan gejala pencernaan yang mirip dengan efek anti-mual Tolak Angin.",
        dosage: "Minum 1 tablet (10mg) 30 menit sebelum makan, 3 kali sehari"
      },
      {
        name: "Simethicone 40mg (Air-X)",
        description: "Obat anti-kembung untuk meredakan gas dan kembung. Skor korelasi GraphRAG: 78% untuk gejala ketidaknyamanan perut yang biasanya diobati dengan Tolak Angin.",
        dosage: "Minum 1-2 tablet setelah makan dan sebelum tidur sesuai kebutuhan"
      }
    ],
    analysis: {
      severity: "rendah",
      analysis: "Analisis GraphRAG menunjukkan gejala 'masuk angin' Anda sesuai dengan dispepsia funktional dalam istilah klinis. Obat yang direkomendasikan menargetkan gejala spesifik.",
      seekEmergencyCare: false
    }
  },
  {
    // Second script of discussion between User and System
    userMessage: "Saya sudah minum Domperidone tapi masih merasa mual dan sekarang juga sakit kepala",
    systemResponse: "GraphRAG memperbarui protokol pengobatan berdasarkan perkembangan gejala...\
                        Menganalisis 458 kasus dengan pola tidak responsif serupa terhadap pengobatan awal.\
                        GraphRAG menyarankan pendekatan terapi kombinasi yang tersedia di apotek Vietnam.",
    medicines: [
      {
        name: "Metoclopramide 10mg (Primperan)",
        description: "Antiemetik yang lebih kuat yang juga membantu motilitas lambung. GraphRAG menunjukkan efektivitas 82% ketika Domperidone tidak cukup.",
        usage: "Minum 1 tablet 30 menit sebelum makan, maksimal 3 kali sehari"
      },
      {
        name: "Paracetamol 500mg (Panadol Extra)",
        description: "Untuk meredakan sakit kepala dengan tambahan kafein untuk penyerapan yang lebih baik. Tersedia luas di Vietnam. Aman dikombinasikan dengan antiemetik.",
        dosage: "Minum 1-2 tablet setiap 4-6 jam sesuai kebutuhan, maksimal 8 tablet sehari"
      }
    ],
    analysis: {
      severity: "sedang",
      analysis: "Pengenalan pola GraphRAG menunjukkan kemungkinan gastroenteritis atau penyakit terkait makanan yang umum pada pelancong. Pantau tanda-tanda dehidrasi.",
      seekEmergencyCare: false
    }
  },
  {
    // Third script of discussion between User and System
    userMessage: "Apakah ini sesuatu yang serius? Saya sekarang mengalami demam dan kram perut disertai diare.",
    systemResponse: "Penilaian tingkat keparahan GraphRAG menunjukkan eskalasi yang memerlukan intervensi klinis...\
                        Berdasarkan 1.892 kasus diare pelancong dalam database, gejala Anda cocok dengan pola gastroenteritis akut.\
                        Intervensi farmasi segera direkomendasikan dengan terapi rehidrasi.",
    medicines: [
      {
        name: "Loperamide 2mg (Imodium)",
        description: "Obat anti-diare. GraphRAG merekomendasikan untuk mengontrol gejala sambil mencari perawatan medis.",
        dosage: "Minum 2 tablet pada awalnya, lalu 1 setelah setiap buang air besar cair, maksimal 8 tablet sehari"
      },
      {
        name: "ORS (Oresol) Sachets",
        description: "Garam rehidrasi oral yang penting untuk mencegah dehidrasi. Kritis berdasarkan skor risiko dehidrasi GraphRAG: 7.2/10",
        dosage: "Campur 1 sachet dalam 200ml air, minum setelah setiap buang air besar"
      }
    ],
    analysis: {
      severity: "sedang",
      analysis: "GraphRAG merekomendasikan mengunjungi klinik jika gejala berlanjut lebih dari 24 jam. Klinik internasional di HCMC: FV Hospital atau Columbia Asia.",
      seekEmergencyCare: false
    }
  }
];
// ######################################### THE SCRIPT ENDED HERE ###################################################################

export default function ChatInterface({ initialMessages = [] }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your medical assistant. I can help you understand your symptoms and find local medicines. How are you feeling today?",
      timestamp: new Date()
    },
    ...initialMessages
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStep, setConversationStep] = useState(0);
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [typingStep, setTypingStep] = useState(0);

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

  // Handle any key press to trigger scripted responses
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (conversationStep < SCRIPTED_CONVERSATION.length && !isTyping && !awaitingInput) {
        triggerScriptedConversation();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [conversationStep, isTyping, awaitingInput]);

  const triggerScriptedConversation = () => {
    if (conversationStep >= SCRIPTED_CONVERSATION.length) return;

    const currentScript = SCRIPTED_CONVERSATION[conversationStep];
    setAwaitingInput(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: currentScript.userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate typing delay and add system response
    setTimeout(() => {
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        type: 'assistant',
        content: currentScript.systemResponse,
        timestamp: new Date(),
        medicines: currentScript.medicines,
        analysis: currentScript.analysis
      };

      setMessages(prev => [...prev, systemMessage]);
      setIsTyping(false);
      setConversationStep(prev => prev + 1);
      setAwaitingInput(false);
    }, 3000); // 3 second delay to show all typing steps
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
    setInputMessage("");
    setIsTyping(true);

    // Simulate a generic response for manual inputs
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Thank you for sharing that information. I'm analyzing your symptoms. For the scripted demonstration, please press any key to continue with the predefined conversation flow.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg h-[600px] max-w-4xl w-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-medical-blue text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bot size={16} />
          </div>
          <div>
            <h3 className="font-semibold" data-testid="text-assistant-title">Medical Assistant (SEALION Graph-RAG EXTRACT PRESCRIPTIVE MEDICINE)</h3>
            <p className="text-xs opacity-75" data-testid="text-location">Online • Ho Chi Minh City, Vietnam</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-medical-success rounded-full"></div>
          <span className="text-xs" data-testid="text-secure-connection">Secure Connection</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4" data-testid="chat-messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'items-start space-x-3'}`}>
            {message.type === 'assistant' && (
              <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                <Bot size={16} />
              </div>
            )}
            
            <div className={`rounded-lg p-3 max-w-sm ${
              message.type === 'user' 
                ? 'bg-medical-blue text-white' 
                : 'bg-medical-light'
            }`}>
              <p className="text-sm" data-testid={`message-${message.type}-${message.id}`}>
                {message.content}
              </p>
              
              {/* Medicine recommendations */}
              {message.medicines && message.medicines.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium">Recommended medicines:</p>
                  {message.medicines.map((medicine, idx) => (
                    <div key={idx} className="bg-white p-2 rounded border" data-testid={`medicine-recommendation-${idx}`}>
                      <p className="font-medium text-xs">{medicine.name}</p>
                      <p className="text-xs text-medical-gray">{medicine.description}</p>
                      <p className="text-xs text-medical-gray">Dosage: {medicine.dosage}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Severity indicator */}
              {message.analysis?.severity && (
                <div className="mt-2">
                  <Badge 
                    variant={message.analysis.severity === 'high' ? 'destructive' : 
                            message.analysis.severity === 'medium' ? 'default' : 'secondary'}
                    data-testid={`severity-${message.analysis.severity}`}
                  >
                    {message.analysis.severity} priority
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center text-white text-sm">
              <Bot size={16} />
            </div>
            <div className="bg-medical-light rounded-lg p-3 max-w-sm">
              <div className="flex items-center space-x-2 text-xs text-medical-gray">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span data-testid="typing-indicator">
                  {(() => {
                    const steps = [
                      "Translating the meaning",
                      "Searching the local / traditional medicine nearby your area",
                      "Found medicines..."
                    ];
                    return steps[typingStep];
                  })()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Instruction for scripted demo */}
        {conversationStep < SCRIPTED_CONVERSATION.length && !isTyping && !awaitingInput && (
          <div className="text-center py-2">
            <p className="text-xs text-medical-gray bg-yellow-50 p-2 rounded-lg border border-yellow-200">
              Press any key to continue the scripted conversation ({conversationStep + 1}/{SCRIPTED_CONVERSATION.length})
            </p>
          </div>
        )}

        {conversationStep >= SCRIPTED_CONVERSATION.length && !isTyping && (
          <div className="text-center py-2">
            <p className="text-xs text-medical-gray bg-green-50 p-2 rounded-lg border border-green-200">
              Scripted conversation completed! You can now type your own messages.
            </p>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <Input
            type="text"
            placeholder={conversationStep < SCRIPTED_CONVERSATION.length ? "Press any key for scripted demo..." : "Describe your symptoms..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isTyping}
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-medical-blue hover:bg-medical-blue-dark"
            data-testid="button-send-message"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-medical-gray">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Shield size={12} />
              <span data-testid="text-disclaimer-privacy">Private & Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={12} />
              <span data-testid="text-disclaimer-availability">24/7 Available</span>
            </div>
          </div>
          <p className="text-xs" data-testid="text-medical-disclaimer">
            For informational purposes only. Consult a healthcare professional for serious conditions.
          </p>
        </div>
      </div>
    </div>
  );
}