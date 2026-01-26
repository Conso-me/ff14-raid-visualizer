import React, { useState } from 'react';
import type { Position, MoveEvent } from '../../data/types';

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
          移動イベント追加
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
              <div>プレイヤー: <strong style={{ color: '#fff' }}>{playerIds[0]}</strong></div>
              <div style={{ marginTop: '4px' }}>
                {(() => {
                  const fromPos = fromPositions.get(playerIds[0]);
                  return fromPos
                    ? `移動: (${fromPos.x.toFixed(1)}, ${fromPos.y.toFixed(1)}) → (${toPosition.x.toFixed(1)}, ${toPosition.y.toFixed(1)})`
                    : `移動先: (${toPosition.x.toFixed(1)}, ${toPosition.y.toFixed(1)})`;
                })()}
              </div>
            </>
          ) : (
            <>
              <div>
                <strong style={{ color: '#ffcc00' }}>{playerIds.length}人</strong>を同じ場所に移動
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px' }}>
                対象: {playerIds.join(', ')}
              </div>
              <div style={{ marginTop: '4px' }}>
                移動先: ({toPosition.x.toFixed(1)}, {toPosition.y.toFixed(1)})
              </div>
            </>
          )}
        </div>

        {/* Start Frame */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>開始フレーム</label>
          <input
            type="number"
            value={startFrame}
            onChange={(e) => setStartFrame(Math.max(0, parseInt(e.target.value) || 0))}
            style={inputStyle}
            min={0}
          />
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            {(startFrame / fps).toFixed(2)}秒時点で移動開始
          </div>
        </div>

        {/* Duration */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>所要時間（フレーム）</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
            style={inputStyle}
            min={1}
          />
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            {(duration / fps).toFixed(2)}秒間かけて移動
          </div>
        </div>

        {/* Easing */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>イージング</label>
          <select
            value={easing}
            onChange={(e) => setEasing(e.target.value as MoveEvent['easing'])}
            style={inputStyle}
          >
            <option value="linear">Linear（一定速度）</option>
            <option value="easeIn">Ease In（加速）</option>
            <option value="easeOut">Ease Out（減速）</option>
            <option value="easeInOut">Ease In-Out（加速→減速）</option>
          </select>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            {easing === 'easeInOut' && '★ 自然な動きに推奨'}
            {easing === 'linear' && '機械的な一定速度の移動'}
            {easing === 'easeIn' && 'ゆっくり始まり加速'}
            {easing === 'easeOut' && '速く始まり減速して停止'}
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
            キャンセル
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
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
