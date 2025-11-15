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
- ビルド時にデータを事前処理し、JSONとして最適化
- データをtar.gz形式で圧縮管理（127MB → 15MB、約88%削減）
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
│   │   │   ├── SpendingTopList.tsx
│   │   │   ├── SpendingTimeSeriesChart.tsx
│   │   │   └── ...
│   │   ├── SankeyChartNivo.tsx
│   │   ├── SankeyNodeDetailModal.tsx
│   │   └── ...
│   ├── hooks/                     # カスタムReactフック
│   └── lib/                       # クライアント用ユーティリティ
│       ├── spendingLoader.ts      # 支出先データローダー
│       ├── formatBudget.ts        # 金額フォーマット
│       └── ...
├── server/                        # サーバーサイドロジック
│   ├── lib/                       # サーバー用ユーティリティ
│   ├── loaders/                   # データローダー
│   └── repositories/              # データリポジトリ
│       ├── json-repository.ts     # JSON データアクセス
│       └── csv-repository.ts      # CSV データアクセス
├── types/                         # TypeScript型定義
│   ├── sankey.ts                  # サンキー図関連の型
│   ├── report.ts                  # レポート関連の型
│   └── rs-system.ts               # 行政事業レビューの型
├── scripts/                       # ビルド・前処理スクリプト
│   └── preprocess-data.ts         # データ前処理スクリプト
├── public/                        # 静的ファイル
│   └── data/                      # 事前処理済みJSONデータ
│       ├── year_2014/
│       │   ├── sankey-main.json
│       │   ├── project-spendings.json
│       │   └── statistics.json
│       └── ...
├── data/                          # 元データ（CSVファイル）
│   └── rs_system/
└── docs/                          # ドキュメント
```

## セットアップ手順

**前提条件**: Node.js 18以上

**インストール**:
```bash
git clone https://github.com/igomuni/marumie-gov.git
cd marumie-gov
npm install
npm run extract-data   # データ展開（public_data.tar.gz → public/data/）
npm run dev            # 開発サーバー起動
```

**利用可能なコマンド**:
```bash
npm run dev            # 開発サーバー起動（http://localhost:3000）
npm run build          # 本番ビルド（データ展開 + ビルド）
npm start              # 本番サーバー起動
npm run lint           # ESLint実行
npm run typecheck      # TypeScriptの型チェック
npm run extract-data   # データ展開のみ実行
npm run preprocess     # データ前処理（開発用）
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
