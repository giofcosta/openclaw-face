import { useState, useEffect } from 'react';
import { Face } from './components/Face';
import { StatusBar } from './components/StatusBar';
import { ChatBubble } from './components/ChatBubble';
import { useGateway } from './hooks/useGateway';

function App() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load config on mount
  useEffect(() => {
    fetch('/config.json')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        // Apply theme CSS variables
        if (data.theme) {
          const root = document.documentElement;
          root.style.setProperty('--face-primary', data.theme.primary);
          root.style.setProperty('--face-secondary', data.theme.secondary);
          root.style.setProperty('--face-accent', data.theme.accent);
          root.style.setProperty('--face-bg', data.theme.background);
          root.style.setProperty('--face-glow', data.theme.glow);
          document.body.style.background = data.theme.background;
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load config:', err);
        setError('Failed to load config.json');
        setLoading(false);
      });
  }, []);

  const { state, message, lastResponse, STATES } = useGateway(config);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F11 or Escape to toggle fullscreen hints
      if (e.key === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: config?.theme?.background || '#0f172a' }}
    >
      {/* Status bar */}
      <StatusBar
        state={state}
        identity={config?.identity}
        message={message}
        visible={config?.face?.showStatus !== false}
        theme={config?.theme}
      />

      {/* Main face */}
      <div className="flex-1 flex items-center justify-center p-8 w-full">
        <Face
          state={state}
          config={config}
          theme={config?.theme}
        />
      </div>

      {/* Chat bubble */}
      <ChatBubble
        message={lastResponse}
        visible={config?.face?.showBubble !== false && (state === STATES.SPEAKING || lastResponse)}
        theme={config?.theme}
      />

      {/* Fullscreen hint */}
      <div className="absolute bottom-2 right-4 text-xs opacity-30" style={{ color: config?.theme?.text || '#fff' }}>
        Press F11 for fullscreen
      </div>
    </div>
  );
}

export default App;
