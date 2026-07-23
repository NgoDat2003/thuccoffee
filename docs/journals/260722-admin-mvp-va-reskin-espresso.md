# Journal 2026-07-22 — Admin MVP hoàn chỉnh + reskin Espresso trong một ngày

## Đã ship

Ba vòng lớn nối nhau trên cùng ngày, mỗi vòng verify Docker + smoke trước khi
sang vòng sau:

1. **Auth foundation** (merge `main` sáng): JWT cookie httpOnly + argon2 +
   CLI `create-admin` + guard `/api/admin/*` + trang `/admin/login`.
   `smoke:auth` 8/8 qua cả backend lẫn nginx.
2. **Admin MVP full** (nhánh `feat/admin-shell-upload`, 2 mốc): upload
   multipart→MinIO validate 3 lớp, CRUD 6 resource (products+categories,
   blog+sanitize, stores+gallery, banners, settings) cả API lẫn UI.
   8 smoke suite (~48 checks) xanh ×2 origin; DOM 6 resource mutation phản
   ánh public không F5.
3. **Reskin Espresso** (nhánh `feat/admin-espresso-reskin`, commit `31f38f7`):
   theo design handoff từ Claude Design — sidebar tối + canvas kem + accent
   đồng + hairline; thêm 3 thay đổi UX user yêu cầu giữa chừng: drawer form
   (thay route riêng cho product/store/banner), pagination client 10/trang,
   bulk-select ẩn/hiện hàng loạt. Regression 48/48, screenshot so design khớp.

## Quyết định đáng nhớ

- **"4 plan nhỏ" đảo thành "1 plan full"** giữa chừng theo yêu cầu user — ghi
  trail tường minh trong brainstorm report; vertical slice + 2 mốc verify giữ
  được an toàn dù nhánh dài.
- **Sanitize blog**: allow-list trích từ 267 bài thật, criterion "5 bài dài
  nhất sanitize diff rỗng" không nới; trick `normalizeSafeSerialization` giữ
  byte bài cũ đã red-team kỹ (3 phép rewrite không che giấu được vector).
- **Design thắng về style, code thắng về chức năng**: nút Xóa banner + Preview
  an toàn không có trong design nhưng giữ nguyên; field design vẽ mà BE không
  có (SEO meta/Zalo/Favicon) không thêm — chỉ 11 key settings thật.
- **Drawer bằng `<dialog>` native** (như ConfirmDialog): focus trap/ESC/backdrop
  miễn phí, animation `@starting-style` + `prefers-reduced-motion`.
- **Slug khóa bằng schema strict** (update schema không có field slug) — gọn
  hơn check thủ công, phát hiện lệch giữa smoke codex viết và pattern chuẩn ở
  stores, sửa smoke theo pattern chứ không nới schema.

## Sự cố & bài học

- **Smoke đỏ giả** sau khi codex thêm route mới: container chạy image cũ —
  rebuild trước khi kết luận code sai.
- **PowerShell `-replace`+`Set-Content` phá UTF-8** file plan tiếng Việt
  (mojibake) — khôi phục bằng Write tool; về sau sửa file tiếng Việt chỉ dùng
  Edit/Write hoặc Node, không dùng PowerShell text pipeline.
- **`ck plan check` ghi đè bảng markdown** trong plan.md (cột Disposition
  red-team thành "Completed") — sau khi dùng CLI phải kiểm lại bảng tay.
- **Browser cache bundle cũ** làm user tưởng "thiếu API/UI" — hard-refresh
  trước khi kết luận thiếu tính năng.
- Codex để **duplicate key** trong package.json scripts (thêm 2 lần chèn giữa)
  — JSON không báo lỗi, chỉ thấy khi đọc lại.

## Vòng bổ sung cùng ngày — navy polish + CRUD danh mục (nhánh `feat/admin-navy-polish`)

User duyệt reskin xong vẫn chưa ưng, liệt kê 5 điểm → xử lý trong một vòng:

1. **Đảo palette lần 2**: bỏ hẳn tông espresso (vừa làm buổi chiều) sang
   "navy chuyên nghiệp" — sidebar `#16233a`, nền `#f4f6f8`, accent xanh brand.
   Kiến trúc token trả công: đổi 18 giá trị là xong toàn bộ admin, cấu trúc
   layout/drawer giữ nguyên. Bài học: chốt "high-fidelity theo design" không
   đồng nghĩa user sẽ ưng palette khi thấy thật — token hóa từ đầu là bảo hiểm.
2. **Pagination kiểu Ant** (`‹ 1 … 4 5 6 … 20 ›` căn phải) — component chung
   export từ AdminTable, 4 list dùng chung.
3. **cursor-pointer global** — Tailwind v4 bỏ mặc định trên button, phải tự trả.
4. **CRUD danh mục đầy đủ** (đảo quyết định "MVP giới hạn" cũ): POST sinh key
   từ label bỏ dấu tiếng Việt, DELETE chặn 409 khi còn sản phẩm; dispatcher
   public nhận key trần (product slug luôn có hậu tố `-s<id>t<n>` nên phân
   biệt được) → danh mục mới sống đầy đủ trên `/menu/<key>`. UI danh mục làm
   lại 2 lần: bản 1 (mỗi dòng là input) bị chê "xấu, không cân, tràn màn" —
   bản 2 chuyển AdminTable 5 cột + edit inline mới đạt. Bài học: trang quản
   lý là để ĐỌC, input chỉ hiện khi cần sửa.
5. **Input box thống nhất** thay underline mỏng (focus ring xanh, 16px chống
   zoom mobile).

Sự cố lặp: password admin test bị đổi 2 lần giữa các lần verify (`updated_at`
DB là bằng chứng) — ai đó/tiến trình khác chạy `create-admin` song song; mỗi
lần verify phải reset trước. Smoke products lên 8 assert (thêm create/delete
category + guard 409).

## Nợ còn treo (trước go-live)

- **Seed lifecycle**: `db:seed` vẫn upsert+delete-recreate — chạy lại sau khi
  admin sửa content là MẤT DỮ LIỆU. Phải tách migration/bootstrap-once/dev-reset
  trước production. Đã cảnh báo trong backend-architecture.md.
- Email lowercase khi user-CRUD qua UI (nếu mở editor role sau này).
- Rate limit auth/upload: defer có chủ đích.
- User đã báo "UI vẫn chưa ưng" sau reskin — vòng chỉnh UI tiếp theo ngay
  sau merge.
