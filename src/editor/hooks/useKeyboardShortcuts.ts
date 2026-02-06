import { useEffect, useCallback } from 'react';
import { useEditor } from '../context/EditorContext';
import type { Tool } from '../context/editorReducer';

interface UseKeyboardShortcutsOptions {
  onExport?: () => void;
  onOpenShortcutHelp?: () => void;
}

const TOOL_KEYS: Record<string, Tool> = {
  '1': 'select',
  '2': 'add_move_event',
  '3': 'add_aoe',
  '4': 'add_debuff',
  '5': 'add_text',
  '6': 'add_object',
};

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const {
    state,
    dispatch,
    undo,
    redo,
    deleteSelectedObject,
    copySelectedObject,
    togglePlay,
    setCurrentFrame,
    setTool,
    selectAllPlayers,
    clearMultiSelect,
    movePlayerPosition,
  } = useEditor();

  const { mechanic, currentFrame, selectedObjectId, selectedObjectType } = state;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Undo: Ctrl+Z
      if (isCtrlOrCmd && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if (isCtrlOrCmd && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      // Save: Ctrl+S
      if (isCtrlOrCmd && e.key === 's') {
        e.preventDefault();
        options.onExport?.();
        return;
      }

      // Select all players: Ctrl+A
      if (isCtrlOrCmd && e.key === 'a') {
        e.preventDefault();
        selectAllPlayers();
        return;
      }

      // Copy/Duplicate: Ctrl+D
      if (isCtrlOrCmd && e.key === 'd') {
        e.preventDefault();
        copySelectedObject();
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedObject();
        return;
      }

      // Escape: Clear selection and reset tool
      if (e.key === 'Escape') {
        e.preventDefault();
        clearMultiSelect();
        setTool('select');
        return;
      }

      // Space: Play/Pause
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
        return;
      }

      // Alt + Arrow keys: Move selected player position
      if (e.altKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedObjectId && selectedObjectType === 'player') {
          e.preventDefault();
          const step = e.shiftKey ? 1 : 0.5; // Shift for larger movement
          let dx = 0, dy = 0;

          switch (e.key) {
            case 'ArrowUp': dy = -step; break;
            case 'ArrowDown': dy = step; break;
            case 'ArrowLeft': dx = -step; break;
            case 'ArrowRight': dx = step; break;
          }

          movePlayerPosition(selectedObjectId, dx, dy, currentFrame);
          return;
        }
      }

      // Arrow keys: Frame navigation
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setCurrentFrame(Math.max(0, currentFrame - step));
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setCurrentFrame(Math.min(mechanic.durationFrames - 1, currentFrame + step));
        return;
      }

      // Home/End: Jump to start/end
      if (e.key === 'Home') {
        e.preventDefault();
        setCurrentFrame(0);
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        setCurrentFrame(mechanic.durationFrames - 1);
        return;
      }

      // Tool switching: 1-7
      const tool = TOOL_KEYS[e.key];
      if (tool && !isCtrlOrCmd) {
        e.preventDefault();
        setTool(tool);
        return;
      }

      // Help: ?
      if (e.key === '?') {
        e.preventDefault();
        options.onOpenShortcutHelp?.();
        return;
      }
    },
    [
      undo,
      redo,
      deleteSelectedObject,
      copySelectedObject,
      togglePlay,
      setCurrentFrame,
      setTool,
      selectAllPlayers,
      clearMultiSelect,
      movePlayerPosition,
      currentFrame,
      mechanic.durationFrames,
      selectedObjectId,
      selectedObjectType,
      options,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Export shortcuts list for help dialog
// descriptionKey is a translation key resolved at render time via t()
export const SHORTCUTS = [
  { keys: ['Space'], descriptionKey: 'shortcuts.playPause' },
  { keys: ['←'], descriptionKey: 'shortcuts.backFrame' },
  { keys: ['→'], descriptionKey: 'shortcuts.forwardFrame' },
  { keys: ['Shift', '←'], descriptionKey: 'shortcuts.back10Frames' },
  { keys: ['Shift', '→'], descriptionKey: 'shortcuts.forward10Frames' },
  { keys: ['Home'], descriptionKey: 'shortcuts.firstFrame' },
  { keys: ['End'], descriptionKey: 'shortcuts.lastFrame' },
  { divider: true },
  { keys: ['Alt', 'arrows'], descriptionKey: 'shortcuts.movePlayer' },
  { keys: ['Alt', 'Shift', 'arrows'], descriptionKey: 'shortcuts.movePlayerLarge' },
  { divider: true },
  { keys: ['Delete'], descriptionKey: 'shortcuts.deleteObject' },
  { keys: ['Escape'], descriptionKey: 'shortcuts.escapeReset' },
  { keys: ['Ctrl', 'A'], descriptionKey: 'shortcuts.selectAllPlayers' },
  { keys: ['Ctrl', 'D'], descriptionKey: 'shortcuts.copyObject' },
  { keys: ['Ctrl', 'Z'], descriptionKey: 'shortcuts.undoAction' },
  { keys: ['Ctrl', 'Shift', 'Z'], descriptionKey: 'shortcuts.redoAction' },
  { keys: ['Ctrl', 'S'], descriptionKey: 'shortcuts.saveJson' },
  { divider: true },
  { keys: ['1'], descriptionKey: 'shortcuts.selectTool' },
  { keys: ['2'], descriptionKey: 'shortcuts.addMoveEventTool' },
  { keys: ['3'], descriptionKey: 'shortcuts.addAoETool' },
  { keys: ['4'], descriptionKey: 'shortcuts.addDebuffTool' },
  { keys: ['5'], descriptionKey: 'shortcuts.addTextTool' },
  { keys: ['6'], descriptionKey: 'shortcuts.addObjectTool' },
  { divider: true },
  { keys: ['?'], descriptionKey: 'shortcuts.shortcutHelp' },
] as const;
