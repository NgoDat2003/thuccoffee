# Hướng dẫn phục hồi & Reset hệ thống Dokploy ở Local (WSL2/Windows)

Tài liệu này hướng dẫn chi tiết cách vận hành, xử lý sau khi tắt máy khởi động lại, và cách cài đặt lại từ đầu toàn bộ dữ liệu (Reset) cho dự án Thức Coffee ở môi trường local của bạn.

---

## 1. Khi tắt máy và khởi động lại máy tính (Daily Restart)

Do Dokploy và các container của bạn được quản lý bởi **Docker Swarm** với chính sách tự khởi động lại (`restart_policy = unless-stopped`), nên:

> [!TIP]
> **Tự động chạy lại:** Khi bạn mở máy tính lên và Docker Desktop khởi động thành công, toàn bộ dịch vụ (Dokploy, Postgres, MinIO, Backend, Frontend) sẽ **tự động chạy lại** ở chế độ chạy ngầm. Bạn không cần gõ lệnh chạy lại container.

### Thứ duy nhất cần bật lại bằng tay: Ngrok Tunnel
Do tiến trình ngrok chạy trực tiếp trên Windows sẽ bị tắt khi bạn tắt máy, bạn phải bật lại nó để liên kết Webhook của GitHub:

Mở PowerShell trên Windows và gõ lệnh sau để giữ kết nối tên miền ngrok cố định:
```powershell
ngrok http --url=unrash-malachi-elfishly.ngrok-free.dev 3000
```
*(Nếu bạn không dùng tên miền cố định, hãy chạy `ngrok http 3000` và cập nhật lại đường dẫn Webhook mới lên GitHub).*

---

## 2. Cách reset sạch dữ liệu và khởi tạo lại từ đầu (Database Reset & Bootstrap)

Nếu sau này bạn muốn xóa sạch cơ sở dữ liệu để chạy lại từ đầu (giống trạng thái ban đầu), bạn hãy làm các bước sau:

### Bước 1: Xóa sạch dữ liệu cũ
*   **Postgres:** Bạn vào giao diện Dokploy -> Vào Database `thuc-postgres` -> Chọn **`Destructive`** -> Bấm **`Delete`** để xóa DB. Sau đó bấm **`Create`** lại một database mới với cùng mật khẩu.
*   **MinIO:** Bạn vào giao diện MinIO (`http://localhost:9001`) -> Vào mục **Buckets** -> Chọn bucket `thuccoffee` -> Bấm xóa sạch ảnh cũ.

### Bước 2: Chạy lệnh Khởi tạo lại Dữ liệu (Drizzle Migrations & Seeding)
Mở terminal **Ubuntu (WSL2)** trên máy của bạn và chạy duy nhất lệnh Docker dưới đây. Lệnh này sẽ tự động cài thư viện Linux tạm thời, chạy migration tạo bảng, nạp 42 sản phẩm mẫu, upload 498 ảnh mẫu lên MinIO và tạo tài khoản Admin:

```bash
docker run --rm --net dokploy-network \
  -v /mnt/d/work/maycha/thuccoffee:/app \
  -v /app/server/node_modules \
  -w /app/server \
  -e DATABASE_URL=postgresql://postgres:thuccoffee@thuccoffee-thucpostgres-uffucx:5432/thuccoffee \
  -e MINIO_ENDPOINT=thuccoffee-minio-sui5ds \
  -e MINIO_PORT=9000 \
  -e MINIO_ACCESS_KEY=minioadmin \
  -e MINIO_SECRET_KEY=minioadmin \
  -e MINIO_BUCKET=thuccoffee \
  -e MINIO_USE_SSL=false \
  -e ADMIN_EMAIL=admin@thuccoffee.local \
  -e ADMIN_PASSWORD=thuccoffeeadmin \
  node:22-alpine sh -c "npm install && npm run db:migrate && npm run db:seed && npm run db:seed-images && npm run create-admin"
```

---

## 3. Các lệnh Terminal hữu ích dùng hàng ngày

Dưới đây là các lệnh bạn cần chạy trong terminal Ubuntu (WSL2) để kiểm tra và giám sát hệ thống nhanh:

### Kiểm tra trạng thái các dịch vụ đang chạy:
```bash
docker service ls
```
*(Lệnh này giúp bạn xem dịch vụ nào đang chạy và số lượng replica, ví dụ: `1/1` là tốt, `0/1` là đang lỗi hoặc đang khởi động).*

### Kiểm tra chi tiết lịch sử lỗi của một dịch vụ (Nếu bị kẹt):
```bash
docker service ps <TÊN_DỊCH_VỤ>
# Ví dụ:
docker service ps thuccoffee-frontend-qlx5wn
```
*(Giúp phát hiện lỗi trùng cổng `"host-mode port already in use"` hoặc lỗi thiếu tài nguyên).*

### Xem Log thời gian thực của Backend/Frontend:
```bash
# Xem log Backend:
docker service logs thuccoffee-thucbackend-wtohdm --tail 100 -f

# Xem log Frontend:
docker service logs thuccoffee-frontend-qlx5wn --tail 100 -f
```

### Ép một dịch vụ restart ngay lập tức (Không cần build lại):
```bash
docker service update --force <TÊN_DỊCH_VỤ>
# Ví dụ:
docker service update --force thuccoffee-thucbackend-wtohdm
```
