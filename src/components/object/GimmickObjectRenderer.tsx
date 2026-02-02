import React from 'react';
import { FIELD_DEFAULTS } from '../../data/constants';
import { gameToScreen } from '../../utils/coordinates';
import type { Position, GimmickObject } from '../../data/types';

interface GimmickObjectRendererProps {
  object: GimmickObject;
  fieldSize?: number;
  screenSize?: number;
}

export const GimmickObjectRenderer: React.FC<GimmickObjectRendererProps> = ({
  object,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(object.position, fieldSize, screenSize);
  const pixelSize = Math.max(20, (object.size / fieldSize) * screenSize);
  const strokeColor = object.color === '#000000' ? '#ffffff' : '#000000';
  const opacity = object.opacity ?? 1;

  const renderShape = () => {
    switch (object.shape) {
      case 'circle':
        return (
          <circle
            cx={screenPos.x}
            cy={screenPos.y}
            r={pixelSize / 2}
            fill={object.color}
            stroke={strokeColor}
            strokeWidth={2}
            opacity={opacity}
          />
        );
      case 'square':
        return (
          <rect
            x={screenPos.x - pixelSize / 2}
            y={screenPos.y - pixelSize / 2}
            width={pixelSize}
            height={pixelSize}
            fill={object.color}
            stroke={strokeColor}
            strokeWidth={2}
            opacity={opacity}
          />
        );
      case 'triangle': {
        const points = [
          `${screenPos.x},${screenPos.y - pixelSize / 2}`,
          `${screenPos.x + pixelSize / 2},${screenPos.y + pixelSize / 2}`,
          `${screenPos.x - pixelSize / 2},${screenPos.y + pixelSize / 2}`,
        ].join(' ');
        return (
          <polygon
            points={points}
            fill={object.color}
            stroke={strokeColor}
            strokeWidth={2}
            opacity={opacity}
          />
        );
      }
      case 'diamond': {
        const points = [
          `${screenPos.x},${screenPos.y - pixelSize / 2}`,
          `${screenPos.x + pixelSize / 2},${screenPos.y}`,
          `${screenPos.x},${screenPos.y + pixelSize / 2}`,
          `${screenPos.x - pixelSize / 2},${screenPos.y}`,
        ].join(' ');
        return (
          <polygon
            points={points}
            fill={object.color}
            stroke={strokeColor}
            strokeWidth={2}
            opacity={opacity}
          />
        );
      }
      default:
        return null;
    }
  };

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
        overflow: 'visible',
      }}
    >
      {renderShape()}
      {object.icon && (
        <text
          x={screenPos.x}
          y={screenPos.y}
          fontSize={pixelSize * 0.6}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
        >
          {object.icon}
        </text>
      )}
    </svg>
  );
};
