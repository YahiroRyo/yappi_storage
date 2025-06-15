# デプロイメントガイド

## 概要

Yappi Storageの本番環境へのデプロイ手順を説明します。Docker Composeを使用したコンテナベースのデプロイメントを採用しています。

## デプロイメント戦略

### 環境構成

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Web Server    │    │    Database     │
│   (Nginx/ALB)   │◄──►│   (Docker)      │◄──►│   (PostgreSQL)  │
│                 │    │   Frontend      │    │   with pgvector │
└─────────────────┘    │   Backend       │    └─────────────────┘
                       │   Redis         │    
                       └─────────────────┘    
```

### デプロイメント方式
- **Blue-Green Deployment**: ゼロダウンタイムデプロイ
- **Rolling Update**: 段階的なアップデート
- **Container-based**: Docker Composeによる管理

## 前提条件

### サーバー要件
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Amazon Linux 2
- **CPU**: 最小2コア、推奨4コア以上
- **RAM**: 最小4GB、推奨8GB以上
- **Storage**: 最小50GB、推奨100GB以上（SSD推奨）
- **Network**: インターネット接続、HTTPSポート開放

### ソフトウェア要件
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Make（オプション）

### ドメイン・SSL
- ドメイン名（例: storage.yourdomain.com）
- SSL証明書（Let's Encrypt推奨）

## 環境構築

### 1. サーバー初期設定

```bash
# システム更新
sudo apt update && sudo apt upgrade -y

# 必要なパッケージインストール
sudo apt install -y curl wget git make

# Dockerインストール
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Composeインストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. アプリケーション配置

```bash
# リポジトリクローン
git clone <repository-url> /opt/yappi_storage
cd /opt/yappi_storage

# ディレクトリ権限設定
sudo chown -R $USER:$USER /opt/yappi_storage
chmod +x run.sh
```

### 3. 環境変数設定

```bash
# 本番用環境変数ファイル作成
cp backend/.env.example backend/.env.production
```

```bash
# backend/.env.production
DATABASE_DSN=host=postgres port=5432 user=production_user password=STRONG_PASSWORD dbname=yappi_storage sslmode=require
OPENAI_API_KEY=your_openai_api_key
REDIS_URL=redis://redis:6379
JWT_SECRET=your_jwt_secret_key
ENVIRONMENT=production
LOG_LEVEL=warn
```

### 4. Docker設定

#### 本番用 Docker Compose
```yaml
# production.yaml (抜粋・セキュリティ強化版)
services:
  frontend:
    build:
      context: .
      dockerfile: ./docker/frontend.prod.Dockerfile
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    volumes:
      - ./frontend:/home/frontend:ro
    networks:
      - web
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: ./docker/backend.prod.Dockerfile
    restart: unless-stopped
    environment:
      - GIN_MODE=release
    env_file:
      - ./backend/.env.production
    volumes:
      - ./storage:/storage
      - ./logs:/logs
    networks:
      - web
      - internal
    depends_on:
      - postgres
      - redis

  postgres:
    image: pgvector/pgvector:pg14
    restart: unless-stopped
    environment:
      POSTGRES_DB: yappi_storage
      POSTGRES_USER: production_user
      POSTGRES_PASSWORD: STRONG_PASSWORD
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d:ro
    networks:
      - internal
    ports:
      - "127.0.0.1:5432:5432"

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass REDIS_PASSWORD
    volumes:
      - redis_data:/data
    networks:
      - internal

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    networks:
      - web
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  redis_data:

networks:
  web:
    driver: bridge
  internal:
    driver: bridge
    internal: true
```

## デプロイ手順

### 1. 初回デプロイ

```bash
# 1. リポジトリクローン
git clone <repository-url> /opt/yappi_storage
cd /opt/yappi_storage

# 2. 環境変数設定
cp backend/.env.example backend/.env.production
# .env.productionを編集

# 3. SSL証明書設定
sudo certbot certonly --webroot -w /var/www/html -d storage.yourdomain.com

# 4. Nginx設定
sudo cp nginx/nginx.prod.conf /etc/nginx/sites-available/yappi_storage
sudo ln -s /etc/nginx/sites-available/yappi_storage /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 5. データベース初期化
export COMPOSE_FILE=production.yaml
docker compose up postgres -d
sleep 30
docker compose exec postgres psql -U production_user -d yappi_storage -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 6. マイグレーション実行
docker compose run --rm backend /bin/sh -c "cd infrastructure/database/goose && go tool goose up"

# 7. 全サービス起動
docker compose up -d

# 8. ヘルスチェック
curl -f http://localhost:8000/health || exit 1
```

### 2. 更新デプロイ

```bash
#!/bin/bash
# deploy.sh

set -e

echo "Starting deployment..."

# 1. 新しいコードを取得
git fetch origin
git checkout main
git pull origin main

# 2. バックアップ作成
echo "Creating backup..."
docker compose exec postgres pg_dump -U production_user yappi_storage > "backup_$(date +%Y%m%d_%H%M%S).sql"

# 3. イメージビルド
echo "Building new images..."
export COMPOSE_FILE=production.yaml
docker compose build --no-cache

# 4. Blue-Green デプロイ
echo "Starting blue-green deployment..."

# 現在のサービスを別名で起動
docker compose -f production.yaml -p yappi_storage_green up -d

# ヘルスチェック
sleep 30
if ! curl -f http://localhost:8000/health; then
    echo "Health check failed. Rolling back..."
    docker compose -p yappi_storage_green down
    exit 1
fi

# 旧サービス停止
docker compose -p yappi_storage down

# 新サービスを本番名に変更
docker compose -f production.yaml -p yappi_storage_green stop
docker compose -f production.yaml up -d

echo "Deployment completed successfully!"
```

### 3. ロールバック手順

```bash
#!/bin/bash
# rollback.sh

# 1. 直前のコミットに戻す
git log --oneline -10
echo "Enter commit hash to rollback to:"
read COMMIT_HASH

git checkout $COMMIT_HASH

# 2. イメージ再ビルド
export COMPOSE_FILE=production.yaml
docker compose build --no-cache

# 3. データベースロールバック（必要に応じて）
echo "Enter backup file to restore (or skip):"
read BACKUP_FILE

if [ ! -z "$BACKUP_FILE" ]; then
    docker compose exec -i postgres psql -U production_user yappi_storage < $BACKUP_FILE
fi

# 4. サービス再起動
docker compose down
docker compose up -d

echo "Rollback completed!"
```

## 監視・ログ

### 1. アプリケーション監視

```bash
# システムリソース監視
sudo apt install -y htop iotop nethogs

# Docker監視
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# ログ監視
docker compose logs -f --tail=100 backend
tail -f storage/logs/$(date +%Y-%m-%d).log
```

### 2. Prometheus + Grafana（オプション）

```yaml
# monitoring.yaml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
```

### 3. ログ収集

```yaml
# logging.yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
```

## セキュリティ

### 1. ファイアウォール設定

```bash
# UFW設定
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 5432/tcp
sudo ufw deny 6379/tcp
```

### 2. SSL/TLS設定

```nginx
# nginx/nginx.prod.conf
server {
    listen 443 ssl http2;
    server_name storage.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/storage.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/storage.yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. データベースセキュリティ

```sql
-- 専用ユーザー作成
CREATE USER app_user WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE yappi_storage TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- セキュリティ設定
ALTER DATABASE yappi_storage SET log_statement = 'all';
ALTER DATABASE yappi_storage SET log_min_duration_statement = 1000;
```

## バックアップ・復旧

### 1. 自動バックアップ

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/opt/backups/yappi_storage"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# データベースバックアップ
docker compose exec postgres pg_dump -U production_user yappi_storage | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# ファイルバックアップ
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" storage/files/

# 古いバックアップ削除（30日以上）
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# crontab設定
0 2 * * * /opt/yappi_storage/scripts/backup.sh >> /var/log/yappi_backup.log 2>&1
```

### 2. 復旧手順

```bash
# データベース復旧
gunzip -c backup_20240101_020000.sql.gz | docker compose exec -i postgres psql -U production_user yappi_storage

# ファイル復旧
tar -xzf backup_20240101_020000.tar.gz -C /
```

## パフォーマンス最適化

### 1. データベース最適化

```sql
-- インデックス最適化
REINDEX DATABASE yappi_storage;
VACUUM ANALYZE;

-- 統計情報更新
ANALYZE;

-- 接続プール設定
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
```

### 2. Redis最適化

```bash
# Redis設定
echo "vm.overcommit_memory = 1" >> /etc/sysctl.conf
echo "net.core.somaxconn = 65535" >> /etc/sysctl.conf
sysctl -p
```

### 3. Nginx最適化

```nginx
worker_processes auto;
worker_connections 1024;

gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

client_max_body_size 100M;
```

## トラブルシューティング

### よくある問題

#### 1. メモリ不足
```bash
# メモリ使用状況確認
free -h
docker stats --no-stream

# スワップ設定
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 2. ディスク容量不足
```bash
# 使用状況確認
df -h
du -sh /opt/yappi_storage/*

# Dockerクリーンアップ
docker system prune -a -f
docker volume prune -f
```

#### 3. 接続エラー
```bash
# ネットワーク確認
docker network ls
docker compose ps

# ポート確認
netstat -tulpn | grep :8000
```

## チェックリスト

### デプロイ前
- [ ] 環境変数設定確認
- [ ] SSL証明書有効期限確認
- [ ] バックアップ作成
- [ ] ディスク容量確認
- [ ] テスト環境での動作確認

### デプロイ後
- [ ] ヘルスチェック実行
- [ ] 全機能動作確認
- [ ] ログエラー確認
- [ ] パフォーマンス確認
- [ ] 監視アラート設定確認 