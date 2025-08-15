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
    userMessage: "Tên tôi là Jonathan, tôi đến từ Vietnam và hiện đang thăm Manila, Philippines. Tôi bị đau họng rất nặng, xin vui lòng giới thiệu thuốc cho tôi.",
    systemResponse: "Đang truy vấn cơ sở dữ liệu dược phẩm GraphRAG và tìm kiếm cơ sở kiến thức về phương thuốc địa phương từ các trang web đáng tin cậy...\
                          Phân tích 3.156 hồ sơ điều trị cho các triệu chứng viêm họng.\
                          GraphRAG đã xác định cả thuốc lâm sàng và các phương thuốc truyền thống Philippines có sẵn ở Manila.\
                          Kết hợp y học dựa trên bằng chứng với các lựa chọn điều trị địa phương.",
    medicines: [
      {
        name: "Viên ngậm Strepsils",
        description: "Viên ngậm sát trùng chứa amylmetacresol và dichlorobenzyl alcohol. Điểm hiệu quả GraphRAG: 85% cho nhiễm trùng họng do vi khuẩn.",
        dosage: "Ngậm từ từ 1 viên trong miệng mỗi 2-3 giờ, tối đa 12 viên mỗi ngày"
      },
      {
        name: "Siro Lagundi (Vitex negundo)",
        description: "Thuốc thảo dược Philippines được Bộ Y tế chính thức phê duyệt để điều trị ho và đau họng. Có tính chất chống viêm tự nhiên.",
        dosage: "Uống 5-10ml ba lần mỗi ngày sau bữa ăn"
      }
    ],
    analysis: {
      severity: "thấp",
      analysis: "Phân tích GraphRAG và nguồn trang web đáng tin cậy chỉ ra mô hình viêm họng do virus. Khuyến nghị phương pháp kết hợp sử dụng viên ngậm sát trùng và thảo dược chống viêm.",
      seekEmergencyCare: false
    }
  },
  {
    // Second script of discussion between User and System
    userMessage: "Cơn đau họng đang trở nên tệ hơn khi tôi nuốt và tôi bắt đầu bị sốt",
    systemResponse: "GraphRAG kích hoạt tìm kiếm sâu dựa trên diễn biến triệu chứng với các tìm kiếm nguồn đáng tin cậy bổ sung...\
                        Tham chiếu chéo 892 trường hợp với sự kết hợp khó nuốt và sốt.\
                        Khuyến nghị thuốc theo toa mạnh hơn với quản lý sốt truyền thống.",
    medicines: [
      {
        name: "Amoxicillin 500mg",
        description: "Kháng sinh phổ rộng cho nhiễm trùng họng do vi khuẩn. GraphRAG chỉ ra xác suất 78% mắc viêm họng liên cầu khuẩn.",
        usage: "Uống 1 viên nang mỗi 8 giờ trong 7 ngày cùng với thức ăn"
      },
      {
        name: "Trà Sambong (Blumea balsamifera)",
        description: "Trà thuốc truyền thống Philippines có đặc tính hạ sốt. Được Bộ Y tế phê duyệt để giảm sốt và chống viêm.",
        dosage: "Pha 1 túi trà trong nước nóng, uống 3-4 lần mỗi ngày"
      }
    ],
    analysis: {
      severity: "trung bình",
      analysis: "Mô hình GraphRAG gợi ý khả năng nhiễm trùng vi khuẩn. Khuyến nghị liệu pháp kháng sinh kết hợp với quản lý sốt truyền thống.",
      seekEmergencyCare: false
    }
  },
  {
    // Third script of discussion between User and System
    userMessage: "Điều này có nghiêm trọng không? Tôi có những đốm trắng trên amidan và các tuyến ở cổ bị sưng",
    systemResponse: "Độ tin cậy chẩn đoán GraphRAG: 91% cho viêm amidan do vi khuẩn...\
                        Phân tích 1.247 trường hợp với dịch tiết amidan và sưng hạch bạch huyết.\
                        Cần can thiệp dược phẩm ngay lập tức với chăm sóc truyền thống hỗ trợ.",
    medicines: [
      {
        name: "Azithromycin 500mg (Zithromax)",
        description: "Kháng sinh macrolide cho các chủng kháng penicillin. GraphRAG khuyến nghị cho viêm amidan nặng có dịch tiết rõ ràng.",
        dosage: "Uống 500mg một lần mỗi ngày trong 3 ngày, tốt nhất là cùng giờ mỗi ngày"
      },
      {
        name: "Cao chiết Tawa-tawa (Euphorbia hirta)",
        description: "Thuốc truyền thống Philippines có đặc tính tăng cường miễn dịch. Hỗ trợ phục hồi và giảm viêm tự nhiên.",
        dosage: "Uống 5ml cao chiết pha với nước ấm, hai lần mỗi ngày sau bữa ăn"
      }
    ],
    analysis: {
      severity: "trung bình",
      analysis: "GraphRAG xác nhận viêm amidan do vi khuẩn cần kháng sinh. Hãy đến phòng khám nếu các triệu chứng không cải thiện trong 48 giờ. Các phòng khám ở Manila: Trung tâm Y tế Makati hoặc St. Luke's BGC.",
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
            <h3 className="font-semibold" data-testid="text-assistant-title">Medical Assistant (COMBINATION OF SEALION Graph-RAG AND MCP TO PROVIDE MODERN AND TRADITIONAL MEDICINE)</h3>
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