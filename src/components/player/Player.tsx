import React from 'react';
import { Position, Role, Debuff } from '../../data/types';
import { ROLE_COLORS, FIELD_DEFAULTS } from '../../data/constants';
import { gameToScreen } from '../../utils/coordinates';
import { DebuffList } from '../debuff/DebuffList';
import { FONT_FAMILY } from '../../utils/font';

interface PlayerProps {
  role: Role;
  position: Position;
  name?: string;
  debuffs?: Debuff[];
  currentFrame?: number;
  fps?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const Player: React.FC<PlayerProps> = ({
  role,
  position,
  name,
  debuffs = [],
  currentFrame = 0,
  fps = 30,
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
      }}
    >
      {/* デバフ表示（プレイヤーアイコンの上） */}
      {debuffs.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: size + 4,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <DebuffList debuffs={debuffs} currentFrame={currentFrame} fps={fps} />
        </div>
      )}
      {/* プレイヤーアイコン */}
      <div
        style={{
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
            fontFamily: FONT_FAMILY,
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {role}
        </span>
      </div>
      {/* 名前表示 */}
      {name && (
        <div
          style={{
            position: 'absolute',
            top: size + 2,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontSize: '10px',
            fontFamily: FONT_FAMILY,
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
