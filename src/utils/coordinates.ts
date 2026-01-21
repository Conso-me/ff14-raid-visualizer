import { Position } from '../data/types';

/**
 * ゲーム内座標（中心0,0、範囲-20~20）を画面座標に変換する
 * @param gamePos ゲーム内座標
 * @param fieldSize フィールドのゲーム内サイズ（例: 40）
 * @param screenSize 画面上のピクセルサイズ（例: 800）
 * @returns 画面座標（左上が原点）
 */
export function gameToScreen(
  gamePos: Position,
  fieldSize: number,
  screenSize: number
): Position {
  const scale = screenSize / fieldSize;
  const halfScreen = screenSize / 2;

  return {
    x: gamePos.x * scale + halfScreen,
    y: gamePos.y * scale + halfScreen,
  };
}

/**
 * 画面座標をゲーム内座標に変換する
 * @param screenPos 画面座標
 * @param fieldSize フィールドのゲーム内サイズ
 * @param screenSize 画面上のピクセルサイズ
 * @returns ゲーム内座標
 */
export function screenToGame(
  screenPos: Position,
  fieldSize: number,
  screenSize: number
): Position {
  const scale = screenSize / fieldSize;
  const halfScreen = screenSize / 2;

  return {
    x: (screenPos.x - halfScreen) / scale,
    y: (screenPos.y - halfScreen) / scale,
  };
}

/**
 * 極座標をゲーム内座標に変換する
 * @param angle 角度（度数法、北が0度、時計回り）
 * @param distance 中心からの距離
 * @returns ゲーム内座標
 */
export function polarToGame(angle: number, distance: number): Position {
  // 北が0度、時計回りなので、数学座標系に変換
  // 数学: 東が0度、反時計回り
  // ゲーム: 北が0度、時計回り
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: Math.cos(radians) * distance,
    y: Math.sin(radians) * distance,
  };
}
