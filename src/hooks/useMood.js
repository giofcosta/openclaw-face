import { useState, useEffect, useCallback } from 'react';

const MOODS = {
  HAPPY: 'happy',    // Green - recent positive interactions
  ANGRY: 'angry',    // Red - recent errors or negative feedback
  NEUTRAL: 'neutral', // Yellow - default/no recent activity
};

const STORAGE_KEY = 'moltbot-mood-history';
const MAX_HISTORY = 50; // Keep last 50 interactions

/**
 * Mood detection based on local memory (no API calls)
 * Tracks interaction history to determine emotional state
 */
export function useMood(state) {
  const [mood, setMood] = useState(MOODS.NEUTRAL);

  // Load mood history from localStorage
  const getMoodHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Save interaction to history
  const recordInteraction = useCallback((type, sentiment = 'neutral') => {
    try {
      const history = getMoodHistory();
      const entry = {
        timestamp: Date.now(),
        type, // 'success', 'error', 'chat', 'feedback'
        sentiment, // 'positive', 'negative', 'neutral'
      };
      
      const newHistory = [entry, ...history].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      
      // Recalculate mood
      calculateMood(newHistory);
    } catch (e) {
      console.error('Failed to record interaction:', e);
    }
  }, [getMoodHistory]);

  // Calculate mood based on recent history
  const calculateMood = useCallback((history) => {
    if (history.length === 0) {
      setMood(MOODS.NEUTRAL);
      return;
    }

    // Weight recent interactions more heavily (last 10)
    const recent = history.slice(0, 10);
    let score = 0;
    
    recent.forEach((entry, index) => {
      const weight = (10 - index) / 10; // More recent = higher weight
      
      switch (entry.sentiment) {
        case 'positive':
        case 'success':
          score += weight * 2;
          break;
        case 'negative':
        case 'error':
          score -= weight * 3; // Errors weigh more heavily
          break;
        default:
          score += weight * 0.5; // Neutral slight positive
      }
    });

    // Determine mood based on score
    if (score > 3) {
      setMood(MOODS.HAPPY);
    } else if (score < -2) {
      setMood(MOODS.ANGRY);
    } else {
      setMood(MOODS.NEUTRAL);
    }
  }, []);

  // Track state changes to record interactions
  useEffect(() => {
    if (state === 'error') {
      recordInteraction('state_change', 'negative');
    } else if (state === 'speaking') {
      recordInteraction('state_change', 'positive');
    }
  }, [state, recordInteraction]);

  // Initialize mood on mount
  useEffect(() => {
    const history = getMoodHistory();
    calculateMood(history);
  }, [getMoodHistory, calculateMood]);

  // Manual mood setters for external control
  const setHappy = useCallback(() => {
    recordInteraction('manual', 'positive');
  }, [recordInteraction]);

  const setAngry = useCallback(() => {
    recordInteraction('manual', 'negative');
  }, [recordInteraction]);

  const setNeutral = useCallback(() => {
    recordInteraction('manual', 'neutral');
  }, [recordInteraction]);

  return {
    mood,
    MOODS,
    recordInteraction,
    setHappy,
    setAngry,
    setNeutral,
    getMoodHistory,
  };
}

export { MOODS };
