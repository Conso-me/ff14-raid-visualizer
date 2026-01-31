import type {
  AoE,
  TimelineEvent,
  AoEShowEvent,
  AoEHideEvent,
  MechanicData,
  Position,
  Player,
  Enemy,
  GimmickObject,
  Debuff,
  AoESourceType,
  AoETrackingMode,
  MoveEvent,
  BossMoveEvent,
  ObjectShowEvent,
  ObjectHideEvent,
  DebuffAddEvent,
  DebuffRemoveEvent,
} from '../../data/types';

export interface ActiveAoE extends AoE {
  currentOpacity: number;
}

interface AoEState extends AoE {
  showFrame: number;
  fadeInDuration: number;
  hideFrame?: number;
  fadeOutDuration?: number;
  fixedPosition?: Position;
  placementFrame?: number;
}

// 2点間の角度を計算（度、北=0、時計回り）
function calculateDirection(from: Position, to: Position): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  // dyとdxを入れ替え、符号を反転して北基準・時計回りに
  const angleRad = Math.atan2(dx, -dy);
  const angleDeg = (angleRad * 180) / Math.PI;
  return angleDeg;
}

/**
 * Get active AoEs at a specific frame with calculated opacity
 * based on fade in/out animations
 */
export function getActiveAoEs(
  timeline: TimelineEvent[],
  currentFrame: number,
  mechanic: MechanicData
): ActiveAoE[] {
  const aoeStates: Map<string, AoEState> = new Map();

  // 現在の状態を構築するためのコピー
  const players: Player[] = mechanic.initialPlayers.map((p) => ({
    ...p,
    position: { ...p.position },
    debuffs: [],
  }));

  const enemies: Enemy[] = mechanic.enemies.map((e) => ({
    ...e,
    position: { ...e.position },
  }));

  const activeObjects: Map<string, GimmickObject> = new Map();

  // イベントを時系列順にソート
  const sortedEvents = [...timeline].sort((a, b) => a.frame - b.frame);

  // ヘルパー関数: プレイヤー位置を取得
  const getPlayerPosition = (playerId: string): Position | null => {
    const player = players.find((p) => p.id === playerId);
    return player?.position ?? null;
  };

  // ヘルパー関数: 敵位置を取得
  const getEnemyPosition = (enemyId: string): Position | null => {
    const enemy = enemies.find((e) => e.id === enemyId);
    return enemy?.position ?? null;
  };

  // ヘルパー関数: オブジェクト位置を取得
  const getObjectPosition = (objectId: string): Position | null => {
    const obj = activeObjects.get(objectId);
    return obj?.position ?? null;
  };

  // ヘルパー関数: デバフ保持者の位置を取得
  const getDebuffHolderPosition = (debuffId: string): Position | null => {
    for (const player of players) {
      const hasDebuff = player.debuffs?.some((d) => d.id === debuffId);
      if (hasDebuff) {
        return player.position;
      }
    }
    return null;
  };

  // Process all events up to and including current frame
  for (const event of sortedEvents) {
    // 状態更新イベントを処理
    switch (event.type) {
      case 'move': {
        const moveEvent = event as MoveEvent;
        if (event.frame <= currentFrame) {
          const player = players.find((p) => p.id === moveEvent.targetId);
          if (player) {
            player.position = { ...moveEvent.to };
          }
        }
        break;
      }

      case 'boss_move': {
        const bossEvent = event as BossMoveEvent;
        if (event.frame <= currentFrame) {
          const enemy = enemies.find((e) => e.id === bossEvent.targetId);
          if (enemy) {
            enemy.position = { ...bossEvent.to };
          }
        }
        break;
      }

      case 'object_show': {
        const objEvent = event as ObjectShowEvent;
        if (event.frame <= currentFrame) {
          activeObjects.set(objEvent.object.id, { ...objEvent.object });
        }
        break;
      }

      case 'object_hide': {
        const objEvent = event as ObjectHideEvent;
        if (event.frame <= currentFrame) {
          activeObjects.delete(objEvent.objectId);
        }
        break;
      }

      case 'debuff_add': {
        const debuffEvent = event as DebuffAddEvent;
        if (event.frame <= currentFrame) {
          if (debuffEvent.targetId === 'all') {
            players.forEach((p) => {
              if (!p.debuffs) p.debuffs = [];
              p.debuffs.push({
                ...debuffEvent.debuff,
                startFrame: event.frame,
              });
            });
          } else {
            const player = players.find((p) => p.id === debuffEvent.targetId);
            if (player) {
              if (!player.debuffs) player.debuffs = [];
              player.debuffs.push({
                ...debuffEvent.debuff,
                startFrame: event.frame,
              });
            }
          }
        }
        break;
      }

      case 'debuff_remove': {
        const debuffEvent = event as DebuffRemoveEvent;
        if (event.frame <= currentFrame) {
          players.forEach((p) => {
            if (p.debuffs) {
              p.debuffs = p.debuffs.filter((d) => d.id !== debuffEvent.debuffId);
            }
          });
        }
        break;
      }

      case 'aoe_show': {
        const aoeEvent = event as AoEShowEvent;
        if (event.frame <= currentFrame) {
          const aoe = aoeEvent.aoe;
          const placementDelay = aoe.placementDelay ?? 0;
          const trackingMode = aoe.trackingMode ?? 'static';

          // 設置型の場合は設置時の位置を固定
          let fixedPosition: Position | undefined;
          let placementFrame: number | undefined;

          if (trackingMode === 'static' && placementDelay > 0) {
            // placementDelay後に設置
            placementFrame = event.frame + placementDelay;
            if (currentFrame >= placementFrame) {
              // 設置済み: 設置時のソース位置を記録
              const sourceType = aoe.sourceType ?? 'fixed';
              const offset = aoe.offsetFromSource ?? { x: 0, y: 0 };
              let sourcePos: Position | null = null;

              switch (sourceType) {
                case 'boss':
                  if (aoe.sourceId) {
                    sourcePos = getEnemyPosition(aoe.sourceId);
                  }
                  break;
                case 'object':
                  if (aoe.sourceId) {
                    sourcePos = getObjectPosition(aoe.sourceId);
                  }
                  break;
                case 'player':
                  if (aoe.sourceId) {
                    sourcePos = getPlayerPosition(aoe.sourceId);
                  }
                  break;
                case 'debuff':
                  if (aoe.sourceDebuffId) {
                    sourcePos = getDebuffHolderPosition(aoe.sourceDebuffId);
                  }
                  break;
              }

              if (sourcePos) {
                fixedPosition = {
                  x: sourcePos.x + offset.x,
                  y: sourcePos.y + offset.y,
                };
              }
            }
          }

          aoeStates.set(aoe.id, {
            ...aoe,
            showFrame: event.frame,
            fadeInDuration: aoeEvent.fadeInDuration || 0,
            fixedPosition,
            placementFrame,
          });
        }
        break;
      }

      case 'aoe_hide': {
        const aoe = aoeStates.get((event as AoEHideEvent).aoeId);
        if (aoe && event.frame <= currentFrame) {
          aoe.hideFrame = event.frame;
          aoe.fadeOutDuration = (event as AoEHideEvent).fadeOutDuration || 0;
        }
        break;
      }
    }
  }

  // Calculate current opacity and position for each AoE
  const result: ActiveAoE[] = [];

  for (const aoe of aoeStates.values()) {
    let opacity = aoe.opacity || 0.5;

    // Check if fade out is complete
    if (aoe.hideFrame !== undefined) {
      const fadeOutEnd = aoe.hideFrame + (aoe.fadeOutDuration || 0);
      if (currentFrame >= fadeOutEnd) {
        continue;
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
    if (
      aoe.hideFrame !== undefined &&
      aoe.fadeOutDuration !== undefined &&
      aoe.fadeOutDuration > 0
    ) {
      if (currentFrame >= aoe.hideFrame) {
        const progress = (currentFrame - aoe.hideFrame) / aoe.fadeOutDuration;
        opacity *= Math.max(0, 1 - progress);
      }
    }

    // 位置と方向を計算
    let finalPosition: Position;
    let finalDirection = aoe.direction;

    const sourceType = aoe.sourceType ?? 'fixed';
    const trackingMode = aoe.trackingMode ?? 'static';

    // 方向自動計算モード（line/coneタイプでautoDirectionが有効な場合）
    if (
      aoe.autoDirection &&
      (aoe.type === 'line' || aoe.type === 'cone')
    ) {
      const offset = aoe.offsetFromSource ?? { x: 0, y: 0 };
      let sourcePos: Position | null = null;

      // 起点位置を取得
      if (sourceType !== 'fixed') {
        switch (sourceType) {
          case 'boss':
            if (aoe.sourceId) {
              sourcePos = getEnemyPosition(aoe.sourceId);
            }
            break;
          case 'object':
            if (aoe.sourceId) {
              sourcePos = getObjectPosition(aoe.sourceId);
            }
            break;
          case 'player':
            if (aoe.sourceId) {
              sourcePos = getPlayerPosition(aoe.sourceId);
            }
            break;
          case 'debuff':
            if (aoe.sourceDebuffId) {
              sourcePos = getDebuffHolderPosition(aoe.sourceDebuffId);
            }
            break;
        }
      }

      // 位置をソースの位置に設定
      if (sourcePos) {
        finalPosition = {
          x: sourcePos.x + offset.x,
          y: sourcePos.y + offset.y,
        };
      } else {
        finalPosition = aoe.position;
      }

      // ターゲット位置を取得して方向を計算
      let targetPos: Position | null = null;
      if (aoe.targetPlayerId) {
        targetPos = getPlayerPosition(aoe.targetPlayerId);
      }

      // 起点とターゲットが両方存在する場合、方向を計算
      if (sourcePos && targetPos) {
        finalDirection = calculateDirection(sourcePos, targetPos);
      }
    } else if (trackingMode === 'static' && aoe.fixedPosition) {
      // 設置型: 設置時の位置を使用
      finalPosition = aoe.fixedPosition;
    } else if (trackingMode === 'track_source') {
      // ソース追従: ソースの現在位置を使用
      const offset = aoe.offsetFromSource ?? { x: 0, y: 0 };
      let sourcePos: Position | null = null;

      switch (sourceType) {
        case 'boss':
          if (aoe.sourceId) {
            sourcePos = getEnemyPosition(aoe.sourceId);
          }
          break;
        case 'object':
          if (aoe.sourceId) {
            sourcePos = getObjectPosition(aoe.sourceId);
          }
          break;
        case 'player':
          if (aoe.sourceId) {
            sourcePos = getPlayerPosition(aoe.sourceId);
          }
          break;
        case 'debuff':
          if (aoe.sourceDebuffId) {
            sourcePos = getDebuffHolderPosition(aoe.sourceDebuffId);
          }
          break;
      }

      if (sourcePos) {
        finalPosition = {
          x: sourcePos.x + offset.x,
          y: sourcePos.y + offset.y,
        };
      } else {
        finalPosition = aoe.position;
      }
    } else if (trackingMode === 'track_target' && aoe.targetPlayerId) {
      // ターゲット追従: ターゲットプレイヤーの位置を追従
      const targetPos = getPlayerPosition(aoe.targetPlayerId);
      finalPosition = targetPos ?? aoe.position;
    } else {
      // デフォルト: 保存されている位置
      finalPosition = aoe.position;
    }

    result.push({
      ...aoe,
      position: finalPosition,
      currentOpacity: opacity,
      ...(finalDirection !== undefined && { direction: finalDirection }),
    });
  }

  return result;
}

/**
 * Get all AoE events (show/hide pairs) from timeline
 * Returns an array of AoE information including timing
 */
export function getAoEEventPairs(
  timeline: TimelineEvent[]
): Array<{
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
