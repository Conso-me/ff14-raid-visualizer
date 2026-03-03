import type {
  MechanicMarker,
  MechanicMarkerDisplay,
  TimelineEvent,
  MarkerShowEvent,
  MarkerHideEvent,
} from '../../data/types';

interface MarkerState extends MechanicMarker {
  showFrame: number;
  fadeInDuration: number;
  hideFrame?: number;
  fadeOutDuration?: number;
}

/**
 * Get active mechanic markers at a specific frame with calculated opacity
 * based on fade in/out animations.
 * Follows the same pattern as getActiveAoEs.
 */
export function getActiveMechanicMarkers(
  timeline: TimelineEvent[],
  currentFrame: number,
): MechanicMarkerDisplay[] {
  const markerStates: Map<string, MarkerState> = new Map();

  const sortedEvents = [...timeline].sort((a, b) => a.frame - b.frame);

  for (const event of sortedEvents) {
    if (event.type === 'marker_show') {
      const showEvent = event as MarkerShowEvent;
      if (event.frame <= currentFrame) {
        markerStates.set(showEvent.marker.id, {
          ...showEvent.marker,
          showFrame: event.frame,
          fadeInDuration: showEvent.fadeInDuration || 0,
        });
      }
    } else if (event.type === 'marker_hide') {
      const hideEvent = event as MarkerHideEvent;
      if (event.frame <= currentFrame) {
        const state = markerStates.get(hideEvent.markerId);
        if (state) {
          state.hideFrame = event.frame;
          state.fadeOutDuration = hideEvent.fadeOutDuration || 0;
        }
      }
    }
  }

  const result: MechanicMarkerDisplay[] = [];

  for (const marker of markerStates.values()) {
    let opacity = marker.opacity ?? 0.9;

    // Check if fade out is complete
    if (marker.hideFrame !== undefined) {
      const fadeOutEnd = marker.hideFrame + (marker.fadeOutDuration || 0);
      if (currentFrame >= fadeOutEnd) {
        continue;
      }
    }

    // Calculate fade in
    if (marker.fadeInDuration > 0) {
      const fadeInEnd = marker.showFrame + marker.fadeInDuration;
      if (currentFrame < fadeInEnd) {
        const progress = (currentFrame - marker.showFrame) / marker.fadeInDuration;
        opacity *= Math.max(0, Math.min(1, progress));
      }
    }

    // Calculate fade out
    if (
      marker.hideFrame !== undefined &&
      marker.fadeOutDuration !== undefined &&
      marker.fadeOutDuration > 0
    ) {
      if (currentFrame >= marker.hideFrame) {
        const progress = (currentFrame - marker.hideFrame) / marker.fadeOutDuration;
        opacity *= Math.max(0, 1 - progress);
      }
    }

    result.push({
      id: marker.id,
      type: marker.type,
      position: marker.position,
      size: marker.size,
      color: marker.color,
      opacity: marker.opacity,
      rotation: marker.rotation,
      count: marker.count,
      currentOpacity: opacity,
    });
  }

  return result;
}

/**
 * Get all mechanic marker events (show/hide pairs) from timeline.
 */
export function getMarkerEventPairs(
  timeline: TimelineEvent[]
): Array<{
  marker: MechanicMarker;
  showFrame: number;
  fadeInDuration: number;
  hideFrame: number | null;
  fadeOutDuration: number;
}> {
  const showEvents: Map<string, MarkerShowEvent> = new Map();
  const hideEvents: Map<string, MarkerHideEvent> = new Map();

  for (const event of timeline) {
    if (event.type === 'marker_show') {
      showEvents.set((event as MarkerShowEvent).marker.id, event as MarkerShowEvent);
    } else if (event.type === 'marker_hide') {
      hideEvents.set((event as MarkerHideEvent).markerId, event as MarkerHideEvent);
    }
  }

  const result: Array<{
    marker: MechanicMarker;
    showFrame: number;
    fadeInDuration: number;
    hideFrame: number | null;
    fadeOutDuration: number;
  }> = [];

  for (const showEvent of showEvents.values()) {
    const hideEvent = hideEvents.get(showEvent.marker.id);
    result.push({
      marker: showEvent.marker,
      showFrame: showEvent.frame,
      fadeInDuration: showEvent.fadeInDuration || 0,
      hideFrame: hideEvent?.frame ?? null,
      fadeOutDuration: hideEvent?.fadeOutDuration || 0,
    });
  }

  return result.sort((a, b) => a.showFrame - b.showFrame);
}
