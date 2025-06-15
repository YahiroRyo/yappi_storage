# データベース設計

## 概要

Yappi Storageは、PostgreSQL with pgvectorを使用してデータを管理します。ベクトル検索機能を活用した高度なファイル検索が特徴です。

## データベース構成

### 基本情報
- **DBMS**: PostgreSQL 14+
- **拡張**: pgvector (ベクトル検索用)
- **接続情報**:
  - Host: postgres (Docker環境)
  - Port: 5432
  - Database: main
  - User: docker
  - Password: docker

### 接続設定
```bash
DATABASE_DSN=host=postgres port=5432 user=docker password=docker dbname=main sslmode=disable
```

## テーブル設計

### users テーブル

ユーザー情報を管理するテーブル。

```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    email VARCHAR,
    token VARCHAR, -- APIアクセス用トークン
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### フィールド説明
- `id`: ユニークユーザーID (Snowflake ID)
- `username`: ログイン用ユーザー名
- `password`: ハッシュ化されたパスワード
- `email`: メールアドレス
- `token`: API認証用トークン
- `created_at`: 作成日時
- `updated_at`: 更新日時

### files テーブル

ファイル・ディレクトリ情報を管理するテーブル。

```sql
CREATE TABLE files (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    parent_directory_id VARCHAR,
    embedding VECTOR(1536), -- OpenAI embedding用ベクトル
    kind VARCHAR NOT NULL, -- 'file' または 'directory'
    url VARCHAR,
    name VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_directory_id) REFERENCES files(id) ON DELETE CASCADE
);
```

#### フィールド説明
- `id`: ユニークファイルID (Snowflake ID)
- `user_id`: 所有者ユーザーID
- `parent_directory_id`: 親ディレクトリID (NULL = ルート)
- `embedding`: ファイル内容のベクトル表現 (1536次元)
- `kind`: ファイル種別 ('file' または 'directory')
- `url`: ファイルアクセスURL
- `name`: ファイル・ディレクトリ名
- `created_at`: 作成日時
- `updated_at`: 更新日時

## インデックス設計

### パフォーマンス最適化

```sql
-- ユーザー別ファイル検索用
CREATE INDEX idx_files_user_parent ON files(user_id, parent_directory_id);

-- ファイル名検索用
CREATE INDEX idx_files_name ON files(name);

-- ベクトル検索用 (コサイン類似度)
CREATE INDEX idx_files_embedding ON files USING ivfflat (embedding vector_cosine_ops);

-- ユーザー名ユニーク制約
CREATE UNIQUE INDEX idx_users_username ON users(username);
```

### ベクトルインデックス最適化

```sql
-- IVF-Flat インデックスのリスト数設定
-- データ量に応じて調整 (推奨: rows/1000)
ALTER INDEX idx_files_embedding SET (lists = 100);
```

## マイグレーション管理

### Goose マイグレーション

プロジェクトでは、Gooseを使用してマイグレーションを管理しています。

#### マイグレーションファイル
```
backend/infrastructure/database/goose/db/migrations/
├── 20241208182509_add_users_table.sql
├── 20241208184251_add_files_table.sql
└── 20250121075341_add_token_to_users_table.sql
```

#### マイグレーション実行
```bash
cd backend/infrastructure/database/goose
go tool goose up      # 最新まで適用
go tool goose down    # 一つ戻す
go tool goose status  # 現在の状態確認
```

#### 新しいマイグレーション作成
```bash
cd backend/infrastructure/database/goose/db/migrations
go tool goose create migration_name sql
```

## ベクトル検索

### pgvector 設定

```sql
-- pgvector拡張インストール
CREATE EXTENSION IF NOT EXISTS vector;

-- ベクトル類似度検索
SELECT id, name, 1 - (embedding <=> $1) as similarity
FROM files 
WHERE user_id = $2 
  AND embedding <=> $1 < 0.5
ORDER BY embedding <=> $1
LIMIT 20;
```

### ベクトル生成プロセス

1. **ファイルアップロード時**
   - ファイル内容をOpenAI APIに送信
   - 1536次元のembeddingベクトル取得
   - files.embeddingフィールドに保存

2. **検索時**
   - 検索クエリをOpenAI APIでベクトル化
   - pgvectorでコサイン類似度検索実行
   - 類似度順で結果返却

## データベース接続

### Go での接続

```go
package database

import (
    "database/sql"
    "os"
    "github.com/jmoiron/sqlx"
    "github.com/lib/pq"
    sqlhooks "github.com/qustavo/sqlhooks/v2"
)

func ConnectToDB() (*sqlx.DB, error) {
    dsn := os.Getenv("DATABASE_DSN")
    sql.Register("postgresWithHooks", sqlhooks.Wrap(&pq.Driver{}, &Hooks{}))
    db, err := sqlx.Open("postgres", dsn)
    if err != nil {
        return nil, err
    }
    return db, nil
}
```

### SQLフック（ログ・監視）

```go
type Hooks struct{}

func (h *Hooks) Before(ctx context.Context, query string, args ...interface{}) (context.Context, error) {
    // クエリ実行前の処理（ログ等）
    return ctx, nil
}

func (h *Hooks) After(ctx context.Context, query string, args ...interface{}) (context.Context, error) {
    // クエリ実行後の処理（パフォーマンス測定等）
    return ctx, nil
}
```

## バックアップ戦略

### 開発環境
```bash
# ダンプ作成
docker compose exec postgres pg_dump -U docker main > backup.sql

# リストア
docker compose exec -i postgres psql -U docker main < backup.sql
```

### 本番環境
- 定期的な論理バックアップ (pg_dump)
- WAL-Eによる継続的アーカイブ
- ポイントインタイムリカバリ設定

## パフォーマンス監視

### スロークエリ監視
```sql
-- 実行時間の長いクエリを特定
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

### インデックス使用状況
```sql
-- インデックス効果測定
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_tup_read DESC;
```

### ベクトル検索パフォーマンス
```sql
-- ベクトル検索実行計画確認
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, name FROM files 
WHERE embedding <=> $1 < 0.5 
ORDER BY embedding <=> $1 
LIMIT 20;
```

## セキュリティ

### アクセス制御
- ユーザー別データ分離（Row Level Security検討）
- パスワードハッシュ化（bcrypt）
- SQLインジェクション対策（プリペアドステートメント）

### データ暗号化
- 保存時暗号化（PostgreSQL TDE検討）
- 通信暗号化（SSL/TLS）
- バックアップ暗号化

## トラブルシューティング

### よくある問題

#### pgvector インストールエラー
```bash
# Dockerコンテナ内でインストール確認
docker compose exec postgres psql -U docker -d main -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

#### 接続エラー
```bash
# 接続テスト
docker compose exec postgres psql -U docker -d main -c "SELECT version();"
```

#### マイグレーションエラー
```bash
# 手動でマイグレーション状態確認
docker compose exec postgres psql -U docker -d main -c "SELECT * FROM goose_db_version;"
``` 