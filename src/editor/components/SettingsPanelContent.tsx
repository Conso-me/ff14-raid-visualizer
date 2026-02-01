import React from 'react';
import { useEditor } from '../context/EditorContext';
import type { Role, MarkerType } from '../../data/types';

const ROLES: Role[] = ['T1', 'T2', 'H1', 'H2', 'D1', 'D2', 'D3', 'D4'];
const MARKERS: MarkerType[] = ['A', 'B', 'C', 'D', '1', '2', '3', '4'];

export function SettingsPanelContent() {
  const { state, updateField, updateMechanicMeta, addPlayer, addMarker } = useEditor();
  const { mechanic } = state;

  const inputStyle = {
    width: '100%',
    padding: '8px',
    background: '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '13px',
  };

  const sectionStyle = {
    marginBottom: '16px',
  };

  const sectionTitleStyle = {
    fontSize: '12px',
    color: '#888',
    textTransform: 'uppercase' as const,
    marginBottom: '10px',
    letterSpacing: '0.5px',
  };

  const buttonStyle = (active: boolean) => ({
    padding: '10px 14px',
    background: active ? '#4a4a7a' : '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  });

  const handleAddPlayer = (role: Role) => {
    const existingRoles = mechanic.initialPlayers.map((p) => p.role);
    if (existingRoles.includes(role)) {
      alert(`Player ${role} already exists`);
      return;
    }
    addPlayer({
      id: `player_${role}`,
      role,
      position: { x: 0, y: 0 },
    });
  };

  const handleAddMarker = (type: MarkerType) => {
    addMarker({
      type,
      position: { x: 0, y: 0 },
    });
  };

  return (
    <div style={{ background: '#1a1a2e', padding: '16px' }}>
      {/* Field Settings */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>フィールド設定</div>

        <label style={{ display: 'block', fontSize: '13px', marginBottom: '12px' }}>
          <span style={{ color: '#888', display: 'block', marginBottom: '4px' }}>タイプ</span>
          <select
            value={mechanic.field.type}
            onChange={(e) => updateField({ type: e.target.value as 'circle' | 'square' | 'rectangle' })}
            style={inputStyle}
          >
            <option value="circle">Circle</option>
            <option value="square">Square</option>
            <option value="rectangle">Rectangle</option>
          </select>
        </label>

        {mechanic.field.type === 'rectangle' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px' }}>
              <span style={{ color: '#888', display: 'block', marginBottom: '4px' }}>幅</span>
              <input
                type="number"
                value={mechanic.field.width || mechanic.field.size}
                onChange={(e) => updateField({ width: parseFloat(e.target.value) || 40 })}
                min={10}
                max={100}
                step={5}
                style={inputStyle}
              />
            </label>
            <label style={{ display: 'block', fontSize: '13px' }}>
              <span style={{ color: '#888', display: 'block', marginBottom: '4px' }}>高さ</span>
              <input
                type="number"
                value={mechanic.field.height || mechanic.field.size}
                onChange={(e) => updateField({ height: parseFloat(e.target.value) || 40 })}
                min={10}
                max={100}
                step={5}
                style={inputStyle}
              />
            </label>
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '12px' }}>
          <input
            type="checkbox"
            checked={mechanic.field.gridEnabled}
            onChange={(e) => updateField({ gridEnabled: e.target.checked })}
          />
          グリッドを表示
        </label>

        {/* Background image */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '12px' }}>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>背景画像</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  updateField({ backgroundImage: event.target?.result as string });
                };
                reader.readAsDataURL(file);
              }
            }}
            style={{
              width: '100%',
              fontSize: '12px',
              marginBottom: '8px',
              color: '#fff',
            }}
          />
          {mechanic.field.backgroundImage && (
            <>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                透明度: {Math.round((mechanic.field.backgroundOpacity ?? 0.5) * 100)}%
                <input
                  type="range"
                  value={mechanic.field.backgroundOpacity ?? 0.5}
                  onChange={(e) => updateField({ backgroundOpacity: parseFloat(e.target.value) })}
                  min={0.1}
                  max={1}
                  step={0.1}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </label>
              <button
                onClick={() => updateField({ backgroundImage: undefined, backgroundOpacity: undefined })}
                style={{
                  padding: '6px 10px',
                  background: '#6b2020',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                背景画像を削除
              </button>
            </>
          )}
        </div>
      </div>

      {/* Video Settings */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>動画設定</div>

        <label style={{ display: 'block', fontSize: '13px', marginBottom: '12px' }}>
          <span style={{ color: '#888', display: 'block', marginBottom: '4px' }}>長さ (秒)</span>
          <input
            type="number"
            min={1}
            max={600}
            step={1}
            value={Math.round(mechanic.durationFrames / mechanic.fps)}
            onChange={(e) => {
              const seconds = Math.max(1, Math.min(600, parseInt(e.target.value) || 10));
              updateMechanicMeta({ durationFrames: seconds * mechanic.fps });
            }}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#666', display: 'block', marginTop: '2px' }}>
            {mechanic.durationFrames}フレーム @ {mechanic.fps}fps
          </span>
        </label>

        <label style={{ display: 'block', fontSize: '13px', marginBottom: '12px' }}>
          <span style={{ color: '#888', display: 'block', marginBottom: '4px' }}>FPS</span>
          <select
            value={mechanic.fps}
            onChange={(e) => {
              const newFps = parseInt(e.target.value);
              const currentSeconds = mechanic.durationFrames / mechanic.fps;
              updateMechanicMeta({
                fps: newFps,
                durationFrames: Math.round(currentSeconds * newFps),
              });
            }}
            style={inputStyle}
          >
            <option value={24}>24 fps</option>
            <option value={30}>30 fps</option>
            <option value={60}>60 fps</option>
          </select>
        </label>
      </div>

      {/* Add Players */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Add Players</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {ROLES.map((role) => {
            const exists = mechanic.initialPlayers.find((p) => p.role === role);
            return (
              <button
                key={role}
                onClick={() => handleAddPlayer(role)}
                disabled={!!exists}
                style={{
                  ...buttonStyle(false),
                  padding: '8px',
                  justifyContent: 'center',
                  opacity: exists ? 0.4 : 1,
                }}
              >
                {role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Markers */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Add Markers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {MARKERS.map((type) => (
            <button
              key={type}
              onClick={() => handleAddMarker(type)}
              style={{ ...buttonStyle(false), padding: '8px', justifyContent: 'center' }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
