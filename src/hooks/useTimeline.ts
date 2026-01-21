import { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { Easing } from 'remotion';
import {
  MechanicData,
  Player,
  Enemy,
  Position,
  Debuff,
  AoEDisplay,
  TextDisplay,
  CastDisplay,
  MoveEvent,
  AoEShowEvent,
  AoEHideEvent,
  DebuffAddEvent,
  TextEvent,
  CastEvent,
  BossMoveEvent,
} from '../data/types';
import { animatePosition, animateOpacity } from '../utils/animation';

// タイムラインの状態
export interface TimelineState {
  players: Player[];
  enemies: Enemy[];
  activeAoEs: AoEDisplay[];
  activeTexts: TextDisplay[];
  activeCasts: CastDisplay[];
}

// 内部で使用するAoE追跡用の型
interface AoETracker {
  aoe: AoEDisplay;
  showFrame: number;
  fadeIn: number;
  hideFrame?: number;
  fadeOut?: number;
}

// 内部で使用するテキスト追跡用の型
interface TextTracker {
  event: TextEvent;
  endFrame: number;
}

// 内部で使用する詠唱追跡用の型
interface CastTracker {
  event: CastEvent;
  endFrame: number;
}

// 移動イベント追跡用の型
interface MoveTracker {
  event: MoveEvent;
  fromPosition: Position;
}

// イージング関数を取得
function getEasingFunction(
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
): (t: number) => number {
  switch (easing) {
    case 'easeIn':
      return Easing.in(Easing.ease);
    case 'easeOut':
      return Easing.out(Easing.ease);
    case 'easeInOut':
      return Easing.inOut(Easing.ease);
    default:
      return Easing.linear;
  }
}

export function useTimeline(mechanic: MechanicData): TimelineState {
  const frame = useCurrentFrame();

  return useMemo(() => {
    // 初期状態をディープコピー
    const players: Player[] = mechanic.initialPlayers.map((p) => ({
      ...p,
      position: { ...p.position },
      debuffs: [],
    }));

    const enemies: Enemy[] = mechanic.enemies.map((e) => ({
      ...e,
      position: { ...e.position },
    }));

    // 各種トラッカー
    const aoeTrackers: Map<string, AoETracker> = new Map();
    const textTrackers: Map<string, TextTracker> = new Map();
    const castTrackers: Map<string, CastTracker> = new Map();
    const moveTrackers: Map<string, MoveTracker[]> = new Map();

    // プレイヤーIDから現在位置を取得するヘルパー
    const getPlayerPosition = (playerId: string): Position => {
      const player = players.find((p) => p.id === playerId);
      return player?.position ?? { x: 0, y: 0 };
    };

    // 敵IDから現在位置を取得するヘルパー
    const getEnemyPosition = (enemyId: string): Position => {
      const enemy = enemies.find((e) => e.id === enemyId);
      return enemy?.position ?? { x: 0, y: 0 };
    };

    // イベントを時系列順にソート
    const sortedEvents = [...mechanic.timeline].sort(
      (a, b) => a.frame - b.frame
    );

    // 全イベントを処理して状態を構築
    for (const event of sortedEvents) {
      // 未来のイベントはスキップ（ただしトラッカーへの登録は行う）
      switch (event.type) {
        case 'move': {
          const moveEvent = event as MoveEvent;
          const targetMoves = moveTrackers.get(moveEvent.targetId) ?? [];

          // このイベントがまだ開始されていない場合はfrom位置を記録
          if (event.frame <= frame) {
            const fromPos =
              moveEvent.from ?? getPlayerPosition(moveEvent.targetId);
            targetMoves.push({ event: moveEvent, fromPosition: fromPos });
            moveTrackers.set(moveEvent.targetId, targetMoves);
          } else if (event.frame > frame) {
            // 未来の移動イベントも登録しておく（from位置計算のため）
            const fromPos =
              moveEvent.from ?? getPlayerPosition(moveEvent.targetId);
            targetMoves.push({ event: moveEvent, fromPosition: fromPos });
            moveTrackers.set(moveEvent.targetId, targetMoves);
          }
          break;
        }

        case 'boss_move': {
          const bossEvent = event as BossMoveEvent;
          if (event.frame <= frame) {
            const enemy = enemies.find((e) => e.id === bossEvent.targetId);
            if (enemy) {
              if (bossEvent.teleport) {
                // 瞬間移動
                enemy.position = { ...bossEvent.to };
              } else {
                // アニメーション移動
                const endFrame = event.frame + bossEvent.duration;
                if (frame >= endFrame) {
                  enemy.position = { ...bossEvent.to };
                } else {
                  const fromPos = getEnemyPosition(bossEvent.targetId);
                  enemy.position = animatePosition(
                    frame,
                    event.frame,
                    endFrame,
                    fromPos,
                    bossEvent.to
                  );
                }
              }
            }
          }
          break;
        }

        case 'aoe_show': {
          const aoeEvent = event as AoEShowEvent;
          if (event.frame <= frame) {
            aoeTrackers.set(aoeEvent.aoe.id, {
              aoe: { ...aoeEvent.aoe, opacity: 0.5 },
              showFrame: event.frame,
              fadeIn: aoeEvent.fadeInDuration ?? 0,
            });
          }
          break;
        }

        case 'aoe_hide': {
          const hideEvent = event as AoEHideEvent;
          if (event.frame <= frame) {
            const tracker = aoeTrackers.get(hideEvent.aoeId);
            if (tracker) {
              tracker.hideFrame = event.frame;
              tracker.fadeOut = hideEvent.fadeOutDuration ?? 0;
            }
          }
          break;
        }

        case 'debuff_add': {
          const debuffEvent = event as DebuffAddEvent;
          if (event.frame <= frame) {
            const targetPlayers =
              debuffEvent.targetId === 'all'
                ? players
                : players.filter((p) => p.id === debuffEvent.targetId);

            for (const player of targetPlayers) {
              const debuff: Debuff = {
                ...debuffEvent.debuff,
                startFrame: event.frame,
              };
              player.debuffs = player.debuffs ?? [];
              // 同じIDのデバフがあれば上書き
              const existingIndex = player.debuffs.findIndex(
                (d) => d.id === debuff.id
              );
              if (existingIndex >= 0) {
                player.debuffs[existingIndex] = debuff;
              } else {
                player.debuffs.push(debuff);
              }
            }
          }
          break;
        }

        case 'debuff_remove': {
          if (event.frame <= frame) {
            const targetPlayers =
              event.targetId === 'all'
                ? players
                : players.filter((p) => p.id === event.targetId);

            for (const player of targetPlayers) {
              player.debuffs = (player.debuffs ?? []).filter(
                (d) => d.id !== event.debuffId
              );
            }
          }
          break;
        }

        case 'text': {
          const textEvent = event as TextEvent;
          textTrackers.set(event.id, {
            event: textEvent,
            endFrame: event.frame + textEvent.duration,
          });
          break;
        }

        case 'cast': {
          const castEvent = event as CastEvent;
          castTrackers.set(event.id, {
            event: castEvent,
            endFrame: event.frame + castEvent.duration,
          });
          break;
        }
      }
    }

    // プレイヤーの移動を計算
    for (const [playerId, moves] of moveTrackers) {
      const player = players.find((p) => p.id === playerId);
      if (!player) continue;

      // 現在のフレームに影響する移動を見つける
      let currentPos = player.position;

      for (const move of moves) {
        const endFrame = move.event.frame + move.event.duration;

        if (frame < move.event.frame) {
          // このmoveはまだ始まっていない
          continue;
        } else if (frame >= endFrame) {
          // このmoveは終了している
          currentPos = { ...move.event.to };
        } else {
          // このmoveは進行中
          currentPos = animatePosition(
            frame,
            move.event.frame,
            endFrame,
            move.fromPosition,
            move.event.to,
            getEasingFunction(move.event.easing)
          );
        }
      }

      player.position = currentPos;
    }

    // AoEの不透明度を計算
    const activeAoEs: AoEDisplay[] = [];
    for (const [, tracker] of aoeTrackers) {
      const { aoe, showFrame, fadeIn, hideFrame, fadeOut } = tracker;

      // 非表示フレームを過ぎたら表示しない
      if (hideFrame !== undefined && fadeOut !== undefined) {
        const fadeOutEnd = hideFrame + fadeOut;
        if (frame > fadeOutEnd) continue;
      }

      // 不透明度を計算
      let opacity = aoe.opacity ?? 0.5;

      // フェードイン
      if (fadeIn > 0 && frame < showFrame + fadeIn) {
        opacity = animateOpacity(
          frame,
          showFrame,
          fadeIn,
          showFrame + fadeIn + 1000, // 十分大きな値
          0,
          opacity
        );
      }

      // フェードアウト
      if (hideFrame !== undefined && fadeOut !== undefined && fadeOut > 0) {
        if (frame >= hideFrame) {
          const fadeOutEnd = hideFrame + fadeOut;
          opacity = animateOpacity(
            frame,
            hideFrame - fadeOut, // ダミー
            0,
            fadeOutEnd,
            fadeOut,
            opacity
          );
        }
      }

      if (opacity > 0) {
        activeAoEs.push({ ...aoe, opacity });
      }
    }

    // テキストの不透明度を計算
    const activeTexts: TextDisplay[] = [];
    for (const [, tracker] of textTrackers) {
      const { event, endFrame } = tracker;

      if (frame < event.frame || frame > endFrame) continue;

      const fadeIn = event.fadeIn ?? 0;
      const fadeOut = event.fadeOut ?? 0;

      const opacity = animateOpacity(
        frame,
        event.frame,
        fadeIn,
        endFrame,
        fadeOut,
        1
      );

      if (opacity > 0) {
        activeTexts.push({
          id: event.id,
          textType: event.textType,
          content: event.content,
          position: event.position,
          opacity,
        });
      }
    }

    // 詠唱バーの進捗を計算
    const activeCasts: CastDisplay[] = [];
    for (const [, tracker] of castTrackers) {
      const { event, endFrame } = tracker;

      if (frame < event.frame || frame > endFrame) continue;

      const progress = (frame - event.frame) / event.duration;

      activeCasts.push({
        id: event.id,
        casterId: event.casterId,
        skillName: event.skillName,
        progress: Math.min(1, Math.max(0, progress)),
      });
    }

    return {
      players,
      enemies,
      activeAoEs,
      activeTexts,
      activeCasts,
    };
  }, [mechanic, frame]);
}
