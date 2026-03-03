import React from 'react';
import type { Position } from '../../../data/types';
import { FIELD_DEFAULTS } from '../../../data/constants';
import { gameToScreen } from '../../../utils/coordinates';

interface EyeMarkerProps {
  position: Position;
  size?: number;
  color?: string;
  opacity?: number;
  rotation?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const EyeMarker: React.FC<EyeMarkerProps> = ({
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
  const uid = `eye-${position.x}-${position.y}-${Date.now()}`;

  // Almond shape parameters
  const eyeW = r * 1.6;
  const eyeH = r * 0.7;

  return (
    <svg
      width={screenSize}
      height={screenSize}
      style={{ position: 'absolute', top: 0, left: 0, width: screenSize, height: screenSize, pointerEvents: 'none' }}
    >
      <defs>
        <radialGradient id={`${uid}-grad`}>
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
          <stop offset="50%" stopColor={color} stopOpacity={0.8} />
          <stop offset="100%" stopColor={color} stopOpacity={0.3} />
        </radialGradient>
      </defs>
      <g transform={`rotate(${rotation}, ${screenPos.x}, ${screenPos.y})`} opacity={opacity}>
        {/* Almond shape (eye outline) */}
        <ellipse
          cx={screenPos.x}
          cy={screenPos.y}
          rx={eyeW}
          ry={eyeH}
          fill="none"
          stroke={color}
          strokeWidth={2}
        />
        {/* Iris */}
        <circle
          cx={screenPos.x}
          cy={screenPos.y}
          r={eyeH * 0.7}
          fill={`url(#${uid}-grad)`}
        />
        {/* Pupil */}
        <circle
          cx={screenPos.x}
          cy={screenPos.y}
          r={eyeH * 0.3}
          fill="#000000"
        />
        {/* Radial lines */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = screenPos.x + eyeW * 1.1 * Math.cos(rad);
          const y1 = screenPos.y + eyeW * 1.1 * Math.sin(rad);
          const x2 = screenPos.x + eyeW * 1.4 * Math.cos(rad);
          const y2 = screenPos.y + eyeW * 1.4 * Math.sin(rad);
          return (
            <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={color} strokeWidth={1.5} strokeOpacity={0.6} />
          );
        })}
      </g>
    </svg>
  );
};
