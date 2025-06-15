# API仕様

## 概要

Yappi Storageは、REST APIとWebSocket APIの両方を提供します。
- REST API: 標準的なHTTPベースの操作
- WebSocket API: リアルタイム通信（ファイルアップロード等）

## ベースURL

- 開発環境: `http://localhost:8000`
- WebSocket: `ws://localhost:8000/ws`

## 認証

### セッションベース認証
ユーザーログイン後、セッションCookieを使用した認証。

### APIトークン認証
`/v1/*` エンドポイントではAPIトークンを使用。

```http
Authorization: Bearer {token}
```

## REST API エンドポイント

### ユーザー管理

#### ユーザー登録
```http
POST /users/registration
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "email": "string"
}
```

#### ログイン
```http
POST /users/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

#### ログアウト
```http
POST /users/logout
```

#### ログイン中ユーザー取得
```http
GET /users
```

#### APIトークン生成
```http
POST /users/generate/token
```

### ファイル管理

#### ファイル一覧取得
```http
GET /files?parent_directory_id={id}&page={num}&size={num}
```

**レスポンス:**
```json
{
  "files": [
    {
      "id": "string",
      "user_id": "string", 
      "parent_directory_id": "string",
      "kind": "file|directory",
      "url": "string",
      "name": "string",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "page_size": 20,
  "current_page_count": 1,
  "total": 100
}
```

#### 特定ファイル取得
```http
GET /files/file/{file_id}
```

#### ディレクトリ作成
```http
POST /files/directory
Content-Type: application/json

{
  "name": "string",
  "parent_directory_id": "string"
}
```

#### ファイル移動
```http
PUT /files/move
Content-Type: application/json

{
  "file_ids": ["string"],
  "destination_directory_id": "string"
}
```

#### ファイル名変更
```http
PUT /files/rename
Content-Type: application/json

{
  "file_id": "string",
  "new_name": "string"
}
```

#### ファイル削除
```http
DELETE /files
Content-Type: application/json

{
  "file_ids": ["string"]
}
```

#### キャッシュ削除
```http
DELETE /files/delete-cache
```

### 検索

#### ファイル検索
```http
GET /files/search?q={query}&page={num}&size={num}
```

### V1 API（トークン認証）

#### ファイルアップロード
```http
POST /v1/files
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "file": "binary",
  "parent_directory_id": "string"
}
```

## WebSocket API

### 接続

#### セッション認証
```
GET /ws
```

#### トークン認証  
```
GET /v1/ws
Authorization: Bearer {token}
```

### メッセージ形式

WebSocketメッセージはバイナリ形式のイベントエンベロープを使用。

```go
type EventEnvelope struct {
    Event string
    Data  any
}
```

### イベント

#### ファイル名初期化
```json
{
  "event": "initialize_file_name",
  "data": null
}
```

#### ファイルチャンクアップロード
```json
{
  "event": "upload_file_chunk", 
  "data": {
    "checksum": 12345,
    "chunk": "binary_data"
  }
}
```

#### アップロード完了
```json
{
  "event": "finished_upload",
  "data": null
}
```

## エラーレスポンス

### 標準エラー形式
```json
{
  "error": {
    "message": "string",
    "code": "string",
    "details": {}
  }
}
```

### HTTPステータスコード
- `200`: 成功
- `201`: 作成成功
- `400`: 不正なリクエスト
- `401`: 認証エラー
- `403`: 権限エラー
- `404`: リソースが見つからない
- `500`: サーバーエラー

## レート制限

現在のところ、レート制限は実装されていません。

## CORS

フロントエンドからのクロスオリジンリクエストが許可されています。

## ストレージ設定

ストレージマウント情報は `storage_config.yaml` で設定：

```yaml
mounts:
  - dirname: hdd1
    path: /storage/hdd1
  - dirname: hdd2  
    path: /storage/hdd2
```

## 例

### ファイルアップロードの完全な流れ

1. **WebSocket接続**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
```

2. **ファイル名初期化**
```javascript
ws.send(encodeBinary({
  event: "initialize_file_name",
  data: null
}));
```

3. **チャンクアップロード**
```javascript
ws.send(encodeBinary({
  event: "upload_file_chunk",
  data: {
    checksum: calculateChecksum(chunk),
    chunk: chunk
  }
}));
```

4. **完了通知**
```javascript
ws.send(encodeBinary({
  event: "finished_upload", 
  data: null
}));
``` 