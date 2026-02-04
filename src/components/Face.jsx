import { useMemo } from 'react';
import { STATES } from '../hooks/useGateway';

export function Face({ state, config, theme }) {
  const isThinking = state === STATES.THINKING;
  const isSpeaking = state === STATES.SPEAKING;
  const isError = state === STATES.ERROR;
  const isDisconnected = state === STATES.DISCONNECTED || state === STATES.CONNECTING;

  const eyeStyle = config?.face?.eyeShape || 'angular';

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
    <svg
      viewBox="0 0 400 400"
      className={`w-full h-full max-w-[80vh] max-h-[80vh] transition-all duration-300 ${
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
            {/* Eye glow */}
            <ellipse
              cx="140"
              cy="160"
              rx="8"
              ry="6"
              fill={theme?.accent || '#fbbf24'}
              className={isSpeaking ? 'animate-speaking' : ''}
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
            {/* Eye glow */}
            <ellipse
              cx="260"
              cy="160"
              rx="8"
              ry="6"
              fill={theme?.accent || '#fbbf24'}
              className={isSpeaking ? 'animate-speaking' : ''}
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
                  animationDelay: `${i * 0.1}s`,
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
  );
}
