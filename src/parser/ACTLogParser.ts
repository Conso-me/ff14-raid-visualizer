// ACT Log Parser
// Parses FF14 ACT Network log format (pipe-delimited)

import type {
  LogEvent,
  ParsedLogData,
  ParsedCombatant,
  AddCombatantEvent,
  StartsCastingEvent,
  ActionEffectEvent,
  StatusAddEvent,
  StatusRemoveEvent,
  WaymarkMarkerEvent,
  TetherEvent,
} from './types';
import { sortByRolePriority } from './data/jobs';
import { isPetName } from './data/pets';

// Event codes we care about - skip all others for performance
const SUPPORTED_EVENT_CODES = new Set([3, 20, 21, 22, 26, 27, 29, 40]);

// Maximum events to process to prevent memory issues
const MAX_EVENTS = 50000;
const MAX_STATUS_EVENTS = 10000;

export interface ParseOptions {
  maxEvents?: number;
  maxStatusEvents?: number;
  onProgress?: (progress: number) => void;
  includeStatus?: boolean; // Default: true. Set to false to skip StatusAdd/StatusRemove events
}

export class ACTLogParser {
  /**
   * Parse ACT log text asynchronously (for large files)
   * Returns a Promise that resolves with parsed data
   */
  parseAsync(logText: string, options: ParseOptions = {}): Promise<ParsedLogData> {
    const {
      maxEvents = MAX_EVENTS,
      maxStatusEvents = MAX_STATUS_EVENTS,
      onProgress,
      includeStatus = true,
    } = options;

    return new Promise((resolve) => {
      const events: LogEvent[] = [];
      const combatantMap = new Map<string, ParsedCombatant>();
      let statusEventCount = 0;
      let firstTimestamp: Date | null = null;
      let lastTimestamp: Date | null = null;

      let lineStart = 0;
      const textLength = logText.length;
      const CHUNK_SIZE = 50000; // Characters per chunk

      const processChunk = () => {
        const chunkEnd = Math.min(lineStart + CHUNK_SIZE, textLength);

        while (lineStart < chunkEnd && events.length < maxEvents) {
          // Find end of line
          let lineEnd = logText.indexOf('\n', lineStart);
          if (lineEnd === -1) lineEnd = textLength;

          // If line extends beyond chunk, process anyway to avoid splitting
          const line = logText.substring(lineStart, lineEnd);
          lineStart = lineEnd + 1;

          // Quick check: skip lines that don't start with supported event codes
          const pipeIndex = line.indexOf('|');
          if (pipeIndex === -1) continue;

          const codeStr = line.substring(0, pipeIndex);
          const eventCode = parseInt(codeStr, 10);
          if (!SUPPORTED_EVENT_CODES.has(eventCode)) continue;

          // Skip status events entirely if includeStatus is false
          if (!includeStatus && (eventCode === 26 || eventCode === 27)) {
            continue;
          }

          // Skip excess status events
          if ((eventCode === 26 || eventCode === 27) && statusEventCount >= maxStatusEvents) {
            continue;
          }

          const event = this.parseLine(line);
          if (event) {
            if (!firstTimestamp || event.timestamp < firstTimestamp) {
              firstTimestamp = event.timestamp;
            }
            if (!lastTimestamp || event.timestamp > lastTimestamp) {
              lastTimestamp = event.timestamp;
            }

            events.push(event);

            if (event.eventCode === 26 || event.eventCode === 27) {
              statusEventCount++;
            }

            if (event.eventCode === 3) {
              const combatant = this.extractCombatant(event as AddCombatantEvent);
              if (combatant && combatant.id && !combatantMap.has(combatant.id)) {
                combatantMap.set(combatant.id, combatant);
              }
            }
          }
        }

        // Report progress
        if (onProgress) {
          onProgress(lineStart / textLength);
        }

        // Continue or finish
        if (lineStart < textLength && events.length < maxEvents) {
          // Schedule next chunk
          setTimeout(processChunk, 0);
        } else {
          // Done - finalize results
          if (onProgress) {
            onProgress(1);
          }

          const combatants = Array.from(combatantMap.values());
          const players = combatants.filter(c => c.isPlayer).sort(sortByRolePriority);
          const enemies = combatants.filter(c => !c.isPlayer);

          resolve({
            startTime: firstTimestamp || new Date(),
            endTime: lastTimestamp || new Date(),
            combatants,
            players,
            enemies,
            statusEvents: events.filter(
              e => e.eventCode === 26 || e.eventCode === 27
            ) as (StatusAddEvent | StatusRemoveEvent)[],
            castEvents: events.filter(e => e.eventCode === 20) as StartsCastingEvent[],
            waymarks: events.filter(e => e.eventCode === 29) as WaymarkMarkerEvent[],
            tethers: events.filter(e => e.eventCode === 40) as TetherEvent[],
            allEvents: events,
          });
        }
      };

      // Start processing
      processChunk();
    });
  }

  /**
   * Parse ACT log text synchronously (for small files)
   * Use parseAsync for files > 10MB
   */
  parse(logText: string, options: ParseOptions = {}): ParsedLogData {
    const {
      maxEvents = MAX_EVENTS,
      maxStatusEvents = MAX_STATUS_EVENTS,
      includeStatus = true,
    } = options;

    const events: LogEvent[] = [];
    const combatantMap = new Map<string, ParsedCombatant>();
    let statusEventCount = 0;
    let firstTimestamp: Date | null = null;
    let lastTimestamp: Date | null = null;

    let lineStart = 0;
    const textLength = logText.length;

    while (lineStart < textLength && events.length < maxEvents) {
      let lineEnd = logText.indexOf('\n', lineStart);
      if (lineEnd === -1) lineEnd = textLength;

      const line = logText.substring(lineStart, lineEnd);
      lineStart = lineEnd + 1;

      const pipeIndex = line.indexOf('|');
      if (pipeIndex === -1) continue;

      const codeStr = line.substring(0, pipeIndex);
      const eventCode = parseInt(codeStr, 10);
      if (!SUPPORTED_EVENT_CODES.has(eventCode)) continue;

      // Skip status events entirely if includeStatus is false
      if (!includeStatus && (eventCode === 26 || eventCode === 27)) {
        continue;
      }

      if ((eventCode === 26 || eventCode === 27) && statusEventCount >= maxStatusEvents) {
        continue;
      }

      const event = this.parseLine(line);
      if (event) {
        if (!firstTimestamp || event.timestamp < firstTimestamp) {
          firstTimestamp = event.timestamp;
        }
        if (!lastTimestamp || event.timestamp > lastTimestamp) {
          lastTimestamp = event.timestamp;
        }

        events.push(event);

        if (event.eventCode === 26 || event.eventCode === 27) {
          statusEventCount++;
        }

        if (event.eventCode === 3) {
          const combatant = this.extractCombatant(event as AddCombatantEvent);
          if (combatant && combatant.id && !combatantMap.has(combatant.id)) {
            combatantMap.set(combatant.id, combatant);
          }
        }
      }
    }

    const combatants = Array.from(combatantMap.values());
    const players = combatants.filter(c => c.isPlayer).sort(sortByRolePriority);
    const enemies = combatants.filter(c => !c.isPlayer);

    return {
      startTime: firstTimestamp || new Date(),
      endTime: lastTimestamp || new Date(),
      combatants,
      players,
      enemies,
      statusEvents: events.filter(
        e => e.eventCode === 26 || e.eventCode === 27
      ) as (StatusAddEvent | StatusRemoveEvent)[],
      castEvents: events.filter(e => e.eventCode === 20) as StartsCastingEvent[],
      waymarks: events.filter(e => e.eventCode === 29) as WaymarkMarkerEvent[],
      tethers: events.filter(e => e.eventCode === 40) as TetherEvent[],
      allEvents: events,
    };
  }

  /**
   * Parse a single log line
   */
  private parseLine(line: string): LogEvent | null {
    // ACT format: EventCode|Timestamp|Field1|Field2|...
    const parts = line.split('|');
    if (parts.length < 2) return null;

    const eventCode = parseInt(parts[0], 10);
    const timestamp = this.parseTimestamp(parts[1]);

    if (isNaN(eventCode) || !timestamp) return null;

    const baseEvent = {
      timestamp,
      eventCode,
      rawLine: line,
    };

    switch (eventCode) {
      case 3:
        return this.parseAddCombatant(parts, baseEvent);
      case 20:
        return this.parseStartsCasting(parts, baseEvent);
      case 21:
      case 22:
        return this.parseActionEffect(parts, baseEvent);
      case 26:
        return this.parseStatusAdd(parts, baseEvent);
      case 27:
        return this.parseStatusRemove(parts, baseEvent);
      case 29:
        return this.parseWaymarkMarker(parts, baseEvent);
      case 40:
        return this.parseTether(parts, baseEvent);
      default:
        return null; // Ignore unsupported event types
    }
  }

  /**
   * Parse timestamp from ACT format
   */
  private parseTimestamp(timestampStr: string): Date | null {
    // ACT timestamp format: 2024-01-15T10:30:45.1234567+09:00
    try {
      return new Date(timestampStr);
    } catch {
      return null;
    }
  }

  /**
   * Parse AddCombatant event (code 3)
   * Format: 3|timestamp|id|name|jobId|level|ownerId|worldId|worldName|npcNameId|npcBaseId|currentHp|maxHp|currentMp|maxMp|?|?|x|y|z|heading
   */
  private parseAddCombatant(
    parts: string[],
    base: { timestamp: Date; eventCode: number; rawLine: string }
  ): AddCombatantEvent | null {
    if (parts.length < 18) return null;

    return {
      ...base,
      eventCode: 3,
      id: parts[2],
      name: parts[3],
      jobId: parseInt(parts[4], 10) || 0,
      level: parseInt(parts[5], 10) || 0,
      ownerId: parts[6],
      worldId: parseInt(parts[7], 10) || 0,
      worldName: parts[8],
      npcNameId: parts[9],
      npcBaseId: parts[10],
      currentHp: parseInt(parts[11], 10) || 0,
      maxHp: parseInt(parts[12], 10) || 0,
      currentMp: parseInt(parts[13], 10) || 0,
      maxMp: parseInt(parts[14], 10) || 0,
      position: {
        x: parseFloat(parts[17]) || 0,
        y: parseFloat(parts[18]) || 0,
        z: parseFloat(parts[19]) || 0,
        heading: parseFloat(parts[20]) || 0,
      },
    };
  }

  /**
   * Parse StartsCasting event (code 20)
   * Format: 20|timestamp|sourceId|sourceName|actionId|actionName|targetId|targetName|castTime|x|y|z|heading
   */
  private parseStartsCasting(
    parts: string[],
    base: { timestamp: Date; eventCode: number; rawLine: string }
  ): StartsCastingEvent | null {
    if (parts.length < 10) return null;

    return {
      ...base,
      eventCode: 20,
      sourceId: parts[2],
      sourceName: parts[3],
      actionId: parts[4],
      actionName: parts[5],
      targetId: parts[6],
      targetName: parts[7],
      castTime: parseFloat(parts[8]) || 0,
      position: {
        x: parseFloat(parts[9]) || 0,
        y: parseFloat(parts[10]) || 0,
        z: parseFloat(parts[11]) || 0,
        heading: parseFloat(parts[12]) || 0,
      },
    };
  }

  /**
   * Parse ActionEffect event (code 21/22)
   * Format: 21/22|timestamp|sourceId|sourceName|actionId|actionName|targetId|targetName|effects...
   */
  private parseActionEffect(
    parts: string[],
    base: { timestamp: Date; eventCode: number; rawLine: string }
  ): ActionEffectEvent | null {
    if (parts.length < 8) return null;

    return {
      ...base,
      eventCode: base.eventCode as 21 | 22,
      sourceId: parts[2],
      sourceName: parts[3],
      actionId: parts[4],
      actionName: parts[5],
      targetId: parts[6],
      targetName: parts[7],
      effectFlags: parts.slice(8),
    };
  }

  /**
   * Parse StatusAdd event (code 26)
   * Format: 26|timestamp|statusId|statusName|duration|sourceId|sourceName|targetId|targetName|stacks|targetMaxHp
   */
  private parseStatusAdd(
    parts: string[],
    base: { timestamp: Date; eventCode: number; rawLine: string }
  ): StatusAddEvent | null {
    if (parts.length < 11) return null;

    return {
      ...base,
      eventCode: 26,
      statusId: parts[2],
      statusName: parts[3],
      duration: parseFloat(parts[4]) || 0,
      sourceId: parts[5],
      sourceName: parts[6],
      targetId: parts[7],
      targetName: parts[8],
      stacks: parseInt(parts[9], 10) || 0,
      targetMaxHp: parseInt(parts[10], 10) || 0,
    };
  }

  /**
   * Parse StatusRemove event (code 27)
   * Format: 27|timestamp|statusId|statusName|?|sourceId|sourceName|targetId|targetName|stacks
   */
  private parseStatusRemove(
    parts: string[],
    base: { timestamp: Date; eventCode: number; rawLine: string }
  ): StatusRemoveEvent | null {
    if (parts.length < 10) return null;

    return {
      ...base,
      eventCode: 27,
      statusId: parts[2],
      statusName: parts[3],
      sourceId: parts[5],
      sourceName: parts[6],
      targetId: parts[7],
      targetName: parts[8],
      stacks: parseInt(parts[9], 10) || 0,
    };
  }

  /**
   * Parse WaymarkMarker event (code 29)
   * Format: 29|timestamp|operation|markerType|?|?|?|?|x*1000|?|y*1000|?|z*1000
   */
  private parseWaymarkMarker(
    parts: string[],
    base: { timestamp: Date; eventCode: number; rawLine: string }
  ): WaymarkMarkerEvent | null {
    if (parts.length < 13) return null;

    const operationCode = parts[2];
    const operation = operationCode === 'Add' ? 'add' : 'remove';
    const markerType = parseInt(parts[3], 10) || 0;

    // Waymark positions are multiplied by 1000 in the log
    return {
      ...base,
      eventCode: 29,
      operation,
      markerType,
      position: {
        x: (parseInt(parts[8], 10) || 0) / 1000,
        y: (parseInt(parts[10], 10) || 0) / 1000,
        z: (parseInt(parts[12], 10) || 0) / 1000,
      },
    };
  }

  /**
   * Parse Tether event (code 40)
   * Format: 40|timestamp|sourceId|sourceName|targetId|targetName|?|?|tetherId
   */
  private parseTether(
    parts: string[],
    base: { timestamp: Date; eventCode: number; rawLine: string }
  ): TetherEvent | null {
    if (parts.length < 9) return null;

    return {
      ...base,
      eventCode: 40,
      sourceId: parts[2],
      sourceName: parts[3],
      targetId: parts[4],
      targetName: parts[5],
      tetherId: parts[8],
    };
  }

  /**
   * Extract combatant info from AddCombatant event
   * Returns null for pets (should be filtered out)
   */
  private extractCombatant(event: AddCombatantEvent): ParsedCombatant | null {
    // Player IDs start with 10, enemies with 40
    // Note: IDs might be uppercase or lowercase hex
    const idUpper = event.id.toUpperCase();
    const isPlayer = idUpper.startsWith('10');

    // Filter out pets by name
    if (isPlayer && isPetName(event.name)) {
      return null;
    }

    return {
      id: event.id,
      name: event.name,
      jobId: event.jobId,
      isPlayer,
      position: event.position,
    };
  }
}

// Export singleton instance for convenience
export const actLogParser = new ACTLogParser();
