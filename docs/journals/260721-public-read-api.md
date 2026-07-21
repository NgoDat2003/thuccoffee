# Nhật ký — Public Read API + MinIO

Ngày: 2026-07-21
Nhánh: `feat/backend` (chưa merge main — FE chưa đọc API)
Phạm vi: từ sau backend-foundation đến hết public read API (9 endpoint) + MinIO
kho ảnh. Commit `c71c00e` → `0218eaa`.

## Đã làm

**MinIO kho ảnh** (`c71c00e`): thêm service `minio` + `minio-init` + `backend`
Dockerfile vào compose; script `seed-images.ts` đẩy toàn bộ ảnh
`src/assets/images/**` lên bucket public-read, key = đường dẫn tương đối. FE giữ
tĩnh — MinIO là kho chuẩn bị, chưa ai đọc.

**Blog cào đủ** (`97f1ca8`): từ 10 bài giả 54 trang → 267 bài thật, content HTML
lazy-load qua `blog-content.ts` + `resolveBlogContentImageUrls`.

**API đọc 8 GET** (`1a3346b`): categories, banners, stores, blog, products —
module theo tài nguyên (schemas+service+routes), validate middleware, chỉ trả
published. Blog phân trang DB thật; products join categories không N+1.

**Hoàn thiện** (`ab8c849`): `GET /api/site-settings` (allow-list→camelCase),
store detail thêm ordered gallery, seed 3 banner + 11 settings idempotent.

**Fix IDE** (`0218eaa`): tách tsconfig — `tsconfig.json` bao src+scripts (VSCode
dùng), `tsconfig.build.json` chỉ emit src.

## Quyết định quan trọng và lý do

**Ảnh: key = đường dẫn tương đối, không basename.** Validate bắt được 5 file
trùng basename giữa thư mục con — basename sẽ đè mất ảnh. Hệ quả: vòng FE sau
`getImageUrl()` (đang map basename) phải đổi nhận path đầy đủ.

**price non-null.** Verify psql: 0 sản phẩm null (docs cũ ghi "10 nullable" —
sai, đó là `priceEstimated`). Response `price: number`, sửa `src/data/types.ts`
FE khớp — touchpoint FE duy nhất của vòng đọc.

**site-settings/pages là resource API riêng, không aggregate.** Từ chối
`/api/site-bootstrap` gom hết — resource API khớp module pattern, cache độc lập.

**Hoãn pages API (Membership/Careers).** Report định lưu `static_pages.content`
= HTML string, nhưng 2 trang này hiện là structured data (`tiers[]`, `jobs[]`)
render JSX có layout. HTML string → `dangerouslySetInnerHTML` → mất layout. Đánh
đổi chưa rõ → quyết cùng lúc làm admin.

**Chưa merge main.** CLAUDE.md: chỉ merge khi FE đã đọc API. FE còn tĩnh → giữ
ở `feat/backend`.

## Bài học

- **Verify động bắt lỗi mà build không thấy.** Mỗi vòng chạy compose + seed +
  smoke thật: bắt được 601 ảnh (không phải 155), `smoke-api` ngoài mọi tsconfig
  (IDE đỏ mà build xanh), missing-key→500 đúng. Tin trạng thái plan là không đủ.
- **`tsconfig.scripts.json` sai cách.** Lần đầu tạo file này giúp *build* nhưng
  VSCode không đọc (không được reference) → IDE vẫn đỏ. Gốc: VSCode chỉ tự dùng
  `tsconfig.json`; file ngoài `include` rơi vào inferred project thiếu
  `@types/node`. Fix đúng: đưa scripts vào include của chính `tsconfig.json`.
- **Doc lệch data thật.** "10 sản phẩm nullable" và "11 estimated" đều sai so với
  psql. Sửa doc theo DB, không sửa data theo doc.

## Còn lại / bước sau

- **Vòng FE đọc DB** (bước 6): đổi ruột `src/data/index.ts` sang fetch +
  TanStack Query. Nhưng nhiều component đọc thẳng array (`BlogCarousel`,
  `StoreLocator`, `DesktopNav`, Header/Footer/MobileDrawer hardcode settings) —
  KHÔNG chỉ `index.ts`. Đây là lúc FE bỏ tĩnh + quyết đọc ảnh từ MinIO.
- **Pages API** — quyết structured-vs-HTML khi làm admin.
- **Auth (bước 7) → Admin CRUD (bước 8).** Auth phải trước CRUD. Dựng
  vitest+supertest+test DB ở vòng auth (đã hoãn từ vòng đọc).
- Blog phân trang: FE `getBlogPage` còn lặp bài giả 54 trang — API thật đã bỏ,
  FE bước 6 phải xử. Xem memory blog-real-post-count-267.

## Ghi chú vận hành

- Backend đọc hoàn chỉnh: 9 endpoint, smoke 9/9 pass.
- Không tự merge main; task sau rẽ từ `feat/backend`.
- Push origin (cá nhân); chưa đẩy work (công ty).
