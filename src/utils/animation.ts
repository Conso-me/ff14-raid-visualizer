import { interpolate, Easing } from 'remotion';
import { Position } from '../data/types';

/**
 * 位置のアニメーション
 */
export function animatePosition(
  frame: number,
  startFrame: number,
  endFrame: number,
  from: Position,
  to: Position,
  easing: (t: number) => number = Easing.inOut(Easing.ease)
): Position {
  const x = interpolate(frame, [startFrame, endFrame], [from.x, to.x], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
  const y = interpolate(frame, [startFrame, endFrame], [from.y, to.y], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
  return { x, y };
}

/**
 * フェードイン/アウト付きの不透明度アニメーション
 */
export function animateOpacity(
  frame: number,
  startFrame: number,
  fadeInDuration: number,
  endFrame: number,
  fadeOutDuration: number,
  maxOpacity: number = 1
): number {
  // 表示前
  if (frame < startFrame) {
    return 0;
  }
  // 表示後
  if (frame > endFrame) {
    return 0;
  }
  // フェードイン
  if (frame < startFrame + fadeInDuration) {
    return interpolate(
      frame,
      [startFrame, startFrame + fadeInDuration],
      [0, maxOpacity],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );
  }
  // フェードアウト
  if (frame > endFrame - fadeOutDuration) {
    return interpolate(
      frame,
      [endFrame - fadeOutDuration, endFrame],
      [maxOpacity, 0],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );
  }
  return maxOpacity;
}

/**
 * 点滅アニメーション（デバフ残り時間が少ない時など）
 */
export function animateBlink(
  frame: number,
  startFrame: number,
  blinkSpeed: number = 10 // フレーム数で1サイクル
): number {
  const elapsed = frame - startFrame;
  return Math.abs(Math.sin((elapsed / blinkSpeed) * Math.PI));
}

/**
 * 値のアニメーション（汎用）
 */
export function animateValue(
  frame: number,
  startFrame: number,
  endFrame: number,
  from: number,
  to: number,
  easing: (t: number) => number = Easing.linear
): number {
  return interpolate(frame, [startFrame, endFrame], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}
