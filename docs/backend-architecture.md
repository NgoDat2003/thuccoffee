# Kiến trúc Backend

Điểm vào cho công việc backend. Nền tảng `server/` đã tồn tại với Express,
chuẩn hoá phản hồi/lỗi, validate biến môi trường và `GET /api/health`.

Schema và lý do đằng sau nó: @database-design.md

## Đọc gì trước khi bắt đầu

| File | Vì sao cần |
|---|---|
| `docs/database-design.md` | 14 bảng, ràng buộc, quy tắc slug, những thứ cố ý không làm |
| `frontend/src/data/types.ts` | Kiểu dữ liệu hiện tại — gần như là schema |
| `frontend/src/lib/api/`, `frontend/src/services/`, `frontend/src/providers/` | Data layer FE mới; page chưa chuyển sang hook |

Đọc thêm `docs/deployment.md` và `docs/local-environment-and-ci.md` khi sửa
container hoặc CI. `docs/deviations-from-original.md` chỉ cần khi thay đổi hành
vi giao diện so với site gốc.

## Trạng thái hiện tại

Frontend từng là SPA tĩnh thuần (tag `v1.0.0`); nay mọi tài nguyên do backend
quản lý đều đọc qua API. Sáu nhóm nội dung — sản phẩm, danh mục, blog, cửa hàng,
banner, site settings — render từ hook TanStack Query, không còn đọc
`frontend/src/data/*.ts`. Nhóm trang tĩnh nội dung ít đổi (About/Contact/
Delivery/Cookie/FAQ + Careers/Membership) vẫn giữ trong
`frontend/src/data/pages.ts` có chủ đích: backend chưa có endpoint
`pages`, bảng `static_pages` cố ý để trống (xem mục dưới).

Backend trong `server/` hiện chạy được, có middleware vận hành, health endpoint
và chín endpoint đọc công khai cho categories, banners, site settings, stores,
blog và products. Store detail trả gallery có thứ tự; store list không trả gallery.
Auth foundation đã có JWT trong cookie httpOnly, Argon2, CLI bootstrap admin và guard `/api/admin/*`. Admin CRUD thuộc giai đoạn sau.

Hạ tầng ảnh MinIO đã có trong Compose: API `9000`, console local `9001`, volume
`minio-data`, bucket `thuccoffee` public-read và lệnh seed
`npm run db:seed-images`. Frontend chưa dùng kho này; ảnh hiển thị vẫn được bundle
từ `frontend/src/assets/images/`. Snapshot hiện tại có 498 ảnh hợp lệ sau khi 103 PNG emoji
được đổi thành Unicode trong nội dung blog rồi xoá. Count kiểm chứng phải luôn
tính động vì tập ảnh còn có thể thay đổi.

Các page đọc nội dung DB đã chuyển hết sang hook TanStack Query: axios client
trong `frontend/src/lib/api/` unwrap `ApiResponse<T>` và chuẩn hoá `ApiError`;
sáu service+hook trong `frontend/src/services/` giữ query key và type import
thẳng từ backend; `QueryProvider` trong `frontend/src/providers/` bọc router
với cache mặc định năm phút. Barrel `frontend/src/data/index.ts` đã xoá;
`frontend/src/data/*.ts` chỉ còn `pages.ts` (nhóm tĩnh) và `category-paths.ts`
(routing/slug, không phải nội dung DB).

## Cấu trúc thư mục

```
thuccoffee/
├── frontend/
│   ├── Dockerfile               image frontend Nginx
│   ├── package.json             deps và script riêng
│   └── src/                     frontend React + nguồn ảnh local
│       ├── lib/api/             axios client + chuẩn hoá response/error
│       ├── providers/           TanStack Query provider
│       └── services/            query keys + hook theo tài nguyên
├── server/
│   ├── Dockerfile               image backend Node 22
│   ├── .env.example             hợp đồng env local
│   ├── package.json             deps và script riêng
│   └── src/
│       ├── index.ts             khởi tạo Express, đăng ký route
│       ├── common/env.ts        validate Postgres + MinIO env bằng Zod
│       ├── modules/health/      GET /api/health
│       ├── db/                  schema, migration, seed dữ liệu và seed ảnh
│       └── lib/minio-client.ts  MinIO SDK client dùng chung
└── compose.yaml                 frontend, backend, Postgres, MinIO + init
```

Hai `package.json` tách biệt. Frontend không cài thư viện backend và ngược lại.

## Stack

| Thành phần | Chọn | Lý do |
|---|---|---|
| Runtime | Node 22 | Khớp `node:22-alpine` trong Dockerfile frontend |
| Framework | Express 5 | Phổ biến, nhiều tài liệu, dễ bàn giao |
| ORM | Drizzle | Schema viết bằng TypeScript, chuyển từ `types.ts` gần như trực tiếp |
| Database | Postgres 16 | Chạy ổn định bằng container local, có volume riêng |
| Object storage | MinIO | Bucket public-read; dữ liệu sống trong volume riêng |
| Validate | Zod | Chặn dữ liệu sai và suy ra kiểu TypeScript từ cùng một khai báo |
| Dữ liệu phía FE | TanStack Query | Cache, loading, error, invalidate sau khi sửa |

Backend viết TypeScript giống frontend, nhưng không có React — chỉ xử lý request
và truy vấn database.

Express không có validate sẵn, nên mỗi route khai báo schema Zod cho body và
query. Kiểu TypeScript suy ra từ chính schema đó, không khai báo hai lần.

### Thư viện

| Gói | Việc |
|---|---|
| `express` | HTTP server |
| `drizzle-orm`, `drizzle-kit` | Truy vấn và migration |
| `pg` | Driver Postgres |
| `minio` | SDK upload ảnh theo object key tương đối |
| `zod` | Validate body/query và validate biến môi trường lúc khởi động |
| `dotenv` | Đọc `.env` khi chạy local |
| `argon2` | Hash mật khẩu — cùng lựa chọn với dự án QA/QC, mạnh hơn bcrypt |
| `jsonwebtoken` | Ký và xác minh token đăng nhập |
| `helmet` | Đặt HTTP security header |
| `compression` | Nén phản hồi |
| `cors` | Cho phép frontend khác cổng gọi API |
| `pino`, `pino-http` | Log có cấu trúc — cùng lựa chọn với QA/QC |

Dev: `typescript`, `tsx`, `oxlint`, `@types/*`.

Không dùng `bcrypt` — `argon2` là khuyến nghị hiện tại và là thứ dự án QA/QC
đang chạy. MinIO SDK hiện chỉ phục vụ seed ảnh từ repo; chưa có upload runtime,
`multer`, `sharp` hay admin media API.

### Quy ước module

Mỗi tài nguyên là một thư mục trong `modules/`, chứa mọi thứ liên quan tới nó —
route, nghiệp vụ, schema. Không gom theo loại file kiểu `controllers/` chứa mọi
controller. Đây là cách dự án QA/QC tổ chức 27 module và nó vẫn đọc được.

Schema tách theo mục đích, không dùng chung một kiểu cho mọi việc:

| Schema | Dùng cho |
|---|---|
| `createXSchema` | Body khi tạo mới |
| `updateXSchema` | Body khi sửa, thường là partial của create |
| `listXQuerySchema` | Query params khi lọc, tìm, phân trang |
| `xResponseSchema` | Hình dạng trả về |

Input và output là hai kiểu khác nhau: body tạo mới không có `id` hay
`createdAt`, còn response thì có. Dùng chung một kiểu cho cả hai sẽ khiến client
tưởng phải gửi những trường mà server tự sinh.

Drizzle schema là ngoại lệ — để tập trung ở `db/schema.ts` thay vì rải theo
module, vì các bảng tham chiếu lẫn nhau qua khoá ngoại và tách ra sẽ tạo vòng
tròn import.

### Hình dạng phản hồi

Mọi phản hồi có body đều bọc trong một kiểu duy nhất:

```ts
type ApiResponse<T> =
  | { success: true; data: T; meta?: PaginationMeta }
  | { success: false; error: { code: string; message: string; details?: unknown } };
```

Đây là discriminated union: kiểm tra `success` xong thì TypeScript tự thu hẹp
kiểu, nên không thể đọc nhầm `data` ở nhánh lỗi — trình biên dịch chặn.

**Thành công:**

```json
HTTP 200
{ "success": true, "data": { "id": 1, "name": "AMERICANO", "price": 45000 } }
```

**Danh sách:**

```json
HTTP 200
{ "success": true, "data": [ { "id": 1 }, { "id": 2 } ] }
```

**Danh sách có phân trang** — metadata nằm cạnh `data`, không lẫn vào trong:

```json
HTTP 200
{
  "success": true,
  "data": [ ... ],
  "meta": { "page": 2, "pageSize": 5, "total": 10, "totalPages": 2 }
}
```

Chỉ blog cần `meta`. Sản phẩm, cửa hàng, danh mục, banner đều vài chục bản ghi
nên trả hết một lần.

**Lỗi:**

```json
HTTP 404
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Không tìm thấy sản phẩm." } }
```

**Lỗi validate** kèm chi tiết từng trường:

```json
HTTP 400
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Dữ liệu không hợp lệ.",
    "details": [ { "field": "price", "message": "Giá phải là số nguyên dương." } ]
  }
}
```

| Trường của `error` | Ý nghĩa |
|---|---|
| `code` | Mã hằng để frontend phân nhánh: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR` |
| `message` | Câu tiếng Việt hiển thị được cho người dùng |
| `details` | Lỗi từng trường khi validate thất bại; vắng mặt nếu không có |

Phân nhánh theo `code`, không theo `message` — `message` là chữ hiển thị và có
thể đổi bất cứ lúc nào.

### Hai quy tắc không được vi phạm

**HTTP status giữ đúng ngữ nghĩa.** Bọc body không có nghĩa luôn trả `200`.
Không tìm thấy vẫn là `404`, chưa đăng nhập vẫn là `401`. Trả `200` kèm
`success: false` sẽ làm cache, giám sát và logic thử lại hiểu sai — đây là lỗi
phổ biến nhất của kiểu phản hồi có bọc.

**`204 No Content` không có body.** Xoá thành công thì trả `204` rỗng, không ép
bọc thành `200` với `data: null`.

### Khác với dự án QA/QC

Dự án đó trả dữ liệu trần: controller trả thẳng `BrandResponseDto[]`, lỗi thì
`ApiExceptionFilter` trả envelope riêng. Cách đó cũng hợp lệ — frontend phân biệt
đúng/sai qua `res.ok` của Fetch.

Ở đây chọn bọc vì lý do khác: một hình dạng duy nhất cho mọi endpoint, khai báo
`ApiResponse<T>` một lần, và discriminated union ép frontend xử lý cả hai nhánh
thay vì quên nhánh lỗi.

### Chia sẻ kiểu giữa backend và frontend

Frontend import thẳng kiểu từ module backend tương ứng:

```ts
import type { Product } from '../../server/src/modules/products/products.schemas';
```

Sửa schema ở backend thì frontend báo lỗi ngay trong editor, không qua bước sinh
code nào có thể lỗi thời.

Không dùng OpenAPI + Orval như dự án QA/QC. Ở đó pipeline này xứng đáng: 139
endpoint sinh ra hơn 15.000 dòng client và 415 file model — viết tay là bất khả
thi. Dự án này có khoảng 15 endpoint, nên chi phí dựng pipeline (script sinh
spec, config Orval, custom mutator xử lý refresh/blob, cổng kiểm tra drift trong
CI) lớn hơn phần tiết kiệm được. Cấu hình bên đó cũng không bê sang được vì họ
dùng NestJS, nơi decorator Swagger sinh spec sẵn.

Thêm OpenAPI sau vẫn được nếu API mở cho bên thứ ba dùng, hoặc xuất hiện client
không viết bằng TypeScript.

## Cấu hình gốc cho monorepo

Bốn file ở thư mục gốc áp dụng cho toàn repo và phải tách đúng trách nhiệm giữa
frontend với `server/`:

| File | Trách nhiệm hiện tại |
|---|---|
| `.dockerignore` | Loại `server/` khỏi image frontend |
| `.oxlintrc.json` | Bỏ qua `server/`; backend dùng config lint riêng |
| `.github/workflows/ci.yml` | Cài, lint và build cả frontend lẫn `server/` |
| `compose.yaml` | Chạy frontend, backend, Postgres, MinIO và one-shot `minio-init` |

`tsconfig.app.json` đã giới hạn `include: ["src"]` nên không ảnh hưởng.
`node_modules` tách tự nhiên vì hai `package.json` độc lập.

## Cấu hình runtime

Kết nối qua biến môi trường, không hardcode:

```
DATABASE_URL=postgres://user:pass@host:5432/thuccoffee
PORT=8080
NODE_ENV=development
JWT_SECRET=replace-with-at-least-32-random-characters
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=thuccoffee
MINIO_USE_SSL=false
```

Cổng local: frontend `3000`, backend `8080`, Postgres `5432`, MinIO API `9000`
và console `9001`. Giá trị MinIO mặc định chỉ dành cho local.

Biến môi trường được validate bằng Zod ngay lúc khởi động. Thiếu biến bắt buộc
thì server dừng kèm thông báo nêu đúng tên biến, thay vì lỗi khó hiểu ở tầng sâu
hơn khi có request đầu tiên.

Local, `compose.yaml` chạy đủ frontend, backend, Postgres và MinIO. Backend đợi
Postgres + MinIO healthy; `minio-init` tạo bucket public-read rồi thoát. Hai
volume `postgres-data` và `minio-data` giữ dữ liệu qua restart/down không xoá
volume. Triển khai production chưa nằm trong phạm vi foundation này.

Ở production, Postgres và MinIO console không được mở ra internet. Đổi credential
mặc định; ưu tiên private network. Nếu object API phải phục vụ trình duyệt ở
giai đoạn sau thì đặt sau TLS/proxy riêng, không công khai console. Chi tiết ở
`docs/deployment.md`.

`.env` không bao giờ commit. Kèm `.env.example` liệt kê tên biến, không có giá
trị thật.

## API hiện có và mục tiêu các giai đoạn sau

`GET /api/health` và chín content API GET dưới đây đã triển khai. Frontend vẫn
đọc dữ liệu tĩnh từ `frontend/src/data/*.ts`; auth và admin API vẫn là mục tiêu tiếp theo.

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
GET    /api/site-settings         đúng 11 key public, map camelCase

POST   /api/auth/login             đặt JWT 7 ngày vào cookie httpOnly
GET    /api/auth/me                trả user hiện tại, cần cookie
POST   /api/auth/logout            xóa cookie, trả 204
GET    /api/admin/me               route guard mẫu, cần đăng nhập

POST   /api/admin/uploads          multipart, validate 3 lớp, trả object key
GET/POST/PUT/PATCH /api/admin/products[...]   CRUD + publish, M:N categories,
                                   slug khóa sau tạo, 409 slug trùng
GET/PUT /api/admin/categories[...]  chỉ label + sortOrder, key bất biến
GET/POST/PUT/PATCH /api/admin/blog[...]  pagination server, content sanitize
                                   allow-list; POST /api/admin/blog/preview
GET/POST/PUT/PATCH /api/admin/stores[...]  + PUT /:id/gallery replace toàn bộ
GET/POST/PUT/PATCH/DELETE /api/admin/banners[...]  DELETE 204 (ngoại lệ duy
                                   nhất của policy unpublish-thay-delete)
GET/PUT /api/admin/site-settings   allow-list 11 key public, key lạ 400
```

Mọi route `/api/admin/*` sau guard `requireAuth`. Mỗi resource có smoke script
riêng (`smoke:upload`, `smoke:admin-products`, `smoke:admin-blog`,
`smoke:admin-stores`, `smoke:admin-banners-settings`, `smoke:options-stickers`).

Endpoint công khai chỉ trả bản ghi có `is_published = true`.

## Thứ tự triển khai

Mỗi bước chạy được và kiểm chứng được trước khi sang bước sau.

1. **Foundation + hạ tầng local** — Express, Postgres/schema/seed và MinIO bucket
   + script seed ảnh. Đã xong, từng phần kiểm chứng độc lập.
2. **API đọc** — chín endpoint GET ở trên. Đã xong; `npm run smoke:api` kiểm
   chứng 9/9 endpoint, gallery cửa hàng, 404 slug sai và 400 query sai.
3. **Frontend đọc từ API** — Đã xong. Sáu nhóm nội dung DB (products, categories,
   blog, stores, banners, site-settings) render từ hook TanStack Query với
   loading/error; barrel `frontend/src/data/index.ts` đã xoá. Kiểm chứng runtime qua nginx
   proxy `:3000/api/*` (200 + JSON thật, không rơi fallback), gallery cửa hàng,
   phân trang blog 267 bài / 54 trang và 404 slug sai. Nhóm trang tĩnh giữ nguyên
   có chủ đích (backend chưa có endpoint `pages`).
4. **Đăng nhập** — Đã xong: bảng `users`, Argon2, JWT cookie httpOnly, middleware
   chặn `/api/admin/*`; `smoke:auth` kiểm chứng 8/8 qua backend và Nginx.
5. **Admin CRUD** — Đã xong: shell admin (`/admin/*`, guard qua `useMe`), upload
   ảnh multipart lên MinIO, CRUD đầy đủ 6 resource (products+categories, blog
   với sanitize HTML + preview an toàn, stores+gallery, banners, site-settings).
   Kiểm chứng: 8 smoke suite xanh qua cả backend lẫn Nginx, DOM 6 resource
   mutation phản ánh public không cần F5.

Bước 4 phải trước bước 5: có CRUD mà không có auth nghĩa là ai cũng sửa được dữ
liệu.

**Cảnh báo seed lifecycle (bắt buộc xử lý trước go-live):** `npm run db:seed`
hiện vẫn upsert + delete-recreate — chạy lại sau khi admin sửa nội dung sẽ GHI
ĐÈ dữ liệu admin. Trước khi vận hành thật phải tách seed thành các lệnh riêng
(migration / bootstrap-once / dev-reset), không chạy `db:seed` trên DB có dữ
liệu admin.

MinIO và seed ảnh đã có, nhưng **upload runtime/admin vẫn ngoài danh sách này**.
Nguồn ảnh hiện vẫn commit trong repo; seed upload theo đường dẫn tương đối, còn
frontend vẫn dùng `/assets/`. API đọc hiện trả tên file trần, chưa dựng URL MinIO.
Việc map basename sang relative object key và chuyển frontend sang MinIO thuộc
phase frontend/media sau; script ảnh không cập nhật `media_attachments`.

## Ảnh hưởng tới frontend khi chuyển sang API

Ba thay đổi không tránh được:

**Data layer bất đồng bộ đã có, page chưa dùng.** `frontend/src/lib/api/axios.ts`
dùng axios interceptor để giữ `{ data, meta? }`, chuẩn hoá lỗi thành `ApiError`,
và proxy `/api` qua Vite khi dev. Sáu file `frontend/src/services/*.service.ts`
giữ query key, type import từ backend và hook `useQuery`; `QueryProvider` bọc
router với cache mặc định năm phút. Vòng chuyển page phải render đủ
loading/error/data, không tự viết fetch trong component. `frontend/src/data/*.ts`
vẫn là nguồn đang chạy tới khi page cuối cùng chuyển xong.

**Phân trang blog đã dùng đủ dữ liệu tĩnh.** `frontend/src/data/blog.ts` chứa
267 bản ghi metadata cho danh sách. HTML đầy đủ đã làm sạch nằm trong
`frontend/src/data/blog-content.ts`, ánh xạ theo slug và chỉ được lazy-load khi mở trang
chi tiết. `getBlogPage()` cắt đúng năm bài mỗi trang trong 54 trang; trang 54
còn hai bài, không lặp dữ liệu. Seed import cả hai nguồn để upsert `content` vào
`blog_posts`; API detail hiện đã trả content đầy đủ, nhưng frontend chưa chuyển sang dùng API.

**Ngày tháng đổi kiểu.** Hiện là chuỗi `'03.06.2026'`; trong DB là kiểu `date`.
Frontend phải format lại khi hiển thị.

## Quy ước nhánh

Backend được dựng trên nhánh `feat/backend` và **đã merge vào `main`** (2026-07-21,
merge `26235bf`): foundation, MinIO, public read API (9 endpoint). `main` giữ
trạng thái build được — cả frontend lẫn `server/` lint/build sạch.

Quyết định merge sớm hơn dự tính ban đầu (kế hoạch cũ là chỉ merge khi frontend
đã đọc API): người dùng chủ động chọn đưa backend lên `main` để task sau rẽ từ
`main` có sẵn API. Hệ quả: `main` = frontend tĩnh + backend chưa nối FE —
**frontend vẫn đọc tĩnh**, chưa gọi API. Vòng "FE đọc DB" là bước tiếp theo.

Tag `v1.0.0` trỏ vào commit frontend tĩnh hoàn chỉnh (trước khi có backend), dùng
làm điểm quay về nếu cần.

## Câu chưa chốt

- Khi admin đổi slug bài đã xuất bản, có giữ redirect từ slug cũ không.
