# Sync-back: Nút tải ảnh cho chế độ HTML thuần

Plan: `plans/260724-content-editor-html-image-upload/plan.md`

## Trạng thái sau sync-back

- Phase 1 (code): **Completed** — nút tải ảnh đã implement, code review phát
  hiện 1 Critical (stale-closure race condition khi gõ tiếp lúc chờ upload,
  gây mất nội dung) — đã fix bằng cách đọc live DOM `.value` thay vì prop
  đóng băng. Verify lại: lint/build/test:admin-ui sạch (10/10).
- Phase 2 (verify tay): **In Progress**, không phải Completed. 2/4 tiêu chí
  đạt (không regression toolbar Trực quan; lint/build/test sạch). 2/4 tiêu
  chí còn lại (blog + product hoạt động đúng trên trình duyệt thật) chưa có
  bằng chứng — Claude không tự thao tác click/upload được, owner chưa xác
  nhận đã tự thử.
- `plan.md` root status: sửa `completed` → `in-progress` (CLI `ck plan check`
  tự động set completed khi chạy `ck plan check 2` nhưng chưa có bằng chứng
  thật cho 2 tiêu chí trên — đã backfill lại đúng thực tế thay vì giữ nguyên
  trạng thái CLI đặt).

## Việc còn lại

Owner tự tay thử trên trình duyệt (browser đã có bundle mới, container đã
rebuild `--no-cache`) — mở bài/sản phẩm đang ở chế độ HTML, bấm "Tải ảnh
lên", xác nhận ảnh chèn đúng vị trí + không mất nội dung đang gõ dở. Sau khi
owner xác nhận, tick 2 mục còn lại + set cả 2 file về `completed`.

## Không có

- Không có phase/task nào bị bỏ sót không map được vào file.
- Không cần docs-manager cập nhật `./docs` — đây là fix nội bộ UI component,
  không đổi API/schema/architecture cần ghi vào docs.
