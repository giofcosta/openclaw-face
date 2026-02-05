import { useState, useEffect } from 'react';
import { generateKratosAvatar, DEFAULT_PROMPTS } from '../lib/avatarGenerator';
import { buttonVariants, cn } from '../lib/utils';
import { Toast, useToast } from './Toast';

const STORAGE_KEY = 'kratos-custom-avatar';

const styles = [
  {
    id: 'kratos',
    name: 'Kratos',
    icon: '⚡',
    description: 'Classic blue & gold lightning theme',
    gradient: 'from-blue-500 to-amber-500',
  },
  {
    id: 'kratosMinimal',
    name: 'Minimal',
    icon: '◆',
    description: 'Clean geometric design',
    gradient: 'from-slate-400 to-slate-600',
  },
  {
    id: 'kratosCyberpunk',
    name: 'Cyberpunk',
    icon: '⚡',
    description: 'Neon futuristic aesthetic',
    gradient: 'from-cyan-500 to-pink-500',
  },
  {
    id: 'kratosAbstract',
    name: 'Abstract',
    icon: '◈',
    description: 'Artistic interpretation',
    gradient: 'from-violet-500 to-orange-500',
  },
];

export function AvatarGenerator({ isOpen, onClose, theme, onAvatarGenerated, onResetToDefault, hasCustomAvatar }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('kratos');
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('generate');
  const { toast, showToast, hideToast } = useToast();

  const handleResetToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    onResetToDefault?.();
    showToast('Switched to CSS face!', 'success');
  };

  useEffect(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}-history`);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-history`, JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPreviewUrl(null);
    setImageLoading(true);
    setImageError(false);

    try {
      const result = await generateKratosAvatar(selectedStyle, {
        width: 512,
        height: 512,
      });

      if (result.success) {
        setPreviewUrl(result.url);
        const newItem = {
          url: result.url,
          style: selectedStyle,
          date: Date.now(),
          id: Date.now(),
        };
        setHistory((prev) => [newItem, ...prev].slice(0, 12));
      } else {
        setError(result.error);
        setImageLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setImageLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUse = (url) => {
    localStorage.setItem(STORAGE_KEY, url);
    onAvatarGenerated?.({ url, useAsFace: true });
    showToast('Avatar set successfully!', 'success');
  };

  const handleDownload = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `kratos-avatar-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div
        className="w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{
          background: theme?.background || '#0f172a',
          border: `1px solid ${theme?.primary || '#3b82f6'}30`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${theme?.primary || '#3b82f6'}20` }}
            >
              ⚡
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Avatar Studio</h2>
              <p className="text-sm text-white/50">Generate your Kratos avatar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasCustomAvatar && (
              <button
                onClick={handleResetToDefault}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-white/70 hover:text-white')}
              >
                Use CSS Face
              </button>
            )}
            <button
              onClick={onClose}
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'text-white/70 hover:text-white')}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 sm:px-6 lg:px-8 border-b border-white/10">
          {['generate', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-3 text-sm font-medium capitalize transition-colors relative',
                activeTab === tab ? 'text-white' : 'text-white/50 hover:text-white/80'
              )}
            >
              {tab}
              {tab === 'history' && history.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/10">
                  {history.length}
                </span>
              )}
              {activeTab === tab && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: theme?.primary || '#3b82f6' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'generate' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Style Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Choose Style
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={cn(
                        'relative p-5 rounded-xl border-2 text-left transition-all group',
                        selectedStyle === style.id
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      )}
                      style={{
                        borderColor: selectedStyle === style.id ? theme?.primary : undefined,
                      }}
                    >
                      <div
                        className={cn(
                          'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br',
                          style.gradient
                        )}
                      />
                      <div className="relative flex items-start gap-3">
                        <span className="text-2xl">{style.icon}</span>
                        <div>
                          <div className="font-semibold text-white">{style.name}</div>
                          <div className="text-sm text-white/50">{style.description}</div>
                        </div>
                      </div>
                      {selectedStyle === style.id && (
                        <div
                          className="absolute top-2 right-2 w-2 h-2 rounded-full"
                          style={{ background: theme?.primary }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'w-full sm:w-auto sm:min-w-[200px] mt-4',
                    loading && 'opacity-70 cursor-not-allowed'
                  )}
                  style={{ background: theme?.primary }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>⚡ Generate Avatar</>
                  )}
                </button>

                {error && (
                  <div className="p-5 rounded-lg bg-red-500/20 text-red-400 text-sm border border-red-500/30">
                    {error}
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
                  Preview
                </h3>
                <div className="flex-1 flex items-center justify-center min-h-[280px] sm:min-h-[300px] rounded-xl bg-white/5 border border-white/10 p-4 sm:p-6 lg:p-10">
                  {previewUrl ? (
                    <div className="w-full max-w-sm space-y-4">
                      <div
                        className="aspect-square rounded-2xl overflow-hidden ring-2 ring-offset-4 ring-offset-[#0f172a] relative"
                        style={{ ringColor: theme?.primary }}
                      >
                        {imageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                            <div className="animate-spin h-8 w-8 border-2 border-white/30 border-t-white rounded-full" />
                          </div>
                        )}
                        {imageError && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
                            <div className="text-center text-red-400 p-4">
                              <div className="text-3xl mb-2">⚠️</div>
                              <p className="text-sm">Failed to load image</p>
                            </div>
                          </div>
                        )}
                        <img
                          src={previewUrl}
                          alt="Generated"
                          className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                          onLoad={() => setImageLoading(false)}
                          onError={() => {
                            setImageLoading(false);
                            setImageError(true);
                            setError('Failed to load generated image. Please try again.');
                          }}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => handleUse(previewUrl)}
                          className={cn(buttonVariants(), 'sm:min-w-[140px]')}
                          style={{ background: theme?.primary }}
                        >
                          Use as Face
                        </button>
                        <button
                          onClick={() => handleDownload(previewUrl)}
                          className={cn(buttonVariants({ variant: 'outline' }), 'sm:min-w-[140px]')}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-white/30">
                      <div className="text-6xl mb-4">🎨</div>
                      <p>Select a style and generate</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {history.length === 0 ? (
                <div className="col-span-full text-center py-16 px-8 text-white/40">
                  <div className="text-5xl mb-4">📷</div>
                  <p>No avatars yet. Generate your first!</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all cursor-pointer"
                  >
                    <img
                      src={item.url}
                      alt="Avatar"
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      <button
                        onClick={() => handleUse(item.url)}
                        className={cn(buttonVariants({ size: 'sm' }), 'w-full text-xs')}
                        style={{ background: theme?.primary }}
                      >
                        Use
                      </button>
                      <button
                        onClick={() => handleDownload(item.url)}
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full text-xs')}
                      >
                        Download
                      </button>
                    </div>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="absolute top-1 right-1 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-t border-white/10 text-center text-xs text-white/40">
          Powered by Pollinations.ai • Free unlimited generation
        </div>
      </div>
    </div>
    
    {/* Toast notification */}
    {toast && (
      <Toast
        key={toast.key}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onClose={hideToast}
      />
    )}
    </>
  );
}

export function loadSavedAvatar() {
  return localStorage.getItem(STORAGE_KEY);
}
