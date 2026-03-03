import React from 'react';
import type { Position } from '../../../data/types';
import { FIELD_DEFAULTS } from '../../../data/constants';
import { gameToScreen } from '../../../utils/coordinates';

interface ChaseMarkerProps {
  position: Position;
  size?: number;
  color?: string;
  opacity?: number;
  rotation?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const ChaseMarker: React.FC<ChaseMarkerProps> = ({
  position,
  size = 3,
  color = '#ff8800',
  opacity = 0.9,
  rotation = 0,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const scale = screenSize / fieldSize;
  const r = (size * scale) / 2;
  const uid = `chase-${position.x}-${position.y}-${Date.now()}`;

  const chevW = r * 0.6;
  const chevH = r * 0.4;

  return (
    <svg
      width={screenSize}
      height={screenSize}
      style={{ position: 'absolute', top: 0, left: 0, width: screenSize, height: screenSize, pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id={`${uid}-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.8} />
          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
        </linearGradient>
      </defs>
      <g transform={`rotate(${rotation}, ${screenPos.x}, ${screenPos.y})`} opacity={opacity}>
        {/* Two horizontal chevrons pointing right */}
        {[-1, 1].map((offset) => {
          const cx = screenPos.x + offset * chevW * 0.6;
          return (
            <polyline
              key={offset}
              points={`${cx - chevW * 0.4},${screenPos.y - chevH} ${cx + chevW * 0.4},${screenPos.y} ${cx - chevW * 0.4},${screenPos.y + chevH}`}
              fill="none"
              stroke={`url(#${uid}-grad)`}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </g>
    </svg>
  );
};
