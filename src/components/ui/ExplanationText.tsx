import React from 'react';
import { FONT_FAMILY } from '../../utils/font';

interface ExplanationTextProps {
  text: string;
  position: 'top' | 'bottom' | 'center';
  opacity?: number;
}

export const ExplanationText: React.FC<ExplanationTextProps> = ({
  text,
  position,
  opacity = 1,
}) => {
  const positionStyles: React.CSSProperties = {
    position: 'absolute',
  };

  if (position === 'top') {
    positionStyles.top = 50;
    positionStyles.left = '50%';
    positionStyles.transform = 'translateX(-50%)';
  } else if (position === 'bottom') {
    positionStyles.bottom = 120; // タイムラインバーの上
    positionStyles.left = '50%';
    positionStyles.transform = 'translateX(-50%)';
  } else {
    // center position - aligned to left side (next to timeline overlay)
    positionStyles.top = '50%';
    positionStyles.left = 220; // 200px overlay + 20px margin
    positionStyles.transform = 'translateY(-50%)';
  }

  return (
    <div
      style={{
        ...positionStyles,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        padding: '16px 32px',
        borderRadius: 8,
        opacity,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      <span
        style={{
          color: 'white',
          fontSize: 28,
          fontWeight: 'bold',
          fontFamily: FONT_FAMILY,
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </div>
  );
};
