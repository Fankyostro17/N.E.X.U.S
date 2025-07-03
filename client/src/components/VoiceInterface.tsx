import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

interface VoiceInterfaceProps {
  isListening: boolean;
  transcript: string;
  isAuthenticated: boolean;
}

export default function VoiceInterface({
  isListening,
  transcript,
  isAuthenticated
}: VoiceInterfaceProps) {
  const getStatusText = () => {
    if (!isAuthenticated) {
      return "Authentication Required";
    }
    if (isListening) {
      return "Listening...";
    }
    return 'Say "Hey N.E.X.U.S." to begin';
  };

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
    >
      <div className="glassmorphism rounded-full p-8 text-center">
        <div className="relative">
          {/* Voice Activation Button */}
          <motion.div
            className={`w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
              isListening 
                ? 'bg-success pulse-glow' 
                : isAuthenticated 
                  ? 'bg-electric-blue pulse-glow hover:bg-azure' 
                  : 'bg-gray-600'
            }`}
            whileHover={isAuthenticated ? { scale: 1.05 } : {}}
            whileTap={isAuthenticated ? { scale: 0.95 } : {}}
          >
            {isListening ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Mic className="text-white text-4xl" />
              </motion.div>
            ) : (
              <MicOff className="text-white text-4xl" />
            )}
          </motion.div>
          
          {/* Voice Wave Animation */}
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-electric-blue"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="absolute inset-2 rounded-full border-2 border-electric-blue opacity-75"></div>
              <div className="absolute inset-4 rounded-full border-2 border-electric-blue opacity-50"></div>
              <div className="absolute inset-6 rounded-full border-2 border-electric-blue opacity-25"></div>
            </motion.div>
          )}
        </div>
        
        <motion.p
          className="mt-6 text-azure text-lg"
          key={getStatusText()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {getStatusText()}
        </motion.p>
        
        {transcript && (
          <motion.div
            className="mt-4 p-3 bg-dark-blue rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-white text-sm">{transcript}</p>
          </motion.div>
        )}
        
        <div className="mt-2 text-sm text-gray-400">
          Voice Recognition: {isListening ? 'Active' : 'Ready'}
        </div>
      </div>
    </motion.div>
  );
}
