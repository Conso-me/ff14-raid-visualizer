import React from 'react';
import { Position } from '../../data/types';
import { AOE_DEFAULTS, FIELD_DEFAULTS } from '../../data/constants';
import { gameToScreen } from '../../utils/coordinates';

interface RectangleAoEProps {
  position: Position;
  rectWidth: number;
  rectHeight: number;
  rotation?: number;
  color?: string;
  opacity?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const RectangleAoE: React.FC<RectangleAoEProps> = ({
  position,
  rectWidth,
  rectHeight,
  rotation = 0,
  color = AOE_DEFAULTS.color,
  opacity = AOE_DEFAULTS.opacity,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const scale = screenSize / fieldSize;
  const screenW = rectWidth * scale;
  const screenH = rectHeight * scale;

  return (
    <svg
      width={screenSize}
      height={screenSize}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: screenSize,
        height: screenSize,
        pointerEvents: 'none',
      }}
    >
      <g transform={`rotate(${rotation}, ${screenPos.x}, ${screenPos.y})`}>
        <rect
          x={screenPos.x - screenW / 2}
          y={screenPos.y - screenH / 2}
          width={screenW}
          height={screenH}
          fill={color}
          fillOpacity={opacity}
          stroke={color}
          strokeOpacity={Math.min(1, opacity + 0.3)}
          strokeWidth={2}
        />
      </g>
    </svg>
  );
};
