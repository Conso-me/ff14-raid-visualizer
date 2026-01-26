import { useCurrentFrame } from 'remotion';
import { Field } from './components/field/Field';
import { Player } from './components/player/Player';
import { FieldMarker } from './components/marker/FieldMarker';
import { CircleAoE } from './components/aoe/CircleAoE';
import {
  SCREEN_BACKGROUND,
  FIELD_DEFAULTS,
  AOE_COLORS,
  DEBUFF_COLORS,
} from './data/constants';
import { Role, Position, MarkerType, Debuff } from './data/types';
import { animatePosition, animateOpacity } from './utils/animation';

// マーカーの位置
const MARKER_POSITIONS: Record<MarkerType, Position> = {
  A: { x: 0, y: -15 }, // 北
  B: { x: 15, y: 0 }, // 東
  C: { x: 0, y: 15 }, // 南
  D: { x: -15, y: 0 }, // 西
  '1': { x: 10, y: -10 }, // 北東
  '2': { x: 10, y: 10 }, // 南東
  '3': { x: -10, y: 10 }, // 南西
  '4': { x: -10, y: -10 }, // 北西
};

// プレイヤーの散開位置（ロールごとのマーカー割り当て）
const SPREAD_POSITIONS: Record<Role, Position> = {
  T1: MARKER_POSITIONS['A'], // 北
  T2: MARKER_POSITIONS['C'], // 南
  H1: MARKER_POSITIONS['4'], // 北西
  H2: MARKER_POSITIONS['2'], // 南東
  D1: MARKER_POSITIONS['D'], // 西
  D2: MARKER_POSITIONS['B'], // 東
  D3: MARKER_POSITIONS['1'], // 北東
  D4: MARKER_POSITIONS['3'], // 南西
  // P1-P8: ログインポート時の汎用プレイヤー用
  P1: MARKER_POSITIONS['A'], P2: MARKER_POSITIONS['C'],
  P3: MARKER_POSITIONS['4'], P4: MARKER_POSITIONS['2'],
  P5: MARKER_POSITIONS['D'], P6: MARKER_POSITIONS['B'],
  P7: MARKER_POSITIONS['1'], P8: MARKER_POSITIONS['3'],
};

// 初期位置（全員中央）
const INITIAL_POSITION: Position = { x: 0, y: 0 };

// 全ロールのリスト
const ALL_ROLES: Role[] = ['T1', 'T2', 'H1', 'H2', 'D1', 'D2', 'D3', 'D4'];

// 全マーカーのリスト
const ALL_MARKERS: MarkerType[] = ['A', 'B', 'C', 'D', '1', '2', '3', '4'];

// タイムライン定数
const FPS = 30;
const DEBUFF_START_FRAME = 0; // デバフ付与開始
const DEBUFF_DURATION = 3; // デバフ持続時間（秒）
const MOVE_START_FRAME = 30; // 移動開始
const MOVE_END_FRAME = 90; // 移動終了
const AOE_START_FRAME = 90; // AoE出現
const AOE_END_FRAME = 150; // AoE消滅
const AOE_FADE_DURATION = 15; // フェードイン/アウトのフレーム数

// 散開デバフを生成
const createSpreadDebuff = (role: Role): Debuff => ({
  id: `spread-${role}`,
  name: '散開',
  color: DEBUFF_COLORS.spread,
  duration: DEBUFF_DURATION,
  startFrame: DEBUFF_START_FRAME,
});

export const RaidMechanicVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // プレイヤーの位置を計算
  const getPlayerPosition = (role: Role): Position => {
    return animatePosition(
      frame,
      MOVE_START_FRAME,
      MOVE_END_FRAME,
      INITIAL_POSITION,
      SPREAD_POSITIONS[role]
    );
  };

  // AoEの不透明度を計算
  const aoeOpacity = animateOpacity(
    frame,
    AOE_START_FRAME,
    AOE_FADE_DURATION,
    AOE_END_FRAME,
    AOE_FADE_DURATION,
    0.6
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: SCREEN_BACKGROUND,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Field
        type="circle"
        size={FIELD_DEFAULTS.gameSize}
        screenSize={FIELD_DEFAULTS.screenSize}
        gridEnabled={true}
      >
        {/* マーカー */}
        {ALL_MARKERS.map((marker) => (
          <FieldMarker
            key={marker}
            type={marker}
            position={MARKER_POSITIONS[marker]}
          />
        ))}

        {/* AoE（散開発動後） */}
        {frame >= AOE_START_FRAME &&
          ALL_ROLES.map((role) => (
            <CircleAoE
              key={`aoe-${role}`}
              position={SPREAD_POSITIONS[role]}
              radius={5}
              color={AOE_COLORS.spread}
              opacity={aoeOpacity}
            />
          ))}

        {/* プレイヤー */}
        {ALL_ROLES.map((role) => (
          <Player
            key={role}
            role={role}
            position={getPlayerPosition(role)}
            debuffs={[createSpreadDebuff(role)]}
            currentFrame={frame}
            fps={FPS}
          />
        ))}
      </Field>
    </div>
  );
};
