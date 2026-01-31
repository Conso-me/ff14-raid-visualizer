# Suggested Commands

## Development
```bash
# エディタを起動（開発用）
npm run dev:editor

# レンダーサーバーを起動
npm run dev:server

# エディタ＋サーバーを同時起動（推奨）
npm run dev:all

# Remotion Studioを起動
npm start
```

## Build & Export
```bash
# 動画をレンダリング（デフォルト）
npm run build

# エディタをビルド
npm run build:editor

# 特定コンポジションをレンダリング
npm run build:video      # SampleMechanic
npm run build:phase2     # RaidMechanicVideo
```

## Maintenance
```bash
# Remotionをアップグレード
npm run upgrade

# 依存関係をインストール
npm install
```

## System Utilities (Linux)
```bash
# ファイル検索
find . -name "*.ts" -o -name "*.tsx"
grep -r "pattern" src/

# プロセス確認
ps aux | grep node

# Git操作
git status
git add .
git commit -m "message"
git push
```

## Important Notes
- Node.js 18以上が必要
- ブラウザで http://localhost:3000 でエディタにアクセス
- 動画出力はRemotion Studio経由またはコマンドラインで実行
