import type { AoE, TimelineEvent, AoEShowEvent, AoEHideEvent } from '../../data/types';

export interface ActiveAoE extends AoE {
  currentOpacity: number;
}

interface AoEState extends AoE {
  showFrame: number;
  fadeInDuration: number;
  hideFrame?: number;
  fadeOutDuration?: number;
}

/**
 * Get active AoEs at a specific frame with calculated opacity
 * based on fade in/out animations
 */
export function getActiveAoEs(
  timeline: TimelineEvent[],
  currentFrame: number
): ActiveAoE[] {
  const aoeStates: Map<string, AoEState> = new Map();

  // Process all events up to and including current frame
  for (const event of timeline) {
    if (event.type === 'aoe_show') {
      if (event.frame <= currentFrame) {
        aoeStates.set(event.aoe.id, {
          ...event.aoe,
          showFrame: event.frame,
          fadeInDuration: event.fadeInDuration || 0,
        });
      }
    } else if (event.type === 'aoe_hide') {
      const aoe = aoeStates.get(event.aoeId);
      if (aoe && event.frame <= currentFrame) {
        aoe.hideFrame = event.frame;
        aoe.fadeOutDuration = event.fadeOutDuration || 0;
      }
    }
  }

  // Calculate current opacity for each AoE
  const result: ActiveAoE[] = [];

  for (const aoe of aoeStates.values()) {
    let opacity = aoe.opacity || 0.5;

    // Check if fade out is complete
    if (aoe.hideFrame !== undefined) {
      const fadeOutEnd = aoe.hideFrame + (aoe.fadeOutDuration || 0);
      if (currentFrame >= fadeOutEnd) {
        continue; // AoE is completely hidden
      }
    }

    // Calculate fade in
    if (aoe.fadeInDuration > 0) {
      const fadeInEnd = aoe.showFrame + aoe.fadeInDuration;
      if (currentFrame < fadeInEnd) {
        const progress = (currentFrame - aoe.showFrame) / aoe.fadeInDuration;
        opacity *= Math.max(0, Math.min(1, progress));
      }
    }

    // Calculate fade out
    if (aoe.hideFrame !== undefined && aoe.fadeOutDuration !== undefined && aoe.fadeOutDuration > 0) {
      if (currentFrame >= aoe.hideFrame) {
        const progress = (currentFrame - aoe.hideFrame) / aoe.fadeOutDuration;
        opacity *= Math.max(0, 1 - progress);
      }
    }

    result.push({
      ...aoe,
      currentOpacity: opacity,
    });
  }

  return result;
}

/**
 * Get all AoE events (show/hide pairs) from timeline
 * Returns an array of AoE information including timing
 */
export function getAoEEventPairs(timeline: TimelineEvent[]): Array<{
  aoe: AoE;
  showFrame: number;
  fadeInDuration: number;
  hideFrame: number | null;
  fadeOutDuration: number;
}> {
  const showEvents: Map<string, AoEShowEvent> = new Map();
  const hideEvents: Map<string, AoEHideEvent> = new Map();

  for (const event of timeline) {
    if (event.type === 'aoe_show') {
      showEvents.set(event.aoe.id, event);
    } else if (event.type === 'aoe_hide') {
      hideEvents.set(event.aoeId, event);
    }
  }

  const result: Array<{
    aoe: AoE;
    showFrame: number;
    fadeInDuration: number;
    hideFrame: number | null;
    fadeOutDuration: number;
  }> = [];

  for (const showEvent of showEvents.values()) {
    const hideEvent = hideEvents.get(showEvent.aoe.id);
    result.push({
      aoe: showEvent.aoe,
      showFrame: showEvent.frame,
      fadeInDuration: showEvent.fadeInDuration || 0,
      hideFrame: hideEvent?.frame ?? null,
      fadeOutDuration: hideEvent?.fadeOutDuration || 0,
    });
  }

  return result.sort((a, b) => a.showFrame - b.showFrame);
}
