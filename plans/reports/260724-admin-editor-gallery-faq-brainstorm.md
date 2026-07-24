# Brainstorm: mở rộng Tiptap blog editor, product content field, tách Gallery/FAQ

Ngày: 2026-07-24. Branch hiện tại: `feat/public-parity-cms-scope`.

## 1. Vấn đề & yêu cầu gốc

User đưa 3 việc rời rạc, không liên quan kiến trúc nhau, gộp brainstorm chung phiên:

1. Blog editor cần toolbar giàu tính năng hơn (ảnh mẫu kiểu TinyMCE: mã HTML,
   bảng nâng cao, chèn media, ký tự đặc biệt, fullscreen...).
2. Product cần thêm 1 field nội dung cho tương lai, dùng chung kiểu editor
   như blog.
3. Gallery và FAQ đang gộp 1 UI, cần tách 2 UI riêng, tái dùng bảng chung
   như các menu khác (Products, Blog, Stores...).

## 2. Hiện trạng đã scout

- **Blog editor**: `src/components/admin/blog-editor/BlogContentEditor.tsx`
  dùng Tiptap 3.27.4 (không phải TinyMCE). Toolbar hiện tại
  (`BlogEditorToolbar.tsx`): bold/italic/underline, H1-H3, list, link, hr,
  bảng 2×2 cố định, upload ảnh, undo/redo, cộng chế độ "Mã HTML" (textarea
  thô). Ảnh mẫu người dùng đưa là UI TinyMCE/CKEditor — không khớp Tiptap.
- Root `package.json` đã cài nhiều extension Tiptap **chưa dùng tới**:
  `extension-blockquote`, `extension-code`, `extension-code-block`,
  `extension-strike`, `extension-bubble-menu`, `extension-floating-menu`,
  `extension-dropcursor`, `extension-gapcursor`. Bảng hiện tại
  (`blog-editor-extensions.ts`) tắt `resizable` và `tableHeader`.
- **Product**: `products.description` (`server/src/db/schema.ts:35-55`) là
  `text()` thường, bind vào `<textarea>` (`ProductForm.tsx:184`), không qua
  Tiptap/sanitize.
- **Gallery/FAQ**: cùng 1 file `src/pages/admin/AdminGalleryPage.tsx`, cùng 1
  route `/admin/gallery`, cùng 1 mục sidebar "Gallery & FAQ"
  (`AdminSidebar.tsx:31`). Cả 2 tự vẽ UI riêng (grid ảnh, list Q&A), không
  dùng `AdminTable`.
- Schema đã có sẵn, không cần field mới:
  - `site_gallery` (`schema.ts:207-214`): `storageKey`, `altText`,
    `sortOrder`, `isActive` — đã đủ để hiển thị + sắp xếp.
  - `membership_faqs` (`schema.ts:198-205`): `question`, `answer`,
    `sortOrder`, `isPublished`.
- Banner page (`AdminBannersPage.tsx`) — mẫu người dùng chỉ định tham khảo
  cho gallery: **không dùng `AdminTable`** (không phải bảng dòng), mà là
  card grid nhóm theo loại, kèm `AdminTableToolbar` (filter), `PublishSwitch`,
  `StatusBadge`, `AdminDrawer` (form thêm/sửa qua drawer), `Pagination`.

## 3. Quyết định đã chốt (qua AskUserQuestion)

### 3.1 Blog editor — mở rộng Tiptap, bật toàn bộ

Không đổi thư viện. Bật toàn bộ extension đã cài nhưng chưa dùng + cài thêm
vài cái mới:

- Blockquote, code inline, code block (`extension-blockquote`,
  `extension-code`, `extension-code-block` — đã có trong package.json).
- Table nâng cao: bật `resizable: true`, `tableHeader: true`, cần thêm merge
  cell (Tiptap TableKit hỗ trợ qua `mergeCells`/`splitCell` command — kiểm
  tra lại khi implement, có thể cần thêm extension con).
- Text-align (`@tiptap/extension-text-align` — **chưa có trong
  package.json, cần cài mới**).
- Text color / highlight (`@tiptap/extension-color`,
  `@tiptap/extension-highlight` — **chưa có, cần cài mới**).
- Embed video YouTube (`@tiptap/extension-youtube` — **chưa có, cần cài
  mới**).

Không đổi cơ chế "Mã HTML" (textarea thô) đang có — đó đã là tương đương
gần nhất với nút "Mã HTML" trong ảnh mẫu.

Rủi ro cần lưu ý khi vào implementation:
- Sanitize HTML phía backend (nếu có) phải whitelist thêm tag mới (table
  attrs, `mark`/`span style=color`, iframe cho youtube embed) — cần đọc
  chỗ nào đang sanitize nội dung blog trước khi bật blindly.
- `blog-asset:` marker resolver (`resolveBlogContentImageUrls()`) chỉ xử lý
  ảnh — embed video/iframe là loại node mới, không đi qua marker này.

### 3.2 Product — cột `content` mới, tách biệt `description`

Thêm cột `content` (`text`, nullable) vào bảng `products`
(`server/src/db/schema.ts`), migrate bằng `npm run db:generate`. Field mới
này:

- Độc lập với `description` hiện có — không đổi hành vi `description` đang
  chạy.
- Dùng chung component editor với blog (tái dùng `BlogContentEditor` hoặc
  tách phần lõi ra component dùng chung — quyết định khi vào plan/implement).
- **Không** render ở trang public sản phẩm trong đợt này — đúng như user
  nói "field cho tương lai". Không đoán vị trí UI public khi chưa có yêu
  cầu cụ thể.

### 3.3 Gallery & FAQ — tách 2 trang riêng

- 2 route/menu riêng thay vì 1 mục "Gallery & FAQ" gộp:
  `AdminSidebar.tsx:31` tách thành 2 dòng, `routes.tsx:97` thêm route FAQ
  mới (route gallery giữ nguyên `/admin/gallery`, đổi label).
- **Gallery**: theo mẫu Banner — card grid ảnh (không phải bảng dòng
  `AdminTable`), có `AdminTableToolbar` filter theo trạng thái, `PublishSwitch`
  bật/tắt (map với `isActive`), `AdminDrawer` cho thêm/sửa, `Pagination`.
  Không cần migration — `site_gallery` đã có `sortOrder`, `isActive`.
- **FAQ**: dữ liệu dạng câu hỏi/trả lời text — hợp với `AdminTable` thật sự
  (cột: câu hỏi, thứ tự, trạng thái published, actions), giống cách
  Products/Blog/Stores/Categories/Banners* đang tổ chức. (*Banner thực ra
  dùng card grid, không dùng AdminTable — FAQ nên dùng `AdminTable` vì đây
  là dữ liệu dạng liệt kê văn bản, phù hợp bảng hơn card ảnh.)
- Tách file: `AdminGalleryPage.tsx` giữ lại phần `GallerySection`, tạo file
  mới `AdminFaqPage.tsx` (kebab-case đúng convention) cho `FaqSection`.

## 4. Việc KHÔNG làm trong đợt này (ngoài phạm vi đã xác nhận)

- Không đổi thư viện editor sang TinyMCE/CKEditor.
- Không thêm sortOrder mới cho gallery (đã có sẵn trong schema).
- Không hiển thị `products.content` ở trang public.
- Không đụng vào `description` (textarea) hiện có của product.

## 5. Câu hỏi còn mở (cần xác nhận khi vào plan/implement)

- Merge cell cho table Tiptap: Tiptap 3 `TableKit` có hỗ trợ sẵn hay cần
  extension riêng — cần đọc doc Tiptap 3 lúc implement (`ck:docs-seeker`).
- Component editor dùng chung cho blog + product: tách logic
  `BlogContentEditor` thành component generic (`ContentEditor` nhận prop
  `assetOwnerType`?) hay giữ 2 component riêng dùng chung extensions config
  — quyết định kiến trúc cụ thể để lúc plan.
- Sanitize/whitelist HTML backend cho tag mới (table attrs, color style,
  youtube iframe) — cần grep xem có sanitize-html hay tương tự đang chạy
  chưa trước khi bật extension mới.

## 6. Bước tiếp theo

User đã được hỏi và không chọn plan mode ngay trong phiên này — brainstorm
dừng ở đây theo yêu cầu skill (không implement). Khi sẵn sàng, chạy
`/ck:plan` với report này làm input, tách thành 3 phase độc lập (blog
editor, product content field, gallery/FAQ split) vì chúng không phụ thuộc
lẫn nhau.
