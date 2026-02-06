import type { Field, TimelineEvent, FieldChangeEvent, FieldRevertEvent } from '../../data/types';

export interface FieldAtFrame {
  backgroundColor: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
}

export function getFieldAtFrame(
  baseField: Field,
  timeline: TimelineEvent[],
  currentFrame: number
): FieldAtFrame {
  // field_change / field_revert イベントを抽出
  const changeEvents: FieldChangeEvent[] = [];
  const revertEvents: FieldRevertEvent[] = [];

  for (const event of timeline) {
    if (event.type === 'field_change' && event.frame <= currentFrame) {
      changeEvents.push(event);
    } else if (event.type === 'field_revert' && event.frame <= currentFrame) {
      revertEvents.push(event);
    }
  }

  // アクティブな変更を特定（revert されていないもの）
  const revertedIds = new Set(revertEvents.map((r) => r.fieldChangeId));

  // 最後のアクティブな field_change を見つける（後勝ち）
  let activeChange: FieldChangeEvent | null = null;
  let activeRevert: FieldRevertEvent | null = null;

  // フレーム順にソートして最後のアクティブな変更を特定
  const sortedChanges = [...changeEvents].sort((a, b) => a.frame - b.frame);
  for (const change of sortedChanges) {
    if (!revertedIds.has(change.fieldChangeId)) {
      activeChange = change;
    }
  }

  // フェードアウト中の revert を検出
  for (const revert of revertEvents) {
    const fadeOut = revert.fadeOutDuration ?? 0;
    if (fadeOut > 0 && currentFrame < revert.frame + fadeOut) {
      // フェードアウト中 — 対応する change を見つける
      const matchingChange = changeEvents.find(
        (c) => c.fieldChangeId === revert.fieldChangeId
      );
      if (matchingChange) {
        activeRevert = revert;
        activeChange = matchingChange;
      }
    }
  }

  // ベースフィールドの状態
  const result: FieldAtFrame = {
    backgroundColor: baseField.backgroundColor,
    backgroundImage: baseField.backgroundImage,
    backgroundOpacity: baseField.backgroundOpacity,
  };

  if (!activeChange) return result;

  const override = activeChange.override;

  // フェードアウト中の場合
  if (activeRevert) {
    const fadeOut = activeRevert.fadeOutDuration ?? 0;
    const progress = Math.min(
      1,
      (currentFrame - activeRevert.frame) / Math.max(1, fadeOut)
    );
    // override → base に戻していく
    if (override.backgroundOpacity !== undefined) {
      const baseOpacity = baseField.backgroundOpacity ?? 0.5;
      result.backgroundOpacity =
        override.backgroundOpacity +
        (baseOpacity - override.backgroundOpacity) * progress;
    }
    if (override.backgroundColor !== undefined) {
      // 色のフェードは難しいので、進行率50%以上でベースに戻す
      result.backgroundColor =
        progress >= 0.5 ? baseField.backgroundColor : override.backgroundColor;
    }
    if (override.backgroundImage !== undefined) {
      result.backgroundImage =
        progress >= 0.5
          ? baseField.backgroundImage
          : override.backgroundImage;
    }
    return result;
  }

  // フェードイン中かどうか
  const fadeIn = activeChange.fadeInDuration ?? 0;
  if (fadeIn > 0 && currentFrame < activeChange.frame + fadeIn) {
    const progress = Math.min(
      1,
      (currentFrame - activeChange.frame) / Math.max(1, fadeIn)
    );
    // base → override に向かっていく
    if (override.backgroundOpacity !== undefined) {
      const baseOpacity = baseField.backgroundOpacity ?? 0.5;
      result.backgroundOpacity =
        baseOpacity +
        (override.backgroundOpacity - baseOpacity) * progress;
    }
    if (override.backgroundColor !== undefined) {
      result.backgroundColor =
        progress >= 0.5 ? override.backgroundColor : baseField.backgroundColor;
    }
    if (override.backgroundImage !== undefined) {
      result.backgroundImage =
        progress >= 0.5
          ? override.backgroundImage
          : baseField.backgroundImage;
    }
    return result;
  }

  // 完全にアクティブ
  if (override.backgroundColor !== undefined) {
    result.backgroundColor = override.backgroundColor;
  }
  if (override.backgroundImage !== undefined) {
    result.backgroundImage = override.backgroundImage;
  }
  if (override.backgroundOpacity !== undefined) {
    result.backgroundOpacity = override.backgroundOpacity;
  }

  return result;
}
