// 座標（フィールド中心が原点）
export interface Position {
  x: number; // -20 ~ 20 (ゲーム内座標)
  y: number; // -20 ~ 20
}

// ロール定義
export type Role = 'MT' | 'ST' | 'H1' | 'H2' | 'D1' | 'D2' | 'D3' | 'D4';

// プレイヤー
export interface Player {
  id: string;
  role: Role;
  job?: string;
  name?: string;
  position: Position;
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
