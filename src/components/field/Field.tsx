import React from 'react';
import { FIELD_DEFAULTS } from '../../data/constants';

interface FieldProps {
  type?: 'circle' | 'square' | 'polygon';
  size?: number; // ゲーム内サイズ（デフォルト: 40）
  screenSize?: number; // 画面上のピクセルサイズ（デフォルト: 800）
  backgroundColor?: string;
  gridEnabled?: boolean;
  children?: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  type = 'circle',
  size = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
  backgroundColor = FIELD_DEFAULTS.backgroundColor,
  gridEnabled = true,
  children,
}) => {
  const halfSize = screenSize / 2;
  const gridLines = [];

  if (gridEnabled) {
    // 同心円（5マスごと）
    const circleRadii = [5, 10, 15, 20].map((r) => (r / (size / 2)) * halfSize);
    for (const radius of circleRadii) {
      gridLines.push(
        <circle
          key={`grid-circle-${radius}`}
          cx={halfSize}
          cy={halfSize}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
        />
      );
    }

    // 十字線
    gridLines.push(
      <line
        key="grid-vertical"
        x1={halfSize}
        y1={0}
        x2={halfSize}
        y2={screenSize}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />,
      <line
        key="grid-horizontal"
        x1={0}
        y1={halfSize}
        x2={screenSize}
        y2={halfSize}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />
    );

    // 斜め線
    gridLines.push(
      <line
        key="grid-diagonal-1"
        x1={0}
        y1={0}
        x2={screenSize}
        y2={screenSize}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
      />,
      <line
        key="grid-diagonal-2"
        x1={screenSize}
        y1={0}
        x2={0}
        y2={screenSize}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
      />
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: screenSize,
        height: screenSize,
      }}
    >
      <svg
        width={screenSize}
        height={screenSize}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {type === 'circle' ? (
          <circle
            cx={halfSize}
            cy={halfSize}
            r={halfSize}
            fill={backgroundColor}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={2}
          />
        ) : (
          <rect
            x={0}
            y={0}
            width={screenSize}
            height={screenSize}
            fill={backgroundColor}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={2}
          />
        )}
        {gridLines}
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: screenSize,
          height: screenSize,
        }}
      >
        {children}
      </div>
    </div>
  );
};
