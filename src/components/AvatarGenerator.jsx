import { useState } from 'react';
import { generateKratosAvatar, DEFAULT_PROMPTS } from '../lib/avatarGenerator';

export function AvatarGenerator({ onAvatarGenerated, theme }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('kratos');

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateKratosAvatar(selectedStyle, {
        width: 512,
        height: 512,
      });

      if (result.success) {
        setPreviewUrl(result.url);
        onAvatarGenerated?.(result);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = `kratos-avatar-${selectedStyle}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div 
      className="p-6 rounded-2xl bg-black/40 backdrop-blur-sm"
      style={{ borderColor: theme?.primary || '#3b82f6', borderWidth: '1px' }}
    >
      <h3 className="text-xl font-bold mb-4" style={{ color: theme?.text || '#fff' }}>
        ⚡ Generate Avatar
      </h3>

      {/* Style selector */}
      <div className="mb-4">
        <label className="block text-sm opacity-70 mb-2" style={{ color: theme?.text || '#fff' }}>
          Style
        </label>
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
        >
          <option value="kratos">Kratos (Default)</option>
          <option value="kratosMinimal">Minimal</option>
          <option value="kratosCyberpunk">Cyberpunk</option>
          <option value="kratosAbstract">Abstract</option>
        </select>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
        style={{ 
          background: theme?.primary || '#3b82f6',
          color: '#fff',
        }}
      >
        {loading ? 'Generating...' : 'Generate Avatar'}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded bg-red-500/20 text-red-400 text-sm">
          Error: {error}
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div className="mt-6">
          <p className="text-sm opacity-70 mb-2" style={{ color: theme?.text || '#fff' }}>
            Preview:
          </p>
          <img
            src={previewUrl}
            alt="Generated Kratos Avatar"
            className="w-full max-w-sm mx-auto rounded-lg"
            style={{ boxShadow: `0 0 20px ${theme?.glow || 'rgba(59,130,246,0.5)'}` }}
          />
          <button
            onClick={handleDownload}
            className="mt-4 w-full py-2 px-4 rounded-lg font-medium"
            style={{ 
              background: theme?.accent || '#fbbf24',
              color: '#000',
            }}
          >
            Download Avatar
          </button>
        </div>
      )}

      <p className="mt-4 text-xs opacity-50 text-center" style={{ color: theme?.text || '#fff' }}>
        Powered by Pollinations.ai (Free)
      </p>
    </div>
  );
}
