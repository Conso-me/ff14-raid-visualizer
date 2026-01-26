import React from 'react';
import type { FieldMarker, MarkerType } from '../../../data/types';
import { PositionInput } from './inputs/PositionInput';
import { SelectInput } from './inputs/SelectInput';

interface MarkerPropertiesProps {
  marker: FieldMarker;
  onUpdate: (updates: Partial<FieldMarker>) => void;
  onDelete: () => void;
}

const MARKER_OPTIONS = [
  { value: 'A', label: 'A (Red)' },
  { value: 'B', label: 'B (Yellow)' },
  { value: 'C', label: 'C (Blue)' },
  { value: 'D', label: 'D (Purple)' },
  { value: '1', label: '1 (Red)' },
  { value: '2', label: '2 (Yellow)' },
  { value: '3', label: '3 (Blue)' },
  { value: '4', label: '4 (Purple)' },
];

export function MarkerProperties({ marker, onUpdate, onDelete }: MarkerPropertiesProps) {
  return (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: '#fff', borderBottom: '1px solid #3a3a5a', paddingBottom: '8px' }}>
        Marker: {marker.type}
      </h3>

      <SelectInput
        label="Type"
        value={marker.type}
        onChange={(value) => onUpdate({ type: value as MarkerType })}
        options={MARKER_OPTIONS}
      />

      <PositionInput
        label="Position"
        value={marker.position}
        onChange={(value) => onUpdate({ position: value })}
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
        Delete Marker
      </button>
    </div>
  );
}
