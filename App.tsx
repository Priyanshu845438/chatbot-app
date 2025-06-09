
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from './types';
import { INITIAL_BOT_MESSAGE } from './constants';
import { initializeChat, sendMessageToGeminiStream } from './services/geminiService';
import ChatBubble from './components/ChatBubble';
import ChatInput from './components/ChatInput';
import LoadingDots from './components/LoadingDots';
import BotIcon from './components/icons/BotIcon'; // Added missing import
import { Content, Part } from '@google/genai';


const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_BOT_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Initialize chat session on component mount
  useEffect(() => {
    try {
      initializeChat();
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      setMessages(prev => [...prev, {
        id: 'init-error',
        text: "Error: Could not initialize AI assistant. Please ensure API key is configured correctly and refresh.",
        sender: 'system_error',
        timestamp: Date.now()
      }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const mapMessagesToGeminiHistory = (chatMessages: ChatMessage[]): Content[] => {
    return chatMessages.map(msg => {
      // Filter out system error messages from history sent to Gemini
      if (msg.sender === 'system_error') return null;
      // Filter out the initial bot message if you don't want it in context,
      // or handle it based on your desired chat flow. Here, we include it.
      return {
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text } as Part],
      };
    }).filter(content => content !== null) as Content[];
  };


  const handleSendMessage = useCallback(async (text: string) => {
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: Date.now(),
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setIsLoading(true);

    const botMessageId = `bot-${Date.now()}`;
    // Add a placeholder for the bot's response
    setMessages(prevMessages => [
      ...prevMessages,
      { id: botMessageId, text: '', sender: 'bot', timestamp: Date.now() },
    ]);
    
    try {
      // The Gemini Chat object internally manages history based on previous sendMessage calls.
      // So, we don't need to pass the full history each time here if using the stateful `Chat` object as intended.
      const stream = await sendMessageToGeminiStream(text, mapMessagesToGeminiHistory(messages));
      
      let fullResponse = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text; // Access text directly from chunk (GenerateContentResponse)
        if (chunkText) {
          fullResponse += chunkText;
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
            )
          );
        }
      }
      // If there were grounding chunks with search results, you might append them.
      // const lastResponse = await stream.response; // This is not how generateContentStream works
      // The final response details are usually part of the last chunk or need to be aggregated.
      // For groundingMetadata, it might be available on the fully aggregated response if the SDK provides it post-stream.
      // With `chat.sendMessageStream`, grounding metadata might be on `chunk.candidates[0].groundingMetadata`
      // For simplicity in this streaming example, we are not extracting grounding metadata separately.

    } catch (error) {
      console.error("Error during Gemini API call:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === botMessageId 
          ? { ...msg, text: `Error: ${errorMessage}. Please try again.`, sender: 'system_error' } 
          : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages]); // Include messages in dependency because mapMessagesToGeminiHistory uses it.
                   // Even if the Chat object manages its own history, this is safer if mapMessagesToGeminiHistory's role changes.


  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100">
      <header className="p-4 text-center border-b border-neutral-800 shadow-md">
        <h1 className="text-xl font-semibold tracking-wide">HealthPal AI</h1>
      </header>

      <div ref={chatAreaRef} className="flex-grow p-4 space-y-2 overflow-y-auto">
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {isLoading && messages[messages.length-1]?.sender !== 'user' && ( // Show loading only if bot is "typing"
           <div className="flex justify-start mb-4">
             <div className="flex items-start max-w-xs md:max-w-md lg:max-w-lg flex-row">
                <div className="flex-shrink-0 p-2 rounded-full mr-2 bg-neutral-700">
                    <BotIcon className="w-5 h-5 text-white" />
                </div>
                <div className="px-4 py-3 rounded-xl shadow-md bg-neutral-800 text-neutral-200 rounded-bl-none">
                    <LoadingDots />
                </div>
              </div>
           </div>
        )}
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
