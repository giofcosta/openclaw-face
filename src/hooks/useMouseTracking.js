import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useMouseTracking - Track mouse position relative to a container element
 * Returns normalized coordinates (-1 to 1) for eye movement calculations
 */
export function useMouseTracking(containerRef, enabled = true) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const rafRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  // Smooth interpolation for natural eye movement
  const lerp = useCallback((current, target, factor = 0.1) => {
    return current + (target - current) * factor;
  }, []);

  const animate = useCallback(() => {
    // Smoothly interpolate current position towards target
    currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x);
    currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y);

    setPosition({
      x: currentRef.current.x,
      y: currentRef.current.y,
    });

    rafRef.current = requestAnimationFrame(animate);
  }, [lerp]);

  useEffect(() => {
    if (!enabled) {
      setPosition({ x: 0, y: 0 });
      return;
    }

    const container = containerRef?.current;

    const handleMouseMove = (e) => {
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate normalized position (-1 to 1)
      // Clamp to reasonable bounds for natural look
      const maxDistance = Math.max(rect.width, rect.height);
      let x = (e.clientX - centerX) / maxDistance;
      let y = (e.clientY - centerY) / maxDistance;

      // Clamp to [-1, 1] range
      x = Math.max(-1, Math.min(1, x * 2));
      y = Math.max(-1, Math.min(1, y * 2));

      targetRef.current = { x, y };
      setIsActive(true);
    };

    const handleMouseLeave = () => {
      // Return eyes to center when mouse leaves
      targetRef.current = { x: 0, y: 0 };
      setIsActive(false);
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
      }
    };

    const handleTouchEnd = () => {
      handleMouseLeave();
    };

    // Start animation loop
    rafRef.current = requestAnimationFrame(animate);

    // Add event listeners to window (track mouse anywhere)
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, containerRef, animate]);

  return { position, isActive };
}

/**
 * Calculate eye offset for SVG elements
 * @param {Object} position - Normalized position { x, y } from -1 to 1
 * @param {number} maxOffset - Maximum pixel offset for eye movement
 * @returns {Object} - { offsetX, offsetY } in pixels
 */
export function calculateEyeOffset(position, maxOffset = 4) {
  return {
    offsetX: position.x * maxOffset,
    offsetY: position.y * maxOffset,
  };
}

export default useMouseTracking;
