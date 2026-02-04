import React, { useState } from 'react';
import type { Position, GimmickObject } from '../../data/types';
import type { ObjectSettings } from '../context/editorReducer';
import { useLanguage } from '../context/LanguageContext';

interface ObjectDialogProps {
  isOpen: boolean;
  position: Position;
  currentFrame: number;
  fps: number;
  onConfirm: (settings: ObjectSettings) => void;
  onCancel: () => void;
}

export function ObjectDialog({
  isOpen,
  position,
  currentFrame,
  fps,
  onConfirm,
  onCancel,
}: ObjectDialogProps) {
  const { t } = useLanguage();

  const PRESETS: Array<{
    name: string;
    icon: string;
    shape: GimmickObject['shape'];
    color: string;
    size: number;
  }> = [
    { name: t('objectDialog.presetTower'), icon: '🗼', shape: 'circle', color: '#ffcc00', size: 2 },
    { name: t('objectDialog.presetBomb'), icon: '💣', shape: 'circle', color: '#ff4444', size: 1.5 },
    { name: t('objectDialog.presetLightning'), icon: '⚡', shape: 'diamond', color: '#ffff00', size: 1.5 },
    { name: t('objectDialog.presetFire'), icon: '🔥', shape: 'circle', color: '#ff6600', size: 2 },
    { name: t('objectDialog.presetIce'), icon: '❄️', shape: 'diamond', color: '#00ccff', size: 1.5 },
    { name: t('objectDialog.presetTether'), icon: '🔗', shape: 'circle', color: '#aa00ff', size: 1 },
    { name: t('objectDialog.presetMarker'), icon: '📍', shape: 'triangle', color: '#00ff00', size: 1.5 },
  ];

  const SHAPES: Array<{ value: GimmickObject['shape']; label: string; icon: string }> = [
    { value: 'circle', label: t('objectDialog.shapeCircle'), icon: '●' },
    { value: 'square', label: t('objectDialog.shapeSquare'), icon: '■' },
    { value: 'triangle', label: t('objectDialog.shapeTriangle'), icon: '▲' },
    { value: 'diamond', label: t('objectDialog.shapeDiamond'), icon: '◆' },
  ];

  const [name, setName] = useState('オブジェクト');
  const [shape, setShape] = useState<GimmickObject['shape']>('circle');
  const [size, setSize] = useState(2);
  const [color, setColor] = useState('#ffcc00');
  const [icon, setIcon] = useState('');
  const [startFrame, setStartFrame] = useState(currentFrame);
  const [hasEndFrame, setHasEndFrame] = useState(true);
  const [endFrame, setEndFrame] = useState(currentFrame + 90);
  const [fadeInDuration, setFadeInDuration] = useState(10);
  const [fadeOutDuration, setFadeOutDuration] = useState(15);



  if (!isOpen) return null;

  const handlePreset = (preset: typeof PRESETS[0]) => {
    setName(preset.name);
    setShape(preset.shape);
    setColor(preset.color);
    setSize(preset.size);
    setIcon(preset.icon);
  };

  const handleConfirm = () => {
    const object: GimmickObject = {
      id: `object-${Date.now()}`,
      name,
      position,
      shape,
      size,
      color,
      icon: icon || undefined,
      opacity: 1,
    };

    onConfirm({
      object,
      startFrame,
      endFrame: hasEndFrame ? endFrame : undefined,
      fadeInDuration,
      fadeOutDuration: hasEndFrame ? fadeOutDuration : undefined,
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

  // Render shape preview
  const renderShapePreview = () => {
    const previewSize = 40;
    const halfSize = previewSize / 2;
    const strokeColor = color === '#000000' ? '#ffffff' : '#000000';

    switch (shape) {
      case 'circle':
        return (
          <circle cx={halfSize} cy={halfSize} r={halfSize - 2} fill={color} stroke={strokeColor} strokeWidth={2} />
        );
      case 'square':
        return (
          <rect x={2} y={2} width={previewSize - 4} height={previewSize - 4} fill={color} stroke={strokeColor} strokeWidth={2} />
        );
      case 'triangle':
        return (
          <polygon
            points={`${halfSize},2 ${previewSize - 2},${previewSize - 2} 2,${previewSize - 2}`}
            fill={color}
            stroke={strokeColor}
            strokeWidth={2}
          />
        );
      case 'diamond':
        return (
          <polygon
            points={`${halfSize},2 ${previewSize - 2},${halfSize} ${halfSize},${previewSize - 2} 2,${halfSize}`}
            fill={color}
            stroke={strokeColor}
            strokeWidth={2}
          />
        );
    }
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
          width: '450px',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid #3a3a5a',
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#fff' }}>
          {t('objectDialog.title')}
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

        {/* Presets */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('objectDialog.presets')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePreset(preset)}
                style={{
                  padding: '6px 10px',
                  background: '#2a2a4a',
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
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Basic settings */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('objectDialog.basicSettings')}</div>

          <label style={labelStyle}>
            {t('common.name')}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('objectDialog.namePlaceholder')}
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            {t('objectDialog.shape')}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {SHAPES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setShape(s.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: shape === s.value ? '#4a4a7a' : '#2a2a4a',
                    border: '1px solid #3a3a5a',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{s.icon}</span>
                  <span style={{ fontSize: '10px' }}>{s.label}</span>
                </button>
              ))}
            </div>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <label style={labelStyle}>
              {t('common.size')}
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(parseFloat(e.target.value) || 1)}
                min={0.5}
                max={10}
                step={0.5}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              {t('common.color')}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ ...inputStyle, padding: '2px', height: '36px' }}
              />
            </label>

            <label style={labelStyle}>
              {t('objectDialog.iconEmoji')}
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="..."
                maxLength={2}
                style={{ ...inputStyle, textAlign: 'center', fontSize: '16px' }}
              />
            </label>
          </div>
        </div>

        {/* Timing settings */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('objectDialog.timing')}</div>

          <label style={labelStyle}>
            {t('objectDialog.startFrame')}
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
            {t('objectDialog.startFrameDesc', { seconds: (startFrame / fps).toFixed(2) })}
          </p>

          <label style={labelStyle}>
            {t('objectDialog.fadeIn')}
            <input
              type="number"
              value={fadeInDuration}
              onChange={(e) => setFadeInDuration(parseInt(e.target.value) || 0)}
              min={0}
              step={1}
              style={inputStyle}
            />
          </label>
          <p style={{ fontSize: '11px', color: '#666', marginTop: '-4px', marginBottom: '8px' }}>
            {t('objectDialog.fadeInDesc', { seconds: (fadeInDuration / fps).toFixed(2) })}
          </p>

          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={hasEndFrame}
              onChange={(e) => setHasEndFrame(e.target.checked)}
            />
            {t('objectDialog.setEndFrame')}
          </label>

          {hasEndFrame && (
            <>
              <label style={labelStyle}>
                {t('objectDialog.endFrame')}
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
                {t('objectDialog.endFrameDesc', { endSeconds: (endFrame / fps).toFixed(2), durationSeconds: ((endFrame - startFrame) / fps).toFixed(2) })}
              </p>

              <label style={labelStyle}>
                {t('objectDialog.fadeOut')}
                <input
                  type="number"
                  value={fadeOutDuration}
                  onChange={(e) => setFadeOutDuration(parseInt(e.target.value) || 0)}
                  min={0}
                  step={1}
                  style={inputStyle}
                />
              </label>
              <p style={{ fontSize: '11px', color: '#666', marginTop: '-4px', marginBottom: '8px' }}>
                {t('objectDialog.fadeOutDesc', { seconds: (fadeOutDuration / fps).toFixed(2) })}
              </p>
            </>
          )}
        </div>

        {/* Preview */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('objectDialog.preview')}</div>
          <div
            style={{
              padding: '16px',
              background: '#0a0a1a',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width={50} height={50}>
                <g transform="translate(5, 5)">
                  {renderShapePreview()}
                </g>
              </svg>
              {icon && (
                <span style={{
                  position: 'absolute',
                  fontSize: '20px',
                  textShadow: '0 0 4px rgba(0,0,0,0.8)',
                }}>
                  {icon}
                </span>
              )}
            </div>
            <div style={{ marginLeft: '16px', color: '#888', fontSize: '12px' }}>
              <div>{name}</div>
              <div>{t('objectDialog.sizeLabel', { size })}</div>
            </div>
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
              background: '#ffaa00',
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
