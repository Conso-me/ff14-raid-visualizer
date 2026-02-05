# CLAUDE.md

## コミュニケーション

- ユーザーへの返答は必ず日本語で行うこと

## プロジェクト概要

FF14レイドギミック可視化ツール。React 19 + TypeScript + Vite + Remotion構成。
エディタでギミックを作成し、プレビュー・動画出力が可能。

## 主要コマンド

- `npm run dev:editor` — エディタVite開発サーバー
- `npm run build` — エディタ本番ビルド（`npx vite build`）
- `npx tsc --noEmit` — 型チェック
- `npm run dev:all` — エディタ＋サーバー同時起動

## プロジェクト構造

- `src/editor/` — エディタUI（React）
  - `components/` — UI部品（ObjectListPanel, TimelinePanel, PropertyPanel, PreviewModal, WebRenderDialog等）
  - `context/` — EditorContext（状態管理）, LanguageContext（i18n）
  - `hooks/` — useAutoSave, useKeyboardShortcuts, useWebRenderer, usePreviewRecorder
  - `i18n/` — ja.ts, en.ts, types.ts（多言語対応）
- `src/components/` — レンダリング用コンポーネント（AoE, Player, Enemy, Field, Marker等）
- `src/data/types.ts` — 全データ型定義（MechanicData, Player, AoE, TimelineEvent等）
- `src/RaidMechanicVideo.tsx` — Remotion動画コンポーネント

## 実装原則

### レンダリングコンテキストの一貫性

表示・非表示やビジュアル関連の機能を実装する際は、必ず**3つすべてのレンダリングコンテキスト**に反映すること：
1. **エディタビュー** — `src/editor/components/FieldEditor.tsx`
2. **プレビューモード** — `src/editor/components/PreviewModal.tsx` → `RaidMechanicVideo.tsx`
3. **動画・ブラウザ出力** — `src/editor/components/WebRenderDialog.tsx` → `useWebRenderer.ts`

エディタだけに実装して他のコンテキストを漏らさないこと。

### パネル横断の機能反映

ObjectListPanelなどリスト系の機能を実装する際は、関連するすべてのパネル・出力に反映すること：
- ObjectListPanel, PropertyPanel, TimelinePanel, プレビュー, エクスポート

## i18n ガイドライン

- 翻訳キーの型は `DeepStringify<typeof ja>` を使用する（`src/editor/i18n/types.ts`参照）
- `typeof ja` を直接 en.ts の型として使わない
- ja.ts にキーを追加したら、en.ts にも対応する英語翻訳を追加すること
- 翻訳ファイル変更後は `npx tsc --noEmit` で型チェックを実行する
- 翻訳キーはコンポーネント単位でネスト（例: `editor.objectList.xxx`）
- `t('key')` でドット記法アクセス、`{{name}}` でパラメータ補間

## コーディング規約

- 型定義は `src/data/types.ts` に集約
- 座標はゲーム内座標系（-20〜20）を使用、`src/utils/coordinates.ts` で変換
- 状態管理は `EditorContext` + `editorReducer`（Undo/Redo対応）
