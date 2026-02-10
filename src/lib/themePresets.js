/**
 * Theme Presets - One-click color schemes
 */

// Import background images
import cyberpunkBg from '../assets/backgrounds/cyberpunk.png';
import natureBg from '../assets/backgrounds/nature.png';
import minimalBg from '../assets/backgrounds/minimal.png';
import neonBg from '../assets/backgrounds/neon.png';
import oceanBg from '../assets/backgrounds/ocean.png';
import sunsetBg from '../assets/backgrounds/sunset.png';
import midnightBg from '../assets/backgrounds/midnight.png';

export const THEME_PRESETS = {
  default: {
    name: 'Default',
    emoji: '⚡',
    primary: '#3b82f6',
    accent: '#fbbf24',
    background: '#0f172a',
    text: '#f8fafc',
    backgroundImage: null, // No background image for default
  },
  cyberpunk: {
    name: 'Cyberpunk',
    emoji: '🌃',
    primary: '#f0abfc',
    accent: '#22d3ee',
    background: '#0c0a1d',
    text: '#f0abfc',
    backgroundImage: cyberpunkBg,
  },
  nature: {
    name: 'Nature',
    emoji: '🌿',
    primary: '#22c55e',
    accent: '#a3e635',
    background: '#14532d',
    text: '#dcfce7',
    backgroundImage: natureBg,
  },
  minimal: {
    name: 'Minimal',
    emoji: '⬜',
    primary: '#94a3b8',
    accent: '#ffffff',
    background: '#1e1e1e',
    text: '#e2e8f0',
    backgroundImage: minimalBg,
  },
  neon: {
    name: 'Neon',
    emoji: '💜',
    primary: '#c026d3',
    accent: '#facc15',
    background: '#0f0a19',
    text: '#fae8ff',
    backgroundImage: neonBg,
  },
  ocean: {
    name: 'Ocean',
    emoji: '🌊',
    primary: '#06b6d4',
    accent: '#38bdf8',
    background: '#0c4a6e',
    text: '#e0f2fe',
    backgroundImage: oceanBg,
  },
  sunset: {
    name: 'Sunset',
    emoji: '🌅',
    primary: '#f97316',
    accent: '#fbbf24',
    background: '#431407',
    text: '#ffedd5',
    backgroundImage: sunsetBg,
  },
  midnight: {
    name: 'Midnight',
    emoji: '🌙',
    primary: '#6366f1',
    accent: '#a5b4fc',
    background: '#020617',
    text: '#c7d2fe',
    backgroundImage: midnightBg,
  },
};

/**
 * Get theme by key
 */
export function getTheme(key) {
  return THEME_PRESETS[key] || THEME_PRESETS.default;
}

/**
 * Get all theme keys
 */
export function getThemeKeys() {
  return Object.keys(THEME_PRESETS);
}

/**
 * Save theme preference to localStorage
 */
export function saveThemePreference(key) {
  localStorage.setItem('moltbot-theme', key);
}

/**
 * Load theme preference from localStorage
 */
export function loadThemePreference() {
  return localStorage.getItem('moltbot-theme') || 'default';
}

export default THEME_PRESETS;
