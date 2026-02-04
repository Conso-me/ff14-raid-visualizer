import type { MechanicData } from '../../data/types';

/**
 * hiddenObjectIds に基づいて MechanicData から非表示オブジェクトを除外する。
 * 複合キー `${objectType}:${id}` で判定。
 */
export function filterHiddenObjects(
  mechanic: MechanicData,
  hiddenObjectIds: string[]
): MechanicData {
  if (hiddenObjectIds.length === 0) return mechanic;

  const hiddenSet = new Set(hiddenObjectIds);
  const isHidden = (id: string, type: string) => hiddenSet.has(`${type}:${id}`);

  return {
    ...mechanic,
    initialPlayers: mechanic.initialPlayers.filter(p => !isHidden(p.id, 'player')),
    enemies: mechanic.enemies.filter(e => !isHidden(e.id, 'enemy')),
    markers: mechanic.markers.filter(m => !isHidden(m.type, 'marker')),
    timeline: mechanic.timeline.filter(event => {
      switch (event.type) {
        case 'move':
          return !isHidden(event.targetId, 'player');
        case 'aoe_show':
          return !isHidden(event.aoe.id, 'aoe');
        case 'aoe_hide':
          return !isHidden(event.aoeId, 'aoe');
        case 'debuff_add':
          return !isHidden(event.targetId, 'player');
        case 'debuff_remove':
          return !isHidden(event.targetId, 'player');
        case 'text_show':
          return !isHidden(event.annotation.id, 'text');
        case 'text_hide':
          return !isHidden(event.annotationId, 'text');
        case 'object_show':
          return !isHidden(event.object.id, 'object');
        case 'object_hide':
          return !isHidden(event.objectId, 'object');
        default:
          return true;
      }
    }),
  };
}
