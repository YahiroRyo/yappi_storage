# バックエンド設計

## 概要

Go言語で実装されたバックエンドAPI。クリーンアーキテクチャを採用し、レイヤー分離とDIパターンによる疎結合な設計を実現しています。

## アーキテクチャ

### レイヤー構成

```
┌─────────────────────────────┐
│     Presentation Layer      │  ← HTTP/WebSocketエンドポイント
├─────────────────────────────┤
│       Service Layer         │  ← ビジネスロジック
├─────────────────────────────┤
│       Domain Layer          │  ← エンティティ・ドメインロジック
├─────────────────────────────┤
│    Infrastructure Layer     │  ← 外部システム連携
└─────────────────────────────┘
```

### 依存関係注入 (DI)

```go
// main.go での DI設定例
func diController(conn *sqlx.DB, userRepo repository.UserRepository, 
                 fileRepo repository.FileRepository, chatGPTRepo repository.ChatGPTRepository) controller.Controller {
    return controller.Controller{
        GetFilesService: service.GetFilesService{
            Conn:     conn,
            FileRepo: &fileRepo,
        },
        // その他のサービス注入...
    }
}
```

## ディレクトリ構造

```
backend/
├── main.go                    # エントリーポイント
├── go.mod                     # 依存関係管理
├── go.sum                     # 依存関係ロック
├── .air.toml                  # ホットリロード設定
├── storage_config.yaml        # ストレージマウント設定
├── .env                       # 環境変数
├── domain/                    # ドメイン層
│   ├── file/                  # ファイルエンティティ
│   ├── user/                  # ユーザーエンティティ
│   └── vector/                # ベクトル検索
├── service/                   # サービス層
│   ├── files/                 # ファイル関連ビジネスロジック
│   └── users/                 # ユーザー関連ビジネスロジック
├── infrastructure/            # インフラ層
│   ├── database/             # DB接続・マイグレーション
│   ├── repository/           # データアクセス層
│   └── route/                # ルーティング設定
├── presentation/             # プレゼンテーション層
│   ├── api/                  # REST API
│   ├── controller/           # HTTPコントローラー
│   ├── middleware/           # ミドルウェア
│   ├── handling/             # エラーハンドリング
│   ├── session/              # セッション管理
│   └── ws/                   # WebSocket通信
└── helper/                   # ユーティリティ
    ├── checksum.go           # チェックサム計算
    ├── grpc.go               # gRPCサーバー
    ├── helper.go             # Snowflake ID生成
    └── logger.go             # ログ管理
```

## 主要コンポーネント

### 1. Domain Layer

#### File Entity
```go
type File struct {
    ID                string     `json:"id"`
    UserID            string     `json:"user_id"`
    ParentDirectoryID *string    `json:"parent_directory_id"`
    Kind              string     `json:"kind"`        // "file" or "directory"
    Url               *string    `json:"url"`
    Name              string     `json:"name"`
    CreatedAt         time.Time  `json:"created_at"`
    UpdatedAt         time.Time  `json:"updated_at"`
}
```

#### User Entity
```go
type User struct {
    ID        string    `json:"id"`
    Username  string    `json:"username"`
    Password  string    `json:"password"`
    Email     string    `json:"email"`
    Token     string    `json:"token"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

### 2. Service Layer

#### ファイル管理サービス
- `GetFilesService`: ファイル一覧取得
- `GetFileService`: 特定ファイル取得
- `RegistrationFilesService`: ファイル登録
- `RegistrationDirectoryService`: ディレクトリ作成
- `MoveFilesService`: ファイル移動
- `RenameFileService`: ファイル名変更
- `DeleteFilesService`: ファイル削除
- `SearchFilesService`: ファイル検索（ベクトル検索）

#### ユーザー管理サービス
- `GetLoggedInUserService`: ログイン中ユーザー取得
- `LoginService`: ログイン処理
- `RegistrationUserService`: ユーザー登録
- `LogoutService`: ログアウト処理
- `GenerateTokenService`: APIトークン生成

### 3. Infrastructure Layer

#### Repository Pattern
```go
type FileRepositoryInterface interface {
    GetFiles(db *sqlx.DB, user user.User, parentDirectoryId *string, currentPageCount int, pageSize int) (*file.PaginationFiles, error)
    GetFileByID(db *sqlx.DB, user user.User, id string) (*file.File, error)
    RegistrationFile(tx *sqlx.Tx, user user.User, file file.File) (*file.File, error)
    UpdateFile(tx *sqlx.Tx, user user.User, file file.File) (*file.File, error)
    DeleteFile(tx *sqlx.Tx, user user.User, id string) error
    // その他のメソッド...
}
```

#### データベース接続
```go
func ConnectToDB() (*sqlx.DB, error) {
    dsn := os.Getenv("DATABASE_DSN")
    sql.Register("postgresWithHooks", sqlhooks.Wrap(&pq.Driver{}, &Hooks{}))
    db, err := sqlx.Open("postgres", dsn)
    if err != nil {
        return nil, errors.WithStack(err)
    }
    return db, nil
}
```

### 4. Presentation Layer

#### HTTP ルーティング
```go
func SetRoutes(app *fiber.App, controller controller.Controller, api api.Api, 
              wsController ws.WsController, middleware middleware.Middleware) {
    
    // ファイル管理API
    files := app.Group("/files").Use(middleware.AuthenticateLoggedInUserMiddleware)
    files.Get("/", controller.GetFiles)
    files.Post("/", controller.RegistrationFiles)
    files.Put("/move", controller.MoveFiles)
    // その他のエンドポイント...
    
    // ユーザー管理API
    users := app.Group("/users")
    users.Post("/login", controller.Login)
    users.Post("/registration", controller.Registration)
    // その他のエンドポイント...
    
    // WebSocket
    ws := app.Group("/ws")
    ws.Use(middleware.AuthenticateLoggedInUserMiddleware).Get("", websocket.New(wsController.Ws))
    
    // API v1 (トークン認証)
    v1 := app.Group("/v1").Use(middleware.AuthenticateLoggedInUserMiddlewareByToken)
    v1.Post("/files", api.RegistrationFiles)
}
```

#### WebSocket 通信
```go
type EventEnvelope struct {
    Event EventEnvelopeEvent
    Data  any
}

const (
    EventEnvelopeEventInitializeFileName EventEnvelopeEvent = "initialize_file_name"
    EventEnvelopeEventUploadFileChunk    EventEnvelopeEvent = "upload_file_chunk"
    EventEnvelopeEventFinishedUpload     EventEnvelopeEvent = "finished_upload"
)
```

## 外部サービス連携

### OpenAI API 統合
```go
type ChatGPTRepository struct {
    client *openai.Client
}

func (repo *ChatGPTRepository) CreateEmbedding(text string) (vector.Vector, error) {
    resp, err := repo.client.CreateEmbeddings(context.Background(), openai.EmbeddingRequest{
        Input: []string{text},
        Model: openai.AdaEmbeddingV2,
    })
    if err != nil {
        return nil, errors.WithStack(err)
    }
    return resp.Data[0].Embedding, nil
}
```

### Redis キャッシュ
```go
type FileRepository struct {
    Redis *redis.Client
    Cache *cache.Cache
}

func (repo *FileRepository) GetCachedFiles(userID string, key string) ([]file.File, error) {
    var files []file.File
    err := repo.Cache.Get(context.Background(), fmt.Sprintf("files:%s:%s", userID, key), &files)
    return files, err
}
```

## セキュリティ

### 認証ミドルウェア
```go
func (m *Middleware) AuthenticateLoggedInUserMiddleware(ctx *fiber.Ctx) error {
    sess, err := session.GetSession(ctx)
    if err != nil {
        return errors.WithStack(err)
    }
    
    userID := sess.Get("user_id")
    if userID == nil {
        return ctx.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
    }
    
    ctx.Locals("user_id", userID)
    return ctx.Next()
}
```

### パスワードハッシュ化
```go
import "golang.org/x/crypto/bcrypt"

func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
```

## エラーハンドリング

### 構造化エラー管理
```go
import "github.com/cockroachdb/errors"

// エラーラッピング
if err != nil {
    return errors.WithStack(err)
}

// エラーハンドラー
func ErrorHandler(ctx *fiber.Ctx, err error) error {
    code := fiber.StatusInternalServerError
    
    if e, ok := err.(*fiber.Error); ok {
        code = e.Code
    }
    
    return ctx.Status(code).JSON(fiber.Map{
        "error": err.Error(),
        "stack": fmt.Sprintf("%+v", err),
    })
}
```

## ログ管理

### 構造化ログ
```go
func Log(message string) {
    logger := getLogger()
    if logger == nil {
        return
    }
    write := fmt.Sprintf("%s\n", message)
    fmt.Println(write)
    logger.WriteString(write)
}

func Logf(message string, args ...interface{}) {
    Log(fmt.Sprintf(message, args...))
}
```

### ログローテーション
- 日付別ファイル分割
- 90日以上の古いログ自動削除
- Dockerコンテナ対応

## パフォーマンス最適化

### コネクションプール
```go
func (repo *FileRepository) optimizeConnection(db *sqlx.DB) {
    db.SetMaxOpenConns(25)
    db.SetMaxIdleConns(25)
    db.SetConnMaxLifetime(5 * time.Minute)
}
```

### キャッシュ戦略
- ファイル一覧のRedisキャッシュ
- ベクトル検索結果キャッシュ
- セッション情報SQLiteストレージ

## テスト戦略

### ユニットテスト
```go
func TestGetFiles(t *testing.T) {
    // モックリポジトリ作成
    mockRepo := &mockFileRepository{}
    service := service.GetFilesService{FileRepo: mockRepo}
    
    // テスト実行
    files, err := service.Execute(testUser, nil, 1, 20)
    
    // アサーション
    assert.NoError(t, err)
    assert.NotEmpty(t, files)
}
```

### 統合テスト
- Docker Compose環境でのE2Eテスト
- データベース込みの統合テスト
- WebSocket通信テスト

## 監視・メトリクス

### ヘルスチェック
```go
app.Get("/health", func(c *fiber.Ctx) error {
    return c.JSON(fiber.Map{
        "status": "healthy",
        "timestamp": time.Now(),
    })
})
```

### パフォーマンス測定
- SQLフックによるクエリ実行時間測定
- APIレスポンス時間記録
- メモリ使用量監視 