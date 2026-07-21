---
phase: 3
title: "Kiểm chứng và cập nhật docs"
status: pending
priority: P2
effort: "2h"
dependencies: [1, 2]
---

# Phase 3: Kiểm chứng và cập nhật docs

## Overview

Kiểm chứng đầu-cuối rằng hạ tầng chạy và ảnh phục vụ được từ MinIO, đồng thời
xác nhận FE **không** bị ảnh hưởng. Cập nhật docs cho khớp thực tế: MinIO đã
dựng làm kho, ảnh vẫn ở repo cho FE tĩnh, chuyển FE là việc vòng API.

## Requirements

- Functional: một lượt `docker compose up` sạch → seed ảnh → verify ảnh phục vụ
  từ MinIO; FE `:3000` vẫn chạy y như trước.
- Non-functional: docs không còn nói "MinIO/upload hoàn toàn ngoài phạm vi" mâu
  thuẫn với thực tế; ghi rõ trạng thái ảnh 2 nơi là bước đệm có chủ đích.

## Architecture

Không thêm code. Chỉ verify + sửa tài liệu:

- `docs/database-design.md`: mục "Cố ý không làm" và phần `media_attachments`
  hiện ghi MinIO là giai đoạn sau → cập nhật: bucket đã dựng, `storage_key` đang
  chứa tên file, ảnh vẫn commit repo cho FE tĩnh.
- `docs/backend-architecture.md`: mục "Thứ tự triển khai" và "Upload ảnh không
  nằm trong danh sách" → ghi chú MinIO đã có làm kho; FE đọc ảnh MinIO vẫn thuộc
  vòng API đọc.
- `README.md` + `docs/deployment.md`: thêm cổng MinIO (9000/9001), lưu ý prod
  không mở console ra ngoài + đổi access key mặc định (giống nguyên tắc Postgres).

## Related Code Files

- Modify: `docs/database-design.md`
- Modify: `docs/backend-architecture.md`
- Modify: `README.md`
- Modify: `docs/deployment.md`

## Implementation Steps

1. `docker compose down -v` rồi `up -d --build` (lượt sạch, không dữ liệu cũ).
2. Đợi tất cả healthy; `npm run db:seed-images`.
3. Verify: `curl http://localhost:9000/thuccoffee/{path/tên-file}` trả 200; mở
   2-3 ảnh trên console; xác nhận số object = `find src/assets/images -type f`.
4. Verify FE không đổi: mở `http://localhost:3000`, DevTools Network → ảnh vẫn
   tải từ `/assets/*`, KHÔNG có request tới `:9000`. Đây là bằng chứng FE giữ
   tĩnh đúng phạm vi.
5. Cập nhật 4 file docs như mục Architecture.
6. Chạy `npm run lint` + `npm run build` ở cả root và `server/` — xác nhận
   không có gì vỡ.

## Success Criteria

- [ ] Lượt compose sạch: 4 service healthy, minio-init exit 0.
- [ ] Toàn bộ ảnh phục vụ được từ MinIO (curl 200 + hiển thị đúng), số object
      khớp số file trong `src/assets/images`.
- [ ] FE `:3000` vẫn tải ảnh từ `/assets/`, không gọi `:9000` — FE không đổi.
- [ ] 4 file docs cập nhật, không còn câu mâu thuẫn với thực tế.
- [ ] lint + build sạch ở root và server.

## Risk Assessment

- **Docs drift ngược lại code** (như bài học journal foundation: doc từng lệch
  code). Mitigation: verify bằng lượt compose thật trước khi viết docs, không
  viết theo trí nhớ.
- **Quên nhắc rủi ro production** (key mặc định, console mở ra ngoài).
  Mitigation: bắt buộc thêm ghi chú vào `docs/deployment.md`.
