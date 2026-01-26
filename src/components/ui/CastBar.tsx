import React from 'react';
import { FONT_FAMILY } from '../../utils/font';

interface CastBarProps {
  skillName: string;
  progress: number; // 0-1
  casterName?: string;
}

export const CastBar: React.FC<CastBarProps> = ({
  skillName,
  progress,
  casterName,
}) => {
  const barWidth = 400;
  const barHeight = 24;
  const filledWidth = barWidth * progress;
  const percentage = Math.round(progress * 100);

  return (
    <div
      style={{
        position: 'absolute',
        top: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        pointerEvents: 'none',
        zIndex: 90,
      }}
    >
      {/* キャスター名（オプション） */}
      {casterName && (
        <span
          style={{
            color: '#ffcc00',
            fontSize: 14,
            fontFamily: FONT_FAMILY,
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {casterName}
        </span>
      )}

      {/* 詠唱バー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '8px 16px',
          borderRadius: 4,
        }}
      >
        {/* スキル名 */}
        <span
          style={{
            color: '#ff6600',
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: FONT_FAMILY,
            minWidth: 120,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {skillName}
        </span>

        {/* プログレスバー */}
        <div
          style={{
            width: barWidth,
            height: barHeight,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: filledWidth,
              height: '100%',
              backgroundColor: '#ff6600',
              borderRadius: 4,
              transition: 'width 0.05s linear',
            }}
          />
          {/* グラデーションオーバーレイ */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background:
                'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
              borderRadius: '4px 4px 0 0',
            }}
          />
        </div>

        {/* パーセンテージ */}
        <span
          style={{
            color: 'white',
            fontSize: 16,
            fontFamily: FONT_FAMILY,
            minWidth: 50,
            textAlign: 'right',
          }}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
};
