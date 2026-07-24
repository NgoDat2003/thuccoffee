# Brainstorm: Tái cấu trúc thư mục Thuc Coffee thành Monorepo (Chuẩn hóa Deployment & CLI)

*   **Ngày tạo:** 2026-07-24
*   **Trạng thái:** Đề xuất thảo luận

---

## 1. Mô tả vấn đề (Problem Statement)
Cấu trúc thư mục hiện tại của dự án `thuccoffee` đang bị bất đối xứng:
*   Mã nguồn **Frontend** (React/Vite) nằm trực tiếp ở thư mục gốc (`/`).
*   Mã nguồn **Backend** (Express) nằm ở thư mục con (`/server`).
*   File `compose.yaml` ở thư mục gốc chịu trách nhiệm dựng toàn bộ hệ thống (Postgres, MinIO, Frontend, Backend).

**Hạn chế:**
1.  **Chưa chuẩn hóa Monorepo:** Thư mục gốc bị trộn lẫn giữa code Frontend và cấu hình điều phối hệ thống.
2.  **Khó khăn khi chạy môi trường quản lý:** Manager/Tech Lead yêu cầu đưa các file chạy Docker/Compose "ra ngoài 1 cấp" (tức là tách biệt khỏi mã nguồn Frontend) để dễ dàng quản lý dịch vụ nền tảng (infra) trên server, tương tự cấu trúc chuẩn của dự án anh em `maycha_QAQC_app`.
3.  **Ràng buộc kiểu dữ liệu khi Build:** Trình biên dịch TypeScript (`tsc`) của Frontend import type trực tiếp từ Backend (`server/src/**/*.schemas.ts`), yêu cầu quá trình build Frontend phải có thư mục `server/node_modules`. Do đó, build context của Frontend trong Docker bắt buộc phải bao quát được cả thư mục `server`.

---

## 2. Đối chiếu với cấu trúc chuẩn của `maycha_QAQC_app`
Dự án `maycha_QAQC_app` sử dụng cấu trúc Monorepo rất sạch sẽ bằng pnpm + Turborepo:
*   `/apps/web`: Frontend React.
*   `/apps/api`: Backend API.
*   `docker-compose.yml` ở thư mục gốc chỉ chạy các dịch vụ Infra (MongoDB, MinIO, Backup) thông qua build context trỏ vào `/infra`. Các app chính được deploy độc lập qua Dokploy.

---

## 3. Các giải pháp đề xuất (Proposed Approaches)

### Phương án A: Tái cấu trúc thành Monorepo bất đối xứng thu gọn (Khuyên dùng)
Gom toàn bộ mã nguồn Frontend từ gốc vào thư mục con `frontend/`. Thư mục gốc chỉ chứa cấu hình chung.

*   **Cấu trúc thư mục mới:**
    ```text
    thuccoffee/
    ├── compose.yaml              # Quản lý toàn bộ stack
    ├── .gitignore
    ├── .github/workflows/ci.yml   # Cấu hình GitHub Actions
    ├── frontend/                 # [NEW] Chứa toàn bộ code Frontend cũ
    │   ├── src/
    │   ├── package.json
    │   ├── Dockerfile
    │   └── ...
    └── server/                   # (Backend - Giữ nguyên vị trí)
    ```
*   **Giải quyết ràng buộc build:**
    Trong `compose.yaml` và cấu hình Dokploy, đặt build context của Frontend là thư mục gốc `.`, nhưng trỏ file Dockerfile vào `frontend/Dockerfile`:
    ```yaml
    frontend:
      build:
        context: .
        dockerfile: frontend/Dockerfile
    ```

#### Đánh giá:
*   **Ưu điểm:** 
    *   Tách biệt hoàn toàn code Frontend khỏi thư mục gốc, đáp ứng yêu cầu "đưa compose ra ngoài 1 cấp" của Tech Lead.
    *   Đồng bộ phong cách tổ chức Monorepo với dự án `maycha_QAQC_app`.
    *   Giữ được liên kết check-type TypeScript giữa Frontend và Backend.
*   **Nhược điểm:** Cần cập nhật lại đường dẫn trong file CI/CD và hướng dẫn cấu hình ứng dụng trên Dokploy.

---

### Phương án B: Giữ nguyên cấu trúc code, chỉ tạo thư mục deploy riêng biệt
Giữ nguyên mã nguồn Frontend ở root. Tạo một thư mục `deploy/` hoặc `infra/` chứa file compose và nginx config độc lập.

#### Đánh giá:
*   **Ưu điểm:** Không làm xáo trộn file code, không ảnh hưởng cấu hình Dokploy và CI hiện tại.
*   **Nhược điểm:** Cấu trúc dự án vẫn bị lộn xộn, không thống nhất với tiêu chuẩn Monorepo của team.

---

## 4. Các tệp tin bị ảnh hưởng (Touchpoints) khi triển khai Phương án A
Nếu thực hiện Phương án A, các file sau đây cần được di chuyển hoặc cập nhật:

1.  **Di chuyển mã nguồn Frontend:**
    *   `src/` -> `frontend/src/`
    *   `public/` -> `frontend/public/`
    *   `package.json` -> `frontend/package.json`
    *   `package-lock.json` -> `frontend/package-lock.json`
    *   `tsconfig.json` -> `frontend/tsconfig.json`
    *   `tsconfig.app.json` -> `frontend/tsconfig.app.json`
    *   `tsconfig.node.json` -> `frontend/tsconfig.node.json`
    *   `vite.config.ts` -> `frontend/vite.config.ts`
    *   `vitest.config.ts` -> `frontend/vitest.config.ts`
    *   `playwright.config.ts` -> `frontend/playwright.config.ts`
    *   `e2e/` -> `frontend/e2e/` (test Playwright của admin UI, `testDir` trong playwright.config.ts trỏ theo)
    *   `scripts/` -> `frontend/scripts/` (download-images.sh + danh sách URL ảnh, thuộc về FE)
    *   `index.html` -> `frontend/index.html`
    *   `Dockerfile` (gốc) -> `frontend/Dockerfile`
    *   `.oxlintrc.json` -> `frontend/.oxlintrc.json`

2.  **Cập nhật các file cấu hình:**
    *   [compose.yaml](file:///d:/work/maycha/thuccoffee/compose.yaml): Cập nhật đường dẫn build context và Dockerfile của frontend.
    *   [.github/workflows/ci.yml](file:///d:/work/maycha/thuccoffee/.github/workflows/ci.yml): Cập nhật đường dẫn chạy lệnh cài đặt (`npm ci`), lint, build và docker build của Frontend.
    *   [frontend/Dockerfile](file:///d:/work/maycha/thuccoffee/frontend/Dockerfile) (sau khi chuyển): Điều chỉnh các đường dẫn sao chép file (do context vẫn là root `.`).

3.  **Tài liệu hướng dẫn:**
    *   [CLAUDE.md](file:///d:/work/maycha/thuccoffee/CLAUDE.md)
    *   [docs/deployment.md](file:///d:/work/maycha/thuccoffee/docs/deployment.md)

---

## 5. Hướng dẫn cấu hình Dokploy mới (Dành cho Tech Lead)
Khi deploy Frontend trên Dokploy sau khi chuyển đổi:
*   **Build type:** Dockerfile
*   **Dockerfile path:** `frontend/Dockerfile`
*   **Docker context path:** `.` *(Lưu ý: Bắt buộc giữ dấu chấm để lấy được thư mục server/)*
*   **Docker build stage:** runtime

---

## 6. Các bước triển khai đề xuất (Next Steps)
1.  Tạo nhánh mới `refactor/monorepo-restructure` từ `main`.
2.  Sử dụng `git mv` để chuyển các file Frontend vào thư mục `frontend/` (giúp giữ nguyên lịch sử git commit).
3.  Cập nhật file [frontend/Dockerfile](file:///d:/work/maycha/thuccoffee/frontend/Dockerfile) và root [compose.yaml](file:///d:/work/maycha/thuccoffee/compose.yaml).
4.  Cập nhật file cấu hình GitHub Actions [ci.yml](file:///d:/work/maycha/thuccoffee/.github/workflows/ci.yml).
5.  Cập nhật tài liệu hướng dẫn [CLAUDE.md](file:///d:/work/maycha/thuccoffee/CLAUDE.md) và [docs/deployment.md](file:///d:/work/maycha/thuccoffee/docs/deployment.md).
6.  Chạy kiểm thử build local bằng Docker Compose và kiểm tra GitHub Actions chạy thành công trên PR.
