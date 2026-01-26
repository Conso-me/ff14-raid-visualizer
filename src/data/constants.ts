// ロール別の色
export const ROLE_COLORS = {
  T1: '#3753c7',
  T2: '#3753c7',
  H1: '#2c9c3c',
  H2: '#2c9c3c',
  D1: '#c73737',
  D2: '#c73737',
  D3: '#c73737',
  D4: '#c73737',
  // P1-P8: ログインポート時の汎用プレイヤー色
  P1: '#9966cc',
  P2: '#cc6699',
  P3: '#66cc99',
  P4: '#99cc66',
  P5: '#cc9966',
  P6: '#6699cc',
  P7: '#c9c966',
  P8: '#66c9c9',
} as const;

// マーカーの色
export const MARKER_COLORS = {
  A: '#ff0000',
  B: '#ffff00',
  C: '#0000ff',
  D: '#ff00ff',
  '1': '#ff0000',
  '2': '#ffff00',
  '3': '#0000ff',
  '4': '#ff00ff',
} as const;

// フィールドのデフォルト設定
export const FIELD_DEFAULTS = {
  backgroundColor: '#1a1a3e',
  screenSize: 800,
  gameSize: 40,
} as const;

// 画面のデフォルト背景色
export const SCREEN_BACKGROUND = '#0a0a1a';

// AoEのデフォルト色
export const AOE_COLORS = {
  danger: '#ff6600', // オレンジ（通常の危険範囲）
  safe: '#00ff00', // 緑（安全地帯表示用）
  stack: '#ffff00', // 黄（頭割り）
  spread: '#ff00ff', // 紫（散開）
} as const;

// AoEのデフォルト設定
export const AOE_DEFAULTS = {
  color: '#ff6600',
  opacity: 0.5,
} as const;

// デバフアイコンの仮色（アイコン画像がない場合）
export const DEBUFF_COLORS = {
  spread: '#ff00ff', // 散開
  stack: '#ffff00', // 頭割り
  fire: '#ff3300', // 炎
  ice: '#00ccff', // 氷
  lightning: '#cc00ff', // 雷
} as const;
