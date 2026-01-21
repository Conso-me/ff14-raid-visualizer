// 座標（フィールド中心が原点）
export interface Position {
  x: number; // -20 ~ 20 (ゲーム内座標)
  y: number; // -20 ~ 20
}

// ロール定義
export type Role = 'MT' | 'ST' | 'H1' | 'H2' | 'D1' | 'D2' | 'D3' | 'D4';

// デバフ
export interface Debuff {
  id: string;
  name: string;
  iconUrl?: string; // アイコン画像パス
  color?: string; // アイコンがない場合の背景色
  duration: number; // 総持続時間（秒）
  startFrame: number; // 付与されたフレーム
}

// プレイヤー
export interface Player {
  id: string;
  role: Role;
  job?: string;
  name?: string;
  position: Position;
  debuffs?: Debuff[]; // デバフ一覧
}

// AoE（攻撃範囲）の種類
export type AoEType = 'circle' | 'cone' | 'line' | 'donut' | 'cross';

// AoE（攻撃範囲）
export interface AoE {
  id: string;
  type: AoEType;
  position: Position;
  // 共通
  color?: string; // デフォルト: オレンジ
  opacity?: number; // デフォルト: 0.5
  // circle用
  radius?: number;
  // donut用
  innerRadius?: number;
  outerRadius?: number;
  // cone（扇形）用
  angle?: number; // 扇の角度（度）
  direction?: number; // 扇の向き（度、北=0、時計回り）
  length?: number; // 扇の半径
  // line（直線）用
  width?: number;
  // cross（十字）用
  armWidth?: number;
  armLength?: number;
  rotation?: number; // 回転角度（度）
}

// フィールド
export interface Field {
  type: 'circle' | 'square' | 'polygon';
  size: number; // 直径 or 辺の長さ
  backgroundColor: string;
  gridEnabled: boolean;
}

// フィールドマーカー
export type MarkerType = 'A' | 'B' | 'C' | 'D' | '1' | '2' | '3' | '4';
export interface FieldMarker {
  type: MarkerType;
  position: Position;
}
