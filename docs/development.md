# 開発ガイド

## 環境構築

### 前提条件

以下のツールがインストールされていることを確認してください：

- Docker & Docker Compose
- Git
- Node.js 18+ (フロントエンド開発用)
- Go 1.24+ (バックエンド開発用)

### リポジトリクローン

```bash
git clone <repository-url>
cd yappi_storage
```

### 環境変数設定

バックエンド環境変数ファイルを作成：

```bash
cd backend
cp .env.example .env
```

`.env` ファイルを編集：
```bash
DATABASE_DSN=host=postgres port=5432 user=docker password=docker dbname=main sslmode=disable
OPENAI_API_KEY=your_openai_api_key_here
```

### 開発環境起動

#### 全サービス起動
```bash
# プロジェクトルートで実行
./run.sh
```

#### 個別サービス起動
```bash
# 開発環境
docker compose up --build

# 本番環境
export COMPOSE_FILE=production.yaml
docker compose up --build
```

### サービスアクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **データベース**: localhost:5432
- **Redis**: localhost:6379

## 開発ワークフロー

### バックエンド開発

#### ディレクトリ構造の理解
```
backend/
├── main.go              # エントリーポイント
├── go.mod              # 依存関係管理
├── .air.toml           # ホットリロード設定
├── storage_config.yaml # ストレージ設定
└── .env                # 環境変数
```

#### 依存関係追加
```bash
cd backend
go mod tidy
```

#### ホットリロード開発
Air が自動で設定されており、ファイル変更時に自動リロードされます。

#### データベースマイグレーション
```bash
cd backend/infrastructure/database/goose
go tool goose up    # マイグレーション実行
go tool goose down  # ロールバック
```

#### 新しいマイグレーション作成
```bash
cd backend/infrastructure/database/goose/db/migrations
go tool goose create add_new_table sql
```

### フロントエンド開発

#### 依存関係インストール
```bash
cd frontend
npm install
```

#### 開発サーバー起動
```bash
npm run dev
```

#### Storybook起動
```bash
npm run storybook
```

#### ビルド
```bash
npm run build
npm run start
```

## コーディング規約

### Go (バックエンド)

#### パッケージ構成
- **domain**: ビジネスロジックとエンティティ
- **service**: ユースケース実装
- **infrastructure**: 外部システム連携
- **presentation**: HTTP/WebSocketエンドポイント

#### 命名規則
- パッケージ名: 小文字、短く
- 関数名: CamelCase（公開）、camelCase（非公開）
- 構造体: CamelCase
- インターフェース: CamelCase + Interface接尾辞

#### エラーハンドリング
```go
import "github.com/cockroachdb/errors"

if err != nil {
    return errors.WithStack(err)
}
```

### TypeScript (フロントエンド)

#### ディレクトリ構成
- **app/**: Next.js App Router
- **components/**: 再利用可能コンポーネント
- **api/**: API通信ロジック

#### 命名規則
- コンポーネント: PascalCase
- 関数: camelCase
- 定数: UPPER_SNAKE_CASE
- ファイル: kebab-case または camelCase

#### コンポーネント設計
```typescript
// 関数コンポーネント推奨
export function MyComponent({ prop1, prop2 }: Props) {
  return <div>{/* JSX */}</div>;
}

// プロパティ型定義
interface Props {
  prop1: string;
  prop2?: number;
}
```

## テスト

### バックエンドテスト
```bash
cd backend
go test ./...
```

### フロントエンドテスト
```bash
cd frontend
npm run test
```

## デバッグ

### バックエンドデバッグ

#### ログ確認
```bash
# アプリケーションログ
tail -f storage/logs/$(date +%Y-%m-%d).log

# Dockerログ
docker compose logs -f backend
```

#### データベース接続
```bash
docker compose exec postgres psql -U docker -d main
```

#### Redis接続
```bash
docker compose exec redis redis-cli
```

### フロントエンドデバッグ

#### ブラウザ開発者ツール
- React Developer Tools
- Network タブでAPI通信確認
- Console でJavaScriptエラー確認

#### Next.js デバッグ
```bash
# デバッグモードで起動
npm run dev -- --debug
```

## パフォーマンス最適化

### バックエンド
- **データベース**: インデックス最適化
- **キャッシュ**: Redis活用
- **ファイル処理**: チャンク処理によるメモリ効率化

### フロントエンド
- **コード分割**: Next.js動的インポート
- **画像最適化**: Next.js Image最適化
- **バンドル最適化**: Webpack設定

## トラブルシューティング

### よくある問題

#### ポート競合
```bash
# 使用中のポート確認
lsof -i :3000
lsof -i :8000

# プロセス停止
kill -9 <PID>
```

#### Docker容量不足
```bash
# 未使用リソース削除
docker system prune -a
```

#### データベース接続エラー
1. PostgreSQLコンテナ起動確認
2. 環境変数確認
3. ネットワーク設定確認

#### フロントエンドビルドエラー
```bash
# node_modules削除・再インストール
rm -rf node_modules package-lock.json
npm install
```

## 開発ツール

### 推奨エディタ設定

#### VS Code 拡張機能
- Go (Go Team at Google)
- TypeScript Importer
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint

#### Go ツール
```bash
# 必要ツールインストール
go install github.com/cosmtrek/air@latest
go install bitbucket.org/liamstask/goose/cmd/goose@latest
```

### Git フック設定
```bash
# pre-commit フックでフォーマット自動実行
# .git/hooks/pre-commit
#!/bin/sh
cd backend && go fmt ./...
cd frontend && npm run lint:fix
```

## デプロイ前チェックリスト

- [ ] 全テストパス
- [ ] リンターエラーなし
- [ ] 環境変数設定確認
- [ ] データベースマイグレーション確認
- [ ] セキュリティチェック
- [ ] パフォーマンステスト 