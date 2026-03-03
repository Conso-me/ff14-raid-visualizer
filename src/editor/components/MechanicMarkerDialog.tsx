import React, { useState } from 'react';
import type { Position, MechanicMarkerType } from '../../data/types';
import type { MechanicMarkerSettings } from '../context/editorReducer';
import { useLanguage } from '../context/LanguageContext';
import { useEditor } from '../context/EditorContext';

interface MechanicMarkerDialogProps {
  isOpen: boolean;
  position: Position;
  currentFrame: number;
  fps: number;
  onConfirm: (settings: MechanicMarkerSettings) => void;
  onCancel: () => void;
}

const MARKER_TYPE_ICONS: Record<MechanicMarkerType, string> = {
  eye: '\uD83D\uDC41',
  stack: '\u21E8',
  stack_count: '\u2460',
  proximity: '\u25BC',
  tankbuster: '\u2694',
  target: '\u25CE',
  chase: '\u00BB',
  knockback_radial: '\u21D4',
  knockback_line: '\u21D1',
  telegraph: '\u26A0',
};

export function MechanicMarkerDialog({
  isOpen,
  position,
  currentFrame,
  fps,
  onConfirm,
  onCancel,
}: MechanicMarkerDialogProps) {
  const { t } = useLanguage();
  const { state } = useEditor();

  const [markerType, setMarkerType] = useState<MechanicMarkerType>(state.selectedMechanicMarkerType);
  const [size, setSize] = useState(3);
  const [color, setColor] = useState('#ffcc00');
  const [opacity, setOpacity] = useState(0.9);
  const [rotation, setRotation] = useState(0);
  const [count, setCount] = useState(2);
  const [startFrame, setStartFrame] = useState(currentFrame);
  const [duration, setDuration] = useState(90);
  const [fadeInDuration, setFadeInDuration] = useState(10);
  const [fadeOutDuration, setFadeOutDuration] = useState(15);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      type: markerType,
      position,
      size,
      color,
      opacity,
      rotation: rotation || undefined,
      count: markerType === 'stack_count' ? count : undefined,
      startFrame,
      duration,
      fadeInDuration,
      fadeOutDuration,
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    marginTop: '4px',
    padding: '6px 8px',
    background: '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '13px',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    color: '#888',
    marginBottom: '8px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#ccc',
    marginBottom: '8px',
  };

  const markerTypes: MechanicMarkerType[] = [
    'eye', 'stack', 'stack_count', 'proximity', 'tankbuster',
    'target', 'chase', 'knockback_radial', 'knockback_line', 'telegraph',
  ];

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
          width: '450px',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid #3a3a5a',
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#fff' }}>
          {t('markerDialog.title')}
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

        {/* Marker Type Selection */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('markerDialog.markerType')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            {markerTypes.map((type) => (
              <button
                key={type}
                onClick={() => setMarkerType(type)}
                style={{
                  padding: '8px 10px',
                  background: markerType === type ? '#ff4488' : '#2a2a4a',
                  border: '1px solid #3a3a5a',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{MARKER_TYPE_ICONS[type]}</span>
                <span>{t(`markerDialog.types.${type}` as any)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('markerDialog.appearance')}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={labelStyle}>
              {t('markerDialog.size')}
              <input
                type="number"
                value={size}
                min={0.5}
                max={20}
                step={0.5}
                onChange={(e) => setSize(parseFloat(e.target.value) || 3)}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              {t('markerDialog.color')}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ ...inputStyle, padding: '2px', height: '32px' }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={labelStyle}>
              {t('markerDialog.opacity')}
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                style={{ ...inputStyle, padding: 0 }}
              />
              <span style={{ fontSize: '11px', color: '#aaa' }}>{(opacity * 100).toFixed(0)}%</span>
            </label>

            <label style={labelStyle}>
              {t('markerDialog.rotation')}
              <input
                type="number"
                value={rotation}
                min={0}
                max={360}
                step={5}
                onChange={(e) => setRotation(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </label>
          </div>

          {markerType === 'stack_count' && (
            <label style={labelStyle}>
              {t('markerDialog.count')}
              <input
                type="number"
                value={count}
                min={1}
                max={4}
                step={1}
                onChange={(e) => setCount(Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))}
                style={inputStyle}
              />
            </label>
          )}
        </div>

        {/* Timing */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('markerDialog.timing')}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={labelStyle}>
              {t('markerDialog.startFrame')}
              <input
                type="number"
                value={startFrame}
                min={0}
                onChange={(e) => setStartFrame(parseInt(e.target.value) || 0)}
                style={inputStyle}
              />
              <span style={{ fontSize: '11px', color: '#aaa' }}>
                ({(startFrame / fps).toFixed(1)}s)
              </span>
            </label>

            <label style={labelStyle}>
              {t('markerDialog.duration')}
              <input
                type="number"
                value={duration}
                min={1}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                style={inputStyle}
              />
              <span style={{ fontSize: '11px', color: '#aaa' }}>
                ({(duration / fps).toFixed(1)}s)
              </span>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={labelStyle}>
              {t('markerDialog.fadeIn')}
              <input
                type="number"
                value={fadeInDuration}
                min={0}
                onChange={(e) => setFadeInDuration(parseInt(e.target.value) || 0)}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              {t('markerDialog.fadeOut')}
              <input
                type="number"
                value={fadeOutDuration}
                min={0}
                onChange={(e) => setFadeOutDuration(parseInt(e.target.value) || 0)}
                style={inputStyle}
              />
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              background: '#3a3a5a',
              border: '1px solid #4a4a6a',
              borderRadius: '4px',
              color: '#ccc',
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
              background: '#ff4488',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
