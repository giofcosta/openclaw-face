import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useChat - WebSocket-based chat hook for real-time messaging
 * Connects to OpenClaw gateway for Telegram sync
 */
export function useChat(gatewayUrl = null) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Determine WebSocket URL
  const getWsUrl = useCallback(() => {
    if (gatewayUrl) return gatewayUrl;
    
    // Try to get from config or use default
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    
    // Default OpenClaw gateway port
    return `${protocol}//${host}:38191/ws/chat`;
  }, [gatewayUrl]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const url = getWsUrl();
    console.log('[Chat] Connecting to:', url);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Chat] Connected');
        setIsConnected(true);
        
        // Request message history
        ws.send(JSON.stringify({ type: 'history', limit: 50 }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (e) {
          console.error('[Chat] Failed to parse message:', e);
        }
      };

      ws.onclose = () => {
        console.log('[Chat] Disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = (error) => {
        console.error('[Chat] WebSocket error:', error);
      };
    } catch (error) {
      console.error('[Chat] Failed to connect:', error);
      // Retry connection
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, [getWsUrl]);

  // Handle incoming messages
  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'message':
        setMessages(prev => [...prev, {
          id: data.id || Date.now(),
          text: data.text,
          isBot: data.isBot ?? data.from === 'bot',
          time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
        // Bot finished typing
        if (data.isBot) {
          setIsTyping(false);
        }
        break;

      case 'history':
        setMessages(data.messages?.map(msg => ({
          id: msg.id,
          text: msg.text,
          isBot: msg.isBot ?? msg.from === 'bot',
          time: msg.time,
        })) || []);
        break;

      case 'typing':
        setIsTyping(data.isTyping ?? true);
        break;

      case 'listening':
        setIsListening(data.isListening ?? true);
        break;

      case 'state':
        // Bot state update (speaking, thinking, etc.)
        if (data.state === 'speaking') {
          setIsTyping(true);
        } else {
          setIsTyping(false);
        }
        break;

      default:
        console.log('[Chat] Unknown message type:', data.type);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;

    // Add message locally immediately
    const newMessage = {
      id: Date.now(),
      text: text.trim(),
      isBot: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMessage]);

    // Send via WebSocket if connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        text: text.trim(),
      }));
      
      // Show typing indicator (bot is processing)
      setIsTyping(true);
    } else {
      console.warn('[Chat] WebSocket not connected');
    }
  }, []);

  // Notify that user is typing
  const notifyTyping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'user_typing' }));
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    messages,
    isConnected,
    isTyping,
    isListening,
    sendMessage,
    notifyTyping,
  };
}

export default useChat;
