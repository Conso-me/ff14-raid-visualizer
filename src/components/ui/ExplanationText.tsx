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
    left: '50%',
    transform:
      position === 'center'
        ? 'translate(-50%, -50%)'
        : 'translateX(-50%)',
  };

  if (position === 'top') {
    positionStyles.top = 50;
  } else if (position === 'bottom') {
    positionStyles.bottom = 120; // タイムラインバーの上
  } else {
    positionStyles.top = '50%';
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
