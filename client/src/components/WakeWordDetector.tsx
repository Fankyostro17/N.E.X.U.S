import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { WakeWordDetector } from '@/lib/speechapi';
import { synthesizeSpeech } from '@/lib/speechapi';

interface WakeWordDetectorProps {
  onWakeWordDetected: (command: string) => void;
  isNexusActive: boolean;
}

export default function WakeWordDetectorComponent({
  onWakeWordDetected,
  isNexusActive
}: WakeWordDetectorProps) {
  const [isListening, setIsListening] = useState(false);
  const [lastDetected, setLastDetected] = useState<string | null>(null);
  const detectorRef = useRef<WakeWordDetector | null>(null);

  useEffect(() => {
    const initializeDetector = async () => {
      if (!isNexusActive) {
        const detector = new WakeWordDetector((transcript) => {
          setLastDetected(transcript);
          onWakeWordDetected(transcript);
          
          // Provide audio feedback
          synthesizeSpeech("N.E.X.U.S. attivato. Come posso aiutarti?");
        });

        const success = await detector.initialize();
        if (success) {
          detectorRef.current = detector;
          detector.start();
          setIsListening(true);
        }
      }
    };

    if (!isNexusActive) {
      initializeDetector();
    } else {
      // Stop detection when N.E.X.U.S. is active
      if (detectorRef.current) {
        detectorRef.current.stop();
        setIsListening(false);
      }
    }

    return () => {
      if (detectorRef.current) {
        detectorRef.current.stop();
      }
    };
  }, [isNexusActive, onWakeWordDetected]);

  if (isNexusActive) return null;

  return (
    <motion.div
      className="fixed top-4 left-4 glassmorphism rounded-lg p-3 z-30"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-3">
        <motion.div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isListening ? 'bg-electric-blue pulse-glow' : 'bg-gray-600'
          }`}
          animate={isListening ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isListening ? (
            <Mic className="text-white text-sm" />
          ) : (
            <MicOff className="text-white text-sm" />
          )}
        </motion.div>
        
        <div>
          <p className="text-xs text-gray-300 font-semibold">
            {isListening ? 'In ascolto...' : 'Wake Word Detector'}
          </p>
          <p className="text-xs text-azure">
            {isListening ? 'Dì "Hey N.E.X.U.S."' : 'Non attivo'}
          </p>
        </div>
        
        {isListening && (
          <Volume2 className="text-electric-blue text-sm animate-pulse" />
        )}
      </div>
      
      {lastDetected && (
        <motion.div
          className="mt-2 text-xs text-success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Ultimo rilevamento: {lastDetected}
        </motion.div>
      )}
    </motion.div>
  );
}