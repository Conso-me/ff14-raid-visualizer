import React from 'react';
import { Position } from '../../data/types';
import { AOE_DEFAULTS, FIELD_DEFAULTS } from '../../data/constants';
import { gameToScreen } from '../../utils/coordinates';

interface CircleAoEProps {
  position: Position;
  radius: number;
  color?: string;
  opacity?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const CircleAoE: React.FC<CircleAoEProps> = ({
  position,
  radius,
  color = AOE_DEFAULTS.color,
  opacity = AOE_DEFAULTS.opacity,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const screenRadius = (radius / fieldSize) * screenSize;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: screenSize,
        height: screenSize,
        pointerEvents: 'none',
      }}
    >
      <circle
        cx={screenPos.x}
        cy={screenPos.y}
        r={screenRadius}
        fill={color}
        fillOpacity={opacity}
        stroke={color}
        strokeOpacity={Math.min(1, opacity + 0.3)}
        strokeWidth={2}
      />
    </svg>
  );
};
