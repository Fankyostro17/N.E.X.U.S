// Speech API integration for voice recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export async function initializeSpeechRecognition(): Promise<SpeechRecognition | null> {
  try {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    
    // Configure recognition settings
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US'; // Auto-detect user language
    recognition.maxAlternatives = 3; // Better alternatives for accuracy

    return recognition;
  } catch (error) {
    console.error('Failed to initialize speech recognition:', error);
    return null;
  }
}

export async function startVoiceRecognition(recognition: SpeechRecognition): Promise<void> {
  try {
    recognition.start();
  } catch (error) {
    console.error('Failed to start voice recognition:', error);
    throw error;
  }
}

export async function stopVoiceRecognition(recognition: SpeechRecognition): Promise<void> {
  try {
    recognition.stop();
  } catch (error) {
    console.error('Failed to stop voice recognition:', error);
    throw error;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export async function synthesizeSpeech(text: string, voice?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure speech settings
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Set voice if specified
      if (voice) {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => v.name.includes(voice));
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      speechSynthesis.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!window.speechSynthesis) {
    return [];
  }
  
  return speechSynthesis.getVoices();
}

export function isSpeechSynthesisSupported(): boolean {
  return !!window.speechSynthesis;
}

// Wake word detection
export class WakeWordDetector {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private onWakeWord: (transcript: string) => void;

  constructor(onWakeWord: (transcript: string) => void) {
    this.onWakeWord = onWakeWord;
  }

  async initialize(): Promise<boolean> {
    try {
      this.recognition = await initializeSpeechRecognition();
      
      if (!this.recognition) return false;

      this.recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.toLowerCase();
        
        if (transcript.includes('hey nexus') || 
            transcript.includes('hey n.e.x.u.s') ||
            transcript.includes('nexus activate')) {
          this.onWakeWord(transcript);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // Restart recognition for continuous wake word detection
          setTimeout(() => {
            if (this.recognition && this.isListening) {
              this.recognition.start();
            }
          }, 100);
        }
      };

      return true;
    } catch (error) {
      console.error('Wake word detector initialization failed:', error);
      return false;
    }
  }

  start(): void {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.start();
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }
}
