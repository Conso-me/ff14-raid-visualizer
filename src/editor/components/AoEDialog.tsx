import React, { useState, useEffect } from 'react';
import type { Position, AoEType } from '../../data/types';
import type { AoESettings } from '../context/editorReducer';

interface AoEDialogProps {
  isOpen: boolean;
  position: Position;
  type: AoEType;
  currentFrame: number;
  fps: number;
  onConfirm: (settings: AoESettings) => void;
  onCancel: () => void;
}

function getDefaultParams(type: AoEType): Record<string, number> {
  switch (type) {
    case 'circle':
      return { radius: 5 };
    case 'cone':
      return { angle: 90, direction: 0, length: 15 };
    case 'line':
      return { width: 4, length: 20, direction: 0 };
    case 'donut':
      return { innerRadius: 5, outerRadius: 12 };
    case 'cross':
      return { width: 4, length: 20 };
    default:
      return {};
  }
}

function getTypeName(type: AoEType): string {
  const names: Record<AoEType, string> = {
    circle: '円形',
    cone: '扇形',
    line: '直線',
    donut: 'ドーナツ',
    cross: '十字',
  };
  return names[type];
}

export function AoEDialog({
  isOpen,
  position,
  type,
  currentFrame,
  fps,
  onConfirm,
  onCancel,
}: AoEDialogProps) {
  const [params, setParams] = useState<Record<string, number>>(getDefaultParams(type));
  const [color, setColor] = useState('#ff6600');
  const [opacity, setOpacity] = useState(0.5);
  const [startFrame, setStartFrame] = useState(currentFrame);
  const [duration, setDuration] = useState(60);
  const [fadeInDuration, setFadeInDuration] = useState(10);
  const [fadeOutDuration, setFadeOutDuration] = useState(15);

  // Reset params when type changes
  useEffect(() => {
    setParams(getDefaultParams(type));
  }, [type]);

  // Reset start frame when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStartFrame(currentFrame);
    }
  }, [isOpen, currentFrame]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      type,
      position,
      ...params,
      color,
      opacity,
      startFrame,
      duration,
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
          AoE追加 - {getTypeName(type)}
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
          <label style={{ ...labelStyle, marginBottom: 0 }}>配置位置</label>
          <p style={{ margin: '4px 0 0', color: '#fff', fontSize: '13px' }}>
            X: {position.x.toFixed(1)}, Y: {position.y.toFixed(1)}
          </p>
        </div>

        {/* Size settings */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>サイズ設定</div>

          {type === 'circle' && (
            <label style={labelStyle}>
              半径
              <input
                type="number"
                value={params.radius || 5}
                onChange={(e) => setParams({ ...params, radius: parseFloat(e.target.value) || 0 })}
                min={1}
                max={30}
                step={0.5}
                style={inputStyle}
              />
            </label>
          )}

          {type === 'cone' && (
            <>
              <label style={labelStyle}>
                角度（度）
                <input
                  type="number"
                  value={params.angle || 90}
                  onChange={(e) => setParams({ ...params, angle: parseFloat(e.target.value) || 0 })}
                  min={10}
                  max={360}
                  step={5}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                方向（度）※0=北
                <input
                  type="number"
                  value={params.direction ?? 0}
                  onChange={(e) => setParams({ ...params, direction: parseFloat(e.target.value) || 0 })}
                  min={-180}
                  max={180}
                  step={5}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                長さ
                <input
                  type="number"
                  value={params.length || 15}
                  onChange={(e) => setParams({ ...params, length: parseFloat(e.target.value) || 0 })}
                  min={1}
                  max={40}
                  step={0.5}
                  style={inputStyle}
                />
              </label>
            </>
          )}

          {type === 'line' && (
            <>
              <label style={labelStyle}>
                幅
                <input
                  type="number"
                  value={params.width || 4}
                  onChange={(e) => setParams({ ...params, width: parseFloat(e.target.value) || 0 })}
                  min={1}
                  max={20}
                  step={0.5}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                長さ
                <input
                  type="number"
                  value={params.length || 20}
                  onChange={(e) => setParams({ ...params, length: parseFloat(e.target.value) || 0 })}
                  min={1}
                  max={50}
                  step={0.5}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                方向（度）※0=北
                <input
                  type="number"
                  value={params.direction ?? 0}
                  onChange={(e) => setParams({ ...params, direction: parseFloat(e.target.value) || 0 })}
                  min={-180}
                  max={180}
                  step={5}
                  style={inputStyle}
                />
              </label>
            </>
          )}

          {type === 'donut' && (
            <>
              <label style={labelStyle}>
                内側半径（安全地帯）
                <input
                  type="number"
                  value={params.innerRadius || 5}
                  onChange={(e) => setParams({ ...params, innerRadius: parseFloat(e.target.value) || 0 })}
                  min={1}
                  max={20}
                  step={0.5}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                外側半径
                <input
                  type="number"
                  value={params.outerRadius || 12}
                  onChange={(e) => setParams({ ...params, outerRadius: parseFloat(e.target.value) || 0 })}
                  min={2}
                  max={30}
                  step={0.5}
                  style={inputStyle}
                />
              </label>
            </>
          )}

          {type === 'cross' && (
            <>
              <label style={labelStyle}>
                幅
                <input
                  type="number"
                  value={params.width || 4}
                  onChange={(e) => setParams({ ...params, width: parseFloat(e.target.value) || 0 })}
                  min={1}
                  max={20}
                  step={0.5}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                長さ
                <input
                  type="number"
                  value={params.length || 20}
                  onChange={(e) => setParams({ ...params, length: parseFloat(e.target.value) || 0 })}
                  min={1}
                  max={40}
                  step={0.5}
                  style={inputStyle}
                />
              </label>
            </>
          )}
        </div>

        {/* Appearance settings */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>見た目</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={labelStyle}>
              色
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ ...inputStyle, padding: '2px', height: '36px' }}
              />
            </label>
            <label style={labelStyle}>
              不透明度
              <input
                type="number"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value) || 0)}
                min={0.1}
                max={1}
                step={0.1}
                style={inputStyle}
              />
            </label>
          </div>
        </div>

        {/* Timing settings */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>タイミング</div>

          <label style={labelStyle}>
            表示開始フレーム
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
            {(startFrame / fps).toFixed(2)}秒時点で表示開始
          </p>

          <label style={labelStyle}>
            表示時間（フレーム）
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              min={1}
              step={1}
              style={inputStyle}
            />
          </label>
          <p style={{ fontSize: '11px', color: '#666', marginTop: '-4px', marginBottom: '8px' }}>
            {(duration / fps).toFixed(2)}秒間表示
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>
                フェードイン（フレーム）
                <input
                  type="number"
                  value={fadeInDuration}
                  onChange={(e) => setFadeInDuration(parseInt(e.target.value) || 0)}
                  min={0}
                  step={1}
                  style={inputStyle}
                />
              </label>
              <p style={{ fontSize: '11px', color: '#666', marginTop: '-4px' }}>
                {(fadeInDuration / fps).toFixed(2)}秒
              </p>
            </div>
            <div>
              <label style={labelStyle}>
                フェードアウト（フレーム）
                <input
                  type="number"
                  value={fadeOutDuration}
                  onChange={(e) => setFadeOutDuration(parseInt(e.target.value) || 0)}
                  min={0}
                  step={1}
                  style={inputStyle}
                />
              </label>
              <p style={{ fontSize: '11px', color: '#666', marginTop: '-4px' }}>
                {(fadeOutDuration / fps).toFixed(2)}秒
              </p>
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
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '8px 16px',
              background: '#ff6600',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
