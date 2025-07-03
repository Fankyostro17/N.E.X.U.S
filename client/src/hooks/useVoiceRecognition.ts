import { useState, useEffect, useCallback } from 'react';
import { initializeSpeechRecognition, startVoiceRecognition, stopVoiceRecognition } from '@/lib/speechapi';

export interface VoiceRecognitionHook {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

export function useVoiceRecognition(): VoiceRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const setupSpeechRecognition = async () => {
      try {
        const recognitionInstance = await initializeSpeechRecognition();
        if (recognitionInstance) {
          setRecognition(recognitionInstance);
          setIsSupported(true);
          
          recognitionInstance.onresult = (event) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            setTranscript(text);
          };
          
          recognitionInstance.onstart = () => {
            setIsListening(true);
            setError(null);
          };
          
          recognitionInstance.onend = () => {
            setIsListening(false);
          };
          
          recognitionInstance.onerror = (event) => {
            setError(event.error);
            setIsListening(false);
          };
        }
      } catch (err) {
        console.error('Speech recognition setup failed:', err);
        setError('Speech recognition not supported');
        setIsSupported(false);
      }
    };

    setupSpeechRecognition();
  }, []);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (err) {
        console.error('Failed to start voice recognition:', err);
        setError('Failed to start voice recognition');
      }
    }
  }, [recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (err) {
        console.error('Failed to stop voice recognition:', err);
      }
    }
  }, [recognition, isListening]);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    error
  };
}
