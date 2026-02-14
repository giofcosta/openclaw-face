import { useEffect, useRef } from 'react';

/**
 * ListeningWaves - Animated waves around avatar when listening
 * Creates a pulsing wave effect emanating from the center
 */
export function ListeningWaves({ isListening = false, theme }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const wavesRef = useRef([]);

  useEffect(() => {
    if (!isListening) {
      // Clear canvas when not listening
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const color = theme?.primary || '#3b82f6';

    // Parse hex color to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 59, g: 130, b: 246 };
    };

    const rgb = hexToRgb(color);

    const resize = () => {
      canvas.width = canvas.parentElement?.offsetWidth || 400;
      canvas.height = canvas.parentElement?.offsetHeight || 400;
    };
    resize();
    window.addEventListener('resize', resize);

    // Wave properties
    const centerX = () => canvas.width / 2;
    const centerY = () => canvas.height / 2;
    const maxRadius = () => Math.max(canvas.width, canvas.height) * 0.6;

    // Initialize waves
    wavesRef.current = [];
    let lastWaveTime = 0;
    const waveInterval = 800; // New wave every 800ms

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new wave periodically
      if (time - lastWaveTime > waveInterval) {
        wavesRef.current.push({
          radius: 50,
          opacity: 0.6,
          speed: 1.5 + Math.random() * 0.5,
        });
        lastWaveTime = time;
        
        // Limit number of waves
        if (wavesRef.current.length > 5) {
          wavesRef.current.shift();
        }
      }

      // Draw and update waves
      wavesRef.current.forEach((wave, index) => {
        // Draw wave
        ctx.beginPath();
        ctx.arc(centerX(), centerY(), wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${wave.opacity})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Second ring (inner)
        ctx.beginPath();
        ctx.arc(centerX(), centerY(), wave.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${wave.opacity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Update wave
        wave.radius += wave.speed;
        wave.opacity -= 0.008;

        // Remove faded waves
        if (wave.opacity <= 0) {
          wavesRef.current.splice(index, 1);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, theme]);

  if (!isListening) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      data-testid="listening-waves"
    />
  );
}

export default ListeningWaves;
