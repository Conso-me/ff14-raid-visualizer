import { useEffect, useCallback } from 'react';
import { useEditor } from '../context/EditorContext';
import type { Tool } from '../context/editorReducer';

interface UseKeyboardShortcutsOptions {
  onExport?: () => void;
  onOpenShortcutHelp?: () => void;
}

const TOOL_KEYS: Record<string, Tool> = {
  '1': 'select',
  '2': 'move',
  '3': 'add_move_event',
  '4': 'add_aoe',
  '5': 'add_debuff',
  '6': 'add_text',
  '7': 'add_object',
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
export const SHORTCUTS = [
  { keys: ['Space'], description: '再生/一時停止' },
  { keys: ['←'], description: '1フレーム戻る' },
  { keys: ['→'], description: '1フレーム進む' },
  { keys: ['Shift', '←'], description: '10フレーム戻る' },
  { keys: ['Shift', '→'], description: '10フレーム進む' },
  { keys: ['Home'], description: '最初のフレームへ' },
  { keys: ['End'], description: '最後のフレームへ' },
  { divider: true },
  { keys: ['Alt', '矢印'], description: 'プレイヤーを移動 (0.5単位)' },
  { keys: ['Alt', 'Shift', '矢印'], description: 'プレイヤーを移動 (1単位)' },
  { divider: true },
  { keys: ['Delete'], description: '選択中のオブジェクトを削除' },
  { keys: ['Escape'], description: '選択解除 & ツールリセット' },
  { keys: ['Ctrl', 'A'], description: '全プレイヤーを選択' },
  { keys: ['Ctrl', 'D'], description: '選択オブジェクトをコピー' },
  { keys: ['Ctrl', 'Z'], description: '元に戻す' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'やり直し' },
  { keys: ['Ctrl', 'S'], description: 'JSONを保存' },
  { divider: true },
  { keys: ['1'], description: '選択ツール' },
  { keys: ['2'], description: '移動ツール' },
  { keys: ['3'], description: '移動イベント追加' },
  { keys: ['4'], description: 'AoE追加' },
  { keys: ['5'], description: 'デバフ追加' },
  { keys: ['6'], description: 'テキスト追加' },
  { keys: ['7'], description: 'オブジェクト追加' },
  { divider: true },
  { keys: ['?'], description: 'ショートカットヘルプ' },
] as const;
