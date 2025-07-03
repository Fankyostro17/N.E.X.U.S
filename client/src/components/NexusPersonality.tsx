import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Brain, Heart, Zap, Shield, Eye } from 'lucide-react';

interface PersonalityState {
  mood: 'calm' | 'excited' | 'focused' | 'concerned' | 'pleased' | 'thoughtful';
  alertLevel: 'low' | 'medium' | 'high' | 'critical';
  learningMode: boolean;
  emotionalIntelligence: number;
  systemIntegration: number;
}

interface NexusPersonalityProps {
  user: any;
  isActive: boolean;
  lastResponse?: {
    emotion: string;
    action?: string;
    response?: string;
    systemCommandResult?: any;
  };
}

export default function NexusPersonality({ 
  user, 
  isActive, 
  lastResponse 
}: NexusPersonalityProps) {
  const [personality, setPersonality] = useState<PersonalityState>({
    mood: 'calm',
    alertLevel: 'low',
    learningMode: true,
    emotionalIntelligence: 85,
    systemIntegration: 95
  });

  useEffect(() => {
    if (lastResponse) {
      setPersonality(prev => ({
        ...prev,
        mood: lastResponse.emotion as any || prev.mood,
        alertLevel: lastResponse.emotion === 'alert' ? 'high' : 
                   lastResponse.emotion === 'concerned' ? 'medium' : 'low'
      }));
    }
  }, [lastResponse]);

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'excited': return 'text-golden';
      case 'concerned': return 'text-alert';
      case 'focused': return 'text-azure';
      case 'pleased': return 'text-success';
      case 'thoughtful': return 'text-electric-blue';
      default: return 'text-electric-blue';
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-alert';
      case 'high': return 'bg-warm-gold';
      case 'medium': return 'bg-azure';
      default: return 'bg-success';
    }
  };

  if (!isActive) return null;

  return (
    <motion.div
      className="fixed top-20 right-80 glassmorphism rounded-lg p-4 w-64 pointer-events-auto"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.8 }}
    >
      <h3 className="text-sm font-bold text-electric-blue mb-3 text-glow flex items-center space-x-2">
        <Brain className="w-4 h-4" />
        <span>N.E.X.U.S. Personalità</span>
      </h3>

      {/* Mood Indicator */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-300 flex items-center space-x-1">
            <Heart className="w-3 h-3" />
            <span>Stato Emotivo</span>
          </span>
          <span className={`text-xs font-semibold ${getMoodColor(personality.mood)}`}>
            {personality.mood.toUpperCase()}
          </span>
        </div>
        
        <motion.div 
          className={`h-2 rounded-full ${getMoodColor(personality.mood).replace('text-', 'bg-')} opacity-60`}
          animate={{ 
            opacity: [0.6, 0.9, 0.6],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Alert Level */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-300 flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Livello Allerta</span>
          </span>
          <span className="text-xs font-semibold text-white">
            {personality.alertLevel.toUpperCase()}
          </span>
        </div>
        
        <div className="w-full bg-dark-blue rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${getAlertColor(personality.alertLevel)}`}
            initial={{ width: 0 }}
            animate={{ 
              width: personality.alertLevel === 'critical' ? '100%' :
                     personality.alertLevel === 'high' ? '75%' :
                     personality.alertLevel === 'medium' ? '50%' : '25%'
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Learning Mode */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-300 flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>Modalità Apprendimento</span>
          </span>
          <motion.div
            className={`w-3 h-3 rounded-full ${
              personality.learningMode ? 'bg-success' : 'bg-gray-600'
            }`}
            animate={personality.learningMode ? { 
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1] 
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Intelligence Metrics */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-300 flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>Q.I. Emotivo</span>
          </span>
          <span className="text-xs font-semibold text-electric-blue">
            {personality.emotionalIntelligence}%
          </span>
        </div>
        
        <div className="w-full bg-dark-blue rounded-full h-1">
          <motion.div
            className="h-1 rounded-full bg-electric-blue"
            initial={{ width: 0 }}
            animate={{ width: `${personality.emotionalIntelligence}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>

      {/* System Integration */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-300">Integrazione Sistema</span>
          <span className="text-xs font-semibold text-success">
            {personality.systemIntegration}%
          </span>
        </div>
        
        <div className="w-full bg-dark-blue rounded-full h-1">
          <motion.div
            className="h-1 rounded-full bg-success"
            initial={{ width: 0 }}
            animate={{ width: `${personality.systemIntegration}%` }}
            transition={{ duration: 1, delay: 0.7 }}
          />
        </div>
      </div>

      {/* User Recognition */}
      {user && user.isCreator && (
        <motion.div
          className="pt-2 border-t border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="text-xs text-golden text-center">
            🔐 Creatore Riconosciuto
          </div>
          <div className="text-xs text-gray-400 text-center mt-1">
            Accesso Totale Garantito
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}