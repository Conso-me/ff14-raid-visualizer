import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EditorProvider, useEditor } from './context/EditorContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { EditorHeader } from './components/EditorHeader';
import { ToolPanel } from './components/ToolPanel';
import { ObjectListPanel } from './components/ObjectListPanel';
import { TimelinePanel } from './components/TimelinePanel';
import { FieldEditor } from './components/FieldEditor';
import { PropertyPanel } from './components/PropertyPanel';
import { TimelineEditor } from './components/TimelineEditor';
import { PreviewModal } from './components/PreviewModal';
import { ShortcutHelpDialog } from './components/ShortcutHelpDialog';
import { WelcomeDialog } from './components/WelcomeDialog';
import { SaveLoadDialog } from './components/SaveLoadDialog';
import type { MechanicData } from '../data/types';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { hasSharedData, decodeMechanicFromUrl, clearSharedDataFromUrl } from './utils/shareUrl';
import { SampleDialog } from './components/SampleDialog';
import { clearAutoSave } from './hooks/useAutoSave';

function EditorContent() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShortcutHelpOpen, setIsShortcutHelpOpen] = useState(false);
  const [urlLoadError, setUrlLoadError] = useState<string | null>(null);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showSaveLoadDialog, setShowSaveLoadDialog] = useState(false);
  const [showSampleDialog, setShowSampleDialog] = useState(false);
  const { state, setMechanic } = useEditor();
  const { t } = useLanguage();
  const exportRef = useRef<(() => void) | null>(null);

  // Load mechanic from URL on mount
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

    // Show welcome dialog for first-time users
    const hasSeenWelcome = localStorage.getItem('ff14-raid-visualizer-welcome-shown');
    if (!hasSeenWelcome) {
      setShowWelcomeDialog(true);
    }
  }, [setMechanic]);

  // Handle welcome dialog close
  const handleWelcomeClose = useCallback(() => {
    setShowWelcomeDialog(false);
  }, []);

  const handleWelcomeDontShowAgain = useCallback(() => {
    localStorage.setItem('ff14-raid-visualizer-welcome-shown', 'true');
  }, []);

  // Handle open sample dialog
  const handleOpenSampleDialog = useCallback(() => {
    setShowSampleDialog(true);
  }, []);

  // Handle load from sample dialog
  const handleLoadFromSample = useCallback((mechanic: MechanicData) => {
    clearAutoSave();
    setMechanic(mechanic);
    setShowSampleDialog(false);
  }, [setMechanic]);

  // Handle load from save slot
  const handleLoadMechanic = useCallback((mechanic: MechanicData) => {
    setMechanic(mechanic);
    setShowSaveLoadDialog(false);
  }, [setMechanic]);

  // Export handler for Ctrl+S
  const handleExport = useCallback(() => {
    const json = JSON.stringify(state.mechanic, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.mechanic.name || state.mechanic.id || 'mechanic'}.json`;
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
        onOpenSaveLoad={() => setShowSaveLoadDialog(true)}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Tool Panel */}
        <div style={{
          width: '260px',
          borderRight: '1px solid #3a3a5a',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <ToolPanel />
        </div>

        {/* Timeline Panel - Left of stage */}
        <div style={{
          width: '280px',
          borderRight: '1px solid #3a3a5a',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <TimelinePanel />
        </div>

        {/* Center: Field Editor (Stage) */}
        <FieldEditor />

        {/* Right Side: Object List | Property Panel */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          borderLeft: '1px solid #3a3a5a',
          flexShrink: 0,
        }}>
          {/* Object List Panel */}
          <div style={{
            width: '280px',
            borderRight: '1px solid #3a3a5a',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '8px 12px',
              background: '#252540',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#fff',
              borderBottom: '1px solid #3a3a5a',
              flexShrink: 0,
            }}>
              {t('editor.objects')}
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <ObjectListPanel />
            </div>
          </div>

          {/* Property Panel */}
          <div style={{
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <PropertyPanel />
          </div>
        </div>
      </div>

      <TimelineEditor />

      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
      <ShortcutHelpDialog isOpen={isShortcutHelpOpen} onClose={() => setIsShortcutHelpOpen(false)} />

      {/* Welcome Dialog */}
      <WelcomeDialog
        isOpen={showWelcomeDialog}
        onClose={handleWelcomeClose}
        onDontShowAgain={handleWelcomeDontShowAgain}
        onOpenSampleDialog={handleOpenSampleDialog}
      />

      {/* Sample Dialog */}
      <SampleDialog
        isOpen={showSampleDialog}
        onClose={() => setShowSampleDialog(false)}
        onLoad={handleLoadFromSample}
      />

      {/* Save/Load Dialog */}
      <SaveLoadDialog
        isOpen={showSaveLoadDialog}
        onClose={() => setShowSaveLoadDialog(false)}
        currentMechanic={state.mechanic}
        currentFrame={state.currentFrame}
        onLoad={handleLoadMechanic}
      />

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
              {t('header.urlLoadError')}
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
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export function Editor() {
  return (
    <LanguageProvider>
      <EditorProvider>
        <EditorContent />
      </EditorProvider>
    </LanguageProvider>
  );
}
