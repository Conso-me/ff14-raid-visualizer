import React from 'react';
import { Debuff } from '../../data/types';
import { animateBlink } from '../../utils/animation';

interface DebuffIconProps {
  debuff: Debuff;
  currentFrame: number;
  fps?: number;
}

export const DebuffIcon: React.FC<DebuffIconProps> = ({
  debuff,
  currentFrame,
  fps = 30,
}) => {
  const elapsedFrames = currentFrame - debuff.startFrame;
  const elapsedSeconds = elapsedFrames / fps;
  const remainingSeconds = Math.max(0, debuff.duration - elapsedSeconds);

  // 残り時間が1秒未満なら点滅
  const shouldBlink = remainingSeconds < 1 && remainingSeconds > 0;
  const blinkOpacity = shouldBlink
    ? animateBlink(currentFrame, debuff.startFrame, 6)
    : 1;

  // 期限切れの場合は表示しない
  if (remainingSeconds <= 0) {
    return null;
  }

  const size = 20;
  const backgroundColor = debuff.color || '#666666';

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size + 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: blinkOpacity,
      }}
    >
      {/* アイコン */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 4,
          backgroundColor: debuff.iconUrl ? 'transparent' : backgroundColor,
          backgroundImage: debuff.iconUrl ? `url(${debuff.iconUrl})` : 'none',
          backgroundSize: 'cover',
          border: '1px solid rgba(255,255,255,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }}
      >
        {!debuff.iconUrl && (
          <span
            style={{
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
            }}
          >
            {debuff.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      {/* 残り時間 */}
      <span
        style={{
          color: remainingSeconds < 1 ? '#ff6666' : 'white',
          fontSize: '9px',
          fontFamily: 'sans-serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          marginTop: 1,
        }}
      >
        {remainingSeconds.toFixed(1)}
      </span>
    </div>
  );
};
