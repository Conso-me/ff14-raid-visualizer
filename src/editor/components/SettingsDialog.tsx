import React, { useState } from 'react';
import { useEditor } from '../context/EditorContext';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { state, updateField, updateMechanicMeta } = useEditor();
  const { mechanic } = state;
  const [activeTab, setActiveTab] = useState<'field' | 'video'>('field');

  if (!isOpen) return null;

  const tabStyle = (active: boolean) => ({
    padding: '10px 20px',
    background: active ? '#3753c7' : '#2a2a4a',
    border: 'none',
    color: '#fff',
    fontSize: '13px',
    cursor: 'pointer',
    borderBottom: active ? '2px solid #4a7aff' : '2px solid transparent',
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '8px',
          border: '1px solid #3a3a5a',
          width: '500px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #3a3a5a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>設定</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #3a3a5a' }}>
          <button
            style={tabStyle(activeTab === 'field')}
            onClick={() => setActiveTab('field')}
          >
            フィールド
          </button>
          <button
            style={tabStyle(activeTab === 'video')}
            onClick={() => setActiveTab('video')}
          >
            動画設定
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflow: 'auto' }}>
          {activeTab === 'field' && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '16px' }}>
                <span style={{ color: '#888', display: 'block', marginBottom: '6px' }}>タイプ</span>
                <select
                  value={mechanic.field.type}
                  onChange={(e) => updateField({ type: e.target.value as 'circle' | 'square' | 'rectangle' })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#2a2a4a',
                    border: '1px solid #3a3a5a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                >
                  <option value="circle">Circle</option>
                  <option value="square">Square</option>
                  <option value="rectangle">Rectangle</option>
                </select>
              </label>

              {mechanic.field.type === 'rectangle' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px' }}>
                    <span style={{ color: '#888', display: 'block', marginBottom: '6px' }}>幅</span>
                    <input
                      type="number"
                      value={mechanic.field.width || mechanic.field.size}
                      onChange={(e) => updateField({ width: parseFloat(e.target.value) || 40 })}
                      min={10}
                      max={100}
                      step={5}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#2a2a4a',
                        border: '1px solid #3a3a5a',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '14px',
                      }}
                    />
                  </label>
                  <label style={{ display: 'block', fontSize: '14px' }}>
                    <span style={{ color: '#888', display: 'block', marginBottom: '6px' }}>高さ</span>
                    <input
                      type="number"
                      value={mechanic.field.height || mechanic.field.size}
                      onChange={(e) => updateField({ height: parseFloat(e.target.value) || 40 })}
                      min={10}
                      max={100}
                      step={5}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#2a2a4a',
                        border: '1px solid #3a3a5a',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '14px',
                      }}
                    />
                  </label>
                </div>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  checked={mechanic.field.gridEnabled}
                  onChange={(e) => updateField({ gridEnabled: e.target.checked })}
                />
                グリッドを表示
              </label>

              {/* Background image */}
              <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '20px' }}>
                <div style={{ fontSize: '14px', color: '#888', marginBottom: '12px' }}>背景画像</div>
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
                    fontSize: '13px',
                    marginBottom: '12px',
                    color: '#fff',
                  }}
                />
                {mechanic.field.backgroundImage && (
                  <>
                    <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '10px' }}>
                      透明度: {Math.round((mechanic.field.backgroundOpacity ?? 0.5) * 100)}%
                      <input
                        type="range"
                        value={mechanic.field.backgroundOpacity ?? 0.5}
                        onChange={(e) => updateField({ backgroundOpacity: parseFloat(e.target.value) })}
                        min={0.1}
                        max={1}
                        step={0.1}
                        style={{
                          width: '100%',
                          marginTop: '8px',
                        }}
                      />
                    </label>
                    <button
                      onClick={() => updateField({ backgroundImage: undefined, backgroundOpacity: undefined })}
                      style={{
                        padding: '8px 12px',
                        background: '#6b2020',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      背景画像を削除
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '16px' }}>
                <span style={{ color: '#888', display: 'block', marginBottom: '6px' }}>長さ (秒)</span>
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
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#2a2a4a',
                    border: '1px solid #3a3a5a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
                <span style={{ fontSize: '12px', color: '#666', display: 'block', marginTop: '4px' }}>
                  {mechanic.durationFrames}フレーム @ {mechanic.fps}fps
                </span>
              </label>

              <label style={{ display: 'block', fontSize: '14px', marginBottom: '16px' }}>
                <span style={{ color: '#888', display: 'block', marginBottom: '6px' }}>FPS</span>
                <select
                  value={mechanic.fps}
                  onChange={(e) => {
                    const newFps = parseInt(e.target.value);
                    const currentSeconds = mechanic.durationFrames / mechanic.fps;
                    updateMechanicMeta({
                      fps: newFps,
                      durationFrames: Math.round(currentSeconds * newFps)
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#2a2a4a',
                    border: '1px solid #3a3a5a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                >
                  <option value={24}>24 fps</option>
                  <option value={30}>30 fps</option>
                  <option value={60}>60 fps</option>
                </select>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #3a3a5a',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              background: '#3753c7',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
