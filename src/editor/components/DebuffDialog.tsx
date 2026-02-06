import React, { useState, useEffect, useMemo } from 'react';
import type { DebuffSettings } from '../context/editorReducer';
import type { DebuffAddEvent } from '../../data/types';
import { DebuffIcon } from '../../components/debuff/DebuffIcon';
import { useLanguage } from '../context/LanguageContext';
import { useEditor } from '../context/EditorContext';
import { generateUniqueName } from '../../utils/naming';

interface DebuffDialogProps {
  isOpen: boolean;
  targetPlayerId: string;
  targetPlayerRole?: string;
  currentFrame: number;
  fps: number;
  onConfirm: (settings: DebuffSettings) => void;
  onCancel: () => void;
}

export function DebuffDialog({
  isOpen,
  targetPlayerId,
  targetPlayerRole,
  currentFrame,
  fps,
  onConfirm,
  onCancel,
}: DebuffDialogProps) {
  const { t } = useLanguage();
  const { state } = useEditor();

  const existingDebuffNames = useMemo(() => {
    return state.mechanic.timeline
      .filter((e): e is DebuffAddEvent => e.type === 'debuff_add')
      .map((e) => e.debuff.name);
  }, [state.mechanic.timeline]);

  const DEBUFF_PRESETS = [
    { id: 'spread', name: t('debuffDialog.spread'), color: '#ff00ff' },
    { id: 'stack', name: t('debuffDialog.stack'), color: '#ffff00' },
    { id: 'tower', name: t('debuffDialog.tower'), color: '#00aaff' },
    { id: 'tether', name: t('debuffDialog.tether'), color: '#00ff00' },
    { id: 'fire', name: t('debuffDialog.fire'), color: '#ff4400' },
    { id: 'ice', name: t('debuffDialog.ice'), color: '#44ccff' },
    { id: 'lightning', name: t('debuffDialog.lightning'), color: '#cc44ff' },
    { id: 'poison', name: t('debuffDialog.poison'), color: '#44ff44' },
  ];

  const [selectedPreset, setSelectedPreset] = useState<string | null>('spread');
  const [customName, setCustomName] = useState('');
  const [customColor, setCustomColor] = useState('#ff6600');
  const [startFrame, setStartFrame] = useState(currentFrame);
  const [durationSeconds, setDurationSeconds] = useState(5);
  const [applyToAll, setApplyToAll] = useState(false);

  // Reset start frame when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStartFrame(currentFrame);
    }
  }, [isOpen, currentFrame]);

  if (!isOpen) return null;

  const getSelectedDebuff = () => {
    if (selectedPreset) {
      const preset = DEBUFF_PRESETS.find(p => p.id === selectedPreset);
      if (preset) {
        return {
          id: `${preset.id}-${Date.now()}`,
          name: generateUniqueName(preset.name, existingDebuffNames),
          color: preset.color,
        };
      }
    }
    return {
      id: `custom-${Date.now()}`,
      name: generateUniqueName(customName || t('debuffDialog.custom'), existingDebuffNames),
      color: customColor,
    };
  };

  const handleConfirm = () => {
    const debuff = getSelectedDebuff();
    onConfirm({
      targetId: applyToAll ? 'all' : targetPlayerId,
      debuff,
      startFrame,
      durationSeconds,
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

  const previewDebuff = getSelectedDebuff();

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
          {t('debuffDialog.title')}
        </h2>

        {/* Target info */}
        <div
          style={{
            padding: '8px 12px',
            background: '#2a2a4a',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          <label style={{ ...labelStyle, marginBottom: 0 }}>{t('debuffDialog.target')}</label>
          <p style={{ margin: '4px 0 0', color: '#fff', fontSize: '13px' }}>
            {targetPlayerRole || targetPlayerId}
          </p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
            />
            <span style={{ fontSize: '12px', color: '#aaa' }}>{t('debuffDialog.applyToAll')}</span>
          </label>
        </div>

        {/* Preset selection */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('debuffDialog.presets')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {DEBUFF_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset.id)}
                style={{
                  padding: '8px 4px',
                  background: selectedPreset === preset.id ? preset.color : '#3a3a5a',
                  border: selectedPreset === preset.id ? '2px solid #fff' : '1px solid #4a4a6a',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '3px',
                    background: preset.color,
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom debuff */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                checked={selectedPreset === null}
                onChange={() => setSelectedPreset(null)}
              />
              <span>{t('debuffDialog.custom')}</span>
            </label>
          </div>
          {selectedPreset === null && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <label style={labelStyle}>
                {t('common.name')}
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={t('debuffDialog.debuffName')}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                {t('common.color')}
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  style={{ ...inputStyle, padding: '2px', height: '36px' }}
                />
              </label>
            </div>
          )}
        </div>

        {/* Timing settings */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('debuffDialog.timing')}</div>

          <label style={labelStyle}>
            {t('debuffDialog.applyFrame')}
            <input
              type="number"
              value={startFrame}
              onChange={(e) => setStartFrame(parseInt(e.target.value) || 0)}
              min={0}
              step={1}
              style={inputStyle}
            />
          </label>
          <p style={{ fontSize: '11px', color: '#666', marginTop: '-4px', marginBottom: '12px' }}>
            {t('debuffDialog.applyFrameDesc', { seconds: (startFrame / fps).toFixed(2) })}
          </p>

          <label style={labelStyle}>
            {t('debuffDialog.durationSeconds')}
            <input
              type="number"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(parseFloat(e.target.value) || 1)}
              min={0.5}
              max={60}
              step={0.5}
              style={inputStyle}
            />
          </label>
          <p style={{ fontSize: '11px', color: '#666', marginTop: '-4px' }}>
            {t('debuffDialog.durationDesc', { frames: Math.round(durationSeconds * fps) })}
          </p>
        </div>

        {/* Preview */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('debuffDialog.preview')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: '#2a2a4a', borderRadius: '4px' }}>
            <DebuffIcon
              debuff={{
                ...previewDebuff,
                duration: durationSeconds,
                startFrame: 0,
              }}
              currentFrame={0}
              fps={fps}
            />
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
              background: '#ff00ff',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            {t('debuffDialog.apply')}
          </button>
        </div>
      </div>
    </div>
  );
}
