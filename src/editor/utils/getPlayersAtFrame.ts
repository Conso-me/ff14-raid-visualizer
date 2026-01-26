import type { MechanicData, Player, MoveEvent, Position, TimelineEvent } from '../../data/types';

/**
 * 指定フレームでのプレイヤー位置を計算する
 */
export function getPlayersAtFrame(mechanic: MechanicData, frame: number): Player[] {
  return mechanic.initialPlayers.map(player => {
    const position = calculatePlayerPosition(player, mechanic.timeline, frame);
    return { ...player, position };
  });
}

/**
 * 特定プレイヤーの指定フレームでの位置を計算
 */
export function calculatePlayerPosition(
  player: Player,
  timeline: TimelineEvent[],
  currentFrame: number
): Position {
  // このプレイヤーの移動イベントを取得（フレーム順）
  const moveEvents = timeline
    .filter((e): e is MoveEvent => e.type === 'move' && e.targetId === player.id)
    .sort((a, b) => a.frame - b.frame);

  if (moveEvents.length === 0) {
    return player.position; // 移動イベントなし → 初期位置
  }

  let currentPosition = player.position;

  for (const event of moveEvents) {
    const eventEndFrame = event.frame + event.duration;

    if (currentFrame < event.frame) {
      // このイベントの開始前 → 現在位置を維持
      break;
    } else if (currentFrame >= eventEndFrame) {
      // このイベント完了後 → 移動先を現在位置に
      currentPosition = event.to;
    } else {
      // このイベントの途中 → 補間計算
      const progress = (currentFrame - event.frame) / event.duration;
      const easedProgress = applyEasing(progress, event.easing || 'linear');

      const fromPos = event.from ?? currentPosition;
      currentPosition = {
        x: lerp(fromPos.x, event.to.x, easedProgress),
        y: lerp(fromPos.y, event.to.y, easedProgress),
      };
      break; // 途中のイベントがあればそこで終了
    }
  }

  return currentPosition;
}

/**
 * 線形補間
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * イージング関数を適用
 * Remotion Skills timing.md 参照
 */
export function applyEasing(t: number, easing: string): number {
  switch (easing) {
    case 'linear':
      return t;
    case 'easeIn':
      return t * t;
    case 'easeOut':
      return 1 - (1 - t) * (1 - t);
    case 'easeInOut':
      return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
    default:
      return t;
  }
}

/**
 * 指定フレームでアクティブな移動イベントを取得
 * （フレームがイベント開始以降のもののうち最後のもの）
 */
export function findActiveMoveEvent(
  timeline: TimelineEvent[],
  playerId: string,
  frame: number
): MoveEvent | null {
  const moveEvents = timeline
    .filter((e): e is MoveEvent => e.type === 'move' && e.targetId === playerId)
    .sort((a, b) => a.frame - b.frame);

  let activeEvent: MoveEvent | null = null;

  for (const event of moveEvents) {
    if (frame >= event.frame) {
      activeEvent = event;
    } else {
      break;
    }
  }

  return activeEvent;
}

/**
 * プレイヤーの移動軌跡ポイントを取得
 */
export function getMovementPoints(
  player: Player,
  timeline: TimelineEvent[]
): Position[] {
  const moveEvents = timeline
    .filter((e): e is MoveEvent => e.type === 'move' && e.targetId === player.id)
    .sort((a, b) => a.frame - b.frame);

  if (moveEvents.length === 0) {
    return [player.position];
  }

  const points: Position[] = [player.position];
  moveEvents.forEach(event => {
    points.push(event.to);
  });

  return points;
}
