import type { TimelineEvent, FieldChangeEvent, FieldRevertEvent, FieldOverride } from '../../data/types';

export interface FieldChangeEventPair {
  fieldChangeId: string;
  override: FieldOverride;
  changeFrame: number;
  revertFrame: number | null;
  fadeInDuration: number;
  fadeOutDuration: number;
}

/**
 * Get all field_change/field_revert event pairs from timeline
 */
export function getFieldChangeEventPairs(timeline: TimelineEvent[]): FieldChangeEventPair[] {
  const changeEvents: Map<string, FieldChangeEvent> = new Map();
  const revertEvents: Map<string, FieldRevertEvent> = new Map();

  for (const event of timeline) {
    if (event.type === 'field_change') {
      changeEvents.set(event.fieldChangeId, event);
    } else if (event.type === 'field_revert') {
      revertEvents.set(event.fieldChangeId, event);
    }
  }

  const result: FieldChangeEventPair[] = [];

  for (const changeEvent of changeEvents.values()) {
    const revertEvent = revertEvents.get(changeEvent.fieldChangeId);
    result.push({
      fieldChangeId: changeEvent.fieldChangeId,
      override: changeEvent.override,
      changeFrame: changeEvent.frame,
      revertFrame: revertEvent?.frame ?? null,
      fadeInDuration: changeEvent.fadeInDuration || 0,
      fadeOutDuration: revertEvent?.fadeOutDuration || 0,
    });
  }

  return result.sort((a, b) => a.changeFrame - b.changeFrame);
}
