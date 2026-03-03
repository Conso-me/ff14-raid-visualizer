import React from 'react';
import type { Position } from '../../../data/types';
import { FIELD_DEFAULTS } from '../../../data/constants';
import { gameToScreen } from '../../../utils/coordinates';

interface KnockbackLineMarkerProps {
  position: Position;
  size?: number;
  color?: string;
  opacity?: number;
  rotation?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const KnockbackLineMarker: React.FC<KnockbackLineMarkerProps> = ({
  position,
  size = 3,
  color = '#ffaa00',
  opacity = 0.9,
  rotation = 0,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const scale = screenSize / fieldSize;
  const r = (size * scale) / 2;
  const uid = `kbl-${position.x}-${position.y}-${Date.now()}`;

  const arrowSize = r * 0.25;
  const spacing = r * 0.55;

  return (
    <svg
      width={screenSize}
      height={screenSize}
      style={{ position: 'absolute', top: 0, left: 0, width: screenSize, height: screenSize, pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id={`${uid}-grad`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0.9} />
        </linearGradient>
      </defs>
      <g transform={`rotate(${rotation}, ${screenPos.x}, ${screenPos.y})`} opacity={opacity}>
        {/* 3x3 grid of upward-pointing chevrons */}
        {[-1, 0, 1].map((row) =>
          [-1, 0, 1].map((col) => {
            const cx = screenPos.x + col * spacing;
            const cy = screenPos.y + row * spacing;
            return (
              <polyline
                key={`${row}-${col}`}
                points={`${cx - arrowSize},${cy + arrowSize * 0.5} ${cx},${cy - arrowSize * 0.5} ${cx + arrowSize},${cy + arrowSize * 0.5}`}
                fill="none"
                stroke={`url(#${uid}-grad)`}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })
        )}
      </g>
    </svg>
  );
};
