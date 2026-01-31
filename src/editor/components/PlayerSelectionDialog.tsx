import React, { useState, useCallback } from 'react';
import type { Player, Position } from '../../data/types';

interface PlayerSelectionDialogProps {
  isOpen: boolean;
  players: Player[];
  currentPositions: Map<string, Position>;
  onSelect: (playerIds: string[]) => void;
  onCancel: () => void;
}

export function PlayerSelectionDialog({
  isOpen,
  players,
  currentPositions,
  onSelect,
  onCancel,
}: PlayerSelectionDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reset selection when dialog opens with different players
  React.useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set());
    }
  }, [isOpen, players]);

  // All hooks must be called before any conditional returns
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  // Role colors for visual distinction
  const getRoleColor = (role: string) => {
    if (role.startsWith('T')) return '#ff6b6b';
    if (role.startsWith('H')) return '#51cf66';
    if (role.startsWith('D')) return '#339af0';
    return '#adb5bd';
  };

  const toggleSelection = useCallback((playerId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(players.map(p => p.id)));
  }, [players]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedIds.size > 0) {
      onSelect(Array.from(selectedIds));
    }
  }, [selectedIds, onSelect]);

  // Now we can do conditional rendering after all hooks are called
  if (!isOpen || players.length === 0) return null;

  const isAllSelected = selectedIds.size === players.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < players.length;

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
      onKeyDown={handleKeyDown}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '8px',
          padding: '24px',
          width: '360px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: '18px', color: '#fff' }}>
          プレイヤーを選択
        </h2>

        <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '16px' }}>
          複数のプレイヤーが重なっています。移動させるプレイヤーを選択してください。
        </p>

        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px',
            padding: '8px 12px',
            background: '#2a2a4a',
            borderRadius: '6px',
          }}
        >
          <span style={{ fontSize: '13px', color: '#fff' }}>
            <strong style={{ color: '#ffcc00' }}>{selectedIds.size}</strong> / {players.length} 人選択中
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={isAllSelected ? clearSelection : selectAll}
              style={{
                padding: '4px 12px',
                background: isIndeterminate ? '#ff9800' : isAllSelected ? '#3a3a5a' : '#3753c7',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {isIndeterminate ? '選択解除' : isAllSelected ? '解除' : 'すべて'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {players.map((player) => {
            const pos = currentPositions.get(player.id);
            const isSelected = selectedIds.has(player.id);
            
            return (
              <div
                key={player.id}
                onClick={() => toggleSelection(player.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  background: isSelected ? '#3a3a5a' : '#2a2a4a',
                  border: `2px solid ${isSelected ? getRoleColor(player.role) : 'transparent'}`,
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    border: `2px solid ${isSelected ? getRoleColor(player.role) : '#666'}`,
                    borderRadius: '4px',
                    background: isSelected ? getRoleColor(player.role) : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: getRoleColor(player.role),
                    fontWeight: 'bold',
                    fontSize: '12px',
                  }}
                >
                  {player.role}
                </span>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>
                    {player.name || player.role}
                  </div>
                  {pos && (
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                      座標: ({pos.x.toFixed(1)}, {pos.y.toFixed(1)})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: '#3a3a5a',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
            style={{
              padding: '10px 20px',
              background: selectedIds.size > 0 ? '#3753c7' : '#2a2a4a',
              border: 'none',
              borderRadius: '4px',
              color: selectedIds.size > 0 ? '#fff' : '#666',
              fontSize: '14px',
              cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            {selectedIds.size > 1 
              ? `${selectedIds.size}人を移動` 
              : selectedIds.size === 1 
                ? '1人を移動' 
                : 'プレイヤーを選択'}
          </button>
        </div>
      </div>
    </div>
  );
}
