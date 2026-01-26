import React from 'react';
import type { Position } from '../../../../data/types';

interface PositionInputProps {
  label: string;
  value: Position;
  onChange: (value: Position) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function PositionInput({
  label,
  value,
  onChange,
  min = -20,
  max = 20,
  step = 0.5,
}: PositionInputProps) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '10px', color: '#888' }}>X</label>
          <input
            type="number"
            value={value.x}
            onChange={(e) => onChange({ ...value, x: parseFloat(e.target.value) || 0 })}
            min={min}
            max={max}
            step={step}
            style={{
              width: '100%',
              padding: '6px 8px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '13px',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '10px', color: '#888' }}>Y</label>
          <input
            type="number"
            value={value.y}
            onChange={(e) => onChange({ ...value, y: parseFloat(e.target.value) || 0 })}
            min={min}
            max={max}
            step={step}
            style={{
              width: '100%',
              padding: '6px 8px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '13px',
            }}
          />
        </div>
      </div>
    </div>
  );
}
