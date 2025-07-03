import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Brain, User, Send, Mic, Activity } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ConversationPanelProps {
  user: any;
  transcript: string;
}

interface Message {
  id: string;
  type: 'user' | 'nexus';
  content: string;
  timestamp: Date;
  emotion?: string;
  isVoice?: boolean;
}

export default function ConversationPanel({ user, transcript }: ConversationPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useQuery({
    queryKey: ['/api/conversations'],
    refetchInterval: 5000,
  });

  const conversationMutation = useMutation({
    mutationFn: async (data: { message: string; isVoiceActivated: boolean }) => {
      const response = await apiRequest('POST', '/api/nexus/conversation', data);
      return response.json();
    },
    onSuccess: (data) => {
      const nexusMessage: Message = {
        id: Date.now().toString() + '_nexus',
        type: 'nexus',
        content: data.response,
        timestamp: new Date(),
        emotion: data.emotion
      };
      setMessages(prev => [...prev, nexusMessage]);
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    }
  });

  useEffect(() => {
    if (transcript && transcript.trim()) {
      handleSendMessage(transcript, true);
    }
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (message: string, isVoice = false) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content: message,
      timestamp: new Date(),
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    conversationMutation.mutate({ 
      message: message, 
      isVoiceActivated: isVoice 
    });
    
    setInputMessage('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'excited': return 'text-golden';
      case 'concerned': return 'text-alert';
      case 'alert': return 'text-alert';
      case 'focused': return 'text-azure';
      default: return 'text-electric-blue';
    }
  };

  const TypingIndicator = () => (
    <motion.div
      className="flex items-start space-x-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="w-8 h-8 rounded-full bg-electric-blue pulse-glow flex items-center justify-center">
        <Brain className="text-white text-sm" />
      </div>
      <div className="flex-1">
        <div className="bg-electric-blue bg-opacity-20 border border-electric-blue rounded-lg p-3">
          <div className="flex space-x-1 typing-dots">
            <span className="w-2 h-2 bg-electric-blue rounded-full"></span>
            <span className="w-2 h-2 bg-electric-blue rounded-full"></span>
            <span className="w-2 h-2 bg-electric-blue rounded-full"></span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      className="absolute bottom-6 left-6 right-6 glassmorphism rounded-lg p-6 max-h-96 overflow-y-auto pointer-events-auto"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.9 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-electric-blue text-glow">
          N.E.X.U.S. Conversation
        </h3>
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-success animate-pulse" />
          <span className="text-sm text-gray-400">Active Listening</span>
        </div>
      </div>
      
      <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            className="flex items-start space-x-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'user' 
                ? 'bg-golden' 
                : 'bg-electric-blue pulse-glow'
            }`}>
              {message.type === 'user' ? (
                <User className="text-white text-sm" />
              ) : (
                <Brain className="text-white text-sm" />
              )}
            </div>
            <div className="flex-1">
              <div className={`rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-dark-blue'
                  : 'bg-electric-blue bg-opacity-20 border border-electric-blue'
              }`}>
                <p className={`${
                  message.type === 'user' 
                    ? 'text-white' 
                    : getEmotionColor(message.emotion)
                }`}>
                  {message.content}
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-gray-400">
                  {message.type === 'user' ? user.fullName || user.username : 'N.E.X.U.S.'} • 
                  {message.timestamp.toLocaleTimeString()}
                </p>
                {message.isVoice && (
                  <Mic className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <form onSubmit={handleFormSubmit} className="flex items-center space-x-3 pt-4 border-t border-gray-700">
        <div className="flex-1 relative">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message or use voice..."
            className="w-full bg-dark-blue border-electric-blue text-white placeholder-gray-400 focus:border-azure focus:shadow-glow pr-12"
            disabled={conversationMutation.isPending}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Mic className="w-4 h-4 text-electric-blue cursor-pointer hover:text-azure transition-colors duration-300" />
          </div>
        </div>
        <Button
          type="submit"
          disabled={!inputMessage.trim() || conversationMutation.isPending}
          className="bg-electric-blue hover:bg-azure px-6 py-3 font-semibold transition-colors duration-300 pulse-glow"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </motion.div>
  );
}
