import React from 'react';
import type { TextAnnotation } from '../../../data/types';

interface TextAnnotationPropertiesProps {
  annotation: TextAnnotation;
  showFrame: number;
  hideFrame: number | null;
  fps: number;
  onUpdate: (updates: Partial<TextAnnotation>) => void;
  onDelete: () => void;
  onUpdateTiming?: (showFrame: number, hideFrame: number | null) => void;
}

const FONT_SIZES = [12, 14, 16, 18, 24, 32];

export function TextAnnotationProperties({
  annotation,
  showFrame,
  hideFrame,
  fps,
  onUpdate,
  onDelete,
  onUpdateTiming,
}: TextAnnotationPropertiesProps) {
  const [editingShowFrame, setEditingShowFrame] = React.useState(showFrame);
  const [editingHideFrame, setEditingHideFrame] = React.useState(hideFrame ?? '');

  React.useEffect(() => {
    setEditingShowFrame(showFrame);
    setEditingHideFrame(hideFrame ?? '');
  }, [showFrame, hideFrame]);
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
          テキスト注釈
        </h3>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
          ID: {annotation.id}
        </div>
      </div>

      {/* Content */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          テキスト
          <textarea
            value={annotation.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
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
              value={annotation.position.x}
              onChange={(e) =>
                onUpdate({ position: { ...annotation.position, x: parseFloat(e.target.value) || 0 } })
              }
              step={0.5}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Y
            <input
              type="number"
              value={annotation.position.y}
              onChange={(e) =>
                onUpdate({ position: { ...annotation.position, y: parseFloat(e.target.value) || 0 } })
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <label style={labelStyle}>
            フォントサイズ
            <select
              value={annotation.fontSize}
              onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
              style={inputStyle}
            >
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            テキスト色
            <input
              type="color"
              value={annotation.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              style={{ ...inputStyle, padding: '2px', height: '36px' }}
            />
          </label>
        </div>

        <label style={labelStyle}>
          背景色
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={!!annotation.backgroundColor}
              onChange={(e) =>
                onUpdate({ backgroundColor: e.target.checked ? '#000000' : undefined })
              }
            />
            {annotation.backgroundColor && (
              <input
                type="color"
                value={annotation.backgroundColor}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                style={{ ...inputStyle, padding: '2px', height: '28px', width: '60px' }}
              />
            )}
          </div>
        </label>

        <label style={labelStyle}>
          配置
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            {(['left', 'center', 'right'] as const).map((a) => (
              <button
                key={a}
                onClick={() => onUpdate({ align: a })}
                style={{
                  flex: 1,
                  padding: '6px',
                  background: annotation.align === a ? '#4a4a7a' : '#2a2a4a',
                  border: '1px solid #3a3a5a',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                {a === 'left' ? '左' : a === 'center' ? '中央' : '右'}
              </button>
            ))}
          </div>
        </label>
      </div>

      {/* Timing */}
      <div style={sectionStyle}>
        <h4 style={{ margin: '0 0 8px', fontSize: '12px', color: '#aaa' }}>タイミング</h4>
        {onUpdateTiming ? (
          <>
            <label style={labelStyle}>
              表示開始 (フレーム)
              <input
                type="number"
                value={editingShowFrame}
                onChange={(e) => setEditingShowFrame(parseInt(e.target.value) || 0)}
                onBlur={() => onUpdateTiming(editingShowFrame, hideFrame)}
                min={0}
                step={1}
                style={inputStyle}
              />
              <span style={{ fontSize: '11px', color: '#888' }}>
                {(editingShowFrame / fps).toFixed(2)}秒
              </span>
            </label>
            <label style={labelStyle}>
              表示終了 (フレーム)
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={editingHideFrame}
                  onChange={(e) => setEditingHideFrame(e.target.value)}
                  onBlur={() => {
                    const val = editingHideFrame === '' ? null : parseInt(editingHideFrame as string) || null;
                    onUpdateTiming(showFrame, val);
                  }}
                  min={showFrame + 1}
                  step={1}
                  placeholder="永続表示"
                  style={{ ...inputStyle, flex: 1 }}
                />
                {hideFrame !== null && (
                  <button
                    onClick={() => onUpdateTiming(showFrame, null)}
                    style={{
                      padding: '6px 12px',
                      background: '#4a4a7a',
                      border: '1px solid #3a3a5a',
                      borderRadius: '4px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    削除
                  </button>
                )}
              </div>
              <span style={{ fontSize: '11px', color: '#888' }}>
                {editingHideFrame !== '' ? `${(parseInt(editingHideFrame as string) / fps).toFixed(2)}秒` : '永続表示'}
              </span>
            </label>
            {hideFrame !== null && (
              <div style={{ fontSize: '12px', color: '#ccc', marginTop: '8px' }}>
                表示時間: {((hideFrame - showFrame) / fps).toFixed(2)}秒
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: '12px', color: '#ccc' }}>
            <div>表示開始: {showFrame}f ({(showFrame / fps).toFixed(2)}秒)</div>
            {hideFrame !== null && (
              <div>表示終了: {hideFrame}f ({(hideFrame / fps).toFixed(2)}秒)</div>
            )}
            {hideFrame !== null && (
              <div>表示時間: {((hideFrame - showFrame) / fps).toFixed(2)}秒</div>
            )}
          </div>
        )}
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
