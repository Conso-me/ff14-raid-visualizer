import { useCurrentFrame, interpolate } from 'remotion';
import { Field } from './components/field/Field';
import { Player } from './components/player/Player';
import { FieldMarker } from './components/marker/FieldMarker';
import { SCREEN_BACKGROUND, FIELD_DEFAULTS } from './data/constants';
import { Role, Position, MarkerType } from './data/types';

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
  MT: MARKER_POSITIONS['A'], // 北
  ST: MARKER_POSITIONS['C'], // 南
  H1: MARKER_POSITIONS['4'], // 北西
  H2: MARKER_POSITIONS['2'], // 南東
  D1: MARKER_POSITIONS['D'], // 西
  D2: MARKER_POSITIONS['B'], // 東
  D3: MARKER_POSITIONS['1'], // 北東
  D4: MARKER_POSITIONS['3'], // 南西
};

// 初期位置（全員中央）
const INITIAL_POSITION: Position = { x: 0, y: 0 };

// 全ロールのリスト
const ALL_ROLES: Role[] = ['MT', 'ST', 'H1', 'H2', 'D1', 'D2', 'D3', 'D4'];

// 全マーカーのリスト
const ALL_MARKERS: MarkerType[] = ['A', 'B', 'C', 'D', '1', '2', '3', '4'];

export const RaidMechanicVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // プレイヤーの位置を計算（フレーム30-90で移動）
  const getPlayerPosition = (role: Role): Position => {
    const targetPos = SPREAD_POSITIONS[role];
    const x = interpolate(frame, [30, 90], [INITIAL_POSITION.x, targetPos.x], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const y = interpolate(frame, [30, 90], [INITIAL_POSITION.y, targetPos.y], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return { x, y };
  };

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

        {/* プレイヤー */}
        {ALL_ROLES.map((role) => (
          <Player key={role} role={role} position={getPlayerPosition(role)} />
        ))}
      </Field>
    </div>
  );
};
