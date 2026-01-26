import React from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
}: NumberInputProps) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '6px 8px',
          background: '#2a2a4a',
          border: '1px solid #3a3a5a',
          borderRadius: '4px',
          color: '#fff',
          fontSize: '13px',
          opacity: disabled ? 0.5 : 1,
        }}
      />
    </div>
  );
}
