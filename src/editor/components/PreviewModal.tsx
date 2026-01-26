import React, { useEffect } from 'react';
import { Player } from '@remotion/player';
import { MechanicComposition } from '../../compositions/MechanicComposition';
import { useEditor } from '../context/EditorContext';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
  const { state } = useEditor();
  const { mechanic } = state;

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
            Preview: {mechanic.name}
          </h2>
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
            Close
          </button>
        </div>

        {/* Player */}
        <Player
          component={MechanicComposition}
          inputProps={{ mechanic }}
          durationInFrames={mechanic.durationFrames}
          fps={mechanic.fps}
          compositionWidth={960}
          compositionHeight={540}
          style={{
            width: 960,
            height: 540,
          }}
          controls
          loop
        />

        {/* Info */}
        <div
          style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#888',
          }}
        >
          Duration: {(mechanic.durationFrames / mechanic.fps).toFixed(1)}s | FPS: {mechanic.fps} |
          Players: {mechanic.initialPlayers.length} | Events: {mechanic.timeline.length}
        </div>
      </div>
    </div>
  );
}
