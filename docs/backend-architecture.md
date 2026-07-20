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
│       ├── index.ts        khởi tạo Express, đăng ký route, phục vụ /docs
│       ├── db/             schema Drizzle, client, migration, seed
│       ├── routes/         một file mỗi nhóm tài nguyên
│       ├── schemas/        schema Zod dùng chung cho validate và OpenAPI
│       ├── middleware/     require-auth, validate, xử lý lỗi
│       └── lib/            sinh slug tiếng Việt, tiện ích chung
├── Dockerfile              frontend (đã có, không đổi)
└── compose.yaml            thêm service postgres và backend
```

Hai `package.json` tách biệt. Frontend không cài thư viện backend và ngược lại.

## Stack

| Thành phần | Chọn | Lý do |
|---|---|---|
| Runtime | Node 22 | Khớp `node:22-alpine` trong Dockerfile frontend |
| Framework | Express 5 | Phổ biến, nhiều tài liệu, dễ bàn giao |
| ORM | Drizzle | Schema viết bằng TypeScript, chuyển từ `types.ts` gần như trực tiếp |
| Database | Postgres 16 | Dokploy có sẵn service này |
| Validate | Zod | Chặn dữ liệu sai và suy ra kiểu TypeScript từ cùng một khai báo |
| Dữ liệu phía FE | TanStack Query | Cache, loading, error, invalidate sau khi sửa |

Backend viết TypeScript giống frontend, nhưng không có React — chỉ xử lý request
và truy vấn database.

Express không có validate sẵn, nên mỗi route khai báo schema Zod cho body và
query. Kiểu TypeScript suy ra từ chính schema đó, không khai báo hai lần.

### Chia sẻ kiểu giữa backend và frontend — chưa chốt

Vì là monorepo và cùng TypeScript, frontend import thẳng kiểu từ
`server/src/schemas/` là đủ: sửa schema ở backend thì frontend báo lỗi ngay,
không cần bước sinh code nào.

Phương án còn lại là sinh đặc tả OpenAPI từ Zod rồi dùng công cụ như `orval`
sinh ra kiểu và hook TanStack Query. Cách này thêm hai ba thư viện và một bước
build; nó chỉ đáng khi frontend và backend không chung ngôn ngữ hoặc không chung
repo — không phải trường hợp ở đây.

Đang chờ tài liệu từ dự án QA/QC để đối chiếu trước khi quyết.

## Cấu hình gốc cần sửa khi thêm server/

Bốn file ở thư mục gốc hiện áp dụng cho toàn repo và sẽ chạm tới `server/` nếu
để nguyên:

| File | Vấn đề | Sửa |
|---|---|---|
| `.dockerignore` | `Dockerfile` frontend dùng `COPY . .`, sẽ copy cả `server/` vào image | Thêm dòng `server` |
| `.oxlintrc.json` | Bật plugin `react`, sẽ quét code backend vốn không có React | Thêm `ignorePatterns` cho `server/`; `server/` có config lint riêng |
| `.github/workflows/ci.yml` | Chỉ build frontend | Thêm job cài, lint, build `server/` |
| `compose.yaml` | Chỉ có frontend | Thêm service `postgres` (có volume) và `backend` |

`tsconfig.app.json` đã giới hạn `include: ["src"]` nên không ảnh hưởng.
`node_modules` tách tự nhiên vì hai `package.json` độc lập.

## Cấu hình Postgres

Kết nối qua biến môi trường, không hardcode:

```
DATABASE_URL=postgres://user:pass@host:5432/thuccoffee
PORT=4000
NODE_ENV=development
```

Cổng ở local phải tránh những cổng đã có chủ: `3000` là Dokploy UI, `80`/`443`
là Traefik của Dokploy, `8080` là frontend chạy qua Compose. Backend dùng `4000`,
Postgres dùng `5432`.

Trong container thì cổng nào cũng được — Dokploy định tuyến theo cấu hình
Application, không theo cổng máy chủ.

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
GET    /api/health                cho healthcheck của container

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
đang tải và trạng thái lỗi. Dùng TanStack Query ngay từ bước này thay vì tự viết
`useState`/`useEffect` — trang admin ở giai đoạn sau cần invalidate cache sau mỗi
lần sửa, và viết lại lúc đó tốn hơn.

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

- Cách chia sẻ kiểu giữa backend và frontend: import trực tiếp hay sinh qua
  OpenAPI. Chờ tài liệu từ dự án QA/QC.
- Khi admin đổi slug bài đã xuất bản, có giữ redirect từ slug cũ không.
- Việc blog rút từ 54 trang xuống ~2 trang có chấp nhận được không.
