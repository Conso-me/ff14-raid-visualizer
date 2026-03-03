import React from 'react';
import type { MechanicMarker, MechanicMarkerType } from '../../../data/types';
import { PositionInput } from './inputs/PositionInput';
import { NumberInput } from './inputs/NumberInput';
import { ColorInput } from './inputs/ColorInput';
import { SelectInput } from './inputs/SelectInput';

interface MechanicMarkerPropertiesProps {
  marker: MechanicMarker;
  showFrame: number;
  hideFrame: number | null;
  fps: number;
  onUpdate: (updates: Partial<MechanicMarker>) => void;
  onDelete: () => void;
  onUpdateTiming: (showFrame: number, hideFrame: number | null) => void;
}

const MARKER_TYPE_OPTIONS: Array<{ value: MechanicMarkerType; label: string }> = [
  { value: 'eye', label: 'Eye' },
  { value: 'stack', label: 'Stack' },
  { value: 'stack_count', label: 'Stack Count' },
  { value: 'proximity', label: 'Proximity' },
  { value: 'tankbuster', label: 'Tankbuster' },
  { value: 'target', label: 'Target' },
  { value: 'chase', label: 'Chase' },
  { value: 'knockback_radial', label: 'Knockback (Radial)' },
  { value: 'knockback_line', label: 'Knockback (Line)' },
  { value: 'telegraph', label: 'Telegraph' },
];

export function MechanicMarkerProperties({
  marker,
  showFrame,
  hideFrame,
  fps,
  onUpdate,
  onDelete,
  onUpdateTiming,
}: MechanicMarkerPropertiesProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <SelectInput
        label="Type"
        value={marker.type}
        options={MARKER_TYPE_OPTIONS}
        onChange={(value) => onUpdate({ type: value as MechanicMarkerType })}
      />

      <PositionInput
        label="Position"
        value={marker.position}
        onChange={(position) => onUpdate({ position })}
      />

      <NumberInput
        label="Size"
        value={marker.size ?? 3}
        min={0.5}
        max={20}
        step={0.5}
        onChange={(size) => onUpdate({ size })}
      />

      <ColorInput
        label="Color"
        value={marker.color ?? '#ffcc00'}
        onChange={(color) => onUpdate({ color })}
      />

      <NumberInput
        label="Opacity"
        value={marker.opacity ?? 0.9}
        min={0}
        max={1}
        step={0.05}
        onChange={(opacity) => onUpdate({ opacity })}
      />

      <NumberInput
        label="Rotation"
        value={marker.rotation ?? 0}
        min={0}
        max={360}
        step={5}
        onChange={(rotation) => onUpdate({ rotation })}
      />

      {marker.type === 'stack_count' && (
        <NumberInput
          label="Count"
          value={marker.count ?? 2}
          min={1}
          max={4}
          step={1}
          onChange={(count) => onUpdate({ count })}
        />
      )}

      {/* Timing */}
      <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '12px' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Timing</div>
        <NumberInput
          label={`Show Frame (${(showFrame / fps).toFixed(1)}s)`}
          value={showFrame}
          min={0}
          step={1}
          onChange={(frame) => onUpdateTiming(frame, hideFrame)}
        />
        {hideFrame !== null && (
          <NumberInput
            label={`Hide Frame (${(hideFrame / fps).toFixed(1)}s)`}
            value={hideFrame}
            min={showFrame + 1}
            step={1}
            onChange={(frame) => onUpdateTiming(showFrame, frame)}
          />
        )}
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        style={{
          marginTop: '12px',
          padding: '8px',
          background: '#ff4444',
          border: 'none',
          borderRadius: '4px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        Delete
      </button>
    </div>
  );
}
