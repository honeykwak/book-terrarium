import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { Message, Role, ModelType } from '../types';

let chatSession: Chat | null = null;
let currentModel: string | null = null;

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const initializeChat = (modelId: ModelType = ModelType.FLASH) => {
  const ai = getClient();

  // Re-initialize only if model changes or session doesn't exist
  if (!chatSession || currentModel !== modelId) {
    chatSession = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Slightly higher for creativity in literature
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

    const resultStream = await chat.sendMessageStream({
      message: text
    });

    let fullText = "";

    for await (const chunk of resultStream) {
      const chunkText = chunk.text;
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