import React from 'react';
import type { Position } from '../../../data/types';
import { FIELD_DEFAULTS } from '../../../data/constants';
import { gameToScreen } from '../../../utils/coordinates';

interface ProximityMarkerProps {
  position: Position;
  size?: number;
  color?: string;
  opacity?: number;
  rotation?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const ProximityMarker: React.FC<ProximityMarkerProps> = ({
  position,
  size = 3,
  color = '#ff4444',
  opacity = 0.9,
  rotation = 0,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const scale = screenSize / fieldSize;
  const r = (size * scale) / 2;

  // Two nested downward-pointing triangles
  const outerH = r * 1.4;
  const outerW = r * 1.2;
  const innerH = r * 0.9;
  const innerW = r * 0.7;

  return (
    <svg
      width={screenSize}
      height={screenSize}
      style={{ position: 'absolute', top: 0, left: 0, width: screenSize, height: screenSize, pointerEvents: 'none' }}
    >
      <g transform={`rotate(${rotation}, ${screenPos.x}, ${screenPos.y})`} opacity={opacity}>
        {/* Outer triangle (downward) */}
        <polygon
          points={`${screenPos.x},${screenPos.y + outerH * 0.5} ${screenPos.x - outerW},${screenPos.y - outerH * 0.5} ${screenPos.x + outerW},${screenPos.y - outerH * 0.5}`}
          fill={color}
          fillOpacity={0.3}
          stroke={color}
          strokeWidth={2}
        />
        {/* Inner triangle (downward) */}
        <polygon
          points={`${screenPos.x},${screenPos.y + innerH * 0.4} ${screenPos.x - innerW},${screenPos.y - innerH * 0.4} ${screenPos.x + innerW},${screenPos.y - innerH * 0.4}`}
          fill={color}
          fillOpacity={0.6}
          stroke={color}
          strokeWidth={1.5}
        />
      </g>
    </svg>
  );
};
