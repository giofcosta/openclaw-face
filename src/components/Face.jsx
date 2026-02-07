import { useMemo, useRef } from 'react';
import { STATES } from '../hooks/useGateway';
import { useMood, MOODS } from '../hooks/useMood';
import { WeatherAtmosphere } from './WeatherAtmosphere';
import { useMouseTracking, calculateEyeOffset } from '../hooks/useMouseTracking';

export function Face({ state, config, theme, customAvatar }) {
  const containerRef = useRef(null);
  const isThinking = state === STATES.THINKING;
  const isSpeaking = state === STATES.SPEAKING;
  const isError = state === STATES.ERROR;
  const isDisconnected = state === STATES.DISCONNECTED || state === STATES.CONNECTING;
  
  // Eye tracking - eyes follow mouse cursor
  const eyeTrackingEnabled = config?.animations?.eyeTracking !== false;
  const { position: mousePosition } = useMouseTracking(containerRef, eyeTrackingEnabled);
  const eyeOffset = calculateEyeOffset(mousePosition, 5); // Max 5px offset

  // Get mood from local memory
  const { mood } = useMood(state);

  // Mood colors
  const moodColor = useMemo(() => {
    switch (mood) {
      case MOODS.HAPPY:
        return '#22c55e'; // Green
      case MOODS.ANGRY:
        return '#ef4444'; // Red
      case MOODS.NEUTRAL:
      default:
        return '#eab308'; // Yellow
    }
  }, [mood]);

  const eyeStyle = config?.face?.eyeShape || 'angular';

  // Breathing animation speed based on state (must be before early return)
  const breathingSpeed = useMemo(() => {
    if (isThinking || isSpeaking) return '0.8s'; // Fast when active
    if (state === STATES.LISTENING) return '2s'; // Medium when listening
    return '4s'; // Slow when idle
  }, [isThinking, isSpeaking, state]);

  // If custom avatar is provided, show it instead of SVG
  if (customAvatar) {
    return (
      <div ref={containerRef} className="w-full h-full max-w-[70vh] max-h-[70vh] flex items-center justify-center p-8 relative">
        {/* Weather Atmosphere */}
        <WeatherAtmosphere enabled={config?.animations?.weather !== false} theme={theme} />
        <div className="relative z-10">
          {/* Mood halo with breathing animation */}
          <div
            className="absolute -inset-4 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${moodColor}40 0%, ${moodColor}20 40%, transparent 70%)`,
              boxShadow: `0 0 40px ${moodColor}60, 0 0 80px ${moodColor}40`,
              animation: `breathe ${breathingSpeed} ease-in-out infinite`,
            }}
          />
          <div 
            className="relative w-full aspect-square rounded-full overflow-hidden"
            style={{
              boxShadow: `0 0 60px ${theme?.primary || '#3b82f6'}60, inset 0 0 60px ${theme?.primary || '#3b82f6'}20`,
              border: `3px solid ${theme?.primary || '#3b82f6'}80`,
            }}
          >
            <img
              src={customAvatar}
              alt="Kratos Avatar"
              className="w-full h-full object-cover"
            />
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                boxShadow: `inset 0 0 30px ${theme?.primary || '#3b82f6'}40`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Dynamic styles based on state
  const faceColor = useMemo(() => {
    if (isError) return '#ef4444';
    if (isDisconnected) return '#64748b';
    return theme?.primary || '#3b82f6';
  }, [isError, isDisconnected, theme]);

  const glowIntensity = useMemo(() => {
    if (isThinking) return '0 0 60px';
    if (isSpeaking) return '0 0 80px';
    return '0 0 30px';
  }, [isThinking, isSpeaking]);

  return (
    <div ref={containerRef} className="relative">
      {/* Weather Atmosphere */}
      <WeatherAtmosphere enabled={config?.animations?.weather !== false} theme={theme} />
      {/* Mood halo for SVG face with breathing animation */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle, ${moodColor}30 0%, ${moodColor}15 40%, transparent 70%)`,
          boxShadow: `0 0 60px ${moodColor}50, 0 0 100px ${moodColor}30`,
          transform: 'scale(1.1)',
          animation: `breathe ${breathingSpeed} ease-in-out infinite`,
        }}
      />
      <svg
        viewBox="0 0 400 400"
        className={`w-full h-full max-w-[80vh] max-h-[80vh] transition-all duration-300 relative z-0 ${
          isThinking ? 'animate-thinking' : ''
        }`}
        style={{
          filter: `drop-shadow(${glowIntensity} ${faceColor}40)`,
        }}
      >
      {/* Background circle */}
      <circle
        cx="200"
        cy="200"
        r="180"
        fill="transparent"
        stroke={faceColor}
        strokeWidth="3"
        className={`transition-all duration-500 ${isSpeaking ? 'animate-glow' : ''}`}
        style={{ opacity: isDisconnected ? 0.3 : 0.8 }}
      />

      {/* Inner geometric pattern */}
      <circle
        cx="200"
        cy="200"
        r="150"
        fill="transparent"
        stroke={faceColor}
        strokeWidth="1"
        strokeDasharray="10 5"
        style={{ opacity: 0.3 }}
      />

      {/* Left Eye */}
      <g className="animate-blink" style={{ transformOrigin: '140px 160px' }}>
        {eyeStyle === 'angular' ? (
          <>
            <polygon
              points="110,160 140,140 170,160 140,180"
              fill={faceColor}
              className="transition-all duration-300"
              style={{ opacity: isDisconnected ? 0.3 : 1 }}
            />
            {/* Eye glow/pupil - follows mouse */}
            <ellipse
              cx={140 + eyeOffset.offsetX}
              cy={160 + eyeOffset.offsetY}
              rx="8"
              ry="6"
              fill={theme?.accent || '#fbbf24'}
              className={isSpeaking ? 'animate-speaking' : ''}
              style={{ transition: 'cx 0.05s, cy 0.05s' }}
            />
          </>
        ) : (
          <ellipse
            cx="140"
            cy="160"
            rx="30"
            ry="20"
            fill={faceColor}
            style={{ opacity: isDisconnected ? 0.3 : 1 }}
          />
        )}
      </g>

      {/* Right Eye */}
      <g className="animate-blink" style={{ transformOrigin: '260px 160px', animationDelay: '0.1s' }}>
        {eyeStyle === 'angular' ? (
          <>
            <polygon
              points="230,160 260,140 290,160 260,180"
              fill={faceColor}
              className="transition-all duration-300"
              style={{ opacity: isDisconnected ? 0.3 : 1 }}
            />
            {/* Eye glow/pupil - follows mouse */}
            <ellipse
              cx={260 + eyeOffset.offsetX}
              cy={160 + eyeOffset.offsetY}
              rx="8"
              ry="6"
              fill={theme?.accent || '#fbbf24'}
              className={isSpeaking ? 'animate-speaking' : ''}
              style={{ transition: 'cx 0.05s, cy 0.05s' }}
            />
          </>
        ) : (
          <ellipse
            cx="260"
            cy="160"
            rx="30"
            ry="20"
            fill={faceColor}
            style={{ opacity: isDisconnected ? 0.3 : 1 }}
          />
        )}
      </g>

      {/* Mouth / Voice indicator */}
      <g>
        {isSpeaking ? (
          /* Speaking - animated bars */
          <g className="animate-speaking" style={{ transformOrigin: '200px 260px' }}>
            {[-30, -15, 0, 15, 30].map((offset, i) => (
              <rect
                key={i}
                x={195 + offset}
                y={250}
                width="6"
                height={20 + Math.sin(i * 1.5) * 10}
                rx="3"
                fill={faceColor}
                style={{
                  animation: `speaking-wave 0.3s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </g>
        ) : isThinking ? (
          /* Thinking - dots */
          <g>
            {[-20, 0, 20].map((offset, i) => (
              <circle
                key={i}
                cx={200 + offset}
                cy={260}
                r="6"
                fill={faceColor}
                style={{
                  animation: 'thinking-pulse 1s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </g>
        ) : (
          /* Idle - smile! */
          <path
            d="M 160 255 Q 200 285 240 255"
            fill="transparent"
            stroke={faceColor}
            strokeWidth="4"
            strokeLinecap="round"
            style={{ opacity: isDisconnected ? 0.3 : 0.8 }}
          />
        )}
      </g>

      {/* Lightning bolt accent (Kratos signature) */}
      <g style={{ opacity: isDisconnected ? 0.1 : 0.4 }}>
        <path
          d="M200,50 L210,90 L195,90 L205,130 L180,85 L200,85 L190,50 Z"
          fill={theme?.accent || '#fbbf24'}
          className={isThinking || isSpeaking ? 'animate-glow' : ''}
        />
      </g>

      {/* Status ring */}
      <circle
        cx="200"
        cy="200"
        r="190"
        fill="transparent"
        stroke={faceColor}
        strokeWidth="2"
        strokeDasharray={isSpeaking ? '20 10' : isThinking ? '5 10' : '0'}
        className={isSpeaking || isThinking ? 'animate-spin' : ''}
        style={{
          animationDuration: isSpeaking ? '2s' : '4s',
          opacity: 0.5,
        }}
      />
    </svg>
    </div>
  );
}
