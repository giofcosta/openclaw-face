import { useState } from 'react';
import { THEME_PRESETS, getThemeKeys } from '../lib/themePresets';

/**
 * ThemeSelector - Quick theme picker
 */
export function ThemeSelector({ currentTheme, onThemeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const themes = getThemeKeys();
  const current = THEME_PRESETS[currentTheme] || THEME_PRESETS.default;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-full text-sm flex items-center gap-2 transition-all hover:scale-105"
        style={{
          background: `${current.primary}20`,
          color: current.text,
          border: `1px solid ${current.primary}40`,
        }}
      >
        <span>{current.emoji}</span>
        <span className="hidden sm:inline">{current.name}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            className="absolute right-0 mt-2 p-2 rounded-xl shadow-2xl z-50 min-w-[180px]"
            style={{
              background: current.background,
              border: `1px solid ${current.primary}30`,
            }}
          >
            <div className="text-xs opacity-50 px-2 py-1 mb-1" style={{ color: current.text }}>
              Choose Theme
            </div>
            <div className="grid gap-1">
              {themes.map((key) => {
                const theme = THEME_PRESETS[key];
                const isActive = key === currentTheme;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onThemeChange(key);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left"
                    style={{
                      background: isActive ? `${theme.primary}30` : 'transparent',
                      color: theme.text,
                      border: isActive ? `1px solid ${theme.primary}50` : '1px solid transparent',
                    }}
                  >
                    <span className="text-lg">{theme.emoji}</span>
                    <span className="flex-1 text-sm">{theme.name}</span>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ background: theme.primary }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ThemeSelector;
