import { useState, useEffect, useRef, useCallback } from 'react';

const STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  IDLE: 'idle',
  THINKING: 'thinking',
  SPEAKING: 'speaking',
  LISTENING: 'listening',
  ERROR: 'error',
};

export function useGateway(config) {
  const [state, setState] = useState(STATES.DISCONNECTED);
  const [message, setMessage] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (!config?.gateway?.url) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const session = params.get('session') || config.gateway.session || 'main';
    const wsUrl = params.get('ws') || config.gateway.url;

    if (!token) {
      setState(STATES.ERROR);
      setMessage('Missing token. Add ?token=YOUR_TOKEN to URL');
      return;
    }

    setState(STATES.CONNECTING);
    setMessage('Connecting...');

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send connect message with auth
        ws.send(JSON.stringify({
          type: 'connect',
          token,
          session,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      };

      ws.onclose = () => {
        setState(STATES.DISCONNECTED);
        setMessage('Disconnected');
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(STATES.ERROR);
        setMessage('Connection error');
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      setState(STATES.ERROR);
      setMessage('Failed to connect');
    }
  }, [config]);

  const handleMessage = (data) => {
    switch (data.type) {
      case 'connected':
        setState(STATES.IDLE);
        setMessage('Connected');
        break;

      case 'chat.start':
      case 'thinking':
        setState(STATES.THINKING);
        setMessage('Thinking...');
        break;

      case 'chat.stream':
      case 'chat.delta':
        setState(STATES.SPEAKING);
        if (data.content || data.text) {
          setLastResponse(prev => prev + (data.content || data.text));
        }
        break;

      case 'chat.end':
      case 'chat':
        setState(STATES.IDLE);
        if (data.content || data.text) {
          setLastResponse(data.content || data.text);
        }
        setMessage('');
        break;

      case 'error':
        setState(STATES.ERROR);
        setMessage(data.message || 'Error');
        break;

      default:
        // Handle other message types
        break;
    }
  };

  const sendMessage = useCallback((text) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setState(STATES.LISTENING);
      wsRef.current.send(JSON.stringify({
        type: 'chat.send',
        content: text,
      }));
      setLastResponse('');
    }
  }, []);

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
    state,
    message,
    lastResponse,
    sendMessage,
    STATES,
  };
}

export { STATES };
