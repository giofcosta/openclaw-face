import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useAudioReactive - React to audio input levels
 * Uses Web Audio API to analyze microphone input
 */
export function useAudioReactive(enabled = true, sensitivity = 1.0) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const dataArrayRef = useRef(null);

  const startListening = useCallback(async () => {
    if (!enabled || isListening) return;

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create audio context and analyzer
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      setIsListening(true);
      setError(null);

      // Start analyzing
      const analyze = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Calculate average volume
        const average = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length;
        
        // Normalize to 0-1 range and apply sensitivity
        const normalizedLevel = Math.min(1, (average / 128) * sensitivity);
        setAudioLevel(normalizedLevel);

        animationRef.current = requestAnimationFrame(analyze);
      };

      analyze();
    } catch (err) {
      console.error('Audio access error:', err);
      setError(err.message);
      setIsListening(false);
    }
  }, [enabled, isListening, sensitivity]);

  const stopListening = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsListening(false);
    setAudioLevel(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  // Auto-start if enabled changes
  useEffect(() => {
    if (!enabled && isListening) {
      stopListening();
    }
  }, [enabled, isListening, stopListening]);

  return {
    audioLevel,
    isListening,
    error,
    startListening,
    stopListening,
    toggleListening: () => isListening ? stopListening() : startListening(),
  };
}

export default useAudioReactive;
