import React from 'react';
import type { Enemy } from '../../../data/types';
import { PositionInput } from './inputs/PositionInput';
import { NumberInput } from './inputs/NumberInput';
import { ColorInput } from './inputs/ColorInput';
import { TextInput } from './inputs/TextInput';

interface EnemyPropertiesProps {
  enemy: Enemy;
  onUpdate: (updates: Partial<Enemy>) => void;
  onDelete: () => void;
}

export function EnemyProperties({ enemy, onUpdate, onDelete }: EnemyPropertiesProps) {
  return (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: '#fff', borderBottom: '1px solid #3a3a5a', paddingBottom: '8px' }}>
        Enemy: {enemy.name}
      </h3>

      <TextInput
        label="Name"
        value={enemy.name}
        onChange={(value) => onUpdate({ name: value })}
        placeholder="Enemy name"
      />

      <PositionInput
        label="Position"
        value={enemy.position}
        onChange={(value) => onUpdate({ position: value })}
      />

      <NumberInput
        label="Size"
        value={enemy.size || 3}
        onChange={(value) => onUpdate({ size: value })}
        min={1}
        max={20}
        step={0.5}
      />

      <ColorInput
        label="Color"
        value={enemy.color || '#ff0000'}
        onChange={(value) => onUpdate({ color: value })}
      />

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
        Delete Enemy
      </button>
    </div>
  );
}
