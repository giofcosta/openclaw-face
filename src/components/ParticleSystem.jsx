import { useEffect, useRef, useMemo } from 'react';

/**
 * Particle System Component
 * Creates ambient particles that respond to bot state
 */

const PARTICLE_CONFIG = {
  idle: {
    count: 30,
    speed: 0.3,
    size: { min: 2, max: 4 },
    opacity: { min: 0.2, max: 0.5 },
    behavior: 'float', // gentle floating
  },
  thinking: {
    count: 50,
    speed: 1.5,
    size: { min: 2, max: 5 },
    opacity: { min: 0.3, max: 0.7 },
    behavior: 'orbit', // swirling vortex
  },
  speaking: {
    count: 60,
    speed: 2.5,
    size: { min: 3, max: 6 },
    opacity: { min: 0.4, max: 0.8 },
    behavior: 'burst', // energetic pulse
  },
  error: {
    count: 40,
    speed: 1.0,
    size: { min: 2, max: 4 },
    opacity: { min: 0.3, max: 0.6 },
    behavior: 'shake', // warning shake
  },
};

class Particle {
  constructor(canvas, config, theme) {
    this.canvas = canvas;
    this.config = config;
    this.theme = theme;
    this.reset();
  }

  reset() {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;

    // Start particles in a ring around the center
    const angle = Math.random() * Math.PI * 2;
    const distance = radius * (0.8 + Math.random() * 0.4);
    
    this.x = centerX + Math.cos(angle) * distance;
    this.y = centerY + Math.sin(angle) * distance;
    this.baseX = this.x;
    this.baseY = this.y;
    this.angle = angle;
    this.orbitAngle = angle;
    
    this.size = this.config.size.min + Math.random() * (this.config.size.max - this.config.size.min);
    this.opacity = this.config.opacity.min + Math.random() * (this.config.opacity.max - this.config.opacity.min);
    this.speedMultiplier = 0.5 + Math.random() * 1;
    this.phaseOffset = Math.random() * Math.PI * 2;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  update(time, behavior) {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const speed = this.config.speed * this.speedMultiplier;

    switch (behavior) {
      case 'float':
        // Gentle floating motion
        this.x = this.baseX + Math.sin(time * 0.001 + this.phaseOffset) * 20;
        this.y = this.baseY + Math.cos(time * 0.0008 + this.phaseOffset) * 15;
        this.opacity = this.config.opacity.min + 
          Math.sin(time * 0.002 + this.pulsePhase) * 0.1;
        break;

      case 'orbit':
        // Swirling vortex around center
        this.orbitAngle += speed * 0.02;
        const orbitRadius = Math.min(width, height) * 0.35 * 
          (0.8 + Math.sin(time * 0.001 + this.phaseOffset) * 0.2);
        this.x = centerX + Math.cos(this.orbitAngle) * orbitRadius;
        this.y = centerY + Math.sin(this.orbitAngle) * orbitRadius;
        this.opacity = this.config.opacity.min + 
          Math.abs(Math.sin(this.orbitAngle)) * 0.3;
        break;

      case 'burst':
        // Pulsing outward from center
        const pulsePhase = (time * 0.003 + this.phaseOffset) % (Math.PI * 2);
        const burstRadius = Math.min(width, height) * 0.3 * 
          (0.5 + Math.sin(pulsePhase) * 0.5);
        this.x = centerX + Math.cos(this.angle) * burstRadius * (1 + Math.sin(time * 0.005) * 0.2);
        this.y = centerY + Math.sin(this.angle) * burstRadius * (1 + Math.cos(time * 0.005) * 0.2);
        this.opacity = this.config.opacity.max * (0.5 + Math.sin(pulsePhase) * 0.5);
        this.size = this.config.size.min + 
          (this.config.size.max - this.config.size.min) * Math.sin(pulsePhase);
        break;

      case 'shake':
        // Warning shake effect
        const shakeIntensity = 5;
        this.x = this.baseX + (Math.random() - 0.5) * shakeIntensity;
        this.y = this.baseY + (Math.random() - 0.5) * shakeIntensity;
        this.opacity = this.config.opacity.min + 
          Math.random() * (this.config.opacity.max - this.config.opacity.min);
        break;

      default:
        break;
    }
  }

  draw(ctx, color) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = color.replace(')', `, ${this.opacity})`).replace('rgb', 'rgba');
    ctx.fill();
    
    // Add glow effect
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fillStyle = color.replace(')', `, ${this.opacity * 0.3})`).replace('rgb', 'rgba');
    ctx.fill();
  }
}

export function ParticleSystem({ state, theme, enabled = true }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const lastStateRef = useRef(state);

  // Determine behavior based on state
  const behavior = useMemo(() => {
    switch (state) {
      case 'THINKING':
        return 'thinking';
      case 'SPEAKING':
        return 'speaking';
      case 'ERROR':
        return 'error';
      default:
        return 'idle';
    }
  }, [state]);

  // Get particle color based on state and theme
  const particleColor = useMemo(() => {
    if (state === 'ERROR') return 'rgb(239, 68, 68)'; // red
    return theme?.primary ? 
      `rgb(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)})` :
      'rgb(59, 130, 246)'; // default blue
  }, [state, theme]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const config = PARTICLE_CONFIG[behavior];

    // Resize canvas to match container
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize or update particles when state changes
    if (lastStateRef.current !== state || particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: config.count }, () => 
        new Particle(canvas, config, theme)
      );
      lastStateRef.current = state;
    }

    // Animation loop
    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        particle.config = config;
        particle.update(time, config.behavior);
        particle.draw(ctx, particleColor);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, behavior, theme, particleColor, state]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
}

export default ParticleSystem;
