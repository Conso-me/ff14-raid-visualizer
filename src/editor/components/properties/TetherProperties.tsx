import React from 'react';
import type { Tether, TetherEndpointType, TetherLineStyle } from '../../../data/types';
import { NumberInput } from './inputs/NumberInput';
import { ColorInput } from './inputs/ColorInput';
import { SelectInput } from './inputs/SelectInput';
import { useEditor } from '../../context/EditorContext';
import { useLanguage } from '../../context/LanguageContext';

interface TetherPropertiesProps {
  tether: Tether;
  showFrame: number;
  hideFrame: number | null;
  fps: number;
  onUpdate: (updates: Partial<Tether>) => void;
  onDelete: () => void;
  onUpdateTiming: (showFrame: number, hideFrame: number | null) => void;
}

const ENDPOINT_TYPE_OPTIONS: Array<{ value: TetherEndpointType; label: string }> = [
  { value: 'player', label: 'Player' },
  { value: 'enemy', label: 'Enemy' },
  { value: 'object', label: 'Object' },
];

const LINE_STYLE_OPTIONS: Array<{ value: TetherLineStyle; label: string }> = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

export function TetherProperties({
  tether,
  showFrame,
  hideFrame,
  fps,
  onUpdate,
  onDelete,
  onUpdateTiming,
}: TetherPropertiesProps) {
  const { state } = useEditor();
  const { t } = useLanguage();
  const { mechanic } = state;

  const getEntitiesForType = (type: TetherEndpointType) => {
    switch (type) {
      case 'player':
        return mechanic.initialPlayers.map((p) => ({ value: p.id, label: p.name || p.role }));
      case 'enemy':
        return mechanic.enemies.map((e) => ({ value: e.id, label: e.name }));
      case 'object': {
        const objects: Array<{ value: string; label: string }> = [];
        mechanic.timeline.forEach((e) => {
          if (e.type === 'object_show' && !objects.find((o) => o.value === e.object.id)) {
            objects.push({ value: e.object.id, label: e.object.name });
          }
        });
        return objects;
      }
    }
  };

  const sourceEntities = getEntitiesForType(tether.sourceType);
  const targetEntities = getEntitiesForType(tether.targetType);

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    color: '#888',
    marginBottom: '4px',
  };

  const sectionStyle: React.CSSProperties = {
    borderTop: '1px solid #3a3a5a',
    paddingTop: '12px',
    marginTop: '4px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#888',
    marginBottom: '8px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Name */}
      <div>
        <label style={labelStyle}>{t('common.name')}</label>
        <input
          type="text"
          value={tether.name || ''}
          onChange={(e) => onUpdate({ name: e.target.value || undefined })}
          placeholder={t('tetherDialog.namePlaceholder')}
          style={{
            width: '100%',
            padding: '6px 8px',
            background: '#2a2a4a',
            border: '1px solid #3a3a5a',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '13px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Source */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>{t('tetherDialog.source')}</div>
        <SelectInput
          label={t('tetherDialog.endpointType')}
          value={tether.sourceType}
          options={ENDPOINT_TYPE_OPTIONS}
          onChange={(value) => {
            const newType = value as TetherEndpointType;
            const entities = getEntitiesForType(newType);
            onUpdate({ sourceType: newType, sourceId: entities[0]?.value ?? '' });
          }}
        />
        <SelectInput
          label={t('tetherDialog.entity')}
          value={tether.sourceId}
          options={sourceEntities}
          onChange={(value) => onUpdate({ sourceId: value })}
        />
      </div>

      {/* Target */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>{t('tetherDialog.target')}</div>
        <SelectInput
          label={t('tetherDialog.endpointType')}
          value={tether.targetType}
          options={ENDPOINT_TYPE_OPTIONS}
          onChange={(value) => {
            const newType = value as TetherEndpointType;
            const entities = getEntitiesForType(newType);
            onUpdate({ targetType: newType, targetId: entities[0]?.value ?? '' });
          }}
        />
        <SelectInput
          label={t('tetherDialog.entity')}
          value={tether.targetId}
          options={targetEntities}
          onChange={(value) => onUpdate({ targetId: value })}
        />
      </div>

      {/* Appearance */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>{t('tetherDialog.appearance')}</div>
        <ColorInput
          label={t('common.color')}
          value={tether.color}
          onChange={(color) => onUpdate({ color })}
        />
        <SelectInput
          label={t('tetherDialog.lineStyle')}
          value={tether.lineStyle}
          options={LINE_STYLE_OPTIONS}
          onChange={(value) => onUpdate({ lineStyle: value as TetherLineStyle })}
        />
        <NumberInput
          label={t('tetherDialog.width')}
          value={tether.width ?? 2}
          min={1}
          max={10}
          step={0.5}
          onChange={(width) => onUpdate({ width })}
        />
      </div>

      {/* Distance threshold */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>{t('tetherDialog.distanceSettings')}</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '8px' }}>
          <input
            type="checkbox"
            checked={tether.distanceThreshold !== undefined}
            onChange={(e) => {
              if (e.target.checked) {
                onUpdate({ distanceThreshold: 10, colorBeyondThreshold: '#44ff44' });
              } else {
                onUpdate({ distanceThreshold: undefined, colorBeyondThreshold: undefined });
              }
            }}
          />
          {t('tetherDialog.useDistanceThreshold')}
        </label>
        {tether.distanceThreshold !== undefined && (
          <>
            <NumberInput
              label={t('tetherDialog.distanceThreshold')}
              value={tether.distanceThreshold}
              min={0}
              step={0.5}
              onChange={(distanceThreshold) => onUpdate({ distanceThreshold })}
            />
            <ColorInput
              label={t('tetherDialog.colorBeyondThreshold')}
              value={tether.colorBeyondThreshold ?? '#44ff44'}
              onChange={(colorBeyondThreshold) => onUpdate({ colorBeyondThreshold })}
            />
          </>
        )}
      </div>

      {/* Timing */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>{t('tetherDialog.timing')}</div>
        <NumberInput
          label={`${t('tetherDialog.startFrame')} (${(showFrame / fps).toFixed(1)}s)`}
          value={showFrame}
          min={0}
          step={1}
          onChange={(frame) => onUpdateTiming(frame, hideFrame)}
        />
        {hideFrame !== null && (
          <NumberInput
            label={`${t('tetherDialog.hideFrame')} (${(hideFrame / fps).toFixed(1)}s)`}
            value={hideFrame}
            min={showFrame + 1}
            step={1}
            onChange={(frame) => onUpdateTiming(showFrame, frame)}
          />
        )}
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        style={{
          marginTop: '12px',
          padding: '8px',
          background: '#ff4444',
          border: 'none',
          borderRadius: '4px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        {t('common.delete')}
      </button>
    </div>
  );
}
