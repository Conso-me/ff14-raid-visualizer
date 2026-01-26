import React, { useState, useEffect } from 'react';
import type { Position, TextAnnotation } from '../../data/types';
import type { TextSettings } from '../context/editorReducer';

interface TextAnnotationDialogProps {
  isOpen: boolean;
  position: Position;
  currentFrame: number;
  fps: number;
  onConfirm: (settings: TextSettings) => void;
  onCancel: () => void;
}

const FONT_SIZES = [12, 14, 16, 18, 24, 32];

export function TextAnnotationDialog({
  isOpen,
  position,
  currentFrame,
  fps,
  onConfirm,
  onCancel,
}: TextAnnotationDialogProps) {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [color, setColor] = useState('#ffffff');
  const [hasBackground, setHasBackground] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');
  const [startFrame, setStartFrame] = useState(currentFrame);
  const [endFrame, setEndFrame] = useState(currentFrame + 90);

  // Reset start frame when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStartFrame(currentFrame);
      setEndFrame(currentFrame + 90);
    }
  }, [isOpen, currentFrame]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!text.trim()) {
      alert('テキストを入力してください');
      return;
    }

    const annotation: TextAnnotation = {
      id: `text-${Date.now()}`,
      text,
      position,
      fontSize,
      color,
      backgroundColor: hasBackground ? backgroundColor : undefined,
      align,
    };

    onConfirm({
      annotation,
      startFrame,
      endFrame,
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
          テキスト注釈追加
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

        {/* Text content */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>テキスト内容</div>
          <label style={labelStyle}>
            テキスト
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="表示するテキストを入力..."
              rows={3}
              style={{
                ...inputStyle,
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </label>
        </div>

        {/* Appearance settings */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>見た目</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={labelStyle}>
              フォントサイズ
              <select
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
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
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ ...inputStyle, padding: '2px', height: '36px' }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={hasBackground}
                onChange={(e) => setHasBackground(e.target.checked)}
              />
              背景色を使用
            </label>

            {hasBackground && (
              <label style={labelStyle}>
                背景色
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  style={{ ...inputStyle, padding: '2px', height: '36px' }}
                />
              </label>
            )}
          </div>

          <label style={{ ...labelStyle, marginTop: '8px' }}>
            配置
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {(['left', 'center', 'right'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAlign(a)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    background: align === a ? '#4a4a7a' : '#2a2a4a',
                    border: '1px solid #3a3a5a',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {a === 'left' ? '左' : a === 'center' ? '中央' : '右'}
                </button>
              ))}
            </div>
          </label>
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
            表示終了フレーム
            <input
              type="number"
              value={endFrame}
              onChange={(e) => setEndFrame(parseInt(e.target.value) || 0)}
              min={startFrame + 1}
              step={1}
              style={inputStyle}
            />
          </label>
          <p style={{ fontSize: '11px', color: '#666', marginTop: '-4px', marginBottom: '8px' }}>
            {(endFrame / fps).toFixed(2)}秒時点で非表示 (表示時間: {((endFrame - startFrame) / fps).toFixed(2)}秒)
          </p>
        </div>

        {/* Preview */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>プレビュー</div>
          <div
            style={{
              padding: '16px',
              background: '#0a0a1a',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
            }}
          >
            <span
              style={{
                fontSize: `${fontSize}px`,
                color,
                backgroundColor: hasBackground ? backgroundColor : 'transparent',
                padding: hasBackground ? '4px 8px' : 0,
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {text || 'サンプルテキスト'}
            </span>
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
              background: '#00aaff',
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
