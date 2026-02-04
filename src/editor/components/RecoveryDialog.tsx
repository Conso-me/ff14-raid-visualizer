import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface RecoveryDialogProps {
  onRecover: () => void;
  onDiscard: () => void;
}

export function RecoveryDialog({ onRecover, onDiscard }: RecoveryDialogProps) {
  const { t } = useLanguage();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '8px',
          border: '1px solid #3a3a5a',
          padding: '24px',
          width: '400px',
          maxWidth: '90vw',
        }}
      >
        <h2
          style={{
            margin: '0 0 16px',
            color: '#fff',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '24px' }}>📁</span>
          {t('recovery.title')}
        </h2>

        <p
          style={{
            color: '#aaa',
            fontSize: '13px',
            margin: '0 0 24px',
            lineHeight: '1.6',
          }}
        >
          {t('recovery.description')}
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
          }}
        >
          <button
            onClick={onDiscard}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3a3a5a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2a2a4a';
            }}
          >
            {t('recovery.discard')}
          </button>
          <button
            onClick={onRecover}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: '#3753c7',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4a66d7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#3753c7';
            }}
          >
            {t('recovery.recover')}
          </button>
        </div>
      </div>
    </div>
  );
}
