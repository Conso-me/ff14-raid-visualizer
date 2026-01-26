import type { GimmickObject, TimelineEvent, ObjectShowEvent, ObjectHideEvent } from '../../data/types';

export interface ActiveObject extends GimmickObject {
  currentOpacity: number;
}

interface ObjectState extends GimmickObject {
  showFrame: number;
  fadeInDuration: number;
  hideFrame?: number;
  fadeOutDuration?: number;
}

/**
 * Get active objects at a specific frame with calculated opacity
 * based on fade in/out animations
 */
export function getActiveObjects(
  timeline: TimelineEvent[],
  currentFrame: number
): ActiveObject[] {
  const objectStates: Map<string, ObjectState> = new Map();

  // Process all events up to and including current frame
  for (const event of timeline) {
    if (event.type === 'object_show') {
      if (event.frame <= currentFrame) {
        objectStates.set(event.object.id, {
          ...event.object,
          showFrame: event.frame,
          fadeInDuration: event.fadeInDuration || 0,
        });
      }
    } else if (event.type === 'object_hide') {
      const obj = objectStates.get(event.objectId);
      if (obj && event.frame <= currentFrame) {
        obj.hideFrame = event.frame;
        obj.fadeOutDuration = event.fadeOutDuration || 0;
      }
    }
  }

  // Calculate current opacity for each object
  const result: ActiveObject[] = [];

  for (const obj of objectStates.values()) {
    let opacity = obj.opacity ?? 1;

    // Check if fade out is complete
    if (obj.hideFrame !== undefined) {
      const fadeOutEnd = obj.hideFrame + (obj.fadeOutDuration || 0);
      if (currentFrame >= fadeOutEnd) {
        continue; // Object is completely hidden
      }
    }

    // Calculate fade in
    if (obj.fadeInDuration > 0) {
      const fadeInEnd = obj.showFrame + obj.fadeInDuration;
      if (currentFrame < fadeInEnd) {
        const progress = (currentFrame - obj.showFrame) / obj.fadeInDuration;
        opacity *= Math.max(0, Math.min(1, progress));
      }
    }

    // Calculate fade out
    if (obj.hideFrame !== undefined && obj.fadeOutDuration !== undefined && obj.fadeOutDuration > 0) {
      if (currentFrame >= obj.hideFrame) {
        const progress = (currentFrame - obj.hideFrame) / obj.fadeOutDuration;
        opacity *= Math.max(0, 1 - progress);
      }
    }

    result.push({
      ...obj,
      currentOpacity: opacity,
    });
  }

  return result;
}

/**
 * Get all object events (show/hide pairs) from timeline
 */
export function getObjectEventPairs(timeline: TimelineEvent[]): Array<{
  object: GimmickObject;
  showFrame: number;
  fadeInDuration: number;
  hideFrame: number | null;
  fadeOutDuration: number;
}> {
  const showEvents: Map<string, ObjectShowEvent> = new Map();
  const hideEvents: Map<string, ObjectHideEvent> = new Map();

  for (const event of timeline) {
    if (event.type === 'object_show') {
      showEvents.set(event.object.id, event);
    } else if (event.type === 'object_hide') {
      hideEvents.set(event.objectId, event);
    }
  }

  const result: Array<{
    object: GimmickObject;
    showFrame: number;
    fadeInDuration: number;
    hideFrame: number | null;
    fadeOutDuration: number;
  }> = [];

  for (const showEvent of showEvents.values()) {
    const hideEvent = hideEvents.get(showEvent.object.id);
    result.push({
      object: showEvent.object,
      showFrame: showEvent.frame,
      fadeInDuration: showEvent.fadeInDuration || 0,
      hideFrame: hideEvent?.frame ?? null,
      fadeOutDuration: hideEvent?.fadeOutDuration || 0,
    });
  }

  return result.sort((a, b) => a.showFrame - b.showFrame);
}
