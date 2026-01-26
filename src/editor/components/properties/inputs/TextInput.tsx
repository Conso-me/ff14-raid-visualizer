import React from 'react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}: TextInputProps) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
