import React from 'react';
import type { MechanicData } from '../../data/types';
import { sampleMechanics } from '../../data/sampleMechanics';

interface SampleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (mechanic: MechanicData) => void;
}

export function SampleDialog({ isOpen, onClose, onLoad }: SampleDialogProps) {
  if (!isOpen) return null;

  const handleSelect = (name: string, data: MechanicData) => {
    if (!confirm(`サンプルギミック「${name}」を読み込みますか？現在のデータは失われます。`)) {
      return;
    }
    onLoad(data);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '12px',
          padding: '24px',
          width: '480px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 style={{
          margin: '0 0 20px',
          fontSize: '18px',
          color: '#fff',
        }}>
          サンプルギミック
        </h2>

        {/* Sample list */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {sampleMechanics.map((entry) => (
            <div
              key={entry.id}
              onClick={() => handleSelect(entry.name, entry.data)}
              style={{
                padding: '14px 16px',
                background: '#2a2a4a',
                border: '1px solid #3a3a5a',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4a63d7';
                e.currentTarget.style.background = '#2e2e52';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#3a3a5a';
                e.currentTarget.style.background = '#2a2a4a';
              }}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#fff',
                marginBottom: '6px',
              }}>
                {entry.name}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#aaa',
                lineHeight: '1.5',
              }}>
                {entry.description}
              </div>
            </div>
          ))}
        </div>

        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 24px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
