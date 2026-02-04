import React, { useEffect } from 'react';
import { SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import { useLanguage } from '../context/LanguageContext';

interface ShortcutHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutHelpDialog({ isOpen, onClose }: ShortcutHelpDialogProps) {
  const { t } = useLanguage();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '8px',
          border: '1px solid #3a3a5a',
          padding: '24px',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>
            {t('shortcuts.title')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SHORTCUTS.map((item, index) => {
            if ('divider' in item) {
              return (
                <div
                  key={`divider-${index}`}
                  style={{
                    height: '1px',
                    background: '#3a3a5a',
                    margin: '8px 0',
                  }}
                />
              );
            }

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                }}
              >
                <span style={{ color: '#888', fontSize: '13px' }}>
                  {t(item.descriptionKey as any)}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {item.keys.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      {keyIndex > 0 && (
                        <span style={{ color: '#555', fontSize: '12px' }}>+</span>
                      )}
                      <kbd
                        style={{
                          background: '#2a2a4a',
                          border: '1px solid #3a3a5a',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '12px',
                          color: '#fff',
                          minWidth: '24px',
                          textAlign: 'center',
                        }}
                      >
                        {key === 'arrows' ? t('shortcuts.arrowKeys') : key}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #3a3a5a',
            textAlign: 'center',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 24px',
              background: '#3753c7',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
