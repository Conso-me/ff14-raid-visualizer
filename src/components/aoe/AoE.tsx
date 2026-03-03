import React from 'react';
import { AoE as AoEType } from '../../data/types';
import { CircleAoE } from './CircleAoE';
import { ConeAoE } from './ConeAoE';
import { LineAoE } from './LineAoE';
import { DonutAoE } from './DonutAoE';
import { CrossAoE } from './CrossAoE';
import { DistanceDecayAoE } from './DistanceDecayAoE';
import { RectangleAoE } from './RectangleAoE';
import { IndicatorOverlay } from './IndicatorOverlay';
import { FIELD_DEFAULTS } from '../../data/constants';

interface AoEProps extends Omit<AoEType, 'id'> {
  indicatorCount?: number;
  fieldSize?: number;
  screenSize?: number;
}

export const AoE: React.FC<AoEProps> = ({
  type,
  position,
  color,
  opacity,
  radius,
  innerRadius,
  outerRadius,
  angle,
  direction,
  length,
  width,
  armWidth,
  armLength,
  rotation,
  rectWidth,
  rectHeight,
  indicator,
  indicatorCount,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const commonProps = {
    position,
    color,
    opacity,
    fieldSize,
    screenSize,
  };

  let baseShape: React.ReactElement | null = null;

  switch (type) {
    case 'circle':
      baseShape = <CircleAoE {...commonProps} radius={radius ?? 5} />;
      break;
    case 'cone':
      baseShape = (
        <ConeAoE
          {...commonProps}
          angle={angle ?? 90}
          direction={direction ?? 0}
          length={length ?? 10}
        />
      );
      break;
    case 'line':
      baseShape = (
        <LineAoE
          {...commonProps}
          direction={direction ?? 0}
          length={length ?? 20}
          width={width ?? 4}
        />
      );
      break;
    case 'donut':
      baseShape = (
        <DonutAoE
          {...commonProps}
          innerRadius={innerRadius ?? 5}
          outerRadius={outerRadius ?? 15}
        />
      );
      break;
    case 'cross':
      baseShape = (
        <CrossAoE
          {...commonProps}
          armWidth={armWidth ?? 4}
          armLength={armLength ?? 20}
          rotation={rotation}
        />
      );
      break;
    case 'distance_decay':
      baseShape = (
        <DistanceDecayAoE
          {...commonProps}
          direction={direction ?? 0}
          length={length ?? 20}
          width={width ?? 15}
        />
      );
      break;
    case 'rectangle':
      baseShape = (
        <RectangleAoE
          {...commonProps}
          rectWidth={rectWidth ?? 8}
          rectHeight={rectHeight ?? 20}
          rotation={rotation}
        />
      );
      break;
    default:
      return null;
  }

  if (indicator && (type === 'circle' || type === 'line' || type === 'rectangle')) {
    return (
      <>
        {baseShape}
        <IndicatorOverlay
          position={position}
          baseType={type}
          indicator={indicator}
          indicatorCount={indicatorCount}
          radius={radius}
          width={width}
          length={length}
          direction={direction}
          rectWidth={rectWidth}
          rectHeight={rectHeight}
          rotation={rotation}
          fieldSize={fieldSize}
          screenSize={screenSize}
        />
      </>
    );
  }

  return baseShape;
};
