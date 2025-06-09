
import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { GEMINI_MODEL_NAME, SYSTEM_INSTRUCTION } from '../constants';

let genAI: GoogleGenAI | null = null;
let chat: Chat | null = null;

const getGenAI = (): GoogleGenAI => {
  if (!genAI) {
    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set.");
      throw new Error("API_KEY environment variable not set.");
    }
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return genAI;
};

export const initializeChat = (): Chat => {
  if (!chat) {
    const aiInstance = getGenAI();
    chat = aiInstance.chats.create({
      model: GEMINI_MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
       // history: [] // Optionally, pass initial history if needed. For now, it starts fresh.
    });
  }
  return chat;
};


export const sendMessageToGeminiStream = async (
  messageText: string,
  currentHistory: Content[] // Although passed, Chat object manages its own history internally
): Promise<AsyncIterable<GenerateContentResponse>> => {
  try {
    const aiInstance = getGenAI();
    // For stateless stream, use generateContentStream with full history
    // This example uses a stateful chat object, so we use sendMessageStream
    
    // If using a stateful chat object (created with ai.chats.create)
    // const chatSession = initializeChat(); // Ensure chat is initialized
    // return chatSession.sendMessageStream({ message: messageText });

    // For a stateless approach that's more robust with history management from App.tsx:
    // Re-create a temporary chat session for each message, feeding it the current history.
    // This avoids issues with the shared `chat` object's internal history if we want App.tsx to be the sole source of truth for display.
    // However, the prompt implies using the stateful `Chat` object. Let's stick to that.
    
    const chatSession = initializeChat(); 
    
    // The Gemini SDK's `Chat` object automatically manages history.
    // We don't need to pass `currentHistory` to `sendMessageStream` itself.
    // The `chatSession` object keeps track of it.

    // Not using currentHistory parameter directly here as Chat object handles it.
    // If a truly stateless approach was desired, you'd use ai.models.generateContentStream 
    // and pass the history in the `contents` field.
    return chatSession.sendMessageStream({ message: messageText });

  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error; // Re-throw to be handled by the caller
  }
};