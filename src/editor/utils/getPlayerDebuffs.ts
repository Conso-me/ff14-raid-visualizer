import type { Debuff, TimelineEvent, DebuffAddEvent, DebuffRemoveEvent } from '../../data/types';

export interface ActiveDebuff extends Debuff {
  remainingSeconds: number;
}

/**
 * Get active debuffs for a specific player at a given frame
 * Calculates remaining time based on timeline events
 */
export function getPlayerDebuffs(
  timeline: TimelineEvent[],
  playerId: string,
  currentFrame: number,
  fps: number
): ActiveDebuff[] {
  const debuffStates: Map<string, Debuff> = new Map();

  // Process all events up to and including current frame
  for (const event of timeline) {
    if (event.frame > currentFrame) continue;

    if (event.type === 'debuff_add') {
      if (event.targetId === playerId || event.targetId === 'all') {
        const debuff: Debuff = {
          id: event.debuff.id,
          name: event.debuff.name,
          iconUrl: event.debuff.iconUrl,
          color: event.debuff.color,
          duration: event.debuff.duration,
          startFrame: event.frame,
        };
        debuffStates.set(event.debuff.id, debuff);
      }
    } else if (event.type === 'debuff_remove') {
      if (event.targetId === playerId || event.targetId === 'all') {
        debuffStates.delete(event.debuffId);
      }
    }
  }

  // Calculate remaining time for each debuff
  const result: ActiveDebuff[] = [];
  const currentTime = currentFrame / fps;

  for (const debuff of debuffStates.values()) {
    const startTime = debuff.startFrame / fps;
    const elapsedTime = currentTime - startTime;
    const remainingSeconds = Math.max(0, debuff.duration - elapsedTime);

    // Only include if still active
    if (remainingSeconds > 0) {
      result.push({
        ...debuff,
        remainingSeconds,
      });
    }
  }

  return result;
}

/**
 * Get all debuff events for a specific player from timeline
 */
export function getPlayerDebuffEvents(
  timeline: TimelineEvent[],
  playerId: string
): Array<{
  debuffId: string;
  debuffName: string;
  debuffColor?: string;
  startFrame: number;
  endFrame: number | null;
  duration: number;
}> {
  const addEvents: Map<string, DebuffAddEvent> = new Map();
  const removeEvents: Map<string, DebuffRemoveEvent> = new Map();

  for (const event of timeline) {
    if (event.type === 'debuff_add') {
      if (event.targetId === playerId || event.targetId === 'all') {
        // Use composite key to handle multiple same debuffs
        const key = `${event.debuff.id}-${event.frame}`;
        addEvents.set(key, event);
      }
    } else if (event.type === 'debuff_remove') {
      if (event.targetId === playerId || event.targetId === 'all') {
        // Find matching add event
        const key = `${event.debuffId}-${event.frame}`;
        removeEvents.set(key, event);
      }
    }
  }

  const result: Array<{
    debuffId: string;
    debuffName: string;
    debuffColor?: string;
    startFrame: number;
    endFrame: number | null;
    duration: number;
  }> = [];

  for (const [key, addEvent] of addEvents) {
    // Find matching remove event
    let removeEvent: DebuffRemoveEvent | undefined;
    for (const [, event] of removeEvents) {
      if (event.debuffId === addEvent.debuff.id && event.frame > addEvent.frame) {
        removeEvent = event;
        break;
      }
    }

    result.push({
      debuffId: addEvent.debuff.id,
      debuffName: addEvent.debuff.name,
      debuffColor: addEvent.debuff.color,
      startFrame: addEvent.frame,
      endFrame: removeEvent?.frame ?? null,
      duration: addEvent.debuff.duration,
    });
  }

  return result.sort((a, b) => a.startFrame - b.startFrame);
}

/**
 * Get all players with debuffs at a specific frame
 * Returns a map of playerId -> ActiveDebuff[]
 */
export function getAllPlayerDebuffs(
  timeline: TimelineEvent[],
  playerIds: string[],
  currentFrame: number,
  fps: number
): Map<string, ActiveDebuff[]> {
  const result = new Map<string, ActiveDebuff[]>();

  for (const playerId of playerIds) {
    const debuffs = getPlayerDebuffs(timeline, playerId, currentFrame, fps);
    if (debuffs.length > 0) {
      result.set(playerId, debuffs);
    }
  }

  return result;
}
