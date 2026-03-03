import React from 'react';
import type { Position } from '../../../data/types';
import { FIELD_DEFAULTS } from '../../../data/constants';
import { gameToScreen } from '../../../utils/coordinates';

interface StackMarkerProps {
  position: Position;
  size?: number;
  color?: string;
  opacity?: number;
  rotation?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const StackMarker: React.FC<StackMarkerProps> = ({
  position,
  size = 3,
  color = '#ffcc00',
  opacity = 0.9,
  rotation = 0,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const scale = screenSize / fieldSize;
  const r = (size * scale) / 2;
  const uid = `stack-${position.x}-${position.y}-${Date.now()}`;

  // Chevron pointing inward from 4 directions
  const chevronSize = r * 0.5;
  const offset = r * 0.8;
  const directions = [0, 90, 180, 270]; // N, E, S, W

  return (
    <svg
      width={screenSize}
      height={screenSize}
      style={{ position: 'absolute', top: 0, left: 0, width: screenSize, height: screenSize, pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id={`${uid}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
          <stop offset="100%" stopColor={color} stopOpacity={0.7} />
        </linearGradient>
      </defs>
      <g transform={`rotate(${rotation}, ${screenPos.x}, ${screenPos.y})`} opacity={opacity}>
        {directions.map((dir) => {
          const rad = (dir * Math.PI) / 180;
          const cx = screenPos.x + offset * Math.sin(rad);
          const cy = screenPos.y - offset * Math.cos(rad);
          // Chevron pointing toward center
          const pointRad = ((dir + 180) * Math.PI) / 180;
          const perpRad = ((dir + 90) * Math.PI) / 180;
          const tipX = cx + chevronSize * 0.6 * Math.sin(pointRad);
          const tipY = cy - chevronSize * 0.6 * Math.cos(pointRad);
          const leftX = cx + chevronSize * 0.5 * Math.sin(perpRad);
          const leftY = cy - chevronSize * 0.5 * Math.cos(perpRad);
          const rightX = cx - chevronSize * 0.5 * Math.sin(perpRad);
          const rightY = cy + chevronSize * 0.5 * Math.cos(perpRad);
          return (
            <polygon
              key={dir}
              points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`}
              fill={`url(#${uid}-grad)`}
              stroke={color}
              strokeWidth={1}
            />
          );
        })}
        {/* Center chevron (downward) */}
        <polygon
          points={`${screenPos.x},${screenPos.y + chevronSize * 0.3} ${screenPos.x - chevronSize * 0.3},${screenPos.y - chevronSize * 0.2} ${screenPos.x + chevronSize * 0.3},${screenPos.y - chevronSize * 0.2}`}
          fill={color}
          stroke="#ffffff"
          strokeWidth={0.5}
        />
      </g>
    </svg>
  );
};
