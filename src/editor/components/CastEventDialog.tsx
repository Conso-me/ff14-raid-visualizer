import React, { useState, useEffect } from 'react';
import type { Enemy } from '../../data/types';
import { useLanguage } from '../context/LanguageContext';

interface CastEventDialogProps {
  isOpen: boolean;
  currentFrame: number;
  fps: number;
  enemies: Enemy[];
  onConfirm: (settings: {
    skillName: string;
    casterId: string;
    startFrame: number;
    durationFrames: number;
  }) => void;
  onCancel: () => void;
}

export function CastEventDialog({
  isOpen,
  currentFrame,
  fps,
  enemies,
  onConfirm,
  onCancel,
}: CastEventDialogProps) {
  const { t } = useLanguage();

  const [skillName, setSkillName] = useState('');
  const [casterId, setCasterId] = useState(enemies[0]?.id || '');
  const [startFrame, setStartFrame] = useState(currentFrame);
  const [durationSeconds, setDurationSeconds] = useState(3);

  useEffect(() => {
    if (isOpen) {
      setStartFrame(currentFrame);
      setSkillName('');
      setCasterId(enemies[0]?.id || '');
      setDurationSeconds(3);
    }
  }, [isOpen, currentFrame, enemies]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!skillName.trim()) return;
    onConfirm({
      skillName: skillName.trim(),
      casterId,
      startFrame,
      durationFrames: Math.round(durationSeconds * fps),
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
          width: '400px',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid #3a3a5a',
        }}
      >
        <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#fff' }}>
          {t('castDialog.title')}
        </h2>

        {/* Skill Name */}
        <label style={labelStyle}>
          {t('castDialog.skillName')}
          <input
            type="text"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder={t('castDialog.skillNamePlaceholder')}
            autoFocus
            style={inputStyle}
          />
        </label>

        {/* Caster */}
        <label style={labelStyle}>
          {t('castDialog.caster')}
          <select
            value={casterId}
            onChange={(e) => setCasterId(e.target.value)}
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

        {/* Start Frame */}
        <label style={labelStyle}>
          {t('castDialog.startFrame')}
          <input
            type="number"
            value={startFrame}
            onChange={(e) => setStartFrame(parseInt(e.target.value) || 0)}
            min={0}
            step={1}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#888' }}>
            {t('castDialog.startFrameDesc', { seconds: (startFrame / fps).toFixed(2) })}
          </span>
        </label>

        {/* Duration */}
        <label style={labelStyle}>
          {t('castDialog.duration')}
          <input
            type="number"
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(parseFloat(e.target.value) || 0)}
            min={0.1}
            step={0.1}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#888' }}>
            {t('castDialog.durationFrames', { frames: String(Math.round(durationSeconds * fps)) })}
          </span>
        </label>

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
            disabled={!skillName.trim()}
            style={{
              flex: 1,
              padding: '10px',
              background: skillName.trim() ? '#3753c7' : '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              cursor: skillName.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: skillName.trim() ? 1 : 0.5,
            }}
          >
            {t('castDialog.add')}
          </button>
        </div>
      </div>
    </div>
  );
}
