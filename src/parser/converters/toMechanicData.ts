// Convert parsed ACT log data to MechanicData format

import type { ParsedLogData, StatusAddEvent, ParsedCombatant } from '../types';
import type {
  MechanicData,
  Player,
  Enemy,
  Role,
  TimelineEvent,
  DebuffAddEvent,
  FieldMarker,
  MarkerType,
} from '../../data/types';
import { getJobAbbreviation } from '../data/jobs';

export interface ConversionOptions {
  mechanicName: string;
  description?: string;
  fps: number;
  startTimeOffset?: number; // ms from log start
  endTimeOffset?: number; // ms from log start
  fieldSize?: number;
  backgroundColor?: string;
}

// P1-P8 roles for imported players
const PLAYER_ROLES: Role[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];

/**
 * Convert parsed log data to MechanicData
 */
export function toMechanicData(
  parsed: ParsedLogData,
  options: ConversionOptions
): MechanicData {
  const {
    mechanicName,
    description = 'Imported from ACT log',
    fps,
    startTimeOffset = 0,
    endTimeOffset,
    fieldSize = 40,
    backgroundColor = '#1a1a3e',
  } = options;

  // Calculate time range
  const logStartTime = parsed.startTime.getTime();
  const actualStartTime = logStartTime + startTimeOffset;
  const actualEndTime = endTimeOffset !== undefined
    ? logStartTime + endTimeOffset
    : parsed.endTime.getTime();

  const durationMs = actualEndTime - actualStartTime;
  const durationFrames = Math.ceil((durationMs / 1000) * fps);

  // Assign roles to players (P1-P8)
  const players = assignRoles(parsed.players);

  // Create player ID mapping (log ID -> role ID)
  // Use deduplicated list for consistent mapping
  const uniquePlayers = [...new Map(parsed.players.map(p => [p.id, p])).values()];
  const playerIdMap = new Map<string, string>();
  uniquePlayers.slice(0, 8).forEach((logPlayer, index) => {
    playerIdMap.set(logPlayer.id, players[index].id);
  });

  // Convert enemies
  const enemies = convertEnemies(parsed.enemies);

  // Convert timeline events
  const timeline = convertTimeline(
    parsed,
    playerIdMap,
    actualStartTime,
    fps
  );

  // Convert waymarks to field markers
  const markers = convertWaymarks(parsed.waymarks);

  return {
    id: `imported_${Date.now()}`,
    name: mechanicName,
    description,
    durationFrames,
    fps,
    field: {
      type: 'circle',
      size: fieldSize,
      backgroundColor,
      gridEnabled: true,
    },
    markers,
    initialPlayers: players,
    enemies,
    timeline,
  };
}

/**
 * Get initials from a player name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return parts.map(p => p.charAt(0).toUpperCase()).join('').slice(0, 2);
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Assign P1-P8 roles to players
 * Uses initials for display name instead of job-based roles
 */
function assignRoles(players: ParsedLogData['players']): Player[] {
  // Deduplicate players by ID
  const unique = [...new Map(players.map(p => [p.id, p])).values()];

  // Limit to 8 players
  return unique.slice(0, 8).map((player, index) => {
    const role = PLAYER_ROLES[index];
    const position = normalizePosition(player.position);

    return {
      id: role.toLowerCase(),
      role,
      job: getJobAbbreviation(player.jobId),
      name: getInitials(player.name),
      position,
    };
  });
}

/**
 * Normalize game coordinates to field coordinates
 * Game coordinates vary by zone, we center around 100,100 typically
 */
function normalizePosition(pos: { x: number; y: number }): { x: number; y: number } {
  // Most arena center points are around (100, 100) in game coordinates
  // Field size is typically 40 units (-20 to 20)
  // We'll center around 100 and scale if needed

  // For now, assume arena center is at (100, 100) and scale 1:1
  const centerX = 100;
  const centerY = 100;

  return {
    x: Math.round((pos.x - centerX) * 10) / 10,
    y: Math.round((pos.y - centerY) * 10) / 10,
  };
}

/**
 * Convert enemies from parsed data
 */
function convertEnemies(enemies: ParsedLogData['enemies']): Enemy[] {
  // Filter to significant enemies (bosses) - those with actual names
  return enemies
    .filter(e => e.name && !e.name.startsWith('E00'))
    .slice(0, 5) // Limit to 5 enemies max
    .map((enemy, index) => ({
      id: `enemy_${index}`,
      name: enemy.name,
      position: normalizePosition(enemy.position),
      size: 3,
      color: '#ff4444',
    }));
}

/**
 * Convert timeline events (debuffs for now)
 */
function convertTimeline(
  parsed: ParsedLogData,
  playerIdMap: Map<string, string>,
  startTime: number,
  fps: number
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Convert status add events to debuff_add
  const statusAddEvents = parsed.statusEvents.filter(
    (e): e is StatusAddEvent => e.eventCode === 26
  );

  // Filter to only player debuffs and deduplicate
  const seenDebuffs = new Set<string>();

  for (const event of statusAddEvents) {
    const playerId = playerIdMap.get(event.targetId);
    if (!playerId) continue; // Skip non-player targets

    // Create unique key for deduplication
    const key = `${event.statusId}-${event.targetId}-${Math.floor(event.timestamp.getTime() / 1000)}`;
    if (seenDebuffs.has(key)) continue;
    seenDebuffs.add(key);

    const frameNumber = msToFrame(
      event.timestamp.getTime() - startTime,
      fps
    );

    // Skip events before start
    if (frameNumber < 0) continue;

    const debuffEvent: DebuffAddEvent = {
      id: `debuff_${events.length}`,
      type: 'debuff_add',
      frame: frameNumber,
      targetId: playerId,
      debuff: {
        id: `status_${event.statusId}`,
        name: event.statusName,
        duration: event.duration,
        color: getDebuffColor(event.statusName),
      },
    };

    events.push(debuffEvent);
  }

  return events;
}

/**
 * Convert waymarks to field markers
 */
function convertWaymarks(waymarks: ParsedLogData['waymarks']): FieldMarker[] {
  const markers: FieldMarker[] = [];
  const markerTypeMap: Record<number, MarkerType> = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: '1',
    5: '2',
    6: '3',
    7: '4',
  };

  // Get last state of each marker (final position)
  const markerStates = new Map<number, { x: number; y: number } | null>();

  for (const waymark of waymarks) {
    if (waymark.operation === 'add') {
      markerStates.set(waymark.markerType, normalizePosition(waymark.position));
    } else {
      markerStates.set(waymark.markerType, null);
    }
  }

  for (const [type, position] of markerStates) {
    if (position === null) continue;

    const markerType = markerTypeMap[type];
    if (!markerType) continue;

    markers.push({
      type: markerType,
      position,
    });
  }

  return markers;
}

/**
 * Convert milliseconds to frame number
 */
function msToFrame(ms: number, fps: number): number {
  return Math.round((ms / 1000) * fps);
}

/**
 * Get a color for a debuff based on its name
 * This uses heuristics for common debuff types
 */
function getDebuffColor(name: string): string {
  const lowerName = name.toLowerCase();

  // Damage debuffs (red)
  if (lowerName.includes('damage') || lowerName.includes('vulnerability')) {
    return '#ff4444';
  }

  // Healing/Shield debuffs (green)
  if (lowerName.includes('heal') || lowerName.includes('regen')) {
    return '#44ff44';
  }

  // Magic debuffs (blue)
  if (lowerName.includes('magic') || lowerName.includes('spell')) {
    return '#4444ff';
  }

  // Tank debuffs (yellow)
  if (lowerName.includes('tank') || lowerName.includes('aggro') || lowerName.includes('enmity')) {
    return '#ffff44';
  }

  // Stack markers (cyan)
  if (lowerName.includes('stack') || lowerName.includes('集合')) {
    return '#44ffff';
  }

  // Spread markers (orange)
  if (lowerName.includes('spread') || lowerName.includes('散開')) {
    return '#ff8844';
  }

  // Default purple
  return '#aa44ff';
}

/**
 * Get unique debuff types from parsed data
 * Useful for previewing what will be imported
 */
export function getUniqueDebuffs(parsed: ParsedLogData): Array<{ id: string; name: string; count: number }> {
  const debuffCounts = new Map<string, { name: string; count: number }>();

  for (const event of parsed.statusEvents) {
    if (event.eventCode !== 26) continue;

    const key = event.statusId;
    const existing = debuffCounts.get(key);

    if (existing) {
      existing.count++;
    } else {
      debuffCounts.set(key, { name: event.statusName, count: 1 });
    }
  }

  return Array.from(debuffCounts.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    count: data.count,
  }));
}
