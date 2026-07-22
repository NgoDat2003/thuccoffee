---
phase: 2
title: "Upload API backend multipart MinIO"
status: completed
priority: P1
effort: "1d"
dependencies: [1]
---

# Phase 2: Upload API backend — multipart → validate → MinIO

## Overview

`POST /api/admin/uploads`: nhận multipart qua multer (memory storage), validate
3 lớp, server sinh object key an toàn theo `kind`, put lên MinIO bằng
`minioClient` sẵn có, trả `{ objectKey }`. Sau phase này `smoke:upload` xanh.

## Requirements

- Functional: 8 assert Phase 1 pass; object key ghi được thẳng vào cột ảnh ở
  các plan CRUD sau (cùng format full key hiện tại).
- Non-functional: không nhận path/tên từ browser vào key; giới hạn size;
  lỗi multer bọc ApiResponse; server lint/build sạch.

## Architecture

### Deps
- `multer` + `@types/multer` (memory storage — file vài MB, không cần disk temp).
- KHÔNG thêm lib magic-byte: tự viết check bytes đầu cho 4 loại allow
  (`png` `89504E47`, `jpg` `FFD8FF`, `webp` `52494646...57454250`,
  `gif` `47494638`) — ~20 dòng, tránh dep cho việc bé.

### Module `server/src/modules/uploads/`
- `uploads.schemas.ts`:
  - `uploadKindSchema = z.enum(['products', 'blog', 'stores', 'banners', 'site'])`
    — khớp prefix bucket thực tế. `kind` lấy từ **field multipart** (không query,
    để form gửi một request duy nhất).
  - Hằng: `MAX_UPLOAD_BYTES = 5 * 1024 * 1024`;
    map extension→magic-byte allow-list.
- `uploads.service.ts`:
  - `validateImage(buffer, originalName, mimetype)`: 3 lớp — mimetype thuộc
    allow-list; extension từ originalName thuộc allow-list; magic bytes khớp
    extension. Sai lớp nào → `ApiError.badRequest` message rõ.
  - `buildObjectKey(kind, ext)`: `${kind}/${randomUUID()}${ext}` — KHÔNG dùng
    tên gốc trong key (chống traversal + trùng tên). Tên gốc chỉ để lấy ext
    (lowercase, validate allow-list trước).
  - `uploadImage(...)`: `minioClient.putObject(env.MINIO_BUCKET, key, buffer,
    size, { 'Content-Type': contentTypeFromExtension(ext) })` → trả key.
    **Content-Type trên object đặt từ extension ĐÃ validate, KHÔNG từ mimetype
    client gửi** (red-team: client kiểm soát mimetype header → kiểm soát
    Content-Type object serve ra; map từ ext đã qua allow-list thì không).
- `uploads.routes.ts`:
  - `multer({ storage: memoryStorage, limits: { fileSize: MAX_UPLOAD_BYTES,
    files: 1 } })`.
  - `POST /` → multer single('file') → validate `kind` (Zod) → validateImage →
    uploadImage → `201` + `ok({ objectKey })`.
    **Thứ tự bắt buộc (red-team):** với multipart, `req.body` CHỈ tồn tại SAU
    multer middleware — Zod parse `kind` phải nằm trong handler sau multer,
    không phải middleware validate trước route.
  - Express 5 auto-forward async error (như auth) — không try/catch thủ công.

### Error handling multer
`error-handler.ts` thêm nhánh: `err instanceof MulterError` → 400
(`LIMIT_FILE_SIZE` → message "File vượt quá 5MB"), bọc ApiResponse. Nếu không
map, multer lỗi rơi vào 500 generic — assert 7 Phase 1 sẽ đỏ.

### Wiring
`admin.routes.ts` là router tổng hợp (chốt ở phase 4, áp dụng từ đây):
`adminRoutes.use('/uploads', uploadsRoutes)`. Guard duy nhất giữ ở index.ts
(`app.use('/api/admin', requireAuth, adminRoutes)` — đã có sẵn, không đổi).

## Related Code Files

- Create: `server/src/modules/uploads/{uploads.routes,uploads.schemas,uploads.service}.ts`
- Modify: `server/src/common/error-handler.ts` (nhánh MulterError),
  `server/src/index.ts` hoặc `admin.routes.ts` (mount), `server/package.json` (deps)
- Read for context: `server/src/lib/minio-client.ts`, `seed-images.ts` (put pattern),
  `server/src/modules/auth/*` (module pattern)

## Implementation Steps

1. Cài `multer` + `@types/multer`.
2. Viết uploads.schemas (kind enum, size const, magic map).
3. Viết uploads.service (validateImage 3 lớp, buildObjectKey UUID, uploadImage).
4. Viết uploads.routes (multer memory, single file).
5. Map MulterError trong error-handler.
6. Mount dưới guard admin.
7. Server lint/build; chạy `smoke:upload` → XANH 8/8.

## Success Criteria

- [x] `smoke:upload` XANH 8/8 (guard, happy, MinIO thật, giả mạo, ext, kind,
      size, thiếu file).
- [x] Object key format `kind/uuid.ext`, không chứa input browser.
- [x] MulterError trả ApiResponse bọc, không HTML/500.
- [x] Server lint/build sạch.

## Risk Assessment

- **Rủi ro:** multer 2.x API khác 1.x (MulterError import path). Kiểm version
  cài thực tế trước khi viết nhánh error-handler.
- **Rủi ro:** WEBP magic phức tạp hơn (RIFF....WEBP 2 đoạn). Test đủ 4 loại
  trong smoke hoặc thu allow-list còn png/jpg nếu muốn gọn — chốt lúc impl,
  ghi rõ trong code.
- **Rollback:** module độc lập; bỏ mount là tắt upload, không đụng gì khác.
