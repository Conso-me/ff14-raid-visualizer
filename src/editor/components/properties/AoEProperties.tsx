import React from 'react';
import type { AoE, AoEType } from '../../../data/types';
import { PositionInput } from './inputs/PositionInput';
import { NumberInput } from './inputs/NumberInput';
import { ColorInput } from './inputs/ColorInput';
import { SelectInput } from './inputs/SelectInput';

interface AoEPropertiesProps {
  aoe: AoE;
  onUpdate: (updates: Partial<AoE>) => void;
  onDelete: () => void;
}

const AOE_TYPE_OPTIONS = [
  { value: 'circle', label: 'Circle' },
  { value: 'donut', label: 'Donut' },
  { value: 'cone', label: 'Cone' },
  { value: 'line', label: 'Line' },
  { value: 'cross', label: 'Cross' },
];

export function AoEProperties({ aoe, onUpdate, onDelete }: AoEPropertiesProps) {
  const renderTypeSpecificProps = () => {
    switch (aoe.type) {
      case 'circle':
        return (
          <NumberInput
            label="Radius"
            value={aoe.radius || 5}
            onChange={(value) => onUpdate({ radius: value })}
            min={0.5}
            max={40}
            step={0.5}
          />
        );

      case 'donut':
        return (
          <>
            <NumberInput
              label="Inner Radius"
              value={aoe.innerRadius || 3}
              onChange={(value) => onUpdate({ innerRadius: value })}
              min={0.5}
              max={40}
              step={0.5}
            />
            <NumberInput
              label="Outer Radius"
              value={aoe.outerRadius || 8}
              onChange={(value) => onUpdate({ outerRadius: value })}
              min={1}
              max={40}
              step={0.5}
            />
          </>
        );

      case 'cone':
        return (
          <>
            <NumberInput
              label="Angle (degrees)"
              value={aoe.angle || 90}
              onChange={(value) => onUpdate({ angle: value })}
              min={10}
              max={360}
              step={5}
            />
            <NumberInput
              label="Direction (degrees)"
              value={aoe.direction || 0}
              onChange={(value) => onUpdate({ direction: value })}
              min={0}
              max={360}
              step={5}
            />
            <NumberInput
              label="Length"
              value={aoe.length || 10}
              onChange={(value) => onUpdate({ length: value })}
              min={1}
              max={40}
              step={0.5}
            />
          </>
        );

      case 'line':
        return (
          <>
            <NumberInput
              label="Width"
              value={aoe.width || 4}
              onChange={(value) => onUpdate({ width: value })}
              min={0.5}
              max={20}
              step={0.5}
            />
            <NumberInput
              label="Length"
              value={aoe.length || 40}
              onChange={(value) => onUpdate({ length: value })}
              min={1}
              max={80}
              step={1}
            />
            <NumberInput
              label="Rotation (degrees)"
              value={aoe.rotation || 0}
              onChange={(value) => onUpdate({ rotation: value })}
              min={0}
              max={360}
              step={5}
            />
          </>
        );

      case 'cross':
        return (
          <>
            <NumberInput
              label="Arm Width"
              value={aoe.armWidth || 4}
              onChange={(value) => onUpdate({ armWidth: value })}
              min={0.5}
              max={20}
              step={0.5}
            />
            <NumberInput
              label="Arm Length"
              value={aoe.armLength || 40}
              onChange={(value) => onUpdate({ armLength: value })}
              min={1}
              max={80}
              step={1}
            />
            <NumberInput
              label="Rotation (degrees)"
              value={aoe.rotation || 0}
              onChange={(value) => onUpdate({ rotation: value })}
              min={0}
              max={360}
              step={5}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: '#fff', borderBottom: '1px solid #3a3a5a', paddingBottom: '8px' }}>
        AoE: {aoe.type}
      </h3>

      <SelectInput
        label="Type"
        value={aoe.type}
        onChange={(value) => onUpdate({ type: value as AoEType })}
        options={AOE_TYPE_OPTIONS}
      />

      <PositionInput
        label="Position"
        value={aoe.position}
        onChange={(value) => onUpdate({ position: value })}
      />

      <ColorInput
        label="Color"
        value={aoe.color || '#ff6600'}
        onChange={(value) => onUpdate({ color: value })}
      />

      <NumberInput
        label="Opacity"
        value={aoe.opacity || 0.5}
        onChange={(value) => onUpdate({ opacity: value })}
        min={0.1}
        max={1}
        step={0.1}
      />

      <div style={{ marginTop: '16px', borderTop: '1px solid #3a3a5a', paddingTop: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
          Type-specific Properties
        </label>
        {renderTypeSpecificProps()}
      </div>

      <button
        onClick={onDelete}
        style={{
          marginTop: '16px',
          width: '100%',
          padding: '8px',
          background: '#c73737',
          border: 'none',
          borderRadius: '4px',
          color: '#fff',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        Delete AoE
      </button>
    </div>
  );
}
