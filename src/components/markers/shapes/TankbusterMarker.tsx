import React from 'react';
import type { Position } from '../../../data/types';
import { FIELD_DEFAULTS } from '../../../data/constants';
import { gameToScreen } from '../../../utils/coordinates';

interface TankbusterMarkerProps {
  position: Position;
  size?: number;
  color?: string;
  opacity?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const TankbusterMarker: React.FC<TankbusterMarkerProps> = ({
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
  const uid = `tb-${position.x}-${position.y}-${Date.now()}`;

  const outerR = r;
  const innerR = r * 0.7;
  const crossSize = r * 0.5;

  return (
    <svg
      width={screenSize}
      height={screenSize}
      style={{ position: 'absolute', top: 0, left: 0, width: screenSize, height: screenSize, pointerEvents: 'none' }}
    >
      <defs>
        <mask id={`${uid}-mask`}>
          <rect x={0} y={0} width={screenSize} height={screenSize} fill="white" />
          <circle cx={screenPos.x} cy={screenPos.y} r={innerR} fill="black" />
        </mask>
      </defs>
      <g opacity={opacity}>
        {/* Outer circle with inner circle cut out */}
        <circle
          cx={screenPos.x}
          cy={screenPos.y}
          r={outerR}
          fill={color}
          fillOpacity={0.4}
          mask={`url(#${uid}-mask)`}
        />
        {/* Outer circle stroke */}
        <circle
          cx={screenPos.x}
          cy={screenPos.y}
          r={outerR}
          fill="none"
          stroke={color}
          strokeWidth={2}
        />
        {/* Inner circle stroke */}
        <circle
          cx={screenPos.x}
          cy={screenPos.y}
          r={innerR}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
        />
        {/* X mark */}
        <line
          x1={screenPos.x - crossSize}
          y1={screenPos.y - crossSize}
          x2={screenPos.x + crossSize}
          y2={screenPos.y + crossSize}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <line
          x1={screenPos.x + crossSize}
          y1={screenPos.y - crossSize}
          x2={screenPos.x - crossSize}
          y2={screenPos.y + crossSize}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
