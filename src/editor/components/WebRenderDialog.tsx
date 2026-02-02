// ブラウザ内動画レンダリングダイアログ

import React, { useState, useEffect } from 'react';
import type { MechanicData } from '../../data/types';
import { useWebRenderer } from '../hooks/useWebRenderer';
import type { WebRenderSettings } from '../utils/webRenderer';

interface WebRenderDialogProps {
  isOpen: boolean;
  mechanic: MechanicData;
  onClose: () => void;
}

type ContainerType = 'mp4' | 'webm';
type QualityType = WebRenderSettings['quality'];

interface ScaleOption {
  value: number;
  label: string;
  resolution: string;
}

const SCALE_OPTIONS: ScaleOption[] = [
  { value: 0.5, label: '低', resolution: '960x540' },
  { value: 0.75, label: '中', resolution: '1440x810' },
  { value: 1.0, label: '高', resolution: '1920x1080' },
];

const QUALITY_OPTIONS: { value: QualityType; label: string }[] = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'very-high', label: '最高' },
];

export function WebRenderDialog({ isOpen, mechanic, onClose }: WebRenderDialogProps) {
  const [fileName, setFileName] = useState(mechanic.name || mechanic.id || 'mechanic');
  const [container, setContainer] = useState<ContainerType>('mp4');
  const [quality, setQuality] = useState<QualityType>('medium');
  const [scale, setScale] = useState<number>(0.5);

  const {
    status,
    progress,
    error,
    videoBlob,
    compatibility,
    startRender,
    cancelRender,
    downloadVideo,
    reset,
    checkCompatibility,
  } = useWebRenderer();

  // ダイアログを開いた時に互換性チェック
  useEffect(() => {
    if (isOpen) {
      checkCompatibility({ container, scale });
    }
  }, [isOpen, container, scale, checkCompatibility]);

  // ESC キーで閉じる（レンダリング中は無効）
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'rendering' && status !== 'checking') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, status]);

  // ダイアログが閉じる時にリセット
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const durationSeconds = mechanic.durationFrames / mechanic.fps;
  const currentScale = SCALE_OPTIONS.find((s) => s.value === scale) ?? SCALE_OPTIONS[0];

  const handleStartRender = () => {
    startRender(mechanic, { container, quality, scale });
  };

  const handleDownload = () => {
    downloadVideo(fileName, container);
  };

  const handleClose = () => {
    if (status === 'rendering') return;
    onClose();
  };

  // --- スタイル ---
  const inputStyle: React.CSSProperties = {
    width: '100%',
    marginTop: '4px',
    padding: '8px',
    background: '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '14px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    color: '#888',
    marginBottom: '8px',
  };

  const selectionButtonStyle = (selected: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 8px',
    background: selected ? '#7c3aed' : '#2a2a4a',
    border: selected ? '2px solid #8b5cf6' : '1px solid #3a3a5a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px',
    cursor: 'pointer',
    textAlign: 'center',
  });

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
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '8px',
          padding: '24px',
          width: '480px',
          maxHeight: '85vh',
          overflowY: 'auto',
          border: '1px solid #3a3a5a',
        }}
      >
        {/* ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>ブラウザ出力</h2>
          {status !== 'rendering' && status !== 'checking' && (
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              x
            </button>
          )}
        </div>

        {/* === idle: 設定フォーム === */}
        {status === 'idle' && (
          <>
            {/* 実験的機能の警告バナー */}
            <div
              style={{
                padding: '10px 14px',
                background: '#3b1f0b',
                border: '1px solid #d97706',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#fbbf24',
                lineHeight: '1.5',
              }}
            >
              ⚠ 実験的機能: この機能は @remotion/web-renderer を使用しており、
              ブラウザの WebCodecs API に依存しています。
              一部のブラウザでは動作しない場合があります。
            </div>

            {/* ファイル名入力 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>ファイル名</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                  placeholder="mechanic"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <span style={{ color: '#888' }}>.{container}</span>
              </div>
              <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                英数字、ハイフン、アンダースコアのみ使用可能
              </p>
            </div>

            {/* コンテナ選択 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>コンテナ形式</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['mp4', 'webm'] as ContainerType[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setContainer(c)}
                    style={selectionButtonStyle(container === c)}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* 品質選択 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>品質</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {QUALITY_OPTIONS.map((q) => (
                  <button
                    key={q.value}
                    onClick={() => setQuality(q.value)}
                    style={selectionButtonStyle(quality === q.value)}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 解像度スケール */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>解像度</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {SCALE_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setScale(s.value)}
                    style={selectionButtonStyle(scale === s.value)}
                  >
                    <div>{s.resolution}</div>
                    <div style={{ fontSize: '10px', color: scale === s.value ? '#ddd' : '#666', marginTop: '2px' }}>
                      x{s.value}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 動画情報パネル */}
            <div
              style={{
                padding: '12px',
                background: '#2a2a4a',
                borderRadius: '4px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ccc', marginBottom: '8px' }}>動画情報</div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#aaa',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '4px',
                }}
              >
                <div>解像度: {currentScale.resolution}</div>
                <div>FPS: {mechanic.fps}</div>
                <div>長さ: {durationSeconds.toFixed(1)}秒</div>
                <div>フレーム数: {mechanic.durationFrames}</div>
                <div>形式: {container.toUpperCase()}</div>
                <div>音声: なし</div>
              </div>
            </div>

            {/* 互換性警告 */}
            {compatibility && !compatibility.canRender && (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#3b0b0b',
                  border: '1px solid #ef4444',
                  borderRadius: '4px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: '#fca5a5',
                  lineHeight: '1.5',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>互換性エラー</div>
                {compatibility.issues.map((issue, i) => (
                  <div key={i}>- {issue.message}</div>
                ))}
              </div>
            )}

            {compatibility && compatibility.canRender && (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#0b3b1a',
                  border: '1px solid #22c55e',
                  borderRadius: '4px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: '#86efac',
                }}
              >
                互換性OK — コーデック: {compatibility.resolvedVideoCodec || 'auto'}
              </div>
            )}

            {/* レンダリング開始ボタン */}
            <button
              onClick={handleStartRender}
              disabled={!fileName.trim() || (compatibility !== null && !compatibility.canRender)}
              style={{
                width: '100%',
                padding: '14px',
                background:
                  fileName.trim() && (compatibility === null || compatibility.canRender)
                    ? '#7c3aed'
                    : '#3a3a5a',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor:
                  fileName.trim() && (compatibility === null || compatibility.canRender)
                    ? 'pointer'
                    : 'not-allowed',
                opacity:
                  fileName.trim() && (compatibility === null || compatibility.canRender)
                    ? 1
                    : 0.5,
              }}
            >
              レンダリング開始
            </button>
          </>
        )}

        {/* === checking: 互換性チェック中 === */}
        {status === 'checking' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '4px solid #3a3a5a',
                borderTopColor: '#7c3aed',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: '14px', color: '#aaa' }}>互換性チェック中...</p>
          </div>
        )}

        {/* === rendering: プログレス表示 === */}
        {status === 'rendering' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '4px solid #3a3a5a',
                borderTopColor: '#7c3aed',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px' }}>
              レンダリング中...
            </p>
            <p style={{ fontSize: '24px', color: '#7c3aed', margin: '0 0 16px' }}>
              {progress?.percentComplete ?? 0}%
            </p>

            {/* プログレスバー */}
            <div
              style={{
                width: '100%',
                height: '8px',
                background: '#2a2a4a',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress?.percentComplete ?? 0}%`,
                  height: '100%',
                  background: '#7c3aed',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* フレーム詳細 */}
            {progress && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                  fontSize: '11px',
                  color: '#888',
                  marginTop: '12px',
                }}
              >
                <span>描画: {progress.renderedFrames}/{progress.totalFrames}</span>
                <span>エンコード: {progress.encodedFrames}/{progress.totalFrames}</span>
              </div>
            )}

            {/* キャンセルボタン */}
            <button
              onClick={cancelRender}
              style={{
                marginTop: '20px',
                padding: '10px 24px',
                background: '#3a3a5a',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              キャンセル
            </button>

            <p style={{ fontSize: '12px', color: '#d97706', marginTop: '16px' }}>
              ⚠ レンダリング中はこのタブを閉じないでください
            </p>
          </div>
        )}

        {/* === completed: ダウンロード === */}
        {status === 'completed' && videoBlob && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>OK</div>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px' }}>
              レンダリング完了！
            </p>
            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 20px' }}>
              ファイルサイズ: {(videoBlob.size / 1024 / 1024).toFixed(2)} MB
            </p>

            <button
              onClick={handleDownload}
              style={{
                width: '100%',
                padding: '14px',
                background: '#22c55e',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '12px',
              }}
            >
              ダウンロード ({fileName}.{container})
            </button>

            <button
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '10px',
                background: '#3a3a5a',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              閉じる
            </button>
          </div>
        )}

        {/* === failed: エラー === */}
        {status === 'failed' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>ERROR</div>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px' }}>
              レンダリング失敗
            </p>
            {error && (
              <p
                style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  margin: '0 0 20px',
                  whiteSpace: 'pre-wrap',
                  textAlign: 'left',
                  background: '#1e0000',
                  padding: '10px',
                  borderRadius: '4px',
                }}
              >
                {error}
              </p>
            )}

            <button
              onClick={reset}
              style={{
                width: '100%',
                padding: '12px',
                background: '#7c3aed',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '12px',
              }}
            >
              やり直す
            </button>

            <button
              onClick={handleClose}
              style={{
                width: '100%',
                padding: '10px',
                background: '#3a3a5a',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
