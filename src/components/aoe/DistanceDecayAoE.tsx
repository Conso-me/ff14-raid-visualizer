import React from 'react';
import { Position } from '../../data/types';
import { AOE_DEFAULTS, FIELD_DEFAULTS } from '../../data/constants';
import { gameToScreen } from '../../utils/coordinates';

interface DistanceDecayAoEProps {
  position: Position; // 頂点（起点）
  direction: number; // 向き（度、北=0、時計回り）
  length: number; // 頂点→底辺の距離
  width: number; // 底辺の幅
  color?: string;
  opacity?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const DistanceDecayAoE: React.FC<DistanceDecayAoEProps> = ({
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

  // 北=0、時計回りを数学角度に変換
  const rad = ((direction - 90) * Math.PI) / 180;
  const cosD = Math.cos(rad);
  const sinD = Math.sin(rad);

  // 頂点
  const tipX = screenPos.x;
  const tipY = screenPos.y;

  // 底辺の中心（頂点から direction 方向に length 離れた位置）
  const baseCX = tipX + screenLength * cosD;
  const baseCY = tipY + screenLength * sinD;

  // direction に垂直な方向（左右）
  const perpX = -sinD;
  const perpY = cosD;

  // 底辺の左右端
  const baseLeftX = baseCX - (screenWidth / 2) * perpX;
  const baseLeftY = baseCY - (screenWidth / 2) * perpY;
  const baseRightX = baseCX + (screenWidth / 2) * perpX;
  const baseRightY = baseCY + (screenWidth / 2) * perpY;

  const pathD = `M ${tipX} ${tipY} L ${baseLeftX} ${baseLeftY} L ${baseRightX} ${baseRightY} Z`;

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
      <path
        d={pathD}
        fill={color}
        fillOpacity={opacity * 0.3}
        stroke={color}
        strokeOpacity={Math.min(1, opacity + 0.3)}
        strokeWidth={2}
      />
    </svg>
  );
};
