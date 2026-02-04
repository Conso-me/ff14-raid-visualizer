import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { MechanicData } from '../../data/types';
import { encodeMechanicToUrl } from '../utils/shareUrl';
import { useLanguage } from '../context/LanguageContext';

interface ShareDialogProps {
  isOpen: boolean;
  mechanic: MechanicData;
  onClose: () => void;
}

export function ShareDialog({ isOpen, mechanic, onClose }: ShareDialogProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Generate URL
  const { url, isLong, length } = useMemo(() => {
    if (!isOpen) return { url: '', isLong: false, length: 0 };
    return encodeMechanicToUrl(mechanic);
  }, [mechanic, isOpen]);

  // Reset copied state when dialog opens/closes
  useEffect(() => {
    setCopied(false);
  }, [isOpen]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const handleOpenInNewTab = useCallback(() => {
    window.open(url, '_blank');
  }, [url]);

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
          width: '550px',
          maxWidth: '90vw',
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
            {t('share.title')}
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

        {/* Info */}
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>
          {t('share.description')}
        </p>

        {/* Warning for long URLs */}
        {isLong && (
          <div
            style={{
              background: '#3d2e1a',
              border: '1px solid #b8860b',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#f0c040',
            }}
          >
            {t('share.urlTooLong', { size: (length / 1000).toFixed(1) })}
          </div>
        )}

        {/* URL display */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <label style={{ fontSize: '12px', color: '#888' }}>{t('share.shareUrl')}</label>
            <span style={{ fontSize: '11px', color: '#666' }}>
              {(length / 1000).toFixed(1)} KB
            </span>
          </div>
          <div
            style={{
              background: '#12121f',
              border: '1px solid #2a2a4a',
              borderRadius: '4px',
              padding: '12px',
              maxHeight: '120px',
              overflow: 'auto',
              fontSize: '11px',
              color: '#aaa',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
            }}
          >
            {url}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleOpenInNewTab}
            style={{
              padding: '8px 16px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {t('share.openNewTab')}
          </button>
          <button
            onClick={handleCopy}
            style={{
              padding: '8px 24px',
              background: copied ? '#2c9c3c' : '#3753c7',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              minWidth: '150px',
            }}
          >
            {copied ? t('share.copied') : t('share.copyUrl')}
          </button>
        </div>

        {/* Tips */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #2a2a4a',
            fontSize: '11px',
            color: '#666',
          }}
        >
          <strong style={{ color: '#888' }}>{t('share.tips')}</strong>
          <ul style={{ margin: '8px 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>{t('share.tip1')}</li>
            <li>{t('share.tip2')}</li>
            <li>{t('share.tip3')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
