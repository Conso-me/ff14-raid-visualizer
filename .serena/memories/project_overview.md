# FF14 Raid Visualizer - Project Overview

## Purpose
FF14（ファイナルファンタジー14）のレイドギミックを視覚的に表現・解説するためのツールです。Remotionを使用して動画を生成し、ブラウザベースのエディタでギミックを編集できます。

## Tech Stack
- **React** (v19.2.3) - UIフレームワーク
- **TypeScript** (v5.9.3) - 型安全な開発
- **Remotion** (v4.0.407) - React動画生成
- **Vite** (v7.3.1) - 開発サーバー・ビルド
- **Tailwind CSS** (v3.4.19) - スタイリング
- **Express** - レンダーサーバー

## Project Structure
```
src/
├── components/          # 描画コンポーネント
│   ├── aoe/            # AoE描画（円形、扇形、直線、ドーナツ、十字）
│   ├── debuff/         # デバフアイコン
│   ├── enemy/          # 敵描画
│   ├── field/          # フィールド描画
│   ├── marker/         # マーカー描画
│   ├── player/         # プレイヤー描画（8人パーティ対応）
│   └── ui/             # UI要素
├── compositions/        # Remotion用コンポジション
├── data/               # 型定義・サンプルデータ・定数
├── editor/             # エディタ関連
│   ├── components/     # エディタUI
│   ├── context/        # React Context
│   └── hooks/          # カスタムフック
├── parser/             # FFLogsパーサー
├── server/             # レンダーサーバー
├── hooks/              # 共通フック
└── utils/              # 共通ユーティリティ

Entry Points:
- src/index.ts          # メインエントリーポイント
- src/Root.tsx          # Remotionルート
- src/RaidMechanicVideo.tsx  # メイン動画コンポーネント
```

## Key Features
- 8人パーティ表示（T1/T2/H1/H2/D1/D2/D3/D4）
- 複数のAoE形状（円形、扇形、直線、ドーナツ、十字）
- デバフシステム
- タイムラインエディタ
- FFLogsインポート（実験的）
- 動画エクスポート（MP4）
