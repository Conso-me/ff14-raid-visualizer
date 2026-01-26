import React, { useState, useEffect } from 'react';
import { EditorProvider, useEditor } from './context/EditorContext';
import { EditorHeader } from './components/EditorHeader';
import { LeftPanel } from './components/LeftPanel';
import { FieldEditor } from './components/FieldEditor';
import { PropertyPanel } from './components/PropertyPanel';
import { TimelineEditor } from './components/TimelineEditor';
import { PreviewModal } from './components/PreviewModal';

function EditorContent() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { undo, redo, deleteSelectedObject, copySelectedObject } = useEditor();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedObject();
      }
      // Copy/Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        copySelectedObject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteSelectedObject, copySelectedObject]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <EditorHeader onOpenPreview={() => setIsPreviewOpen(true)} />

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
