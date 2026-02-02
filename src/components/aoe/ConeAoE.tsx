import React from 'react';
import { Position } from '../../data/types';
import { AOE_DEFAULTS, FIELD_DEFAULTS } from '../../data/constants';
import { gameToScreen } from '../../utils/coordinates';

interface ConeAoEProps {
  position: Position;
  angle: number; // 扇の角度（度）
  direction: number; // 扇の向き（度、北=0、時計回り）
  length: number; // 扇の半径
  color?: string;
  opacity?: number;
  fieldSize?: number;
  screenSize?: number;
}

/**
 * 扇形のパスを生成
 */
function createConeArcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  // 北=0、時計回りを、数学座標系（東=0、反時計回り）に変換
  // ゲーム: 北=0° → 数学: -90°
  const toMathAngle = (deg: number) => ((deg - 90) * Math.PI) / 180;

  const startAngle = toMathAngle(startAngleDeg);
  const endAngle = toMathAngle(endAngleDeg);

  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy + radius * Math.sin(endAngle);

  // 角度差が180度を超えるかどうか
  const angleDiff = endAngleDeg - startAngleDeg;
  const largeArcFlag = angleDiff > 180 ? 1 : 0;

  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
}

export const ConeAoE: React.FC<ConeAoEProps> = ({
  position,
  angle,
  direction,
  length,
  color = AOE_DEFAULTS.color,
  opacity = AOE_DEFAULTS.opacity,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const screenRadius = (length / fieldSize) * screenSize;

  // 扇の開始角度と終了角度
  const startAngle = direction - angle / 2;
  const endAngle = direction + angle / 2;

  const pathD = createConeArcPath(
    screenPos.x,
    screenPos.y,
    screenRadius,
    startAngle,
    endAngle
  );

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
        fillOpacity={opacity}
        stroke={color}
        strokeOpacity={Math.min(1, opacity + 0.3)}
        strokeWidth={2}
      />
    </svg>
  );
};
