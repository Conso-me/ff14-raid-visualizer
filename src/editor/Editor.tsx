import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EditorProvider, useEditor } from './context/EditorContext';
import { EditorHeader } from './components/EditorHeader';
import { LeftPanel } from './components/LeftPanel';
import { FieldEditor } from './components/FieldEditor';
import { PropertyPanel } from './components/PropertyPanel';
import { TimelineEditor } from './components/TimelineEditor';
import { PreviewModal } from './components/PreviewModal';
import { ShortcutHelpDialog } from './components/ShortcutHelpDialog';
import { RecoveryDialog } from './components/RecoveryDialog';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutoSave, loadAutoSave, hasAutoSave, clearAutoSave } from './hooks/useAutoSave';
import { hasSharedData, decodeMechanicFromUrl, clearSharedDataFromUrl } from './utils/shareUrl';

function EditorContent() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShortcutHelpOpen, setIsShortcutHelpOpen] = useState(false);
  const [urlLoadError, setUrlLoadError] = useState<string | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const { state, setMechanic } = useEditor();
  const exportRef = useRef<(() => void) | null>(null);

  // Auto-save
  useAutoSave(state.mechanic);

  // Load mechanic from URL or check for auto-save on mount
  useEffect(() => {
    // URL parameters take priority
    if (hasSharedData()) {
      const result = decodeMechanicFromUrl();
      if (result.success && result.mechanic) {
        setMechanic(result.mechanic);
        // Clear the URL parameter to avoid reloading on refresh
        clearSharedDataFromUrl();
      } else if (result.error) {
        setUrlLoadError(result.error);
        clearSharedDataFromUrl();
      }
      return;
    }

    // Check for auto-save data
    if (hasAutoSave()) {
      setShowRecoveryDialog(true);
    }
  }, [setMechanic]);

  // Handle recovery
  const handleRecover = useCallback(() => {
    const saved = loadAutoSave();
    if (saved) {
      setMechanic(saved);
    }
    setShowRecoveryDialog(false);
  }, [setMechanic]);

  const handleDiscard = useCallback(() => {
    clearAutoSave();
    setShowRecoveryDialog(false);
  }, []);

  // Export handler for Ctrl+S
  const handleExport = useCallback(() => {
    const json = JSON.stringify(state.mechanic, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.mechanic.id || 'mechanic'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.mechanic]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onExport: handleExport,
    onOpenShortcutHelp: () => setIsShortcutHelpOpen(true),
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <EditorHeader
        onOpenPreview={() => setIsPreviewOpen(true)}
        onOpenShortcutHelp={() => setIsShortcutHelpOpen(true)}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left panel: Tab-based Tools/Objects */}
        <div style={{
          width: '280px',
          borderRight: '1px solid #3a3a5a',
        }}>
          <LeftPanel />
        </div>
        <FieldEditor />
        <PropertyPanel />
      </div>

      <TimelineEditor />

      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
      <ShortcutHelpDialog isOpen={isShortcutHelpOpen} onClose={() => setIsShortcutHelpOpen(false)} />

      {/* Recovery Dialog */}
      {showRecoveryDialog && (
        <RecoveryDialog
          onRecover={handleRecover}
          onDiscard={handleDiscard}
        />
      )}

      {/* URL Load Error Modal */}
      {urlLoadError && (
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
          onClick={() => setUrlLoadError(null)}
        >
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: '8px',
              border: '1px solid #c73737',
              padding: '24px',
              maxWidth: '400px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', color: '#ff6b6b', fontSize: '16px' }}>
              URL読み込みエラー
            </h3>
            <p style={{ color: '#ff9999', fontSize: '13px', margin: '0 0 16px' }}>
              {urlLoadError}
            </p>
            <button
              onClick={() => setUrlLoadError(null)}
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
    </div>
  );
}

export function Editor() {
  return (
    <EditorProvider>
      <EditorContent />
    </EditorProvider>
  );
}
