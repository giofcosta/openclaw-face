import { STATES } from '../hooks/useGateway';

const stateLabels = {
  [STATES.DISCONNECTED]: 'Disconnected',
  [STATES.CONNECTING]: 'Connecting...',
  [STATES.CONNECTED]: 'Connected',
  [STATES.IDLE]: 'Ready',
  [STATES.THINKING]: 'Thinking...',
  [STATES.SPEAKING]: 'Speaking...',
  [STATES.LISTENING]: 'Listening...',
  [STATES.ERROR]: 'Error',
};

const stateColors = {
  [STATES.DISCONNECTED]: '#64748b',
  [STATES.CONNECTING]: '#f59e0b',
  [STATES.CONNECTED]: '#22c55e',
  [STATES.IDLE]: '#22c55e',
  [STATES.THINKING]: '#3b82f6',
  [STATES.SPEAKING]: '#8b5cf6',
  [STATES.LISTENING]: '#06b6d4',
  [STATES.ERROR]: '#ef4444',
};

export function StatusBar({ state, identity, message, visible, theme }) {
  if (!visible) return null;

  const statusColor = stateColors[state] || theme?.primary || '#3b82f6';
  const statusLabel = message || stateLabels[state] || 'Unknown';

  return (
    <div 
      className="absolute top-0 left-0 right-0 px-2 sm:px-4 flex items-center justify-center gap-4"
      style={{ color: theme?.text || '#f8fafc' }}
    >
      {/* Identity */}
      {identity?.showName !== false && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{identity?.emoji || '⚡'}</span>
          <span className="text-xl font-bold tracking-wide">
            {identity?.name || 'Moltbot'}
          </span>
          {identity?.tagline && (
            <span className="text-sm opacity-60 hidden sm:inline">
              — {identity.tagline}
            </span>
          )}
        </div>
      )}

      {/* Status indicator */}
      <div className="flex items-center gap-2 bg-black/30 rounded-full px-4 py-2">
        <div 
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: statusColor }}
        />
        <span className="text-sm font-medium">{statusLabel}</span>
      </div>
    </div>
  );
}
