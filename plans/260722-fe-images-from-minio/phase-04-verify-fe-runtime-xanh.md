---
phase: 3
title: "Verify FE runtime xanh (Docker)"
status: completed
priority: P1
effort: "3h"
dependencies: [2]
---

# Phase 3: Verify FE runtime xanh (Docker production path)

## Overview

Xác minh ảnh hiển thị thật qua MinIO ở môi trường production-like (Docker + nginx),
không chỉ dev. Bài học đã ghi: `npm run build` local xanh KHÔNG đảm bảo Docker/CI
xanh; phải build Docker thật và verify tới DOM. Đây là cổng cuối trước khi coi
Phase M xong.

## Requirements

- Functional: ở `:3000` (nginx production), ảnh product/blog/store/banner/logo +
  icon UI + gallery đều load từ MinIO (200), không placeholder, không 404.
- Non-functional: FE + server lint/build sạch; smoke:images xanh; Docker build FE
  không đỏ.

## Architecture

Ba tầng verify, từ rẻ tới đắt:

1. **Static/build:** `npm run lint` + `npm run build` (FE), `server` lint/build.
   Docker `docker compose build frontend` — không tái phát lỗi build.
2. **API/smoke:** `npm run smoke:images` XANH toàn bộ (Phase 1 script).
3. **Runtime DOM:** dùng agent-browser (như vòng FE trước) mở `:3000`, kiểm tra
   `<img>` thật load từ MinIO — không rơi placeholder. Các trang trọng điểm:
   - Home (banner slider, promo, blog carousel, store locator, logo header/footer)
   - Menu + Product detail (thumb, image)
   - Blog list + Blog detail (cover + ảnh inline content)
   - Store list + Store detail (image + gallery lightbox)

## Related Code Files

- Read/verify: toàn bộ 14 caller `getImageUrl`, `deploy/nginx.conf` (proxy MinIO)
- Không sửa code ở phase này (chỉ verify); nếu phát hiện lỗi → quay lại Phase 2.

## Implementation Steps

1. Restart Compose stack với image FE mới (`docker compose up -d --build frontend`).
2. Kiểm nginx production phục vụ ảnh MinIO qua `location /media/` (đã chốt): ảnh ở
   `:3000/media/<key>` trả 200. Xác nhận `/media/` đứng trước fallback, không phá
   3-nhánh asset/index/404 có chủ đích.
3. Chạy `npm run smoke:images` → XANH.
4. Mở `:3000` bằng agent-browser, chụp/kiểm DOM từng trang trọng điểm: đếm `<img>`
   với `src` chứa MinIO base, 0 ảnh placeholder ở nội dung thật.
5. Kiểm tương tác động: đổi cửa hàng (store selector), mở gallery lightbox, phân
   trang blog, mở vài product detail — ảnh load đúng ở mọi trạng thái.
6. Kiểm console không có 404 ảnh / warning `[image-url] missing asset`.

## Success Criteria

- [x] FE lint + build sạch; Docker build FE không đỏ.
- [x] `smoke:images` XANH toàn bộ.
- [x] `:3000` DOM: mọi ảnh trọng điểm load từ MinIO, 0 placeholder ở ảnh thật.
- [x] Gallery lightbox + store selector + blog pagination: ảnh đúng ở mọi tương tác.
- [x] Console không có 404 ảnh hay cảnh báo missing asset.
- [x] Verify trên Docker production path, KHÔNG chỉ dev.

## Risk Assessment

- **Rủi ro:** dev xanh nhưng production 404 (nginx chưa proxy MinIO). Đây chính là
  lý do verify Docker thật ở phase này — bắt đúng lớp bài học cũ.
- **Rủi ro:** agent-browser bỏ sót trang/tương tác. Giảm thiểu: liệt kê trang
  trọng điểm cụ thể ở Implementation Steps; smoke phủ phần key-level.
- **Rủi ro:** ảnh inline blog (resolveBlog) sót — hay bị quên vì nằm trong HTML.
  Giảm thiểu: Blog detail nằm trong danh sách DOM verify bắt buộc.
