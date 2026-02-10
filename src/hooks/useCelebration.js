import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useCelebration - Manages celebration effects state
 * Triggers confetti when bot completes a task
 */
export function useCelebration(state, lastResponse) {
  const [shouldCelebrate, setShouldCelebrate] = useState(false);
  const lastStateRef = useRef(state);
  const celebrationTimeoutRef = useRef(null);

  // Trigger celebration manually
  const celebrate = useCallback(() => {
    setShouldCelebrate(true);
    
    // Reset after animation
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
    }
    celebrationTimeoutRef.current = setTimeout(() => {
      setShouldCelebrate(false);
    }, 3500);
  }, []);

  // Auto-detect successful completions
  useEffect(() => {
    // Trigger celebration when transitioning from SPEAKING to IDLE
    // and the response contains success indicators
    if (lastStateRef.current === 'SPEAKING' && state === 'IDLE') {
      const successIndicators = [
        'done', 'complete', 'success', 'finished', 'ready',
        '✅', '🎉', '✨', 'merged', 'deployed', 'fixed'
      ];
      
      const responseText = (lastResponse || '').toLowerCase();
      const isSuccess = successIndicators.some(indicator => 
        responseText.includes(indicator.toLowerCase())
      );
      
      if (isSuccess) {
        celebrate();
      }
    }
    
    lastStateRef.current = state;
  }, [state, lastResponse, celebrate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, []);

  return { shouldCelebrate, celebrate };
}

export default useCelebration;
