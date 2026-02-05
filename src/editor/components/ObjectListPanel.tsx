import React, { useState, useCallback, useMemo } from 'react';
import { useEditor } from '../context/EditorContext';
import { useLanguage } from '../context/LanguageContext';
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

// AoE type name keys for i18n
const AOE_TYPE_KEYS: Record<AoEType, string> = {
  circle: 'tools.aoeCircle',
  cone: 'tools.aoeCone',
  line: 'tools.aoeLine',
  donut: 'tools.aoeDonut',
  cross: 'tools.aoeCross',
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
  none: '×',
};

// Helper functions
function getRoleColor(role: Role): string {
  return ROLE_COLORS[role] || '#888';
}

function getMarkerColor(type: MarkerType): string {
  return MARKER_COLORS[type] || '#888';
}

function getAoETypeKey(type: AoEType): string {
  return AOE_TYPE_KEYS[type] || type;
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

// Visibility toggle button component
interface VisibilityToggleProps {
  isHidden: boolean;
  onToggle: (e: React.MouseEvent) => void;
  showTitle: string;
  hideTitle: string;
}

function VisibilityToggle({ isHidden, onToggle, showTitle, hideTitle }: VisibilityToggleProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '2px 4px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        flexShrink: 0,
        opacity: isHidden ? 0.4 : 0.8,
        lineHeight: 1,
        color: '#fff',
      }}
      title={isHidden ? showTitle : hideTitle}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = isHidden ? '0.4' : '0.8';
      }}
    >
      {isHidden ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
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
  isHidden?: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onToggleVisibility?: (e: React.MouseEvent) => void;
  showTitle?: string;
  hideTitle?: string;
}

function ObjectItem({
  name,
  subtitle,
  color,
  icon,
  isSelected,
  isActive,
  isHidden,
  onSelect,
  onToggleVisibility,
  showTitle = '',
  hideTitle = '',
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
        opacity: isHidden ? 0.4 : 1,
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
          title={isActive ? 'Active' : 'Inactive'}
        />
      )}

      {/* Visibility toggle */}
      {onToggleVisibility && (
        <VisibilityToggle
          isHidden={!!isHidden}
          onToggle={onToggleVisibility}
          showTitle={showTitle}
          hideTitle={hideTitle}
        />
      )}
    </button>
  );
}

// Action toolbar component
function ActionToolbar() {
  const { state, deleteSelectedObject, copySelectedObject } = useEditor();
  const { t } = useLanguage();
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
        title={canCopy ? t('property.copyTitle') : t('property.copyDisabledTitle')}
      >
        <span>+</span>
        <span>{t('common.copy')}</span>
      </button>
      <button
        onClick={deleteSelectedObject}
        disabled={!hasSelection}
        style={{
          ...buttonStyle(!hasSelection),
          background: hasSelection ? '#6b2020' : '#1a1a2e',
        }}
        title={t('property.deleteTitle')}
      >
        <span>-</span>
        <span>{t('common.delete')}</span>
      </button>
    </div>
  );
}

// PlayerItem component with move button
interface PlayerItemProps {
  player: Player;
  position: Position;
  isSelected: boolean;
  isHidden?: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onAddMove: () => void;
  onToggleVisibility?: (e: React.MouseEvent) => void;
  showTitle?: string;
  hideTitle?: string;
}

function PlayerItem({ player, position, isSelected, isHidden, onSelect, onAddMove, onToggleVisibility, showTitle = '', hideTitle = '' }: PlayerItemProps) {
  const { t } = useLanguage();
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
        opacity: isHidden ? 0.4 : 1,
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
        title={t('objectList.moveTitle')}
      >
        {t('objectList.move')}
      </button>

      {/* Visibility toggle */}
      {onToggleVisibility && (
        <VisibilityToggle
          isHidden={!!isHidden}
          onToggle={onToggleVisibility}
          showTitle={showTitle}
          hideTitle={hideTitle}
        />
      )}
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
  selectAllTitle,
  clearTitle,
}: SelectionToolbarProps) {
  const { t } = useLanguage();
  const resolvedSelectAllTitle = selectAllTitle || t('common.selectAll');
  const resolvedClearTitle = clearTitle || t('common.deselect');
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
        title={resolvedSelectAllTitle}
      >
        {t('common.selectAll')}
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
        title={resolvedClearTitle}
      >
        {t('common.deselect')}
      </button>
    </div>
  );
}

// Main ObjectListPanel component
export function ObjectListPanel() {
  const { t } = useLanguage();
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
    startMoveFromList,
    toggleVisibility,
    isObjectHidden,
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
      <CollapsibleGroup title={t('objectList.players')} count={mechanic.initialPlayers.length}>
        {mechanic.initialPlayers.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            {t('objectList.noPlayers')}
          </div>
        ) : (
          <>
            <SelectionToolbar
              allSelected={selectedObjectIds.length === mechanic.initialPlayers.length && selectedObjectType === 'player'}
              hasSelection={selectedObjectType === 'player' && selectedObjectIds.length > 0}
              onSelectAll={selectAllPlayers}
              onClearSelection={clearMultiSelect}
              selectAllTitle={t('objectList.selectAllPlayers')}
              clearTitle={t('objectList.clearSelection')}
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
                    isHidden={isObjectHidden(player.id, 'player')}
                    onSelect={(e) => handlePlayerSelect(e, player.id)}
                    onAddMove={() => startMoveFromList(player.id)}
                    onToggleVisibility={(e) => {
                      e.stopPropagation();
                      toggleVisibility(player.id, 'player');
                    }}
                    showTitle={t('objectList.showItem')}
                    hideTitle={t('objectList.hideItem')}
                  />
                );
              }}
            />
          </>
        )}
      </CollapsibleGroup>

      {/* Markers group - no multi-selection needed as markers are unique */}
      <CollapsibleGroup title={t('objectList.markers')} count={mechanic.markers.length}>
        {mechanic.markers.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            {t('objectList.noMarkers')}
          </div>
        ) : (
          mechanic.markers.map((marker) => (
            <ObjectItem
              key={marker.type}
              id={marker.type}
              objectType="marker"
              name={t('objectList.markerLabel', { type: marker.type })}
              subtitle={formatPosition(marker.position)}
              color={getMarkerColor(marker.type)}
              isSelected={selectedObjectId === marker.type && selectedObjectType === 'marker'}
              isHidden={isObjectHidden(marker.type, 'marker')}
              onSelect={() => selectObject(marker.type, 'marker')}
              onToggleVisibility={(e) => {
                e.stopPropagation();
                toggleVisibility(marker.type, 'marker');
              }}
              showTitle={t('objectList.showItem')}
              hideTitle={t('objectList.hideItem')}
            />
          ))
        )}
      </CollapsibleGroup>

      {/* Enemies group with multi-selection */}
      <CollapsibleGroup title={t('objectList.enemies')} count={mechanic.enemies.length}>
        {mechanic.enemies.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            {t('objectList.noEnemies')}
          </div>
        ) : (
          <>
            <SelectionToolbar
              allSelected={selectedEnemyIds.length === mechanic.enemies.length}
              hasSelection={selectedEnemyIds.length > 0}
              onSelectAll={selectAllEnemies}
              onClearSelection={clearMultiSelect}
              selectAllTitle={t('objectList.selectAllEnemies')}
              clearTitle={t('objectList.clearSelection')}
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
                isHidden={isObjectHidden(enemy.id, 'enemy')}
                onSelect={(e) => handleEnemySelect(e, enemy.id)}
                onToggleVisibility={(e) => {
                  e.stopPropagation();
                  toggleVisibility(enemy.id, 'enemy');
                }}
                showTitle={t('objectList.showItem')}
                hideTitle={t('objectList.hideItem')}
              />
            ))}
          </>
        )}
      </CollapsibleGroup>

      {/* AoEs group with multi-selection */}
      <CollapsibleGroup title={t('objectList.aoe')} count={aoeEventPairs.length}>
        {aoeEventPairs.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            {t('objectList.noAoEs')}
          </div>
        ) : (
          <>
            <SelectionToolbar
              allSelected={selectedAoEIds.length === aoeEventPairs.length}
              hasSelection={selectedAoEIds.length > 0}
              onSelectAll={selectAllAoEs}
              onClearSelection={clearMultiSelect}
              selectAllTitle={t('objectList.selectAllAoEs')}
              clearTitle={t('objectList.clearSelection')}
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
                  name={`${getAoETypeIcon(aoe.type)} ${t(getAoETypeKey(aoe.type) as any)}`}
                  subtitle={`${formatPosition(aoe.position)} [${frameInfo}]`}
                  color={aoe.color || '#ff6600'}
                  isSelected={isAoESelected(aoe.id)}
                  isActive={isActive}
                  isHidden={isObjectHidden(aoe.id, 'aoe')}
                  onSelect={(e) => handleAoESelect(e, aoe.id)}
                  onToggleVisibility={(e) => {
                    e.stopPropagation();
                    toggleVisibility(aoe.id, 'aoe');
                  }}
                  showTitle={t('objectList.showItem')}
                  hideTitle={t('objectList.hideItem')}
                />
              );
            })}
          </>
        )}
      </CollapsibleGroup>

      {/* Text annotations group with multi-selection */}
      <CollapsibleGroup title={t('objectList.text')} count={annotationEventPairs.length}>
        {annotationEventPairs.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            {t('objectList.noTexts')}
          </div>
        ) : (
          <>
            <SelectionToolbar
              allSelected={selectedAnnotationIds.length === annotationEventPairs.length}
              hasSelection={selectedAnnotationIds.length > 0}
              onSelectAll={selectAllAnnotations}
              onClearSelection={clearMultiSelect}
              selectAllTitle={t('objectList.selectAllTexts')}
              clearTitle={t('objectList.clearSelection')}
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
                  isHidden={isObjectHidden(annotation.id, 'text')}
                  onSelect={(e) => handleAnnotationSelect(e, annotation.id)}
                  onToggleVisibility={(e) => {
                    e.stopPropagation();
                    toggleVisibility(annotation.id, 'text');
                  }}
                  showTitle={t('objectList.showItem')}
                  hideTitle={t('objectList.hideItem')}
                />
              );
            })}
          </>
        )}
      </CollapsibleGroup>

      {/* Objects group with multi-selection */}
      <CollapsibleGroup title={t('objectList.objects')} count={objectEventPairs.length}>
        {objectEventPairs.length === 0 ? (
          <div style={{ fontSize: '10px', color: '#666', padding: '4px 8px' }}>
            {t('objectList.noObjects')}
          </div>
        ) : (
          <>
            <SelectionToolbar
              allSelected={selectedObjectIdsOfType.length === objectEventPairs.length}
              hasSelection={selectedObjectIdsOfType.length > 0}
              onSelectAll={selectAllObjects}
              onClearSelection={clearMultiSelect}
              selectAllTitle={t('objectList.selectAllObjects')}
              clearTitle={t('objectList.clearSelection')}
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
                  name={`${object.imageUrl ? '[📷]' : (object.icon || OBJECT_SHAPE_ICONS[object.shape])} ${object.name}`}
                  subtitle={`${formatPosition(object.position)} [${frameInfo}]`}
                  color={object.color}
                  isSelected={isObjectSelected(object.id)}
                  isActive={isActive}
                  isHidden={isObjectHidden(object.id, 'object')}
                  onSelect={(e) => handleObjectSelect(e, object.id)}
                  onToggleVisibility={(e) => {
                    e.stopPropagation();
                    toggleVisibility(object.id, 'object');
                  }}
                  showTitle={t('objectList.showItem')}
                  hideTitle={t('objectList.hideItem')}
                />
              );
            })}
          </>
        )}
      </CollapsibleGroup>
    </div>
  );
}
