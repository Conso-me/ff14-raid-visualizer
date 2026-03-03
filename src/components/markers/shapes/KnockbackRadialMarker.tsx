import React from 'react';
import type { Position } from '../../../data/types';
import { FIELD_DEFAULTS } from '../../../data/constants';
import { gameToScreen } from '../../../utils/coordinates';

interface KnockbackRadialMarkerProps {
  position: Position;
  size?: number;
  color?: string;
  opacity?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const KnockbackRadialMarker: React.FC<KnockbackRadialMarkerProps> = ({
  position,
  size = 3,
  color = '#ffaa00',
  opacity = 0.9,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const scale = screenSize / fieldSize;
  const r = (size * scale) / 2;

  const centerR = r * 0.2;
  const arrowDist1 = r * 0.5;
  const arrowDist2 = r * 0.75;
  const arrowSize = r * 0.15;

  // 8 directions
  const directions = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <svg
      width={screenSize}
      height={screenSize}
      style={{ position: 'absolute', top: 0, left: 0, width: screenSize, height: screenSize, pointerEvents: 'none' }}
    >
      <g opacity={opacity}>
        {/* Center circle */}
        <circle cx={screenPos.x} cy={screenPos.y} r={centerR}
          fill={color} stroke="#ffffff" strokeWidth={1} />
        {/* 8 directional chevron pairs */}
        {directions.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const perpRad = rad + Math.PI / 2;

          // Two small chevrons pointing outward
          return [arrowDist1, arrowDist2].map((dist, i) => {
            const cx = screenPos.x + dist * Math.cos(rad);
            const cy = screenPos.y + dist * Math.sin(rad);
            const tipX = cx + arrowSize * Math.cos(rad);
            const tipY = cy + arrowSize * Math.sin(rad);
            const leftX = cx - arrowSize * 0.5 * Math.cos(rad) + arrowSize * 0.4 * Math.cos(perpRad);
            const leftY = cy - arrowSize * 0.5 * Math.sin(rad) + arrowSize * 0.4 * Math.sin(perpRad);
            const rightX = cx - arrowSize * 0.5 * Math.cos(rad) - arrowSize * 0.4 * Math.cos(perpRad);
            const rightY = cy - arrowSize * 0.5 * Math.sin(rad) - arrowSize * 0.4 * Math.sin(perpRad);

            return (
              <polygon
                key={`${deg}-${i}`}
                points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`}
                fill={color}
                stroke="#ffffff"
                strokeWidth={0.5}
                fillOpacity={i === 0 ? 0.8 : 0.6}
              />
            );
          });
        })}
      </g>
    </svg>
  );
};
