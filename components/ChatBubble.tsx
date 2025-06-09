
import React from 'react';
import { ChatMessage } from '../types';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isError = message.sender === 'system_error';

  const bubbleAlignment = isUser ? 'justify-end' : 'justify-start';
  const bubbleColor = isUser 
    ? 'bg-blue-600 text-white' 
    : isError 
    ? 'bg-red-700 text-white' 
    : 'bg-neutral-800 text-neutral-200';
  
  const IconComponent = isUser ? UserIcon : BotIcon; // Renamed to avoid conflict

  // Basic markdown link formatting: [text](url) -> <a href="url">text</a>
  // This is a very simplified parser. For robust markdown, a library would be better.
  const formatText = (text: string): React.ReactNode => {
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <a 
          key={match.index} 
          href={match[2]} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-400 hover:underline"
        >
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    // Handle newlines
    return parts.map((part, index) => 
      typeof part === 'string' 
        ? part.split('\n').map((line, i) => (
            <React.Fragment key={`${index}-${i}`}>
              {line}
              {i < part.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))
        : part
    );
  };

  return (
    <div className={`flex ${bubbleAlignment} mb-4`}>
      <div className={`flex items-start max-w-xs md:max-w-md lg:max-w-lg ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isError && (
          <div className={`flex-shrink-0 p-2 rounded-full ${isUser ? 'ml-2 bg-blue-600' : 'mr-2 bg-neutral-700'}`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
        )}
        <div className={`px-4 py-3 rounded-xl shadow-md ${bubbleColor} ${isUser ? 'rounded-br-none' : 'rounded-bl-none'}`}>
          <p className="text-sm whitespace-pre-wrap">{formatText(message.text)}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;