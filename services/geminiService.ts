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

// Helper to map internal Message type to Gemini Content type
const mapMessagesToGeminiHistory = (messages: Message[]): { role: string; parts: { text: string }[] }[] => {
  return messages
    .filter(m => !m.isSystem && !m.isStreaming) // Filter system/streaming messages
    .map(m => ({
      role: m.role === Role.USER ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
};

export const initializeChat = (modelId: ModelType = ModelType.FLASH, history: Message[] = []) => {
  // console.log("Initializing Gemini Chat with model:", modelId); // Reduce noise
  const genAI = getClient();

  // Re-initialize only if model changes or session doesn't exist
  // FORCE RE-INIT if history is provided and different? 
  // For simplicity: If history is provided, we assume we want a fresh start with this history.
  if (!chatSession || currentModel !== modelId || history.length > 0) {
    const model = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction: SYSTEM_INSTRUCTION
    });

    const geminiHistory = mapMessagesToGeminiHistory(history);

    chatSession = model.startChat({
      history: geminiHistory,
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
    // Pass history to initializeChat. 
    // Note: We normally pass exclude the CURRENT message from history because sendMessageStream sends it.
    // The 'history' arg here usually includes previous messages.
    const chat = initializeChat(modelId, history);

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
      Generate a comprehensive "Completion Report" in valid JSON format.
      
      The JSON object must exactly match this structure:
      {
        "summary": "A short, poetic one-line summary of the user's reading journey (Korean)",
        "emotionAnalysis": {
          "primary": "Primary emotion felt by user (string, e.g., 'Calm', 'Excited')",
          "intensity": 8, // Integer 1-10
          "keywords": ["keyword1", "keyword2", "keyword3"] // string array (Korean)
        },
        "readingHabits": {
          "sessionCount": ${messages.length}, 
          "avgDurationMinutes": 15
        },
        "growthAreas": ["area1", "area2"], // string array (Korean)
        "actionItems": ["action1", "action2", "action3"], // 3 specific, actionable suggestions for the user (Korean)
        "emotionTrajectory": [
          {"progress": 0, "score": 5},
          {"progress": 25, "score": 3},
          {"progress": 50, "score": 7},
          {"progress": 75, "score": 6},
          {"progress": 100, "score": 8}
        ], // Simulate an emotional arc (score 1-10) based on the conversation flow. 5 points min.
        "focusAreas": [
          {"label": "Theme A", "percentage": 40, "color": "#8FA88F"},
          {"label": "Theme B", "percentage": 30, "color": "#5C7C8A"},
          {"label": "Theme C", "percentage": 30, "color": "#E5D0A1"}
        ] // Top 3 themes discussed. Total percentage should be 100.
      }

      CRITICAL: Return ONLY the JSON object. No markdown formatting.
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
      summary: '분석을 완료하지 못했습니다.',
      emotionAnalysis: { primary: '알 수 없음', intensity: 0, keywords: [] },
      readingHabits: { sessionCount: 0, avgDurationMinutes: 0 },
      growthAreas: ['분석 정보가 부족합니다.'],
      actionItems: ['잠시 후 다시 시도해주세요.'],
      emotionTrajectory: [],
      focusAreas: []
    };
  }
};