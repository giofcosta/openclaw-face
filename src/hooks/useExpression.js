import { useState, useEffect, useMemo } from 'react';

/**
 * useExpression - Manages face expression states with smooth transitions
 */

export const EXPRESSIONS = {
  IDLE: 'idle',
  THINKING: 'thinking',
  SPEAKING: 'speaking',
  LISTENING: 'listening',
  ERROR: 'error',
  HAPPY: 'happy',
  SURPRISED: 'surprised',
};

// Expression configurations
const EXPRESSION_CONFIG = {
  idle: {
    eyeScale: 1,
    eyeOffsetY: 0,
    mouthCurve: 20, // positive = smile
    browOffset: 0,
    glowIntensity: 0.3,
  },
  thinking: {
    eyeScale: 0.9,
    eyeOffsetY: -2,
    mouthCurve: 5,
    browOffset: -3,
    glowIntensity: 0.5,
  },
  speaking: {
    eyeScale: 1.1,
    eyeOffsetY: 0,
    mouthCurve: 15,
    browOffset: 2,
    glowIntensity: 0.8,
  },
  listening: {
    eyeScale: 1.05,
    eyeOffsetY: 2,
    mouthCurve: 10,
    browOffset: 3,
    glowIntensity: 0.4,
  },
  error: {
    eyeScale: 0.8,
    eyeOffsetY: 0,
    mouthCurve: -15, // negative = frown
    browOffset: -5,
    glowIntensity: 0.6,
  },
  happy: {
    eyeScale: 0.85,
    eyeOffsetY: 3,
    mouthCurve: 30,
    browOffset: 5,
    glowIntensity: 0.7,
  },
  surprised: {
    eyeScale: 1.3,
    eyeOffsetY: -3,
    mouthCurve: 0,
    browOffset: 8,
    glowIntensity: 0.6,
  },
};

export function useExpression(state) {
  const [currentExpression, setCurrentExpression] = useState(EXPRESSIONS.IDLE);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Map gateway state to expression
  useEffect(() => {
    let newExpression = EXPRESSIONS.IDLE;
    
    switch (state) {
      case 'THINKING':
        newExpression = EXPRESSIONS.THINKING;
        break;
      case 'SPEAKING':
        newExpression = EXPRESSIONS.SPEAKING;
        break;
      case 'LISTENING':
        newExpression = EXPRESSIONS.LISTENING;
        break;
      case 'ERROR':
        newExpression = EXPRESSIONS.ERROR;
        break;
      default:
        newExpression = EXPRESSIONS.IDLE;
    }

    if (newExpression !== currentExpression) {
      setIsTransitioning(true);
      setCurrentExpression(newExpression);
      
      // End transition after animation completes
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [state, currentExpression]);

  // Get expression config with defaults
  const expressionConfig = useMemo(() => {
    return EXPRESSION_CONFIG[currentExpression] || EXPRESSION_CONFIG.idle;
  }, [currentExpression]);

  // Generate CSS transition styles
  const transitionStyles = useMemo(() => ({
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }), []);

  return {
    expression: currentExpression,
    config: expressionConfig,
    isTransitioning,
    transitionStyles,
    setExpression: setCurrentExpression,
  };
}

export default useExpression;
