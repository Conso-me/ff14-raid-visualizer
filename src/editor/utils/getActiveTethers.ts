import type {
  Tether,
  TetherDisplay,
  TimelineEvent,
  TetherShowEvent,
  TetherHideEvent,
  TetherUpdateEvent,
  MechanicData,
  Position,
  Player,
  Enemy,
  GimmickObject,
  MoveEvent,
  BossMoveEvent,
  ObjectShowEvent,
  ObjectHideEvent,
} from '../../data/types';

interface TetherState extends Tether {
  showFrame: number;
  fadeInDuration: number;
  hideFrame?: number;
  fadeOutDuration?: number;
}

/**
 * Get active tethers at a specific frame with calculated opacity,
 * resolved positions, and distance-based color.
 */
export function getActiveTethers(
  timeline: TimelineEvent[],
  currentFrame: number,
  mechanic: MechanicData
): TetherDisplay[] {
  const tetherStates: Map<string, TetherState> = new Map();

  // Build current entity positions
  const players: Player[] = mechanic.initialPlayers.map((p) => ({
    ...p,
    position: { ...p.position },
  }));

  const enemies: Enemy[] = mechanic.enemies.map((e) => ({
    ...e,
    position: { ...e.position },
  }));

  const activeObjects: Map<string, GimmickObject> = new Map();

  const getPlayerPosition = (playerId: string): Position | null => {
    const player = players.find((p) => p.id === playerId);
    return player?.position ?? null;
  };

  const getEnemyPosition = (enemyId: string): Position | null => {
    const enemy = enemies.find((e) => e.id === enemyId);
    return enemy?.position ?? null;
  };

  const getObjectPosition = (objectId: string): Position | null => {
    const obj = activeObjects.get(objectId);
    return obj?.position ?? null;
  };

  const getEndpointPosition = (
    endpointType: Tether['sourceType'],
    endpointId: string
  ): Position | null => {
    switch (endpointType) {
      case 'player':
        return getPlayerPosition(endpointId);
      case 'enemy':
        return getEnemyPosition(endpointId);
      case 'object':
        return getObjectPosition(endpointId);
      default:
        return null;
    }
  };

  const sortedEvents = [...timeline].sort((a, b) => a.frame - b.frame);

  for (const event of sortedEvents) {
    if (event.frame > currentFrame) break;

    switch (event.type) {
      case 'move': {
        const moveEvent = event as MoveEvent;
        const player = players.find((p) => p.id === moveEvent.targetId);
        if (player) {
          player.position = { ...moveEvent.to };
        }
        break;
      }

      case 'boss_move': {
        const bossEvent = event as BossMoveEvent;
        const enemy = enemies.find((e) => e.id === bossEvent.targetId);
        if (enemy) {
          enemy.position = { ...bossEvent.to };
        }
        break;
      }

      case 'object_show': {
        const objEvent = event as ObjectShowEvent;
        activeObjects.set(objEvent.object.id, { ...objEvent.object });
        break;
      }

      case 'object_hide': {
        const objEvent = event as ObjectHideEvent;
        activeObjects.delete(objEvent.objectId);
        break;
      }

      case 'tether_show': {
        const showEvent = event as TetherShowEvent;
        tetherStates.set(showEvent.tether.id, {
          ...showEvent.tether,
          showFrame: event.frame,
          fadeInDuration: showEvent.fadeInDuration || 0,
        });
        break;
      }

      case 'tether_hide': {
        const hideEvent = event as TetherHideEvent;
        const state = tetherStates.get(hideEvent.tetherId);
        if (state) {
          state.hideFrame = event.frame;
          state.fadeOutDuration = hideEvent.fadeOutDuration || 0;
        }
        break;
      }

      case 'tether_update': {
        const updateEvent = event as TetherUpdateEvent;
        const state = tetherStates.get(updateEvent.tetherId);
        if (state) {
          if (updateEvent.sourceType !== undefined) state.sourceType = updateEvent.sourceType;
          if (updateEvent.sourceId !== undefined) state.sourceId = updateEvent.sourceId;
          if (updateEvent.targetType !== undefined) state.targetType = updateEvent.targetType;
          if (updateEvent.targetId !== undefined) state.targetId = updateEvent.targetId;
          if (updateEvent.color !== undefined) state.color = updateEvent.color;
          if (updateEvent.colorBeyondThreshold !== undefined) state.colorBeyondThreshold = updateEvent.colorBeyondThreshold;
        }
        break;
      }
    }
  }

  const result: TetherDisplay[] = [];

  for (const tether of tetherStates.values()) {
    let opacity = 1;

    // Check if fade out is complete
    if (tether.hideFrame !== undefined) {
      const fadeOutEnd = tether.hideFrame + (tether.fadeOutDuration || 0);
      if (currentFrame >= fadeOutEnd) {
        continue;
      }
    }

    // Calculate fade in
    if (tether.fadeInDuration > 0) {
      const fadeInEnd = tether.showFrame + tether.fadeInDuration;
      if (currentFrame < fadeInEnd) {
        const progress = (currentFrame - tether.showFrame) / tether.fadeInDuration;
        opacity *= Math.max(0, Math.min(1, progress));
      }
    }

    // Calculate fade out
    if (
      tether.hideFrame !== undefined &&
      tether.fadeOutDuration !== undefined &&
      tether.fadeOutDuration > 0
    ) {
      if (currentFrame >= tether.hideFrame) {
        const progress = (currentFrame - tether.hideFrame) / tether.fadeOutDuration;
        opacity *= Math.max(0, 1 - progress);
      }
    }

    // Resolve positions
    const sourcePosition = getEndpointPosition(tether.sourceType, tether.sourceId);
    const targetPosition = getEndpointPosition(tether.targetType, tether.targetId);

    if (!sourcePosition || !targetPosition) continue;

    // Calculate distance-based color
    let currentColor = tether.color;
    if (tether.distanceThreshold && tether.colorBeyondThreshold) {
      const dx = targetPosition.x - sourcePosition.x;
      const dy = targetPosition.y - sourcePosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > tether.distanceThreshold) {
        currentColor = tether.colorBeyondThreshold;
      }
    }

    result.push({
      id: tether.id,
      name: tether.name,
      sourceType: tether.sourceType,
      sourceId: tether.sourceId,
      targetType: tether.targetType,
      targetId: tether.targetId,
      color: tether.color,
      lineStyle: tether.lineStyle,
      width: tether.width,
      distanceThreshold: tether.distanceThreshold,
      colorBeyondThreshold: tether.colorBeyondThreshold,
      currentOpacity: opacity,
      sourcePosition,
      targetPosition,
      currentColor,
    });
  }

  return result;
}

/**
 * Get all tether events (show/hide pairs) from timeline.
 */
export function getTetherEventPairs(
  timeline: TimelineEvent[]
): Array<{
  tether: Tether;
  showFrame: number;
  fadeInDuration: number;
  hideFrame: number | null;
  fadeOutDuration: number;
}> {
  const showEvents: Map<string, TetherShowEvent> = new Map();
  const hideEvents: Map<string, TetherHideEvent> = new Map();

  for (const event of timeline) {
    if (event.type === 'tether_show') {
      showEvents.set((event as TetherShowEvent).tether.id, event as TetherShowEvent);
    } else if (event.type === 'tether_hide') {
      hideEvents.set((event as TetherHideEvent).tetherId, event as TetherHideEvent);
    }
  }

  const result: Array<{
    tether: Tether;
    showFrame: number;
    fadeInDuration: number;
    hideFrame: number | null;
    fadeOutDuration: number;
  }> = [];

  for (const showEvent of showEvents.values()) {
    const hideEvent = hideEvents.get(showEvent.tether.id);
    result.push({
      tether: showEvent.tether,
      showFrame: showEvent.frame,
      fadeInDuration: showEvent.fadeInDuration || 0,
      hideFrame: hideEvent?.frame ?? null,
      fadeOutDuration: hideEvent?.fadeOutDuration || 0,
    });
  }

  return result.sort((a, b) => a.showFrame - b.showFrame);
}
