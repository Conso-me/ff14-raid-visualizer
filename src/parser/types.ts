// ACT Log Parser Types
// ACT Network log format uses pipe-delimited fields

// Base event with common fields
export interface BaseLogEvent {
  timestamp: Date;
  eventCode: number;
  rawLine: string;
}

// Code 3: AddCombatant - Player/Enemy spawn
export interface AddCombatantEvent extends BaseLogEvent {
  eventCode: 3;
  id: string; // Hex ID (10xxxxxx = player, 40xxxxxx = enemy)
  name: string;
  jobId: number;
  level: number;
  ownerId: string;
  worldId: number;
  worldName: string;
  npcNameId: string;
  npcBaseId: string;
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
  position: {
    x: number;
    y: number;
    z: number;
    heading: number;
  };
}

// Code 20: StartsCasting - Begins casting
export interface StartsCastingEvent extends BaseLogEvent {
  eventCode: 20;
  sourceId: string;
  sourceName: string;
  actionId: string;
  actionName: string;
  targetId: string;
  targetName: string;
  castTime: number;
  position: {
    x: number;
    y: number;
    z: number;
    heading: number;
  };
}

// Code 21/22: ActionEffect - Action execution (single target / AoE)
export interface ActionEffectEvent extends BaseLogEvent {
  eventCode: 21 | 22;
  sourceId: string;
  sourceName: string;
  actionId: string;
  actionName: string;
  targetId: string;
  targetName: string;
  effectFlags: string[];
}

// Code 26: StatusAdd - Debuff/Buff applied
export interface StatusAddEvent extends BaseLogEvent {
  eventCode: 26;
  statusId: string;
  statusName: string;
  duration: number; // seconds
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  stacks: number;
  targetMaxHp: number;
}

// Code 27: StatusRemove - Debuff/Buff removed
export interface StatusRemoveEvent extends BaseLogEvent {
  eventCode: 27;
  statusId: string;
  statusName: string;
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  stacks: number;
}

// Code 29: WaymarkMarker - Field marker placement
export interface WaymarkMarkerEvent extends BaseLogEvent {
  eventCode: 29;
  operation: 'add' | 'remove';
  markerType: number; // 0=A, 1=B, 2=C, 3=D, 4=1, 5=2, 6=3, 7=4
  position: {
    x: number;
    y: number;
    z: number;
  };
}

// Code 40: Tether - Tether connection between entities
export interface TetherEvent extends BaseLogEvent {
  eventCode: 40;
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  tetherId: string;
}

// Code 1: ChangeZone - Zone change event
export interface ChangeZoneEvent extends BaseLogEvent {
  eventCode: 1;
  zoneId: number;
  zoneName: string;
}

// Code 33: ActorControl - Various control events (wipe, encounter changes, etc)
export interface ActorControlEvent extends BaseLogEvent {
  eventCode: 33;
  instanceId: string;
  command: string;
  data0: string;
  data1: string;
  data2: string;
  data3: string;
}

// All log event types
export type LogEvent =
  | ChangeZoneEvent
  | AddCombatantEvent
  | StartsCastingEvent
  | ActionEffectEvent
  | StatusAddEvent
  | StatusRemoveEvent
  | WaymarkMarkerEvent
  | TetherEvent
  | ActorControlEvent;

// Parsed combatant info
export interface ParsedCombatant {
  id: string;
  name: string;
  jobId: number;
  isPlayer: boolean; // true if ID starts with 10
  position: {
    x: number;
    y: number;
    z: number;
    heading: number;
  };
}

// Aggregated parse result
export interface ParsedLogData {
  startTime: Date;
  endTime: Date;
  combatants: ParsedCombatant[];
  players: ParsedCombatant[];
  enemies: ParsedCombatant[];
  statusEvents: (StatusAddEvent | StatusRemoveEvent)[];
  castEvents: StartsCastingEvent[];
  waymarks: WaymarkMarkerEvent[];
  tethers: TetherEvent[];
  allEvents: LogEvent[];
}

// ===== Log Browser Types =====

// Encounter (combat session) information
export interface Encounter {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // milliseconds
  result: 'clear' | 'wipe' | 'unknown';
  bossName?: string;
  playerCount: number;
}

// Player info detected during zone parsing
export interface ZonePlayer {
  id: string;
  name: string;
  jobId: number;
}

// Zone session information
export interface ZoneSession {
  zoneId: number;
  zoneName: string;
  startTime: Date;
  endTime: Date;
  encounters: Encounter[];
  players: ZonePlayer[]; // Players detected in this zone
}

// Log browser parsed data
export interface LogBrowserData {
  filename: string;
  totalLines: number;
  zones: ZoneSession[];
  parseProgress: number;
}
