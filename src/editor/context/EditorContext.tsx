import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { MechanicData, Player, Enemy, FieldMarker, AoE, TimelineEvent, Position, MoveEvent, AoEType, TextAnnotation, GimmickObject } from '../../data/types';
import { editorReducer, createInitialState, type EditorState, type EditorAction, type Tool, type SelectedObjectType, type PendingMoveEvent, type PendingAoE, type AoESettings, type DebuffSettings, type TextSettings, type ObjectSettings } from './editorReducer';

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  // Convenience methods
  setMechanic: (mechanic: MechanicData) => void;
  selectObject: (id: string | null, objectType: SelectedObjectType) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  addPlayer: (player: Player) => void;
  deletePlayer: (id: string) => void;
  updateEnemy: (id: string, updates: Partial<Enemy>) => void;
  addEnemy: (enemy: Enemy) => void;
  deleteEnemy: (id: string) => void;
  updateMarker: (type: FieldMarker['type'], updates: Partial<FieldMarker>) => void;
  addMarker: (marker: FieldMarker) => void;
  deleteMarker: (type: FieldMarker['type']) => void;
  addAoE: (aoe: AoE) => void;
  updateAoE: (id: string, updates: Partial<AoE>) => void;
  deleteAoE: (id: string) => void;
  addTimelineEvent: (event: TimelineEvent) => void;
  updateTimelineEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  deleteTimelineEvent: (id: string) => void;
  setCurrentFrame: (frame: number) => void;
  togglePlay: () => void;
  setTool: (tool: Tool) => void;
  setZoom: (zoom: number) => void;
  setGridSnap: (snap: boolean) => void;
  undo: () => void;
  redo: () => void;
  updateField: (updates: Partial<MechanicData['field']>) => void;
  updateMechanicMeta: (updates: Partial<Pick<MechanicData, 'name' | 'description' | 'durationFrames' | 'fps'>>) => void;
  // Multi-select methods
  toggleMultiSelect: (id: string, objectType: SelectedObjectType) => void;
  setMultiSelect: (ids: string[]) => void;
  clearMultiSelect: () => void;
  selectAllPlayers: () => void;
  // Move event methods
  startMoveEvent: (playerIds: string[], fromPositions: Map<string, Position>) => void;
  completeMoveEvent: (toPosition: Position, startFrame: number, duration: number, easing: MoveEvent['easing']) => void;
  cancelMoveEvent: () => void;
  // AoE placement methods
  setAoEType: (type: AoEType) => void;
  startAoEPlacement: (position: Position) => void;
  completeAoEPlacement: (settings: AoESettings) => void;
  cancelAoEPlacement: () => void;
  // Debuff methods
  startDebuffAdd: (targetPlayerId: string) => void;
  completeDebuffAdd: (settings: DebuffSettings) => void;
  cancelDebuffAdd: () => void;
  // Text annotation methods
  startTextPlacement: (position: Position) => void;
  completeTextPlacement: (settings: TextSettings) => void;
  cancelTextPlacement: () => void;
  updateTextAnnotation: (id: string, updates: Partial<TextAnnotation>) => void;
  deleteTextAnnotation: (id: string) => void;
  // Object methods
  startObjectPlacement: (position: Position) => void;
  completeObjectPlacement: (settings: ObjectSettings) => void;
  cancelObjectPlacement: () => void;
  updateObject: (id: string, updates: Partial<GimmickObject>) => void;
  deleteObject: (id: string) => void;
  // Selection actions
  deleteSelectedObject: () => void;
  copySelectedObject: () => void;
  // Computed values
  canUndo: boolean;
  canRedo: boolean;
  getAoEsAtFrame: (frame: number) => AoE[];
}

const EditorContext = createContext<EditorContextValue | null>(null);

const defaultMechanic: MechanicData = {
  id: 'new-mechanic',
  name: 'New Mechanic',
  description: '',
  durationFrames: 300,
  fps: 30,
  field: {
    type: 'circle',
    size: 40,
    backgroundColor: '#1a1a3e',
    gridEnabled: true,
  },
  markers: [],
  initialPlayers: [],
  enemies: [],
  timeline: [],
};

interface EditorProviderProps {
  children: React.ReactNode;
  initialMechanic?: MechanicData;
}

export function EditorProvider({ children, initialMechanic }: EditorProviderProps) {
  const [state, dispatch] = useReducer(
    editorReducer,
    initialMechanic || defaultMechanic,
    createInitialState
  );

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Playback animation loop
  useEffect(() => {
    if (state.isPlaying) {
      const animate = (time: number) => {
        if (lastTimeRef.current === 0) {
          lastTimeRef.current = time;
        }
        const delta = time - lastTimeRef.current;
        const frameTime = 1000 / state.mechanic.fps;

        if (delta >= frameTime) {
          const framesToAdvance = Math.floor(delta / frameTime);
          const newFrame = state.currentFrame + framesToAdvance;

          if (newFrame >= state.mechanic.durationFrames) {
            dispatch({ type: 'SET_CURRENT_FRAME', payload: 0 });
            dispatch({ type: 'TOGGLE_PLAY' });
          } else {
            dispatch({ type: 'SET_CURRENT_FRAME', payload: newFrame });
          }
          lastTimeRef.current = time - (delta % frameTime);
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      lastTimeRef.current = 0;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isPlaying, state.currentFrame, state.mechanic.fps, state.mechanic.durationFrames]);

  // Convenience methods
  const setMechanic = useCallback((mechanic: MechanicData) => {
    dispatch({ type: 'SET_MECHANIC', payload: mechanic });
  }, []);

  const selectObject = useCallback((id: string | null, objectType: SelectedObjectType) => {
    dispatch({ type: 'SELECT_OBJECT', payload: { id, objectType } });
  }, []);

  const updatePlayer = useCallback((id: string, updates: Partial<Player>) => {
    dispatch({ type: 'UPDATE_PLAYER', payload: { id, updates } });
  }, []);

  const addPlayer = useCallback((player: Player) => {
    dispatch({ type: 'ADD_PLAYER', payload: player });
  }, []);

  const deletePlayer = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PLAYER', payload: id });
  }, []);

  const updateEnemy = useCallback((id: string, updates: Partial<Enemy>) => {
    dispatch({ type: 'UPDATE_ENEMY', payload: { id, updates } });
  }, []);

  const addEnemy = useCallback((enemy: Enemy) => {
    dispatch({ type: 'ADD_ENEMY', payload: enemy });
  }, []);

  const deleteEnemy = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ENEMY', payload: id });
  }, []);

  const updateMarker = useCallback((type: FieldMarker['type'], updates: Partial<FieldMarker>) => {
    dispatch({ type: 'UPDATE_MARKER', payload: { type, updates } });
  }, []);

  const addMarker = useCallback((marker: FieldMarker) => {
    dispatch({ type: 'ADD_MARKER', payload: marker });
  }, []);

  const deleteMarker = useCallback((type: FieldMarker['type']) => {
    dispatch({ type: 'DELETE_MARKER', payload: type });
  }, []);

  const addAoE = useCallback((aoe: AoE) => {
    dispatch({ type: 'ADD_AOE', payload: aoe });
  }, []);

  const updateAoE = useCallback((id: string, updates: Partial<AoE>) => {
    dispatch({ type: 'UPDATE_AOE', payload: { id, updates } });
  }, []);

  const deleteAoE = useCallback((id: string) => {
    dispatch({ type: 'DELETE_AOE', payload: id });
  }, []);

  const addTimelineEvent = useCallback((event: TimelineEvent) => {
    dispatch({ type: 'ADD_TIMELINE_EVENT', payload: event });
  }, []);

  const updateTimelineEvent = useCallback((id: string, updates: Partial<TimelineEvent>) => {
    dispatch({ type: 'UPDATE_TIMELINE_EVENT', payload: { id, updates } });
  }, []);

  const deleteTimelineEvent = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TIMELINE_EVENT', payload: id });
  }, []);

  const setCurrentFrame = useCallback((frame: number) => {
    dispatch({ type: 'SET_CURRENT_FRAME', payload: frame });
  }, []);

  const togglePlay = useCallback(() => {
    dispatch({ type: 'TOGGLE_PLAY' });
  }, []);

  const setTool = useCallback((tool: Tool) => {
    dispatch({ type: 'SET_TOOL', payload: tool });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  const setGridSnap = useCallback((snap: boolean) => {
    dispatch({ type: 'SET_GRID_SNAP', payload: snap });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const updateField = useCallback((updates: Partial<MechanicData['field']>) => {
    dispatch({ type: 'UPDATE_FIELD', payload: updates });
  }, []);

  const updateMechanicMeta = useCallback((updates: Partial<Pick<MechanicData, 'name' | 'description' | 'durationFrames' | 'fps'>>) => {
    dispatch({ type: 'UPDATE_MECHANIC_META', payload: updates });
  }, []);

  const toggleMultiSelect = useCallback((id: string, objectType: SelectedObjectType) => {
    dispatch({ type: 'TOGGLE_MULTI_SELECT', payload: { id, objectType } });
  }, []);

  const setMultiSelect = useCallback((ids: string[]) => {
    dispatch({ type: 'SET_MULTI_SELECT', payload: { ids } });
  }, []);

  const clearMultiSelect = useCallback(() => {
    dispatch({ type: 'CLEAR_MULTI_SELECT' });
  }, []);

  const selectAllPlayers = useCallback(() => {
    const playerIds = state.mechanic.initialPlayers.map(p => p.id);
    if (playerIds.length > 0) {
      dispatch({ type: 'SET_MULTI_SELECT', payload: { ids: playerIds, objectType: 'player' } });
    }
  }, [state.mechanic.initialPlayers]);

  const startMoveEvent = useCallback((playerIds: string[], fromPositions: Map<string, Position>) => {
    dispatch({ type: 'START_MOVE_EVENT', payload: { playerIds, fromPositions } });
  }, []);

  const completeMoveEvent = useCallback((toPosition: Position, startFrame: number, duration: number, easing: MoveEvent['easing']) => {
    dispatch({ type: 'COMPLETE_MOVE_EVENT', payload: { toPosition, startFrame, duration, easing } });
  }, []);

  const cancelMoveEvent = useCallback(() => {
    dispatch({ type: 'CANCEL_MOVE_EVENT' });
  }, []);

  const setAoEType = useCallback((type: AoEType) => {
    dispatch({ type: 'SET_AOE_TYPE', payload: type });
  }, []);

  const startAoEPlacement = useCallback((position: Position) => {
    dispatch({ type: 'START_AOE_PLACEMENT', payload: { position } });
  }, []);

  const completeAoEPlacement = useCallback((settings: AoESettings) => {
    dispatch({ type: 'COMPLETE_AOE_PLACEMENT', payload: settings });
  }, []);

  const cancelAoEPlacement = useCallback(() => {
    dispatch({ type: 'CANCEL_AOE_PLACEMENT' });
  }, []);

  const startDebuffAdd = useCallback((targetPlayerId: string) => {
    dispatch({ type: 'START_DEBUFF_ADD', payload: { targetPlayerId } });
  }, []);

  const completeDebuffAdd = useCallback((settings: DebuffSettings) => {
    dispatch({ type: 'COMPLETE_DEBUFF_ADD', payload: settings });
  }, []);

  const cancelDebuffAdd = useCallback(() => {
    dispatch({ type: 'CANCEL_DEBUFF_ADD' });
  }, []);

  const startTextPlacement = useCallback((position: Position) => {
    dispatch({ type: 'START_TEXT_PLACEMENT', payload: { position } });
  }, []);

  const completeTextPlacement = useCallback((settings: TextSettings) => {
    dispatch({ type: 'COMPLETE_TEXT_PLACEMENT', payload: settings });
  }, []);

  const cancelTextPlacement = useCallback(() => {
    dispatch({ type: 'CANCEL_TEXT_PLACEMENT' });
  }, []);

  const updateTextAnnotation = useCallback((id: string, updates: Partial<TextAnnotation>) => {
    dispatch({ type: 'UPDATE_TEXT_ANNOTATION', payload: { id, updates } });
  }, []);

  const deleteTextAnnotation = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TEXT_ANNOTATION', payload: id });
  }, []);

  const startObjectPlacement = useCallback((position: Position) => {
    dispatch({ type: 'START_OBJECT_PLACEMENT', payload: { position } });
  }, []);

  const completeObjectPlacement = useCallback((settings: ObjectSettings) => {
    dispatch({ type: 'COMPLETE_OBJECT_PLACEMENT', payload: settings });
  }, []);

  const cancelObjectPlacement = useCallback(() => {
    dispatch({ type: 'CANCEL_OBJECT_PLACEMENT' });
  }, []);

  const updateObject = useCallback((id: string, updates: Partial<GimmickObject>) => {
    dispatch({ type: 'UPDATE_OBJECT', payload: { id, updates } });
  }, []);

  const deleteObject = useCallback((id: string) => {
    dispatch({ type: 'DELETE_OBJECT', payload: id });
  }, []);

  // Delete the currently selected object
  const deleteSelectedObject = useCallback(() => {
    const { selectedObjectId, selectedObjectType } = state;
    if (!selectedObjectId || !selectedObjectType) return;

    switch (selectedObjectType) {
      case 'player':
        dispatch({ type: 'DELETE_PLAYER', payload: selectedObjectId });
        break;
      case 'enemy':
        dispatch({ type: 'DELETE_ENEMY', payload: selectedObjectId });
        break;
      case 'marker':
        dispatch({ type: 'DELETE_MARKER', payload: selectedObjectId as FieldMarker['type'] });
        break;
      case 'aoe':
        dispatch({ type: 'DELETE_AOE', payload: selectedObjectId });
        break;
      case 'text':
        dispatch({ type: 'DELETE_TEXT_ANNOTATION', payload: selectedObjectId });
        break;
      case 'object':
        dispatch({ type: 'DELETE_OBJECT', payload: selectedObjectId });
        break;
    }
    dispatch({ type: 'SELECT_OBJECT', payload: { id: null, objectType: null } });
  }, [state.selectedObjectId, state.selectedObjectType]);

  // Copy the currently selected object
  const copySelectedObject = useCallback(() => {
    const { selectedObjectId, selectedObjectType, mechanic } = state;
    if (!selectedObjectId || !selectedObjectType) return;

    const offset = 2; // Position offset for the copy

    switch (selectedObjectType) {
      case 'player': {
        // Players cannot be duplicated (unique roles)
        return;
      }
      case 'enemy': {
        const enemy = mechanic.enemies.find(e => e.id === selectedObjectId);
        if (enemy) {
          const newEnemy: Enemy = {
            ...enemy,
            id: `enemy_${Date.now()}`,
            position: { x: enemy.position.x + offset, y: enemy.position.y + offset },
          };
          dispatch({ type: 'ADD_ENEMY', payload: newEnemy });
          dispatch({ type: 'SELECT_OBJECT', payload: { id: newEnemy.id, objectType: 'enemy' } });
        }
        break;
      }
      case 'marker': {
        // Markers cannot be duplicated (unique types A-D, 1-4)
        return;
      }
      case 'aoe': {
        // Find the aoe_show event containing this AoE
        const showEvent = mechanic.timeline.find(
          e => e.type === 'aoe_show' && e.aoe.id === selectedObjectId
        );
        if (showEvent && showEvent.type === 'aoe_show') {
          const newAoeId = `aoe_${Date.now()}`;
          const newAoe: AoE = {
            ...showEvent.aoe,
            id: newAoeId,
            position: {
              x: showEvent.aoe.position.x + offset,
              y: showEvent.aoe.position.y + offset
            },
          };
          // Add show event
          dispatch({
            type: 'ADD_TIMELINE_EVENT',
            payload: {
              id: `event_${Date.now()}`,
              type: 'aoe_show',
              frame: showEvent.frame,
              aoe: newAoe,
            },
          });
          // Find and copy hide event if exists
          const hideEvent = mechanic.timeline.find(
            e => e.type === 'aoe_hide' && e.aoeId === selectedObjectId
          );
          if (hideEvent && hideEvent.type === 'aoe_hide') {
            dispatch({
              type: 'ADD_TIMELINE_EVENT',
              payload: {
                id: `event_${Date.now() + 1}`,
                type: 'aoe_hide',
                frame: hideEvent.frame,
                aoeId: newAoeId,
              },
            });
          }
          dispatch({ type: 'SELECT_OBJECT', payload: { id: newAoeId, objectType: 'aoe' } });
        }
        break;
      }
    }
  }, [state.selectedObjectId, state.selectedObjectType, state.mechanic]);

  // Get AoEs visible at a specific frame
  const getAoEsAtFrame = useCallback((frame: number): AoE[] => {
    const visibleAoEs: Map<string, AoE> = new Map();

    const sortedEvents = [...state.mechanic.timeline].sort((a, b) => a.frame - b.frame);

    for (const event of sortedEvents) {
      if (event.frame > frame) break;

      if (event.type === 'aoe_show') {
        visibleAoEs.set(event.aoe.id, event.aoe);
      } else if (event.type === 'aoe_hide') {
        visibleAoEs.delete(event.aoeId);
      }
    }

    return Array.from(visibleAoEs.values());
  }, [state.mechanic.timeline]);

  const value: EditorContextValue = {
    state,
    dispatch,
    setMechanic,
    selectObject,
    updatePlayer,
    addPlayer,
    deletePlayer,
    updateEnemy,
    addEnemy,
    deleteEnemy,
    updateMarker,
    addMarker,
    deleteMarker,
    addAoE,
    updateAoE,
    deleteAoE,
    addTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    setCurrentFrame,
    togglePlay,
    setTool,
    setZoom,
    setGridSnap,
    undo,
    redo,
    updateField,
    updateMechanicMeta,
    toggleMultiSelect,
    setMultiSelect,
    clearMultiSelect,
    selectAllPlayers,
    startMoveEvent,
    completeMoveEvent,
    cancelMoveEvent,
    setAoEType,
    startAoEPlacement,
    completeAoEPlacement,
    cancelAoEPlacement,
    startDebuffAdd,
    completeDebuffAdd,
    cancelDebuffAdd,
    startTextPlacement,
    completeTextPlacement,
    cancelTextPlacement,
    updateTextAnnotation,
    deleteTextAnnotation,
    startObjectPlacement,
    completeObjectPlacement,
    cancelObjectPlacement,
    updateObject,
    deleteObject,
    deleteSelectedObject,
    copySelectedObject,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    getAoEsAtFrame,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
