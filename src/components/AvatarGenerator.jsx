import { useState, useEffect } from 'react';
import { generateKratosAvatar, DEFAULT_PROMPTS } from '../lib/avatarGenerator';

const STORAGE_KEY = 'kratos-custom-avatar';

export function AvatarGenerator({ 
  onAvatarGenerated, 
  theme,
  onClose,
  isOpen 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('kratos');
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'history'

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}-history`);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load avatar history:', e);
      }
    }
  }, []);

  // Save history when it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(`${STORAGE_KEY}-history`, JSON.stringify(history));
    }
  }, [history]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPreviewUrl(null);

    try {
      const result = await generateKratosAvatar(selectedStyle, {
        width: 512,
        height: 512,
      });

      if (result.success) {
        setPreviewUrl(result.url);
        // Add to history
        const newItem = {
          url: result.url,
          style: selectedStyle,
          prompt: DEFAULT_PROMPTS[selectedStyle],
          date: new Date().toISOString(),
          id: Date.now(),
        };
        setHistory(prev => [newItem, ...prev].slice(0, 10)); // Keep last 10
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseAvatar = (url) => {
    // Save as current avatar
    localStorage.setItem(STORAGE_KEY, url);
    onAvatarGenerated?.({ url, useAsFace: true });
    // Don't close - let user see the face change
  };

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `kratos-avatar-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const styleInfo = {
    kratos: { name: 'Kratos', icon: '⚡', desc: 'Classic blue & gold' },
    kratosMinimal: { name: 'Minimal', icon: '◆', desc: 'Clean geometric' },
    kratosCyberpunk: { name: 'Cyberpunk', icon: '⚡', desc: 'Neon & futuristic' },
    kratosAbstract: { name: 'Abstract', icon: '◈', desc: 'Artistic interpretation' },
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div 
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ 
          background: theme?.background || '#0f172a',
          border: `1px solid ${theme?.primary || '#3b82f6'}40`,
          boxShadow: `0 0 60px ${theme?.primary || '#3b82f6'}20`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="text-xl font-bold" style={{ color: theme?.text || '#fff' }}>
                Avatar Studio
              </h2>
              <p className="text-sm opacity-60" style={{ color: theme?.text || '#fff' }}>
                Generate and manage your Kratos avatars
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: theme?.text || '#fff' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === 'generate' ? 'border-b-2' : 'opacity-60'
            }`}
            style={{ 
              color: theme?.text || '#fff',
              borderColor: activeTab === 'generate' ? theme?.primary || '#3b82f6' : 'transparent',
            }}
          >
            Generate New
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === 'history' ? 'border-b-2' : 'opacity-60'
            }`}
            style={{ 
              color: theme?.text || '#fff',
              borderColor: activeTab === 'history' ? theme?.primary || '#3b82f6' : 'transparent',
            }}
          >
            History ({history.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'generate' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Style Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider opacity-60" style={{ color: theme?.text || '#fff' }}>
                  Choose Style
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(styleInfo).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedStyle(key)}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        selectedStyle === key 
                          ? 'border-2' 
                          : 'border-white/10 hover:border-white/20'
                      }`}
                      style={{
                        borderColor: selectedStyle === key ? theme?.primary || '#3b82f6' : undefined,
                        background: selectedStyle === key ? `${theme?.primary || '#3b82f6'}10` : 'transparent',
                      }}
                    >
                      <span className="text-2xl">{info.icon}</span>
                      <div>
                        <div className="font-semibold" style={{ color: theme?.text || '#fff' }}>
                          {info.name}
                        </div>
                        <div className="text-sm opacity-60" style={{ color: theme?.text || '#fff' }}>
                          {info.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ 
                    background: loading ? 'transparent' : `linear-gradient(135deg, ${theme?.primary || '#3b82f6'}, ${theme?.secondary || '#1e40af'})`,
                    color: '#fff',
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>⚡ Generate Avatar</>
                  )}
                </button>

                {error && (
                  <div className="p-4 rounded-lg bg-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Right: Preview */}
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                {previewUrl ? (
                  <div className="w-full space-y-4">
                    <div 
                      className="relative aspect-square rounded-2xl overflow-hidden"
                      style={{ boxShadow: `0 0 40px ${theme?.primary || '#3b82f6'}40` }}
                    >
                      <img
                        src={previewUrl}
                        alt="Generated Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUseAvatar(previewUrl)}
                        className="flex-1 py-3 px-4 rounded-lg font-semibold"
                        style={{ 
                          background: theme?.primary || '#3b82f6',
                          color: '#fff',
                        }}
                      >
                        Use as Face
                      </button>
                      <button
                        onClick={() => handleDownload(previewUrl)}
                        className="flex-1 py-3 px-4 rounded-lg font-semibold"
                        style={{ 
                          background: theme?.accent || '#fbbf24',
                          color: '#000',
                        }}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center opacity-40" style={{ color: theme?.text || '#fff' }}>
                    <svg className="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p>Select a style and click Generate</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* History Tab */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.length === 0 ? (
                <div className="col-span-full text-center py-12 opacity-40" style={{ color: theme?.text || '#fff' }}>
                  No avatars generated yet
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id}
                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-white/30 transition-all"
                    onClick={() => handleUseAvatar(item.url)}
                  >
                    <img
                      src={item.url}
                      alt="Avatar"
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUseAvatar(item.url); }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium"
                        style={{ background: theme?.primary || '#3b82f6', color: '#fff' }}
                      >
                        Use
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(item.url); }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium"
                        style={{ background: theme?.accent || '#fbbf24', color: '#000' }}
                      >
                        Download
                      </button>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-xs text-white/80 truncate">{styleInfo[item.style]?.name || item.style}</p>
                      <p className="text-xs text-white/50">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-xs opacity-50" style={{ color: theme?.text || '#fff' }}>
            Powered by Pollinations.ai • Free unlimited generation
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper to load saved avatar on app start
export function loadSavedAvatar() {
  return localStorage.getItem(STORAGE_KEY);
}
