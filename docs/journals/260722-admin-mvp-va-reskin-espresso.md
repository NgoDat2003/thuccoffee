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

## Nợ còn treo (trước go-live)

- **Seed lifecycle**: `db:seed` vẫn upsert+delete-recreate — chạy lại sau khi
  admin sửa content là MẤT DỮ LIỆU. Phải tách migration/bootstrap-once/dev-reset
  trước production. Đã cảnh báo trong backend-architecture.md.
- Email lowercase khi user-CRUD qua UI (nếu mở editor role sau này).
- Rate limit auth/upload: defer có chủ đích.
- User đã báo "UI vẫn chưa ưng" sau reskin — vòng chỉnh UI tiếp theo ngay
  sau merge.
