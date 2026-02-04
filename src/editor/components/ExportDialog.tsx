import React, { useState, useCallback } from 'react';
import type { MechanicData } from '../../data/types';
import { useLanguage } from '../context/LanguageContext';

interface ExportDialogProps {
  isOpen: boolean;
  mechanic: MechanicData;
  onClose: () => void;
}

type ExportFormat = 'pretty' | 'minified';

export function ExportDialog({ isOpen, mechanic, onClose }: ExportDialogProps) {
  const { t } = useLanguage();
  const [format, setFormat] = useState<ExportFormat>('pretty');
  const [filename, setFilename] = useState(mechanic.name || mechanic.id || 'mechanic');
  const [copied, setCopied] = useState(false);

  const getJson = useCallback(() => {
    if (format === 'pretty') {
      return JSON.stringify(mechanic, null, 2);
    }
    return JSON.stringify(mechanic);
  }, [mechanic, format]);

  const handleDownload = useCallback(() => {
    const json = getJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  }, [getJson, filename, onClose]);

  const handleCopyToClipboard = useCallback(async () => {
    const json = getJson();
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [getJson]);

  if (!isOpen) return null;

  const json = getJson();
  const sizeKB = (new Blob([json]).size / 1024).toFixed(1);

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
          width: '500px',
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
            {t('export.title')}
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

        {/* Filename input */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#888',
              marginBottom: '6px',
            }}
          >
            {t('export.filename')}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: '#2a2a4a',
                border: '1px solid #3a3a5a',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '14px',
              }}
            />
            <span style={{ color: '#888', fontSize: '14px' }}>.json</span>
          </div>
        </div>

        {/* Format selection */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#888',
              marginBottom: '6px',
            }}
          >
            {t('export.format')}
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFormat('pretty')}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: format === 'pretty' ? '#3753c7' : '#2a2a4a',
                border: '1px solid #3a3a5a',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {t('export.pretty')}
            </button>
            <button
              onClick={() => setFormat('minified')}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: format === 'minified' ? '#3753c7' : '#2a2a4a',
                border: '1px solid #3a3a5a',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {t('export.minified')}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <label style={{ fontSize: '12px', color: '#888' }}>
              {t('export.preview')}
            </label>
            <span style={{ fontSize: '11px', color: '#666' }}>
              {sizeKB} KB
            </span>
          </div>
          <pre
            style={{
              background: '#12121f',
              border: '1px solid #2a2a4a',
              borderRadius: '4px',
              padding: '12px',
              maxHeight: '200px',
              overflow: 'auto',
              fontSize: '11px',
              color: '#aaa',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {json.slice(0, 2000)}{json.length > 2000 ? `\n${t('export.truncated')}` : ''}
          </pre>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleCopyToClipboard}
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
            {copied ? t('export.copied') : t('export.copyClipboard')}
          </button>
          <button
            onClick={handleDownload}
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
            {t('export.download')}
          </button>
        </div>
      </div>
    </div>
  );
}
