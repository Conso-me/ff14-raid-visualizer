import React from 'react';
import { Position, Role } from '../../data/types';
import { ROLE_COLORS, FIELD_DEFAULTS } from '../../data/constants';
import { gameToScreen } from '../../utils/coordinates';

interface PlayerProps {
  role: Role;
  position: Position;
  name?: string;
  fieldSize?: number;
  screenSize?: number;
}

export const Player: React.FC<PlayerProps> = ({
  role,
  position,
  name,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const color = ROLE_COLORS[role];
  const size = 30;

  return (
    <div
      style={{
        position: 'absolute',
        left: screenPos.x - size / 2,
        top: screenPos.y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        border: '2px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
      }}
    >
      <span
        style={{
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        }}
      >
        {role}
      </span>
      {name && (
        <div
          style={{
            position: 'absolute',
            top: size + 2,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontSize: '10px',
            fontFamily: 'sans-serif',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {name}
        </div>
      )}
    </div>
  );
};
