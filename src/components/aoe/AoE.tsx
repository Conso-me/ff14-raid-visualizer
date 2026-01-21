import React from 'react';
import { AoE as AoEType, Position } from '../../data/types';
import { CircleAoE } from './CircleAoE';
import { ConeAoE } from './ConeAoE';
import { LineAoE } from './LineAoE';
import { DonutAoE } from './DonutAoE';
import { CrossAoE } from './CrossAoE';
import { FIELD_DEFAULTS } from '../../data/constants';

interface AoEProps extends Omit<AoEType, 'id'> {
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

  switch (type) {
    case 'circle':
      return <CircleAoE {...commonProps} radius={radius ?? 5} />;
    case 'cone':
      return (
        <ConeAoE
          {...commonProps}
          angle={angle ?? 90}
          direction={direction ?? 0}
          length={length ?? 10}
        />
      );
    case 'line':
      return (
        <LineAoE
          {...commonProps}
          direction={direction ?? 0}
          length={length ?? 20}
          width={width ?? 4}
        />
      );
    case 'donut':
      return (
        <DonutAoE
          {...commonProps}
          innerRadius={innerRadius ?? 5}
          outerRadius={outerRadius ?? 15}
        />
      );
    case 'cross':
      return (
        <CrossAoE
          {...commonProps}
          armWidth={armWidth ?? 4}
          armLength={armLength ?? 20}
          rotation={rotation}
        />
      );
    default:
      return null;
  }
};
