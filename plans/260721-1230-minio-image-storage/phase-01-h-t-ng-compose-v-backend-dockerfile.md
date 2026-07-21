---
phase: 1
title: "Hạ tầng compose và backend Dockerfile"
status: completed
priority: P1
effort: "3h"
dependencies: []
---

# Phase 1: Hạ tầng compose và backend Dockerfile

## Overview

Đưa compose từ 2 service (frontend, postgres) lên đủ hạ tầng: thêm `backend`
(có Dockerfile riêng), `minio`, và `minio-init`. Kết thúc phase này `docker
compose up` chạy được cả 4 service, MinIO healthy, bucket đã tạo — nhưng chưa có
ảnh (đẩy ảnh ở Phase 2).

## Requirements

- Functional: `server/Dockerfile` build được image backend; compose thêm
  `backend`, `minio`, `minio-init`; bucket `thuccoffee` tồn tại và public-read.
- Non-functional: env-driven (không hardcode key/URL); healthcheck cho backend
  và minio; volume giữ dữ liệu MinIO qua `down`/`up`; backend đợi postgres
  healthy trước khi khởi động.

## Architecture

Sơ đồ service sau phase:

```
frontend   :3000 → nginx SPA tĩnh (giữ nguyên)
backend    :8080 → Express, depends_on postgres+minio healthy
postgres   :5432 → (giữ nguyên, có volume)
minio      :9000 API, :9001 console → volume minio-data
minio-init         → mc: tạo bucket + public-read + CORS, chạy 1 lần rồi thoát
```

- `minio-init` dùng image `minio/mc`, chạy `mc alias set` → `mc mb --ignore-existing`
  (bucket) → `mc anonymous set download` (public-read). `restart: "no"` để không
  lặp lại; `depends_on: minio healthy`.
  - **CORS KHÔNG làm ở vòng này.** FE tĩnh chưa gọi MinIO (ảnh vẫn từ `/assets/`),
    nên chưa có cross-origin cần cho phép — YAGNI. Ngoài ra CORS của MinIO không
    set qua `mc` cổ điển mà qua env `MINIO_API_CORS_ALLOW_ORIGIN` trên service
    `minio`; để vòng API khi FE thực sự đọc ảnh từ MinIO.
- Backend Dockerfile theo mẫu frontend (`Dockerfile`): multi-stage node:22-alpine,
  `npm ci` → `npm run build` → chạy `node dist/index.js`. Khác frontend ở chỗ
  runtime là node (không nginx), expose 8080, healthcheck gọi `/api/health`.
  - **Lưu ý runtime:** `index.ts` gọi `dotenv/config` nhưng trong container không
    có file `.env` → env phải truyền hết qua compose `environment`. Thiếu `.env`
    trong container là bình thường, không phải lỗi.
- Access key MinIO local: đặt qua env compose (`MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD`).
- **Healthcheck minio:** image `minio/minio` có thể không có `curl`. Ưu tiên
  `mc ready local` (trong image có `mc`?) hoặc dùng healthcheck theo tài liệu
  MinIO hiện hành; Codex kiểm tra binary có sẵn trong image trước khi chốt lệnh.

## Related Code Files

- Create: `server/Dockerfile`
- Create: `server/.dockerignore` (loại `node_modules`, `dist`, `.env`)
- Modify: `compose.yaml` (thêm 3 service + volume `minio-data`)
- Modify: `.env.example` root nếu cần biến build-time (vòng này chưa cần vì FE
  không đổi — xác nhận không thêm)

## Implementation Steps

1. Viết `server/Dockerfile` multi-stage:
   - stage build: `node:22-alpine`, `WORKDIR /app`, copy `package*.json`,
     `npm ci`, copy `.`, `npm run build`.
   - stage runtime: `node:22-alpine`, copy `dist` + `node_modules` (hoặc
     `npm ci --omit=dev`), `EXPOSE 8080`, `CMD ["node","dist/index.js"]`,
     HEALTHCHECK gọi `/api/health`.
2. Viết `server/.dockerignore`.
3. Thêm service `backend` vào `compose.yaml`: build từ `./server`, ports
   `8080:8080`, `depends_on` postgres (service_healthy) + minio (service_healthy),
   environment `DATABASE_URL` + `MINIO_*` (trỏ tới service name `minio:9000`,
   không phải localhost — trong mạng compose).
4. Thêm service `minio`: image `minio/minio`, command `server /data
   --console-address ":9001"`, ports `9000:9000` + `9001:9001`, env
   `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD`, volume `minio-data:/data`,
   healthcheck `curl -f http://localhost:9000/minio/health/ready`.
5. Thêm service `minio-init`: image `minio/mc`, `entrypoint` chạy chuỗi mc tạo
   bucket (`mc mb --ignore-existing`) + public-read (`mc anonymous set download`),
   `depends_on: minio service_healthy`, `restart: "no"`. **Không set CORS** (xem
   Architecture — YAGNI vòng này).
6. Thêm `minio-data` vào block `volumes`.
7. `docker compose up -d --build` → kiểm tra 4 service, minio healthy, console
   `:9001` mở được, bucket `thuccoffee` xuất hiện.

## Success Criteria

- [x] `docker compose up -d --build` không lỗi.
- [x] `docker compose ps` cho thấy frontend/postgres/minio healthy, backend chạy
      (health `/api/health` trả 200), minio-init đã exit 0.
- [x] MinIO console `http://localhost:9001` đăng nhập được bằng root user.
- [x] Bucket `thuccoffee` tồn tại và anonymous download được bật.
- [x] `docker compose down && up` giữ nguyên dữ liệu MinIO (volume hoạt động).

## Risk Assessment

- **Backend chưa từng chạy trong container** → có thể lỗi env/path. Mitigation:
  test `docker compose up backend` riêng, xem log; đảm bảo `DATABASE_URL` trỏ
  service name `postgres` không phải `localhost`.
- **`minio-init` chạy trước khi minio sẵn sàng** → bucket không tạo. Mitigation:
  `depends_on: condition: service_healthy` + healthcheck minio chuẩn.
- **Trong mạng compose dùng service name**, ngoài host dùng `localhost`. Ghi rõ
  trong `.env.example` để không nhầm khi chạy backend ngoài container.
