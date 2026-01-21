import React from 'react';
import { Position } from '../../data/types';
import { AOE_DEFAULTS, FIELD_DEFAULTS } from '../../data/constants';
import { gameToScreen } from '../../utils/coordinates';

interface LineAoEProps {
  position: Position;
  direction: number; // 向き（度、北=0、時計回り）
  length: number;
  width: number;
  color?: string;
  opacity?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const LineAoE: React.FC<LineAoEProps> = ({
  position,
  direction,
  length,
  width,
  color = AOE_DEFAULTS.color,
  opacity = AOE_DEFAULTS.opacity,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const scale = screenSize / fieldSize;
  const screenLength = length * scale;
  const screenWidth = width * scale;

  // 北=0、時計回りを、SVGの回転角度に変換
  // SVGのrotateは東=0、時計回りなので、-90度オフセット
  const svgRotation = direction;

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
      <rect
        x={screenPos.x - screenWidth / 2}
        y={screenPos.y}
        width={screenWidth}
        height={screenLength}
        fill={color}
        fillOpacity={opacity}
        stroke={color}
        strokeOpacity={Math.min(1, opacity + 0.3)}
        strokeWidth={2}
        transform={`rotate(${svgRotation - 180}, ${screenPos.x}, ${screenPos.y})`}
      />
    </svg>
  );
};
