import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

export interface FieldChangeSettings {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  startFrame: number;
  endFrame?: number;
  fadeInDuration: number;
  fadeOutDuration: number;
}

interface FieldChangeDialogProps {
  isOpen: boolean;
  currentFrame: number;
  fps: number;
  onConfirm: (settings: FieldChangeSettings) => void;
  onCancel: () => void;
}

export function FieldChangeDialog({
  isOpen,
  currentFrame,
  fps,
  onConfirm,
  onCancel,
}: FieldChangeDialogProps) {
  const { t } = useLanguage();

  const [backgroundColor, setBackgroundColor] = useState('#1a1a3e');
  const [changeBackgroundColor, setChangeBackgroundColor] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.5);
  const [changeOpacity, setChangeOpacity] = useState(false);
  const [startFrame, setStartFrame] = useState(currentFrame);
  const [hasEndFrame, setHasEndFrame] = useState(true);
  const [endFrame, setEndFrame] = useState(currentFrame + 90);
  const [fadeInDuration, setFadeInDuration] = useState(0);
  const [fadeOutDuration, setFadeOutDuration] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStartFrame(currentFrame);
      setEndFrame(currentFrame + 90);
      setBackgroundColor('#1a1a3e');
      setChangeBackgroundColor(false);
      setBackgroundImage(undefined);
      setBackgroundOpacity(0.5);
      setChangeOpacity(false);
      setHasEndFrame(true);
      setFadeInDuration(0);
      setFadeOutDuration(0);
    }
  }, [isOpen, currentFrame]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBackgroundImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  if (!isOpen) return null;

  const hasAnyChange = changeBackgroundColor || backgroundImage !== undefined || changeOpacity;

  const handleConfirm = () => {
    if (!hasAnyChange) return;
    onConfirm({
      ...(changeBackgroundColor && { backgroundColor }),
      ...(backgroundImage !== undefined && { backgroundImage }),
      ...(changeOpacity && { backgroundOpacity }),
      startFrame,
      endFrame: hasEndFrame ? endFrame : undefined,
      fadeInDuration,
      fadeOutDuration,
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
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block' as const,
    fontSize: '12px',
    color: '#888',
    marginBottom: '12px',
  };

  const sectionStyle = {
    fontSize: '13px',
    color: '#aaa',
    fontWeight: 'bold' as const,
    marginBottom: '8px',
    marginTop: '16px',
    borderBottom: '1px solid #3a3a5a',
    paddingBottom: '4px',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
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
        <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#fff' }}>
          {t('fieldChangeDialog.title')}
        </h2>

        {/* Background Image */}
        <div style={sectionStyle}>{t('fieldChangeDialog.backgroundImage')}</div>
        <label style={labelStyle}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="field-change-image-upload"
          />
          <button
            onClick={() => document.getElementById('field-change-image-upload')?.click()}
            style={{
              padding: '6px 12px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {t('fieldChangeDialog.selectImage')}
          </button>
          {backgroundImage && (
            <button
              onClick={() => setBackgroundImage(undefined)}
              style={{
                marginLeft: '8px',
                padding: '6px 12px',
                background: '#5a2a2a',
                border: '1px solid #7a3a3a',
                borderRadius: '4px',
                color: '#ff8888',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {t('fieldChangeDialog.deleteImage')}
            </button>
          )}
          {backgroundImage && (
            <div style={{ marginTop: '8px' }}>
              <img
                src={backgroundImage}
                alt="preview"
                style={{ maxWidth: '100%', maxHeight: '80px', borderRadius: '4px' }}
              />
            </div>
          )}
        </label>

        {/* Background Color */}
        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={changeBackgroundColor}
            onChange={(e) => setChangeBackgroundColor(e.target.checked)}
          />
          {t('fieldChangeDialog.backgroundColor')}
          {changeBackgroundColor && (
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              style={{ marginLeft: '8px', width: '40px', height: '24px', border: 'none', cursor: 'pointer' }}
            />
          )}
        </label>

        {/* Opacity */}
        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={changeOpacity}
            onChange={(e) => setChangeOpacity(e.target.checked)}
          />
          {t('fieldChangeDialog.opacity')}
          {changeOpacity && (
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={backgroundOpacity}
              onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
          )}
          {changeOpacity && (
            <span style={{ fontSize: '11px', color: '#ccc', minWidth: '30px' }}>
              {backgroundOpacity.toFixed(2)}
            </span>
          )}
        </label>

        {/* Timing */}
        <div style={sectionStyle}>{t('fieldChangeDialog.timing')}</div>

        {/* Start Frame */}
        <label style={labelStyle}>
          {t('fieldChangeDialog.startFrame')}
          <input
            type="number"
            value={startFrame}
            onChange={(e) => setStartFrame(parseInt(e.target.value) || 0)}
            min={0}
            step={1}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#888' }}>
            {t('fieldChangeDialog.startFrameDesc', { seconds: (startFrame / fps).toFixed(2) })}
          </span>
        </label>

        {/* End Frame */}
        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={hasEndFrame}
            onChange={(e) => setHasEndFrame(e.target.checked)}
          />
          {t('fieldChangeDialog.setEndFrame')}
        </label>
        {hasEndFrame && (
          <label style={labelStyle}>
            {t('fieldChangeDialog.endFrame')}
            <input
              type="number"
              value={endFrame}
              onChange={(e) => setEndFrame(parseInt(e.target.value) || 0)}
              min={startFrame + 1}
              step={1}
              style={inputStyle}
            />
            <span style={{ fontSize: '11px', color: '#888' }}>
              {t('fieldChangeDialog.endFrameDesc', {
                endSeconds: (endFrame / fps).toFixed(2),
                durationSeconds: ((endFrame - startFrame) / fps).toFixed(2),
              })}
            </span>
          </label>
        )}

        {/* Fade In */}
        <label style={labelStyle}>
          {t('fieldChangeDialog.fadeIn')}
          <input
            type="number"
            value={fadeInDuration}
            onChange={(e) => setFadeInDuration(parseInt(e.target.value) || 0)}
            min={0}
            step={1}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#888' }}>
            {t('fieldChangeDialog.fadeInDesc', { seconds: (fadeInDuration / fps).toFixed(2) })}
          </span>
        </label>

        {/* Fade Out */}
        {hasEndFrame && (
          <label style={labelStyle}>
            {t('fieldChangeDialog.fadeOut')}
            <input
              type="number"
              value={fadeOutDuration}
              onChange={(e) => setFadeOutDuration(parseInt(e.target.value) || 0)}
              min={0}
              step={1}
              style={inputStyle}
            />
            <span style={{ fontSize: '11px', color: '#888' }}>
              {t('fieldChangeDialog.fadeOutDesc', { seconds: (fadeOutDuration / fps).toFixed(2) })}
            </span>
          </label>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '10px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasAnyChange}
            style={{
              flex: 1,
              padding: '10px',
              background: hasAnyChange ? '#3753c7' : '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              cursor: hasAnyChange ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: hasAnyChange ? 1 : 0.5,
            }}
          >
            {t('fieldChangeDialog.add')}
          </button>
        </div>
      </div>
    </div>
  );
}
