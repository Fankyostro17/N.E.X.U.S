import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import VoiceInterface from "./VoiceInterface";
import BiometricPanel from "./BiometricPanel";
import ConversationPanel from "./ConversationPanel";
import SystemMonitor from "./SystemMonitor";
import NexusPersonality from "./NexusPersonality";
import { Brain, Shield, Clock, Zap } from "lucide-react";
import { useNexusAI } from "@/hooks/useNexusAI";

interface NexusInterfaceProps {
  isAuthenticated: boolean;
  user: any;
  onAuthSuccess: (userData: any) => void;
  isListening: boolean;
  transcript: string;
  faceActive: boolean;
}

export default function NexusInterface({
  isAuthenticated,
  user,
  onAuthSuccess,
  isListening,
  transcript,
  faceActive
}: NexusInterfaceProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { lastResponse } = useNexusAI();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Top Status Bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 p-6 pointer-events-auto"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <div className="glassmorphism rounded-lg p-4 mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-electric-blue pulse-glow flex items-center justify-center">
                  <Brain className="text-white text-lg" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-electric-blue text-glow">N.E.X.U.S.</h1>
                <p className="text-sm text-azure">Neural EXecution and Understanding System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* System Status */}
              <div className="text-center">
                <div className="text-success text-sm font-semibold">ONLINE</div>
                <div className="text-xs text-gray-400">All Systems Operational</div>
              </div>
              
              {/* User Recognition */}
              {isAuthenticated && user && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-golden pulse-glow flex items-center justify-center">
                    <Shield className="text-white text-sm" />
                  </div>
                  <div>
                    <div className="text-golden text-sm font-semibold">
                      {user.isCreator ? 'CREATOR' : 'AUTHORIZED'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {user.isCreator ? 'Full Access Granted' : 'Limited Access'}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Current Time */}
              <div className="text-center">
                <div className="text-white text-sm font-semibold flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(currentTime)}</span>
                </div>
                <div className="text-xs text-gray-400">Local Time</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Central Voice Interface */}
      <VoiceInterface
        isListening={isListening}
        transcript={transcript}
        isAuthenticated={isAuthenticated}
      />
      
      {/* Biometric Authentication Panel */}
      <BiometricPanel
        isAuthenticated={isAuthenticated}
        user={user}
        onAuthSuccess={onAuthSuccess}
        isListening={isListening}
        faceActive={faceActive}
      />
      
      {/* System Monitoring Widget */}
      <SystemMonitor />
      
      {/* N.E.X.U.S. Personality Panel */}
      <NexusPersonality
        user={user}
        isActive={isAuthenticated}
        lastResponse={lastResponse ? {
          emotion: lastResponse.emotion,
          action: lastResponse.action,
          response: lastResponse.response,
          systemCommandResult: lastResponse.systemCommandResult
        } : undefined}
      />

      {/* Conversation Panel */}
      {isAuthenticated && (
        <ConversationPanel
          user={user}
          transcript={transcript}
        />
      )}
    </motion.div>
  );
}
