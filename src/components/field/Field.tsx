import React from 'react';
import { FIELD_DEFAULTS } from '../../data/constants';

interface FieldProps {
  type?: 'circle' | 'square' | 'rectangle';
  size?: number; // ゲーム内サイズ（デフォルト: 40）
  width?: number; // rectangle用 - ゲーム内幅
  height?: number; // rectangle用 - ゲーム内高さ
  screenSize?: number; // 画面上のピクセルサイズ（デフォルト: 800）
  backgroundColor?: string;
  gridEnabled?: boolean;
  backgroundImage?: string; // Base64画像データ
  backgroundOpacity?: number; // 0-1
  prevBackgroundImage?: string; // クロスフェード中の前画像
  prevBackgroundOpacity?: number; // クロスフェード中の前画像opacity
  children?: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  type = 'circle',
  size = FIELD_DEFAULTS.gameSize,
  width,
  height,
  screenSize = FIELD_DEFAULTS.screenSize,
  backgroundColor = FIELD_DEFAULTS.backgroundColor,
  gridEnabled = true,
  backgroundImage,
  backgroundOpacity = 0.5,
  prevBackgroundImage,
  prevBackgroundOpacity,
  children,
}) => {
  const halfSize = screenSize / 2;

  // For rectangle type, calculate aspect ratio
  const fieldWidth = type === 'rectangle' && width ? width : size;
  const fieldHeight = type === 'rectangle' && height ? height : size;
  const aspectRatio = fieldWidth / fieldHeight;

  // Calculate screen dimensions for rectangle
  let screenWidth = screenSize;
  let screenHeight = screenSize;
  if (type === 'rectangle') {
    if (aspectRatio > 1) {
      screenHeight = screenSize / aspectRatio;
    } else {
      screenWidth = screenSize * aspectRatio;
    }
  }

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

  // Render field shape
  const renderFieldShape = () => {
    switch (type) {
      case 'circle':
        return (
          <circle
            cx={halfSize}
            cy={halfSize}
            r={halfSize}
            fill={backgroundColor}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={2}
          />
        );
      case 'rectangle':
        return (
          <rect
            x={(screenSize - screenWidth) / 2}
            y={(screenSize - screenHeight) / 2}
            width={screenWidth}
            height={screenHeight}
            fill={backgroundColor}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={2}
          />
        );
      case 'square':
      default:
        return (
          <rect
            x={0}
            y={0}
            width={screenSize}
            height={screenSize}
            fill={backgroundColor}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={2}
          />
        );
    }
  };

  // Render background image with clip path
  const clipId = React.useId();
  const renderBackgroundImage = () => {
    if (!backgroundImage && !prevBackgroundImage) return null;

    const clipPathId = `field-clip-${clipId}`;
    const imgX = type === 'rectangle' ? (screenSize - screenWidth) / 2 : 0;
    const imgY = type === 'rectangle' ? (screenSize - screenHeight) / 2 : 0;
    const imgW = type === 'rectangle' ? screenWidth : screenSize;
    const imgH = type === 'rectangle' ? screenHeight : screenSize;

    return (
      <>
        <defs>
          <clipPath id={clipPathId}>
            {type === 'circle' ? (
              <circle cx={halfSize} cy={halfSize} r={halfSize} />
            ) : type === 'rectangle' ? (
              <rect
                x={(screenSize - screenWidth) / 2}
                y={(screenSize - screenHeight) / 2}
                width={screenWidth}
                height={screenHeight}
              />
            ) : (
              <rect x={0} y={0} width={screenSize} height={screenSize} />
            )}
          </clipPath>
        </defs>
        {/* 前画像（クロスフェード中のフェードアウト側） */}
        {prevBackgroundImage && prevBackgroundOpacity != null && prevBackgroundOpacity > 0 && (
          <image
            href={prevBackgroundImage}
            x={imgX}
            y={imgY}
            width={imgW}
            height={imgH}
            opacity={prevBackgroundOpacity}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipPathId})`}
          />
        )}
        {/* 現在画像 */}
        {backgroundImage && (
          <image
            href={backgroundImage}
            x={imgX}
            y={imgY}
            width={imgW}
            height={imgH}
            opacity={backgroundOpacity}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipPathId})`}
          />
        )}
      </>
    );
  };

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
        {renderFieldShape()}
        {renderBackgroundImage()}
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
