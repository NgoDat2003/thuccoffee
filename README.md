# Thức Coffee — Clone Frontend + Admin CMS

Bản clone của [thuccoffee.com.vn](http://www.thuccoffee.com.vn), website chuỗi
cà phê Việt Nam. Repo gồm frontend React, backend Express với API đọc công khai
và admin CMS đầy đủ (đăng nhập JWT, CRUD sản phẩm, danh mục, bài viết, cửa hàng,
banner, cài đặt website, upload ảnh lên MinIO, trình soạn thảo bài viết
rich-text), cùng hạ tầng Postgres/MinIO chạy local. Giỏ hàng thật và thanh toán
nằm ngoài phạm vi hiện tại.

**Trạng thái hiện tại:** toàn bộ trang public đọc từ API — sản phẩm, danh mục,
bài viết, cửa hàng, banner, cài đặt, trang nội dung, FAQ thành viên, gallery
trang chủ. Nội dung sửa trong admin phản ánh ra public sau reload. Search
sản phẩm/bài viết, form liên hệ và đăng ký nhận tin đều có backend thật
(submissions lưu database; gửi email nằm ngoài scope vì chưa có provider).
`src/data/*.ts` chỉ còn là nguồn seed và nơi khai báo type dùng chung.

Lịch sử các đợt làm việc nằm trong `plans/`; mỗi thư mục là một chu kỳ đã xong.

## Stack

- Vite + React 19 + TypeScript (strict mode)
- Tailwind CSS v4 (CSS-first `@theme`)
- React Router v7 (routing theo config)
- TanStack Query cho data admin; Tiptap cho trình soạn thảo bài viết
- Express 5 + TypeScript backend (`server/`) với Drizzle ORM
- Postgres 16, MinIO object storage (bucket `thuccoffee` public-read)

## Chạy nhanh (Docker Compose)

Chạy image frontend/backend kiểu production cùng các dịch vụ phụ thuộc.

```bash
cp .env.example .env           # lần đầu; THAY JWT_SECRET bằng giá trị mới
docker compose up -d --build   # build và chạy trên http://localhost:3000
docker compose ps              # trạng thái và health các container
```

| Dịch vụ | Endpoint local | Ghi chú |
|---|---|---|
| Frontend | `http://localhost:3000` | Nginx SPA; API và media đi qua proxy cùng origin |
| Backend | `http://localhost:8080/api/health` | Chờ Postgres và MinIO healthy |
| Postgres | `localhost:5432` | Volume `postgres-data` lưu bền |
| MinIO API | `http://localhost:9000` | Volume `minio-data` lưu bền |
| MinIO console | `http://localhost:9001` | Chỉ dùng quản trị local |
| `minio-init` | container chạy một lần | Tạo bucket `thuccoffee` và bật anonymous download |

Dựng database lần đầu (chạy một lần, theo thứ tự):

```bash
cd server
npm install
npm run db:migrate        # tạo schema
npm run db:seed           # đổ nội dung từ src/data/*.ts — xem cảnh báo bên dưới
npm run db:seed-images    # upload ảnh từ src/assets/images/ lên MinIO
```

> **⚠️ Seed ghi đè nội dung admin đã sửa.** `npm run db:seed` upsert và
> delete-recreate các dòng, nên chạy lại sẽ **xóa sạch nội dung đã chỉnh qua
> admin**. Chỉ chạy đúng một lần khi dựng môi trường. Coi nó là công cụ reset,
> không phải lệnh chạy thường xuyên. (Tách bootstrap-một-lần khỏi dev-reset là
> nợ kỹ thuật đã ghi nhận — xem `docs/backend-architecture.md`.)

## Đăng nhập admin

Thông tin đăng nhập không bao giờ nằm trong source. Tạo hoặc reset tài khoản
admin trên database của chính bạn:

```powershell
cd server
$env:DATABASE_URL="postgresql://thuccoffee:thuccoffee@127.0.0.1:5432/thuccoffee"
$env:ADMIN_EMAIL="you@example.com"
$env:ADMIN_PASSWORD="mat-khau-manh-tu-chon"   # từ 12 ký tự trở lên
npm run create-admin
```

Sau đó mở `http://localhost:3000/admin/login`. Chạy lại script sẽ reset mật khẩu
cho email đó. Tài khoản nằm trong bảng `users` (hash argon2id) — mỗi môi trường
tự tạo tài khoản riêng; không có tài khoản mặc định.

## Phát triển (không dùng Docker)

```bash
npm install
npm run dev            # dev server frontend
npm run build          # build production
npm run lint           # oxlint
npm run test:admin-ui  # vitest — bảng admin + corpus editor bài viết (267 bài)
npm run test:admin-e2e # Playwright — cần stack Compose đang chạy
```

Backend có dependency và script riêng:

```bash
cd server
npm install
npm run dev      # backend trên http://localhost:8080
npm run build
npm run lint
```

## Bộ smoke test (lưới regression)

Mười một bộ trong `server/scripts/smoke-*.ts` kiểm tra auth, API public, CRUD
admin, search, submissions, static pages/gallery, options/stickers, upload và
tính toàn vẹn ảnh trên stack đang chạy. Các bộ admin cần
`ADMIN_EMAIL`/`ADMIN_PASSWORD` của một tài khoản có sẵn:

```bash
cd server
npm run smoke:auth
npm run smoke:api
npm run smoke:admin-products
npm run smoke:admin-blog              # gồm gate byte-identity sanitizer 267 bài
npm run smoke:admin-stores
npm run smoke:admin-banners-settings
npm run smoke:upload
npm run smoke:images
npm run smoke:search-submissions      # search + contact/newsletter (không cần auth)
npm run smoke:pages-gallery           # static pages + FAQ + gallery admin→public
npm run smoke:options-stickers        # options/stickers admin→public
```

Chạy chúng trước khi kết luận bất cứ điều gì về backend hoặc admin.

## Lưu trữ ảnh

MinIO là kho ảnh chuẩn; database chỉ lưu object key (`storage_key`, marker
`blog-asset:<key>` trong HTML bài viết). File ảnh vẫn còn trong
`src/assets/images/` làm nguồn seed trong giai đoạn chuyển tiếp.
`npm run db:seed-images` giữ nguyên đường dẫn tương đối so với
`src/assets/images/` và ghi đè cùng object key một cách an toàn.

## Ghi chú production

Giá trị mặc định chỉ dành cho phát triển local. Trước khi mở bất kỳ môi trường
nào ra ngoài: thay `JWT_SECRET`, đổi credentials MinIO, và giữ MinIO console
riêng tư. Xem `docs/deployment.md` cho contract runtime và bảo mật đầy đủ.
