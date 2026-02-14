import { useState, useEffect, useRef } from 'react';
import { buttonVariants, cn } from '../lib/utils';

/**
 * ChatPanel - Collapsible live chat sidebar
 * Syncs with Telegram via WebSocket
 */
export function ChatPanel({ 
  isOpen, 
  onToggle, 
  messages = [], 
  onSend, 
  isTyping = false,
  isListening = false,
  theme 
}) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSend?.(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* Toggle Button - positioned in bottom right to avoid UI conflicts */}
      <button
        onClick={onToggle}
        className={cn(
          'fixed right-4 bottom-20 z-40 p-3 rounded-full shadow-lg transition-all duration-300',
          'hover:scale-110 active:scale-95',
          isOpen ? 'bg-white/10' : 'bg-primary'
        )}
        style={{ 
          backgroundColor: isOpen ? 'rgba(255,255,255,0.1)' : (theme?.primary || '#3b82f6'),
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <svg 
          className="w-6 h-6 text-white transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          )}
        </svg>
        {/* Unread indicator */}
        {!isOpen && messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full z-40 transition-all duration-300 ease-in-out',
          'flex flex-col bg-black/90 backdrop-blur-xl border-l border-white/10',
          isOpen ? 'w-80 translate-x-0' : 'w-80 translate-x-full'
        )}
      >
        {/* Header */}
        <div 
          className="flex items-center gap-3 px-4 py-3 border-b border-white/10"
          style={{ backgroundColor: `${theme?.primary || '#3b82f6'}20` }}
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme?.primary || '#3b82f6' }}
          >
            ⚡
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">Kratos</h3>
            <p className="text-white/50 text-xs">
              {isListening ? 'Listening...' : isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
          {/* Listening indicator */}
          {isListening && (
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <span 
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-white/30 py-8">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start a conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                  msg.isBot 
                    ? 'bg-white/10 text-white rounded-tl-sm' 
                    : 'bg-primary text-white ml-auto rounded-tr-sm'
                )}
                style={{ 
                  backgroundColor: msg.isBot ? 'rgba(255,255,255,0.1)' : (theme?.primary || '#3b82f6'),
                }}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                <p className="text-[10px] opacity-50 mt-1">
                  {msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))
          )}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[60%]">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span 
                    key={i}
                    className="w-2 h-2 rounded-full bg-white/50 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-white/10 text-white placeholder-white/30 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              style={{ '--tw-ring-color': `${theme?.primary || '#3b82f6'}50` }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className={cn(
                'p-2 rounded-full transition-all',
                inputValue.trim() 
                  ? 'bg-primary hover:opacity-90' 
                  : 'bg-white/10 cursor-not-allowed'
              )}
              style={{ 
                backgroundColor: inputValue.trim() ? (theme?.primary || '#3b82f6') : undefined 
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}

export default ChatPanel;
