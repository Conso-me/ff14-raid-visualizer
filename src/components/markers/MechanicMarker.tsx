import React from 'react';
import type { MechanicMarker as MechanicMarkerType } from '../../data/types';
import { FIELD_DEFAULTS } from '../../data/constants';
import { EyeMarker } from './shapes/EyeMarker';
import { StackMarker } from './shapes/StackMarker';
import { StackCountMarker } from './shapes/StackCountMarker';
import { ProximityMarker } from './shapes/ProximityMarker';
import { TankbusterMarker } from './shapes/TankbusterMarker';
import { TargetMarker } from './shapes/TargetMarker';
import { ChaseMarker } from './shapes/ChaseMarker';
import { KnockbackRadialMarker } from './shapes/KnockbackRadialMarker';
import { KnockbackLineMarker } from './shapes/KnockbackLineMarker';
import { TelegraphMarker } from './shapes/TelegraphMarker';

interface MechanicMarkerProps extends Omit<MechanicMarkerType, 'id'> {
  fieldSize?: number;
  screenSize?: number;
}

export const MechanicMarker: React.FC<MechanicMarkerProps> = ({
  type,
  position,
  size,
  color,
  opacity,
  rotation,
  count,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const commonProps = { position, size, color, opacity, fieldSize, screenSize };

  switch (type) {
    case 'eye':
      return <EyeMarker {...commonProps} rotation={rotation} />;
    case 'stack':
      return <StackMarker {...commonProps} rotation={rotation} />;
    case 'stack_count':
      return <StackCountMarker {...commonProps} count={count} />;
    case 'proximity':
      return <ProximityMarker {...commonProps} rotation={rotation} />;
    case 'tankbuster':
      return <TankbusterMarker {...commonProps} />;
    case 'target':
      return <TargetMarker {...commonProps} />;
    case 'chase':
      return <ChaseMarker {...commonProps} rotation={rotation} />;
    case 'knockback_radial':
      return <KnockbackRadialMarker {...commonProps} />;
    case 'knockback_line':
      return <KnockbackLineMarker {...commonProps} rotation={rotation} />;
    case 'telegraph':
      return <TelegraphMarker {...commonProps} />;
    default:
      return null;
  }
};
