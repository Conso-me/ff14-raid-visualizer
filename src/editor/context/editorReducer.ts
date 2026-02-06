import type { MechanicData, Player, Enemy, FieldMarker, AoE, TimelineEvent, Position, MoveEvent, AoEType, AoESourceType, AoETrackingMode, AoEShowEvent, AoEHideEvent, DebuffAddEvent, DebuffRemoveEvent, TextAnnotation, GimmickObject, TextShowEvent, TextHideEvent, ObjectShowEvent, ObjectHideEvent } from '../../data/types';

export type Tool = 'select' | 'add_player' | 'add_marker' | 'add_aoe' | 'add_move_event' | 'add_debuff' | 'add_text' | 'add_object';
export type SelectedObjectType = 'player' | 'enemy' | 'marker' | 'aoe' | 'text' | 'object' | 'cast' | null;

export interface PendingMoveEvent {
  playerIds: string[];
  fromPositions: Map<string, Position>;
}

export interface PendingAoE {
  position: Position;
}

export interface PendingDebuff {
  targetPlayerId: string; // 'all' for all players
}

export interface DebuffSettings {
  targetId: string;
  debuff: {
    id: string;
    name: string;
    color: string;
  };
  startFrame: number;
  durationSeconds: number;
}

export interface PendingText {
  position: Position;
}

export interface PendingObject {
  position: Position;
}

export interface TextSettings {
  annotation: TextAnnotation;
  startFrame: number;
  endFrame: number;
}

export interface ObjectSettings {
  object: GimmickObject;
  startFrame: number;
  endFrame?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

export interface AoESettings {
  type: AoEType;
  position: Position;
  // Type-specific parameters
  radius?: number;
  innerRadius?: number;
  outerRadius?: number;
  angle?: number;
  direction?: number;
  length?: number;
  width?: number;
  // Common parameters
  color: string;
  opacity: number;
  // Timing
  startFrame: number;
  duration: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  // ===== 新規: 起点・追従設定 =====
  sourceType: AoESourceType;
  sourceId?: string;
  sourceDebuffId?: string;
  trackingMode: AoETrackingMode;
  targetPlayerId?: string;
  placementDelay: number;
  offsetFromSource?: Position;
  autoDirection?: boolean;
}

export interface MoveFromListMode {
  active: boolean;
  playerId: string | null;
}

export interface EditorState {
  mechanic: MechanicData;
  selectedObjectId: string | null;
  selectedObjectType: SelectedObjectType;
  selectedObjectIds: string[]; // Multiple selection support
  currentFrame: number;
  isPlaying: boolean;
  zoom: number;
  tool: Tool;
  gridSnap: boolean;
  history: MechanicData[];
  historyIndex: number;
  pendingMoveEvent: PendingMoveEvent | null;
  pendingAoE: PendingAoE | null;
  selectedAoEType: AoEType;
  pendingDebuff: PendingDebuff | null;
  pendingText: PendingText | null;
  pendingObject: PendingObject | null;
  // Mode for adding move from object list
  moveFromListMode: MoveFromListMode;
  // Hidden object IDs for editor preview (composite key: `${objectType}:${id}`)
  hiddenObjectIds: string[];
}

export type EditorAction =
  | { type: 'SET_MECHANIC'; payload: MechanicData }
  | { type: 'SELECT_OBJECT'; payload: { id: string | null; objectType: SelectedObjectType } }
  | { type: 'TOGGLE_MULTI_SELECT'; payload: { id: string; objectType: SelectedObjectType } }
  | { type: 'SET_MULTI_SELECT'; payload: { ids: string[]; objectType: SelectedObjectType } }
  | { type: 'CLEAR_MULTI_SELECT' }
  | { type: 'UPDATE_PLAYER'; payload: { id: string; updates: Partial<Player> } }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'DELETE_PLAYER'; payload: string }
  | { type: 'UPDATE_ENEMY'; payload: { id: string; updates: Partial<Enemy> } }
  | { type: 'ADD_ENEMY'; payload: Enemy }
  | { type: 'DELETE_ENEMY'; payload: string }
  | { type: 'UPDATE_MARKER'; payload: { type: FieldMarker['type']; updates: Partial<FieldMarker> } }
  | { type: 'ADD_MARKER'; payload: FieldMarker }
  | { type: 'DELETE_MARKER'; payload: FieldMarker['type'] }
  | { type: 'ADD_AOE'; payload: AoE }
  | { type: 'UPDATE_AOE'; payload: { id: string; updates: Partial<AoE> } }
  | { type: 'DELETE_AOE'; payload: string }
  | { type: 'ADD_TIMELINE_EVENT'; payload: TimelineEvent }
  | { type: 'UPDATE_TIMELINE_EVENT'; payload: { id: string; updates: Partial<TimelineEvent> } }
  | { type: 'DELETE_TIMELINE_EVENT'; payload: string }
  | { type: 'SET_CURRENT_FRAME'; payload: number }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_TOOL'; payload: Tool }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_GRID_SNAP'; payload: boolean }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'UPDATE_FIELD'; payload: Partial<MechanicData['field']> }
  | { type: 'UPDATE_MECHANIC_META'; payload: Partial<Pick<MechanicData, 'name' | 'description' | 'durationFrames' | 'fps'>> }
  | { type: 'START_MOVE_EVENT'; payload: PendingMoveEvent }
  | { type: 'COMPLETE_MOVE_EVENT'; payload: { toPosition: Position; startFrame: number; duration: number; easing: MoveEvent['easing'] } }
  | { type: 'CANCEL_MOVE_EVENT' }
  | { type: 'SET_AOE_TYPE'; payload: AoEType }
  | { type: 'START_AOE_PLACEMENT'; payload: { position: Position } }
  | { type: 'COMPLETE_AOE_PLACEMENT'; payload: AoESettings }
  | { type: 'CANCEL_AOE_PLACEMENT' }
  | { type: 'START_DEBUFF_ADD'; payload: { targetPlayerId: string } }
  | { type: 'COMPLETE_DEBUFF_ADD'; payload: DebuffSettings }
  | { type: 'CANCEL_DEBUFF_ADD' }
  // Text annotation actions
  | { type: 'START_TEXT_PLACEMENT'; payload: { position: Position } }
  | { type: 'COMPLETE_TEXT_PLACEMENT'; payload: TextSettings }
  | { type: 'CANCEL_TEXT_PLACEMENT' }
  | { type: 'UPDATE_TEXT_ANNOTATION'; payload: { id: string; updates: Partial<TextAnnotation> } }
  | { type: 'DELETE_TEXT_ANNOTATION'; payload: string }
  // Object actions
  | { type: 'START_OBJECT_PLACEMENT'; payload: { position: Position } }
  | { type: 'COMPLETE_OBJECT_PLACEMENT'; payload: ObjectSettings }
  | { type: 'CANCEL_OBJECT_PLACEMENT' }
  | { type: 'UPDATE_OBJECT'; payload: { id: string; updates: Partial<GimmickObject> } }
  | { type: 'DELETE_OBJECT'; payload: string }
  | { type: 'UPDATE_PLAYERS_ORDER'; payload: Player[] }
  // Move from list mode
  | { type: 'START_MOVE_FROM_LIST'; payload: { playerId: string } }
  | { type: 'CANCEL_MOVE_FROM_LIST' }
  // Direct position movement (arrow keys)
  | { type: 'MOVE_PLAYER_POSITION'; payload: { playerId: string; dx: number; dy: number; frame: number } }
  // Relocate player (move initial position + shift all move events by the same delta)
  | { type: 'RELOCATE_PLAYER'; payload: { id: string; newPosition: Position } }
  // Visibility toggle (editor UI only)
  | { type: 'TOGGLE_VISIBILITY'; payload: { id: string; objectType: string } };

function pushHistory(state: EditorState): EditorState {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(state.mechanic)));
  return {
    ...state,
    history: newHistory.slice(-50), // Keep last 50 states
    historyIndex: newHistory.length - 1,
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_MECHANIC': {
      return {
        ...state,
        mechanic: action.payload,
        history: [action.payload],
        historyIndex: 0,
        selectedObjectId: null,
        selectedObjectType: null,
        selectedObjectIds: [],
      };
    }

    case 'SELECT_OBJECT': {
      // Single selection clears multi-select
      return {
        ...state,
        selectedObjectId: action.payload.id,
        selectedObjectType: action.payload.objectType,
        selectedObjectIds: action.payload.id ? [action.payload.id] : [],
      };
    }

    case 'TOGGLE_MULTI_SELECT': {
      const { id, objectType } = action.payload;
      const ids = state.selectedObjectIds;
      const newIds = ids.includes(id)
        ? ids.filter(i => i !== id)
        : [...ids, id];
      return {
        ...state,
        selectedObjectIds: newIds,
        selectedObjectId: newIds.length === 1 ? newIds[0] : null,
        selectedObjectType: newIds.length > 0 ? objectType : null,
      };
    }

    case 'SET_MULTI_SELECT': {
      return {
        ...state,
        selectedObjectIds: action.payload.ids,
        selectedObjectId: action.payload.ids.length === 1 ? action.payload.ids[0] : null,
        selectedObjectType: action.payload.ids.length > 0 ? action.payload.objectType : null,
      };
    }

    case 'CLEAR_MULTI_SELECT': {
      return {
        ...state,
        selectedObjectIds: [],
        selectedObjectId: null,
        selectedObjectType: null,
      };
    }

    case 'UPDATE_PLAYER': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          initialPlayers: stateWithHistory.mechanic.initialPlayers.map((p) =>
            p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
          ),
        },
      };
    }

    case 'RELOCATE_PLAYER': {
      const { id, newPosition } = action.payload;
      const player = state.mechanic.initialPlayers.find(p => p.id === id);
      if (!player) return state;

      const dx = newPosition.x - player.position.x;
      const dy = newPosition.y - player.position.y;

      // Only shift the first move event's `from` (it corresponds to the player's initial position).
      // Subsequent move events have `from` matching the previous move's `to`, which is unchanged.
      const playerMoveEvents = state.mechanic.timeline
        .filter((e): e is MoveEvent => e.type === 'move' && e.targetId === id)
        .sort((a, b) => a.frame - b.frame);
      const firstMoveEvent = playerMoveEvents[0];

      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          initialPlayers: stateWithHistory.mechanic.initialPlayers.map(p =>
            p.id === id ? { ...p, position: newPosition } : p
          ),
          timeline: stateWithHistory.mechanic.timeline.map(e => {
            if (e.type !== 'move' || e.targetId !== id) return e;
            if (!firstMoveEvent || e.id !== firstMoveEvent.id) return e;
            const moveEvent = e as MoveEvent;
            return {
              ...moveEvent,
              from: moveEvent.from ? { x: moveEvent.from.x + dx, y: moveEvent.from.y + dy } : undefined,
            };
          }),
        },
      };
    }

    case 'ADD_PLAYER': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          initialPlayers: [...stateWithHistory.mechanic.initialPlayers, action.payload],
        },
      };
    }

    case 'DELETE_PLAYER': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          initialPlayers: stateWithHistory.mechanic.initialPlayers.filter((p) => p.id !== action.payload),
        },
        selectedObjectId: state.selectedObjectId === action.payload ? null : state.selectedObjectId,
        selectedObjectType: state.selectedObjectId === action.payload ? null : state.selectedObjectType,
      };
    }

    case 'UPDATE_PLAYERS_ORDER': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          initialPlayers: action.payload,
        },
      };
    }

    case 'UPDATE_ENEMY': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          enemies: stateWithHistory.mechanic.enemies.map((e) =>
            e.id === action.payload.id ? { ...e, ...action.payload.updates } : e
          ),
        },
      };
    }

    case 'ADD_ENEMY': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          enemies: [...stateWithHistory.mechanic.enemies, action.payload],
        },
      };
    }

    case 'DELETE_ENEMY': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          enemies: stateWithHistory.mechanic.enemies.filter((e) => e.id !== action.payload),
        },
        selectedObjectId: state.selectedObjectId === action.payload ? null : state.selectedObjectId,
        selectedObjectType: state.selectedObjectId === action.payload ? null : state.selectedObjectType,
      };
    }

    case 'UPDATE_MARKER': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          markers: stateWithHistory.mechanic.markers.map((m) =>
            m.type === action.payload.type ? { ...m, ...action.payload.updates } : m
          ),
        },
      };
    }

    case 'ADD_MARKER': {
      const stateWithHistory = pushHistory(state);
      const existing = stateWithHistory.mechanic.markers.find((m) => m.type === action.payload.type);
      if (existing) {
        return {
          ...stateWithHistory,
          mechanic: {
            ...stateWithHistory.mechanic,
            markers: stateWithHistory.mechanic.markers.map((m) =>
              m.type === action.payload.type ? action.payload : m
            ),
          },
        };
      }
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          markers: [...stateWithHistory.mechanic.markers, action.payload],
        },
      };
    }

    case 'DELETE_MARKER': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          markers: stateWithHistory.mechanic.markers.filter((m) => m.type !== action.payload),
        },
        selectedObjectId: state.selectedObjectId === action.payload ? null : state.selectedObjectId,
        selectedObjectType: state.selectedObjectId === action.payload ? null : state.selectedObjectType,
      };
    }

    case 'ADD_AOE': {
      const stateWithHistory = pushHistory(state);
      // Add AoE to timeline as aoe_show event at current frame
      const aoeShowEvent: TimelineEvent = {
        id: `aoe_show_${action.payload.id}`,
        type: 'aoe_show',
        frame: state.currentFrame,
        aoe: action.payload,
      };
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: [...stateWithHistory.mechanic.timeline, aoeShowEvent],
        },
      };
    }

    case 'UPDATE_AOE': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: stateWithHistory.mechanic.timeline.map((event) => {
            if (event.type === 'aoe_show' && event.aoe.id === action.payload.id) {
              return {
                ...event,
                aoe: { ...event.aoe, ...action.payload.updates },
              };
            }
            return event;
          }),
        },
      };
    }

    case 'DELETE_AOE': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: stateWithHistory.mechanic.timeline.filter((event) => {
            if (event.type === 'aoe_show') return event.aoe.id !== action.payload;
            if (event.type === 'aoe_hide') return event.aoeId !== action.payload;
            return true;
          }),
        },
        selectedObjectId: state.selectedObjectId === action.payload ? null : state.selectedObjectId,
        selectedObjectType: state.selectedObjectId === action.payload ? null : state.selectedObjectType,
      };
    }

    case 'ADD_TIMELINE_EVENT': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: [...stateWithHistory.mechanic.timeline, action.payload],
        },
      };
    }

    case 'UPDATE_TIMELINE_EVENT': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: stateWithHistory.mechanic.timeline.map((e) =>
            e.id === action.payload.id ? { ...e, ...action.payload.updates } as TimelineEvent : e
          ),
        },
      };
    }

    case 'DELETE_TIMELINE_EVENT': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: stateWithHistory.mechanic.timeline.filter((e) => e.id !== action.payload),
        },
      };
    }

    case 'SET_CURRENT_FRAME': {
      return {
        ...state,
        currentFrame: Math.max(0, Math.min(action.payload, state.mechanic.durationFrames - 1)),
      };
    }

    case 'TOGGLE_PLAY': {
      return {
        ...state,
        isPlaying: !state.isPlaying,
      };
    }

    case 'SET_TOOL': {
      return {
        ...state,
        tool: action.payload,
      };
    }

    case 'SET_ZOOM': {
      return {
        ...state,
        zoom: Math.max(0.25, Math.min(2, action.payload)),
      };
    }

    case 'SET_GRID_SNAP': {
      return {
        ...state,
        gridSnap: action.payload,
      };
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      return {
        ...state,
        mechanic: JSON.parse(JSON.stringify(state.history[state.historyIndex - 1])),
        historyIndex: state.historyIndex - 1,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      return {
        ...state,
        mechanic: JSON.parse(JSON.stringify(state.history[state.historyIndex + 1])),
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'UPDATE_FIELD': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          field: { ...stateWithHistory.mechanic.field, ...action.payload },
        },
      };
    }

    case 'UPDATE_MECHANIC_META': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          ...action.payload,
        },
      };
    }

    case 'START_MOVE_EVENT': {
      const { playerIds } = action.payload;
      return {
        ...state,
        pendingMoveEvent: action.payload,
        selectedObjectId: playerIds.length === 1 ? playerIds[0] : null,
        selectedObjectType: 'player',
        selectedObjectIds: playerIds,
      };
    }

    case 'COMPLETE_MOVE_EVENT': {
      if (!state.pendingMoveEvent) return state;

      const { playerIds, fromPositions } = state.pendingMoveEvent;
      const { toPosition, startFrame, duration, easing } = action.payload;

      // Create move events for all selected players
      const newEvents: MoveEvent[] = playerIds.map((playerId) => ({
        id: `move-${playerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'move' as const,
        frame: startFrame,
        targetId: playerId,
        from: fromPositions.get(playerId),
        to: toPosition,
        duration,
        easing,
      }));

      const stateWithHistory = pushHistory(state);
      const newTimeline = [...stateWithHistory.mechanic.timeline, ...newEvents].sort((a, b) => a.frame - b.frame);

      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: newTimeline,
        },
        pendingMoveEvent: null,
        tool: 'select',
        selectedObjectIds: [],
      };
    }

    case 'CANCEL_MOVE_EVENT': {
      return {
        ...state,
        pendingMoveEvent: null,
        tool: 'select',
      };
    }

    case 'SET_AOE_TYPE': {
      return {
        ...state,
        selectedAoEType: action.payload,
      };
    }

    case 'START_AOE_PLACEMENT': {
      return {
        ...state,
        pendingAoE: { position: action.payload.position },
      };
    }

    case 'COMPLETE_AOE_PLACEMENT': {
      const settings = action.payload;
      const aoeId = `aoe-${Date.now()}`;

      // Create AoE show event
      const showEvent: AoEShowEvent = {
        id: `${aoeId}-show`,
        type: 'aoe_show',
        frame: settings.startFrame,
        aoe: {
          id: aoeId,
          type: settings.type,
          position: settings.position,
          ...(settings.radius !== undefined && { radius: settings.radius }),
          ...(settings.innerRadius !== undefined && { innerRadius: settings.innerRadius }),
          ...(settings.outerRadius !== undefined && { outerRadius: settings.outerRadius }),
          ...(settings.angle !== undefined && { angle: settings.angle }),
          ...(settings.direction !== undefined && { direction: settings.direction }),
          ...(settings.length !== undefined && { length: settings.length }),
          ...(settings.width !== undefined && { width: settings.width }),
          color: settings.color,
          opacity: settings.opacity,
          // 起点・追従設定
          sourceType: settings.sourceType,
          ...(settings.sourceId !== undefined && { sourceId: settings.sourceId }),
          ...(settings.sourceDebuffId !== undefined && { sourceDebuffId: settings.sourceDebuffId }),
          trackingMode: settings.trackingMode,
          ...(settings.targetPlayerId !== undefined && { targetPlayerId: settings.targetPlayerId }),
          placementDelay: settings.placementDelay,
          ...(settings.offsetFromSource !== undefined && { offsetFromSource: settings.offsetFromSource }),
          ...(settings.autoDirection !== undefined && { autoDirection: settings.autoDirection }),
        },
        fadeInDuration: settings.fadeInDuration,
      };

      // Create AoE hide event
      const hideEvent: AoEHideEvent = {
        id: `${aoeId}-hide`,
        type: 'aoe_hide',
        frame: settings.startFrame + settings.duration,
        aoeId: aoeId,
        fadeOutDuration: settings.fadeOutDuration,
      };

      const stateWithHistory = pushHistory(state);
      const newTimeline = [...stateWithHistory.mechanic.timeline, showEvent, hideEvent]
        .sort((a, b) => a.frame - b.frame);

      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: newTimeline,
        },
        pendingAoE: null,
        tool: 'select',
        selectedObjectId: aoeId,
        selectedObjectType: 'aoe',
      };
    }

    case 'CANCEL_AOE_PLACEMENT': {
      return {
        ...state,
        pendingAoE: null,
        tool: 'select',
      };
    }

    case 'START_DEBUFF_ADD': {
      return {
        ...state,
        pendingDebuff: { targetPlayerId: action.payload.targetPlayerId },
        selectedObjectId: action.payload.targetPlayerId === 'all' ? null : action.payload.targetPlayerId,
        selectedObjectType: action.payload.targetPlayerId === 'all' ? null : 'player',
      };
    }

    case 'COMPLETE_DEBUFF_ADD': {
      const settings = action.payload;
      const targetIds = settings.targetId === 'all'
        ? state.mechanic.initialPlayers.map(p => p.id)
        : [settings.targetId];

      const newEvents: TimelineEvent[] = [];
      const durationFrames = Math.round(settings.durationSeconds * state.mechanic.fps);

      for (const targetId of targetIds) {
        const timestamp = Date.now() + Math.random();
        const debuffAddEvent: DebuffAddEvent = {
          id: `debuff-add-${targetId}-${timestamp}`,
          type: 'debuff_add',
          frame: settings.startFrame,
          targetId,
          debuff: {
            id: settings.debuff.id,
            name: settings.debuff.name,
            color: settings.debuff.color,
            duration: settings.durationSeconds,
          },
        };
        newEvents.push(debuffAddEvent);

        const debuffRemoveEvent: DebuffRemoveEvent = {
          id: `debuff-remove-${targetId}-${timestamp}`,
          type: 'debuff_remove',
          frame: settings.startFrame + durationFrames,
          targetId,
          debuffId: settings.debuff.id,
        };
        newEvents.push(debuffRemoveEvent);
      }

      const stateWithHistory = pushHistory(state);
      const newTimeline = [...stateWithHistory.mechanic.timeline, ...newEvents]
        .sort((a, b) => a.frame - b.frame);

      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: newTimeline,
        },
        pendingDebuff: null,
        tool: 'select',
      };
    }

    case 'CANCEL_DEBUFF_ADD': {
      return {
        ...state,
        pendingDebuff: null,
        tool: 'select',
      };
    }

    // Text annotation actions
    case 'START_TEXT_PLACEMENT': {
      return {
        ...state,
        pendingText: { position: action.payload.position },
      };
    }

    case 'COMPLETE_TEXT_PLACEMENT': {
      const settings = action.payload;
      const annotationId = settings.annotation.id;

      // Create text show event
      const showEvent: TextShowEvent = {
        id: `${annotationId}-show`,
        type: 'text_show',
        frame: settings.startFrame,
        annotation: settings.annotation,
      };

      // Create text hide event
      const hideEvent: TextHideEvent = {
        id: `${annotationId}-hide`,
        type: 'text_hide',
        frame: settings.endFrame,
        annotationId: annotationId,
      };

      const stateWithHistory = pushHistory(state);
      const newTimeline = [...stateWithHistory.mechanic.timeline, showEvent, hideEvent]
        .sort((a, b) => a.frame - b.frame);

      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: newTimeline,
        },
        pendingText: null,
        tool: 'select',
        selectedObjectId: annotationId,
        selectedObjectType: 'text',
      };
    }

    case 'CANCEL_TEXT_PLACEMENT': {
      return {
        ...state,
        pendingText: null,
        tool: 'select',
      };
    }

    case 'UPDATE_TEXT_ANNOTATION': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: stateWithHistory.mechanic.timeline.map((event) => {
            if (event.type === 'text_show' && event.annotation.id === action.payload.id) {
              return {
                ...event,
                annotation: { ...event.annotation, ...action.payload.updates },
              };
            }
            return event;
          }),
        },
      };
    }

    case 'DELETE_TEXT_ANNOTATION': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: stateWithHistory.mechanic.timeline.filter((event) => {
            if (event.type === 'text_show') return event.annotation.id !== action.payload;
            if (event.type === 'text_hide') return event.annotationId !== action.payload;
            return true;
          }),
        },
        selectedObjectId: state.selectedObjectId === action.payload ? null : state.selectedObjectId,
        selectedObjectType: state.selectedObjectId === action.payload ? null : state.selectedObjectType,
      };
    }

    // Object actions
    case 'START_OBJECT_PLACEMENT': {
      return {
        ...state,
        pendingObject: { position: action.payload.position },
      };
    }

    case 'COMPLETE_OBJECT_PLACEMENT': {
      const settings = action.payload;
      const objectId = settings.object.id;

      // Create object show event
      const showEvent: ObjectShowEvent = {
        id: `${objectId}-show`,
        type: 'object_show',
        frame: settings.startFrame,
        object: settings.object,
        fadeInDuration: settings.fadeInDuration,
      };

      const newEvents: TimelineEvent[] = [showEvent];

      // Create object hide event if endFrame is specified
      if (settings.endFrame !== undefined) {
        const hideEvent: ObjectHideEvent = {
          id: `${objectId}-hide`,
          type: 'object_hide',
          frame: settings.endFrame,
          objectId: objectId,
          fadeOutDuration: settings.fadeOutDuration,
        };
        newEvents.push(hideEvent);
      }

      const stateWithHistory = pushHistory(state);
      const newTimeline = [...stateWithHistory.mechanic.timeline, ...newEvents]
        .sort((a, b) => a.frame - b.frame);

      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: newTimeline,
        },
        pendingObject: null,
        tool: 'select',
        selectedObjectId: objectId,
        selectedObjectType: 'object',
      };
    }

    case 'CANCEL_OBJECT_PLACEMENT': {
      return {
        ...state,
        pendingObject: null,
        tool: 'select',
      };
    }

    case 'UPDATE_OBJECT': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: stateWithHistory.mechanic.timeline.map((event) => {
            if (event.type === 'object_show' && event.object.id === action.payload.id) {
              return {
                ...event,
                object: { ...event.object, ...action.payload.updates },
              };
            }
            return event;
          }),
        },
      };
    }

    case 'DELETE_OBJECT': {
      const stateWithHistory = pushHistory(state);
      return {
        ...stateWithHistory,
        mechanic: {
          ...stateWithHistory.mechanic,
          timeline: stateWithHistory.mechanic.timeline.filter((event) => {
            if (event.type === 'object_show') return event.object.id !== action.payload;
            if (event.type === 'object_hide') return event.objectId !== action.payload;
            return true;
          }),
        },
        selectedObjectId: state.selectedObjectId === action.payload ? null : state.selectedObjectId,
        selectedObjectType: state.selectedObjectId === action.payload ? null : state.selectedObjectType,
      };
    }

    case 'START_MOVE_FROM_LIST': {
      return {
        ...state,
        moveFromListMode: {
          active: true,
          playerId: action.payload.playerId,
        },
        selectedObjectId: action.payload.playerId,
        selectedObjectType: 'player',
        selectedObjectIds: [action.payload.playerId],
      };
    }

    case 'CANCEL_MOVE_FROM_LIST': {
      return {
        ...state,
        moveFromListMode: {
          active: false,
          playerId: null,
        },
      };
    }

    case 'MOVE_PLAYER_POSITION': {
      const { playerId, dx, dy, frame } = action.payload;
      const halfSize = state.mechanic.field.size / 2;

      // Get current position at frame
      const player = state.mechanic.initialPlayers.find(p => p.id === playerId);
      if (!player) return state;

      // Calculate current position accounting for move events
      const moveEvents = state.mechanic.timeline
        .filter((e): e is MoveEvent => e.type === 'move' && e.targetId === playerId)
        .sort((a, b) => a.frame - b.frame);

      let currentPos = player.position;
      for (const event of moveEvents) {
        if (frame >= event.frame + event.duration) {
          currentPos = event.to;
        } else if (frame >= event.frame) {
          // In the middle of a move
          const progress = (frame - event.frame) / event.duration;
          const fromPos = event.from ?? currentPos;
          currentPos = {
            x: fromPos.x + (event.to.x - fromPos.x) * progress,
            y: fromPos.y + (event.to.y - fromPos.y) * progress,
          };
          break;
        } else {
          break;
        }
      }

      const newPos = {
        x: Math.max(-halfSize, Math.min(halfSize, currentPos.x + dx)),
        y: Math.max(-halfSize, Math.min(halfSize, currentPos.y + dy)),
      };

      // Frame 0: update initial position
      if (frame === 0) {
        const stateWithHistory = pushHistory(state);
        const newPlayers = stateWithHistory.mechanic.initialPlayers.map(p =>
          p.id === playerId ? { ...p, position: newPos } : p
        );
        return {
          ...stateWithHistory,
          mechanic: { ...stateWithHistory.mechanic, initialPlayers: newPlayers },
        };
      }

      // Check for existing move event at this frame
      const existingMoveIndex = state.mechanic.timeline.findIndex(
        e => e.type === 'move' && e.targetId === playerId && e.frame === frame
      );

      const stateWithHistory = pushHistory(state);

      if (existingMoveIndex >= 0) {
        // Update existing event's 'to' position
        const newTimeline = [...stateWithHistory.mechanic.timeline];
        newTimeline[existingMoveIndex] = {
          ...newTimeline[existingMoveIndex],
          to: newPos,
        } as MoveEvent;
        return {
          ...stateWithHistory,
          mechanic: { ...stateWithHistory.mechanic, timeline: newTimeline },
        };
      } else {
        // Add new instant move event
        const newEvent: MoveEvent = {
          id: `move-${playerId}-${frame}-${Date.now()}`,
          type: 'move',
          frame,
          targetId: playerId,
          from: currentPos,
          to: newPos,
          duration: 1,
          easing: 'linear',
        };
        const newTimeline = [...stateWithHistory.mechanic.timeline, newEvent]
          .sort((a, b) => a.frame - b.frame);
        return {
          ...stateWithHistory,
          mechanic: { ...stateWithHistory.mechanic, timeline: newTimeline },
        };
      }
    }

    case 'TOGGLE_VISIBILITY': {
      const compositeKey = `${action.payload.objectType}:${action.payload.id}`;
      const hiddenObjectIds = state.hiddenObjectIds.includes(compositeKey)
        ? state.hiddenObjectIds.filter(k => k !== compositeKey)
        : [...state.hiddenObjectIds, compositeKey];
      return {
        ...state,
        hiddenObjectIds,
      };
    }

    default:
      return state;
  }
}

export function createInitialState(mechanic: MechanicData): EditorState {
  return {
    mechanic,
    selectedObjectId: null,
    selectedObjectType: null,
    selectedObjectIds: [],
    currentFrame: 0,
    isPlaying: false,
    zoom: 1,
    tool: 'select',
    gridSnap: true,
    history: [mechanic],
    historyIndex: 0,
    pendingMoveEvent: null,
    pendingAoE: null,
    selectedAoEType: 'circle',
    pendingDebuff: null,
    pendingText: null,
    pendingObject: null,
    moveFromListMode: {
      active: false,
      playerId: null,
    },
    hiddenObjectIds: [],
  };
}
