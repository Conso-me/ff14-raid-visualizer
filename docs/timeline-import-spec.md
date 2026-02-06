# FF14 Raid Visualizer - タイムラインインポート仕様

## 概要

タイムラインインポート機能は、テキスト / CSV / TSV / JSON 形式のデータを読み込み、レイド動画のタイムラインイベントに変換する。インポート時にプレイヤー8人（T1,T2,H1,H2,D1,D2,D3,D4）とボスが未配置であれば自動的に配置される。

---

## 入力形式

### 1. テキスト形式（最も簡易）

タイムスタンプのない行はフェーズ名、`MM:SS イベント名` の行がイベントになる。空行でフェーズ区切り。すべて `text` タイプとしてインポートされる。

```
フェーズ1
00:10 ギガフレア
00:15 メガフレア
00:25 AA

フェーズ2
01:00 ダイヤモンドダスト
01:05 ヘヴンリーストライク
```

### 2. CSV 形式

ヘッダー行が必須。`time` と `name` カラムは必須。

```csv
time,name,type,shape,radius,source,count,duration,color,target
00:10,ギガフレア,cast
00:15,散開AoE,aoe_show,circle,3,player,8,2
00:30,ブレス,aoe_show,cone,,boss,,,#ff0000
01:00,タワー,object_show,circle,2,,,,#00ff00
```

### 3. TSV 形式

CSV と同じだがタブ区切り。

### 4. JSON 形式

オブジェクトの配列。

```json
[
  {"time": "00:10", "name": "ギガフレア", "type": "cast"},
  {"time": 15, "name": "散開AoE", "shape": "circle", "radius": 3, "source": "player", "count": 8, "duration": 2},
  {"time": "01:00", "name": "タワー", "type": "object_show", "shape": "circle", "size": 2, "color": "#00ff00", "x": 5, "y": -5, "duration": 10}
]
```

---

## 共通フィールド

| フィールド | 別名 | 型 | 必須 | 説明 |
|---|---|---|---|---|
| `time` | `timestamp`, `t` | `string` (MM:SS) or `number` (秒) | Yes | イベント発生時間 |
| `name` | `event`, `title`, `text` | `string` | Yes | イベント名 |
| `type` | `event_type`, `kind` | `string` | No | イベントタイプ（省略時: `text`） |

### 時間形式

- `"01:30"` — 1分30秒（MM:SS形式）
- `90` — 90秒（数値）
- `"90"` — 90秒（文字列の数値）

---

## イベントタイプ一覧

| type | 説明 | 生成されるイベント |
|---|---|---|
| `text` | テキスト表示 | 画面中央に3秒間テキスト表示 |
| `cast` | 詠唱バー表示 | ボスの詠唱バーを3秒間表示 |
| `aoe_show` | AoE表示 | AoE表示 + 自動的にhideイベントも生成 |
| `debuff_add` | デバフ付与 | 全員にデバフ付与 |
| `object_show` | オブジェクト表示 | オブジェクト表示 + 自動的にhideイベントも生成 |
| `move` | 移動 | （default処理: textとして表示） |
| `boss_move` | ボス移動 | （default処理: textとして表示） |
| `text_show` | テキスト注釈表示 | （default処理: textとして表示） |
| `text_hide` | テキスト注釈非表示 | （default処理: textとして表示） |
| `object_hide` | オブジェクト非表示 | （default処理: textとして表示） |
| `debuff_remove` | デバフ解除 | （default処理: textとして表示） |

### 自動判定

- `shape` フィールドがAoE形状（circle, cone, line, donut, cross）を含み、かつ `type` が `object_show` / `object_hide` でない場合、自動的に `aoe_show` として扱われる。

---

## AoE パラメータ（type: aoe_show）

`shape` フィールドがあるか、`type: "aoe_show"` を指定すると AoE イベントになる。自動的に `aoe_hide` イベントも `duration` 秒後に生成される。

### 共通

| フィールド | 型 | デフォルト | 説明 |
|---|---|---|---|
| `shape` | `string` | `circle` | AoE形状: `circle`, `cone`, `line`, `donut`, `cross` |
| `source` | `string` | `fixed` | 起点: `fixed`(固定), `boss`(ボス), `player`(プレイヤー), `object`(オブジェクト) |
| `count` | `number` | `1` | AoE個数（source=playerの場合、各プレイヤーに自動割り振り） |
| `duration` | `number` | `2` | 表示秒数 |
| `color` | `string` | `#ff6600` | AoE色（CSS色指定） |
| `target` | `string` | （自動） | 対象プレイヤーロール名（例: `T1`）。source=playerで未指定時はT1,T2,H1,H2,D1,D2,D3,D4順に自動割り振り |

### 形状別パラメータ

#### circle（円形）

| フィールド | デフォルト | 説明 |
|---|---|---|
| `radius` | `5` | 半径 |

#### cone（扇形）

| フィールド | デフォルト | 説明 |
|---|---|---|
| `angle` | `90` | 扇の角度（度） |
| `direction` | `0` | 扇の向き（度、北=0、時計回り） |
| `length` | `15` | 扇の半径 |

#### line（直線）

| フィールド | デフォルト | 説明 |
|---|---|---|
| `width` | `4` | 幅 |
| `length` | `20` | 長さ |
| `direction` | `0` | 向き（度、北=0、時計回り） |

#### donut（ドーナツ）

| フィールド | デフォルト | 説明 |
|---|---|---|
| `inner_radius` | `5` | 内円半径 |
| `outer_radius` | `12` | 外円半径 |

#### cross（十字）

| フィールド | デフォルト | 説明 |
|---|---|---|
| `width` | `4` | 腕の幅 |
| `length` | `20` | 腕の長さ |

---

## オブジェクトパラメータ（type: object_show）

フィールド上にオブジェクト（タワー、結晶、隕石等）を表示する。自動的に `object_hide` イベントも `duration` 秒後に生成される。

| フィールド | 型 | デフォルト | 説明 |
|---|---|---|---|
| `shape` | `string` | `circle` | オブジェクト形状: `circle`, `square`, `triangle`, `diamond` |
| `size` | `number` | `2` | 表示サイズ |
| `color` | `string` | `#ffcc00` | 色（CSS色指定） |
| `icon` | `string` | — | アイコン（任意） |
| `x` | `number` | `0` | X座標 |
| `y` | `number` | `0` | Y座標（北がマイナス） |
| `duration` | `number` | `5` | 表示秒数 |

---

## 座標系

- 中央が `(0, 0)`
- X: 右がプラス、左がマイナス
- Y: 下（南）がプラス、上（北）がマイナス
- フィールドサイズはデフォルト40（-20〜+20）

---

## インポート時の自動処理

1. **プレイヤー自動配置**: 未配置の場合、8人を基本散開位置に自動配置
   - T1(0,-8), T2(0,8), H1(-8,0), H2(8,0), D1(-6,6), D2(6,6), D3(-6,-6), D4(6,-6)
2. **ボス自動配置**: 未配置の場合、中央(0,0)に "Boss" を配置
3. **オブジェクト事前生成**: `object_show` イベントは他のイベントより先にタイムラインに追加される
4. **時間リベース**: 最初のイベントが 0:00 になるようオフセット調整される

---

## 使用例

### 基本（テキスト形式）

```
P1: ダイヤモンドダスト
00:10 ダイヤモンドダスト（詠唱）
00:15 ヘヴンリーストライク
00:20 散開

P2: 光の暴走
01:00 光の暴走（詠唱）
01:10 塔踏み
```

### AoE付き（JSON形式）

```json
[
  {"time": "00:10", "name": "ダイヤモンドダスト", "type": "cast"},
  {"time": "00:15", "name": "頭割り", "shape": "circle", "radius": 4, "source": "player", "target": "T1", "duration": 3, "color": "#3366ff"},
  {"time": "00:15", "name": "散開AoE", "shape": "circle", "radius": 3, "source": "player", "count": 8, "duration": 2},
  {"time": "00:20", "name": "前方扇", "shape": "cone", "angle": 120, "source": "boss", "duration": 2},
  {"time": "00:25", "name": "直線AoE", "shape": "line", "width": 6, "length": 40, "direction": 90, "duration": 2},
  {"time": "00:30", "name": "ドーナツ", "shape": "donut", "inner_radius": 4, "outer_radius": 15, "source": "boss", "duration": 3}
]
```

### AoE付き（CSV形式）

```csv
time,name,type,shape,radius,source,count,duration,color,angle,direction,length,width,inner_radius,outer_radius,target
00:10,ダイヤモンドダスト,cast
00:15,頭割り,,circle,4,player,,,#3366ff,,,,,,T1
00:15,散開AoE,,circle,3,player,8,2
00:20,前方扇,,cone,,,boss,,,,120,,,,
00:25,直線AoE,,line,,,,,,,,,40,6,,
00:30,ドーナツ,,donut,,,,3,,,,,,4,15,
```

### オブジェクト付き（JSON形式）

```json
[
  {"time": "00:05", "name": "塔A", "type": "object_show", "shape": "circle", "size": 2, "color": "#00ccff", "x": -8, "y": -8, "duration": 10},
  {"time": "00:05", "name": "塔B", "type": "object_show", "shape": "circle", "size": 2, "color": "#00ccff", "x": 8, "y": -8, "duration": 10},
  {"time": "00:10", "name": "ギガフレア", "type": "cast"},
  {"time": "00:12", "name": "散開AoE", "shape": "circle", "radius": 3, "source": "player", "count": 8, "duration": 2}
]
```
