import React, { useState, useEffect } from 'react';
import type { Position, TextAnnotation } from '../../data/types';
import type { TextSettings } from '../context/editorReducer';
import { useLanguage } from '../context/LanguageContext';

interface TextAnnotationDialogProps {
  isOpen: boolean;
  position: Position;
  currentFrame: number;
  fps: number;
  onConfirm: (settings: TextSettings) => void;
  onCancel: () => void;
}

const FONT_SIZES = [12, 14, 16, 18, 24, 32];

export function TextAnnotationDialog({
  isOpen,
  position,
  currentFrame,
  fps,
  onConfirm,
  onCancel,
}: TextAnnotationDialogProps) {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [color, setColor] = useState('#ffffff');
  const [hasBackground, setHasBackground] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');
  const [startFrame, setStartFrame] = useState(currentFrame);
  const [endFrame, setEndFrame] = useState(currentFrame + 90);

  // Reset start frame when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStartFrame(currentFrame);
      setEndFrame(currentFrame + 90);
    }
  }, [isOpen, currentFrame]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!text.trim()) {
      alert(t('textDialog.textRequired'));
      return;
    }

    const annotation: TextAnnotation = {
      id: `text-${Date.now()}`,
      text,
      position,
      fontSize,
      color,
      backgroundColor: hasBackground ? backgroundColor : undefined,
      align,
    };

    onConfirm({
      annotation,
      startFrame,
      endFrame,
    });
  };

  const inputStyle = {
    width: '100%',
    marginTop: '4px',
    padding: '6px 8px',
    background: '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '13px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    color: '#888',
    marginBottom: '8px',
  };

  const sectionTitleStyle = {
    fontSize: '13px',
    fontWeight: 'bold' as const,
    color: '#ccc',
    marginBottom: '8px',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
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
          padding: '24px',
          width: '420px',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid #3a3a5a',
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#fff' }}>
          {t('textDialog.title')}
        </h2>

        {/* Position (read-only) */}
        <div
          style={{
            padding: '8px 12px',
            background: '#2a2a4a',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          <label style={{ ...labelStyle, marginBottom: 0 }}>{t('common.position')}</label>
          <p style={{ margin: '4px 0 0', color: '#fff', fontSize: '13px' }}>
            X: {position.x.toFixed(1)}, Y: {position.y.toFixed(1)}
          </p>
        </div>

        {/* Text content */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('textDialog.textContent')}</div>
          <label style={labelStyle}>
            {t('textDialog.textLabel')}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('textDialog.textPlaceholder')}
              rows={3}
              style={{
                ...inputStyle,
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </label>
        </div>

        {/* Appearance settings */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('textDialog.appearance')}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={labelStyle}>
              {t('textDialog.fontSize')}
              <select
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                style={inputStyle}
              >
                {FONT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              {t('textDialog.textColor')}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ ...inputStyle, padding: '2px', height: '36px' }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={hasBackground}
                onChange={(e) => setHasBackground(e.target.checked)}
              />
              {t('textDialog.useBackground')}
            </label>

            {hasBackground && (
              <label style={labelStyle}>
                {t('textDialog.backgroundColor')}
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  style={{ ...inputStyle, padding: '2px', height: '36px' }}
                />
              </label>
            )}
          </div>

          <label style={{ ...labelStyle, marginTop: '8px' }}>
            {t('textDialog.alignment')}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {(['left', 'center', 'right'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAlign(a)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    background: align === a ? '#4a4a7a' : '#2a2a4a',
                    border: '1px solid #3a3a5a',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {a === 'left' ? t('textDialog.alignLeft') : a === 'center' ? t('textDialog.alignCenter') : t('textDialog.alignRight')}
                </button>
              ))}
            </div>
          </label>
        </div>

        {/* Timing settings */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('textDialog.timing')}</div>

          <label style={labelStyle}>
            {t('textDialog.startFrame')}
            <input
              type="number"
              value={startFrame}
              onChange={(e) => setStartFrame(parseInt(e.target.value) || 0)}
              min={0}
              step={1}
              style={inputStyle}
            />
          </label>
          <p style={{ fontSize: '11px', color: '#666', marginTop: '-4px', marginBottom: '8px' }}>
            {t('textDialog.startFrameDesc', { seconds: (startFrame / fps).toFixed(2) })}
          </p>

          <label style={labelStyle}>
            {t('textDialog.endFrame')}
            <input
              type="number"
              value={endFrame}
              onChange={(e) => setEndFrame(parseInt(e.target.value) || 0)}
              min={startFrame + 1}
              step={1}
              style={inputStyle}
            />
          </label>
          <p style={{ fontSize: '11px', color: '#666', marginTop: '-4px', marginBottom: '8px' }}>
            {t('textDialog.endFrameDesc', { endSeconds: (endFrame / fps).toFixed(2), durationSeconds: ((endFrame - startFrame) / fps).toFixed(2) })}
          </p>
        </div>

        {/* Preview */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('textDialog.preview')}</div>
          <div
            style={{
              padding: '16px',
              background: '#0a0a1a',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
            }}
          >
            <span
              style={{
                fontSize: `${fontSize}px`,
                color,
                backgroundColor: hasBackground ? backgroundColor : 'transparent',
                padding: hasBackground ? '4px 8px' : 0,
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {text || t('textDialog.sampleText')}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              background: '#3a3a5a',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '8px 16px',
              background: '#00aaff',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            {t('common.add')}
          </button>
        </div>
      </div>
    </div>
  );
}
