import { storage } from "../storage";
import { analyzeVoiceprint } from "./openai";
import type { BiometricProfile, User } from "@shared/schema";

export interface BiometricAuthResult {
  success: boolean;
  user?: User;
  confidence: number;
  method: 'voice' | 'face' | 'combined';
  isCreator: boolean;
}

export interface VoiceAnalysisResult {
  voiceprint: string;
  confidence: number;
}

export interface FaceAnalysisResult {
  faceEncoding: string;
  confidence: number;
}

export async function authenticateByVoice(
  audioData: string
): Promise<BiometricAuthResult> {
  try {
    // Analyze the voice characteristics
    const voiceAnalysis = await analyzeVoiceprint(audioData);
    
    // Get all biometric profiles
    const profiles = await storage.getAllBiometricProfiles();
    
    let bestMatch: { profile: BiometricProfile; similarity: number } | null = null;
    
    // Compare against stored voiceprints
    for (const profile of profiles) {
      if (profile.voiceprint) {
        const similarity = calculateVoiceSimilarity(
          voiceAnalysis.characteristics,
          profile.voiceprint
        );
        
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { profile, similarity };
        }
      }
    }
    
    if (bestMatch && bestMatch.similarity > 0.7) {
      const user = await storage.getUser(bestMatch.profile.userId);
      
      return {
        success: true,
        user,
        confidence: bestMatch.similarity,
        method: 'voice',
        isCreator: user?.isCreator || false
      };
    }
    
    return {
      success: false,
      confidence: 0,
      method: 'voice',
      isCreator: false
    };
  } catch (error) {
    console.error("Voice authentication error:", error);
    return {
      success: false,
      confidence: 0,
      method: 'voice',
      isCreator: false
    };
  }
}

export async function authenticateByFace(
  faceData: string
): Promise<BiometricAuthResult> {
  try {
    // Get all biometric profiles
    const profiles = await storage.getAllBiometricProfiles();
    
    let bestMatch: { profile: BiometricProfile; similarity: number } | null = null;
    
    // Compare against stored face encodings
    for (const profile of profiles) {
      if (profile.faceEncoding) {
        const similarity = calculateFaceSimilarity(
          faceData,
          profile.faceEncoding
        );
        
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { profile, similarity };
        }
      }
    }
    
    if (bestMatch && bestMatch.similarity > 0.8) {
      const user = await storage.getUser(bestMatch.profile.userId);
      
      return {
        success: true,
        user,
        confidence: bestMatch.similarity,
        method: 'face',
        isCreator: user?.isCreator || false
      };
    }
    
    return {
      success: false,
      confidence: 0,
      method: 'face',
      isCreator: false
    };
  } catch (error) {
    console.error("Face authentication error:", error);
    return {
      success: false,
      confidence: 0,
      method: 'face',
      isCreator: false
    };
  }
}

export async function authenticateCombined(
  audioData: string,
  faceData: string
): Promise<BiometricAuthResult> {
  try {
    const voiceAuth = await authenticateByVoice(audioData);
    const faceAuth = await authenticateByFace(faceData);
    
    // Both must succeed for combined authentication
    if (voiceAuth.success && faceAuth.success && 
        voiceAuth.user?.id === faceAuth.user?.id) {
      
      const combinedConfidence = (voiceAuth.confidence + faceAuth.confidence) / 2;
      
      return {
        success: true,
        user: voiceAuth.user,
        confidence: combinedConfidence,
        method: 'combined',
        isCreator: voiceAuth.isCreator
      };
    }
    
    return {
      success: false,
      confidence: 0,
      method: 'combined',
      isCreator: false
    };
  } catch (error) {
    console.error("Combined authentication error:", error);
    return {
      success: false,
      confidence: 0,
      method: 'combined',
      isCreator: false
    };
  }
}

export async function enrollBiometric(
  userId: number,
  audioData?: string,
  faceData?: string
): Promise<BiometricProfile> {
  let voiceprint = "";
  let faceEncoding = "";
  
  if (audioData) {
    const voiceAnalysis = await analyzeVoiceprint(audioData);
    voiceprint = voiceAnalysis.characteristics;
  }
  
  if (faceData) {
    faceEncoding = faceData;
  }
  
  return await storage.createBiometricProfile({
    userId,
    voiceprint,
    faceEncoding
  });
}

// Helper functions for similarity calculation
function calculateVoiceSimilarity(voiceprint1: string, voiceprint2: string): number {
  // Simple similarity calculation - in production use more sophisticated algorithms
  const words1 = voiceprint1.toLowerCase().split(/\s+/);
  const words2 = voiceprint2.toLowerCase().split(/\s+/);
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  return intersection.length / union.length;
}

function calculateFaceSimilarity(encoding1: string, encoding2: string): number {
  // Simple similarity calculation - in production use face recognition libraries
  try {
    const data1 = JSON.parse(encoding1);
    const data2 = JSON.parse(encoding2);
    
    if (Array.isArray(data1) && Array.isArray(data2) && data1.length === data2.length) {
      let sum = 0;
      for (let i = 0; i < data1.length; i++) {
        sum += Math.abs(data1[i] - data2[i]);
      }
      return Math.max(0, 1 - (sum / data1.length));
    }
  } catch (error) {
    console.error("Face similarity calculation error:", error);
  }
  
  return 0;
}
