import React from 'react';

interface TimelineBarProps {
  currentFrame: number;
  totalFrames: number;
  fps: number;
}

// フレームを時間文字列に変換
function formatTime(frames: number, fps: number): string {
  const totalSeconds = frames / fps;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, '0')}`;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  currentFrame,
  totalFrames,
  fps,
}) => {
  const progress = totalFrames > 0 ? currentFrame / totalFrames : 0;
  const barWidth = 600;
  const filledWidth = barWidth * progress;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '12px 24px',
        borderRadius: 8,
        pointerEvents: 'none',
        zIndex: 80,
      }}
    >
      {/* 現在時間 */}
      <span
        style={{
          color: 'white',
          fontSize: 16,
          fontFamily: 'monospace',
          minWidth: 60,
        }}
      >
        {formatTime(currentFrame, fps)}
      </span>

      {/* プログレスバー */}
      <div
        style={{
          width: barWidth,
          height: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* 背景の目盛り */}
        {[0.25, 0.5, 0.75].map((ratio) => (
          <div
            key={ratio}
            style={{
              position: 'absolute',
              left: `${ratio * 100}%`,
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            }}
          />
        ))}

        {/* 進捗バー */}
        <div
          style={{
            width: filledWidth,
            height: '100%',
            backgroundColor: '#4a9eff',
            borderRadius: 4,
          }}
        />

        {/* 現在位置のインジケーター */}
        <div
          style={{
            position: 'absolute',
            left: filledWidth - 2,
            top: -2,
            width: 4,
            height: 12,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 0 4px rgba(0,0,0,0.5)',
          }}
        />
      </div>

      {/* 総時間 */}
      <span
        style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 16,
          fontFamily: 'monospace',
          minWidth: 60,
        }}
      >
        {formatTime(totalFrames, fps)}
      </span>
    </div>
  );
};
