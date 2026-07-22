---
phase: 1
title: "Test-first: smoke upload contract"
status: completed
priority: P1
effort: "2h"
dependencies: []
---

# Phase 1: Test-first — smoke upload contract

## Overview

Khóa hợp đồng upload API bằng smoke script TRƯỚC khi implement, theo pattern
`smoke-auth.ts` (tsx, fetch, exit code, không test framework). Baseline ĐỎ
(route chưa có), xanh sau Phase 2. Upload là bề mặt tấn công — smoke phải phủ
cả case từ chối file giả mạo.

## Requirements

- Functional: test đường đi thật qua HTTP — auth guard, upload hợp lệ, từ chối
  file sai loại/giả mạo/quá size, object key server sinh.
- Non-functional: không dependency mới cho smoke; login lấy cookie qua
  `/api/auth/login` (dùng ADMIN_EMAIL/PASSWORD như smoke-auth).

## Architecture

`server/scripts/smoke-upload.ts`. Tự tạo file test bytes trong script (không
commit file binary): PNG thật = magic bytes `89 50 4E 47...` + payload nhỏ;
file giả mạo = bytes text nhưng đặt tên `.png` + Content-Type `image/png`.

Các assert (hợp đồng upload):
1. **POST /api/admin/uploads không cookie** → 401 (guard hoạt động).
2. **Upload PNG hợp lệ** (multipart field `file`, query/field `kind=products`) →
   201, body `{ objectKey }`; key bắt đầu `products/`, KHÔNG chứa tên file gốc
   nguyên trạng (server sinh, có phần ngẫu nhiên), kết thúc `.png`.
3. **Object tồn tại thật trên MinIO**: GET `MINIO_BASE/objectKey` → 200,
   bytes khớp đã upload.
4. **File text giả danh .png** (Content-Type image/png, magic bytes sai) →
   400/422, body `success:false` (magic-byte validate bắt được).
5. **Extension ngoài allow-list** (`.svg` hoặc `.exe`) → 400/422.
6. **`kind` ngoài allow-list** (vd `../../etc`) → 400/422 (không sinh key
   ngoài prefix cho phép — chống path traversal).
7. **File quá size limit** (> limit chốt ở Phase 2, vd 5MB) → 413 hoặc 400,
   phản hồi bọc ApiResponse (không phải HTML mặc định của multer).
8. **Thiếu file trong form** → 400.

## Related Code Files

- Create: `server/scripts/smoke-upload.ts`
- Modify: `server/package.json` (script `smoke:upload`)
- Read for context: `server/scripts/smoke-auth.ts` (pattern login + cookie),
  `server/src/common/api-error.ts`

## Implementation Steps

1. Đọc `smoke-auth.ts` — tái dùng helper request/assert/check + login lấy cookie.
2. Sinh test bytes trong memory: PNG tối thiểu hợp lệ (magic + IHDR),
   text bytes cho case giả mạo, buffer > size limit cho case 7.
3. Viết 8 assert trên; multipart dựng bằng `FormData` + `Blob` (Node 22 có sẵn,
   không cần dep).
4. Thêm `"smoke:upload": "tsx scripts/smoke-upload.ts"`.
5. Chạy baseline: xác nhận ĐỎ đúng kiểu (404 route chưa có), in rõ assert fail.

## Success Criteria

- [x] `npm run smoke:upload` chạy được khi stack chạy; baseline ĐỎ đúng.
- [x] 8 assert phủ: guard, happy path + key format, object thật trên MinIO,
      magic-byte, extension, kind traversal, size, thiếu file.
- [x] Không dependency mới; multipart bằng FormData/Blob built-in.

## Risk Assessment

- **Rủi ro:** multer trả lỗi size/parse dưới dạng lỗi riêng (MulterError),
  không qua ApiError → body không bọc. Assert 7-8 sẽ bắt — Phase 2 phải map
  MulterError trong error-handler.
- **Rủi ro:** PNG tối thiểu tự sinh không qua được validator magic-byte thật.
  Giảm thiểu: dùng PNG 1x1 base64 chuẩn (67 bytes) đã kiểm chứng.
