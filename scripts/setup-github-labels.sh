#!/bin/bash

# GitHub リポジトリのラベルを一括作成するスクリプト
# 使用方法: ./scripts/setup-github-labels.sh

REPO="igomuni/marumie-gov"

echo "Creating labels for $REPO..."

# 種類
gh label create "bug" --repo $REPO --color "d73a4a" --description "バグや不具合" --force
gh label create "enhancement" --repo $REPO --color "a2eeef" --description "新機能や改善" --force
gh label create "task" --repo $REPO --color "0e8a16" --description "開発タスク" --force
gh label create "documentation" --repo $REPO --color "0075ca" --description "ドキュメント関連" --force
gh label create "refactoring" --repo $REPO --color "fbca04" --description "リファクタリング" --force

# 優先度
gh label create "priority/high" --repo $REPO --color "b60205" --description "優先度：高" --force
gh label create "priority/medium" --repo $REPO --color "fbca04" --description "優先度：中" --force
gh label create "priority/low" --repo $REPO --color "0e8a16" --description "優先度：低" --force

# ステータス
gh label create "wip" --repo $REPO --color "f9d0c4" --description "作業中" --force
gh label create "ready for review" --repo $REPO --color "0e8a16" --description "レビュー待ち" --force
gh label create "on hold" --repo $REPO --color "d4c5f9" --description "保留中" --force

# カテゴリ
gh label create "ui/ux" --repo $REPO --color "c5def5" --description "UI/UX関連" --force
gh label create "performance" --repo $REPO --color "5319e7" --description "パフォーマンス関連" --force
gh label create "mobile" --repo $REPO --color "ff69b4" --description "モバイル対応" --force
gh label create "accessibility" --repo $REPO --color "006b75" --description "アクセシビリティ" --force

echo "Labels created successfully!"
