---
title: "Phase M — FE đọc ảnh từ MinIO (full object key)"
description: "FE resolve ảnh qua URL MinIO thay vì bundle; DB lưu full object key. Bước đọc-only, không auth/upload."
status: completed
priority: P2
branch: "feat/admin-mvp"
tags: [media, minio, frontend, migration, tdd]
blockedBy: []
blocks: []
created: "2026-07-22T08:01:34.275Z"
createdBy: "ck:plan"
source: skill
---

# Phase M — FE đọc ảnh từ MinIO (full object key)

## Overview

Chuyển frontend từ đọc ảnh trong bundle (`import.meta.glob` của `src/assets/images/`)
sang đọc qua URL công khai của MinIO. DB đổi cột ảnh từ **basename** sang **full
object key** (prefix thư mục thật trên bucket: `products/`, `blog/`, `stores/`,
`site/` — banner + logo + icon UI đều ở `site/`, KHÔNG có prefix `banners/`). Đây là
bước **đọc-only**: không auth, không upload — upload thuộc khối admin sau.

Nguồn quyết định: `plans/reports/260722-admin-mvp-scope-decisions-brainstorm.md`.

## Bối cảnh đã verify (không đoán)

- **498 ảnh đã trên MinIO**, bucket `thuccoffee` public-read (anon GET = 200).
- **Lệch key:** API/DB trả basename (`e600e38f_americano.jpg`); MinIO key có prefix
  (`products/e600e38f_americano.jpg`, `blog/xxx.png`, `site/icon-coffee.png`).
- **Mọi ảnh đều có trên MinIO** kể cả icon UI tĩnh (`site/icon-coffee.png`,
  `site/icon-delivery.png`, `site/151b6674_circlelogo...`) — không ảnh nào kẹt bundle.
- **14 caller** của `getImageUrl`/`resolveBlogContentImageUrls` (blast radius FE).
- **3 loại nguồn ảnh** phải phân biệt:
  1. Key từ DB (product/blog/store/banner image, logo site-settings) → API trả full key.
  2. Ảnh hardcode FE (`icon-coffee.png`, `icon-delivery.png`, placeholder) → FE
     hardcode full key `site/...`.
  3. `GALLERY_IMAGES` trong `GalleryLightbox.tsx` (tĩnh, không DB) → FE hardcode key.
- Env FE theo convention `import.meta.env.VITE_*` → thêm `VITE_MINIO_BASE_URL`.

## Quyết định cấu trúc: đổi atomic

Migration DB và đổi `getImageUrl` **phải cùng một phase**, không tách. Tách
migration đứng trước sẽ làm FE vỡ giữa chừng (API trả full key mà `getImageUrl` cũ
tra bundle bằng key đó → placeholder). Mỗi phase phải chạy được và verify được.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Test-first: khóa hành vi getImageUrl](./phase-01-test-first-kh-a-h-nh-vi-getimageurl.md) | Pending |
| 2 | [Đổi atomic: DB migration + getImageUrl + seed + env](./phase-02-migration-db-full-object-key.md) | Pending |
| 3 | [Verify FE runtime xanh (Docker)](./phase-04-verify-fe-runtime-xanh.md) | Pending |

> Phase stub `phase-03-i-getimageurl-...` bị gộp vào Phase 2 (đổi atomic) —
> không dùng riêng.

## Dependencies

- **Tiền đề đã xong:** vòng "FE đọc API" (`bc81679` trên `main`) — page đã đọc DB
  qua hook; ảnh là mảnh cuối chưa chuyển. MinIO seed ảnh (`db:seed-images`) đã chạy.
- **Không blockedBy plan nào đang mở.** Hai plan `in-progress` trong `plans/` là
  vòng FE vừa hoàn thành (chưa đánh dấu completed), không chặn phase này.
- **Blocks:** khối admin (Auth → Upload+CRUD) — form ảnh admin dựa trên cơ chế
  MinIO URL phase này dựng.

## Validation Log

### Verification Results (Standard tier — 3 phase)
- Claims checked: ~12 | Verified: 12 | Failed: 0 | Unverified: 0
- `smoke-api.ts`, `minio-client.ts` tồn tại (Phase 1 pattern OK).
- Số hàng migrate thật: products 42, blog 267, stores 7, banners 3,
  media_attachments 35 (chỉ `owner_type='store'`), logo 1. Không có product/blog media.
- `logo_storage_key` nằm trong `site_settings` dạng key-value row (không phải cột).

### Quyết định chốt (Session 1)
1. **Cơ chế migrate:** SQL migration tra bucket một lần → sinh mapping
   basename→fullkey → UPDATE. Map theo bucket thật (bắt banner→`site/`). Idempotent.
   *Không* suy prefix theo tên bảng (sai cho banner).
2. **Production media path:** nginx thêm `location /media/` proxy tới MinIO (giống
   `/api/`), `VITE_MINIO_BASE_URL=/media`. Không lộ MinIO ra internet, cùng origin.
3. **Logo:** migration xử lý riêng — `UPDATE site_settings SET value='site/'||value
   WHERE key='logo_storage_key'` (khác cơ chế cột ảnh).

### Whole-Plan Consistency Sweep
- Sửa plan.md overview: bỏ prefix `banners/` khỏi danh sách (banner ở `site/`) —
  mâu thuẫn với phát hiện Phase 2, đã reconcile.
- Sửa Phase 3 bước 2: bỏ "hoặc public URL", chốt `location /media/` proxy.
- Phase 1 "public URL" (localhost:9000) giữ nguyên — đúng ngữ cảnh dev, không mâu thuẫn.
- Phase 2 hai chỗ `banners/` giữ nguyên — đang cảnh báo KHÔNG dùng, đúng chủ đích.
- **Kết quả:** 0 mâu thuẫn chưa giải quyết. Plan sẵn sàng implement.
