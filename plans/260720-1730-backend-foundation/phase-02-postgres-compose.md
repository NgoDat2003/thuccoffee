# Phase 2 — Postgres qua Compose

Trạng thái: Pending
Ưu tiên: P1
Phụ thuộc: Phase 1

## Bối cảnh

- `compose.yaml` hiện chỉ có service `frontend`
- Cấu hình biến môi trường: `docs/backend-architecture.md`

## Mục tiêu

Postgres 16 chạy local qua Compose, dữ liệu sống sót qua các lần restart, và
backend kết nối được.

## Quyết định thiết kế

**Volume là bắt buộc.** Không khai báo volume thì dữ liệu mất mỗi lần
`docker compose down`. Đây là lỗi hay gặp nhất khi mới dùng Postgres trong
Docker.

**Healthcheck bằng `pg_isready`.** Postgres nhận kết nối trước khi thực sự sẵn
sàng, nên backend khởi động sớm sẽ lỗi. Healthcheck cộng với `depends_on:
condition: service_healthy` xử lý việc này.

**Mật khẩu local để trong `compose.yaml`** là chấp nhận được vì Postgres chỉ
lắng nghe trên máy này. Production dùng biến môi trường do Dokploy cấp, không
bao giờ hardcode.

## File sửa

- `compose.yaml` — thêm service `postgres`, volume `postgres-data`
- `server/.env.example` — `DATABASE_URL` trỏ tới postgres local

## Các bước

1. Thêm service `postgres` vào `compose.yaml`:
   - image `postgres:16-alpine`
   - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB=thuccoffee`
   - cổng `5432:5432`
   - volume `postgres-data:/var/lib/postgresql/data`
   - healthcheck `pg_isready -U <user> -d thuccoffee`
2. Khai báo `volumes: postgres-data:` ở cuối file.
3. Chạy `docker compose up -d postgres`, chờ healthy.
4. Kết nối kiểm tra bằng `docker compose exec postgres psql`.
5. Kiểm tra volume: tạo bảng tạm, `docker compose restart postgres`, xác nhận
   bảng còn.
6. Ghi `DATABASE_URL` mẫu vào `server/.env.example`.

## Todo

- [ ] Thêm service `postgres` vào `compose.yaml`
- [ ] Khai báo volume `postgres-data`
- [ ] Healthcheck `pg_isready`
- [ ] Xác nhận container healthy
- [ ] Kiểm tra dữ liệu sống sót qua restart
- [ ] Cập nhật `server/.env.example`

## Tiêu chí hoàn thành

- `docker compose ps` báo postgres `healthy`.
- Kết nối được bằng `psql` từ trong container.
- Bảng tạo trước khi restart vẫn còn sau restart.
- `docker compose down` rồi `up` lại không mất dữ liệu.

## Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Quên volume, mất dữ liệu mỗi lần down | Kiểm chứng bằng bước 5 trước khi sang phase sau |
| Cổng 5432 bị chiếm bởi Postgres cài sẵn trên máy | Đã xác nhận trống; nếu bận thì đổi cổng phía host |
| Backend khởi động trước khi DB sẵn sàng | `depends_on` với `service_healthy` |
