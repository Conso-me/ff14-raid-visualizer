import React from 'react';
import { Position } from '../../data/types';
import { AOE_DEFAULTS, FIELD_DEFAULTS } from '../../data/constants';
import { gameToScreen } from '../../utils/coordinates';

interface CrossAoEProps {
  position: Position;
  armWidth: number;
  armLength: number;
  rotation?: number; // 回転角度（度、デフォルト: 0）
  color?: string;
  opacity?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const CrossAoE: React.FC<CrossAoEProps> = ({
  position,
  armWidth,
  armLength,
  rotation = 0,
  color = AOE_DEFAULTS.color,
  opacity = AOE_DEFAULTS.opacity,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const scale = screenSize / fieldSize;
  const screenArmWidth = armWidth * scale;
  const screenArmLength = armLength * scale;

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
      <g transform={`rotate(${rotation}, ${screenPos.x}, ${screenPos.y})`}>
        {/* 縦の腕 */}
        <rect
          x={screenPos.x - screenArmWidth / 2}
          y={screenPos.y - screenArmLength}
          width={screenArmWidth}
          height={screenArmLength * 2}
          fill={color}
          fillOpacity={opacity}
          stroke={color}
          strokeOpacity={Math.min(1, opacity + 0.3)}
          strokeWidth={2}
        />
        {/* 横の腕 */}
        <rect
          x={screenPos.x - screenArmLength}
          y={screenPos.y - screenArmWidth / 2}
          width={screenArmLength * 2}
          height={screenArmWidth}
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
