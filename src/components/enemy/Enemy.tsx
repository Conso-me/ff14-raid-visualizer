import React from 'react';
import { Position } from '../../data/types';
import { FIELD_DEFAULTS } from '../../data/constants';
import { gameToScreen } from '../../utils/coordinates';
import { FONT_FAMILY } from '../../utils/font';

interface EnemyProps {
  name: string;
  position: Position;
  size?: number; // ゲーム内サイズ
  color?: string;
  fieldSize?: number;
  screenSize?: number;
}

export const Enemy: React.FC<EnemyProps> = ({
  name,
  position,
  size = 3,
  color = '#cc3333',
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const scale = screenSize / fieldSize;
  const displaySize = size * scale;

  return (
    <div
      style={{
        position: 'absolute',
        left: screenPos.x - displaySize / 2,
        top: screenPos.y - displaySize / 2,
        width: displaySize,
        height: displaySize,
      }}
    >
      {/* ボスのシンボル（ダイヤモンド形） */}
      <svg
        width={displaySize}
        height={displaySize}
        viewBox="0 0 100 100"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <polygon
          points="50,5 95,50 50,95 5,50"
          fill={color}
          stroke="white"
          strokeWidth={4}
        />
        <polygon
          points="50,20 80,50 50,80 20,50"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={2}
        />
      </svg>

      {/* ボス名 */}
      <div
        style={{
          position: 'absolute',
          top: displaySize + 4,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontSize: '12px',
          fontFamily: FONT_FAMILY,
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        }}
      >
        {name}
      </div>
    </div>
  );
};
