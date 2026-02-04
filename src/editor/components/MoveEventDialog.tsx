import React, { useState } from 'react';
import type { Position, MoveEvent } from '../../data/types';
import { useLanguage } from '../context/LanguageContext';

export interface MoveEventSettings {
  startFrame: number;
  duration: number;
  easing: MoveEvent['easing'];
}

interface MoveEventDialogProps {
  isOpen: boolean;
  playerIds: string[];
  fromPositions: Map<string, Position>;
  toPosition: Position;
  currentFrame: number;
  fps: number;
  onConfirm: (settings: MoveEventSettings) => void;
  onCancel: () => void;
}

export function MoveEventDialog({
  isOpen,
  playerIds,
  fromPositions,
  toPosition,
  currentFrame,
  fps,
  onConfirm,
  onCancel,
}: MoveEventDialogProps) {
  const { t } = useLanguage();
  const [startFrame, setStartFrame] = useState(currentFrame);
  const [duration, setDuration] = useState(fps); // Default 1 second
  const [easing, setEasing] = useState<MoveEvent['easing']>('easeInOut');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({ startFrame, duration, easing });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    color: '#aaa',
    marginBottom: '4px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px',
    background: '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '14px',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '8px',
          padding: '24px',
          width: '400px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#fff' }}>
          {t('moveDialog.title')}
        </h2>

        {/* Info */}
        <div
          style={{
            background: '#2a2a4a',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#ccc',
          }}
        >
          {playerIds.length === 1 ? (
            <>
              <div>{t('moveDialog.playerLabel')}<strong style={{ color: '#fff' }}>{playerIds[0]}</strong></div>
              <div style={{ marginTop: '4px' }}>
                {(() => {
                  const fromPos = fromPositions.get(playerIds[0]);
                  return fromPos
                    ? t('moveDialog.moveFromTo', { fromX: fromPos.x.toFixed(1), fromY: fromPos.y.toFixed(1), toX: toPosition.x.toFixed(1), toY: toPosition.y.toFixed(1) })
                    : t('moveDialog.moveTo', { toX: toPosition.x.toFixed(1), toY: toPosition.y.toFixed(1) });
                })()}
              </div>
            </>
          ) : (
            <>
              <div>
                {t('moveDialog.multiPlayerMove', { count: playerIds.length })}
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px' }}>
                {t('moveDialog.targets', { players: playerIds.join(', ') })}
              </div>
              <div style={{ marginTop: '4px' }}>
                {t('moveDialog.moveToPosition', { x: toPosition.x.toFixed(1), y: toPosition.y.toFixed(1) })}
              </div>
            </>
          )}
        </div>

        {/* Start Frame */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>{t('moveDialog.startFrame')}</label>
          <input
            type="number"
            value={startFrame}
            onChange={(e) => setStartFrame(Math.max(0, parseInt(e.target.value) || 0))}
            style={inputStyle}
            min={0}
          />
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            {t('moveDialog.startFrameDesc', { seconds: (startFrame / fps).toFixed(2) })}
          </div>
        </div>

        {/* Duration */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>{t('moveDialog.durationFrames')}</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
            style={inputStyle}
            min={1}
          />
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            {t('moveDialog.durationDesc', { seconds: (duration / fps).toFixed(2) })}
          </div>
        </div>

        {/* Easing */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>{t('moveDialog.easing')}</label>
          <select
            value={easing}
            onChange={(e) => setEasing(e.target.value as MoveEvent['easing'])}
            style={inputStyle}
          >
            <option value="linear">{t('moveDialog.linear')}</option>
            <option value="easeIn">{t('moveDialog.easeIn')}</option>
            <option value="easeOut">{t('moveDialog.easeOut')}</option>
            <option value="easeInOut">{t('moveDialog.easeInOut')}</option>
          </select>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            {easing === 'easeInOut' && t('moveDialog.easingDescEaseInOut')}
            {easing === 'linear' && t('moveDialog.easingDescLinear')}
            {easing === 'easeIn' && t('moveDialog.easingDescEaseIn')}
            {easing === 'easeOut' && t('moveDialog.easingDescEaseOut')}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              background: '#3a3a5a',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '8px 16px',
              background: '#3753c7',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {t('common.add')}
          </button>
        </div>
      </div>
    </div>
  );
}
