import type { TextAnnotation, TimelineEvent, TextShowEvent, TextHideEvent } from '../../data/types';

/**
 * Get active text annotations at a specific frame
 */
export function getActiveAnnotations(
  timeline: TimelineEvent[],
  currentFrame: number
): TextAnnotation[] {
  const annotationStates: Map<string, TextAnnotation> = new Map();

  // Process all events up to and including current frame
  for (const event of timeline) {
    if (event.type === 'text_show') {
      if (event.frame <= currentFrame) {
        annotationStates.set(event.annotation.id, event.annotation);
      }
    } else if (event.type === 'text_hide') {
      if (event.frame <= currentFrame) {
        annotationStates.delete(event.annotationId);
      }
    }
  }

  return Array.from(annotationStates.values());
}

/**
 * Get all text annotation events (show/hide pairs) from timeline
 */
export function getAnnotationEventPairs(timeline: TimelineEvent[]): Array<{
  annotation: TextAnnotation;
  showFrame: number;
  hideFrame: number | null;
}> {
  const showEvents: Map<string, TextShowEvent> = new Map();
  const hideEvents: Map<string, TextHideEvent> = new Map();

  for (const event of timeline) {
    if (event.type === 'text_show') {
      showEvents.set(event.annotation.id, event);
    } else if (event.type === 'text_hide') {
      hideEvents.set(event.annotationId, event);
    }
  }

  const result: Array<{
    annotation: TextAnnotation;
    showFrame: number;
    hideFrame: number | null;
  }> = [];

  for (const showEvent of showEvents.values()) {
    const hideEvent = hideEvents.get(showEvent.annotation.id);
    result.push({
      annotation: showEvent.annotation,
      showFrame: showEvent.frame,
      hideFrame: hideEvent?.frame ?? null,
    });
  }

  return result.sort((a, b) => a.showFrame - b.showFrame);
}
