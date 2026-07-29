# CẨM NANG TOÀN TẬP: DOKPLOY & CẤU HÌNH DỰ ÁN THỨC COFFEE
*Tài liệu hướng dẫn triển khai, vận hành và khôi phục hệ thống từ đầu*

Tài liệu này là cẩm nang hướng dẫn đầy đủ từ lý thuyết đến thực hành, giúp bạn hiểu rõ kiến trúc Dokploy và có thể tự thiết lập lại toàn bộ hệ thống dự án Thức Coffee từ con số 0.

---

## PHẦN 1: TỔNG QUAN VÀ SO SÁNH DOKPLOY VS RAW DOCKER

### 1. Dokploy là gì và tại sao lại chọn nó?

**Dokploy** là một nền tảng quản lý hạ tầng (PaaS - Platform as a Service) mã nguồn mở, cho phép bạn tự host một hệ thống tương tự Vercel, Heroku hay Netlify trên chính máy chủ (VPS) của mình. 

Thay vì phải gõ hàng tá lệnh Docker, quản lý file `docker-compose.yml` thủ công, hay viết script CI/CD dài dòng, Dokploy cung cấp một giao diện Web (Control Panel) cực kỳ trực quan giúp tự động hóa toàn bộ quy trình DevOps.

**Tại sao Thức Coffee lại sử dụng Dokploy thay vì Raw Docker?**
*   **Zero Vendor Lock-in:** Bạn sở hữu dữ liệu và máy chủ của mình (100% Data Sovereignty), không bị trói buộc bởi mức giá "cắt cổ" khi scale-up như của Vercel hay Heroku.
*   **Giao diện trực quan (UI/UX):** Mọi thao tác deploy, cấu hình Environment Variables (Biến môi trường), xem Logs thời gian thực đều được thực hiện qua click-chuột, phù hợp cho cả lập trình viên Frontend ít kinh nghiệm DevOps.
*   **Linh hoạt Build System:** Dokploy hỗ trợ build ứng dụng trực tiếp từ mã nguồn qua **Nixpacks** (tự động nhận diện Node.js, Python, Go...), **Heroku Buildpacks**, hoặc **Dockerfile** truyền thống.
*   **Bảo mật & Phân quyền (RBAC):** Có sẵn hệ thống quản lý User, phân quyền theo Role, giúp làm việc nhóm an toàn.

### 2. Kiến trúc hoạt động và các Công nghệ Cốt lõi của Dokploy

Về bản chất, Dokploy không tự phát minh ra công nghệ chạy ứng dụng mới, mà nó là một lớp "nhạc trưởng" điều phối các công nghệ DevOps tốt nhất hiện nay: **Next.js (Giao diện), Docker Swarm (Chạy ứng dụng), và Traefik (Định tuyến mạng)**.

#### a. Docker Swarm - Người quản gia vận hành cụm dịch vụ
Docker Swarm là công nghệ quản lý cụm container (Orchestrator) được tích hợp sẵn trong Docker. Dokploy sử dụng Swarm để mang lại các tính năng cấp doanh nghiệp:
*   **Quản lý Service thay vì Container:** Thay vì chạy các container đơn lẻ, Swarm nhóm chúng thành các **Service** (ví dụ: `thucbackend`, `frontend`). Điều này cho phép quản lý log tập trung và khả năng nhân bản (Scale) nhanh chóng qua thanh kéo chỉnh `Replicas` trên UI.
*   **Tự phục hồi (Self-Healing) & Zero-Downtime:** Swarm liên tục giám sát trạng thái (Health-check). Nếu app bị crash, Swarm sẽ lập tức tắt nó đi và khởi chạy lại container mới trong mili-giây. Khi Deploy bản mới, nó cũng áp dụng cơ chế Rolling Update để đảm bảo ứng dụng không bao giờ bị gián đoạn (Zero-Downtime).
*   **Cơ chế lưu lịch sử tác vụ (Task History):** Mỗi khi deploy bản mới hoặc tắt máy chủ đột ngột, Swarm sẽ đánh dấu container cũ là **`Shutdown` (Vòng tròn rỗng ⚪)**. Các xác container này **không tốn CPU/RAM**, chỉ được giữ lại để xem logs cũ khi debug.
*   **Cập nhật stop-first và Lỗi kẹt cổng (Host Mode):** 
    *   Do dự án chạy cổng vật lý ở chế độ **`HOST` mode**, mặc định Swarm sẽ tạo container mới trước khi tắt container cũ (`start-first`), dẫn đến lỗi xung đột `"host-mode port already in use"`. 
    *   Giải pháp là vào tab Cluster Settings, chuyển sang **`stop-first`** (Tắt container cũ trước, giải phóng cổng, rồi mới bật container mới lên).

#### b. Traefik - Người điều hướng và Proxy ngược (Reverse Proxy)
Traefik là một Edge Router/Reverse Proxy thông minh, đóng vai trò như "bảo vệ cổng" tiếp nhận mọi truy cập mạng (cổng 80 và 443) đi vào VPS:
*   **Tự động định tuyến (Dynamic Routing):** Khác với Nginx phải viết file `conf` rườm rà, khi bạn điền tên miền `thuccoffee.com` trên Dokploy, Traefik sẽ tự động đọc nhãn dán (`labels`) của Docker container và điều hướng traffic vào đúng ứng dụng ngay lập tức.
*   **Tự động cấp phát SSL (Automatic HTTPS):** Traefik giao tiếp ngầm với Let's Encrypt để xin cấp và tự động gia hạn chứng chỉ HTTPS miễn phí cho mọi tên miền, đảm bảo kết nối bảo mật chuẩn SSL.

#### c. Cơ chế tự động co giãn RAM của Node.js (V8 Engine)
Bản thân bảng quản trị Dokploy được viết bằng Next.js (NodeJS) chạy trên trình thông dịch V8 Engine của Google, có cơ chế quản lý bộ nhớ đệm (Garbage Collector) cực kỳ linh hoạt:
*   **Mức RAM cơ bản thực tế:** Hệ thống chỉ cần khoảng **150MB - 200MB RAM** để sống và hoạt động.
*   **Hiện tượng ăn RAM "ảo" trên Local (800MB - 1GB):** Khi chạy ở máy tính local thừa RAM (ví dụ máy WSL2 có 9.7GB RAM), V8 Engine sẽ cố tình giữ lại toàn bộ cache trang giao diện, logs và các query database trong bộ nhớ RAM để tăng tốc độ phản hồi UI tối đa, vì lúc này chưa có áp lực tài nguyên.
*   **Khả năng tự co cụm trên VPS yếu (2GB RAM):** Khi đưa lên VPS thực tế có tài nguyên giới hạn (Memory Pressure), bộ dọn rác V8 sẽ hoạt động cực kỳ quyết liệt. Dokploy sẽ **tự động ép RAM lại chỉ còn 250MB - 400MB** để nhường chỗ cho ứng dụng thật của bạn.

### 3. So sánh chi tiết: Dokploy vs Raw Docker (Cấu hình thô)

| Tiêu chí | Cấu hình thô (Raw Docker) | Cấu hình qua Dokploy (PaaS) | Nhận xét |
| :--- | :--- | :--- | :--- |
| **Giao diện quản lý** | Chỉ có Terminal dòng lệnh (CLI). | Giao diện Web trực quan, thống kê CPU/RAM/Network thời gian thực. | Dokploy tiện lợi hơn, phù hợp cho team nhiều Roles. |
| **RAM chạy nền (Idle)** | ~50MB - 100MB (Rất nhẹ). | ~250MB - 350MB (Trên VPS) / ~800MB (Trên Local thừa RAM). | Đánh đổi vài trăm MB RAM để lấy sự nhàn hạ khi quản lý là cực kỳ xứng đáng. |
| **Dung lượng Ổ đĩa** | Rất nhẹ (~100MB). | Khoảng 4.26 GB. | Dokploy nặng hơn do tải sẵn các bộ compiler (Node, Go, Python...) của Nixpacks để build code. |
| **Triển khai tự động (CI/CD)** | Phải tự viết file GitHub Actions YAML, cài SSH keys trên VPS. | Tích hợp sẵn, chỉ cần dán Webhook URL vào GitHub, push code là tự động build. | Tốc độ thiết lập CI/CD của Dokploy chưa tới 5 phút. |
| **Cấu hình Domain & SSL** | Phải tự viết cấu hình Nginx, cài Certbot/Cronjob để xin SSL. | Chỉ cần gõ tên miền vào ô input và bật nút, Traefik sẽ làm 100% tự động. | Dokploy ăn đứt về mặt tiện lợi. |
| **Quản lý Database** | Phải nhớ lệnh docker run, tự ánh xạ volume phức tạp. | 1 Click tạo được PostgreSQL, Redis, MySQL... | Có tích hợp sẵn trình xem log và backup định kỳ. |
| **Sao lưu dữ liệu (Backup)** | Phải tự viết script bash crontab đẩy lên cloud. | Có sẵn tính năng Volume Backups tự động đẩy lên S3 (AWS, R2, MinIO). | An toàn dữ liệu tối đa trên Dokploy. |

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

![Giao diện cấu hình Registry trong Dokploy](file:///C:/Users/ACER/.gemini/antigravity/brain/75367a7f-590f-4251-b775-ddc52a736ca1/.user_uploaded/media__1785229265603.png)

---

### BƯỚC 3: Tạo Project và Khởi tạo Dịch vụ Cơ sở dữ liệu (Database)
1.  Tại màn hình trang chủ Dokploy, bấm **`Create Project`** đặt tên là `ThucCoffee`.
2.  Bấm vào Project `ThucCoffee` -> Chọn **`Create Service`** -> Chọn **`Database`** -> Chọn **`PostgreSQL`**:
    *   **Name:** `thuc-postgres`
    *   **Database Name / User / Password:** Nhập thông tin của bạn (Ví dụ: `mydb`, `postgres`, `thuccoffee`).
    *   Bấm **Create**. Sau khi tạo xong, database sẽ chạy ngầm bên trong mạng `dokploy-network`.

![Giao diện khởi tạo PostgreSQL trong Dokploy](file:///C:/Users/ACER/.gemini/antigravity/brain/75367a7f-590f-4251-b775-ddc52a736ca1/.user_uploaded/media__1785229538280.png)

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
4.  Tại tab **Environment** -> Thêm các biến môi trường sau (bắt buộc để MinIO khởi động được):
    ```
    MINIO_ROOT_USER=minioadmin
    MINIO_ROOT_PASSWORD=minioadmin
    ```
    *   Bấm **Save**.
5.  Tại mục **Ports** ở phía dưới:
    *   Thêm cổng: **Published Port: `9000`** -> **Target Port: `9000`** -> **Mode: `HOST`**.
    *   Thêm cổng: **Published Port: `9001`** -> **Target Port: `9001`** -> **Mode: `HOST`**.
6.  Quay lại tab **General** -> Bấm **`Deploy`**.

````carousel
![Cấu hình Build Type cho MinIO](file:///C:/Users/ACER/.gemini/antigravity/brain/75367a7f-590f-4251-b775-ddc52a736ca1/.user_uploaded/media__1785229866773.png)
<!-- slide -->
![Cấu hình GitHub Provider cho MinIO](file:///C:/Users/ACER/.gemini/antigravity/brain/75367a7f-590f-4251-b775-ddc52a736ca1/.user_uploaded/media__1785229880092.png)
````

---

### BƯỚC 5: Triển khai ứng dụng Backend (`thuc-backend`)
1.  Bấm **`Create Service`** -> Chọn **`Application`** -> Đặt tên: `thuc-backend`.
2.  Tại tab **General**:
    *   **Repository:** `NgoDat2003/thuccoffee`, nhánh `main`.
    *   **Build Type:** Chọn **`Dockerfile`**.
    *   **Docker File Path:** `server/Dockerfile`.
    *   **Docker Context Path:** `server`.
    *   **Watch Paths:** Điền **`server/**`** (chỉ tự động deploy khi sửa code server).

![Cấu hình General và Watch Paths cho Backend](file:///C:/Users/ACER/.gemini/antigravity/brain/75367a7f-590f-4251-b775-ddc52a736ca1/.user_uploaded/media__1785230310384.png)
3.  Tại tab **Environment** (Điền các biến môi trường kết nối):
    ```ini
    DATABASE_URL=postgresql://postgres:thuccoffee@thuccoffee-thucpostgres-musjvc:5432/thuccoffee
    MINIO_ENDPOINT=thuccoffee-minio-dp26ab
    MINIO_PORT=9000
    MINIO_ACCESS_KEY=minioadmin
    MINIO_SECRET_KEY=minioadmin
    MINIO_BUCKET=thuccoffee
    MINIO_USE_SSL=false
    JWT_SECRET=your_jwt_secret
    ```

![Cấu hình Environment Variables cho Backend](file:///C:/Users/ACER/.gemini/antigravity/brain/75367a7f-590f-4251-b775-ddc52a736ca1/.user_uploaded/media__1785230460316.png)
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

![Cấu hình General và Provider cho Frontend](file:///C:/Users/ACER/.gemini/antigravity/brain/75367a7f-590f-4251-b775-ddc52a736ca1/.user_uploaded/media__1785230827241.png)
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
  -e MINIO_ENDPOINT=thuccoffee-minio-dp26ab \
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

![Kết quả chạy lệnh Bootstrap thành công](file:///C:/Users/ACER/.gemini/antigravity/brain/75367a7f-590f-4251-b775-ddc52a736ca1/.user_uploaded/media__1785288959804.png)

3.  **Cấu hình quyền đọc ảnh công khai cho MinIO:** Chạy lệnh sau để người dùng có thể truy cập xem ảnh sản phẩm trực tiếp từ trình duyệt mà không bị chặn quyền:
```bash
docker run --rm --net dokploy-network --entrypoint sh minio/mc -c "mc alias set local-minio http://thuccoffee-minio-dp26ab:9000 minioadmin minioadmin && mc anonymous set download local-minio/thuccoffee"
```

![Kết quả chạy lệnh cấu hình quyền đọc MinIO](file:///C:/Users/ACER/.gemini/antigravity/brain/75367a7f-590f-4251-b775-ddc52a736ca1/.user_uploaded/media__1785289138581.png)

---

### KẾT QUẢ ĐẠT ĐƯỢC

Sau khi hoàn tất toàn bộ 7 bước trên, bạn có thể truy cập `http://localhost:8081` (hoặc IP máy chủ) trên trình duyệt để chiêm ngưỡng thành quả: Frontend giao tiếp mượt mà với Backend và Load được toàn bộ ảnh động từ MinIO.

![Giao diện ThucCoffee chạy thành công trên Dokploy](file:///C:/Users/ACER/.gemini/antigravity/brain/75367a7f-590f-4251-b775-ddc52a736ca1/.user_uploaded/media__1785289230023.png)

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
