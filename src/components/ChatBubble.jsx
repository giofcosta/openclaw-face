import { useState, useEffect, useRef } from 'react';

export function ChatBubble({ message, visible, theme }) {
  const [displayText, setDisplayText] = useState('');
  const containerRef = useRef(null);

  // Truncate to last ~200 chars for display
  useEffect(() => {
    if (message) {
      const truncated = message.length > 200 
        ? '...' + message.slice(-200) 
        : message;
      setDisplayText(truncated);
    } else {
      setDisplayText('');
    }
  }, [message]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayText]);

  if (!visible || !displayText) return null;

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 px-2 sm:px-4 flex justify-center"
      style={{ color: theme?.text || '#f8fafc' }}
    >
      <div 
        ref={containerRef}
        className="bg-black/40 backdrop-blur-sm rounded-2xl px-6 py-4 max-h-32 overflow-y-auto w-full max-w-2xl"
        style={{ 
          borderColor: theme?.primary || '#3b82f6',
          borderWidth: '1px',
        }}
      >
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {displayText}
        </p>
      </div>
    </div>
  );
}
