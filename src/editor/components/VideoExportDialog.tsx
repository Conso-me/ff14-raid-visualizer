import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { MechanicData } from '../../data/types';
import { filterHiddenObjects } from '../utils/filterHiddenObjects';

interface VideoExportDialogProps {
  isOpen: boolean;
  mechanic: MechanicData;
  hiddenObjectIds?: string[];
  onClose: () => void;
}

type RenderStatus = 'idle' | 'rendering' | 'completed' | 'failed';
type Quality = 'low' | 'medium' | 'high';

const RENDER_SERVER_URL = 'http://localhost:3001';

const QUALITY_SETTINGS: Record<Quality, { width: number; height: number; label: string }> = {
  low: { width: 640, height: 360, label: '低 (640x360)' },
  medium: { width: 960, height: 540, label: '中 (960x540)' },
  high: { width: 1920, height: 1080, label: '高 (1920x1080)' },
};

export function VideoExportDialog({ isOpen, mechanic, hiddenObjectIds = [], onClose }: VideoExportDialogProps) {
  const filteredMechanic = useMemo(
    () => filterHiddenObjects(mechanic, hiddenObjectIds),
    [mechanic, hiddenObjectIds]
  );
  const [fileName, setFileName] = useState(mechanic.name || mechanic.id || 'mechanic');
  const [quality, setQuality] = useState<Quality>('medium');
  const [status, setStatus] = useState<RenderStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'rendering') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, status]);



  if (!isOpen) return null;

  const qualitySettings = QUALITY_SETTINGS[quality];
  const durationSeconds = mechanic.durationFrames / mechanic.fps;

  // Start rendering
  const handleStartRender = async () => {
    setStatus('rendering');
    setProgress(0);
    setError(null);

    try {
      // Render request
      const response = await fetch(`${RENDER_SERVER_URL}/api/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mechanic: filteredMechanic,
          options: { quality },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start render');
      }

      const data = await response.json();
      setJobId(data.jobId);

      // Poll status
      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`${RENDER_SERVER_URL}/api/render/${data.jobId}/status`);
          const statusData = await statusRes.json();

          setProgress(statusData.progress);

          if (statusData.status === 'completed') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setStatus('completed');
          } else if (statusData.status === 'failed') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setStatus('failed');
            setError(statusData.error || 'Render failed');
          }
        } catch (e) {
          console.error('Status check error:', e);
        }
      }, 1000);
    } catch (e) {
      setStatus('failed');
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  };

  // Download
  const handleDownload = async () => {
    if (!jobId) return;

    try {
      const response = await fetch(
        `${RENDER_SERVER_URL}/api/render/${jobId}/download?filename=${encodeURIComponent(fileName)}`
      );

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Download as blob
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Close dialog
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed');
    }
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>動画出力</h2>
          {status !== 'rendering' && (
            <button
              onClick={onClose}
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

        {/* Settings form (hidden during rendering) */}
        {status === 'idle' && (
          <>
            {/* File name input */}
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
                <span style={{ color: '#888' }}>.mp4</span>
              </div>
              <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                英数字、ハイフン、アンダースコアのみ使用可能
              </p>
            </div>

            {/* Quality selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>品質</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(Object.entries(QUALITY_SETTINGS) as [Quality, (typeof QUALITY_SETTINGS)[Quality]][]).map(
                  ([key, settings]) => (
                    <button
                      key={key}
                      onClick={() => setQuality(key)}
                      style={{
                        flex: 1,
                        padding: '10px 8px',
                        background: quality === key ? '#3753c7' : '#2a2a4a',
                        border: quality === key ? '2px solid #4a63d7' : '1px solid #3a3a5a',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {settings.label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Video info */}
            <div
              style={{
                padding: '12px',
                background: '#2a2a4a',
                borderRadius: '4px',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ccc', marginBottom: '8px' }}>動画情報</div>
              <div
                style={{ fontSize: '12px', color: '#aaa', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}
              >
                <div>
                  解像度: {qualitySettings.width}x{qualitySettings.height}
                </div>
                <div>FPS: {mechanic.fps}</div>
                <div>長さ: {durationSeconds.toFixed(1)}秒</div>
                <div>フレーム数: {mechanic.durationFrames}</div>
              </div>
            </div>

            {/* Render start button */}
            <button
              onClick={handleStartRender}
              disabled={!fileName.trim()}
              style={{
                width: '100%',
                padding: '14px',
                background: fileName.trim() ? '#22c55e' : '#3a3a5a',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: fileName.trim() ? 'pointer' : 'not-allowed',
                opacity: fileName.trim() ? 1 : 0.5,
              }}
            >
              レンダリング開始
            </button>
          </>
        )}

        {/* Rendering */}
        {status === 'rendering' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '4px solid #3a3a5a',
                borderTopColor: '#3753c7',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px' }}>レンダリング中...</p>
            <p style={{ fontSize: '24px', color: '#3753c7', margin: '0 0 16px' }}>{progress}%</p>

            {/* Progress bar */}
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
                  width: `${progress}%`,
                  height: '100%',
                  background: '#3753c7',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <p style={{ fontSize: '12px', color: '#888', marginTop: '16px' }}>
              レンダリング中はこのダイアログを閉じないでください
            </p>
          </div>
        )}

        {/* Completed */}
        {status === 'completed' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>OK</div>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', margin: '0 0 20px' }}>
              レンダリング完了！
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
              ダウンロード ({fileName}.mp4)
            </button>

            <button
              onClick={onClose}
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

        {/* Error */}
        {status === 'failed' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>ERROR</div>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px' }}>レンダリング失敗</p>
            {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: '0 0 20px' }}>{error}</p>}

            <button
              onClick={() => {
                setStatus('idle');
                setError(null);
                setProgress(0);
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: '#3753c7',
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
              onClick={onClose}
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
