
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system_error';
  timestamp: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  // Other grounding chunk types can be added if needed
}