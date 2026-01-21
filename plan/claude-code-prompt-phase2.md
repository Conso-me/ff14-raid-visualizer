# FF14 Raid Mechanic Visualizer - Phase 2

## 目標
AoE（攻撃範囲）とデバフ表示システムを実装し、アニメーション機能を追加する。

## 作業ディレクトリ
/home/consommex/projects/ff14-raid-visualizer

---

## タスク

### 1. 型定義の追加 (src/data/types.ts)

```typescript
// AoE（攻撃範囲）
interface AoE {
  id: string;
  type: 'circle' | 'cone' | 'line' | 'donut' | 'cross';
  position: Position;
  // 共通
  color?: string;        // デフォルト: オレンジ
  opacity?: number;      // デフォルト: 0.5
  // circle用
  radius?: number;
  // donut用
  innerRadius?: number;
  outerRadius?: number;
  // cone（扇形）用
  angle?: number;        // 扇の角度（度）
  direction?: number;    // 扇の向き（度、北=0、時計回り）
  length?: number;       // 扇の半径
  // line（直線）用
  width?: number;
  // lineLength?: number; // lengthを共用
  // cross（十字）用
  armWidth?: number;
  armLength?: number;
}

// デバフ
interface Debuff {
  id: string;
  name: string;
  iconUrl?: string;      // アイコン画像パス
  color?: string;        // アイコンがない場合の背景色
  duration: number;      // 総持続時間（秒）
  startFrame: number;    // 付与されたフレーム
}

// プレイヤーにデバフを追加
interface Player {
  id: string;
  role: Role;
  job?: string;
  name?: string;
  position: Position;
  debuffs?: Debuff[];    // 追加
}
```

### 2. AoEコンポーネント作成

#### 2-1. CircleAoE (src/components/aoe/CircleAoE.tsx)
円形の攻撃範囲。ボスの足元やプレイヤー中心の範囲攻撃に使用。

Props:
- `position`: Position - 中心座標
- `radius`: number - 半径（ゲーム内座標単位）
- `color`: string - 色（デフォルト: '#ff6600'）
- `opacity`: number - 不透明度（デフォルト: 0.5）
- `fieldSize`: number - フィールドサイズ（座標変換用）
- `screenSize`: number - 画面上のフィールドサイズ

見た目:
- 半透明の塗りつぶし円
- 外周に少し濃い枠線

#### 2-2. ConeAoE (src/components/aoe/ConeAoE.tsx)
扇形の攻撃範囲。前方範囲攻撃などに使用。

Props:
- `position`: Position - 頂点（発生源）座標
- `angle`: number - 扇の角度（度、例: 90で90度の扇）
- `direction`: number - 扇の向き（度、北=0、時計回り）
- `length`: number - 扇の半径
- `color`, `opacity`, `fieldSize`, `screenSize`

実装ヒント:
- SVGの `<path>` で arc を描画
- `d` 属性: `M 中心 L 始点 A rx ry 0 large-arc sweep 終点 Z`

#### 2-3. LineAoE (src/components/aoe/LineAoE.tsx)
直線の攻撃範囲。ビームや突進攻撃に使用。

Props:
- `position`: Position - 始点座標
- `direction`: number - 向き（度）
- `length`: number - 長さ
- `width`: number - 幅
- `color`, `opacity`, `fieldSize`, `screenSize`

実装:
- 回転した長方形として描画
- SVGの `<rect>` + `transform="rotate(...)"`

#### 2-4. DonutAoE (src/components/aoe/DonutAoE.tsx)
ドーナツ型の攻撃範囲。内側が安全地帯になるタイプ。

Props:
- `position`: Position - 中心座標
- `innerRadius`: number - 内側半径（安全地帯）
- `outerRadius`: number - 外側半径
- `color`, `opacity`, `fieldSize`, `screenSize`

実装:
- 2つの円のパスで穴あき円を作成
- SVGの `<path>` with `fill-rule="evenodd"`

#### 2-5. CrossAoE (src/components/aoe/CrossAoE.tsx)
十字型の攻撃範囲。

Props:
- `position`: Position - 中心座標
- `armWidth`: number - 腕の幅
- `armLength`: number - 腕の長さ
- `rotation`: number - 回転角度（度、デフォルト: 0）
- `color`, `opacity`, `fieldSize`, `screenSize`

実装:
- 2つの長方形を十字に配置
- 回転オプション対応

#### 2-6. AoE統合コンポーネント (src/components/aoe/AoE.tsx)
typeに応じて適切なコンポーネントを返すラッパー。

```typescript
export const AoE: React.FC<AoEProps> = (props) => {
  switch (props.type) {
    case 'circle': return <CircleAoE {...props} />;
    case 'cone': return <ConeAoE {...props} />;
    case 'line': return <LineAoE {...props} />;
    case 'donut': return <DonutAoE {...props} />;
    case 'cross': return <CrossAoE {...props} />;
  }
};
```

### 3. デバフ表示コンポーネント

#### 3-1. DebuffIcon (src/components/debuff/DebuffIcon.tsx)
デバフアイコン + 残り時間表示。

Props:
- `debuff`: Debuff
- `currentFrame`: number - 現在のフレーム
- `fps`: number - フレームレート（30）

表示:
- 20x20px程度のアイコン
- アイコン下部に残り時間（秒、小数点1桁）
- 残り時間が少なくなると点滅

実装:
```typescript
const elapsedFrames = currentFrame - debuff.startFrame;
const elapsedSeconds = elapsedFrames / fps;
const remainingSeconds = Math.max(0, debuff.duration - elapsedSeconds);
```

#### 3-2. DebuffList (src/components/debuff/DebuffList.tsx)
プレイヤーに付与されているデバフ一覧。

Props:
- `debuffs`: Debuff[]
- `currentFrame`: number
- `fps`: number

表示:
- 横並びでデバフアイコンを表示
- プレイヤーアイコンの右上あたりに配置

### 4. Playerコンポーネントの拡張

Player.tsxを修正してデバフ表示を統合:
- propsに `debuffs` と `currentFrame` を追加
- プレイヤーアイコンの近くにDebuffListを表示

### 5. アニメーションユーティリティ (src/utils/animation.ts)

```typescript
import { interpolate, Easing } from 'remotion';

// 移動アニメーション
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

// フェードイン/アウト
export function animateOpacity(
  frame: number,
  startFrame: number,
  fadeInDuration: number,
  endFrame: number,
  fadeOutDuration: number,
  maxOpacity: number = 1
): number {
  // フェードイン
  if (frame < startFrame + fadeInDuration) {
    return interpolate(frame, [startFrame, startFrame + fadeInDuration], [0, maxOpacity], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }
  // フェードアウト
  if (frame > endFrame - fadeOutDuration) {
    return interpolate(frame, [endFrame - fadeOutDuration, endFrame], [maxOpacity, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }
  return maxOpacity;
}

// 点滅（デバフ残り時間が少ない時など）
export function animateBlink(
  frame: number,
  startFrame: number,
  blinkSpeed: number = 10 // フレーム数で1サイクル
): number {
  const elapsed = frame - startFrame;
  return Math.abs(Math.sin((elapsed / blinkSpeed) * Math.PI));
}
```

### 6. サンプル動画の更新

Phase 1のサンプルを拡張して、以下を追加:

#### シナリオ: 「散開 → 頭割り」

1. **フレーム0-30（0-1秒）**: 
   - 8人が中央に集合
   - 全員に「散開デバフ」（仮）が付与（持続時間3秒）

2. **フレーム30-90（1-3秒）**:
   - 各自が散開位置へ移動
   - デバフの残り時間がカウントダウン

3. **フレーム90（3秒時点）**:
   - デバフ発動 → 各プレイヤー位置に円形AoE出現
   - AoEはフェードインして表示（15フレームかけて）

4. **フレーム90-120（3-4秒）**:
   - 円形AoEが表示された状態を維持
   - 散開成功を示す

5. **フレーム120-150（4-5秒）**:
   - AoEがフェードアウト
   - プレイヤーは散開位置を維持

### 7. 定数追加 (src/data/constants.ts)

```typescript
// AoEのデフォルト色
export const AOE_COLORS = {
  danger: '#ff6600',      // オレンジ（通常の危険範囲）
  safe: '#00ff00',        // 緑（安全地帯表示用）
  stack: '#ffff00',       // 黄（頭割り）
  spread: '#ff00ff',      // 紫（散開）
} as const;

// デバフアイコンの仮色（アイコン画像がない場合）
export const DEBUFF_COLORS = {
  spread: '#ff00ff',      // 散開
  stack: '#ffff00',       // 頭割り
  fire: '#ff3300',        // 炎
  ice: '#00ccff',         // 氷
  lightning: '#cc00ff',   // 雷
} as const;
```

---

## 完成イメージ

```
┌─────────────────────────────────────────────┐
│                                             │
│        [A]                                  │
│         ●MT (散開 2.5s)                     │
│                                             │
│   [4]         ┌─────┐         [1]          │
│    ●H1        │     │          ●D3         │
│               │ ◆ボス│                      │
│   [D]         │     │         [B]          │
│    ●D1        └─────┘          ●D2         │
│                                             │
│   [3]                         [2]          │
│    ●D4                         ●H2         │
│                                             │
│        [C]                                  │
│         ●ST                                 │
│                                             │
└─────────────────────────────────────────────┘

※ 各プレイヤーの横にデバフアイコン+残り時間を表示
※ 3秒後、各プレイヤー位置にオレンジの円形AoEが出現
```

---

## チェックリスト

- [ ] AoEコンポーネント5種類（circle, cone, line, donut, cross）
- [ ] DebuffIcon, DebuffListコンポーネント
- [ ] Playerにデバフ表示を統合
- [ ] アニメーションユーティリティ
- [ ] サンプル動画更新（散開ギミック）
- [ ] 各コンポーネントの動作確認

---

## 参考: SVGでの扇形（cone）描画

```typescript
// 扇形のパスを生成
function createConeArcPath(
  cx: number, cy: number,  // 中心座標（画面座標）
  radius: number,          // 半径（ピクセル）
  startAngle: number,      // 開始角度（ラジアン）
  endAngle: number         // 終了角度（ラジアン）
): string {
  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy + radius * Math.sin(endAngle);
  
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
  
  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
}
```
