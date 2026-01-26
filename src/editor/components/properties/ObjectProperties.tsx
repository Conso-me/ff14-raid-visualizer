import React from 'react';
import type { GimmickObject } from '../../../data/types';

interface ObjectPropertiesProps {
  object: GimmickObject;
  showFrame: number;
  hideFrame: number | null;
  fps: number;
  onUpdate: (updates: Partial<GimmickObject>) => void;
  onDelete: () => void;
}

const SHAPES: Array<{ value: GimmickObject['shape']; label: string; icon: string }> = [
  { value: 'circle', label: '円', icon: '●' },
  { value: 'square', label: '四角', icon: '■' },
  { value: 'triangle', label: '三角', icon: '▲' },
  { value: 'diamond', label: 'ひし形', icon: '◆' },
];

export function ObjectProperties({
  object,
  showFrame,
  hideFrame,
  fps,
  onUpdate,
  onDelete,
}: ObjectPropertiesProps) {
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
          {object.icon && <span style={{ marginRight: '6px' }}>{object.icon}</span>}
          オブジェクト
        </h3>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
          ID: {object.id}
        </div>
      </div>

      {/* Basic */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          名前
          <input
            type="text"
            value={object.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          アイコン (絵文字)
          <input
            type="text"
            value={object.icon || ''}
            onChange={(e) => onUpdate({ icon: e.target.value || undefined })}
            placeholder="任意"
            maxLength={2}
            style={{ ...inputStyle, textAlign: 'center', fontSize: '16px' }}
          />
        </label>
      </div>

      {/* Position */}
      <div style={sectionStyle}>
        <h4 style={{ margin: '0 0 8px', fontSize: '12px', color: '#aaa' }}>位置</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <label style={labelStyle}>
            X
            <input
              type="number"
              value={object.position.x}
              onChange={(e) =>
                onUpdate({ position: { ...object.position, x: parseFloat(e.target.value) || 0 } })
              }
              step={0.5}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Y
            <input
              type="number"
              value={object.position.y}
              onChange={(e) =>
                onUpdate({ position: { ...object.position, y: parseFloat(e.target.value) || 0 } })
              }
              step={0.5}
              style={inputStyle}
            />
          </label>
        </div>
      </div>

      {/* Appearance */}
      <div style={sectionStyle}>
        <h4 style={{ margin: '0 0 8px', fontSize: '12px', color: '#aaa' }}>見た目</h4>

        <label style={labelStyle}>
          形状
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '4px' }}>
            {SHAPES.map((s) => (
              <button
                key={s.value}
                onClick={() => onUpdate({ shape: s.value })}
                style={{
                  padding: '6px',
                  background: object.shape === s.value ? '#4a4a7a' : '#2a2a4a',
                  border: '1px solid #3a3a5a',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <span>{s.icon}</span>
                <span style={{ fontSize: '9px' }}>{s.label}</span>
              </button>
            ))}
          </div>
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <label style={labelStyle}>
            サイズ
            <input
              type="number"
              value={object.size}
              onChange={(e) => onUpdate({ size: parseFloat(e.target.value) || 1 })}
              min={0.5}
              max={10}
              step={0.5}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            色
            <input
              type="color"
              value={object.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              style={{ ...inputStyle, padding: '2px', height: '36px' }}
            />
          </label>
        </div>

        <label style={labelStyle}>
          不透明度
          <input
            type="range"
            value={object.opacity ?? 1}
            onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
            min={0.1}
            max={1}
            step={0.1}
            style={{ ...inputStyle, padding: 0 }}
          />
          <span style={{ fontSize: '11px', color: '#888' }}>{((object.opacity ?? 1) * 100).toFixed(0)}%</span>
        </label>
      </div>

      {/* Timing */}
      <div style={sectionStyle}>
        <h4 style={{ margin: '0 0 8px', fontSize: '12px', color: '#aaa' }}>タイミング</h4>
        <div style={{ fontSize: '12px', color: '#ccc' }}>
          <div>表示開始: {showFrame}f ({(showFrame / fps).toFixed(2)}秒)</div>
          {hideFrame !== null ? (
            <>
              <div>表示終了: {hideFrame}f ({(hideFrame / fps).toFixed(2)}秒)</div>
              <div>表示時間: {((hideFrame - showFrame) / fps).toFixed(2)}秒</div>
            </>
          ) : (
            <div style={{ color: '#888' }}>終了なし (永続表示)</div>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
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
        削除
      </button>
    </div>
  );
}
