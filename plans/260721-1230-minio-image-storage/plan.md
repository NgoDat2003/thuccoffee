---
title: "MinIO Image Storage"
description: "Dựng MinIO làm kho ảnh và đẩy toàn bộ ảnh (số động, key = path tương đối) lên bucket. FE giữ nguyên tĩnh; chuyển FE sang đọc ảnh MinIO là việc của vòng API đọc."
status: completed
priority: P2
branch: "feat/backend"
tags: [infra, minio, storage]
blockedBy: []
blocks: []
created: "2026-07-21T05:31:48.102Z"
createdBy: "ck:plan"
source: skill
---

# MinIO Image Storage

## Tổng quan

Dựng đủ hạ tầng server local (thêm `backend` + `minio` vào compose) và đẩy toàn
bộ ảnh trong `src/assets/images/**` (~601 file, số động do đang cào đủ blog) lên
bucket MinIO `thuccoffee` (public-read), key = đường dẫn tương đối.

**FE không đụng tới vòng này.** `getImageUrl()`, `src/assets/images`, 15 file FE
giữ nguyên — FE vẫn chạy tĩnh, đọc ảnh local. MinIO là kho chuẩn bị: vòng **API
đọc** sau sẽ trả URL ảnh MinIO cho FE, lúc đó FE mới bỏ ảnh local.

Nguồn: `reports/brainstorm-summary.md`
Thiết kế liên quan: `docs/database-design.md` (`media_attachments.storage_key`),
`docs/backend-architecture.md`.

## Phạm vi

- Thêm service `backend` (có `server/Dockerfile`) + `minio` + `minio-init` vào
  `compose.yaml`.
- Bucket `thuccoffee` public-read + CORS, tạo tự động qua `minio-init`.
- Script seed một lần: đẩy toàn bộ ảnh lên bucket, key = đường dẫn tương đối
  (5 file trùng basename → không dùng tên trần). Idempotent, số ảnh động.
- Env MinIO validate bằng Zod trong `server/src/common/env.ts` + `.env.example`.
- Cập nhật docs cho khớp thực tế (MinIO đã dựng, ảnh vẫn ở repo cho FE tĩnh).

## Ngoài phạm vi

- Sửa FE / `getImageUrl()` — vòng API đọc.
- API endpoint, seed `media_attachments`, đọc ảnh từ API — vòng API đọc.
- Presigned URL (bucket công khai, không cần), upload runtime (admin sau).
- Xóa `src/assets/images` khỏi repo — ảnh vẫn commit làm nguồn gốc.

## Quyết định đã chốt (brainstorm)

| Mục | Chọn |
|---|---|
| FE vòng này | Giữ tĩnh, không đụng |
| Policy bucket | Public-read, URL cố định |
| Upload | Script seed một lần, không runtime |
| Key ảnh MinIO | Đường dẫn tương đối (không basename — 5 file trùng) |
| Số ảnh | Động (~601, đang cào đủ blog) — không hardcode |
| `media_attachments` | Không seed vòng này |
| Backend container | Có Dockerfile riêng |
| Ảnh trong repo | Giữ (nguồn gốc), không xóa |

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Hạ tầng compose và backend Dockerfile](./phase-01-h-t-ng-compose-v-backend-dockerfile.md) | Pending |
| 2 | [Bucket MinIO và script seed ảnh](./phase-02-bucket-minio-v-script-seed-nh.md) | Pending |
| 3 | [Kiểm chứng và cập nhật docs](./phase-03-ki-m-ch-ng-v-c-p-nh-t-docs.md) | Pending |

## Dependencies

Nối tiếp `plans/260720-1730-backend-foundation` (đã completed). Không có plan
đang mở nào bị ảnh hưởng. Vòng sau (API đọc) sẽ phụ thuộc kho ảnh này.

## Validation Log

### Session 1 — 2026-07-21

**Verification Results (Standard tier: Fact Checker + Contract Verifier)**
- Claims checked: 5
- Verified: 3 | Failed: 2 | Unverified: 0
- Verified: `tsconfig.seed.json` tồn tại và dùng include liệt kê tường minh
  (không glob); `media_attachments.storage_key` có trong schema; `getImageUrl()`
  map theo basename (`src/lib/image-url.ts`).
- **Failed #1:** plan ghi "155 ảnh" — thực tế `find src/assets/images -type f`
  = **601** file. Nguyên nhân: 155 là số cũ từ khi blog mới 10 bài; đang cào đủ
  blog nên ảnh tăng. → Bỏ hardcode, dùng số động + so khớp count.
- **Failed #2:** dùng key = basename sẽ đè ảnh — **xác nhận 5 file trùng
  basename** giữa các thư mục con (`uniq -d`). → Chốt key = đường dẫn tương đối.

**Quyết định từ interview**
- Key ảnh MinIO = **đường dẫn tương đối** (không basename). Hệ quả: vòng API sau
  phải đổi `getImageUrl()` nhận path đầy đủ — ghi trong phase-02, không làm vòng
  này.
- Số ảnh **không hardcode** (động, đang cào đủ blog). Con số 155/601 chỉ tham
  khảo; verify bằng so khớp `find` count.

### Whole-Plan Consistency Sweep
- Đã rà `plan.md` + 3 phase: mọi chỗ "155 ảnh" và "tên file trần/basename" đã
  đổi sang "toàn bộ ảnh / số động" và "đường dẫn tương đối".
- Success criteria Phase 2 & 3 đổi từ số cứng sang so khớp count.
- Không còn mâu thuẫn tồn đọng.

### Final Review — trước khi cook (2026-07-21)
Ba điểm chỉnh để Codex không vấp:
1. **CORS bỏ khỏi vòng này** (YAGNI — FE tĩnh chưa gọi MinIO; CORS MinIO set qua
   env `MINIO_API_CORS_ALLOW_ORIGIN`, không qua `mc`). Để vòng API.
2. **Healthcheck minio:** image có thể thiếu `curl` → ghi chú Codex kiểm tra
   binary (`mc ready`) trước khi chốt lệnh.
3. **Backend trong container không có `.env`** → env truyền qua compose; thiếu
   `.env` là bình thường, không phải lỗi.
