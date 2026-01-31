import React, { useRef, useState } from 'react';
import { useEditor } from '../context/EditorContext';
import type { MechanicData } from '../../data/types';
import { VideoExportDialog } from './VideoExportDialog';
import { ExportDialog } from './ExportDialog';
import { ShareDialog } from './ShareDialog';
import { validateMechanic, sanitizeMechanic, type ValidationResult } from '../utils/validateMechanic';
import { clearAutoSave } from '../hooks/useAutoSave';
// Log import feature is incomplete - hidden for now
// import { LogImportDialog } from './LogImportDialog';
// import { LogBrowserDialog } from './LogBrowserDialog';

interface EditorHeaderProps {
  onOpenPreview: () => void;
  onOpenShortcutHelp?: () => void;
  onOpenSaveLoad?: () => void;
}

export function EditorHeader({ onOpenPreview, onOpenShortcutHelp, onOpenSaveLoad }: EditorHeaderProps) {
  const { state, setMechanic, undo, redo, canUndo, canRedo, updateMechanicMeta } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isVideoExportOpen, setIsVideoExportOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  // Log import feature is incomplete - hidden for now
  // const [isLogImportOpen, setIsLogImportOpen] = useState(false);
  // const [isLogBrowserOpen, setIsLogBrowserOpen] = useState(false);

  const handleExport = () => {
    setIsExportDialogOpen(true);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawData = JSON.parse(event.target?.result as string);

        // Validate the data
        const validation = validateMechanic(rawData);

        if (!validation.isValid) {
          const errorMessages = validation.errors.map(e => `- ${e.field}: ${e.message}`).join('\n');
          setImportError(`インポートエラー:\n${errorMessages}`);
          return;
        }

        // Show warnings if any
        if (validation.warnings.length > 0) {
          const warningMessages = validation.warnings.map(w => `- ${w.message}`).join('\n');
          console.warn('Import warnings:', warningMessages);
        }

        // Sanitize and set the mechanic
        const sanitized = sanitizeMechanic(rawData);
        setMechanic(sanitized);
      } catch (err) {
        setImportError('JSONファイルの解析に失敗しました。ファイル形式を確認してください。');
      }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  };

  const handleNewMechanic = () => {
    if (state.mechanic.timeline.length > 0 || state.mechanic.initialPlayers.length > 0) {
      if (!confirm('Create new mechanic? Unsaved changes will be lost.')) {
        return;
      }
    }
    // Clear auto-save data when creating new mechanic
    clearAutoSave();
    setMechanic({
      id: `mechanic_${Date.now()}`,
      name: 'New Mechanic',
      description: '',
      durationFrames: 300,
      fps: 30,
      field: {
        type: 'circle',
        size: 40,
        backgroundColor: '#1a1a3e',
        gridEnabled: true,
      },
      markers: [],
      initialPlayers: [],
      enemies: [],
      timeline: [],
    });
  };

  const handleResetWelcome = () => {
    localStorage.removeItem('ff14-raid-visualizer-welcome-shown');
    window.location.reload();
  };

  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    background: '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px',
    cursor: 'pointer',
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        background: '#1a1a2e',
        borderBottom: '1px solid #3a3a5a',
        gap: '12px',
      }}
    >
      {/* Title / Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>FF14 Raid Editor</span>
        <span style={{ color: '#666' }}>|</span>
        {isEditingName ? (
          <input
            type="text"
            value={state.mechanic.name}
            onChange={(e) => updateMechanicMeta({ name: e.target.value })}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
            autoFocus
            style={{
              padding: '2px 6px',
              background: '#2a2a4a',
              border: '1px solid #4a4a7a',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '14px',
              width: '200px',
            }}
          />
        ) : (
          <span
            onClick={() => setIsEditingName(true)}
            style={{
              fontSize: '14px',
              color: '#aaa',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
            title="Click to edit name"
          >
            {state.mechanic.name}
          </span>
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* File operations */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleNewMechanic} style={buttonStyle}>
          New
        </button>
        <button onClick={handleImport} style={buttonStyle}>
          Import JSON
        </button>
        {/* Log import feature is incomplete - hidden for now
        <button onClick={() => setIsLogImportOpen(true)} style={buttonStyle}>
          Log Import
        </button>
        <button onClick={() => setIsLogBrowserOpen(true)} style={buttonStyle}>
          Log Browser
        </button>
        */}
        <button onClick={handleExport} style={buttonStyle}>
          Export JSON
        </button>
        <button
          onClick={() => setIsShareDialogOpen(true)}
          style={{
            ...buttonStyle,
            background: '#2c6e49',
            borderColor: '#3c8e59',
          }}
        >
          Share URL
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Undo/Redo */}
      <div style={{ display: 'flex', gap: '4px', borderLeft: '1px solid #3a3a5a', paddingLeft: '12px' }}>
        <button
          onClick={undo}
          disabled={!canUndo}
          style={canUndo ? buttonStyle : disabledButtonStyle}
          title="Undo (Ctrl+Z)"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          style={canRedo ? buttonStyle : disabledButtonStyle}
          title="Redo (Ctrl+Shift+Z)"
        >
          Redo
        </button>
      </div>

      {/* Save/Load */}
      {onOpenSaveLoad && (
        <div style={{ display: 'flex', gap: '4px', borderLeft: '1px solid #3a3a5a', paddingLeft: '12px' }}>
          <button
            onClick={onOpenSaveLoad}
            style={{
              ...buttonStyle,
              background: '#2c5f7c',
              borderColor: '#3c7a9c',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="データの保存・読み込み"
          >
            💾
            <span>保存・読込</span>
          </button>
        </div>
      )}

      {/* Preview */}
      <button
        onClick={onOpenPreview}
        style={{
          ...buttonStyle,
          background: '#3753c7',
          borderColor: '#4a63d7',
        }}
      >
        Preview
      </button>

      {/* Video Export */}
      <button
        onClick={() => setIsVideoExportOpen(true)}
        style={{
          ...buttonStyle,
          background: '#c73737',
          borderColor: '#d74747',
        }}
      >
        動画出力
      </button>

      {/* Shortcut Help - Prominent button with label */}
      {onOpenShortcutHelp && (
        <button
          onClick={onOpenShortcutHelp}
          style={{
            padding: '6px 14px',
            background: '#4a5568',
            border: '2px solid #5a6578',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 'bold',
          }}
          title="キーボードショートカット (?)"
        >
          <span style={{ fontSize: '14px' }}>?</span>
          <span>ヘルプ</span>
        </button>
      )}

      {/* Export Dialog */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        mechanic={state.mechanic}
        onClose={() => setIsExportDialogOpen(false)}
      />

      {/* Share Dialog */}
      <ShareDialog
        isOpen={isShareDialogOpen}
        mechanic={state.mechanic}
        onClose={() => setIsShareDialogOpen(false)}
      />

      {/* Video Export Dialog */}
      <VideoExportDialog
        isOpen={isVideoExportOpen}
        mechanic={state.mechanic}
        onClose={() => setIsVideoExportOpen(false)}
      />

      {/* Import Error Modal */}
      {importError && (
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
          onClick={() => setImportError(null)}
        >
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: '8px',
              border: '1px solid #c73737',
              padding: '24px',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', color: '#ff6b6b', fontSize: '16px' }}>
              インポートエラー
            </h3>
            <pre
              style={{
                background: '#12121f',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#ff9999',
                whiteSpace: 'pre-wrap',
                margin: '0 0 16px',
              }}
            >
              {importError}
            </pre>
            <button
              onClick={() => setImportError(null)}
              style={{
                padding: '8px 24px',
                background: '#3753c7',
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
        </div>
      )}

      {/* Log import feature is incomplete - hidden for now
      <LogImportDialog
        isOpen={isLogImportOpen}
        onClose={() => setIsLogImportOpen(false)}
      />
      <LogBrowserDialog
        isOpen={isLogBrowserOpen}
        onClose={() => setIsLogBrowserOpen(false)}
      />
      */}
    </header>
  );
}
