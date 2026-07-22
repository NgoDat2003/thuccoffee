# Admin MVP — Brainstorm Chốt Quyết Định Phạm Vi

**Ngày:** 2026-07-22
**Nhánh:** `feat/admin-mvp`
**Trạng thái:** Brainstorm đã chốt — nền cho `/ck:plan`
**Nguồn vào:** `plans/reports/260722-thuccoffee-admin-management-scope-and-db-gap-report.md`
(research brief, đã verify khớp code thật)

## 1. Bối cảnh

Vòng "FE đọc API" đã khép (merge `bc81679` vào `main`, bàn giao work). Bước tiếp
theo roadmap là admin. Report scope (nguồn vào) là research brief chất lượng cao,
verify code xác nhận mọi khẳng định kỹ thuật chính đều đúng:

- Không có auth dep (`argon2`/`jsonwebtoken`/session) trong `server/package.json`.
- Backend chỉ có 9 public GET, chưa có `/api/admin/*` hay write route.
- `users` có sẵn `check(role in ('admin','editor'))`.
- `products`/`blog`/`stores` có `slug unique`, `isPublished`, **không** `deletedAt`.
- `media_attachments` polymorphic, không FK cứng.
- `seed.ts` upsert + delete-recreate → ghi đè content nếu chạy lại sau khi admin sửa.
- FE resolve ảnh qua `import.meta.glob('/src/assets/images/**')` — bundle đóng băng
  lúc build; DB chỉ lưu tên file trần.

Report cố ý để mở 10 quyết định (mục 20). Brainstorm này chốt **4 câu ảnh hưởng
schema/contract** — phần bắt buộc trước khi vào plan. Các câu còn lại
(dashboard, allow-list HTML tag, v.v.) chốt sau ở từng phase.

## 2. Bốn quyết định đã chốt

| # | Chủ đề | Quyết định | Hệ quả kỹ thuật |
|---|---|---|---|
| 1 | **Media** | **Upload MinIO thật** (bắt buộc, nghiệp vụ) | Cần phase media nền: đổi `getImageUrl()` FE, upload API có auth + validate, xử lý orphan |
| 2 | **Delete** | **Chỉ publish/unpublish** cho MVP | Không thêm `deletedAt`, không hard delete. Soft/hard delete là phase sau nếu có nhu cầu |
| 3 | **Slug** | **Khóa slug sau khi tạo** | Không redirect table, không đổi slug sau publish. Đổi = xóa tạo lại (hiếm) |
| 4 | **Role** | **Một admin duy nhất** | Không màn quản lý user, không RBAC. Constraint DB vẫn để sẵn 'editor' — bật sau không phải migrate |

### 2.1 Vì sao Media = MinIO (không phải asset picker)

Người dùng chốt: admin thật bắt buộc thêm được ảnh mới (sản phẩm/cửa hàng/banner
mới). Asset picker (chỉ chọn ảnh có sẵn) không đáp ứng nghiệp vụ này.

Đánh đổi đã chấp nhận: media không còn là "một nút upload" mà là **phần khó nhất**,
đụng FE đang chạy ổn (vừa verify xanh). 7 bước bắt buộc (report mục 9.2):

1. Chuyển FE resolve ảnh sang URL/object key MinIO (đụng `getImageUrl()`).
2. Chuẩn hóa basename hiện tại → relative object key.
3. Chốt canonical: direct image columns hay `media_attachments` (xem §4).
4. Upload API có auth, validate MIME/size/magic-byte.
5. Sinh object key an toàn, không nhận path tùy ý từ browser.
6. Xử lý delete/orphan/object đang tham chiếu/rollback DB↔object.
7. Không cấp MinIO credential cho browser, không public quyền write bucket.

### 2.2 Vì sao 3 quyết định còn lại theo hướng tối giản

- **Delete = unpublish**: schema chưa có `deletedAt`; unpublish tránh broken
  link/orphan mà không thêm cột. Đúng YAGNI.
- **Slug khóa**: slug là public URL, chưa có redirect table; khóa tránh 404 URL cũ.
- **Một admin**: chưa có người thứ hai; constraint DB đã để sẵn 'editor' nên bật
  sau không tốn migrate.

## 3. Thứ tự phase đã chốt: Media-read (M) → Auth → Upload+CRUD

Người dùng chốt tách media MinIO thành phase riêng, **làm trước cả auth**, nhưng
chỉ phần **đọc** (không upload — upload cần auth). Lý do: media-read gỡ đúng
blocker rủi ro cao (đụng `getImageUrl()` FE đang xanh) một cách độc lập, có giá
trị tự thân (hoàn tất "FE dùng backend thật" cho cả data lẫn media), verify xong
mới sang admin. Upload (write) cần auth nên nằm chung khối admin.

### Phase M — FE đọc ảnh từ MinIO (read-only, KHÔNG auth)

Không nhỏ như "đổi một hàm" — là migration + đồng bộ 3 tầng. Trạng thái verify:
- 498 ảnh đã trên MinIO, bucket public-read (anon GET = 200). Dữ liệu sẵn sàng.
- **Lệch key:** API/DB trả basename (`e600e38f_americano.jpg`); MinIO key có prefix
  thư mục (`products/e600e38f_americano.jpg`, `blog/xxx.png`). Không map trực tiếp.

**Quyết định chốt:** DB lưu **full object key** (không phải basename). Sạch nhất,
đúng luôn cho upload về sau; API trả sẵn key đúng, FE chỉ nối `MINIO_BASE_URL + key`.

**Việc bắt buộc (đồng bộ cùng lúc):**
1. Migration cập nhật cột ảnh: `products.thumb/image`, `blog_posts.cover`,
   `stores.image`, `banners.image`, `media_attachments.storage_key` → thêm prefix
   đúng loại. Map prefix từ chính cấu trúc thư mục bucket (`products/`, `blog/`,
   `stores/`, `banners/`).
2. Sửa `seed.ts` + `seed-images.ts` để seed sau ghi full key, không về basename.
3. Đổi `getImageUrl()`: bỏ `import.meta.glob`, nối `MINIO_BASE_URL + key`.
4. Đổi `resolveBlogContentImageUrls()` (ảnh inline trong HTML blog, pattern
   `src="blog-asset:filename"`) sang map `blog/` key — dễ sót.
5. Thêm env `MINIO_BASE_URL` (public bucket URL) cho FE, cả dev lẫn production (nginx).
6. Verify FE vẫn xanh tới DOM sau khi đổi (mọi page phụ thuộc `getImageUrl`).

### Phase Auth — foundation
- Deps: `argon2`, `jsonwebtoken` (hoặc session lib) + env validation Zod.
- Bootstrap admin từ env, không hardcode credential, không đặt trong `db:seed`.
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- Cookie httpOnly, `Secure` production, `SameSite=Lax` same-origin.
- Middleware chặn `/api/admin/*`; negative tests (sai mật khẩu, hết hạn, chưa login).

### Phase Upload + CRUD content (cần auth)
- Upload API có auth + validate MIME/size/magic-byte; sinh object key an toàn; orphan.
- Product + category (transaction M:N) → Blog (sanitize HTML, server pagination)
  → Store + gallery (media_attachments transaction) → Banner (tabs theo type)
  → Site settings (allow-list 11 keys).

Ngoài ra, trước go-live phải **tách seed lifecycle** (report mục 11): migration /
bootstrap-once / dev-reset / admin-provision / import-job. Bắt buộc, không optional.

## 4. Canonical media — đã chốt

**Giữ phân đôi hiện tại**, chỉ đổi định dạng giá trị lưu (basename → full key):
- **Cột text** (`products.thumb/image`, `blog.cover`, `stores.image`,
  `banners.image`) = ảnh chính đơn (1 ảnh/record).
- **`media_attachments`** (`storage_key`) = tập ảnh có thứ tự (store gallery).

Không migrate ảnh chính sang polymorphic relation (nặng, rủi ro, không cần). Cả
hai nơi chuyển sang lưu **full object key** trong Phase M. Upload (Phase sau) ghi
object key vào đúng cột/bảng tương ứng.

## 5. Ranh giới — cố ý KHÔNG làm trong MVP

Theo report (KEEP/DEFER/REJECT) và 4 quyết định trên:

- **DEFER**: options/stickers (0 data, 0 consumer FE), static_pages/FAQ
  (0 consumer), users/RBAC (một admin), media library đầy đủ (chỉ upload đơn giản
  cho form), dashboard aggregate (`/admin` redirect vào products).
- **REJECT**: orders/customers/payment (không có cart/checkout thật), copy generic
  legacy ItemMaster, ba module banner riêng (một bảng + tabs là đủ).
- **Slug redirect, soft delete, audit log**: P2, chỉ khi có yêu cầu.

## 6. Bước tiếp theo

`/ck:plan` tạo implementation plan theo vertical slice chạy được, mỗi phase ghi đủ:
files, route + schema, service/transaction, auth/role, validation/error, query
key/invalidation, UI state, tests, rollback, và nội-dung-cố-ý-không-làm
(report mục 17).

## 7. Câu chưa chốt (không chặn plan, chốt ở phase liên quan)

- Blog HTML allow-list gồm tag/attribute nào (Phase Blog).
- Có dashboard thật hay `/admin` redirect products (Phase shell — nghiêng redirect).
- JWT vs session cookie cụ thể (Phase 1 — cần chốt threat model, expiry, CSRF).
- Concurrent update: gửi `updatedAt`, trả 409 — defer được với một admin.
