# Admin CRUD + UI — Brainstorm Chốt Quyết Định

**Ngày:** 2026-07-22 (cập nhật cùng ngày: đảo quyết định #5 — xem §2)
**Trạng thái:** Chốt xong — nền cho `/ck:plan` (1 plan full admin)
**Nguồn vào:**
- `plans/reports/260722-thuccoffee-admin-management-scope-and-db-gap-report.md` (ma trận màn hình, API contract §12, FE data flow §13)
- `plans/reports/260722-admin-mvp-scope-decisions-brainstorm.md` (4 quyết định scope: upload MinIO, delete=unpublish, slug khóa, một admin)
- Auth foundation đã merge `main` (`1fe1b3b`): guard `/api/admin/*`, `/admin/login`, `useMe`, smoke:auth 8/8

## 1. Bối cảnh

Auth xong, `main` có guard + login page + `useMe` hook. Bước 5 roadmap: admin CRUD.
Brainstorm này chốt các quyết định cấu trúc còn mở trước khi plan.

## 2. Quyết định đã chốt (vòng này)

| # | Chủ đề | Quyết định | Lý do / hệ quả |
|---|---|---|---|
| 1 | **UI stack** | Tailwind tự xây, KHÔNG thêm component library | ~8 primitive nhỏ (table, form field, dialog, badge, toast, status switch, pagination, confirm) viết tay như code hiện có. Không dep mới, đồng nhất style. Tự lo focus trap cho dialog. |
| 2 | **Blog editor** | Textarea HTML thô + preview render; server sanitize allow-list khi lưu | Khớp 267 bài HTML sẵn có, không dep. Người sửa quen HTML. Tiptap/markdown bị loại (rủi ro mất format + dep nặng). |
| 3 | **Dashboard** | `/admin` redirect `/admin/products` | Không aggregate API. YAGNI với 1 admin. |
| 4 | **Upload path** | Multipart qua backend (multer/busboy) → validate MIME/size/magic-byte → server put MinIO → trả object key | Credential ở server, validate tập trung. Presigned URL bị loại (over-engineering quy mô 1 admin). |
| 5 | **Cắt plan** | **1 plan full admin** trên một nhánh, merge một lần cuối. **2 mốc verify Docker**: mốc 1 sau products+categories (pattern chứng minh trước khi nhân bản), mốc 2 cuối toàn bộ. *(User đảo từ "4 plan nhỏ" cùng ngày — xác nhận tường minh qua AskUserQuestion, lý do: chạy liền mạch kiểu codex-code/Claude-verify.)* | Nhánh sống dài hơn, diff cuối lớn — chấp nhận. Thứ tự bên trong vẫn vertical slice, KHÔNG "hết API rồi mới UI". |
| 6 | **List API** | Blog server-side pagination+search; products/stores/banners/categories/settings trả hết, filter/sort client | 42 products, ~10 stores — server-side là boilerplate thừa. Blog 267 bài dùng lại pattern pagination public. |

## 3. Một plan full — thứ tự khối bên trong

Vertical slice: mỗi resource đi hết API admin + UI + invalidate, chạy được rồi mới sang resource sau. Hướng "API hết rồi mới UI" bị loại (API không consumer sẽ sai contract). Bốn khối dưới đây giờ là các NHÓM PHASE trong cùng một plan (không còn là plan riêng); verify Docker ở 2 mốc: sau Khối 2 và sau Khối 4.

### Khối 1 — Admin shell + Upload nền
- **AdminLayout**: sidebar (Sản phẩm/Danh mục/Bài viết/Cửa hàng/Banner/Cài đặt), topbar (tên user từ `useMe`, logout), content outlet. Không header/footer public.
- **Route guard**: unauthenticated → `/admin/login` (dùng `useMe` sẵn có). Route tree `/admin/*` sibling public tree trong `routes.tsx`.
- `/admin` → redirect `/admin/products`.
- **Upload API**: `POST /api/admin/uploads` multipart, auth guard, validate MIME/size/magic-byte, sinh object key an toàn theo prefix loại (`products/`, `blog/`, `stores/`, `banners/`), server put MinIO, trả `{ objectKey }`. KHÔNG nhận path từ browser.
- **FE `<ImageField>`**: component upload + preview dùng chung mọi form sau.
- Deps mới: multer (hoặc busboy) + types. MinIO client đã có.

### Khối 2 — Products + Categories (kết thúc = MỐC VERIFY DOCKER 1)
- Admin API products: list (trả hết, admin DTO có id/state/order/timestamps), detail, create/update (transaction M:N categories), publish/unpublish. Slug khóa sau tạo.
- Categories: sửa label/order (không CRUD đầy đủ — MVP giới hạn theo report §8.5).
- UI: `/admin/products` table (thumbnail, tên, slug, giá, categories, publish, order, updated, actions; filter/search client), `/admin/products/new`, `/admin/products/:id` form (ImageField cho thumb/image).
- Invalidate cả admin keys lẫn public keys (`products`, `menu`, `home`).
- Làm mẫu pattern cho các plan sau.

### Khối 3 — Blog
- Admin API: list server pagination+search, detail, create/update, publish/unpublish. Sanitize HTML allow-list khi lưu (chốt danh sách tag/attr trong plan này — dựa trên tag thực tế xuất hiện trong 267 bài).
- UI: `/admin/blog` list phân trang, `/admin/blog/new` + `/:id` editor textarea HTML + preview render + ImageField cover + unsaved-changes guard.

### Khối 4 — Stores + Banners + Settings (kết thúc = MỐC VERIFY DOCKER 2, toàn bộ)
- Stores: CRUD + publish + order; gallery reorder/add/remove qua `media_attachments` (transaction).
- Banners: CRUD + activate + order, một bảng, UI tabs theo type.
- Settings: đọc/sửa allow-list 11 keys cố định.
- Theo pattern Plan 2, ít quyết định mới.

## 4. Ràng buộc kế thừa (không bàn lại)

- Admin DTO tách public DTO; `ApiResponse<T>`; delete/unpublish đúng HTTP status; 204 không body.
- Zod validate mọi body/query; validation details theo field để form map lỗi.
- Module đóng theo tài nguyên (`server/src/modules/<resource>/` mở rộng admin routes hoặc module admin con — chốt trong plan 2).
- FE: `src/services/admin/*.service.ts` → hook → page; không axios trực tiếp trong page.
- Delete = unpublish (không hard delete, không `deletedAt`). Slug khóa. Một admin.
- Sau mutation: invalidate cả admin + public query keys liên quan.
- Log không chứa password/token/full HTML.

## 5. Rủi ro chính

| Rủi ro | Giảm thiểu |
|---|---|
| Upload: multer + magic-byte validate sai → nhận file độc | Validate 3 lớp: MIME header, extension allow-list, magic-byte thật (file-type hoặc đọc bytes đầu). Giới hạn size. Test file giả mạo trong smoke. |
| Sanitize HTML blog quá chặt → vỡ format 267 bài cũ | Trích tag/attr thực tế từ data hiện có trước khi chốt allow-list; test sanitize trên mẫu bài thật. |
| Dialog/focus trap tự xây thiếu accessibility | Dùng `<dialog>` element native (focus trap sẵn) thay vì div overlay. |
| Public site vỡ khi admin sửa content | Invalidate key đúng + verify DOM public sau mutation trong phase verify của từng plan. |
| Seed ghi đè content admin đã sửa | Đã ghi nhận từ brainstorm trước: tách seed lifecycle trước go-live (ngoài scope 4 plan này, phải làm trước production). |

## 6. Ngoài scope (kế thừa + bổ sung)

- DEFER: users/RBAC, media library đầy đủ, options/stickers, static pages, dashboard aggregate, orders.
- Soft delete, slug redirect, audit log, concurrent-update 409: P2.
- Seed lifecycle tách riêng: bắt buộc trước go-live, không thuộc 4 plan này.

## 7. Bước tiếp theo

`/ck:plan` mở rộng plan `260722-admin-shell-upload` hiện có (4 phase khối 1 đã
viết + red-team xong) thành plan full admin — thêm phase các khối 2-4, đổi
title/overview, giữ nguyên nội dung 4 phase sẵn có (đổi phase verify cũ thành
mốc verify 1 đặt sau khối 2). Nhánh `feat/admin-shell-upload` giữ nguyên tên
hoặc mình đề xuất giữ luôn (đổi tên nhánh giữa chừng phiền hơn lợi).

## Câu chưa chốt (chốt trong phase liên quan)

- Multer vs busboy (khối 1 — nghiêng multer, phổ biến hơn).
- Vị trí admin routes: mở rộng module resource hiện có vs module admin con (khối 2).
- Allow-list HTML tag/attr cụ thể (khối 3 — trích từ data thật).
