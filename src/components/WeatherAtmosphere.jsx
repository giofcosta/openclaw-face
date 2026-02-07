import { useEffect, useRef } from 'react';
import { useWeather } from '../hooks/useWeather';

/**
 * Weather Atmosphere - Visual effects based on real weather
 */

const COLORS = {
  day: { sky: '#87CEEB', sun: '#FFD700' },
  night: { sky: '#0f172a', stars: '#ffffff', moon: '#f0f0f0' },
  rain: '#6B7280',
  snow: '#E5E7EB',
  thunder: '#FCD34D',
};

export function WeatherAtmosphere({ enabled = true, theme }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const { condition, isDay, loading } = useWeather();

  useEffect(() => {
    if (!enabled || loading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.parentElement?.offsetWidth || 400;
      canvas.height = canvas.parentElement?.offsetHeight || 400;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles based on weather
    const initParticles = () => {
      const count = getParticleCount(condition);
      particlesRef.current = Array.from({ length: count }, () => createParticle(canvas, condition));
    };
    initParticles();

    let lastFlash = 0;
    let flashOpacity = 0;

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background atmosphere
      drawAtmosphere(ctx, canvas, condition, isDay, theme);

      // Draw weather particles
      particlesRef.current.forEach(p => {
        updateParticle(p, canvas, condition, time);
        drawParticle(ctx, p, condition, isDay);
      });

      // Thunder flash
      if (condition === 'thunderstorm' && time - lastFlash > 3000 + Math.random() * 5000) {
        flashOpacity = 0.8;
        lastFlash = time;
      }
      if (flashOpacity > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        flashOpacity -= 0.05;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [enabled, condition, isDay, loading, theme]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}

function getParticleCount(condition) {
  switch (condition) {
    case 'rain': case 'drizzle': return 100;
    case 'heavy_rain': return 200;
    case 'snow': return 50;
    case 'heavy_snow': return 100;
    case 'thunderstorm': return 150;
    default: return 20; // stars or clouds
  }
}

function createParticle(canvas, condition) {
  const isRainOrSnow = ['rain', 'drizzle', 'heavy_rain', 'snow', 'heavy_snow', 'thunderstorm'].includes(condition);
  return {
    x: Math.random() * canvas.width,
    y: isRainOrSnow ? -10 : Math.random() * canvas.height,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.3,
    drift: (Math.random() - 0.5) * 0.5,
    twinkle: Math.random() * Math.PI * 2,
  };
}

function updateParticle(p, canvas, condition, time) {
  switch (condition) {
    case 'rain': case 'drizzle': case 'heavy_rain': case 'thunderstorm':
      p.y += p.speed * 5;
      p.x += p.drift;
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
      break;
    case 'snow': case 'heavy_snow':
      p.y += p.speed;
      p.x += Math.sin(time * 0.001 + p.twinkle) * 0.5;
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
      break;
    default: // stars twinkle, clouds drift
      p.twinkle += 0.02;
      p.x += p.drift * 0.2;
      if (p.x > canvas.width + 50) p.x = -50;
      if (p.x < -50) p.x = canvas.width + 50;
  }
}

function drawParticle(ctx, p, condition, isDay) {
  ctx.beginPath();
  switch (condition) {
    case 'rain': case 'drizzle': case 'heavy_rain': case 'thunderstorm':
      ctx.strokeStyle = `rgba(150, 200, 255, ${p.opacity})`;
      ctx.lineWidth = 1;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.drift, p.y + 10);
      ctx.stroke();
      break;
    case 'snow': case 'heavy_snow':
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      if (!isDay) {
        // Stars
        const twinkleOpacity = (Math.sin(p.twinkle) + 1) / 2 * p.opacity;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkleOpacity})`;
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
  }
}

function drawAtmosphere(ctx, canvas, condition, isDay, theme) {
  const { width, height } = canvas;
  const centerX = width / 2;
  const centerY = height / 2;

  // Subtle gradient overlay
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.6);

  if (!isDay) {
    // Night atmosphere
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0.3)');
    
    // Draw moon
    ctx.fillStyle = 'rgba(240, 240, 220, 0.15)';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.2, 30, 0, Math.PI * 2);
    ctx.fill();
  } else if (condition === 'clear' || condition === 'partly_cloudy') {
    // Sunny day - warm glow
    gradient.addColorStop(0, 'rgba(255, 200, 100, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
    
    // Draw sun glow
    ctx.fillStyle = 'rgba(255, 220, 100, 0.1)';
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.15, 40, 0, Math.PI * 2);
    ctx.fill();
  } else if (condition.includes('rain') || condition === 'thunderstorm') {
    // Rainy/stormy - dark overlay
    gradient.addColorStop(0, 'rgba(50, 50, 70, 0.1)');
    gradient.addColorStop(1, 'rgba(50, 50, 70, 0.2)');
  } else if (condition.includes('snow')) {
    // Snowy - cool overlay
    gradient.addColorStop(0, 'rgba(200, 220, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(200, 220, 255, 0.15)');
  } else if (condition === 'fog') {
    // Foggy - misty overlay
    gradient.addColorStop(0, 'rgba(200, 200, 200, 0.2)');
    gradient.addColorStop(1, 'rgba(200, 200, 200, 0.3)');
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export default WeatherAtmosphere;
