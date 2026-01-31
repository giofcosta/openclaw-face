import { useState, useEffect } from 'react';
import { Face } from './components/Face';
import { StatusBar } from './components/StatusBar';
import { ChatBubble } from './components/ChatBubble';
import { AvatarGenerator, loadSavedAvatar } from './components/AvatarGenerator';
import { useGateway } from './hooks/useGateway';

function App() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAvatarGenerator, setShowAvatarGenerator] = useState(false);
  const [customAvatar, setCustomAvatar] = useState(() => loadSavedAvatar());

  // Load config on mount based on environment
  useEffect(() => {
    const env = import.meta.env.VITE_ENV || 'production';
    const configFile = env === 'staging' ? '/config.staging.json' : '/config.production.json';
    
    fetch(configFile)
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
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden p-6 sm:p-8 lg:p-12"
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
          customAvatar={customAvatar}
        />
      </div>

      {/* Chat bubble */}
      <ChatBubble
        message={lastResponse}
        visible={config?.face?.showBubble !== false && (state === STATES.SPEAKING || lastResponse)}
        theme={config?.theme}
      />

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 px-2 sm:px-4 flex items-center justify-between">
        {/* Avatar Generator Toggle */}
        <button
          onClick={() => setShowAvatarGenerator(!showAvatarGenerator)}
          className="text-sm px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
          style={{ color: config?.theme?.text || '#fff' }}
        >
          <span>⚡</span>
          <span>{showAvatarGenerator ? 'Back to Face' : 'Generate Avatar'}</span>
        </button>

        {/* Environment badge + Fullscreen hint */}
        <div className="flex items-center gap-4 text-xs" style={{ color: config?.theme?.text || '#fff' }}>
          {config?.environment === 'staging' && (
            <span className="bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full font-medium">STAGING</span>
          )}
          <span className="opacity-40">Press F11 for fullscreen</span>
        </div>
      </div>

      {/* Avatar Generator Panel */}
      <AvatarGenerator
        isOpen={showAvatarGenerator}
        onClose={() => setShowAvatarGenerator(false)}
        theme={config?.theme}
        onAvatarGenerated={(result) => {
          console.log('Avatar generated:', result);
          if (result?.useAsFace) {
            setCustomAvatar(result.url);
          }
        }}
      />
    </div>
  );
}

export default App;
