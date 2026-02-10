import { useCallback, useRef, useEffect } from 'react';

/**
 * useSoundEffects - Subtle audio feedback for bot states
 * Uses Web Audio API to generate sounds programmatically
 */
export function useSoundEffects(enabled = true, volume = 0.3) {
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume;
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    return audioContextRef.current;
  }, [volume]);

  // Play a tone
  const playTone = useCallback((frequency, duration, type = 'sine', fadeOut = true) => {
    if (!enabled) return;

    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      if (fadeOut) {
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      }

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (err) {
      console.warn('Sound effect error:', err);
    }
  }, [enabled, volume, getAudioContext]);

  // Thinking sound - low gentle hum
  const playThinking = useCallback(() => {
    playTone(220, 0.3, 'sine'); // A3
    setTimeout(() => playTone(196, 0.3, 'sine'), 300); // G3
  }, [playTone]);

  // Speaking/response chime
  const playChime = useCallback(() => {
    playTone(523, 0.15, 'sine'); // C5
    setTimeout(() => playTone(659, 0.15, 'sine'), 100); // E5
    setTimeout(() => playTone(784, 0.2, 'sine'), 200); // G5
  }, [playTone]);

  // Success sound
  const playSuccess = useCallback(() => {
    playTone(523, 0.1, 'sine'); // C5
    setTimeout(() => playTone(659, 0.1, 'sine'), 80); // E5
    setTimeout(() => playTone(784, 0.15, 'sine'), 160); // G5
    setTimeout(() => playTone(1047, 0.25, 'sine'), 240); // C6
  }, [playTone]);

  // Error sound
  const playError = useCallback(() => {
    playTone(200, 0.2, 'sawtooth');
    setTimeout(() => playTone(150, 0.3, 'sawtooth'), 150);
  }, [playTone]);

  // Notification ping
  const playNotification = useCallback(() => {
    playTone(880, 0.1, 'sine'); // A5
    setTimeout(() => playTone(1100, 0.15, 'sine'), 100);
  }, [playTone]);

  // Click/tap sound
  const playClick = useCallback(() => {
    playTone(1000, 0.05, 'square');
  }, [playTone]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    playThinking,
    playChime,
    playSuccess,
    playError,
    playNotification,
    playClick,
    playTone,
  };
}

export default useSoundEffects;
