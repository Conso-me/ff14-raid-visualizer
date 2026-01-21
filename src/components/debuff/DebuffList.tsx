import React from 'react';
import { Debuff } from '../../data/types';
import { DebuffIcon } from './DebuffIcon';

interface DebuffListProps {
  debuffs: Debuff[];
  currentFrame: number;
  fps?: number;
}

export const DebuffList: React.FC<DebuffListProps> = ({
  debuffs,
  currentFrame,
  fps = 30,
}) => {
  // アクティブなデバフのみをフィルタリング
  const activeDebuffs = debuffs.filter((debuff) => {
    const elapsedFrames = currentFrame - debuff.startFrame;
    const elapsedSeconds = elapsedFrames / fps;
    return elapsedSeconds < debuff.duration && elapsedSeconds >= 0;
  });

  if (activeDebuffs.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
      }}
    >
      {activeDebuffs.map((debuff) => (
        <DebuffIcon
          key={debuff.id}
          debuff={debuff}
          currentFrame={currentFrame}
          fps={fps}
        />
      ))}
    </div>
  );
};
