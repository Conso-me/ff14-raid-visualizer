import React from 'react';
import { Position, MarkerType } from '../../data/types';
import { MARKER_COLORS, FIELD_DEFAULTS } from '../../data/constants';
import { gameToScreen } from '../../utils/coordinates';

interface FieldMarkerProps {
  type: MarkerType;
  position: Position;
  fieldSize?: number;
  screenSize?: number;
}

export const FieldMarker: React.FC<FieldMarkerProps> = ({
  type,
  position,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const color = MARKER_COLORS[type];
  const size = 24;
  const isLetter = ['A', 'B', 'C', 'D'].includes(type);

  return (
    <div
      style={{
        position: 'absolute',
        left: screenPos.x - size / 2,
        top: screenPos.y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: isLetter ? color : 'transparent',
        border: isLetter ? 'none' : `3px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isLetter ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      <span
        style={{
          color: isLetter ? 'white' : color,
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          textShadow: isLetter ? '0 1px 2px rgba(0,0,0,0.8)' : 'none',
        }}
      >
        {type}
      </span>
    </div>
  );
};
