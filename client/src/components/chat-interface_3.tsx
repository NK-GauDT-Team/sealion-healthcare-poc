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
    userMessage: "My name is Alex, I'm from United Kingdom now visiting in Jakarta. I'd feel so bloated in my stomach, please recommend me a medicine.",
    systemResponse: "🔎 Searched and found info from 10 trusted websites! 🌐\
                          I understand you're experiencing a bloated in your stomach. \
                          These symptoms can have various causes. \
                          Can you tell me more about when this started and if you have any other symptoms?",
    medicines: [
      {
        name: "Tolak Angin",
        description: "For colds with symptoms of bloating, nausea, stomach ache, dizziness, chills, and a dry throat.\
                       Good for long journeys, fatigue, and sleep deprivation. To maintain/protect the immune system.",
        dosage: "Drink one sachet every 3 hours."
      },
      {
        name: "Antangin JRG Tablet",
        description: "The ginger content in this product can treat colds and increase the body's resistance.",
        dosage: "Take 1-2 tablets every 6-8 hours with food"
      }
    ],
    analysis: {
      severity: "low",
      analysis: "Your symptoms suggest common tension headache or mild fatigue. Rest and hydration are important.",
      seekEmergencyCare: false
    }
  },
  {
    // Second script of discussion between User and System
    userMessage: "The bloating pain is getting worse, and I feel like I might vomit",
    systemResponse: "🔎 Searched and found info from 3 trusted websites! 🌐 \
                        Experiencing bloating along with nausea or vomiting can be uncomfortable. \
                        Try to soothe your stomach with some herbal tea and rest.",
    medicines: [
      {
        name: "FreshCare Roll On",
        description: "FreshCare is an aromatherapy oil that is effective in relieving symptoms of dizziness, \
                        headaches, bloating, flu, or aches and pains that can occur when you catch a cold.",
        usage: "Apply to your abdomen or under your nose."
      },
      {
        name: "Wedang Jahe",
        description: "This beverage is valued for its warming effects and a range of health benefits, \
                        such as helping to relieve nausea and discomfort from bloating.",
        dosage: "Mix 1 packet with 200ml water, drink slowly"
      }
    ],
    analysis: {
      severity: "medium",
      analysis: "Fever with headache may indicate viral infection. Monitor temperature and seek care if symptoms worsen.",
      seekEmergencyCare: false
    }
  },
  {
    // Third script of discussion between User and System
    userMessage: "Is this something serious? I'm now experiencing a fever along with intense abdominal pain.",
    systemResponse: "🔎 Searched and found info from 5 trusted websites! 🌐 \
                        If your fever is rising above 39°C (102.2°F) or if you develop severe symptoms like difficulty breathing, \
                        persistent vomiting, or severe abdominal pain, you should seek immediate medical attention. \
                        For now, continue with fever management and rest.",
    medicines: [
      {
        name: "Paracetamol 500mg",
        description: "Continue for fever control",
        dosage: "Every 4-6 hours, alternate with ibuprofen if needed"
      },
      {
        name: "Panadol",
        description: "This medication provides relief from fever and the accompanying headache.",
        dosage: "Drink 1 tablet per day."
      }
    ],
    analysis: {
      severity: "medium",
      analysis: "Rising fever requires monitoring. Seek medical care if temperature exceeds 39°C or if symptoms worsen significantly.",
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
            <h3 className="font-semibold" data-testid="text-assistant-title">Medical Assistant (COMBINATION OF SEALION RAG AND MCP TO PROVIDE MODERN AND TRADITIONAL MEDICINE)</h3>
            <p className="text-xs opacity-75" data-testid="text-location">Online • Bangkok, Thailand</p>
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