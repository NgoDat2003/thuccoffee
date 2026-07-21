---
phase: 2
title: "Bucket MinIO và script seed ảnh"
status: completed
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 2: Bucket MinIO và script seed ảnh

## Overview

Đẩy toàn bộ ảnh trong `src/assets/images/**` (~601 file, số động vì đang cào đủ
blog) lên bucket `thuccoffee`, key = **đường dẫn tương đối từ `images/`** (vd
`blog/post-1.jpg`). Script idempotent, chạy qua npm. Thêm env MinIO validate bằng
Zod.

<!-- Updated: Validation Session 1 — key = path tương đối, không phải basename (5 file trùng basename). Số ảnh không hardcode. -->

## Requirements

- Functional: script đọc toàn bộ ảnh trong `src/assets/images/**`, upload lên
  bucket với key = **đường dẫn tương đối** (giữ thư mục con), content-type đúng
  theo đuôi file; chạy lại không lỗi và không nhân đôi.
- Non-functional: đọc cấu hình từ env (Zod-validated); log số ảnh đã đẩy; không
  hardcode key/endpoint và **không hardcode số lượng ảnh** (số động).

## Architecture

- Thêm dep `minio` (official MinIO JS client) vào `server/package.json`.
- Env mới trong `server/src/common/env.ts`:
  `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`,
  `MINIO_BUCKET`, `MINIO_USE_SSL` (bool, default false). Validate cùng schema
  Zod hiện có, đọc qua `env`.
- Script `server/src/db/seed-images.ts`:
  - glob `src/assets/images/**/*` (đường dẫn tương đối từ `server/` là
    `../../src/assets/images`, giống cách `seed.ts` import `../../../src/data`).
  - key = đường dẫn tương đối từ thư mục `images/` (vd `blog/post-1.jpg`),
    normalize dấu `/` (POSIX) kể cả trên Windows.
  - với mỗi file: `client.fPutObject(bucket, relKey, file, { 'Content-Type': mime })`.
  - Idempotent: `fPutObject` ghi đè theo key → chạy lại an toàn. Log tổng số.
- **Vì sao key = path chứ không phải basename:** có 5 file trùng basename giữa
  các thư mục con (verify bằng `find … -exec basename | sort | uniq -d`). Dùng
  basename sẽ để 5 ảnh đè nhau, mất ảnh. Path tương đối là duy nhất.
- **Hệ quả cho vòng API (ghi để không bất ngờ):** `getImageUrl()` hiện map theo
  **basename** (`path.split('/').pop()` trong `src/lib/image-url.ts`). Khi vòng
  API cho FE đọc ảnh MinIO, `storage_key` = path nên `getImageUrl()` phải đổi
  nhận path đầy đủ. Đây là scope vòng API, KHÔNG làm ở vòng này. Ngoài ra 5 cặp
  trùng basename nghĩa là `getImageUrl()` hiện tại đã có xung đột key tiềm ẩn
  trong `urlByFilename` Map — ghi nhận, không sửa ở vòng này.
- **Ràng buộc tsconfig:** giống `seed.ts`, file này import ngoài `rootDir` (đọc
  `src/assets`). Phải loại khỏi build chính (`tsconfig.json` `exclude`) và thêm
  đường dẫn cụ thể vào `tsconfig.seed.json` `include` (file này dùng liệt kê
  tường minh, không glob). Xem `seed.ts` làm mẫu.

## Related Code Files

- Modify: `server/package.json` (dep `minio` + script `db:seed-images`)
- Modify: `server/src/common/env.ts` (5-6 biến MINIO_*)
- Modify: `server/.env.example` (biến MINIO_* với giá trị mẫu local)
- Modify: `server/tsconfig.json` (`exclude` thêm `src/db/seed-images.ts`)
- Modify: `server/tsconfig.seed.json` (`include` thêm file mới)
- Create: `server/src/db/seed-images.ts`
- Create: `server/src/lib/minio-client.ts` (khởi tạo client từ env, tái dùng sau)

## Implementation Steps

1. `cd server && npm install minio`.
2. Thêm biến MINIO_* vào `env.ts` schema + `.env.example`.
3. Viết `server/src/lib/minio-client.ts`: tạo `new Minio.Client(...)` từ `env`.
4. Viết `seed-images.ts`: glob ảnh, map đuôi→mime, `fPutObject` từng file, đếm.
5. Thêm script `"db:seed-images": "tsx src/db/seed-images.ts"` vào package.json.
6. Cập nhật `tsconfig.json` exclude + `tsconfig.seed.json` include.
7. Chạy `npm run db:seed-images` (MinIO đang up từ Phase 1) → log số ảnh đã đẩy.
8. Chạy lại lần 2 → xác nhận idempotent (không lỗi, số không đổi).
9. `npm run build` + `npm run lint` sạch.

## Success Criteria

- [x] `npm run db:seed-images` đẩy đủ ảnh; số object trong bucket = số file từ
      `find src/assets/images -type f` (so khớp count, không hardcode).
- [x] MinIO console: bucket `thuccoffee` chứa object với key dạng path
      (`blog/…`, `store/…`), không có key trùng.
- [x] `curl http://localhost:9000/thuccoffee/{path/tên-file}.jpg` trả 200 + ảnh.
- [x] Chạy seed lần 2 không lỗi, không nhân đôi.
- [x] `npm run build` và `npm run lint` trong `server/` đều sạch.

## Risk Assessment

- **Trùng basename giữa thư mục con — ĐÃ XÁC NHẬN có 5 file.** Dùng basename sẽ
  mất ảnh. Mitigation: key = path tương đối (đã chốt). Không còn rủi ro đè nếu
  làm đúng.
- **Content-Type sai** → trình duyệt tải về thay vì hiển thị. Mitigation: map
  đuôi→mime tường minh (jpg/jpeg/png/webp/svg/gif).
- **`tsx` chạy `.ts` ngoài rootDir** giống seed.ts — đã có tiền lệ hoạt động,
  rủi ro thấp.
- **Số ảnh động** (đang cào đủ blog, ~601 và còn tăng). Không hardcode số ở bất
  kỳ đâu; verify bằng so khớp count.
