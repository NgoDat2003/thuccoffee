# CẨM NANG TOÀN TẬP: DOKPLOY & CẤU HÌNH DỰ ÁN THỨC COFFEE
*Tài liệu hướng dẫn triển khai, vận hành và khôi phục hệ thống từ đầu*

Tài liệu này là cẩm nang hướng dẫn đầy đủ từ lý thuyết đến thực hành, giúp bạn hiểu rõ kiến trúc Dokploy và có thể tự thiết lập lại toàn bộ hệ thống dự án Thức Coffee từ con số 0.

---

## PHẦN 1: TỔNG QUAN VÀ SO SÁNH DOKPLOY VS RAW DOCKER

### 1. Kiến trúc hoạt động của Dokploy
Dokploy là một **Self-hosted PaaS** (nền tảng dịch vụ tự host) hoạt động trực tiếp trên nền **Docker Swarm**. Nó bao gồm các thành phần:
*   **Dokploy Panel:** Giao diện quản lý viết bằng Next.js (NodeJS), giao tiếp với Docker qua file socket `/var/run/docker.sock`.
*   **Traefik (Reverse Proxy):** Tự động định tuyến tên miền, quản lý SSL Let's Encrypt và phân phối traffic đến các container thông qua các nhãn (`labels`) của Docker.
*   **Docker Swarm:** Quản lý vòng đời container, tự phục hồi khi sập (self-healing), hỗ trợ Rolling Update (cập nhật không gián đoạn).

---

### 2. So sánh thông số kỹ thuật thực tế (Đo đạc tại Local)

| Tiêu chí | Cấu hình thô (Raw Docker) | Cấu hình qua Dokploy (PaaS) |
| :--- | :--- | :--- |
| **RAM chạy nền (Idle)** | ~50MB - 100MB | ~250MB - 350MB (Trên VPS thực tế) / ~800MB (Trên Local thừa RAM) |
| **RAM dự án Thức Coffee** | ~200 MB | ~190 MB (Front: 5MB, Back: 75MB, MinIO: 93MB, DB: 17MB) |
| **Dung lượng ổ đĩa (Disk)** | Rất nhẹ (~100MB) | Khoảng 4.26 GB (Giải nén chứa sẵn các compiler Nixpacks để build code) |
| **CI/CD tự động** | Phải tự cấu hình tay (GitHub Actions, SSH) | Tự động hoàn toàn qua Webhook (mất 5 phút cấu hình) |
| **Gia hạn SSL & HTTPS** | Phải cài Certbot và tự cấu hình Nginx | Tự động cấp và gia hạn 100% bằng giao diện |
| **Backup dữ liệu** | Phải tự viết script bash | Có sẵn tính năng backup tự động lên S3/Google Drive |

---

## PHẦN 2: HƯỚNG DẪN THIẾT LẬP LẠI HỆ THỐNG THỨC COFFEE TỪ ĐẦU

Nếu bạn muốn xóa sạch Dokploy cũ và cấu hình lại toàn bộ hệ thống từ đầu, hãy làm theo các bước chi tiết sau:

### BƯỚC 1: Cài đặt Dokploy và kích hoạt Docker Swarm
Chạy lệnh cài đặt duy nhất trên terminal Linux/VPS:
```bash
curl -sSL https://dokploy.com/install.sh | sh
```
*Sau khi cài xong, truy cập `http://<IP>:3000` để đăng ký tài khoản Admin.*

---

### BƯỚC 2: Cấu hình Registry (Bắt buộc để tránh lỗi kẹt cổng)
Do Docker Swarm yêu cầu Registry để quản lý cấu hình cập nhật `stop-first` (tránh xung đột cổng `8080` và `8081` chạy ở chế độ `HOST` mode):
1.  Đăng nhập **[hub.docker.com](https://hub.docker.com/)** -> Vào **Account Settings** -> **Security** -> Tạo một **Personal Access Token** với quyền **`Read & Write`**.
2.  Trên Dokploy UI, vào **`Settings`** -> **`Registries`** -> Bấm **`Create Registry`**:
    *   **Name:** `DockerHub`
    *   **Registry URL:** `docker.io`
    *   **Username:** Tên đăng nhập Docker Hub của bạn.
    *   **Password:** Dán mã Access Token vừa tạo ở trên.
    *   Bấm **Create**.

---

### BƯỚC 3: Tạo Project và Khởi tạo Dịch vụ Cơ sở dữ liệu (Database)
1.  Tại màn hình trang chủ Dokploy, bấm **`Create Project`** đặt tên là `ThucCoffee`.
2.  Bấm vào Project `ThucCoffee` -> Chọn **`Create Service`** -> Chọn **`Database`** -> Chọn **`PostgreSQL`**:
    *   **Name:** `thuc-postgres`
    *   **Docker Image:** `postgres:18` (hoặc bản bạn chọn)
    *   **Database Name / User / Password:** Nhập thông tin của bạn (Ví dụ: `mydb`, `postgres`, `thuccoffee`).
    *   Bấm **Create**. Sau khi tạo xong, database sẽ chạy ngầm bên trong mạng `dokploy-network`.

---

### BƯỚC 4: Triển khai Kho lưu trữ Ảnh (MinIO)
Do MinIO cần một số cấu hình Dockerfile tùy chỉnh để chạy ổn định trên Swarm:
1.  Bấm **`Create Service`** -> Chọn **`Application`** -> Đặt tên: `minio`.
2.  Tại tab **General**:
    *   **Source:** Chọn GitHub Repo `NgoDat2003/thuccoffee`, nhánh `main`.
    *   **Build Type:** Chọn **`Dockerfile`**.
    *   **Docker File Path:** `deploy/minio.Dockerfile`.
    *   **Docker Context Path:** `deploy` (hoặc để trống nếu context là `/`).
    *   Tắt công tắc **`Auto Deploy`** (để tránh MinIO bị restart vô ích khi push code).
3.  Tại tab **Advanced** -> Vào mục **Cluster Settings**:
    *   Chọn **Registry** là `DockerHub` đã tạo ở Bước 2.
    *   Bấm **Save**.
4.  Tại mục **Ports** ở phía dưới:
    *   Thêm cổng: **Published Port: `9000`** -> **Target Port: `9000`** -> **Mode: `HOST`**.
    *   Thêm cổng: **Published Port: `9001`** -> **Target Port: `9001`** -> **Mode: `HOST`**.
5.  Quay lại tab **General** -> Bấm **`Deploy`**.

---

### BƯỚC 5: Triển khai ứng dụng Backend (`thuc-backend`)
1.  Bấm **`Create Service`** -> Chọn **`Application`** -> Đặt tên: `thuc-backend`.
2.  Tại tab **General**:
    *   **Repository:** `NgoDat2003/thuccoffee`, nhánh `main`.
    *   **Build Type:** Chọn **`Dockerfile`**.
    *   **Docker File Path:** `server/Dockerfile`.
    *   **Docker Context Path:** `server`.
    *   **Watch Paths:** Điền **`server/**`** (chỉ tự động deploy khi sửa code server).
3.  Tại tab **Environment** (Điền các biến môi trường kết nối):
    ```ini
    DATABASE_URL=postgresql://postgres:thuccoffee@thuccoffee-thucpostgres-uffucx:5432/thuccoffee
    MINIO_ENDPOINT=thuccoffee-minio-sui5ds
    MINIO_PORT=9000
    MINIO_ACCESS_KEY=minioadmin
    MINIO_SECRET_KEY=minioadmin
    MINIO_BUCKET=thuccoffee
    MINIO_USE_SSL=false
    JWT_SECRET=your_jwt_secret
    ```
    *(Lưu ý: Thay thế tên Host `thuccoffee-thucpostgres-uffucx` và `thuccoffee-minio-sui5ds` bằng đúng tên Service Swarm hiển thị trên giao diện Dokploy của bạn).*
4.  Tại tab **Advanced** -> **Cluster Settings**:
    *   Chọn **Registry** là `DockerHub`.
    *   Bấm **Save**.
5.  Tại tab **Advanced** -> **Swarm Settings** -> **Update Config**:
    *   **Order:** Chọn **`stop-first`** (Tắt container cũ rồi mới bật container mới để tránh lỗi kẹt cổng 8080).
    *   Bấm **Save Update Config**.
6.  Tại mục **Ports** ở phía dưới tab General:
    *   Thêm cổng: **Published Port: `8080`** -> **Target Port: `8080`** -> **Mode: `HOST`**.
7.  Bấm **`Deploy`**.

---

### BƯỚC 6: Triển khai ứng dụng Frontend (`frontend`)
1.  Bấm **`Create Service`** -> Chọn **`Application`** -> Đặt tên: `frontend`.
2.  Tại tab **General**:
    *   **Repository:** `NgoDat2003/thuccoffee`, nhánh `main`.
    *   **Build Type:** Chọn **`Dockerfile`**.
    *   **Docker File Path:** `frontend/Dockerfile`.
    *   **Docker Context Path:** `.` (Dấu chấm - bắt buộc để Nginx đọc được file config gốc).
    *   **Watch Paths:** Điền **`frontend/**`** (chỉ deploy khi sửa code frontend).
3.  Tại tab **Advanced** -> **Cluster Settings**:
    *   Chọn **Registry** là `DockerHub`.
    *   Bấm **Save**.
4.  Tại tab **Advanced** -> **Swarm Settings** -> **Update Config**:
    *   **Order:** Chọn **`stop-first`** (Tránh xung đột cổng `8081`).
    *   Bấm **Save Update Config**.
5.  Tại mục **Ports** ở phía dưới tab General:
    *   Thêm cổng: **Published Port: `8081`** -> **Target Port: `80`** -> **Mode: `HOST`**.
6.  Bấm **`Deploy`**.

---

### BƯỚC 7: Nạp Cơ sở dữ liệu và Upload hình ảnh mẫu (Bootstrap)
Sau khi cả 4 dịch vụ đã khởi động thành công và báo chấm xanh lá 🟢:
1.  Mở terminal **Ubuntu (WSL2)** trên máy tính của bạn.
2.  Copy và chạy duy nhất lệnh Docker dưới đây để nạp toàn bộ cấu trúc bảng, nạp dữ liệu mẫu, tạo tài khoản Admin và đồng bộ 498 tấm ảnh lên MinIO:

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
*(Lưu ý: Thay thế các biến `DATABASE_URL` và `MINIO_ENDPOINT` cho đúng với tên service thực tế trên Dokploy của bạn).*

3.  **Cấu hình quyền đọc ảnh công khai cho MinIO:** Chạy lệnh sau để người dùng có thể truy cập xem ảnh sản phẩm trực tiếp từ trình duyệt mà không bị chặn quyền:
```bash
docker run --rm --net dokploy-network --entrypoint sh minio/mc -c "mc alias set local-minio http://thuccoffee-minio-sui5ds:9000 minioadmin minioadmin && mc anonymous set download local-minio/thuccoffee"
```

---

## PHẦN 3: VẬN HÀNH HÀNG NGÀY & KHẮC PHỤC SỰ CỐ

### 1. Bật tính năng dọn dẹp dung lượng tự động
*   Vào **Settings** -> **Web Server**.
*   Bật công tắc **`Daily Docker Cleanup`** để hệ thống tự động dọn dẹp rác vào 00:00 hàng ngày.

### 2. Các lệnh kiểm tra lỗi nhanh (WSL2 Terminal)
*   Kiểm tra danh sách dịch vụ: `docker service ls`
*   Xem lịch sử và chi tiết lỗi kẹt cổng: `docker service ps <tên_dịch_vụ>`
*   Xem log trực tiếp: `docker service logs <tên_dịch_vụ> -f`
*   Khởi động lại cưỡng bức: `docker service update --force <tên_dịch_vụ>`
