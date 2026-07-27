#!/bin/bash

# Thư mục chứa project trên WSL2 (đường dẫn tuyệt đối)
PROJECT_DIR="/mnt/d/work/maycha/thuccoffee"

# Cấu hình Database nội bộ Swarm
DATABASE_URL="postgresql://postgres:thuccoffee@thuccoffee-thucpostgres-uffucx:5432/thuccoffee"

# Cấu hình MinIO nội bộ Swarm
MINIO_ENDPOINT="thuccoffee-minio-sui5ds"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="thuccoffee"
MINIO_USE_SSL="false"

# Cấu hình tài khoản Admin mặc định
ADMIN_EMAIL="admin@thuccoffee.local"
ADMIN_PASSWORD="thuccoffeeadmin"

echo "=================================================="
echo "   KHI BAO TRANG THAI DU LIEU - THUC COFFEE"
echo "=================================================="

echo "1. Dang chay di cu database (db:migrate)..."
docker run --rm --net dokploy-network \
  -v "$PROJECT_DIR":/app \
  -v /app/server/node_modules \
  -w /app/server \
  -e DATABASE_URL="$DATABASE_URL" \
  node:22-alpine sh -c "npm install && npm run db:migrate"

echo "2. Dang nap du lieu mau (db:seed)..."
docker run --rm --net dokploy-network \
  -v "$PROJECT_DIR":/app \
  -v /app/server/node_modules \
  -w /app/server \
  -e DATABASE_URL="$DATABASE_URL" \
  node:22-alpine sh -c "npm install && npm run db:seed"

echo "3. Dang nap anh mau len MinIO (db:seed-images)..."
docker run --rm --net dokploy-network \
  -v "$PROJECT_DIR":/app \
  -v /app/server/node_modules \
  -w /app/server \
  -e DATABASE_URL="$DATABASE_URL" \
  -e MINIO_ENDPOINT="$MINIO_ENDPOINT" \
  -e MINIO_PORT="$MINIO_PORT" \
  -e MINIO_ACCESS_KEY="$MINIO_ACCESS_KEY" \
  -e MINIO_SECRET_KEY="$MINIO_SECRET_KEY" \
  -e MINIO_BUCKET="$MINIO_BUCKET" \
  -e MINIO_USE_SSL="$MINIO_USE_SSL" \
  node:22-alpine sh -c "npm install && npm run db:seed-images"

echo "4. Dang tao tai khoan Admin..."
docker run --rm --net dokploy-network \
  -v "$PROJECT_DIR":/app \
  -v /app/server/node_modules \
  -w /app/server \
  -e DATABASE_URL="$DATABASE_URL" \
  -e ADMIN_EMAIL="$ADMIN_EMAIL" \
  -e ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  node:22-alpine sh -c "npm install && npm run create-admin"

echo "=================================================="
echo "   KHOI TAO DU LIEU HOAN TAT!"
echo "=================================================="
