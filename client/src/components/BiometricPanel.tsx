import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { UserCheck, Shield, Mic, Camera, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface BiometricPanelProps {
  isAuthenticated: boolean;
  user: any;
  onAuthSuccess: (userData: any) => void;
  isListening: boolean;
  faceActive: boolean;
}

export default function BiometricPanel({
  isAuthenticated,
  user,
  onAuthSuccess,
  isListening,
  faceActive
}: BiometricPanelProps) {
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'analyzing' | 'verified' | 'failed'>('idle');
  const [faceStatus, setFaceStatus] = useState<'idle' | 'scanning' | 'verified' | 'failed'>('idle');

  const authMutation = useMutation({
    mutationFn: async (authData: any) => {
      const response = await apiRequest('POST', '/api/auth/biometric', authData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        onAuthSuccess(data.user);
        setVoiceStatus('verified');
        setFaceStatus('verified');
      } else {
        setVoiceStatus('failed');
        setFaceStatus('failed');
      }
    },
    onError: () => {
      setVoiceStatus('failed');
      setFaceStatus('failed');
    }
  });

  useEffect(() => {
    if (isListening && !isAuthenticated) {
      setVoiceStatus('analyzing');
    }
  }, [isListening, isAuthenticated]);

  useEffect(() => {
    if (faceActive && !isAuthenticated) {
      setFaceStatus('scanning');
    }
  }, [faceActive, isAuthenticated]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-success';
      case 'failed': return 'text-alert';
      case 'analyzing':
      case 'scanning': return 'text-azure';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string, type: 'voice' | 'face') => {
    if (isAuthenticated) return 'VERIFIED';
    
    switch (status) {
      case 'analyzing': return type === 'voice' ? 'ANALYZING' : 'SCANNING';
      case 'scanning': return 'SCANNING';
      case 'verified': return 'VERIFIED';
      case 'failed': return 'FAILED';
      default: return 'READY';
    }
  };

  const WaveBar = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
      className="wave-bar bg-electric-blue w-1 h-4 rounded"
      style={{ animationDelay: `${delay}s` }}
      animate={voiceStatus === 'analyzing' ? { scaleY: [1, 1.5, 1] } : {}}
      transition={{ duration: 0.5, repeat: Infinity, delay }}
    />
  );

  return (
    <motion.div
      className="absolute top-20 right-6 glassmorphism rounded-lg p-6 w-80 pointer-events-auto"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
    >
      <h3 className="text-lg font-bold text-electric-blue mb-4 text-glow">
        Biometric Authentication
      </h3>
      
      {/* Face Recognition */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300 flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span>Facial Recognition</span>
          </span>
          <span className={`text-sm font-semibold ${getStatusColor(faceStatus)}`}>
            {getStatusText(faceStatus, 'face')}
          </span>
        </div>
        
        <div className="relative h-20 bg-dark-blue rounded-lg overflow-hidden">
          {faceStatus === 'scanning' && (
            <div className="absolute inset-0 bg-gradient-to-r from-electric-blue to-azure opacity-20"></div>
          )}
          {faceStatus === 'verified' && (
            <div className="absolute inset-0 bg-gradient-to-r from-electric-blue to-success opacity-20"></div>
          )}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {faceStatus === 'verified' ? (
              <UserCheck className="text-success text-2xl" />
            ) : faceStatus === 'failed' ? (
              <AlertCircle className="text-alert text-2xl" />
            ) : (
              <motion.div
                className="face-scanner"
                animate={faceStatus === 'scanning' ? { rotate: 360 } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Camera className="text-azure text-2xl" />
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Voice Recognition */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300 flex items-center space-x-2">
            <Mic className="w-4 h-4" />
            <span>Voice Pattern</span>
          </span>
          <span className={`text-sm font-semibold ${getStatusColor(voiceStatus)}`}>
            {getStatusText(voiceStatus, 'voice')}
          </span>
        </div>
        
        <div className="flex items-center space-x-1 h-12 bg-dark-blue rounded-lg p-2">
          <WaveBar delay={0} />
          <WaveBar delay={0.1} />
          <WaveBar delay={0.2} />
          <WaveBar delay={0.3} />
          <WaveBar delay={0.4} />
          <WaveBar delay={0.5} />
          <WaveBar delay={0.6} />
          <WaveBar delay={0.7} />
        </div>
      </div>
      
      {/* Authorization Level */}
      {isAuthenticated && user && (
        <motion.div
          className={`rounded-lg p-3 border ${
            user.isCreator 
              ? 'bg-golden bg-opacity-20 border-golden' 
              : 'bg-azure bg-opacity-20 border-azure'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            <Shield className={user.isCreator ? 'text-golden' : 'text-azure'} />
            <span className={`font-semibold ${user.isCreator ? 'text-golden' : 'text-azure'}`}>
              {user.isCreator ? 'Creator Level Access' : 'Standard Access'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {user.isCreator 
              ? 'All systems and functions available' 
              : 'Limited system access granted'
            }
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
