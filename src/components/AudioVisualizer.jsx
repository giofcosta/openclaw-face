import { useMemo } from 'react';

/**
 * AudioVisualizer - Visualizes audio levels around the face
 */
export function AudioVisualizer({ audioLevel, theme, enabled = true }) {
  // Generate dynamic styles based on audio level
  const visualizerStyle = useMemo(() => {
    if (!enabled || audioLevel === 0) return {};
    
    const scale = 1 + audioLevel * 0.1; // Subtle scale effect
    const glowSize = 20 + audioLevel * 40; // Dynamic glow
    const opacity = 0.3 + audioLevel * 0.5;
    
    return {
      transform: `scale(${scale})`,
      boxShadow: `0 0 ${glowSize}px ${theme?.accent || '#fbbf24'}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
      transition: 'all 0.05s ease-out',
    };
  }, [audioLevel, theme, enabled]);

  // Audio bars visualization
  const bars = useMemo(() => {
    if (!enabled) return null;
    
    const barCount = 8;
    return Array.from({ length: barCount }, (_, i) => {
      const angle = (i / barCount) * Math.PI * 2;
      const height = 10 + audioLevel * 30;
      const delay = i * 0.05;
      
      return (
        <div
          key={i}
          className="absolute"
          style={{
            width: '4px',
            height: `${height}px`,
            backgroundColor: theme?.accent || '#fbbf24',
            borderRadius: '2px',
            left: '50%',
            top: '50%',
            transform: `rotate(${angle}rad) translateY(-120px)`,
            transformOrigin: 'center center',
            opacity: 0.5 + audioLevel * 0.5,
            transition: `all 0.05s ease-out ${delay}s`,
          }}
        />
      );
    });
  }, [audioLevel, theme, enabled]);

  if (!enabled) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
      style={visualizerStyle}
    >
      {bars}
    </div>
  );
}

export default AudioVisualizer;
