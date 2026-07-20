---
title: "Backend Foundation"
description: "Dựng Postgres, schema Drizzle, và seed dữ liệu từ src/data sang database."
status: pending
priority: P1
branch: "feat/backend"
created: "2026-07-20T17:30:00+07:00"
---

# Backend Foundation

## Tổng quan

Giai đoạn 1 của lộ trình backend: dựng database và đổ dữ liệu hiện có vào đó.
Kết thúc giai đoạn này, dữ liệu nằm trong Postgres và truy vấn được bằng SQL —
chưa có API, frontend chưa đổi.

Thiết kế schema: `docs/database-design.md`
Kiến trúc và stack: `docs/backend-architecture.md`

## Phạm vi

- Tạo `server/` với `package.json`, `tsconfig.json`, lint config riêng.
- Schema Drizzle cho 7 bảng, chuyển từ `src/data/types.ts`.
- Thêm service `postgres` vào `compose.yaml`, có volume giữ dữ liệu.
- Script seed đọc `src/data/*.ts` đổ vào database.
- Dọn 4 file cấu hình gốc để không chạm vào `server/`.
- Đổi cổng local: frontend sang `3000`, backend giữ chỗ `8080`.

## Ngoài phạm vi

- API endpoint, xác thực, giao diện admin — các giai đoạn sau.
- Upload ảnh. Ảnh ở lại repo, DB chỉ lưu tên file.
- Đổi `src/data/index.ts` sang `fetch` — giai đoạn 3.
- Dockerfile cho backend — chỉ cần khi deploy.

## Các phase

| Phase | Tên | Trạng thái |
|---|---|---|
| 1 | [Dựng server và dọn cấu hình gốc](./phase-01-server-scaffold.md) | Pending |
| 2 | [Postgres qua Compose](./phase-02-postgres-compose.md) | Pending |
| 3 | [Schema Drizzle và migration](./phase-03-drizzle-schema.md) | Pending |
| 4 | [Seed dữ liệu và kiểm chứng](./phase-04-seed-and-verify.md) | Pending |

## Phụ thuộc

- Docker Desktop đang chạy (đã xác nhận: 28.3.0, Compose 2.38.1).
- Node 22 (đã xác nhận: v22.18.0).
- Cổng `3000`, `8080`, `5432` trống (đã xác nhận sau khi tắt Dokploy).

## Tiêu chí hoàn thành

- `docker compose up -d` dựng được cả frontend và postgres.
- Truy vấn SQL trả về đúng 42 sản phẩm, 10 bài viết, 7 cửa hàng, 10 danh mục.
- Quan hệ sản phẩm–danh mục khớp dữ liệu gốc.
- Chạy seed lần hai không tạo bản ghi trùng.
- `npm run lint` và `npm run build` ở gốc vẫn xanh, không bị `server/` ảnh hưởng.
- CI xanh.

## Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Ngày blog dạng `DD.MM.YYYY` parse sai | Viết hàm parse riêng, kiểm tra cả 10 bản ghi |
| Seed chạy nhiều lần gây trùng | Dùng upsert theo `slug` |
| Lint/build gốc quét nhầm `server/` | Sửa `.oxlintrc.json`, xác minh sau khi sửa |
| Mất dữ liệu khi restart container | Khai báo volume cho postgres |
