import React from 'react';
import type { TetherDisplay } from '../../data/types';
import { gameToScreen } from '../../utils/coordinates';

interface TetherLineProps {
  tether: TetherDisplay;
  fieldSize: number;
  screenSize: number;
}

function getStrokeDasharray(lineStyle: TetherDisplay['lineStyle']): string | undefined {
  switch (lineStyle) {
    case 'dashed':
      return '10,5';
    case 'dotted':
      return '3,3';
    case 'solid':
    default:
      return undefined;
  }
}

export const TetherLine: React.FC<TetherLineProps> = ({
  tether,
  fieldSize,
  screenSize,
}) => {
  const sourceScreen = gameToScreen(tether.sourcePosition, fieldSize, screenSize);
  const targetScreen = gameToScreen(tether.targetPosition, fieldSize, screenSize);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: screenSize,
        height: screenSize,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <line
        x1={sourceScreen.x}
        y1={sourceScreen.y}
        x2={targetScreen.x}
        y2={targetScreen.y}
        stroke={tether.currentColor}
        strokeWidth={tether.width ?? 2}
        strokeDasharray={getStrokeDasharray(tether.lineStyle)}
        opacity={tether.currentOpacity}
        strokeLinecap="round"
      />
    </svg>
  );
};
