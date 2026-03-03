import React from 'react';
import type { Position } from '../../../data/types';
import { FIELD_DEFAULTS } from '../../../data/constants';
import { gameToScreen } from '../../../utils/coordinates';

interface TargetMarkerProps {
  position: Position;
  size?: number;
  color?: string;
  opacity?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const TargetMarker: React.FC<TargetMarkerProps> = ({
  position,
  size = 3,
  color = '#ff4444',
  opacity = 0.9,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const scale = screenSize / fieldSize;
  const r = (size * scale) / 2;

  const outerR = r;
  const midR = r * 0.65;
  const innerR = r * 0.3;
  const gap = r * 0.15; // gap in crosshair lines
  const lineLen = r * 1.2;

  return (
    <svg
      width={screenSize}
      height={screenSize}
      style={{ position: 'absolute', top: 0, left: 0, width: screenSize, height: screenSize, pointerEvents: 'none' }}
    >
      <g opacity={opacity}>
        {/* Outer circle */}
        <circle cx={screenPos.x} cy={screenPos.y} r={outerR}
          fill="none" stroke={color} strokeWidth={2} />
        {/* Middle circle */}
        <circle cx={screenPos.x} cy={screenPos.y} r={midR}
          fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.7} />
        {/* Center dot */}
        <circle cx={screenPos.x} cy={screenPos.y} r={innerR * 0.4}
          fill={color} />
        {/* Crosshair lines (with gap near center) */}
        {/* Top */}
        <line x1={screenPos.x} y1={screenPos.y - gap} x2={screenPos.x} y2={screenPos.y - lineLen}
          stroke={color} strokeWidth={1.5} />
        {/* Bottom */}
        <line x1={screenPos.x} y1={screenPos.y + gap} x2={screenPos.x} y2={screenPos.y + lineLen}
          stroke={color} strokeWidth={1.5} />
        {/* Left */}
        <line x1={screenPos.x - gap} y1={screenPos.y} x2={screenPos.x - lineLen} y2={screenPos.y}
          stroke={color} strokeWidth={1.5} />
        {/* Right */}
        <line x1={screenPos.x + gap} y1={screenPos.y} x2={screenPos.x + lineLen} y2={screenPos.y}
          stroke={color} strokeWidth={1.5} />
      </g>
    </svg>
  );
};
