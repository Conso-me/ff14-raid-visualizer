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

// ============================================
// タイムラインシステム
// ============================================

// タイムラインイベントの種類
export type TimelineEventType =
  | 'move' // プレイヤー/敵の移動
  | 'aoe_show' // AoE表示開始
  | 'aoe_hide' // AoE非表示
  | 'debuff_add' // デバフ付与
  | 'debuff_remove' // デバフ解除
  | 'text' // テキスト表示
  | 'cast' // 詠唱バー表示
  | 'boss_move'; // ボスの移動

// タイムラインイベント基底
export interface TimelineEventBase {
  id: string;
  type: TimelineEventType;
  frame: number; // 発生フレーム
}

// 移動イベント
export interface MoveEvent extends TimelineEventBase {
  type: 'move';
  targetId: string; // プレイヤーID
  from?: Position; // 省略時は現在位置から
  to: Position;
  duration: number; // フレーム数
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

// AoE表示イベント
export interface AoEShowEvent extends TimelineEventBase {
  type: 'aoe_show';
  aoe: AoE;
  fadeInDuration?: number; // フェードインのフレーム数
}

// AoE非表示イベント
export interface AoEHideEvent extends TimelineEventBase {
  type: 'aoe_hide';
  aoeId: string;
  fadeOutDuration?: number;
}

// デバフ付与イベント
export interface DebuffAddEvent extends TimelineEventBase {
  type: 'debuff_add';
  targetId: string; // プレイヤーID（'all'で全員）
  debuff: Omit<Debuff, 'startFrame'>; // startFrameは自動設定
}

// デバフ解除イベント
export interface DebuffRemoveEvent extends TimelineEventBase {
  type: 'debuff_remove';
  targetId: string;
  debuffId: string;
}

// ロール別テキスト
export interface RoleText {
  roles: Role[]; // 対象ロール（複数可）
  text: string;
}

// テキスト表示イベント
export interface TextEvent extends TimelineEventBase {
  type: 'text';
  textType: 'main' | 'role'; // 全体説明 or ロール別
  content: string | RoleText[];
  position: 'top' | 'bottom' | 'center';
  duration: number; // 表示フレーム数
  fadeIn?: number;
  fadeOut?: number;
}

// 詠唱バー表示イベント
export interface CastEvent extends TimelineEventBase {
  type: 'cast';
  casterId: string; // ボスID
  skillName: string;
  duration: number; // 詠唱時間（フレーム数）
}

// ボス移動イベント
export interface BossMoveEvent extends TimelineEventBase {
  type: 'boss_move';
  targetId: string;
  to: Position;
  duration: number;
  teleport?: boolean; // true: 瞬間移動
}

// 全イベント型
export type TimelineEvent =
  | MoveEvent
  | AoEShowEvent
  | AoEHideEvent
  | DebuffAddEvent
  | DebuffRemoveEvent
  | TextEvent
  | CastEvent
  | BossMoveEvent;

// 敵（ボス）
export interface Enemy {
  id: string;
  name: string;
  position: Position;
  size?: number; // 表示サイズ
  color?: string;
}

// ギミック全体の定義
export interface MechanicData {
  id: string;
  name: string;
  description: string;
  durationFrames: number; // 総フレーム数
  fps: number; // フレームレート
  field: Field;
  markers: FieldMarker[];
  initialPlayers: Player[];
  enemies: Enemy[];
  timeline: TimelineEvent[];
}

// ============================================
// UI表示用の状態型
// ============================================

// テキスト表示状態
export interface TextDisplay {
  id: string;
  textType: 'main' | 'role';
  content: string | RoleText[];
  position: 'top' | 'bottom' | 'center';
  opacity: number;
}

// 詠唱バー表示状態
export interface CastDisplay {
  id: string;
  casterId: string;
  skillName: string;
  progress: number; // 0-1
}

// AoE表示状態
export interface AoEDisplay extends AoE {
  opacity: number;
}
