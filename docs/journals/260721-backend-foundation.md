# Nhật ký — Nền tảng Backend

Ngày: 2026-07-21
Nhánh: `feat/backend`
Phạm vi: từ tag `v1.0.0` (frontend tĩnh hoàn chỉnh) đến hết Phase 4 của
`plans/260720-1730-backend-foundation`.

## Đã làm

Dựng nền backend cho bản clone vốn chỉ có frontend tĩnh:

- **Phase 1** — `server/` như package riêng: Express 5 + helmet/compression/cors/pino,
  validate biến môi trường bằng Zod, envelope `ApiResponse<T>`, error handler
  chung, route health. Dọn 4 file cấu hình gốc để `server/` không lọt vào build
  frontend hay bị oxlint quét nhầm.
- **Phase 2** — Postgres 16 qua Compose, có volume; kiểm chứng dữ liệu sống sót
  qua `restart` và `down`/`up`.
- **Phase 3** — schema Drizzle 14 bảng, migration, client.
- **Phase 4** — seed 42 sản phẩm, 10 blog, 7 cửa hàng, 10 danh mục, 35 ảnh
  gallery, 6 catalog option. Idempotent.

Kết quả kiểm chứng độc lập (không tin claim): 14 bảng, số bản ghi khớp, ngày
`DD.MM.YYYY` parse đúng, tiếng Việt nguyên dấu, seed + migration chạy lại không
đổi, build/lint sạch, không lọt `.env`.

## Quyết định quan trọng và lý do

**Monorepo, không tách nhánh FE/BE.** Ban đầu định tách hai nhánh riêng, nhưng
`src/data/types.ts` dùng chung giữa frontend và backend — tách ra sẽ khiến hai
bên lệch kiểu mà không ai phát hiện. Chọn `server/` trong cùng repo; frontend
import thẳng kiểu từ backend, không qua bước sinh code.

**Express, không NestJS/Hono.** NestJS quá nặng cho ~15 endpoint. Express phổ
biến, dễ bàn giao. Tổ chức code theo module tài nguyên như dự án QA/QC của công
ty (đã scout), nhưng dùng Zod thay class-validator nên gộp 4 loại schema vào một
file thay vì 4 file.

**Không dùng OpenAPI/Orval.** Dự án QA/QC dùng vì có 139 endpoint (sinh 15.000
dòng client). Dự án này ~15 endpoint — pipeline codegen đắt hơn phần tiết kiệm.
Chia sẻ kiểu qua import trực tiếp trong monorepo là đủ.

**Envelope bọc mọi phản hồi** `{ success, data }` / `{ success, error }`. Khác
cách QA/QC (trả trần) — chọn bọc để một `ApiResponse<T>` phủ mọi endpoint và
discriminated union ép frontend xử lý cả nhánh lỗi. HTTP status giữ đúng ngữ
nghĩa: 404 vẫn là 404, không phải 200 kèm `success: false`.

**Schema từ 7 → 14 bảng sau khi đối chiếu admin thật.** Danh sách menu admin và
một báo cáo audit hé lộ các thực thể mặt trước không thấy: catalog option dùng
chung, sticker nhiều-nhiều, banner nhiều loại, site settings, media có thứ tự.
Sửa ba lỗi cardinality mình từng thiết kế sai (1-sticker, option sở hữu riêng,
gallery `text[]`). **Giữ phạm vi** — không theo đề xuất "admin parity ~20 bảng":
không orders (0 đơn thật), không localized_texts, không audit/soft-delete mọi
bảng, không upload.

**Media thiết kế sẵn cho MinIO.** Cột `storage_key` giờ là tên file (ảnh trong
repo), sau chuyển thành object key MinIO mà không migrate. MinIO free, tự host
container — đúng cách QA/QC lưu ảnh.

## Bài học

- **Bản scout tĩnh không thấy hết cái admin quản lý.** Menu admin và audit lộ
  ra 5 nhóm thực thể mà crawl mặt trước bỏ sót. Thiết kế DB từ nội dung hiển thị
  là chưa đủ.
- **Verify độc lập bắt được doc lệch code.** Sau khi Codex cook, tài liệu vẫn
  ghi `price` NOT NULL và "11 sản phẩm giá ước tính", trong khi code đúng là
  nullable và dữ liệu thật là 10. Sửa doc theo code.
- **`tsconfig.seed.json` tách riêng** cho phép seed import `src/data` mà không
  kéo file ngoài `rootDir` vào build chính — vấn đề đã lường trước ở plan.

## Còn lại / bước sau

- Giai đoạn tiếp: API đọc (GET `/api/products`, `/api/blog`…), rồi frontend đổi
  ruột `src/data/index.ts` sang `fetch`, rồi auth + admin CRUD.
- Frontend vẫn đọc `src/data/*.ts`; hai nguồn cùng tồn tại tới khi API sẵn sàng.
- Blog thật có 267 bài (clone chỉ 10, giả 54 trang). Khi dùng dữ liệu thật,
  phân trang rút xuống theo số bài thật — cần chốt trước khi seed lại.
- CI build được `server/` nhưng không chạy migration/seed (không có DB trong
  CI) — phần đó verify thủ công.

## Ghi chú vận hành

- Postgres chạy qua `docker compose up -d postgres`; dữ liệu còn nhờ volume.
- Không tự commit/push — theo quy tắc `CLAUDE.md`.
- Hai remote: `origin` (cá nhân, mặc định), `work` (công ty). `feat/backend`
  đã có trên cả hai, đồng bộ tại `562efe8`.
