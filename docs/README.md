# Yappi Storage ドキュメント

## 概要

Yappi Storageは、個人用の高機能ストレージシステムです。

## プロジェクト構成

この個人用ストレージシステムは以下の特徴を持ちます：

- プラグイン開発が柔軟に行える設計
- ベクトル検索による高度なファイル検索機能
- 各種ライブラリの自作による深い理解の実現

## 技術スタック

- **フロントエンド**: React.js, TypeScript, Next.js
- **バックエンド**: Golang (Go 1.24)
- **データベース**: PostgreSQL with pgvector
- **キャッシュ**: Redis
- **開発ツール**: Docker, Docker Compose

## ドキュメント構成

このdocsディレクトリには以下のドキュメントが含まれています：

- [`architecture.md`](./architecture.md) - システム全体のアーキテクチャ設計
- [`api.md`](./api.md) - REST API / WebSocket API仕様
- [`database.md`](./database.md) - データベース設計とスキーマ
- [`development.md`](./development.md) - 開発環境構築と開発ガイド
- [`deployment.md`](./deployment.md) - 本番環境へのデプロイ手順
- [`frontend.md`](./frontend.md) - フロントエンド設計とコンポーネント
- [`backend.md`](./backend.md) - バックエンド設計とサービス構成

## クイックスタート

1. [開発環境構築](./development.md#環境構築)
2. [API使用方法](./api.md#認証)
3. [アーキテクチャ理解](./architecture.md)

## 関連リンク

- [プロジェクトルートREADME](../README.md)
- [フロントエンドREADME](../frontend/README.md) 