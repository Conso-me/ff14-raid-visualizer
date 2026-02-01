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
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 220,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: '14px 28px',
        borderRadius: 8,
        borderLeft: '4px solid #5a7aff',
        opacity,
        pointerEvents: 'none',
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
      }}
    >
      <span
        style={{
          color: '#ffffff',
          fontSize: 32,
          fontWeight: 'bold',
          fontFamily: FONT_FAMILY,
          textShadow: '0 2px 8px rgba(0,0,0,0.7)',
          whiteSpace: 'nowrap',
          letterSpacing: '0.5px',
        }}
      >
        {text}
      </span>
    </div>
  );
};
