import React from 'react';
import type { Position } from '../../../data/types';
import { FIELD_DEFAULTS } from '../../../data/constants';
import { gameToScreen } from '../../../utils/coordinates';

interface TelegraphMarkerProps {
  position: Position;
  size?: number;
  color?: string;
  opacity?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const TelegraphMarker: React.FC<TelegraphMarkerProps> = ({
  position,
  size = 3,
  color = '#ff6600',
  opacity = 0.9,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const scale = screenSize / fieldSize;
  const r = (size * scale) / 2;
  const uid = `tele-${position.x}-${position.y}-${Date.now()}`;

  return (
    <svg
      width={screenSize}
      height={screenSize}
      style={{ position: 'absolute', top: 0, left: 0, width: screenSize, height: screenSize, pointerEvents: 'none' }}
    >
      <defs>
        <radialGradient id={`${uid}-grad`}>
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.6} />
          <stop offset="40%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0.1} />
        </radialGradient>
      </defs>
      <g opacity={opacity}>
        {/* Filled gradient circle */}
        <circle
          cx={screenPos.x}
          cy={screenPos.y}
          r={r}
          fill={`url(#${uid}-grad)`}
        />
        {/* Dashed outer ring */}
        <circle
          cx={screenPos.x}
          cy={screenPos.y}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeDasharray="4,3"
        />
        {/* Bright center */}
        <circle
          cx={screenPos.x}
          cy={screenPos.y}
          r={r * 0.15}
          fill="#ffffff"
          fillOpacity={0.8}
        />
      </g>
    </svg>
  );
};
