import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * useChat - Socket.IO-based chat hook for real-time messaging
 * Connects to OpenClaw Face Server bridge for secure communication
 */

// Configuration - can be overridden via environment variables
const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || 'http://localhost:18796';
const API_KEY = import.meta.env.VITE_BRIDGE_API_KEY || '';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const tokenRef = useRef(null);

  /**
   * Fetch JWT token from bridge server
   */
  const fetchToken = useCallback(async () => {
    if (!API_KEY) {
      console.warn('[Chat] No API key configured. Set VITE_BRIDGE_API_KEY env variable.');
      setError('No API key configured');
      return null;
    }

    try {
      console.log('[Chat] Fetching token from:', `${BRIDGE_URL}/auth/token`);
      const response = await fetch(`${BRIDGE_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: API_KEY }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('[Chat] Token received, expires in:', data.expiresIn);
      tokenRef.current = data.accessToken;
      setError(null);
      return data.accessToken;
    } catch (err) {
      console.error('[Chat] Failed to fetch token:', err);
      setError(`Authentication failed: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Connect to the bridge WebSocket server
   */
  const connect = useCallback(async () => {
    // Disconnect existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Get token first
    const token = await fetchToken();
    if (!token) {
      return;
    }

    console.log('[Chat] Connecting to:', `${BRIDGE_URL}/chat`);

    const socket = io(`${BRIDGE_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('[Chat] Connected to bridge server');
      setIsConnected(true);
      setError(null);
    });

    socket.on('connected', (data) => {
      console.log('[Chat] Server acknowledged connection:', data.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Chat] Disconnected:', reason);
      setIsConnected(false);
      
      // If token expired, try to reconnect with new token
      if (reason === 'io server disconnect') {
        console.log('[Chat] Server disconnected us, attempting reconnect...');
        setTimeout(connect, 2000);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('[Chat] Connection error:', err.message);
      setIsConnected(false);
      setError(`Connection failed: ${err.message}`);
      
      // If auth error, try to get new token
      if (err.message.includes('Authentication') || err.message.includes('token')) {
        tokenRef.current = null;
      }
    });

    socket.on('error', (err) => {
      console.error('[Chat] Error:', err);
      setError(err.message || 'Unknown error');
    });

    socket.on('message', (data) => {
      console.log('[Chat] Message received:', data);
      setMessages((prev) => [
        ...prev,
        {
          id: data.id || Date.now(),
          text: data.text,
          isBot: data.isBot ?? data.from === 'bot',
          time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      // Bot finished typing
      if (data.isBot) {
        setIsTyping(false);
      }
    });

    socket.on('history', (data) => {
      console.log('[Chat] History received:', data.messages?.length || 0, 'messages');
      setMessages(
        data.messages?.map((msg) => ({
          id: msg.id,
          text: msg.text,
          isBot: msg.isBot ?? msg.from === 'bot',
          time: msg.time,
        })) || []
      );
    });

    socket.on('typing', (data) => {
      setIsTyping(data.isTyping ?? true);
    });

    socket.on('listening', (data) => {
      setIsListening(data.isListening ?? true);
    });

    socketRef.current = socket;
  }, [fetchToken]);

  /**
   * Send a message
   */
  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;

    const trimmedText = text.trim();

    // Add message locally immediately (optimistic update)
    const newMessage = {
      id: Date.now(),
      text: trimmedText,
      isBot: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMessage]);

    // Send via Socket.IO if connected
    if (socketRef.current?.connected) {
      socketRef.current.emit('message', { text: trimmedText });
      // Show typing indicator (bot is processing)
      setIsTyping(true);
    } else {
      console.warn('[Chat] Not connected, message queued locally');
      setError('Not connected to chat server');
    }
  }, []);

  /**
   * Request message history
   */
  const requestHistory = useCallback((limit = 50) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('history', { limit });
    }
  }, []);

  /**
   * Notify that user is typing
   */
  const notifyTyping = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing');
    }
  }, []);

  /**
   * Manually disconnect
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  /**
   * Manually reconnect
   */
  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  // Connect on mount
  useEffect(() => {
    // Only connect if API key is configured
    if (API_KEY) {
      connect();
    } else {
      console.warn('[Chat] Bridge API key not configured. Chat disabled.');
      console.warn('[Chat] Set VITE_BRIDGE_API_KEY and VITE_BRIDGE_URL in .env');
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [connect]);

  return {
    messages,
    isConnected,
    isTyping,
    isListening,
    error,
    sendMessage,
    requestHistory,
    notifyTyping,
    disconnect,
    reconnect,
  };
}

export default useChat;
