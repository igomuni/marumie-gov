# 行政事業レビュー サンキー図可視化アプリ

## プロジェクト説明

このプロジェクトは、日本の行政事業レビュー公開データをサンキー図で可視化するWebアプリケーションです。予算から執行までの資金フローを直感的に理解できるよう設計されています。

## 主要機能

**サンキー図可視化機能**
- 府省庁から支出先への資金流れを視覚化
- インタラクティブなモーダルで詳細情報を表示
- 2014年度から2024年度のデータに対応
- ドリルダウン機能で段階的な分析が可能

**事業レポート機能**
- 12,573事業の検索・閲覧 - 事業名と府省庁による絞り込み検索
- 年度別の予算・執行額推移グラフ
- 支出先Top10リスト表示

**パフォーマンス最適化**
- ビルド時にデータを事前処理し、JSONとして最適化（80MB→112KB、約700倍の削減）
- クライアント側での動的データロード

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| データ可視化 | @nivo/sankey, Recharts |
| 検索機能 | Fuse.js（ファジー検索） |

## ディレクトリ構造

```
marumie-gov/
├── app/                           # Next.js App Router
│   ├── [year]/                    # 年度別サンキー図ページ
│   ├── reports/                   # 事業レポート
│   │   └── [projectKey]/          # 事業詳細ページ
│   ├── layout.tsx                 # ルートレイアウト
│   └── page.tsx                   # トップページ
├── client/                        # クライアントコンポーネント
│   ├── components/                # UIコンポーネント
│   │   ├── reports/               # レポート関連コンポーネント
│   │   ├── SankeyChartNivo.tsx
│   │   ├── SankeyChartNivoWithSettings.tsx
│   │   └── ...
│   ├── hooks/                     # カスタムReactフック
│   └── lib/                       # クライアント用ユーティリティ
├── server/                        # サーバーサイドロジック
│   ├── lib/                       # サーバー用ユーティリティ
│   ├── loaders/                   # データローダー
│   └── repositories/              # データリポジトリ
├── types/                         # TypeScript型定義
├── scripts/                       # ビルド・前処理スクリプト
├── public/                        # 静的ファイル
└── docs/                          # ドキュメント
```

## セットアップ手順

**前提条件**: Node.js 18以上

**インストール**:
```bash
git clone https://github.com/igomuni/marumie-gov.git
cd marumie-gov
npm install
npm run download-data  # データ取得
npm run dev            # 開発サーバー起動
```

**利用可能なコマンド**:
```bash
npm run dev            # 開発サーバー起動（http://localhost:3000）
npm run build          # 本番ビルド（データダウンロード含む）
npm start              # 本番サーバー起動
npm run lint           # ESLint実行
npm run typecheck      # TypeScriptの型チェック
npm run preprocess     # データ前処理のみ実行
npm run download-data  # データダウンロードのみ実行
```

## 使用方法

**サンキー図表示**: トップページから年度を選択し、資金フローを確認。ノードをクリックで詳細情報を表示。

**事業レポート**: `/reports` ページで12,573事業を検索・閲覧。事業詳細ページで予算推移と支出先情報を確認。

## データソース

- [行政事業レビュー](https://www.gyoukaku.go.jp/)
- [RS System Pipeline](https://github.com/igomuni/rs_system_pipeline) - データ変換パイプライン

## デプロイ

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/igomuni/marumie-gov)

### 手動デプロイ

1. ビルドを実行
2. `.next` ディレクトリと `data` ディレクトリをサーバーにアップロード
3. `npm run start` でサーバーを起動

## 参考プロジェクト

- [みらいまる見え政治資金](https://github.com/igomuni/marumie) - 政治資金のサンキー図可視化

## ライセンス

MIT
