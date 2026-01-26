import React from 'react';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '40px',
            height: '32px',
            padding: '0',
            border: '1px solid #3a3a5a',
            borderRadius: '4px',
            background: 'transparent',
            cursor: 'pointer',
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            padding: '6px 8px',
            background: '#2a2a4a',
            border: '1px solid #3a3a5a',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '13px',
            fontFamily: 'monospace',
          }}
        />
      </div>
    </div>
  );
}
