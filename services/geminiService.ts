import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { Message, Role, ModelType } from '../types';

let chatSession: ChatSession | null = null;
let currentModel: string | null = null;

// Debugging utility
export const checkAvailableModels = async () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("=== AVAILABLE GEMINI MODELS ===");
    console.log(data);
    if (data.models) {
      data.models.forEach((m: any) => console.log(`- ${m.name}`));
    }
    return data;
  } catch (error) {
    console.error("Failed to list models:", error);
  }
};

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenerativeAI(apiKey);
};

export const initializeChat = (modelId: ModelType = ModelType.FLASH) => {
  console.log("Initializing Gemini Chat with model:", modelId);
  const genAI = getClient();

  // Re-initialize only if model changes or session doesn't exist
  if (!chatSession || currentModel !== modelId) {
    const model = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction: SYSTEM_INSTRUCTION
    });

    chatSession = model.startChat({
      generationConfig: {
        temperature: 0.7,
      },
    });
    currentModel = modelId;
  }
  return chatSession;
};

export const resetChat = () => {
  chatSession = null;
};

export const sendMessageStream = async (
  text: string,
  history: Message[],
  modelId: ModelType,
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    const chat = initializeChat(modelId);

    // In a real app, you might sync history here if the SDK required it manually,
    // but the stateful chat object handles context. 
    // If we wanted to restore history from DB, we would add history params to create().

    const resultStream = await chat.sendMessageStream(text);

    let fullText = "";

    for await (const chunk of resultStream.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullText += chunkText;
        onChunk(fullText);
      }
    }

    return fullText;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const generateReport = async (messages: Message[]): Promise<any> => {
  try {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: ModelType.FLASH,
      generationConfig: { responseMimeType: "application/json" }
    });

    const conversationText = messages
      .filter(m => !m.isSystem && m.role !== Role.MODEL) // Focus on user's input mainly, or full context? Full context is better for analysis.
      // Re-thinking: Analyzing the interaction quality requires both sides.
      .filter(m => !m.isSystem)
      .map(m => `${m.role === Role.USER ? 'User' : 'AI'}: ${m.content}`)
      .join('\n');

    const prompt = `
      Analyze the following conversation history between a user and an AI book reading companion.
      Generate a "Completion Report" in valid JSON format.
      
      The JSON object must exactly match this structure:
      {
        "emotionAnalysis": {
          "primary": "Primary emotion felt by user (string, e.g., 'Calm', 'Excited')",
          "intensity": 8, // Integer 1-10
          "keywords": ["keyword1", "keyword2", "keyword3"] // string array
        },
        "readingHabits": {
          "sessionCount": ${messages.length}, // Auto-filled hint
          "avgDurationMinutes": 0 // Estimate based on timestamps if possible, otherwise 0
        },
        "growthAreas": ["area1", "area2"] // string array, areas where user showed insight or growth
      }

      For 'readingHabits.avgDurationMinutes', estimate roughly or set to 15 if unknown.
      Translate all string values to Korean (한국어).

      Conversation:
      ${conversationText}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating report:", error);
    // Fallback if AI fails
    return {
      emotionAnalysis: { primary: '알 수 없음', intensity: 0, keywords: [] },
      readingHabits: { sessionCount: 0, avgDurationMinutes: 0 },
      growthAreas: ['분석에 실패했습니다.']
    };
  }
};