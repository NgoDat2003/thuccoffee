# Kiến trúc Backend

Điểm vào cho công việc backend. Chưa triển khai — `server/` chưa tồn tại.

Schema và lý do đằng sau nó: @database-design.md

## Đọc gì trước khi bắt đầu

| File | Vì sao cần |
|---|---|
| `docs/database-design.md` | 7 bảng, ràng buộc, quy tắc slug, những thứ cố ý không làm |
| `src/data/types.ts` | Kiểu dữ liệu hiện tại — gần như là schema |
| `src/data/index.ts` | Lớp truy cập dữ liệu sẽ được thay ruột |

Không cần đọc khi làm backend: `docs/deployment.md`, `docs/local-environment-and-ci.md`
(cả hai nói về container và CI của frontend), `docs/deviations-from-original.md`
(khác biệt giao diện so với site gốc), và toàn bộ `plans/`.

## Trạng thái hiện tại

Frontend là SPA tĩnh, đã gắn tag `v1.0.0`, deploy được. Nội dung nằm trong
`src/data/*.ts` dưới dạng mảng TypeScript: 42 sản phẩm, 10 bài viết, 7 cửa hàng,
10 danh mục.

Mọi trang đều lấy dữ liệu qua hàm trong `src/data/index.ts` —
`getProductBySlug()`, `getBlogPage()`, `getStoreBySlug()`. Không trang nào đọc
thẳng mảng dữ liệu.

Đây là điểm quan trọng nhất: **lớp `index.ts` là ranh giới sẵn có**. Khi có API,
chỉ cần đổi ruột các hàm này từ `array.find()` sang `fetch()`. Các trang không
phải sửa.

## Cấu trúc thư mục

```
thuccoffee/
├── src/                    frontend React, không đụng tới
├── server/                 backend, tạo mới
│   ├── package.json        deps riêng, độc lập với frontend
│   ├── Dockerfile          image riêng cho backend
│   └── src/
│       ├── index.ts        khởi tạo app, đăng ký route
│       ├── db/             schema Drizzle, migration, seed
│       └── routes/         một file mỗi nhóm tài nguyên
├── Dockerfile              frontend (đã có, không đổi)
└── compose.yaml            thêm service postgres và backend
```

Hai `package.json` tách biệt. Frontend không cài thư viện backend và ngược lại.

## Stack

| Thành phần | Chọn | Lý do |
|---|---|---|
| Runtime | Node 22 | Khớp `node:22-alpine` trong Dockerfile frontend |
| Framework | Hono | Nhẹ, TypeScript-first |
| ORM | Drizzle | Schema viết bằng TypeScript, chuyển từ `types.ts` gần như trực tiếp |
| Database | Postgres 16 | Dokploy có sẵn service này |
| Validate | Zod | Dùng chung schema cho API và form admin |

Backend viết TypeScript giống frontend, nhưng không có React — chỉ xử lý request
và truy vấn database.

## Cấu hình Postgres

Kết nối qua biến môi trường, không hardcode:

```
DATABASE_URL=postgres://user:pass@host:5432/thuccoffee
PORT=3000
NODE_ENV=development
```

Local chạy qua `compose.yaml` (thêm service `postgres`, có volume để dữ liệu
sống qua các lần restart). Production do Dokploy cấp: Postgres là service riêng
trong cùng project, backend gọi qua tên service ở mạng nội bộ.

**Postgres không được mở cổng ra ngoài** ở production. Chỉ backend truy cập
được. Nguyên tắc này đã ghi trong `docs/deployment.md`.

`.env` không bao giờ commit. Kèm `.env.example` liệt kê tên biến, không có giá
trị thật.

## API

Đọc công khai, ghi phải đăng nhập.

```
GET    /api/products              danh sách, lọc theo ?category=
GET    /api/products/:slug
GET    /api/categories
GET    /api/blog                  phân trang ?page=
GET    /api/blog/:slug
GET    /api/stores
GET    /api/stores/:slug
GET    /api/banners               chỉ banner đang bật

POST   /api/auth/login
POST   /api/auth/logout

POST   /api/admin/products        các route /api/admin/* đều cần đăng nhập
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
```

Endpoint công khai chỉ trả bản ghi có `is_published = true`.

## Thứ tự triển khai

Mỗi bước chạy được và kiểm chứng được trước khi sang bước sau.

1. **Postgres + schema + seed** — dựng DB, tạo 7 bảng, đổ dữ liệu từ
   `src/data/*.ts`. Chưa có API. Kiểm chứng bằng truy vấn SQL.
2. **API đọc** — các endpoint GET ở trên. Kiểm chứng bằng curl.
3. **Frontend đọc từ API** — đổi ruột `src/data/index.ts`. Các trang không sửa.
4. **Đăng nhập** — bảng `users`, hash mật khẩu, session hoặc JWT, middleware
   chặn `/api/admin/*`.
5. **Admin CRUD** — giao diện thêm/sửa/xoá nội dung.

Bước 4 phải trước bước 5: có CRUD mà không có auth nghĩa là ai cũng sửa được dữ
liệu.

Upload ảnh không nằm trong danh sách này — ảnh vẫn ở trong repo, DB chỉ lưu tên
file. Thêm ảnh mới vẫn phải commit.

## Ảnh hưởng tới frontend khi chuyển sang API

Ba thay đổi không tránh được:

**Dữ liệu trở thành bất đồng bộ.** Các hàm trong `src/data/index.ts` hiện trả
kết quả ngay; sau khi dùng `fetch` chúng trả Promise. Các trang cần trạng thái
đang tải và trạng thái lỗi.

**Phân trang blog đang là giả.** `BLOG_PAGE_COUNT` là 54 trong khi chỉ có 10
bài thật — `getBlogPage()` lặp lại chúng để khớp số trang site gốc. Khi dùng dữ
liệu thật, số trang tính từ số bài thật, blog rút xuống còn khoảng 2 trang.

**Ngày tháng đổi kiểu.** Hiện là chuỗi `'03.06.2026'`; trong DB là kiểu `date`.
Frontend phải format lại khi hiển thị.

## Quy ước nhánh

Backend làm trên nhánh `feat/backend`, tách khỏi `main`. `main` giữ trạng thái
frontend deploy được — manager build từ đó bất cứ lúc nào mà không gặp code
đang dở.

Merge vào `main` khi backend chạy được đầu-cuối và frontend đã đọc từ API.
Trước lúc đó `main` chỉ nhận sửa lỗi frontend.

Tag `v1.0.0` trỏ vào commit frontend hoàn chỉnh, dùng làm điểm quay về nếu cần.

## Câu chưa chốt

- Khi admin đổi slug bài đã xuất bản, có giữ redirect từ slug cũ không.
- Việc blog rút từ 54 trang xuống ~2 trang có chấp nhận được không.
