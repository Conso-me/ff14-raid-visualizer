import React, { useState, useEffect, useCallback } from 'react';
import type { MechanicData } from '../../data/types';
import { 
  getSaveSlots, 
  saveToSlot, 
  loadFromSlot, 
  deleteSlot, 
  renameSlot,
  SaveSlot 
} from '../utils/saveSlots';

interface SaveLoadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentMechanic: MechanicData;
  currentFrame: number;
  onLoad: (mechanic: MechanicData) => void;
}

export function SaveLoadDialog({ 
  isOpen, 
  onClose, 
  currentMechanic, 
  currentFrame,
  onLoad 
}: SaveLoadDialogProps) {
  const [slots, setSlots] = useState<SaveSlot[]>([]);
  const [activeTab, setActiveTab] = useState<'save' | 'load'>('save');
  const [saveName, setSaveName] = useState('');
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Load slots when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSlots(getSaveSlots());
      // Reset save name to current mechanic name
      setSaveName(currentMechanic.name || '無題');
    }
  }, [isOpen, currentMechanic.name]);

  const handleSave = useCallback(() => {
    if (!saveName.trim()) return;
    
    const newSlot = saveToSlot(currentMechanic, saveName.trim());
    if (newSlot) {
      setSlots(getSaveSlots());
      setSaveName('');
      // Optionally close dialog after save
      // onClose();
    }
  }, [currentMechanic, saveName]);

  const handleSavePreview = useCallback(() => {
    if (!saveName.trim()) return;
    
    const name = `${saveName.trim()} (フレーム ${currentFrame})`;
    const newSlot = saveToSlot(currentMechanic, name);
    if (newSlot) {
      setSlots(getSaveSlots());
      setSaveName('');
    }
  }, [currentMechanic, saveName, currentFrame]);

  const handleLoad = useCallback((slotId: string) => {
    const mechanic = loadFromSlot(slotId);
    if (mechanic) {
      onLoad(mechanic);
      onClose();
    }
  }, [onLoad, onClose]);

  const handleDelete = useCallback((slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('この保存データを削除しますか？')) {
      deleteSlot(slotId);
      setSlots(getSaveSlots());
    }
  }, []);

  const handleStartRename = useCallback((slot: SaveSlot, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSlot(slot.id);
    setEditName(slot.name);
  }, []);

  const handleConfirmRename = useCallback(() => {
    if (editingSlot && editName.trim()) {
      renameSlot(editingSlot, editName.trim());
      setSlots(getSaveSlots());
      setEditingSlot(null);
      setEditName('');
    }
  }, [editingSlot, editName]);

  const handleCancelRename = useCallback(() => {
    setEditingSlot(null);
    setEditName('');
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const canSave = slots.length < 5;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '12px',
          width: '500px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #3a3a5a',
          padding: '0 16px'
        }}>
          <button
            onClick={() => setActiveTab('save')}
            style={{
              padding: '16px 24px',
              background: 'transparent',
              border: 'none',
              borderBottom: `3px solid ${activeTab === 'save' ? '#3753c7' : 'transparent'}`,
              color: activeTab === 'save' ? '#fff' : '#888',
              fontSize: '15px',
              fontWeight: activeTab === 'save' ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            💾 保存 ({slots.length}/5)
          </button>
          <button
            onClick={() => setActiveTab('load')}
            style={{
              padding: '16px 24px',
              background: 'transparent',
              border: 'none',
              borderBottom: `3px solid ${activeTab === 'load' ? '#3753c7' : 'transparent'}`,
              color: activeTab === 'load' ? '#fff' : '#888',
              fontSize: '15px',
              fontWeight: activeTab === 'load' ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            📂 読み込み ({slots.length})
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
          {activeTab === 'save' ? (
            <div>
              {/* Save new section */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '13px', 
                  color: '#aaa', 
                  marginBottom: '8px' 
                }}>
                  保存するデータ名
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="データ名を入力..."
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: '#2a2a4a',
                      border: '1px solid #3a3a5a',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                    disabled={!canSave}
                  />
                  <button
                    onClick={handleSave}
                    disabled={!saveName.trim() || !canSave}
                    style={{
                      padding: '10px 20px',
                      background: saveName.trim() && canSave ? '#3753c7' : '#2a2a4a',
                      border: 'none',
                      borderRadius: '6px',
                      color: saveName.trim() && canSave ? '#fff' : '#666',
                      fontSize: '14px',
                      cursor: saveName.trim() && canSave ? 'pointer' : 'not-allowed',
                      fontWeight: 'bold',
                    }}
                  >
                    保存
                  </button>
                </div>
                <button
                  onClick={handleSavePreview}
                  disabled={!saveName.trim() || !canSave}
                  style={{
                    marginTop: '8px',
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid #2c6e49',
                    borderRadius: '6px',
                    color: saveName.trim() && canSave ? '#51cf66' : '#666',
                    fontSize: '13px',
                    cursor: saveName.trim() && canSave ? 'pointer' : 'not-allowed',
                  }}
                >
                  📷 現在のフレーム ({currentFrame}) を保存
                </button>
                {!canSave && (
                  <p style={{ marginTop: '8px', fontSize: '12px', color: '#ff6b6b' }}>
                    ⚠️ 保存スロットがいっぱいです。古いデータを削除してください。
                  </p>
                )}
              </div>

              {/* Existing slots */}
              <h4 style={{ 
                margin: '0 0 12px', 
                fontSize: '14px', 
                color: '#aaa',
                fontWeight: 'normal' 
              }}>
                既存の保存データ（上書きする場合は削除してから保存）
              </h4>
            </div>
          ) : null}

          {/* Slots list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {slots.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666',
                fontSize: '14px' 
              }}>
                保存されたデータがありません
              </div>
            ) : (
              slots.map((slot, index) => (
                <div
                  key={slot.id}
                  onClick={() => activeTab === 'load' && handleLoad(slot.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: '#2a2a4a',
                    borderRadius: '8px',
                    cursor: activeTab === 'load' ? 'pointer' : 'default',
                    border: '2px solid transparent',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab === 'load') {
                      e.currentTarget.style.borderColor = '#3753c7';
                      e.currentTarget.style.background = '#3a3a5a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.background = '#2a2a4a';
                  }}
                >
                  {/* Slot number */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#3753c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#fff',
                    flexShrink: 0,
                  }}>
                    {index + 1}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editingSlot === slot.id ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirmRename();
                            if (e.key === 'Escape') handleCancelRename();
                          }}
                          style={{
                            flex: 1,
                            padding: '4px 8px',
                            background: '#1a1a2e',
                            border: '1px solid #3753c7',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '14px',
                          }}
                        />
                        <button
                          onClick={handleConfirmRename}
                          style={{
                            padding: '4px 12px',
                            background: '#2c6e49',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelRename}
                          style={{
                            padding: '4px 12px',
                            background: '#3a3a5a',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ 
                          fontWeight: 'bold', 
                          fontSize: '14px',
                          color: '#fff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {slot.name}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#888',
                          marginTop: '2px'
                        }}>
                          {formatDate(slot.savedAt)} · {slot.mechanic.timeline.length}イベント
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  {activeTab === 'load' && editingSlot !== slot.id && (
                    <button
                      onClick={(e) => handleStartRename(slot, e)}
                      style={{
                        padding: '6px 12px',
                        background: '#3a3a5a',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      名前変更
                    </button>
                  )}
                  {editingSlot !== slot.id && (
                    <button
                      onClick={(e) => handleDelete(slot.id, e)}
                      style={{
                        padding: '6px 12px',
                        background: '#c73737',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      削除
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '16px 20px', 
          borderTop: '1px solid #3a3a5a',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              background: '#3a3a5a',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
