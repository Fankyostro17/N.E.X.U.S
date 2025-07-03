import type { Express, Request } from "express";
import { createServer, type Server } from "http";

// Extend Express Request to include session
declare module 'express-serve-static-core' {
  interface Request {
    session: {
      userId?: number;
      isCreator?: boolean;
    };
  }
}
import { storage } from "./storage";
import { generateNexusResponse, transcribeAudio } from "./services/openai";
import { authenticateByVoice, authenticateByFace, authenticateCombined, enrollBiometric } from "./services/biometric";
import { executeSystemCommand, parseVoiceCommand } from "./services/voice";
import { insertConversationSchema, insertBiometricProfileSchema, insertSystemCommandSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Mock authentication endpoint (for development)
  app.post("/api/auth/biometric", async (req, res) => {
    try {
      const { audioData, faceData, method } = req.body;
      
      // For development, create a mock creator user
      const mockUser = {
        id: 1,
        username: "creator",
        fullName: "N.E.X.U.S. Creator",
        isCreator: true
      };
      
      // Simulate successful authentication
      res.json({
        success: true,
        user: mockUser,
        confidence: 0.95,
        method: method || 'voice'
      });
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ error: "Authentication service error" });
    }
  });
  
  // Enroll biometric data
  app.post("/api/biometric/enroll", async (req, res) => {
    try {
      const { userId, audioData, faceData } = req.body;
      
      const validation = insertBiometricProfileSchema.safeParse({ userId });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues });
      }
      
      const profile = await enrollBiometric(userId, audioData, faceData);
      res.json(profile);
    } catch (error) {
      console.error("Biometric enrollment error:", error);
      res.status(500).json({ error: "Enrollment failed" });
    }
  });
  
  // Voice transcription endpoint
  app.post("/api/voice/transcribe", async (req, res) => {
    try {
      const { audioData } = req.body;
      
      if (!audioData) {
        return res.status(400).json({ error: "Audio data required" });
      }
      
      const audioBuffer = Buffer.from(audioData, 'base64');
      const transcription = await transcribeAudio(audioBuffer);
      
      res.json({ transcription });
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({ error: "Transcription failed" });
    }
  });
  
  // N.E.X.U.S. conversation endpoint
  app.post("/api/nexus/conversation", async (req, res) => {
    try {
      const { message, isVoiceActivated } = req.body;
      
      // Mock user for development
      const mockUser = {
        id: 1,
        username: "creator",
        fullName: "N.E.X.U.S. Creator",
        isCreator: true
      };
      
      const userId = mockUser.id;
      const isCreator = mockUser.isCreator;
      
      // Mock conversation history for development
      const conversationHistory: Array<{ role: string; content: string }> = [];
      
      // Mock preferences
      const preferences = null;
      
      // Parse voice command
      const voiceCommand = parseVoiceCommand(message);
      
      let response;
      let systemCommandResult;
      
      if (voiceCommand.isSystemCommand && voiceCommand.command) {
        // Execute system command
        systemCommandResult = await executeSystemCommand(voiceCommand.command, isCreator);
        
        // Store system command
        await storage.createSystemCommand({
          userId,
          command: voiceCommand.command
        });
        
        if (systemCommandResult.success) {
          response = await generateNexusResponse(
            `System command executed: ${voiceCommand.command}\nResult: ${systemCommandResult.result}`,
            {
              isCreator,
              userName: mockUser.fullName || mockUser.username,
              conversationHistory,
              preferences: null
            }
          );
        } else {
          response = await generateNexusResponse(
            `System command failed: ${voiceCommand.command}\nError: ${systemCommandResult.error}`,
            {
              isCreator,
              userName: mockUser.fullName || mockUser.username,
              conversationHistory,
              preferences: null
            }
          );
        }
      } else {
        // Regular conversation
        response = await generateNexusResponse(message, {
          isCreator,
          userName: mockUser.fullName || mockUser.username,
          conversationHistory,
          preferences: null
        });
      }
      
      // Store conversation
      const validation = insertConversationSchema.safeParse({
        userId,
        message,
        response: response.response,
        isVoiceActivated,
        context: {
          emotion: response.emotion,
          action: response.action,
          systemCommand: voiceCommand.isSystemCommand,
          systemCommandResult
        }
      });
      
      if (validation.success) {
        await storage.createConversation(validation.data);
      }
      
      res.json({
        response: response.response,
        emotion: response.emotion,
        action: response.action,
        systemCommandResult
      });
    } catch (error) {
      console.error("Conversation error:", error);
      res.status(500).json({ error: "Conversation processing failed" });
    }
  });
  
  // System monitoring endpoint
  app.get("/api/system/monitor", async (req, res) => {
    try {
      // Mock system data for demonstration
      const cpuUsage = Math.random() * 100;
      const usedMemory = Math.floor(Math.random() * 8000) + 2000;
      const totalMemory = 16000;
      const uptime = "up 2 hours, 15 minutes";
      
      res.json({
        cpu: {
          usage: cpuUsage,
          status: cpuUsage < 50 ? 'good' : cpuUsage < 80 ? 'medium' : 'high'
        },
        memory: {
          used: usedMemory,
          total: totalMemory,
          usage: Math.round((usedMemory / totalMemory) * 100),
          status: (usedMemory / totalMemory) < 0.7 ? 'good' : (usedMemory / totalMemory) < 0.9 ? 'medium' : 'high'
        },
        uptime,
        network: {
          status: 'connected',
          quality: 'good'
        }
      });
    } catch (error) {
      console.error("System monitoring error:", error);
      res.status(500).json({ error: "System monitoring failed" });
    }
  });
  
  // Get conversation history (mock for development)
  app.get("/api/conversations", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });
  
  // Get user preferences (mock for development)
  app.get("/api/preferences", async (req, res) => {
    try {
      res.json({ preferences: {} });
    } catch (error) {
      console.error("Get preferences error:", error);
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });
  
  // Update user preferences (mock for development)
  app.post("/api/preferences", async (req, res) => {
    try {
      const { preferences } = req.body;
      res.json({ preferences });
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
