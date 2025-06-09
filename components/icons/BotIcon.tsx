
import React from 'react';

const BotIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <circle cx="8.5" cy="12.5" r="1.5"/>
    <circle cx="15.5" cy="12.5" r="1.5"/>
    <path d="M8 16h8c1.1 0 2-.9 2-2H6c0 1.1.9 2 2 2z"/>
  </svg>
);

export default BotIcon;