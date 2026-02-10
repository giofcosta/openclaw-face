import { useEffect, useRef, useCallback } from 'react';

/**
 * Confetti Component - Celebration effects
 * Triggers confetti burst animation
 */

const CONFETTI_COLORS = [
  '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff',
  '#5f27cd', '#00d2d3', '#ff6b6b', '#1dd1a1', '#feca57',
];

class ConfettiPiece {
  constructor(canvas, colors) {
    this.canvas = canvas;
    this.colors = colors;
    this.reset();
  }

  reset() {
    const { width, height } = this.canvas;
    this.x = width / 2 + (Math.random() - 0.5) * 100;
    this.y = height / 2;
    this.vx = (Math.random() - 0.5) * 15;
    this.vy = -Math.random() * 20 - 10;
    this.gravity = 0.5;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 10;
    this.size = Math.random() * 10 + 5;
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
    this.opacity = 1;
    this.fadeSpeed = 0.01 + Math.random() * 0.02;
  }

  update() {
    this.x += this.vx;
    this.vy += this.gravity;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.opacity -= this.fadeSpeed;
    
    // Add some air resistance
    this.vx *= 0.99;
    
    return this.opacity > 0 && this.y < this.canvas.height + 50;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;

    if (this.shape === 'rect') {
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export function Confetti({ trigger, theme, duration = 3000 }) {
  const canvasRef = useRef(null);
  const piecesRef = useRef([]);
  const animationRef = useRef(null);
  const isActiveRef = useRef(false);

  // Get colors from theme or use defaults
  const colors = theme?.primary 
    ? [theme.primary, theme.accent || '#fbbf24', ...CONFETTI_COLORS.slice(0, 5)]
    : CONFETTI_COLORS;

  const startConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Resize canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create confetti pieces
    piecesRef.current = Array.from({ length: 100 }, () => 
      new ConfettiPiece(canvas, colors)
    );
    
    isActiveRef.current = true;
    
    const animate = () => {
      if (!isActiveRef.current) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      piecesRef.current = piecesRef.current.filter(piece => {
        const alive = piece.update();
        if (alive) piece.draw(ctx);
        return alive;
      });

      if (piecesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        isActiveRef.current = false;
      }
    };

    animate();

    // Auto-stop after duration
    setTimeout(() => {
      isActiveRef.current = false;
    }, duration);
  }, [colors, duration]);

  useEffect(() => {
    if (trigger) {
      startConfetti();
    }

    return () => {
      isActiveRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, startConfetti]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ opacity: 1 }}
    />
  );
}

export default Confetti;
