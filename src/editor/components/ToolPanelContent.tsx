import React from 'react';
import { useEditor } from '../context/EditorContext';
import type { Role, MarkerType, AoEType } from '../../data/types';

const TOOLS = [
  { id: 'select', label: 'Select', icon: '↖' },
  { id: 'move', label: 'Move', icon: '✋' },
  { id: 'add_move_event', label: '移動追加', icon: '→' },
] as const;

const ROLES: Role[] = ['T1', 'T2', 'H1', 'H2', 'D1', 'D2', 'D3', 'D4'];
const MARKERS: MarkerType[] = ['A', 'B', 'C', 'D', '1', '2', '3', '4'];
const AOE_TYPES: { type: AoEType; label: string; icon: string }[] = [
  { type: 'circle', label: '円形', icon: '○' },
  { type: 'cone', label: '扇形', icon: '◗' },
  { type: 'line', label: '直線', icon: '│' },
  { type: 'donut', label: 'ドーナツ', icon: '◎' },
  { type: 'cross', label: '十字', icon: '✚' },
];

export function ToolPanelContent() {
  const {
    state,
    setTool,
    setGridSnap,
    addPlayer,
    addEnemy,
    addMarker,
    updateField,
    setMechanic,
    setAoEType,
    updateMechanicMeta,
  } = useEditor();

  const buttonStyle = (active: boolean) => ({
    padding: '8px 12px',
    background: active ? '#4a4a7a' : '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  });

  const sectionStyle = {
    marginBottom: '20px',
  };

  const sectionTitleStyle = {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase' as const,
    marginBottom: '8px',
    letterSpacing: '0.5px',
  };

  const handleAddPlayer = (role: Role) => {
    const existingRoles = state.mechanic.initialPlayers.map((p) => p.role);
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

  const handleAddEnemy = () => {
    const id = `enemy_${Date.now()}`;
    addEnemy({
      id,
      name: 'Boss',
      position: { x: 0, y: 0 },
      size: 3,
      color: '#ff0000',
    });
  };

  const handleAddMarker = (type: MarkerType) => {
    addMarker({
      type,
      position: { x: 0, y: 0 },
    });
  };

  const handleSelectAoETool = () => {
    setTool('add_aoe');
  };

  const handleSelectAoEType = (type: AoEType) => {
    setAoEType(type);
  };

  const handlePreset8Players = () => {
    // Standard 8-player spread positions (clock positions)
    const positions: { role: Role; x: number; y: number }[] = [
      { role: 'T1', x: 0, y: -8 },
      { role: 'T2', x: 0, y: 8 },
      { role: 'H1', x: -8, y: 0 },
      { role: 'H2', x: 8, y: 0 },
      { role: 'D1', x: -6, y: -6 },
      { role: 'D2', x: 6, y: -6 },
      { role: 'D3', x: -6, y: 6 },
      { role: 'D4', x: 6, y: 6 },
    ];

    positions.forEach(({ role, x, y }) => {
      if (!state.mechanic.initialPlayers.find((p) => p.role === role)) {
        addPlayer({
          id: `player_${role}`,
          role,
          position: { x, y },
        });
      }
    });
  };

  const handlePresetMarkers = () => {
    const markerPositions: { type: MarkerType; x: number; y: number }[] = [
      { type: 'A', x: 0, y: -15 },
      { type: 'B', x: 15, y: 0 },
      { type: 'C', x: 0, y: 15 },
      { type: 'D', x: -15, y: 0 },
      { type: '1', x: -10.6, y: -10.6 },
      { type: '2', x: 10.6, y: -10.6 },
      { type: '3', x: 10.6, y: 10.6 },
      { type: '4', x: -10.6, y: 10.6 },
    ];

    markerPositions.forEach(({ type, x, y }) => {
      addMarker({ type, position: { x, y } });
    });
  };

  return (
    <div
      style={{
        background: '#1a1a2e',
        padding: '16px',
      }}
    >
      {/* Tools */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Tools</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id)}
              style={buttonStyle(state.tool === tool.id)}
            >
              <span>{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Snap */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Grid</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={state.gridSnap}
            onChange={(e) => setGridSnap(e.target.checked)}
          />
          Snap to grid (0.5 units)
        </label>
      </div>

      {/* Add Players */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Add Players</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          {ROLES.map((role) => {
            const exists = state.mechanic.initialPlayers.find((p) => p.role === role);
            return (
              <button
                key={role}
                onClick={() => handleAddPlayer(role)}
                disabled={!!exists}
                style={{
                  ...buttonStyle(false),
                  padding: '6px',
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

      {/* Add Enemy */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Add Enemy</div>
        <button onClick={handleAddEnemy} style={buttonStyle(false)}>
          + Add Enemy
        </button>
      </div>

      {/* Add Markers */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Add Markers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          {MARKERS.map((type) => (
            <button
              key={type}
              onClick={() => handleAddMarker(type)}
              style={{ ...buttonStyle(false), padding: '6px', justifyContent: 'center' }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Add AoE */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>AoE配置</div>

        {/* AoE placement mode button */}
        <button
          onClick={handleSelectAoETool}
          style={{
            ...buttonStyle(state.tool === 'add_aoe'),
            width: '100%',
            marginBottom: '8px',
            background: state.tool === 'add_aoe' ? '#ff6600' : '#2a2a4a',
          }}
        >
          {state.tool === 'add_aoe' ? '配置モード: ON' : 'AoE配置モード'}
        </button>

        {/* AoE type selection (shown when in add_aoe mode) */}
        {state.tool === 'add_aoe' && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>
              タイプを選択:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
              {AOE_TYPES.map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => handleSelectAoEType(type)}
                  style={{
                    padding: '6px 8px',
                    background: state.selectedAoEType === type ? '#ff6600' : '#3a3a5a',
                    border: '1px solid #4a4a6a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '8px', textAlign: 'center' }}>
              フィールドをクリックして配置
            </div>
          </div>
        )}
      </div>

      {/* Add Debuff */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>デバフ付与</div>

        {/* Debuff mode button */}
        <button
          onClick={() => setTool('add_debuff')}
          style={{
            ...buttonStyle(state.tool === 'add_debuff'),
            width: '100%',
            marginBottom: '8px',
            background: state.tool === 'add_debuff' ? '#ff00ff' : '#2a2a4a',
          }}
        >
          {state.tool === 'add_debuff' ? '付与モード: ON' : 'デバフ付与モード'}
        </button>

        {state.tool === 'add_debuff' && (
          <div style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>
            プレイヤーをクリックして選択
          </div>
        )}
      </div>

      {/* Add Text Annotation */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>テキスト注釈</div>
        <button
          onClick={() => setTool('add_text')}
          style={{
            ...buttonStyle(state.tool === 'add_text'),
            width: '100%',
            background: state.tool === 'add_text' ? '#00aaff' : '#2a2a4a',
          }}
        >
          {state.tool === 'add_text' ? '配置モード: ON' : 'テキスト配置'}
        </button>
        {state.tool === 'add_text' && (
          <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginTop: '4px' }}>
            フィールドをクリックして配置
          </div>
        )}
      </div>

      {/* Add Object */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>オブジェクト配置</div>
        <button
          onClick={() => setTool('add_object')}
          style={{
            ...buttonStyle(state.tool === 'add_object'),
            width: '100%',
            background: state.tool === 'add_object' ? '#ffaa00' : '#2a2a4a',
          }}
        >
          {state.tool === 'add_object' ? '配置モード: ON' : 'オブジェクト配置'}
        </button>
        {state.tool === 'add_object' && (
          <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginTop: '4px' }}>
            フィールドをクリックして配置
          </div>
        )}
      </div>

      {/* Presets */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Presets</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button onClick={handlePreset8Players} style={buttonStyle(false)}>
            8-Player Setup
          </button>
          <button onClick={handlePresetMarkers} style={buttonStyle(false)}>
            Standard Markers
          </button>
        </div>
      </div>

      {/* Field Settings */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Field</div>
        <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>
          <span style={{ color: '#888' }}>Type</span>
          <select
            value={state.mechanic.field.type}
            onChange={(e) => updateField({ type: e.target.value as 'circle' | 'square' | 'rectangle' })}
            style={{
              width: '100%',
              marginTop: '4px',
              padding: '6px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
            }}
          >
            <option value="circle">Circle</option>
            <option value="square">Square</option>
            <option value="rectangle">Rectangle</option>
          </select>
        </label>

        {/* Rectangle dimensions */}
        {state.mechanic.field.type === 'rectangle' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '12px' }}>
              <span style={{ color: '#888' }}>Width</span>
              <input
                type="number"
                value={state.mechanic.field.width || state.mechanic.field.size}
                onChange={(e) => updateField({ width: parseFloat(e.target.value) || 40 })}
                min={10}
                max={100}
                step={5}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '6px',
                  background: '#2a2a4a',
                  border: '1px solid #3a3a5a',
                  borderRadius: '4px',
                  color: '#fff',
                }}
              />
            </label>
            <label style={{ display: 'block', fontSize: '12px' }}>
              <span style={{ color: '#888' }}>Height</span>
              <input
                type="number"
                value={state.mechanic.field.height || state.mechanic.field.size}
                onChange={(e) => updateField({ height: parseFloat(e.target.value) || 40 })}
                min={10}
                max={100}
                step={5}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '6px',
                  background: '#2a2a4a',
                  border: '1px solid #3a3a5a',
                  borderRadius: '4px',
                  color: '#fff',
                }}
              />
            </label>
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', marginBottom: '8px' }}>
          <input
            type="checkbox"
            checked={state.mechanic.field.gridEnabled}
            onChange={(e) => updateField({ gridEnabled: e.target.checked })}
          />
          Show grid
        </label>

        {/* Background image */}
        <div style={{ marginTop: '12px', borderTop: '1px solid #3a3a5a', paddingTop: '12px' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>背景画像</div>
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
              fontSize: '11px',
              marginBottom: '8px',
            }}
          />
          {state.mechanic.field.backgroundImage && (
            <>
              <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                透明度: {Math.round((state.mechanic.field.backgroundOpacity ?? 0.5) * 100)}%
                <input
                  type="range"
                  value={state.mechanic.field.backgroundOpacity ?? 0.5}
                  onChange={(e) => updateField({ backgroundOpacity: parseFloat(e.target.value) })}
                  min={0.1}
                  max={1}
                  step={0.1}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                  }}
                />
              </label>
              <button
                onClick={() => updateField({ backgroundImage: undefined, backgroundOpacity: undefined })}
                style={{
                  padding: '4px 8px',
                  background: '#6b2020',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '11px',
                  cursor: 'pointer',
                  marginTop: '4px',
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
        <div style={sectionTitleStyle}>Video</div>
        <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>
          <span style={{ color: '#888' }}>長さ (秒)</span>
          <input
            type="number"
            min={1}
            max={600}
            step={1}
            value={Math.round(state.mechanic.durationFrames / state.mechanic.fps)}
            onChange={(e) => {
              const seconds = Math.max(1, Math.min(600, parseInt(e.target.value) || 10));
              updateMechanicMeta({ durationFrames: seconds * state.mechanic.fps });
            }}
            style={{
              width: '100%',
              marginTop: '4px',
              padding: '6px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
            }}
          />
          <span style={{ fontSize: '10px', color: '#666' }}>
            {state.mechanic.durationFrames}フレーム @ {state.mechanic.fps}fps
          </span>
        </label>
        <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px' }}>
          <span style={{ color: '#888' }}>FPS</span>
          <select
            value={state.mechanic.fps}
            onChange={(e) => {
              const newFps = parseInt(e.target.value);
              const currentSeconds = state.mechanic.durationFrames / state.mechanic.fps;
              updateMechanicMeta({
                fps: newFps,
                durationFrames: Math.round(currentSeconds * newFps)
              });
            }}
            style={{
              width: '100%',
              marginTop: '4px',
              padding: '6px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
            }}
          >
            <option value={24}>24 fps</option>
            <option value={30}>30 fps</option>
            <option value={60}>60 fps</option>
          </select>
        </label>
      </div>
    </div>
  );
}
