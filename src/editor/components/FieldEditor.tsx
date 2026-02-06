import React, { useCallback, useMemo, useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { useFieldCoordinates } from '../hooks/useFieldCoordinates';
import { Field } from '../../components/field/Field';
import { Player as PlayerComponent } from '../../components/player/Player';
import type { Player } from '../../data/types';
import { Enemy } from '../../components/enemy/Enemy';
import { FieldMarker } from '../../components/marker/FieldMarker';
import { AoE } from '../../components/aoe/AoE';
import { gameToScreen, screenToGame } from '../../utils/coordinates';
import { MoveEventDialog, type MoveEventSettings } from './MoveEventDialog';
import { PlayerSelectionDialog } from './PlayerSelectionDialog';
import { AoEDialog } from './AoEDialog';
import { AoEPreview } from './AoEPreview';
import { MovementPaths } from './MovementPaths';
import { DebuffDialog } from './DebuffDialog';
import { TextAnnotationDialog } from './TextAnnotationDialog';
import { ObjectDialog } from './ObjectDialog';
import { getPlayersAtFrame, findActiveMoveEvent } from '../utils/getPlayersAtFrame';
import { getActiveAoEs, type ActiveAoE } from '../utils/getActiveAoEs';
import { getActiveAnnotations } from '../utils/getActiveAnnotations';
import { getActiveObjects } from '../utils/getActiveObjects';
import { getPlayerDebuffs } from '../utils/getPlayerDebuffs';
import type { Position, Debuff, GimmickObject, CastEvent, CastDisplay } from '../../data/types';
import type { AoESettings, DebuffSettings, TextSettings, ObjectSettings } from '../context/editorReducer';
import { CastBar } from '../../components/ui/CastBar';

const SCREEN_SIZE = 600;

export function FieldEditor() {
  const {
    state,
    selectObject,
    updatePlayer,
    updateEnemy,
    updateMarker,
    updateAoE,
    getAoEsAtFrame,
    setZoom,
    toggleMultiSelect,
    startMoveEvent,
    completeMoveEvent,
    cancelMoveEvent,
    updateTimelineEvent,
    startAoEPlacement,
    completeAoEPlacement,
    cancelAoEPlacement,
    startDebuffAdd,
    completeDebuffAdd,
    cancelDebuffAdd,
    completeTextPlacement,
    cancelTextPlacement,
    updateTextAnnotation,
    completeObjectPlacement,
    cancelObjectPlacement,
    updateObject,
    cancelMoveFromList,
    isObjectHidden,
  } = useEditor();

  const { mechanic, selectedObjectId, selectedObjectType, selectedObjectIds, currentFrame, zoom, gridSnap, tool, pendingMoveEvent, pendingAoE, selectedAoEType, pendingDebuff, moveFromListMode } = state;

  const [dragging, setDragging] = useState<{
    id: string;
    type: string;
  } | null>(null);

  const [mousePos, setMousePos] = useState<Position | null>(null);
  const [pendingToPosition, setPendingToPosition] = useState<Position | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showAoEDialog, setShowAoEDialog] = useState(false);
  const [pendingAoEPosition, setPendingAoEPosition] = useState<Position | null>(null);
  const [showDebuffDialog, setShowDebuffDialog] = useState(false);
  const [pendingDebuffTargetId, setPendingDebuffTargetId] = useState<string | null>(null);
  const [showPlayerSelectionDialog, setShowPlayerSelectionDialog] = useState(false);
  const [overlappingPlayers, setOverlappingPlayers] = useState<Player[]>([]);
  const [overlappingPlayerPositions, setOverlappingPlayerPositions] = useState<Map<string, Position>>(new Map());
  const [pendingMoveStartPos, setPendingMoveStartPos] = useState<Position | null>(null);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [pendingTextPosition, setPendingTextPosition] = useState<Position | null>(null);
  const [showObjectDialog, setShowObjectDialog] = useState(false);
  const [pendingObjectPosition, setPendingObjectPosition] = useState<Position | null>(null);

  const fieldContainerRef = React.useRef<HTMLDivElement>(null);

  // Calculate players at current frame
  const playersAtCurrentFrame = useMemo(() => {
    return getPlayersAtFrame(mechanic, currentFrame);
  }, [mechanic, currentFrame]);

  const snapToGrid = useCallback((pos: Position): Position => {
    if (!gridSnap) return pos;
    const gridSize = 0.5;
    return {
      x: Math.round(pos.x / gridSize) * gridSize,
      y: Math.round(pos.y / gridSize) * gridSize,
    };
  }, [gridSnap]);

  const getGamePosFromEvent = useCallback(
    (e: React.MouseEvent | MouseEvent): Position => {
      if (!fieldContainerRef.current) return { x: 0, y: 0 };
      const rect = fieldContainerRef.current.getBoundingClientRect();
      const screenPos = {
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom,
      };
      const gamePos = screenToGame(screenPos, mechanic.field.size, SCREEN_SIZE);
      return snapToGrid(gamePos);
    },
    [zoom, mechanic.field.size, snapToGrid]
  );

  const clampToField = useCallback((pos: Position): Position => {
    const halfSize = mechanic.field.size / 2;
    return {
      x: Math.max(-halfSize, Math.min(halfSize, pos.x)),
      y: Math.max(-halfSize, Math.min(halfSize, pos.y)),
    };
  }, [mechanic.field.size]);

  // Use getActiveAoEs for fade in/out animation in editor - moved up for use in findObjectAtPos
  const activeAoEsForLookup = useMemo(() => getActiveAoEs(mechanic.timeline, currentFrame, mechanic), [mechanic.timeline, currentFrame, mechanic]);

  // Get active text annotations - moved up for use in findObjectAtPos
  const activeAnnotations = useMemo(() => getActiveAnnotations(mechanic.timeline, currentFrame), [mechanic.timeline, currentFrame]);

  // Get active objects - moved up for use in findObjectAtPos
  const activeObjects = useMemo(() => getActiveObjects(mechanic.timeline, currentFrame), [mechanic.timeline, currentFrame]);

  // Find all players at position (using calculated positions)
  const findPlayersAtPos = useCallback((gamePos: Position): Player[] => {
    const tolerance = 1.5;
    const found: Player[] = [];
    for (const player of playersAtCurrentFrame) {
      const dx = player.position.x - gamePos.x;
      const dy = player.position.y - gamePos.y;
      if (Math.sqrt(dx * dx + dy * dy) < tolerance) {
        // Return the original player
        const originalPlayer = mechanic.initialPlayers.find(p => p.id === player.id);
        if (originalPlayer) {
          found.push(originalPlayer);
        }
      }
    }
    return found;
  }, [playersAtCurrentFrame, mechanic.initialPlayers]);

  // Find single player at position (legacy - for backward compatibility)
  const findPlayerAtPos = useCallback((gamePos: Position): Player | null => {
    const players = findPlayersAtPos(gamePos);
    return players.length > 0 ? players[0] : null;
  }, [findPlayersAtPos]);

  // Find object at position (using calculated positions)
  const findObjectAtPos = useCallback((gamePos: Position) => {
    const tolerance = 1.5;

    // Check players at their current animated positions
    for (const player of playersAtCurrentFrame) {
      const dx = player.position.x - gamePos.x;
      const dy = player.position.y - gamePos.y;
      if (Math.sqrt(dx * dx + dy * dy) < tolerance) {
        return { id: player.id, type: 'player' as const };
      }
    }

    for (const enemy of mechanic.enemies) {
      const dx = enemy.position.x - gamePos.x;
      const dy = enemy.position.y - gamePos.y;
      const enemyTolerance = (enemy.size || 3) / 2 + 0.5;
      if (Math.sqrt(dx * dx + dy * dy) < enemyTolerance) {
        return { id: enemy.id, type: 'enemy' as const };
      }
    }

    for (const marker of mechanic.markers) {
      const dx = marker.position.x - gamePos.x;
      const dy = marker.position.y - gamePos.y;
      if (Math.sqrt(dx * dx + dy * dy) < tolerance + 1) {
        return { id: marker.type, type: 'marker' as const };
      }
    }

    const visibleAoEs = getAoEsAtFrame(currentFrame);
    for (const aoe of visibleAoEs) {
      const dx = aoe.position.x - gamePos.x;
      const dy = aoe.position.y - gamePos.y;
      if (Math.sqrt(dx * dx + dy * dy) < tolerance + 1) {
        return { id: aoe.id, type: 'aoe' as const };
      }
    }

    // Check text annotations
    for (const annotation of activeAnnotations) {
      const dx = annotation.position.x - gamePos.x;
      const dy = annotation.position.y - gamePos.y;
      if (Math.sqrt(dx * dx + dy * dy) < tolerance + 1) {
        return { id: annotation.id, type: 'text' as const };
      }
    }

    // Check objects
    for (const obj of activeObjects) {
      const dx = obj.position.x - gamePos.x;
      const dy = obj.position.y - gamePos.y;
      if (Math.sqrt(dx * dx + dy * dy) < obj.size / 2 + 1) {
        return { id: obj.id, type: 'object' as const };
      }
    }

    return null;
  }, [playersAtCurrentFrame, mechanic.enemies, mechanic.markers, getAoEsAtFrame, currentFrame, activeAnnotations, activeObjects]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;

      const gamePos = clampToField(getGamePosFromEvent(e));

      // Move from list mode (player was selected from ObjectListPanel)
      if (moveFromListMode.active && moveFromListMode.playerId) {
        const playerId = moveFromListMode.playerId;
        const playerPos = playersAtCurrentFrame.find(p => p.id === playerId)?.position;

        if (playerPos) {
          // Start a pending move event and open dialog
          const fromPositions = new Map<string, Position>();
          fromPositions.set(playerId, playerPos);
          startMoveEvent([playerId], fromPositions);
          setPendingToPosition(gamePos);
          setShowMoveDialog(true);
        }

        // Cancel moveFromListMode
        cancelMoveFromList();
        return;
      }

      // Move event mode (both 'move' and 'add_move_event' tools)
      if (tool === 'move' || tool === 'add_move_event') {
        if (!pendingMoveEvent) {
          // Step 1: Select player(s) to move
          const playersAtPos = findPlayersAtPos(gamePos);
          
          if (playersAtPos.length > 1) {
            // Multiple players overlapping - show selection dialog
            const positions = new Map<string, Position>();
            playersAtPos.forEach(p => {
              const pos = playersAtCurrentFrame.find(player => player.id === p.id)?.position;
              if (pos) positions.set(p.id, pos);
            });
            setOverlappingPlayers(playersAtPos);
            setOverlappingPlayerPositions(positions);
            setPendingMoveStartPos(gamePos);
            setShowPlayerSelectionDialog(true);
          } else if (playersAtPos.length === 1) {
            // Single player - proceed as before
            const player = playersAtPos[0];
            // Check if we already have multi-selected players
            if (selectedObjectIds.length > 0 && selectedObjectType === 'player') {
              // If clicked player is part of selection, use all selected players
              if (selectedObjectIds.includes(player.id)) {
                const fromPositions = new Map<string, Position>();
                for (const id of selectedObjectIds) {
                  const pos = playersAtCurrentFrame.find(p => p.id === id)?.position;
                  if (pos) fromPositions.set(id, pos);
                }
                startMoveEvent(selectedObjectIds, fromPositions);
              } else {
                // Clicked on a different player, use just that one
                const calculatedPos = playersAtCurrentFrame.find(p => p.id === player.id)?.position || player.position;
                const fromPositions = new Map<string, Position>();
                fromPositions.set(player.id, calculatedPos);
                startMoveEvent([player.id], fromPositions);
              }
            } else {
              // Single player selection
              const calculatedPos = playersAtCurrentFrame.find(p => p.id === player.id)?.position || player.position;
              const fromPositions = new Map<string, Position>();
              fromPositions.set(player.id, calculatedPos);
              startMoveEvent([player.id], fromPositions);
            }
          }
        } else {
          // Step 2: Select destination
          setPendingToPosition(gamePos);
          setShowMoveDialog(true);
        }
        return;
      }

      // AoE placement mode
      if (tool === 'add_aoe') {
        setPendingAoEPosition(gamePos);
        setShowAoEDialog(true);
        return;
      }

      // Debuff mode
      if (tool === 'add_debuff') {
        const player = findPlayerAtPos(gamePos);
        if (player) {
          setPendingDebuffTargetId(player.id);
          setShowDebuffDialog(true);
        }
        return;
      }

      // Text annotation mode
      if (tool === 'add_text') {
        setPendingTextPosition(gamePos);
        setShowTextDialog(true);
        return;
      }

      // Object placement mode
      if (tool === 'add_object') {
        setPendingObjectPosition(gamePos);
        setShowObjectDialog(true);
        return;
      }

      // Normal selection/drag mode
      if (tool === 'select') {
        const found = findObjectAtPos(gamePos);
        if (found) {
          // Shift+click for multi-select (players only)
          if (e.shiftKey && found.type === 'player') {
            toggleMultiSelect(found.id, found.type);
          } else {
            selectObject(found.id, found.type);
            setDragging(found);
          }
        } else {
          selectObject(null, null);
        }
      }
    },
    [getGamePosFromEvent, clampToField, findObjectAtPos, findPlayerAtPos, selectObject, toggleMultiSelect, tool, pendingMoveEvent, startMoveEvent, playersAtCurrentFrame, selectedObjectIds, selectedObjectType, moveFromListMode, cancelMoveFromList]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const gamePos = clampToField(getGamePosFromEvent(e));

      if ((tool === 'move' || tool === 'add_move_event') && pendingMoveEvent) {
        setMousePos(gamePos);
      } else if (tool === 'add_aoe' && !showAoEDialog) {
        setMousePos(gamePos);
      }
    },
    [tool, pendingMoveEvent, getGamePosFromEvent, clampToField, showAoEDialog]
  );

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  // Handle drag - update position based on whether there's an active move event
  // Handle player selection from overlapping dialog (defined before useEffect that uses it)
  const handlePlayerSelection = useCallback((playerIds: string[]) => {
    setShowPlayerSelectionDialog(false);
    
    if (playerIds.length === 0) return;
    
    // Get positions for all selected players
    const fromPositions = new Map<string, Position>();
    for (const id of playerIds) {
      const pos = playersAtCurrentFrame.find(p => p.id === id)?.position;
      if (pos) fromPositions.set(id, pos);
    }
    
    // Start move event with all selected players
    startMoveEvent(playerIds, fromPositions);
    
    setOverlappingPlayers([]);
    setOverlappingPlayerPositions(new Map());
    setPendingMoveStartPos(null);
  }, [playersAtCurrentFrame, startMoveEvent]);

  const handlePlayerSelectionCancel = useCallback(() => {
    setShowPlayerSelectionDialog(false);
    setOverlappingPlayers([]);
    setOverlappingPlayerPositions(new Map());
    setPendingMoveStartPos(null);
  }, []);

  React.useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const gamePos = clampToField(getGamePosFromEvent(e));

      switch (dragging.type) {
        case 'player': {
          // Check if there's an active move event at the current frame
          const activeMoveEvent = findActiveMoveEvent(mechanic.timeline, dragging.id, currentFrame);

          if (activeMoveEvent) {
            // Update the move event's 'to' position
            updateTimelineEvent(activeMoveEvent.id, { to: gamePos });
          } else {
            // Update the initial position
            updatePlayer(dragging.id, { position: gamePos });
          }
          break;
        }
        case 'enemy':
          updateEnemy(dragging.id, { position: gamePos });
          break;
        case 'marker':
          updateMarker(dragging.id as any, { position: gamePos });
          break;
        case 'aoe':
          updateAoE(dragging.id, { position: gamePos });
          break;
        case 'text':
          updateTextAnnotation(dragging.id, { position: gamePos });
          break;
        case 'object':
          updateObject(dragging.id, { position: gamePos });
          break;
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, getGamePosFromEvent, clampToField, updatePlayer, updateEnemy, updateMarker, updateAoE, updateTextAnnotation, updateObject, mechanic.timeline, currentFrame, updateTimelineEvent]);

  // Cancel move event or AoE placement on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (moveFromListMode.active) {
          cancelMoveFromList();
        }
        if (pendingMoveEvent || showMoveDialog) {
          cancelMoveEvent();
          setShowMoveDialog(false);
          setPendingToPosition(null);
        }
        if (showAoEDialog) {
          setShowAoEDialog(false);
          setPendingAoEPosition(null);
        }
        if (showDebuffDialog) {
          setShowDebuffDialog(false);
          setPendingDebuffTargetId(null);
        }
        if (showTextDialog) {
          setShowTextDialog(false);
          setPendingTextPosition(null);
          cancelTextPlacement();
        }
        if (showObjectDialog) {
          setShowObjectDialog(false);
          setPendingObjectPosition(null);
          cancelObjectPlacement();
        }
        if (showPlayerSelectionDialog) {
          handlePlayerSelectionCancel();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingMoveEvent, showMoveDialog, showAoEDialog, showDebuffDialog, showTextDialog, showObjectDialog, showPlayerSelectionDialog, cancelMoveEvent, cancelTextPlacement, cancelObjectPlacement, moveFromListMode, cancelMoveFromList, handlePlayerSelectionCancel]);

  // Use activeAoEsForLookup as activeAoEs for rendering (already computed earlier)
  const activeAoEs = activeAoEsForLookup;

  // Also keep visibleAoEs for selection checking (without opacity)
  const visibleAoEs = useMemo(() => getAoEsAtFrame(currentFrame), [getAoEsAtFrame, currentFrame]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(zoom + delta);
      }
    },
    [zoom, setZoom]
  );

  const handleMoveEventConfirm = useCallback((settings: MoveEventSettings) => {
    if (pendingToPosition) {
      completeMoveEvent(pendingToPosition, settings.startFrame, settings.duration, settings.easing);
    }
    setShowMoveDialog(false);
    setPendingToPosition(null);
  }, [pendingToPosition, completeMoveEvent]);

  const handleMoveEventCancel = useCallback(() => {
    cancelMoveEvent();
    setShowMoveDialog(false);
    setPendingToPosition(null);
  }, [cancelMoveEvent]);

  const handleAoEDialogConfirm = useCallback((settings: AoESettings) => {
    completeAoEPlacement(settings);
    setShowAoEDialog(false);
    setPendingAoEPosition(null);
    setMousePos(null);
  }, [completeAoEPlacement]);

  const handleAoEDialogCancel = useCallback(() => {
    setShowAoEDialog(false);
    setPendingAoEPosition(null);
  }, []);

  const handleDebuffDialogConfirm = useCallback((settings: DebuffSettings) => {
    completeDebuffAdd(settings);
    setShowDebuffDialog(false);
    setPendingDebuffTargetId(null);
  }, [completeDebuffAdd]);

  const handleDebuffDialogCancel = useCallback(() => {
    setShowDebuffDialog(false);
    setPendingDebuffTargetId(null);
  }, []);

  const handleTextDialogConfirm = useCallback((settings: TextSettings) => {
    completeTextPlacement(settings);
    setShowTextDialog(false);
    setPendingTextPosition(null);
  }, [completeTextPlacement]);

  const handleTextDialogCancel = useCallback(() => {
    setShowTextDialog(false);
    setPendingTextPosition(null);
  }, []);

  const handleObjectDialogConfirm = useCallback((settings: ObjectSettings) => {
    completeObjectPlacement(settings);
    setShowObjectDialog(false);
    setPendingObjectPosition(null);
  }, [completeObjectPlacement]);

  const handleObjectDialogCancel = useCallback(() => {
    setShowObjectDialog(false);
    setPendingObjectPosition(null);
  }, []);

  // Get debuffs for each player at current frame
  const playerDebuffs = useMemo(() => {
    const result: Map<string, Debuff[]> = new Map();
    for (const player of mechanic.initialPlayers) {
      const debuffs = getPlayerDebuffs(mechanic.timeline, player.id, currentFrame, mechanic.fps);
      if (debuffs.length > 0) {
        // Convert ActiveDebuff to Debuff format for the Player component
        result.set(player.id, debuffs);
      }
    }
    return result;
  }, [mechanic.timeline, mechanic.initialPlayers, currentFrame, mechanic.fps]);

  // Get active casts at current frame
  const activeCasts = useMemo(() => {
    const casts: CastDisplay[] = [];
    for (const event of mechanic.timeline) {
      if (event.type !== 'cast') continue;
      const castEvent = event as CastEvent;
      const endFrame = castEvent.frame + castEvent.duration;
      if (currentFrame < castEvent.frame || currentFrame > endFrame) continue;
      const progress = (currentFrame - castEvent.frame) / castEvent.duration;
      casts.push({
        id: castEvent.id,
        casterId: castEvent.casterId,
        skillName: castEvent.skillName,
        progress: Math.min(1, Math.max(0, progress)),
      });
    }
    return casts;
  }, [mechanic.timeline, currentFrame]);

  const scaledSize = SCREEN_SIZE * zoom;

  // Selection ring component
  const SelectionRing = ({ screenPos, size }: { screenPos: Position; size: number }) => (
    <div
      style={{
        position: 'absolute',
        left: screenPos.x - size / 2 - 4,
        top: screenPos.y - size / 2 - 4,
        width: size + 8,
        height: size + 8,
        border: '3px solid #00ffff',
        borderRadius: '50%',
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }}
    />
  );

  // Get selection rings for current selection (using calculated positions)
  const renderSelectionRings = () => {
    const rings: React.ReactElement[] = [];

    // Render rings for all multi-selected players
    if (selectedObjectType === 'player' && selectedObjectIds.length > 0) {
      for (const id of selectedObjectIds) {
        const player = playersAtCurrentFrame.find(p => p.id === id);
        if (player) {
          const screenPos = gameToScreen(player.position, mechanic.field.size, SCREEN_SIZE);
          rings.push(<SelectionRing key={id} screenPos={screenPos} size={30} />);
        }
      }
      return rings.length > 0 ? <>{rings}</> : null;
    }

    // Single selection for non-players
    if (!selectedObjectId || !selectedObjectType) return null;

    let pos: Position | null = null;
    let size = 30;

    switch (selectedObjectType) {
      case 'player': {
        // Use calculated position for players
        const player = playersAtCurrentFrame.find(p => p.id === selectedObjectId);
        if (player) pos = player.position;
        size = 30;
        break;
      }
      case 'enemy': {
        const enemy = mechanic.enemies.find(e => e.id === selectedObjectId);
        if (enemy) {
          pos = enemy.position;
          size = ((enemy.size || 3) / mechanic.field.size) * SCREEN_SIZE;
        }
        break;
      }
      case 'marker': {
        const marker = mechanic.markers.find(m => m.type === selectedObjectId);
        if (marker) pos = marker.position;
        size = 50;
        break;
      }
      case 'aoe': {
        const aoe = visibleAoEs.find(a => a.id === selectedObjectId);
        if (aoe) pos = aoe.position;
        size = 40;
        break;
      }
    }

    if (!pos) return null;

    const screenPos = gameToScreen(pos, mechanic.field.size, SCREEN_SIZE);
    return <SelectionRing screenPos={screenPos} size={size} />;
  };

  // Render move preview (line and destination circle)
  const renderMovePreview = () => {
    if (!pendingMoveEvent || !mousePos) return null;

    const toScreen = gameToScreen(mousePos, mechanic.field.size, SCREEN_SIZE);
    const { playerIds, fromPositions } = pendingMoveEvent;

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: SCREEN_SIZE,
          height: SCREEN_SIZE,
          pointerEvents: 'none',
        }}
      >
        {/* Lines from each selected player */}
        {playerIds.map((playerId) => {
          const fromPos = fromPositions.get(playerId);
          if (!fromPos) return null;
          const fromScreen = gameToScreen(fromPos, mechanic.field.size, SCREEN_SIZE);
          return (
            <line
              key={playerId}
              x1={fromScreen.x}
              y1={fromScreen.y}
              x2={toScreen.x}
              y2={toScreen.y}
              stroke="#ffffff"
              strokeWidth={2}
              strokeDasharray="8,4"
              opacity={0.6}
            />
          );
        })}
        {/* Arrow head at destination */}
        <circle
          cx={toScreen.x}
          cy={toScreen.y}
          r={15}
          fill="rgba(255, 255, 255, 0.3)"
          stroke="#ffffff"
          strokeWidth={2}
        />
        {/* Player count label */}
        {playerIds.length > 1 && (
          <text
            x={toScreen.x}
            y={toScreen.y - 25}
            fill="#ffcc00"
            fontSize={12}
            textAnchor="middle"
          >
            {playerIds.length}人移動
          </text>
        )}
      </svg>
    );
  };

  // Render movement paths for selected player
  const renderMovementPaths = () => {
    if (selectedObjectType !== 'player' || !selectedObjectId) return null;

    const player = mechanic.initialPlayers.find(p => p.id === selectedObjectId);
    if (!player) return null;

    return (
      <MovementPaths
        playerId={selectedObjectId}
        timeline={mechanic.timeline}
        initialPosition={player.position}
        fieldSize={mechanic.field.size}
        screenSize={SCREEN_SIZE}
      />
    );
  };

  // Render AoE preview (when in add_aoe mode)
  const renderAoEPreview = () => {
    if (tool !== 'add_aoe' || !mousePos || showAoEDialog) return null;

    const screenPos = gameToScreen(mousePos, mechanic.field.size, SCREEN_SIZE);

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: SCREEN_SIZE,
          height: SCREEN_SIZE,
          pointerEvents: 'none',
        }}
      >
        <AoEPreview
          type={selectedAoEType}
          position={mousePos}
          screenPos={screenPos}
        />
      </svg>
    );
  };

  // Get cursor style
  const getCursor = () => {
    if (dragging) return 'grabbing';
    if (moveFromListMode.active) return 'crosshair';
    if (tool === 'move' || tool === 'add_move_event') {
      if (pendingMoveEvent) return 'crosshair';
      return 'pointer';
    }
    if (tool === 'add_aoe') return 'crosshair';
    if (tool === 'add_debuff') return 'pointer';
    if (tool === 'add_text') return 'text';
    if (tool === 'add_object') return 'crosshair';
    return 'crosshair';
  };

  // Get info text
  const getInfoText = () => {
    if (moveFromListMode.active && moveFromListMode.playerId) {
      const player = mechanic.initialPlayers.find(p => p.id === moveFromListMode.playerId);
      return `フィールドをクリックして ${player?.role || 'プレイヤー'} の移動先を指定 | Escでキャンセル`;
    }
    if (tool === 'move' || tool === 'add_move_event') {
      if (pendingMoveEvent) {
        const playerCount = pendingMoveEvent.playerIds.length;
        const playerInfo = playerCount > 1 ? `${playerCount}人選択中` : pendingMoveEvent.playerIds[0];
        return `移動先をクリック | Escでキャンセル | ${playerInfo}`;
      }
      if (selectedObjectIds.length > 1) {
        return `${selectedObjectIds.length}人選択中 - クリックで全員を移動 | Escでキャンセル`;
      }
      return '移動させるプレイヤーをクリック（Shift+クリックで複数選択） | Escでキャンセル';
    }
    if (tool === 'add_aoe') {
      const typeNames: Record<string, string> = {
        circle: '円形',
        cone: '扇形',
        line: '直線',
        donut: 'ドーナツ',
        cross: '十字',
      };
      return `フィールドをクリックしてAoEを配置 | タイプ: ${typeNames[selectedAoEType]} | Escでキャンセル`;
    }
    if (tool === 'add_debuff') {
      return 'デバフを付与するプレイヤーをクリック | Escでキャンセル';
    }
    if (tool === 'add_text') {
      return 'フィールドをクリックしてテキストを配置 | Escでキャンセル';
    }
    if (tool === 'add_object') {
      return 'フィールドをクリックしてオブジェクトを配置 | Escでキャンセル';
    }
    return `${gridSnap ? 'Grid snap: ON (0.5 units)' : 'Grid snap: OFF'} | Frame: ${currentFrame} | Ctrl+Scroll to zoom`;
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a1a',
        overflow: 'auto',
        padding: '20px',
      }}
      onWheel={handleWheel}
    >
      {/* Zoom controls */}
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setZoom(zoom - 0.1)}
          style={{
            padding: '4px 12px',
            background: '#2a2a4a',
            border: '1px solid #3a3a5a',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          -
        </button>
        <span style={{ fontSize: '12px', color: '#888', minWidth: '50px', textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(zoom + 0.1)}
          style={{
            padding: '4px 12px',
            background: '#2a2a4a',
            border: '1px solid #3a3a5a',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          +
        </button>
        <button
          onClick={() => setZoom(1)}
          style={{
            padding: '4px 12px',
            background: '#2a2a4a',
            border: '1px solid #3a3a5a',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            marginLeft: '8px',
          }}
        >
          Reset
        </button>
      </div>

      {/* Field container */}
      <div
        ref={fieldContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width: scaledSize,
          height: scaledSize,
          position: 'relative',
          cursor: getCursor(),
        }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: SCREEN_SIZE,
            height: SCREEN_SIZE,
            pointerEvents: 'none',
          }}
        >
          <Field
            type={mechanic.field.type}
            size={mechanic.field.size}
            width={mechanic.field.width}
            height={mechanic.field.height}
            screenSize={SCREEN_SIZE}
            backgroundColor={mechanic.field.backgroundColor}
            gridEnabled={mechanic.field.gridEnabled}
            backgroundImage={mechanic.field.backgroundImage}
            backgroundOpacity={mechanic.field.backgroundOpacity}
          >
            {/* AoEs (render first, below other elements) - with fade animation */}
            {activeAoEs.filter((aoe) => !isObjectHidden(aoe.id, 'aoe')).map((aoe) => (
              <AoE
                key={aoe.id}
                {...aoe}
                opacity={aoe.currentOpacity}
                fieldSize={mechanic.field.size}
                screenSize={SCREEN_SIZE}
              />
            ))}

            {/* Markers */}
            {mechanic.markers.filter((marker) => !isObjectHidden(marker.type, 'marker')).map((marker) => (
              <FieldMarker
                key={marker.type}
                type={marker.type}
                position={marker.position}
                fieldSize={mechanic.field.size}
                screenSize={SCREEN_SIZE}
              />
            ))}

            {/* Enemies */}
            {mechanic.enemies.filter((enemy) => !isObjectHidden(enemy.id, 'enemy')).map((enemy) => (
              <Enemy
                key={enemy.id}
                {...enemy}
                fieldSize={mechanic.field.size}
                screenSize={SCREEN_SIZE}
              />
            ))}

            {/* Players - using calculated positions */}
            {playersAtCurrentFrame.filter((player) => !isObjectHidden(player.id, 'player')).map((player) => (
<PlayerComponent
                key={player.id}
                {...player}
                debuffs={playerDebuffs.get(player.id) || []}
                currentFrame={currentFrame}
                fps={mechanic.fps}
                fieldSize={mechanic.field.size}
                screenSize={SCREEN_SIZE}
              />
            ))}

            {/* Text Annotations */}
            {activeAnnotations.filter((annotation) => !isObjectHidden(annotation.id, 'text')).map((annotation) => {
              const screenPos = gameToScreen(annotation.position, mechanic.field.size, SCREEN_SIZE);
              const textAnchor = annotation.align === 'left' ? 'start' : annotation.align === 'right' ? 'end' : 'middle';
              const isSelected = selectedObjectId === annotation.id && selectedObjectType === 'text';

              return (
                <svg
                  key={annotation.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: SCREEN_SIZE,
                    height: SCREEN_SIZE,
                    pointerEvents: 'none',
                    overflow: 'visible',
                  }}
                >
                  {annotation.backgroundColor && (
                    <rect
                      x={screenPos.x - (annotation.align === 'center' ? annotation.text.length * annotation.fontSize * 0.3 : annotation.align === 'right' ? annotation.text.length * annotation.fontSize * 0.6 : 0)}
                      y={screenPos.y - annotation.fontSize * 0.8}
                      width={annotation.text.length * annotation.fontSize * 0.6 + 8}
                      height={annotation.fontSize + 8}
                      fill={annotation.backgroundColor}
                      rx={4}
                      opacity={0.8}
                    />
                  )}
                  <text
                    x={screenPos.x}
                    y={screenPos.y}
                    fontSize={annotation.fontSize}
                    fill={annotation.color}
                    textAnchor={textAnchor}
                    dominantBaseline="middle"
                    style={{
                      textShadow: '0 0 4px rgba(0,0,0,0.8)',
                      fontWeight: 'bold',
                    }}
                  >
                    {annotation.text}
                  </text>
                  {isSelected && (
                    <rect
                      x={screenPos.x - 20}
                      y={screenPos.y - 15}
                      width={40}
                      height={30}
                      fill="none"
                      stroke="#00ffff"
                      strokeWidth={2}
                      strokeDasharray="4,2"
                    />
                  )}
                </svg>
              );
            })}

            {/* Gimmick Objects */}
            {activeObjects.filter((obj) => !isObjectHidden(obj.id, 'object')).map((obj) => {
              const screenPos = gameToScreen(obj.position, mechanic.field.size, SCREEN_SIZE);
              // Ensure minimum visible size (at least 20 pixels)
              const pixelSize = Math.max(20, (obj.size / mechanic.field.size) * SCREEN_SIZE);
              const isSelected = selectedObjectId === obj.id && selectedObjectType === 'object';
              const strokeColor = obj.color === '#000000' ? '#ffffff' : '#000000';

              const renderShape = () => {
                switch (obj.shape) {
                  case 'circle':
                    return (
                      <circle
                        cx={screenPos.x}
                        cy={screenPos.y}
                        r={pixelSize / 2}
                        fill={obj.color}
                        stroke={strokeColor}
                        strokeWidth={2}
                        opacity={obj.currentOpacity}
                      />
                    );
                  case 'square':
                    return (
                      <rect
                        x={screenPos.x - pixelSize / 2}
                        y={screenPos.y - pixelSize / 2}
                        width={pixelSize}
                        height={pixelSize}
                        fill={obj.color}
                        stroke={strokeColor}
                        strokeWidth={2}
                        opacity={obj.currentOpacity}
                      />
                    );
                  case 'triangle': {
                    const triPoints = [
                      `${screenPos.x},${screenPos.y - pixelSize / 2}`,
                      `${screenPos.x + pixelSize / 2},${screenPos.y + pixelSize / 2}`,
                      `${screenPos.x - pixelSize / 2},${screenPos.y + pixelSize / 2}`,
                    ].join(' ');
                    return (
                      <polygon
                        points={triPoints}
                        fill={obj.color}
                        stroke={strokeColor}
                        strokeWidth={2}
                        opacity={obj.currentOpacity}
                      />
                    );
                  }
                  case 'diamond': {
                    const diamondPoints = [
                      `${screenPos.x},${screenPos.y - pixelSize / 2}`,
                      `${screenPos.x + pixelSize / 2},${screenPos.y}`,
                      `${screenPos.x},${screenPos.y + pixelSize / 2}`,
                      `${screenPos.x - pixelSize / 2},${screenPos.y}`,
                    ].join(' ');
                    return (
                      <polygon
                        points={diamondPoints}
                        fill={obj.color}
                        stroke={strokeColor}
                        strokeWidth={2}
                        opacity={obj.currentOpacity}
                      />
                    );
                  }
                  case 'none':
                    return null;
                  default:
                    return null;
                }
              };

              return (
                <svg
                  key={obj.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: SCREEN_SIZE,
                    height: SCREEN_SIZE,
                    pointerEvents: 'none',
                    overflow: 'visible',
                  }}
                >
                  {renderShape()}
                  {/* 画像または絵文字アイコンを表示 */}
                  {(obj as any).imageUrl ? (
                    <image
                      href={(obj as any).imageUrl}
                      x={screenPos.x - pixelSize * 0.3}
                      y={screenPos.y - pixelSize * 0.3}
                      width={pixelSize * 0.6}
                      height={pixelSize * 0.6}
                      preserveAspectRatio="xMidYMid meet"
                      opacity={(obj as any).currentOpacity ?? obj.opacity ?? 1}
                    />
                  ) : obj.icon && (
                    <text
                      x={screenPos.x}
                      y={screenPos.y}
                      fontSize={pixelSize * 0.6}
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                    >
                      {obj.icon}
                    </text>
                  )}
                  {isSelected && (
                    <circle
                      cx={screenPos.x}
                      cy={screenPos.y}
                      r={pixelSize / 2 + 4}
                      fill="none"
                      stroke="#00ffff"
                      strokeWidth={3}
                    />
                  )}
                </svg>
              );
            })}

            {/* Movement Paths (when player is selected) */}
            {renderMovementPaths()}

            {/* Selection Ring */}
            {renderSelectionRings()}

            {/* Move Preview */}
            {renderMovePreview()}

            {/* AoE Preview */}
            {renderAoEPreview()}
          </Field>

          {/* Cast Bars */}
          {activeCasts.map((cast) => {
            const enemy = mechanic.enemies.find((e) => e.id === cast.casterId);
            return (
              <CastBar
                key={cast.id}
                skillName={cast.skillName}
                progress={cast.progress}
                casterName={enemy?.name}
              />
            );
          })}
        </div>
      </div>

      {/* Info bar */}
      <div style={{ marginTop: '12px', fontSize: '11px', color: moveFromListMode.active ? '#2c9c3c' : (tool === 'move' || tool === 'add_move_event') ? '#ffcc00' : tool === 'add_aoe' ? '#ff6600' : tool === 'add_debuff' ? '#ff00ff' : tool === 'add_text' ? '#00aaff' : tool === 'add_object' ? '#ffaa00' : '#666' }}>
        {getInfoText()}
      </div>

      {/* Move Event Dialog */}
      {showMoveDialog && pendingMoveEvent && pendingToPosition && (
        <MoveEventDialog
          isOpen={showMoveDialog}
          playerIds={pendingMoveEvent.playerIds}
          fromPositions={pendingMoveEvent.fromPositions}
          toPosition={pendingToPosition}
          currentFrame={currentFrame}
          fps={mechanic.fps}
          onConfirm={handleMoveEventConfirm}
          onCancel={handleMoveEventCancel}
        />
      )}

      {/* AoE Dialog */}
      {showAoEDialog && pendingAoEPosition && (
        <AoEDialog
          key={`${selectedAoEType}-${currentFrame}`}
          isOpen={showAoEDialog}
          position={pendingAoEPosition}
          type={selectedAoEType}
          currentFrame={currentFrame}
          fps={mechanic.fps}
          onConfirm={handleAoEDialogConfirm}
          onCancel={handleAoEDialogCancel}
        />
      )}

      {/* Debuff Dialog */}
      {showDebuffDialog && pendingDebuffTargetId && (
        <DebuffDialog
          isOpen={showDebuffDialog}
          targetPlayerId={pendingDebuffTargetId}
          targetPlayerRole={mechanic.initialPlayers.find(p => p.id === pendingDebuffTargetId)?.role}
          currentFrame={currentFrame}
          fps={mechanic.fps}
          onConfirm={handleDebuffDialogConfirm}
          onCancel={handleDebuffDialogCancel}
        />
      )}

      {/* Text Annotation Dialog */}
      {showTextDialog && pendingTextPosition && (
        <TextAnnotationDialog
          isOpen={showTextDialog}
          position={pendingTextPosition}
          currentFrame={currentFrame}
          fps={mechanic.fps}
          onConfirm={handleTextDialogConfirm}
          onCancel={handleTextDialogCancel}
        />
      )}

      {/* Object Dialog */}
      {showObjectDialog && pendingObjectPosition && (
        <ObjectDialog
          key={currentFrame}
          isOpen={showObjectDialog}
          position={pendingObjectPosition}
          currentFrame={currentFrame}
          fps={mechanic.fps}
          onConfirm={handleObjectDialogConfirm}
          onCancel={handleObjectDialogCancel}
        />
      )}

      {/* Player Selection Dialog */}
      <PlayerSelectionDialog
        isOpen={showPlayerSelectionDialog}
        players={overlappingPlayers}
        currentPositions={overlappingPlayerPositions}
        onSelect={handlePlayerSelection}
        onCancel={handlePlayerSelectionCancel}
      />
    </div>
  );
}
