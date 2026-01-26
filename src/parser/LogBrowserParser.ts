// Log Browser Parser
// Quickly parses large ACT logs to extract zone and encounter structure

import type {
  ZoneSession,
  ZonePlayer,
  Encounter,
  LogBrowserData,
  ParsedLogData,
} from './types';
import { ACTLogParser } from './ACTLogParser';
import { JOBS } from './data/jobs';
import { isPetName } from './data/pets';

// Known raid/trial zone IDs (hex) - common savage and extreme content
const RAID_ZONE_IDS = new Set([
  0x52B, // AAC Heavyweight M2 (Savage)
  0x52A, // AAC Heavyweight M1 (Savage)
  0x52C, // AAC Heavyweight M3 (Savage)
  0x52D, // AAC Heavyweight M4 (Savage)
  0x522, // Mistwake (trial)
  0x50C, // Meso Terminal
  // Add more zone IDs as needed
]);

// Wipe command in ActorControl
const WIPE_COMMAND = '40000010';

// Minimum combat duration to be considered an encounter (10 seconds)
const MIN_ENCOUNTER_DURATION_MS = 10000;

// Maximum gap between combat events to still be considered same encounter (30 seconds)
const COMBAT_GAP_THRESHOLD_MS = 30000;

export interface ParseStructureOptions {
  onProgress?: (progress: number) => void;
}

export interface ParseTimeRangeOptions {
  onProgress?: (progress: number) => void;
  maxEvents?: number;
  maxStatusEvents?: number;
  zonePlayers?: ZonePlayer[]; // Pre-detected players from zone parsing
}

/**
 * Log Browser Parser - for quick structure extraction from large logs
 */
export class LogBrowserParser {
  private actParser: ACTLogParser;

  constructor() {
    this.actParser = new ACTLogParser();
  }

  /**
   * Parse log structure (zones and encounters) without full event parsing
   * This is optimized for speed on large files
   */
  async parseStructure(
    logText: string,
    filename: string,
    options: ParseStructureOptions = {}
  ): Promise<LogBrowserData> {
    const { onProgress } = options;

    return new Promise((resolve) => {
      const zones: ZoneSession[] = [];
      let currentZone: ZoneSession | null = null;
      let currentEncounter: Partial<Encounter> | null = null;
      let lastCombatTime: Date | null = null;
      let encounterPlayers = new Set<string>();
      let zonePlayers = new Map<string, ZonePlayer>(); // Full player info for zone
      let totalLines = 0;

      let lineStart = 0;
      const textLength = logText.length;
      const CHUNK_SIZE = 100000; // Characters per chunk

      const processChunk = () => {
        const chunkEnd = Math.min(lineStart + CHUNK_SIZE, textLength);

        while (lineStart < chunkEnd) {
          let lineEnd = logText.indexOf('\n', lineStart);
          if (lineEnd === -1) lineEnd = textLength;

          const line = logText.substring(lineStart, lineEnd);
          lineStart = lineEnd + 1;
          totalLines++;

          // Quick check: get event code
          const pipeIndex = line.indexOf('|');
          if (pipeIndex === -1) continue;

          const codeStr = line.substring(0, pipeIndex);
          const eventCode = parseInt(codeStr, 10);

          // Parse timestamp (second field)
          const secondPipe = line.indexOf('|', pipeIndex + 1);
          if (secondPipe === -1) continue;
          const timestampStr = line.substring(pipeIndex + 1, secondPipe);
          const timestamp = new Date(timestampStr);
          if (isNaN(timestamp.getTime())) continue;

          switch (eventCode) {
            case 1: // ChangeZone
              this.handleZoneChange(line, timestamp, zones, currentZone, currentEncounter, encounterPlayers);
              const result = this.parseZoneChangeLine(line, timestamp);
              if (result) {
                // Finalize previous zone
                if (currentZone) {
                  // Set end time of current encounter before zone change
                  if (currentEncounter && !currentEncounter.endTime) {
                    currentEncounter.endTime = lastCombatTime || timestamp;
                  }
                  this.finalizeEncounter(currentZone, currentEncounter, encounterPlayers);
                  currentZone.endTime = timestamp;
                  // Store players detected in this zone
                  currentZone.players = Array.from(zonePlayers.values());
                }

                // Start new zone
                currentZone = result;
                zones.push(currentZone);
                currentEncounter = null;
                lastCombatTime = null;
                encounterPlayers = new Set();
                zonePlayers = new Map(); // Reset for new zone
              }
              break;

            case 3: // AddCombatant - detect players
              if (currentZone) {
                const parts = line.split('|');
                if (parts.length >= 5) {
                  const id = parts[2]?.toUpperCase();
                  const name = parts[3];
                  const jobId = parseInt(parts[4], 10);
                  // Player IDs start with 10
                  if (id?.startsWith('10') && JOBS[jobId] && !zonePlayers.has(id)) {
                    zonePlayers.set(id, { id, name, jobId });
                    encounterPlayers.add(id);
                  }
                }
              }
              break;

            case 20: // StartsCasting
            case 21: // ActionEffect
            case 22: // AoE ActionEffect
              if (currentZone) {
                const parts = line.split('|');
                if (parts.length >= 4) {
                  const sourceId = parts[2];
                  const sourceName = parts[3];

                  // Enemy action (ID starts with 40)
                  if (sourceId?.startsWith('40')) {
                    // Check if we need to start a new encounter
                    const shouldStartNew =
                      !currentEncounter ||
                      (lastCombatTime &&
                        timestamp.getTime() - lastCombatTime.getTime() > COMBAT_GAP_THRESHOLD_MS);

                    if (shouldStartNew) {
                      // Set end time of previous encounter before finalizing
                      if (currentEncounter && !currentEncounter.endTime) {
                        // Use last combat time as end time (the last activity before the gap)
                        currentEncounter.endTime = lastCombatTime || timestamp;
                      }

                      // Finalize previous encounter
                      this.finalizeEncounter(currentZone, currentEncounter, encounterPlayers);

                      // Start new encounter
                      currentEncounter = {
                        id: `encounter_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                        startTime: timestamp,
                        bossName: sourceName,
                        result: 'unknown',
                      };
                      encounterPlayers = new Set();
                    }

                    lastCombatTime = timestamp;

                    // Update boss name if we don't have one
                    if (currentEncounter && !currentEncounter.bossName && sourceName) {
                      currentEncounter.bossName = sourceName;
                    }
                  }
                }
              }
              break;

            case 33: // ActorControl - detect wipes
              if (currentZone && currentEncounter) {
                const parts = line.split('|');
                if (parts.length >= 4) {
                  const command = parts[3];
                  // Wipe command: 40000010
                  if (command === WIPE_COMMAND) {
                    currentEncounter.result = 'wipe';
                    currentEncounter.endTime = timestamp;
                    this.finalizeEncounter(currentZone, currentEncounter, encounterPlayers);
                    currentEncounter = null;
                    lastCombatTime = null;
                    encounterPlayers = new Set();
                  }
                }
              }
              break;
          }
        }

        // Report progress
        if (onProgress) {
          onProgress(lineStart / textLength);
        }

        // Continue or finish
        if (lineStart < textLength) {
          setTimeout(processChunk, 0);
        } else {
          // Finalize last zone
          if (currentZone) {
            // Set end time of current encounter before finalizing
            if (currentEncounter && !currentEncounter.endTime) {
              currentEncounter.endTime = lastCombatTime || currentEncounter.startTime;
            }
            this.finalizeEncounter(currentZone, currentEncounter, encounterPlayers);
            if (!currentZone.endTime) {
              currentZone.endTime = lastCombatTime || currentZone.startTime;
            }
            // Store players detected in this zone
            currentZone.players = Array.from(zonePlayers.values());
          }

          if (onProgress) {
            onProgress(1);
          }

          resolve({
            filename,
            totalLines,
            zones,
            parseProgress: 1,
          });
        }
      };

      // Start processing
      processChunk();
    });
  }

  /**
   * Parse a specific time range of the log with full event parsing
   */
  async parseTimeRange(
    logText: string,
    startTime: Date,
    endTime: Date,
    options: ParseTimeRangeOptions = {}
  ): Promise<ParsedLogData> {
    const { onProgress, maxEvents = 50000, maxStatusEvents = 10000, zonePlayers = [] } = options;

    // Validate dates - ensure they are Date objects
    const startMs = startTime instanceof Date ? startTime.getTime() : new Date(startTime).getTime();
    const endMs = endTime instanceof Date ? endTime.getTime() : new Date(endTime).getTime();


    // Filter log lines to the time range (no need for AddCombatant lookback - we use zonePlayers)
    const filteredLines: string[] = [];
    let lineStart = 0;
    const textLength = logText.length;

    while (lineStart < textLength) {
      let lineEnd = logText.indexOf('\n', lineStart);
      if (lineEnd === -1) lineEnd = textLength;

      const line = logText.substring(lineStart, lineEnd);
      lineStart = lineEnd + 1;

      // Quick timestamp extraction
      const pipeIndex = line.indexOf('|');
      if (pipeIndex === -1) continue;
      const secondPipe = line.indexOf('|', pipeIndex + 1);
      if (secondPipe === -1) continue;

      const timestampStr = line.substring(pipeIndex + 1, secondPipe);
      const timestamp = new Date(timestampStr);
      const timeMs = timestamp.getTime();

      // Skip invalid timestamps
      if (isNaN(timeMs)) continue;

      // Only include events within the time range
      if (timeMs >= startMs && timeMs <= endMs) {
        filteredLines.push(line);
      } else if (timeMs > endMs) {
        break;
      }
    }


    // Parse the filtered lines
    const filteredText = filteredLines.join('\n');

    const parsed = await this.actParser.parseAsync(filteredText, {
      maxEvents,
      maxStatusEvents,
      onProgress,
    });

    // Use pre-detected zone players if available, otherwise collect from combat events
    let detectedPlayers = zonePlayers;
    if (detectedPlayers.length === 0) {
      // Collect players from combat events within the time range
      detectedPlayers = this.collectPlayersFromCombat(logText, startTime, endTime);
    }

    if (detectedPlayers.length > 0) {
      // Convert ZonePlayer to ParsedCombatant format
      const players = detectedPlayers.map(p => ({
        id: p.id,
        name: p.name,
        jobId: p.jobId,
        isPlayer: true,
        position: { x: 0, y: 0, z: 0, heading: 0 }, // Default position
      }));

      return {
        ...parsed,
        players,
        combatants: [...players, ...parsed.enemies],
      };
    }

    return parsed;
  }

  /**
   * Parse zone change line
   */
  private parseZoneChangeLine(line: string, timestamp: Date): ZoneSession | null {
    // Format: 01|timestamp|zoneId|zoneName|checksum
    const parts = line.split('|');
    if (parts.length < 4) return null;

    const zoneIdHex = parts[2];
    const zoneName = parts[3];
    const zoneId = parseInt(zoneIdHex, 16);

    if (isNaN(zoneId)) return null;

    return {
      zoneId,
      zoneName,
      startTime: timestamp,
      endTime: timestamp,
      encounters: [],
      players: [],
    };
  }

  /**
   * Handle zone change event
   */
  private handleZoneChange(
    _line: string,
    _timestamp: Date,
    _zones: ZoneSession[],
    _currentZone: ZoneSession | null,
    _currentEncounter: Partial<Encounter> | null,
    _encounterPlayers: Set<string>
  ): void {
    // Logic moved to main loop for clarity
  }

  /**
   * Finalize an encounter and add it to the zone
   */
  private finalizeEncounter(
    zone: ZoneSession,
    encounter: Partial<Encounter> | null,
    players: Set<string>
  ): void {
    if (!encounter || !encounter.startTime) return;

    // endTime should already be set before calling this method
    // Fallback to startTime if somehow not set (shouldn't happen)
    const endTime = encounter.endTime || encounter.startTime;
    const duration = endTime.getTime() - encounter.startTime.getTime();

    // Only add if it meets minimum duration
    if (duration >= MIN_ENCOUNTER_DURATION_MS) {
      const finalEncounter: Encounter = {
        id: encounter.id || `encounter_${Date.now()}`,
        startTime: encounter.startTime,
        endTime,
        duration,
        result: encounter.result || 'unknown',
        bossName: encounter.bossName,
        playerCount: players.size,
      };

      zone.encounters.push(finalEncounter);
    }
  }

  /**
   * Check if a zone is a raid/trial zone
   */
  isRaidZone(zoneId: number): boolean {
    return RAID_ZONE_IDS.has(zoneId);
  }

  /**
   * Format duration in mm:ss format
   */
  static formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format time in HH:MM:SS format
   */
  static formatTime(date: Date): string {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /**
   * Check if an ID is a player ID (starts with '10' and is 8 hex digits)
   */
  private isPlayerId(id: string): boolean {
    if (!id || id.length !== 8) return false;
    return id.toUpperCase().startsWith('10');
  }

  /**
   * Collect player information from combat events
   * Uses UpdateHP (37), ActionEffect (21/22), StartsCasting (20), StatusAdd (26)
   */
  collectPlayersFromCombat(
    logText: string,
    startTime: Date,
    endTime: Date
  ): ZonePlayer[] {
    const players = new Map<string, { id: string; name: string; position?: { x: number; y: number } }>();
    const startMs = startTime.getTime();
    const endMs = endTime.getTime();

    let lineStart = 0;
    const textLength = logText.length;

    while (lineStart < textLength) {
      let lineEnd = logText.indexOf('\n', lineStart);
      if (lineEnd === -1) lineEnd = textLength;

      const line = logText.substring(lineStart, lineEnd);
      lineStart = lineEnd + 1;

      if (!line.trim()) continue;

      try {
        const parts = line.split('|');
        if (parts.length < 4) continue;

        // Check timestamp
        const timestampStr = parts[1];
        const timestamp = new Date(timestampStr);
        const timeMs = timestamp.getTime();

        // Only process events within the time range
        if (isNaN(timeMs) || timeMs < startMs || timeMs > endMs) continue;

        const eventCode = parseInt(parts[0], 10);

        // Event 37 (UpdateHP) - ID[2], Name[3], X[11], Y[12]
        if (eventCode === 37 && parts.length > 14) {
          const id = parts[2];
          const name = parts[3];

          if (this.isPlayerId(id) && name && !isPetName(name)) {
            const x = parseFloat(parts[11]) || 0;
            const y = parseFloat(parts[12]) || 0;
            // Update with latest position
            players.set(id, { id, name, position: { x, y } });
          }
        }

        // Event 21/22 (ActionEffect) - SourceID[2], SourceName[3], TargetID[6], TargetName[7]
        if ((eventCode === 21 || eventCode === 22) && parts.length > 7) {
          const sourceId = parts[2];
          const sourceName = parts[3];
          const targetId = parts[6];
          const targetName = parts[7];

          if (this.isPlayerId(sourceId) && sourceName && !isPetName(sourceName)) {
            if (!players.has(sourceId)) {
              players.set(sourceId, { id: sourceId, name: sourceName });
            }
          }

          if (this.isPlayerId(targetId) && targetName && !isPetName(targetName)) {
            if (!players.has(targetId)) {
              players.set(targetId, { id: targetId, name: targetName });
            }
          }
        }

        // Event 20 (StartsCasting) - SourceID[2], SourceName[3], X[9], Y[10]
        if (eventCode === 20 && parts.length > 11) {
          const sourceId = parts[2];
          const sourceName = parts[3];

          if (this.isPlayerId(sourceId) && sourceName && !isPetName(sourceName)) {
            const x = parseFloat(parts[9]) || 0;
            const y = parseFloat(parts[10]) || 0;

            if (!players.has(sourceId)) {
              players.set(sourceId, { id: sourceId, name: sourceName, position: { x, y } });
            }
          }
        }

        // Event 26 (StatusAdd) - TargetID[5], TargetName[6], SourceID[7], SourceName[8]
        if (eventCode === 26 && parts.length > 8) {
          const targetId = parts[5];
          const targetName = parts[6];
          const sourceId = parts[7];
          const sourceName = parts[8];

          if (this.isPlayerId(targetId) && targetName && !isPetName(targetName)) {
            if (!players.has(targetId)) {
              players.set(targetId, { id: targetId, name: targetName });
            }
          }

          if (this.isPlayerId(sourceId) && sourceName && !isPetName(sourceName)) {
            if (!players.has(sourceId)) {
              players.set(sourceId, { id: sourceId, name: sourceName });
            }
          }
        }

      } catch (e) {
        // Ignore parse errors
      }
    }

    console.log(`[collectPlayersFromCombat] Found ${players.size} players:`,
      Array.from(players.values()).map(p => p.name));

    // Convert to ZonePlayer format (limit to 8 for raid party)
    return Array.from(players.values()).slice(0, 8).map(p => ({
      id: p.id,
      name: p.name,
      jobId: 0, // Job ID not available from combat events
    }));
  }
}

// Export singleton instance
export const logBrowserParser = new LogBrowserParser();
