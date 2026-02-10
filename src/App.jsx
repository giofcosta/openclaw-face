import { useState, useEffect, useMemo } from 'react';
import { Face } from './components/Face';
import { StatusBar } from './components/StatusBar';
import { ChatBubble } from './components/ChatBubble';
import { AvatarGenerator, loadSavedAvatar } from './components/AvatarGenerator';
import { ThemeSelector } from './components/ThemeSelector';
import { Confetti } from './components/Confetti';
import { AudioVisualizer } from './components/AudioVisualizer';
import { useGateway } from './hooks/useGateway';
import { useCelebration } from './hooks/useCelebration';
import { useAudioReactive } from './hooks/useAudioReactive';
import { getTheme, loadThemePreference, saveThemePreference } from './lib/themePresets';

function App() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAvatarGenerator, setShowAvatarGenerator] = useState(false);
  const [customAvatar, setCustomAvatar] = useState(() => loadSavedAvatar());
  const [themeKey, setThemeKey] = useState(() => loadThemePreference());

  // Get active theme (preset or from config)
  const activeTheme = useMemo(() => {
    const preset = getTheme(themeKey);
    // Merge with any config overrides
    return { ...preset, ...config?.theme };
  }, [themeKey, config?.theme]);

  // Handle theme change
  const handleThemeChange = (key) => {
    setThemeKey(key);
    saveThemePreference(key);
    // Apply to document
    const theme = getTheme(key);
    document.body.style.background = theme.background;
  };

  // Load config on mount based on environment
  useEffect(() => {
    const env = import.meta.env.VITE_ENV || 'production';
    const configFile = env === 'staging' ? '/config.staging.json' : '/config.production.json';
    
    fetch(configFile)
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        // Apply initial theme from preset
        const savedTheme = loadThemePreference();
        const theme = getTheme(savedTheme);
        const root = document.documentElement;
        root.style.setProperty('--face-primary', theme.primary);
        root.style.setProperty('--face-accent', theme.accent);
        root.style.setProperty('--face-bg', theme.background);
        document.body.style.background = theme.background;
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load config:', err);
        setError('Failed to load config.json');
        setLoading(false);
      });
  }, []);

  const { state, message, lastResponse, STATES } = useGateway(config);
  
  // Celebration effects
  const { shouldCelebrate, celebrate } = useCelebration(state, lastResponse);
  
  // Audio reactive mode
  const [audioReactiveEnabled, setAudioReactiveEnabled] = useState(false);
  const { audioLevel, isListening, toggleListening } = useAudioReactive(audioReactiveEnabled);

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
      style={{ background: activeTheme.background }}
    >
      {/* Celebration Confetti */}
      <Confetti trigger={shouldCelebrate} theme={activeTheme} />

      {/* Theme Selector - Top Right */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeSelector 
          currentTheme={themeKey} 
          onThemeChange={handleThemeChange} 
        />
      </div>

      {/* Status bar */}
      <StatusBar
        state={state}
        identity={config?.identity}
        message={message}
        visible={config?.face?.showStatus !== false}
        theme={activeTheme}
      />

      {/* Main face */}
      <div className="flex-1 flex items-center justify-center p-8 w-full relative">
        {/* Audio visualizer overlay */}
        <AudioVisualizer 
          audioLevel={audioLevel} 
          theme={activeTheme} 
          enabled={isListening}
        />
        <Face
          state={state}
          config={config}
          theme={activeTheme}
          customAvatar={customAvatar}
          audioLevel={audioLevel}
        />
      </div>

      {/* Chat bubble */}
      <ChatBubble
        message={lastResponse}
        visible={config?.face?.showBubble !== false && (state === STATES.SPEAKING || lastResponse)}
        theme={activeTheme}
      />

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 px-2 sm:px-4 flex items-center justify-between">
        {/* Left controls */}
        <div className="flex items-center gap-2">
          {/* Avatar Generator Toggle */}
          <button
            onClick={() => setShowAvatarGenerator(!showAvatarGenerator)}
            className="text-sm px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
            style={{ color: activeTheme.text }}
          >
            <span>⚡</span>
            <span>{showAvatarGenerator ? 'Back to Face' : 'Generate Avatar'}</span>
          </button>
          
          {/* Audio Reactive Toggle */}
          <button
            onClick={() => {
              setAudioReactiveEnabled(!audioReactiveEnabled);
              if (!audioReactiveEnabled) {
                toggleListening();
              }
            }}
            className={`text-sm px-3 py-2 rounded-full transition-colors flex items-center gap-2 ${
              isListening ? 'bg-green-500/30 hover:bg-green-500/40' : 'bg-white/10 hover:bg-white/20'
            }`}
            style={{ color: activeTheme.text }}
            title="Toggle audio reactive mode"
          >
            <span>{isListening ? '🎤' : '🔇'}</span>
          </button>
        </div>

        {/* Environment badge + Fullscreen hint */}
        <div className="flex items-center gap-4 text-xs" style={{ color: activeTheme.text }}>
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
        theme={activeTheme}
        hasCustomAvatar={!!customAvatar}
        onAvatarGenerated={(result) => {
          console.log('Avatar generated:', result);
          if (result?.useAsFace) {
            setCustomAvatar(result.url);
          }
        }}
        onResetToDefault={() => {
          setCustomAvatar(null);
        }}
      />
    </div>
  );
}

export default App;
