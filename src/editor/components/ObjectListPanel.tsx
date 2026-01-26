import React, { useState, useCallback } from 'react';
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
    <div style={{ marginBottom: '8px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '6px 8px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
          fontSize: '12px',
          textAlign: 'left',
        }}
      >
        <span style={{ marginRight: '6px', fontSize: '10px' }}>
          {isOpen ? '▼' : '▶'}
        </span>
        <span style={{ flex: 1 }}>{title}</span>
        <span
          style={{
            background: '#3a3a5a',
            padding: '2px 6px',
            borderRadius: '8px',
            fontSize: '10px',
            color: '#888',
          }}
        >
          {count}
        </span>
      </button>
      {isOpen && (
        <div style={{ paddingLeft: '8px' }}>
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
  onSelect: () => void;
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
        padding: '6px 8px',
        marginBottom: '2px',
        background: isSelected ? '#3753c7' : 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        color: '#fff',
        fontSize: '11px',
        textAlign: 'left',
        gap: '8px',
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
            width: '12px',
            height: '12px',
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
          <div style={{ fontSize: '10px', color: '#888' }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Active indicator for AoEs */}
      {isActive !== undefined && (
        <div
          style={{
            width: '8px',
            height: '8px',
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
    padding: '6px 10px',
    background: disabled ? '#1a1a2e' : '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: disabled ? '#555' : '#fff',
    fontSize: '11px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  });

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      marginBottom: '12px',
      paddingBottom: '12px',
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

// Main ObjectListPanel component
export function ObjectListPanel() {
  const { state, selectObject, selectAllPlayers, clearMultiSelect, updatePlayersOrder } = useEditor();
  const { mechanic, currentFrame, selectedObjectId, selectedObjectType, selectedObjectIds } = state;

  // Handle player reorder via drag and drop
  const handlePlayersReorder = useCallback((reorderedPlayers: Player[]) => {
    updatePlayersOrder(reorderedPlayers);
  }, [updatePlayersOrder]);

  // Get current player positions
  const playersWithPositions = getPlayersAtFrame(mechanic, currentFrame);

  // Get AoE info
  const aoeEventPairs = getAoEEventPairs(mechanic.timeline);
  const activeAoEs = getActiveAoEs(mechanic.timeline, currentFrame);
  const activeAoEIds = new Set(activeAoEs.map(a => a.id));

  // Get text annotations
  const annotationEventPairs = getAnnotationEventPairs(mechanic.timeline);
  const activeAnnotations = getActiveAnnotations(mechanic.timeline, currentFrame);
  const activeAnnotationIds = new Set(activeAnnotations.map(a => a.id));

  // Get objects
  const objectEventPairs = getObjectEventPairs(mechanic.timeline);
  const activeObjectsAtFrame = getActiveObjects(mechanic.timeline, currentFrame);
  const activeObjectIds = new Set(activeObjectsAtFrame.map(o => o.id));

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
            {/* Select all / Clear selection buttons */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
              <button
                onClick={selectAllPlayers}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  background: selectedObjectIds.length === mechanic.initialPlayers.length && selectedObjectType === 'player' ? '#3753c7' : '#2a2a4a',
                  border: '1px solid #3a3a5a',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
                title="全プレイヤーを選択"
              >
                全選択
              </button>
              <button
                onClick={clearMultiSelect}
                disabled={selectedObjectIds.length === 0}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  background: selectedObjectIds.length === 0 ? '#1a1a2e' : '#2a2a4a',
                  border: '1px solid #3a3a5a',
                  borderRadius: '4px',
                  color: selectedObjectIds.length === 0 ? '#555' : '#fff',
                  fontSize: '10px',
                  cursor: selectedObjectIds.length === 0 ? 'not-allowed' : 'pointer',
                }}
                title="選択を解除"
              >
                選択解除
              </button>
            </div>
            <DraggableList
              items={mechanic.initialPlayers}
              onReorder={handlePlayersReorder}
              renderItem={(player, isDragging, isDropTarget) => {
                const playerWithPosition = playersWithPositions.find(p => p.id === player.id);
                const position = playerWithPosition?.position || player.position;
                return (
                  <ObjectItem
                    key={player.id}
                    id={player.id}
                    objectType="player"
                    name={player.role}
                    subtitle={formatPosition(position)}
                    color={getRoleColor(player.role)}
                    isSelected={selectedObjectIds.includes(player.id) || (selectedObjectId === player.id && selectedObjectType === 'player')}
                    onSelect={() => selectObject(player.id, 'player')}
                  />
                );
              }}
            />
          </>
        )}
      </CollapsibleGroup>

      {/* Markers group */}
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

      {/* Enemies group */}
      <CollapsibleGroup title="エネミー" count={mechanic.enemies.length}>
        {mechanic.enemies.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            エネミーがいません
          </div>
        ) : (
          mechanic.enemies.map((enemy) => (
            <ObjectItem
              key={enemy.id}
              id={enemy.id}
              objectType="enemy"
              name={enemy.name}
              subtitle={formatPosition(enemy.position)}
              color={enemy.color || '#ff0000'}
              isSelected={selectedObjectId === enemy.id && selectedObjectType === 'enemy'}
              onSelect={() => selectObject(enemy.id, 'enemy')}
            />
          ))
        )}
      </CollapsibleGroup>

      {/* AoEs group */}
      <CollapsibleGroup title="AoE" count={aoeEventPairs.length}>
        {aoeEventPairs.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            AoEがありません
          </div>
        ) : (
          aoeEventPairs.map(({ aoe, showFrame, hideFrame }) => {
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
                isSelected={selectedObjectId === aoe.id && selectedObjectType === 'aoe'}
                isActive={isActive}
                onSelect={() => selectObject(aoe.id, 'aoe')}
              />
            );
          })
        )}
      </CollapsibleGroup>

      {/* Text annotations group */}
      <CollapsibleGroup title="テキスト" count={annotationEventPairs.length}>
        {annotationEventPairs.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            テキスト注釈がありません
          </div>
        ) : (
          annotationEventPairs.map(({ annotation, showFrame, hideFrame }) => {
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
                isSelected={selectedObjectId === annotation.id && selectedObjectType === 'text'}
                isActive={isActive}
                onSelect={() => selectObject(annotation.id, 'text')}
              />
            );
          })
        )}
      </CollapsibleGroup>

      {/* Objects group */}
      <CollapsibleGroup title="オブジェクト" count={objectEventPairs.length}>
        {objectEventPairs.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            オブジェクトがありません
          </div>
        ) : (
          objectEventPairs.map(({ object, showFrame, hideFrame }) => {
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
                isSelected={selectedObjectId === object.id && selectedObjectType === 'object'}
                isActive={isActive}
                onSelect={() => selectObject(object.id, 'object')}
              />
            );
          })
        )}
      </CollapsibleGroup>
    </div>
  );
}
