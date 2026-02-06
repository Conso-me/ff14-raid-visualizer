import React from 'react';
import type { CastEvent, Enemy } from '../../../data/types';
import { useLanguage } from '../../context/LanguageContext';

interface CastEventPropertiesProps {
  castEvent: CastEvent;
  enemies: Enemy[];
  fps: number;
  onUpdate: (id: string, updates: Partial<CastEvent>) => void;
  onDelete: (id: string) => void;
}

export function CastEventProperties({
  castEvent,
  enemies,
  fps,
  onUpdate,
  onDelete,
}: CastEventPropertiesProps) {
  const { t } = useLanguage();

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
    display: 'block' as const,
    fontSize: '12px',
    color: '#888',
    marginBottom: '12px',
  };

  const sectionStyle = {
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #3a3a5a',
  };

  return (
    <div>
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#fff' }}>
          {t('property.castBar')}
        </h3>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
          ID: {castEvent.id}
        </div>
      </div>

      {/* Skill Name */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          {t('castDialog.skillName')}
          <input
            type="text"
            value={castEvent.skillName}
            onChange={(e) => onUpdate(castEvent.id, { skillName: e.target.value })}
            style={inputStyle}
          />
        </label>
      </div>

      {/* Caster */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          {t('castDialog.caster')}
          <select
            value={castEvent.casterId}
            onChange={(e) => onUpdate(castEvent.id, { casterId: e.target.value })}
            style={inputStyle}
          >
            <option value="">{t('castDialog.selectCaster')}</option>
            {enemies.map((enemy) => (
              <option key={enemy.id} value={enemy.id}>
                {enemy.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Timing */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          {t('castDialog.startFrame')}
          <input
            type="number"
            value={castEvent.frame}
            onChange={(e) => onUpdate(castEvent.id, { frame: parseInt(e.target.value) || 0 })}
            min={0}
            step={1}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#888' }}>
            {(castEvent.frame / fps).toFixed(2)}秒
          </span>
        </label>

        <label style={labelStyle}>
          {t('castDialog.duration')}
          <input
            type="number"
            value={(castEvent.duration / fps).toFixed(1)}
            onChange={(e) => {
              const seconds = parseFloat(e.target.value) || 0;
              onUpdate(castEvent.id, { duration: Math.round(seconds * fps) });
            }}
            min={0.1}
            step={0.1}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#888' }}>
            {t('castDialog.durationFrames', { frames: String(castEvent.duration) })}
          </span>
        </label>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(castEvent.id)}
        style={{
          width: '100%',
          padding: '8px',
          background: '#6b2020',
          border: 'none',
          borderRadius: '4px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        {t('common.delete')}
      </button>
    </div>
  );
}
