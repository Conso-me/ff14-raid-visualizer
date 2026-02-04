import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { MechanicComposition } from '../../compositions/MechanicComposition';
import { useEditor } from '../context/EditorContext';
import { usePreviewRecorder } from '../hooks/usePreviewRecorder';
import { useLanguage } from '../context/LanguageContext';
import { filterHiddenObjects } from '../utils/filterHiddenObjects';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
  const { state } = useEditor();
  const { mechanic } = state;
  const filteredMechanic = useMemo(
    () => filterHiddenObjects(mechanic, state.hiddenObjectIds),
    [mechanic, state.hiddenObjectIds]
  );
  const playerRef = useRef<PlayerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showRecordPanel, setShowRecordPanel] = useState(false);
  const [fileName, setFileName] = useState(mechanic.name || mechanic.id || 'preview');

  const {
    status,
    progress,
    error,
    videoUrl,
    startRecording,
    cancelRecording,
    downloadVideo,
    resetRecorder,
  } = usePreviewRecorder();

  const { t } = useLanguage();

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status === 'idle') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, status]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetRecorder();
      setShowRecordPanel(false);
    }
  }, [isOpen, resetRecorder]);

  // Update filename when mechanic changes
  useEffect(() => {
    setFileName(mechanic.name || mechanic.id || 'preview');
  }, [mechanic.name, mechanic.id]);

  const handleStartRecording = async () => {
    await startRecording(
      playerRef,
      containerRef,
      mechanic
    );
  };

  const handleDownload = () => {
    downloadVideo(fileName);
  };

  if (!isOpen) return null;

  const isRecording = status === 'recording' || status === 'preparing' || status === 'processing';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
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
          padding: '16px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            gap: '12px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
            {t('previewModal.title', { name: mechanic.name })}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!showRecordPanel && status === 'idle' && (
              <button
                onClick={() => setShowRecordPanel(true)}
                style={{
                  padding: '6px 12px',
                  background: '#c73737',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {t('previewModal.record')}
              </button>
            )}
            {!isRecording && (
              <button
                onClick={onClose}
                style={{
                  padding: '6px 12px',
                  background: '#3a3a5a',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                {t('previewModal.close')}
              </button>
            )}
          </div>
        </div>

        {/* Recording Panel */}
        {showRecordPanel && (
          <div
            style={{
              background: '#2a2a4a',
              borderRadius: '6px',
              padding: '12px 16px',
              marginBottom: '16px',
            }}
          >
            {status === 'idle' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#888' }}>{t('previewModal.filenameLabel')}</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    style={{
                      padding: '4px 8px',
                      background: '#1a1a2e',
                      border: '1px solid #3a3a5a',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '12px',
                      width: '150px',
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>.webm</span>
                </div>
                <button
                  onClick={handleStartRecording}
                  disabled={!fileName.trim()}
                  style={{
                    padding: '6px 16px',
                    background: fileName.trim() ? '#c73737' : '#3a3a5a',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: fileName.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {t('previewModal.startRecording')}
                </button>
                <button
                  onClick={() => setShowRecordPanel(false)}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    border: '1px solid #3a3a5a',
                    borderRadius: '4px',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            )}

            {(status === 'preparing' || status === 'recording' || status === 'processing') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #3a3a5a',
                      borderTopColor: '#c73737',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <span style={{ fontSize: '13px', color: '#fff' }}>
                    {status === 'preparing' && t('previewModal.preparing')}
                    {status === 'recording' && t('previewModal.recording', { progress })}
                    {status === 'processing' && t('previewModal.processing')}
                  </span>
                  <button
                    onClick={cancelRecording}
                    style={{
                      padding: '4px 10px',
                      background: '#3a3a5a',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '11px',
                      marginLeft: 'auto',
                    }}
                  >
                    {t('previewModal.stop')}
                  </button>
                </div>
                {/* Progress bar */}
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    background: '#1a1a2e',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: '#c73737',
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {status === 'completed' && videoUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#22c55e' }}>{t('previewModal.recordingComplete')}</span>
                <button
                  onClick={handleDownload}
                  style={{
                    padding: '6px 16px',
                    background: '#22c55e',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {t('previewModal.downloadFile', { filename: fileName })}
                </button>
                <button
                  onClick={() => {
                    resetRecorder();
                    setShowRecordPanel(false);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#3a3a5a',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {t('common.close')}
                </button>
              </div>
            )}

            {status === 'failed' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#ef4444' }}>
                  {t('previewModal.recordingFailed', { error: error || 'Unknown error' })}
                </span>
                <button
                  onClick={resetRecorder}
                  style={{
                    padding: '6px 12px',
                    background: '#3a3a5a',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {t('common.retry')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Player Container */}
        <div ref={containerRef}>
          <Player
            ref={playerRef}
            component={MechanicComposition}
            inputProps={{ mechanic: filteredMechanic }}
            durationInFrames={mechanic.durationFrames}
            fps={mechanic.fps}
            compositionWidth={1920}
            compositionHeight={1080}
            style={{
              width: 960,
              height: 540,
            }}
            controls={!isRecording}
            loop={!isRecording}
          />
        </div>

        {/* Info */}
        <div
          style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#888',
          }}
        >
          {t('previewModal.durationInfo', { duration: (mechanic.durationFrames / mechanic.fps).toFixed(1), fps: mechanic.fps, players: mechanic.initialPlayers.length, events: mechanic.timeline.length })}
        </div>

        {/* Recording note */}
        {showRecordPanel && status === 'idle' && (
          <div
            style={{
              marginTop: '8px',
              fontSize: '11px',
              color: '#666',
            }}
          >
            {t('previewModal.recordingNote')}
          </div>
        )}
      </div>
    </div>
  );
}
