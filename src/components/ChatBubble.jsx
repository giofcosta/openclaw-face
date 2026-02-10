import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * ChatBubble - Speech bubble with typing animation
 */
export function ChatBubble({ message, visible, theme, typingSpeed = 30 }) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const containerRef = useRef(null);
  const targetTextRef = useRef('');
  const typingIntervalRef = useRef(null);

  // Truncate message for display
  const truncatedMessage = useMemo(() => {
    if (!message) return '';
    return message.length > 300 
      ? '...' + message.slice(-300) 
      : message;
  }, [message]);

  // Cursor blink effect
  useEffect(() => {
    if (!isTyping) {
      const blinkInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(blinkInterval);
    } else {
      setShowCursor(true);
    }
  }, [isTyping]);

  // Typing animation
  useEffect(() => {
    if (truncatedMessage && truncatedMessage !== targetTextRef.current) {
      targetTextRef.current = truncatedMessage;
      setDisplayText('');
      setIsTyping(true);
      
      let charIndex = 0;
      
      // Clear previous interval
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      
      typingIntervalRef.current = setInterval(() => {
        if (charIndex < truncatedMessage.length) {
          setDisplayText(truncatedMessage.slice(0, charIndex + 1));
          charIndex++;
        } else {
          setIsTyping(false);
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
          }
        }
      }, typingSpeed);
      
      return () => {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
      };
    } else if (!truncatedMessage) {
      setDisplayText('');
      setIsTyping(false);
    }
  }, [truncatedMessage, typingSpeed]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <div 
      className="absolute bottom-20 left-0 right-0 px-4 sm:px-8 flex justify-center animate-fade-in"
      style={{ color: theme?.text || '#f8fafc' }}
    >
      <div 
        ref={containerRef}
        className="relative bg-black/50 backdrop-blur-md rounded-2xl px-6 py-4 max-h-40 overflow-y-auto w-full max-w-2xl shadow-2xl transition-all duration-300"
        style={{ 
          borderColor: theme?.primary || '#3b82f6',
          borderWidth: '2px',
          boxShadow: `0 0 30px ${theme?.primary || '#3b82f6'}30`,
        }}
      >
        {/* Speech bubble tail */}
        <div 
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-black/50"
          style={{ 
            borderColor: theme?.primary || '#3b82f6',
            borderWidth: '0 2px 2px 0',
          }}
        />
        
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-mono">
          {displayText}
          {/* Typing cursor */}
          <span 
            className={`inline-block w-2 h-4 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundColor: theme?.accent || '#fbbf24' }}
          />
        </p>
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="absolute top-2 right-4 flex gap-1">
            <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: theme?.accent || '#fbbf24', animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: theme?.accent || '#fbbf24', animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: theme?.accent || '#fbbf24', animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatBubble;
