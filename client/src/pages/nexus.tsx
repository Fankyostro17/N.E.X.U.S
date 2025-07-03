import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NexusInterface from "@/components/NexusInterface";
import ParticleBackground from "@/components/ParticleBackground";
import WakeWordDetector from "@/components/WakeWordDetector";
import { Brain, X, Power } from "lucide-react";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useFaceRecognition } from "@/hooks/useFaceRecognition";
import { synthesizeSpeech } from "@/lib/speechapi";

export default function Nexus() {
  const [nexusActive, setNexusActive] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening,
    isSupported: voiceSupported 
  } = useVoiceRecognition();
  
  const { 
    isActive: faceActive,
    startRecognition: startFaceRecognition,
    stopRecognition: stopFaceRecognition,
    isSupported: faceSupported 
  } = useFaceRecognition();

  useEffect(() => {
    // Auto-activate N.E.X.U.S. after 2 seconds for demo
    const timer = setTimeout(() => {
      if (!nexusActive) {
        setNexusActive(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [nexusActive]);

  useEffect(() => {
    // Handle wake word detection
    if (transcript.toLowerCase().includes('hey nexus') || 
        transcript.toLowerCase().includes('hey n.e.x.u.s')) {
      if (!nexusActive) {
        setNexusActive(true);
      }
    }
  }, [transcript, nexusActive]);

  const toggleNexus = () => {
    setNexusActive(!nexusActive);
    
    if (!nexusActive) {
      // Start biometric recognition when activating
      if (voiceSupported) {
        startListening();
      }
      if (faceSupported) {
        startFaceRecognition();
      }
    } else {
      // Stop recognition when deactivating
      stopListening();
      stopFaceRecognition();
    }
  };

  const handleAuthSuccess = (userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
    
    // Welcome message when user is authenticated
    const welcomeMessage = userData.isCreator 
      ? `Benvenuto, Creatore. N.E.X.U.S. è completamente operativo e a tua disposizione.`
      : `Benvenuto, ${userData.fullName}. Accesso standard autorizzato.`;
    
    synthesizeSpeech(welcomeMessage);
  };

  const handleWakeWordDetected = (command: string) => {
    if (!nexusActive) {
      setNexusActive(true);
      
      // Start biometric recognition when activated by wake word
      if (voiceSupported) {
        startListening();
      }
      if (faceSupported) {
        startFaceRecognition();
      }
    }
  };

  return (
    <div className="min-h-screen bg-deep-space text-white font-nexus overflow-hidden relative">
      <ParticleBackground />
      
      {/* Background Content (simulated desktop) */}
      <div className="p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.h1 
            className="text-4xl font-bold text-white mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Desktop Environment
          </motion.h1>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300">
              <h3 className="text-xl font-semibold text-white mb-4">File Explorer</h3>
              <p className="text-gray-400">Navigate your files and folders with ease.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300">
              <h3 className="text-xl font-semibold text-white mb-4">Applications</h3>
              <p className="text-gray-400">Launch your favorite applications.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-300">
              <h3 className="text-xl font-semibold text-white mb-4">System Settings</h3>
              <p className="text-gray-400">Configure your system preferences.</p>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* N.E.X.U.S. Interface Overlay */}
      <AnimatePresence>
        {nexusActive && (
          <NexusInterface
            isAuthenticated={isAuthenticated}
            user={user}
            onAuthSuccess={handleAuthSuccess}
            isListening={isListening}
            transcript={transcript}
            faceActive={faceActive}
          />
        )}
      </AnimatePresence>
      
      {/* Wake Word Detector */}
      <WakeWordDetector
        onWakeWordDetected={handleWakeWordDetected}
        isNexusActive={nexusActive}
      />

      {/* N.E.X.U.S. Control Panel */}
      <motion.div 
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="flex flex-col items-center space-y-3">
          {/* Status Indicator */}
          <motion.div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              nexusActive 
                ? 'bg-success text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
            animate={nexusActive ? { 
              boxShadow: ['0 0 10px rgba(0,212,255,0.5)', '0 0 20px rgba(0,212,255,0.8)', '0 0 10px rgba(0,212,255,0.5)']
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {nexusActive ? 'N.E.X.U.S. ATTIVO' : 'N.E.X.U.S. INATTIVO'}
          </motion.div>

          {/* Main Control Button */}
          <motion.button
            onClick={toggleNexus}
            className={`w-16 h-16 rounded-full flex items-center justify-center pulse-glow transition-all duration-300 hover-glow hover-scale ${
              nexusActive ? 'bg-alert' : 'bg-electric-blue hover:bg-azure'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {nexusActive ? (
              <Power className="text-white text-xl" />
            ) : (
              <Brain className="text-white text-xl" />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
