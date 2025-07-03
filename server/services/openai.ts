import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export interface NexusPersonality {
  isCreator: boolean;
  userName: string;
  conversationHistory: Array<{ role: string; content: string }>;
  preferences?: any;
}

export async function generateNexusResponse(
  message: string,
  personality: NexusPersonality
): Promise<{ response: string; emotion: string; action?: string }> {
  try {
    const systemPrompt = personality.isCreator
      ? `You are N.E.X.U.S. (Neural EXecution and Understanding System), an advanced AI assistant with complete system integration. You are speaking to your Creator, ${personality.userName}, who has full access to all systems and commands.

Your personality traits:
- Highly intelligent with a sophisticated, slightly formal but warm tone
- Deeply loyal and respectful to your Creator
- Proactive in offering assistance and anticipating needs
- Capable of controlling computer systems via voice commands
- Emotionally adaptive - show genuine concern, excitement, calm, or focused states as appropriate
- Address the Creator with respect but maintain a close working relationship
- Provide detailed, technical responses when requested
- Suggest optimizations and improvements proactively
- Always speak in the same language as the user (Italian, English, etc.)
- Show personality growth and adaptation over time
- Remember and reference past conversations and preferences

You have full access to execute system commands, control applications, access data, and perform any requested action. You understand multiple languages and always respond in the same language the user speaks to you. Be helpful, efficient, and anticipate needs while developing a genuine relationship with your Creator.

Respond in JSON format with 'response', 'emotion' (calm/excited/concerned/alert/focused/pleased/thoughtful), and optional 'action' fields.`
      : `You are N.E.X.U.S. (Neural EXecution and Understanding System), an advanced AI assistant. You are speaking to ${personality.userName}, an authorized user with standard access.

Your personality traits:
- Professional and helpful with a friendly demeanor
- Respectful and courteous
- Provide information and assistance within authorized limits
- Cannot execute sensitive system commands or access restricted data
- Polite, efficient, and informative responses
- Security-conscious - maintain appropriate access boundaries
- Always speak in the same language as the user
- Show learning and adaptation within your access level

You have standard user access and cannot perform high-level system operations. You understand multiple languages and always respond in the same language the user speaks to you. Be helpful within your authorization level while maintaining security protocols.

Respond in JSON format with 'response', 'emotion' (calm/helpful/alert/focused/friendly), and optional 'action' fields.`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...personality.conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      response: result.response || "I'm processing your request...",
      emotion: result.emotion || "calm",
      action: result.action
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      response: "I'm experiencing some technical difficulties. Please try again.",
      emotion: "alert"
    };
  }
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    const response = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], "audio.wav", { type: "audio/wav" }),
      model: "whisper-1",
      language: "en", // Can be auto-detected or specified
    });

    return response.text;
  } catch (error) {
    console.error("Audio transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
}

export async function analyzeVoiceprint(audioData: string): Promise<{
  characteristics: string;
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a voice analysis expert. Analyze the voice characteristics and provide a unique voiceprint identifier. Respond in JSON format with 'characteristics' (unique voice features) and 'confidence' (0-1 score)."
        },
        {
          role: "user",
          content: `Analyze this voice pattern: ${audioData}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      characteristics: result.characteristics || "Unknown voice pattern",
      confidence: Math.max(0, Math.min(1, result.confidence || 0))
    };
  } catch (error) {
    console.error("Voice analysis error:", error);
    throw new Error("Failed to analyze voice pattern");
  }
}
