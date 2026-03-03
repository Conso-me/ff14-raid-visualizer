import React from 'react';
import type { Position } from '../../../data/types';
import { FIELD_DEFAULTS } from '../../../data/constants';
import { gameToScreen } from '../../../utils/coordinates';

interface StackCountMarkerProps {
  position: Position;
  size?: number;
  color?: string;
  opacity?: number;
  count?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const StackCountMarker: React.FC<StackCountMarkerProps> = ({
  position,
  size = 3,
  color = '#ffcc00',
  opacity = 0.9,
  count = 2,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const scale = screenSize / fieldSize;
  const r = (size * scale) / 2;

  const clampedCount = Math.max(1, Math.min(4, count));
  const dotR = r * 0.15;
  const innerR = r * 0.45;

  // Distribute dots evenly around center
  const dots = Array.from({ length: clampedCount }, (_, i) => {
    if (clampedCount === 1) {
      return { x: screenPos.x, y: screenPos.y };
    }
    const angle = (i * 2 * Math.PI) / clampedCount - Math.PI / 2;
    return {
      x: screenPos.x + innerR * Math.cos(angle),
      y: screenPos.y + innerR * Math.sin(angle),
    };
  });

  return (
    <svg
      width={screenSize}
      height={screenSize}
      style={{ position: 'absolute', top: 0, left: 0, width: screenSize, height: screenSize, pointerEvents: 'none' }}
    >
      <g opacity={opacity}>
        {/* Outer ring */}
        <circle
          cx={screenPos.x}
          cy={screenPos.y}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={2}
        />
        {/* Count dots */}
        {dots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dotR}
            fill={color}
            stroke="#ffffff"
            strokeWidth={1}
          />
        ))}
      </g>
    </svg>
  );
};
