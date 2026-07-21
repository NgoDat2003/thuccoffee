# Brainstorm — MinIO làm kho ảnh (FE giữ tĩnh)

> **Đính chính (validation session 1):** con số "155 ảnh" và "key = tên file
> trần" trong report này SAI, giữ lại làm lịch sử. Thực tế ~601 file (số động,
> đang cào đủ blog) và key = **đường dẫn tương đối** vì có 5 file trùng basename.
> Quyết định cuối nằm ở `plan.md` → `## Validation Log`.

Ngày: 2026-07-21
Nhánh dự kiến: `feat/backend` (tiếp) hoặc nhánh con `feat/minio-storage`

## Vấn đề

Muốn dựng đủ hạ tầng server (FE, BE, Postgres, MinIO). Hiện compose chỉ có
`frontend` + `postgres`. Cần dựng MinIO làm kho ảnh và đẩy 155 ảnh lên đó.

## Quyết định chốt (qua hỏi-đáp)

- **FE giữ nguyên tĩnh vòng này.** Không đụng `getImageUrl()`, `src/assets/images`,
  15 file FE. FE vẫn đọc ảnh local như hiện tại.
- **MinIO là kho chuẩn bị cho tương lai.** Vòng này chỉ hạ tầng + đẩy ảnh lên.
  FE chuyển sang đọc ảnh MinIO là việc của vòng **API đọc** (API trả URL ảnh).
- **Bucket public-read.** Ảnh menu/blog/store vốn công khai → không cần presigned.
  API sau chỉ trả URL tĩnh. Presigned là over-engineering cho ảnh công khai.
- **Upload = script seed một lần**, không upload runtime. Ảnh vẫn commit repo làm
  nguồn gốc.
- **Không seed `media_attachments` vòng này** — để vòng API làm cùng lúc dùng tới.
- **Backend có Dockerfile riêng** để compose lên đủ 4 service trong container.

## Trạng thái codebase (scout)

- Compose: chỉ `frontend` + `postgres`. Chưa có `minio`, chưa có service `backend`.
- Ảnh: 155 file (~51MB) trong `src/assets/images/**`, phục vụ qua `getImageUrl()`
  ([src/lib/image-url.ts]), dùng ở 15 file FE.
- Schema đã thiết kế sẵn: `media_attachments.storage_key` cố ý để "tên file bây
  giờ → object key MinIO sau, không migrate" ([server/src/db/schema.ts:141]).
- FE hoàn toàn tĩnh, `src/data/index.ts` vẫn đọc array, chưa gọi backend.
- Mâu thuẫn docs đã lường: `database-design.md` + `backend-architecture.md` ghi
  "MinIO/upload là giai đoạn sau, ảnh ở repo". Vòng này đảo một phần (dựng MinIO
  sớm) — có chủ đích, docs cần cập nhật sau.

## Phạm vi vòng này

**Trong phạm vi:**
1. `server/Dockerfile` — multi-stage node build.
2. Compose +3 service: `backend` (8080, depends_on postgres healthy),
   `minio` (9000 API / 9001 console, volume `minio-data`, healthcheck
   `/minio/health/ready`), `minio-init` (dùng `mc` tạo bucket `thuccoffee` +
   set public-read + CORS, chạy 1 lần rồi thoát).
3. Script `server/src/db/seed-images.ts` — đọc 155 file, `minio` SDK `putObject`
   key = tên file trần (khớp `storage_key`), idempotent. Thêm script
   `db:seed-images` vào `server/package.json`.
4. Env MinIO (`MINIO_ENDPOINT/PORT/ACCESS_KEY/SECRET_KEY/BUCKET`) vào
   `server/src/common/env.ts` (Zod) + `.env.example`.
5. Cập nhật `docs/database-design.md` + `docs/backend-architecture.md`.

**Ngoài phạm vi:** sửa FE/`getImageUrl`, API đọc, seed `media_attachments`,
presigned URL, upload runtime, xóa ảnh khỏi repo.

## Acceptance

- `docker compose up` → mọi service healthy.
- MinIO console `:9001` thấy 155 object trong bucket `thuccoffee`.
- `curl http://localhost:9000/thuccoffee/{tên-file}` trả ảnh 200.
- FE `:3000` chạy y như cũ, ảnh vẫn từ `/assets/` (FE chưa đổi).
- Seed ảnh chạy lại không lỗi (idempotent).

## Rủi ro

- CORS bucket: set sẵn trong `minio-init` cho vòng API sau.
- Access key production: local dùng mặc định; prod phải đổi + không mở console
  ra ngoài (giống nguyên tắc Postgres trong `docs/deployment.md`).
- Ảnh tồn tại 2 nơi (repo + MinIO): bước đệm có chủ đích, không phải trùng lặp
  cần dọn. Docs ghi rõ để lần sau không hiểu nhầm.

## Bước sau (ngoài phạm vi, ghi để nối mạch)

- Vòng API đọc: GET endpoints trả URL ảnh MinIO (join `media_attachments`),
  rồi FE đổi `getImageUrl()` đọc từ API/MinIO, bỏ ảnh local ở runtime.
- Liên quan memory: [[blog-real-post-count-267]] — khi seed lại blog thật.
