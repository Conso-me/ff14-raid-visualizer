import React from 'react';
import { Position } from '../../data/types';
import { AOE_DEFAULTS, FIELD_DEFAULTS } from '../../data/constants';
import { gameToScreen } from '../../utils/coordinates';

interface DonutAoEProps {
  position: Position;
  innerRadius: number; // 内側半径（安全地帯）
  outerRadius: number; // 外側半径
  color?: string;
  opacity?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const DonutAoE: React.FC<DonutAoEProps> = ({
  position,
  innerRadius,
  outerRadius,
  color = AOE_DEFAULTS.color,
  opacity = AOE_DEFAULTS.opacity,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const scale = screenSize / fieldSize;
  const screenInnerRadius = innerRadius * scale;
  const screenOuterRadius = outerRadius * scale;

  // ドーナツ形状を作成するパス
  // 外側の円（時計回り）と内側の円（反時計回り）を組み合わせる
  const pathD = `
    M ${screenPos.x + screenOuterRadius} ${screenPos.y}
    A ${screenOuterRadius} ${screenOuterRadius} 0 1 1 ${screenPos.x - screenOuterRadius} ${screenPos.y}
    A ${screenOuterRadius} ${screenOuterRadius} 0 1 1 ${screenPos.x + screenOuterRadius} ${screenPos.y}
    M ${screenPos.x + screenInnerRadius} ${screenPos.y}
    A ${screenInnerRadius} ${screenInnerRadius} 0 1 0 ${screenPos.x - screenInnerRadius} ${screenPos.y}
    A ${screenInnerRadius} ${screenInnerRadius} 0 1 0 ${screenPos.x + screenInnerRadius} ${screenPos.y}
  `;

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
      <path
        d={pathD}
        fill={color}
        fillOpacity={opacity}
        fillRule="evenodd"
        stroke={color}
        strokeOpacity={Math.min(1, opacity + 0.3)}
        strokeWidth={2}
      />
    </svg>
  );
};
