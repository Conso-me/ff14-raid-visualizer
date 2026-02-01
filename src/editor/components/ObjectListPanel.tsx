import React, { useState, useCallback, useMemo } from 'react';
import { useEditor } from '../context/EditorContext';
import { getPlayersAtFrame } from '../utils/getPlayersAtFrame';
import { getActiveAoEs, getAoEEventPairs } from '../utils/getActiveAoEs';
import { getActiveAnnotations, getAnnotationEventPairs } from '../utils/getActiveAnnotations';
import { getActiveObjects, getObjectEventPairs } from '../utils/getActiveObjects';
import { DraggableList } from './DraggableList';
import type { Role, MarkerType, AoEType, Position, GimmickObject, Player } from '../../data/types';

// Role colors (match existing player rendering)
const ROLE_COLORS: Record<Role, string> = {
  T1: '#3753c7',
  T2: '#3753c7',
  H1: '#2c9c3c',
  H2: '#2c9c3c',
  D1: '#c73737',
  D2: '#c73737',
  D3: '#c73737',
  D4: '#c73737',
  // P1-P8: ログインポート時の汎用プレイヤー色
  P1: '#9966cc', P2: '#cc6699',
  P3: '#66cc99', P4: '#99cc66',
  P5: '#cc9966', P6: '#6699cc',
  P7: '#c9c966', P8: '#66c9c9',
};

// Marker colors
const MARKER_COLORS: Record<MarkerType, string> = {
  A: '#ff0000',
  B: '#ffff00',
  C: '#0088ff',
  D: '#ff00ff',
  '1': '#ff0000',
  '2': '#ffff00',
  '3': '#0088ff',
  '4': '#ff00ff',
};

// AoE type names
const AOE_TYPE_NAMES: Record<AoEType, string> = {
  circle: '円形',
  cone: '扇形',
  line: '直線',
  donut: 'ドーナツ',
  cross: '十字',
};

// AoE type icons
const AOE_TYPE_ICONS: Record<AoEType, string> = {
  circle: '○',
  cone: '◗',
  line: '│',
  donut: '◎',
  cross: '✚',
};

// Object shape icons
const OBJECT_SHAPE_ICONS: Record<GimmickObject['shape'], string> = {
  circle: '●',
  square: '■',
  triangle: '▲',
  diamond: '◆',
};

// Helper functions
function getRoleColor(role: Role): string {
  return ROLE_COLORS[role] || '#888';
}

function getMarkerColor(type: MarkerType): string {
  return MARKER_COLORS[type] || '#888';
}

function getAoETypeName(type: AoEType): string {
  return AOE_TYPE_NAMES[type] || type;
}

function getAoETypeIcon(type: AoEType): string {
  return AOE_TYPE_ICONS[type] || '?';
}

function formatPosition(pos: Position): string {
  return `(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`;
}

// CollapsibleGroup component
interface CollapsibleGroupProps {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleGroup({ title, count, defaultOpen = true, children }: CollapsibleGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ marginBottom: '10px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '8px 10px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
          fontSize: '13px',
          textAlign: 'left',
        }}
      >
        <span style={{ marginRight: '8px', fontSize: '11px' }}>
          {isOpen ? '▼' : '▶'}
        </span>
        <span style={{ flex: 1 }}>{title}</span>
        <span
          style={{
            background: '#3a3a5a',
            padding: '3px 8px',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#888',
          }}
        >
          {count}
        </span>
      </button>
      {isOpen && (
        <div style={{ paddingLeft: '10px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ObjectItem component
interface ObjectItemProps {
  id: string;
  objectType: 'player' | 'enemy' | 'marker' | 'aoe' | 'text' | 'object';
  name: string;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  isActive?: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

function ObjectItem({
  name,
  subtitle,
  color,
  icon,
  isSelected,
  isActive,
  onSelect,
}: ObjectItemProps) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '8px 10px',
        marginBottom: '3px',
        background: isSelected ? '#3753c7' : 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        color: '#fff',
        fontSize: '13px',
        textAlign: 'left',
        gap: '10px',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = '#2a2a4a';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {/* Color indicator or icon */}
      {icon || (
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '2px',
            background: color || '#888',
            flexShrink: 0,
          }}
        />
      )}

      {/* Name and subtitle */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {name}
        </div>
        {subtitle && (
          <div style={{ fontSize: '11px', color: '#888' }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Active indicator for AoEs, texts, and objects */}
      {isActive !== undefined && (
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: isActive ? '#22c55e' : '#4b5563',
            flexShrink: 0,
          }}
          title={isActive ? 'アクティブ' : '非アクティブ'}
        />
      )}
    </button>
  );
}

// Action toolbar component
function ActionToolbar() {
  const { state, deleteSelectedObject, copySelectedObject } = useEditor();
  const { selectedObjectId, selectedObjectType } = state;

  const hasSelection = selectedObjectId !== null && selectedObjectType !== null;
  // Players and markers cannot be copied (unique identifiers)
  const canCopy = hasSelection && (selectedObjectType === 'enemy' || selectedObjectType === 'aoe');

  const buttonStyle = (disabled: boolean) => ({
    padding: '8px 12px',
    background: disabled ? '#1a1a2e' : '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: disabled ? '#555' : '#fff',
    fontSize: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  });

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      marginBottom: '14px',
      paddingBottom: '14px',
      borderBottom: '1px solid #3a3a5a',
    }}>
      <button
        onClick={copySelectedObject}
        disabled={!canCopy}
        style={buttonStyle(!canCopy)}
        title={canCopy ? 'コピー (Ctrl+D)' : 'プレイヤーとマーカーはコピーできません'}
      >
        <span>+</span>
        <span>コピー</span>
      </button>
      <button
        onClick={deleteSelectedObject}
        disabled={!hasSelection}
        style={{
          ...buttonStyle(!hasSelection),
          background: hasSelection ? '#6b2020' : '#1a1a2e',
        }}
        title="削除 (Delete)"
      >
        <span>-</span>
        <span>削除</span>
      </button>
    </div>
  );
}

// PlayerItem component with move button
interface PlayerItemProps {
  player: Player;
  position: Position;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onAddMove: () => void;
}

function PlayerItem({ player, position, isSelected, onSelect, onAddMove }: PlayerItemProps) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '8px 10px',
        marginBottom: '3px',
        background: isSelected ? '#3753c7' : 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        color: '#fff',
        fontSize: '13px',
        textAlign: 'left',
        gap: '10px',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = '#2a2a4a';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {/* Color indicator */}
      <div
        style={{
          width: '14px',
          height: '14px',
          borderRadius: '2px',
          background: getRoleColor(player.role),
          flexShrink: 0,
        }}
      />

      {/* Name and position */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {player.role}
        </div>
        <div style={{ fontSize: '11px', color: '#888' }}>
          {formatPosition(position)}
        </div>
      </div>

      {/* Move button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddMove();
        }}
        style={{
          padding: '4px 10px',
          background: '#2c9c3c',
          border: 'none',
          borderRadius: '3px',
          color: '#fff',
          fontSize: '11px',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#3cb54c';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#2c9c3c';
        }}
        title="移動イベントを追加"
      >
        移動
      </button>
    </div>
  );
}

// Selection toolbar component for multi-select support
interface SelectionToolbarProps {
  allSelected: boolean;
  hasSelection: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  selectAllTitle?: string;
  clearTitle?: string;
}

function SelectionToolbar({
  allSelected,
  hasSelection,
  onSelectAll,
  onClearSelection,
  selectAllTitle = '全選択',
  clearTitle = '選択解除',
}: SelectionToolbarProps) {
  return (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
      <button
        onClick={onSelectAll}
        style={{
          flex: 1,
          padding: '4px 8px',
          background: allSelected ? '#3753c7' : '#2a2a4a',
          border: '1px solid #3a3a5a',
          borderRadius: '4px',
          color: '#fff',
          fontSize: '10px',
          cursor: 'pointer',
        }}
        title={selectAllTitle}
      >
        全選択
      </button>
      <button
        onClick={onClearSelection}
        disabled={!hasSelection}
        style={{
          flex: 1,
          padding: '4px 8px',
          background: !hasSelection ? '#1a1a2e' : '#2a2a4a',
          border: '1px solid #3a3a5a',
          borderRadius: '4px',
          color: !hasSelection ? '#555' : '#fff',
          fontSize: '10px',
          cursor: !hasSelection ? 'not-allowed' : 'pointer',
        }}
        title={clearTitle}
      >
        選択解除
      </button>
    </div>
  );
}

// Main ObjectListPanel component
export function ObjectListPanel() {
  const {
    state,
    selectObject,
    toggleMultiSelect,
    selectAllPlayers,
    selectAllEnemies,
    selectAllAoEs,
    selectAllAnnotations,
    selectAllObjects,
    clearMultiSelect,
    updatePlayersOrder,
    startMoveFromList
  } = useEditor();

  const { mechanic, currentFrame, selectedObjectId, selectedObjectType, selectedObjectIds } = state;

  // Handle player reorder via drag and drop
  const handlePlayersReorder = useCallback((reorderedPlayers: Player[]) => {
    updatePlayersOrder(reorderedPlayers);
  }, [updatePlayersOrder]);

  // Get current player positions
  const playersWithPositions = useMemo(() =>
    getPlayersAtFrame(mechanic, currentFrame),
    [mechanic, currentFrame]
  );

  // Get AoE info
  const aoeEventPairs = useMemo(() =>
    getAoEEventPairs(mechanic.timeline),
    [mechanic.timeline]
  );
  const activeAoEs = useMemo(() =>
    getActiveAoEs(mechanic.timeline, currentFrame, mechanic),
    [mechanic.timeline, currentFrame, mechanic]
  );
  const activeAoEIds = useMemo(() =>
    new Set(activeAoEs.map(a => a.id)),
    [activeAoEs]
  );

  // Get text annotations
  const annotationEventPairs = useMemo(() =>
    getAnnotationEventPairs(mechanic.timeline),
    [mechanic.timeline]
  );
  const activeAnnotations = useMemo(() =>
    getActiveAnnotations(mechanic.timeline, currentFrame),
    [mechanic.timeline, currentFrame]
  );
  const activeAnnotationIds = useMemo(() =>
    new Set(activeAnnotations.map(a => a.id)),
    [activeAnnotations]
  );

  // Get objects
  const objectEventPairs = useMemo(() =>
    getObjectEventPairs(mechanic.timeline),
    [mechanic.timeline]
  );
  const activeObjectsAtFrame = useMemo(() =>
    getActiveObjects(mechanic.timeline, currentFrame),
    [mechanic.timeline, currentFrame]
  );
  const activeObjectIds = useMemo(() =>
    new Set(activeObjectsAtFrame.map(o => o.id)),
    [activeObjectsAtFrame]
  );

  // Selection state helpers
  const isPlayerSelected = (id: string) =>
    selectedObjectIds.includes(id) || (selectedObjectId === id && selectedObjectType === 'player');

  const isEnemySelected = (id: string) =>
    selectedObjectIds.includes(id) || (selectedObjectId === id && selectedObjectType === 'enemy');

  const isAoESelected = (id: string) =>
    selectedObjectIds.includes(id) || (selectedObjectId === id && selectedObjectType === 'aoe');

  const isAnnotationSelected = (id: string) =>
    selectedObjectIds.includes(id) || (selectedObjectId === id && selectedObjectType === 'text');

  const isObjectSelected = (id: string) =>
    selectedObjectIds.includes(id) || (selectedObjectId === id && selectedObjectType === 'object');

  // Handle multi-select clicks
  const handlePlayerSelect = (e: React.MouseEvent, id: string) => {
    if (e.shiftKey) {
      toggleMultiSelect(id, 'player');
    } else {
      selectObject(id, 'player');
    }
  };

  const handleEnemySelect = (e: React.MouseEvent, id: string) => {
    if (e.shiftKey) {
      toggleMultiSelect(id, 'enemy');
    } else {
      selectObject(id, 'enemy');
    }
  };

  const handleAoESelect = (e: React.MouseEvent, id: string) => {
    if (e.shiftKey) {
      toggleMultiSelect(id, 'aoe');
    } else {
      selectObject(id, 'aoe');
    }
  };

  const handleAnnotationSelect = (e: React.MouseEvent, id: string) => {
    if (e.shiftKey) {
      toggleMultiSelect(id, 'text');
    } else {
      selectObject(id, 'text');
    }
  };

  const handleObjectSelect = (e: React.MouseEvent, id: string) => {
    if (e.shiftKey) {
      toggleMultiSelect(id, 'object');
    } else {
      selectObject(id, 'object');
    }
  };

  // Get selected IDs by type
  const selectedEnemyIds = selectedObjectType === 'enemy' ? selectedObjectIds : [];
  const selectedAoEIds = selectedObjectType === 'aoe' ? selectedObjectIds : [];
  const selectedAnnotationIds = selectedObjectType === 'text' ? selectedObjectIds : [];
  const selectedObjectIdsOfType = selectedObjectType === 'object' ? selectedObjectIds : [];

  return (
    <div
      style={{
        background: '#1a1a2e',
        padding: '12px',
      }}
    >
      {/* Action toolbar */}
      <ActionToolbar />

      {/* Players group */}
      <CollapsibleGroup title="プレイヤー" count={mechanic.initialPlayers.length}>
        {mechanic.initialPlayers.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            プレイヤーがいません
          </div>
        ) : (
          <>
            <SelectionToolbar
              allSelected={selectedObjectIds.length === mechanic.initialPlayers.length && selectedObjectType === 'player'}
              hasSelection={selectedObjectType === 'player' && selectedObjectIds.length > 0}
              onSelectAll={selectAllPlayers}
              onClearSelection={clearMultiSelect}
              selectAllTitle="全プレイヤーを選択"
              clearTitle="選択を解除"
            />
            <DraggableList
              items={mechanic.initialPlayers}
              onReorder={handlePlayersReorder}
              renderItem={(player) => {
                const playerWithPosition = playersWithPositions.find(p => p.id === player.id);
                const position = playerWithPosition?.position || player.position;
                return (
                  <PlayerItem
                    key={player.id}
                    player={player}
                    position={position}
                    isSelected={isPlayerSelected(player.id)}
                    onSelect={(e) => handlePlayerSelect(e, player.id)}
                    onAddMove={() => startMoveFromList(player.id)}
                  />
                );
              }}
            />
          </>
        )}
      </CollapsibleGroup>

      {/* Markers group - no multi-selection needed as markers are unique */}
      <CollapsibleGroup title="フィールドマーカー" count={mechanic.markers.length}>
        {mechanic.markers.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            マーカーがありません
          </div>
        ) : (
          mechanic.markers.map((marker) => (
            <ObjectItem
              key={marker.type}
              id={marker.type}
              objectType="marker"
              name={`マーカー ${marker.type}`}
              subtitle={formatPosition(marker.position)}
              color={getMarkerColor(marker.type)}
              isSelected={selectedObjectId === marker.type && selectedObjectType === 'marker'}
              onSelect={() => selectObject(marker.type, 'marker')}
            />
          ))
        )}
      </CollapsibleGroup>

      {/* Enemies group with multi-selection */}
      <CollapsibleGroup title="エネミー" count={mechanic.enemies.length}>
        {mechanic.enemies.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            エネミーがいません
          </div>
        ) : (
          <>
            <SelectionToolbar
              allSelected={selectedEnemyIds.length === mechanic.enemies.length}
              hasSelection={selectedEnemyIds.length > 0}
              onSelectAll={selectAllEnemies}
              onClearSelection={clearMultiSelect}
              selectAllTitle="全エネミーを選択"
              clearTitle="選択を解除"
            />
            {mechanic.enemies.map((enemy) => (
              <ObjectItem
                key={enemy.id}
                id={enemy.id}
                objectType="enemy"
                name={enemy.name}
                subtitle={formatPosition(enemy.position)}
                color={enemy.color || '#ff0000'}
                isSelected={isEnemySelected(enemy.id)}
                onSelect={(e) => handleEnemySelect(e, enemy.id)}
              />
            ))}
          </>
        )}
      </CollapsibleGroup>

      {/* AoEs group with multi-selection */}
      <CollapsibleGroup title="AoE" count={aoeEventPairs.length}>
        {aoeEventPairs.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            AoEがありません
          </div>
        ) : (
          <>
            <SelectionToolbar
              allSelected={selectedAoEIds.length === aoeEventPairs.length}
              hasSelection={selectedAoEIds.length > 0}
              onSelectAll={selectAllAoEs}
              onClearSelection={clearMultiSelect}
              selectAllTitle="全AoEを選択"
              clearTitle="選択を解除"
            />
            {aoeEventPairs.map(({ aoe, showFrame, hideFrame }) => {
              const isActive = activeAoEIds.has(aoe.id);
              const frameInfo = hideFrame !== null
                ? `${showFrame}f - ${hideFrame}f`
                : `${showFrame}f -`;

              return (
                <ObjectItem
                  key={aoe.id}
                  id={aoe.id}
                  objectType="aoe"
                  name={`${getAoETypeIcon(aoe.type)} ${getAoETypeName(aoe.type)}`}
                  subtitle={`${formatPosition(aoe.position)} [${frameInfo}]`}
                  color={aoe.color || '#ff6600'}
                  isSelected={isAoESelected(aoe.id)}
                  isActive={isActive}
                  onSelect={(e) => handleAoESelect(e, aoe.id)}
                />
              );
            })}
          </>
        )}
      </CollapsibleGroup>

      {/* Text annotations group with multi-selection */}
      <CollapsibleGroup title="テキスト" count={annotationEventPairs.length}>
        {annotationEventPairs.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            テキスト注釈がありません
          </div>
        ) : (
          <>
            <SelectionToolbar
              allSelected={selectedAnnotationIds.length === annotationEventPairs.length}
              hasSelection={selectedAnnotationIds.length > 0}
              onSelectAll={selectAllAnnotations}
              onClearSelection={clearMultiSelect}
              selectAllTitle="全テキストを選択"
              clearTitle="選択を解除"
            />
            {annotationEventPairs.map(({ annotation, showFrame, hideFrame }) => {
              const isActive = activeAnnotationIds.has(annotation.id);
              const frameInfo = hideFrame !== null
                ? `${showFrame}f - ${hideFrame}f`
                : `${showFrame}f -`;
              const displayText = annotation.text.length > 20
                ? annotation.text.slice(0, 20) + '...'
                : annotation.text;

              return (
                <ObjectItem
                  key={annotation.id}
                  id={annotation.id}
                  objectType="text"
                  name={displayText}
                  subtitle={`${formatPosition(annotation.position)} [${frameInfo}]`}
                  color={annotation.color}
                  isSelected={isAnnotationSelected(annotation.id)}
                  isActive={isActive}
                  onSelect={(e) => handleAnnotationSelect(e, annotation.id)}
                />
              );
            })}
          </>
        )}
      </CollapsibleGroup>

      {/* Objects group with multi-selection */}
      <CollapsibleGroup title="オブジェクト" count={objectEventPairs.length}>
        {objectEventPairs.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            オブジェクトがありません
          </div>
        ) : (
          <>
            <SelectionToolbar
              allSelected={selectedObjectIdsOfType.length === objectEventPairs.length}
              hasSelection={selectedObjectIdsOfType.length > 0}
              onSelectAll={selectAllObjects}
              onClearSelection={clearMultiSelect}
              selectAllTitle="全オブジェクトを選択"
              clearTitle="選択を解除"
            />
            {objectEventPairs.map(({ object, showFrame, hideFrame }) => {
              const isActive = activeObjectIds.has(object.id);
              const frameInfo = hideFrame !== null
                ? `${showFrame}f - ${hideFrame}f`
                : `${showFrame}f -`;

              return (
                <ObjectItem
                  key={object.id}
                  id={object.id}
                  objectType="object"
                  name={`${object.icon || OBJECT_SHAPE_ICONS[object.shape]} ${object.name}`}
                  subtitle={`${formatPosition(object.position)} [${frameInfo}]`}
                  color={object.color}
                  isSelected={isObjectSelected(object.id)}
                  isActive={isActive}
                  onSelect={(e) => handleObjectSelect(e, object.id)}
                />
              );
            })}
          </>
        )}
      </CollapsibleGroup>
    </div>
  );
}
