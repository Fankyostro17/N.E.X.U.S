import { useState, useEffect, useCallback } from 'react';
import { initializeFaceAPI, startFaceDetection, stopFaceDetection } from '@/lib/faceapi';

export interface FaceRecognitionHook {
  isActive: boolean;
  isSupported: boolean;
  startRecognition: () => void;
  stopRecognition: () => void;
  error: string | null;
}

export function useFaceRecognition(): FaceRecognitionHook {
  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupFaceRecognition = async () => {
      try {
        const success = await initializeFaceAPI();
        setIsSupported(success);
        
        if (!success) {
          setError('Face recognition not supported');
        }
      } catch (err) {
        console.error('Face recognition setup failed:', err);
        setError('Face recognition initialization failed');
        setIsSupported(false);
      }
    };

    setupFaceRecognition();
  }, []);

  const startRecognition = useCallback(async () => {
    if (!isSupported || isActive) return;
    
    try {
      const success = await startFaceDetection();
      if (success) {
        setIsActive(true);
        setError(null);
      } else {
        setError('Failed to start face detection');
      }
    } catch (err) {
      console.error('Failed to start face recognition:', err);
      setError('Failed to start face recognition');
    }
  }, [isSupported, isActive]);

  const stopRecognition = useCallback(async () => {
    if (!isActive) return;
    
    try {
      await stopFaceDetection();
      setIsActive(false);
    } catch (err) {
      console.error('Failed to stop face recognition:', err);
    }
  }, [isActive]);

  return {
    isActive,
    isSupported,
    startRecognition,
    stopRecognition,
    error
  };
}
