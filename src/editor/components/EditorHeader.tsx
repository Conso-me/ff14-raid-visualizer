import React, { useRef, useState } from 'react';
import { useEditor } from '../context/EditorContext';
import type { MechanicData } from '../../data/types';
import { VideoExportDialog } from './VideoExportDialog';
// Log import feature is incomplete - hidden for now
// import { LogImportDialog } from './LogImportDialog';
// import { LogBrowserDialog } from './LogBrowserDialog';

interface EditorHeaderProps {
  onOpenPreview: () => void;
}

export function EditorHeader({ onOpenPreview }: EditorHeaderProps) {
  const { state, setMechanic, undo, redo, canUndo, canRedo, updateMechanicMeta } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isVideoExportOpen, setIsVideoExportOpen] = useState(false);
  // Log import feature is incomplete - hidden for now
  // const [isLogImportOpen, setIsLogImportOpen] = useState(false);
  // const [isLogBrowserOpen, setIsLogBrowserOpen] = useState(false);

  const handleExport = () => {
    const json = JSON.stringify(state.mechanic, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.mechanic.id || 'mechanic'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as MechanicData;
        // Basic validation
        if (!json.id || !json.field || !json.timeline) {
          alert('Invalid mechanic file format');
          return;
        }
        setMechanic(json);
      } catch (err) {
        alert('Failed to parse JSON file');
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

      {/* Video Export Dialog */}
      <VideoExportDialog
        isOpen={isVideoExportOpen}
        mechanic={state.mechanic}
        onClose={() => setIsVideoExportOpen(false)}
      />

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
