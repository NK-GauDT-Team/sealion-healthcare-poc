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
    userMessage: "My name is Jonathan, I'm from Singapore now visiting in Manila, Philippines. I have a really bad sore throat, please recommend me medicine.",
    systemResponse: "Querying GraphRAG pharmaceutical database and searching local remedy knowledge base from trusted websites...\
                          Analyzing 3,156 treatment profiles for pharyngitis symptoms.\
                          GraphRAG identified both clinical medications and traditional Filipino remedies available in Manila.\
                          Combining evidence-based medicine with local therapeutic options.",
    medicines: [
      {
        name: "Strepsils Lozenges",
        description: "Antiseptic lozenges containing amylmetacresol and dichlorobenzyl alcohol. GraphRAG efficacy score: 85% for bacterial throat infections.",
        dosage: "Dissolve 1 lozenge slowly in mouth every 2-3 hours, maximum 12 daily"
      },
      {
        name: "Lagundi (Vitex negundo) Syrup",
        description: "Filipino herbal medicine officially endorsed by DOH for cough and throat relief. Natural anti-inflammatory properties.",
        dosage: "Take 5-10ml three times daily after meals"
      }
    ],
    analysis: {
      severity: "low",
      analysis: "GraphRAG analysis and trusted website source indicates viral pharyngitis pattern. Combined approach using antiseptic lozenges and herbal anti-inflammatory recommended.",
      seekEmergencyCare: false
    }
  },
  {
    // Second script of discussion between User and System
    userMessage: "The throat pain is getting worse when I swallow and I'm starting to get fever",
    systemResponse: "GraphRAG indepth search activated based on symptom progression with additional trusted source searches...\
                        Cross-referencing 892 cases with dysphagia and pyrexia combination.\
                        Recommending stronger prescription medications with traditional fever management.",
    medicines: [
      {
        name: "Amoxicillin 500mg",
        description: "Broad-spectrum antibiotic for bacterial throat infections. GraphRAG indicates 78% probability of streptococcal pharyngitis.",
        usage: "Take 1 capsule every 8 hours for 7 days with food"
      },
      {
        name: "Sambong Tea (Blumea balsamifera)",
        description: "Traditional Filipino medicinal tea with antipyretic properties. DOH-approved for fever reduction and anti-inflammatory effects.",
        dosage: "Steep 1 tea bag in hot water, drink 3-4 times daily"
      }
    ],
    analysis: {
      severity: "medium",
      analysis: "GraphRAG pattern suggests possible bacterial infection. Antibiotic therapy combined with traditional fever management recommended.",
      seekEmergencyCare: false
    }
  },
  {
    // Third script of discussion between User and System
    userMessage: "Is this serious? I have white spots on my tonsils and my neck glands are swollen",
    systemResponse: "GraphRAG diagnostic confidence: 91% for bacterial tonsillitis...\
                        Analyzing 1,247 cases with tonsillar exudate and lymphadenopathy.\
                        Immediate pharmaceutical intervention required with supportive traditional care.",
    medicines: [
      {
        name: "Azithromycin 500mg (Zithromax)",
        description: "Macrolide antibiotic for penicillin-resistant strains. GraphRAG recommends for severe tonsillitis with visible exudate.",
        dosage: "Take 500mg once daily for 3 days, preferably same time each day"
      },
      {
        name: "Tawa-tawa (Euphorbia hirta) Extract",
        description: "Filipino traditional medicine with immune-boosting properties. Supports recovery and reduces inflammation naturally.",
        dosage: "Take 5ml extract mixed with warm water, twice daily after meals"
      }
    ],
    analysis: {
      severity: "medium",
      analysis: "GraphRAG confirms bacterial tonsillitis requiring antibiotics. Visit a clinic if symptoms don't improve in 48 hours. Manila clinics: Makati Medical Center or St. Luke's BGC.",
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
            <p className="text-xs opacity-75" data-testid="text-location">Online • Manila, Philippines</p>
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