import React, { useState } from 'react';
import type { TetherEndpointType, TetherLineStyle } from '../../data/types';
import type { TetherSettings } from '../context/editorReducer';
import { useLanguage } from '../context/LanguageContext';
import { useEditor } from '../context/EditorContext';

interface TetherDialogProps {
  isOpen: boolean;
  currentFrame: number;
  fps: number;
  onConfirm: (settings: TetherSettings) => void;
  onCancel: () => void;
}

export function TetherDialog({
  isOpen,
  currentFrame,
  fps,
  onConfirm,
  onCancel,
}: TetherDialogProps) {
  const { t } = useLanguage();
  const { state } = useEditor();
  const { mechanic } = state;

  const [name, setName] = useState('');
  const [sourceType, setSourceType] = useState<TetherEndpointType>('enemy');
  const [sourceId, setSourceId] = useState('');
  const [targetType, setTargetType] = useState<TetherEndpointType>('player');
  const [targetId, setTargetId] = useState('');
  const [color, setColor] = useState('#ff4444');
  const [lineStyle, setLineStyle] = useState<TetherLineStyle>('solid');
  const [width, setWidth] = useState(2);
  const [distanceThreshold, setDistanceThreshold] = useState<number | undefined>(undefined);
  const [colorBeyondThreshold, setColorBeyondThreshold] = useState('#44ff44');
  const [useDistanceThreshold, setUseDistanceThreshold] = useState(false);
  const [startFrame, setStartFrame] = useState(currentFrame);
  const [duration, setDuration] = useState(90);
  const [fadeInDuration, setFadeInDuration] = useState(5);
  const [fadeOutDuration, setFadeOutDuration] = useState(10);

  if (!isOpen) return null;

  // Get available entities for dropdowns
  const players = mechanic.initialPlayers;
  const enemies = mechanic.enemies;
  // Get objects from timeline
  const objects: Array<{ id: string; name: string }> = [];
  mechanic.timeline.forEach((e) => {
    if (e.type === 'object_show' && !objects.find((o) => o.id === e.object.id)) {
      objects.push({ id: e.object.id, name: e.object.name });
    }
  });

  const getEntitiesForType = (type: TetherEndpointType) => {
    switch (type) {
      case 'player':
        return players.map((p) => ({ id: p.id, label: p.name || p.role }));
      case 'enemy':
        return enemies.map((e) => ({ id: e.id, label: e.name }));
      case 'object':
        return objects.map((o) => ({ id: o.id, label: o.name }));
    }
  };

  const sourceEntities = getEntitiesForType(sourceType);
  const targetEntities = getEntitiesForType(targetType);

  // Auto-select first entity when type changes
  const handleSourceTypeChange = (newType: TetherEndpointType) => {
    setSourceType(newType);
    const entities = getEntitiesForType(newType);
    setSourceId(entities[0]?.id ?? '');
  };

  const handleTargetTypeChange = (newType: TetherEndpointType) => {
    setTargetType(newType);
    const entities = getEntitiesForType(newType);
    setTargetId(entities[0]?.id ?? '');
  };

  // Initialize IDs on first render
  if (!sourceId && sourceEntities.length > 0) {
    setSourceId(sourceEntities[0].id);
  }
  if (!targetId && targetEntities.length > 0) {
    setTargetId(targetEntities[0].id);
  }

  const canConfirm = sourceId && targetId && !(sourceType === targetType && sourceId === targetId);

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm({
      name: name || undefined,
      sourceType,
      sourceId,
      targetType,
      targetId,
      color,
      lineStyle,
      width,
      distanceThreshold: useDistanceThreshold ? distanceThreshold : undefined,
      colorBeyondThreshold: useDistanceThreshold ? colorBeyondThreshold : undefined,
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

  const endpointTypes: Array<{ value: TetherEndpointType; label: string }> = [
    { value: 'player', label: t('tetherDialog.player') },
    { value: 'enemy', label: t('tetherDialog.enemy') },
    { value: 'object', label: t('tetherDialog.object') },
  ];

  const lineStyles: Array<{ value: TetherLineStyle; label: string }> = [
    { value: 'solid', label: t('tetherDialog.lineSolid') },
    { value: 'dashed', label: t('tetherDialog.lineDashed') },
    { value: 'dotted', label: t('tetherDialog.lineDotted') },
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
          width: '480px',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid #3a3a5a',
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#fff' }}>
          {t('tetherDialog.title')}
        </h2>

        {/* Name (optional) */}
        <label style={labelStyle}>
          {t('common.name')}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('tetherDialog.namePlaceholder')}
            style={inputStyle}
          />
        </label>

        {/* Source */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('tetherDialog.source')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={labelStyle}>
              {t('tetherDialog.endpointType')}
              <select
                value={sourceType}
                onChange={(e) => handleSourceTypeChange(e.target.value as TetherEndpointType)}
                style={inputStyle}
              >
                {endpointTypes.map((ep) => (
                  <option key={ep.value} value={ep.value}>{ep.label}</option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              {t('tetherDialog.entity')}
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                style={inputStyle}
              >
                {sourceEntities.map((e) => (
                  <option key={e.id} value={e.id}>{e.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Target */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('tetherDialog.target')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={labelStyle}>
              {t('tetherDialog.endpointType')}
              <select
                value={targetType}
                onChange={(e) => handleTargetTypeChange(e.target.value as TetherEndpointType)}
                style={inputStyle}
              >
                {endpointTypes.map((ep) => (
                  <option key={ep.value} value={ep.value}>{ep.label}</option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>
              {t('tetherDialog.entity')}
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                style={inputStyle}
              >
                {targetEntities.map((e) => (
                  <option key={e.id} value={e.id}>{e.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Appearance */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('tetherDialog.appearance')}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <label style={labelStyle}>
              {t('common.color')}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ ...inputStyle, padding: '2px', height: '32px' }}
              />
            </label>

            <label style={labelStyle}>
              {t('tetherDialog.lineStyle')}
              <select
                value={lineStyle}
                onChange={(e) => setLineStyle(e.target.value as TetherLineStyle)}
                style={inputStyle}
              >
                {lineStyles.map((ls) => (
                  <option key={ls.value} value={ls.value}>{ls.label}</option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              {t('tetherDialog.width')}
              <input
                type="number"
                value={width}
                min={1}
                max={10}
                step={0.5}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 2)}
                style={inputStyle}
              />
            </label>
          </div>
        </div>

        {/* Distance threshold */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('tetherDialog.distanceSettings')}</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={useDistanceThreshold}
              onChange={(e) => setUseDistanceThreshold(e.target.checked)}
            />
            {t('tetherDialog.useDistanceThreshold')}
          </label>

          {useDistanceThreshold && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={labelStyle}>
                {t('tetherDialog.distanceThreshold')}
                <input
                  type="number"
                  value={distanceThreshold ?? 10}
                  min={0}
                  step={0.5}
                  onChange={(e) => setDistanceThreshold(parseFloat(e.target.value) || 10)}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                {t('tetherDialog.colorBeyondThreshold')}
                <input
                  type="color"
                  value={colorBeyondThreshold}
                  onChange={(e) => setColorBeyondThreshold(e.target.value)}
                  style={{ ...inputStyle, padding: '2px', height: '32px' }}
                />
              </label>
            </div>
          )}
        </div>

        {/* Timing */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('tetherDialog.timing')}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={labelStyle}>
              {t('tetherDialog.startFrame')}
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
              {t('tetherDialog.duration')}
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
              {t('tetherDialog.fadeIn')}
              <input
                type="number"
                value={fadeInDuration}
                min={0}
                onChange={(e) => setFadeInDuration(parseInt(e.target.value) || 0)}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              {t('tetherDialog.fadeOut')}
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
            disabled={!canConfirm}
            style={{
              padding: '8px 16px',
              background: canConfirm ? '#ff4488' : '#555',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: canConfirm ? 'pointer' : 'not-allowed',
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
