# Kiến trúc Backend

Điểm vào cho công việc backend. Nền tảng `server/` đã tồn tại với Express,
chuẩn hoá phản hồi/lỗi, validate biến môi trường và `GET /api/health`.

Schema và lý do đằng sau nó: @database-design.md

## Đọc gì trước khi bắt đầu

| File | Vì sao cần |
|---|---|
| `docs/database-design.md` | 14 bảng, ràng buộc, quy tắc slug, những thứ cố ý không làm |
| `src/data/types.ts` | Kiểu dữ liệu hiện tại — gần như là schema |
| `src/data/index.ts` | Lớp truy cập dữ liệu sẽ được thay ruột |

Đọc thêm `docs/deployment.md` và `docs/local-environment-and-ci.md` khi sửa
container hoặc CI. `docs/deviations-from-original.md` chỉ cần khi thay đổi hành
vi giao diện so với site gốc.

## Trạng thái hiện tại

Frontend là SPA tĩnh, đã gắn tag `v1.0.0`, deploy được. Nội dung vẫn nằm trong
`src/data/*.ts` dưới dạng mảng TypeScript: 42 sản phẩm, 10 bài viết, 7 cửa hàng,
10 danh mục. Frontend chưa gọi backend.

Backend foundation trong `server/` hiện chạy được, có middleware vận hành và
health endpoint. Content API, auth và admin CRUD nằm ngoài phạm vi foundation
hiện tại; chúng thuộc các giai đoạn sau.

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
├── server/                 backend foundation hiện có
│   ├── package.json        deps riêng, độc lập với frontend
│   └── src/
│       ├── index.ts        khởi tạo Express, đăng ký route
│       ├── common/         error handler, validate middleware, hằng số
│       ├── modules/        đóng gói theo tài nguyên
│       │   └── health/     GET /api/health
│       ├── db/             thêm ở phase schema/migration
│       └── lib/            thêm cùng các tiện ích dùng chung
├── Dockerfile              frontend (đã có, không đổi)
└── compose.yaml            frontend và Postgres local
```

Hai `package.json` tách biệt. Frontend không cài thư viện backend và ngược lại.

## Stack

| Thành phần | Chọn | Lý do |
|---|---|---|
| Runtime | Node 22 | Khớp `node:22-alpine` trong Dockerfile frontend |
| Framework | Express 5 | Phổ biến, nhiều tài liệu, dễ bàn giao |
| ORM | Drizzle | Schema viết bằng TypeScript, chuyển từ `types.ts` gần như trực tiếp |
| Database | Postgres 16 | Chạy ổn định bằng container local, có volume riêng |
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
đang chạy. Không thêm thư viện upload hay xử lý ảnh (`multer`, `sharp`) vì ảnh
nằm trong repo, ngoài phạm vi.

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
import type { Product } from '../../server/src/modules/products/schemas';
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
| `compose.yaml` | Chạy frontend và Postgres local; backend chạy từ `server/` ở giai đoạn này |

`tsconfig.app.json` đã giới hạn `include: ["src"]` nên không ảnh hưởng.
`node_modules` tách tự nhiên vì hai `package.json` độc lập.

## Cấu hình Postgres

Kết nối qua biến môi trường, không hardcode:

```
DATABASE_URL=postgres://user:pass@host:5432/thuccoffee
PORT=8080
NODE_ENV=development
```

Cổng ở local: frontend `3000`, backend `8080`, Postgres `5432`.

Biến môi trường được validate bằng Zod ngay lúc khởi động. Thiếu biến bắt buộc
thì server dừng kèm thông báo nêu đúng tên biến, thay vì lỗi khó hiểu ở tầng sâu
hơn khi có request đầu tiên.

Local, `compose.yaml` chạy frontend và Postgres có volume để dữ liệu sống qua
các lần restart; cổng database được publish thành `5432:5432` theo cấu hình
development hiện tại. Backend chạy từ `server/` và kết nối qua `DATABASE_URL`.
Triển khai production chưa nằm trong phạm vi foundation này.

**Postgres không được mở cổng ra ngoài** ở production. Chỉ backend truy cập
được. Nguyên tắc này đã ghi trong `docs/deployment.md`.

`.env` không bao giờ commit. Kèm `.env.example` liệt kê tên biến, không có giá
trị thật.

## API mục tiêu cho các giai đoạn sau

Foundation hiện chỉ có `GET /api/health`. Các content API, auth và admin API
dưới đây chưa nằm trong phạm vi hiện tại; frontend vẫn đọc dữ liệu tĩnh từ
`src/data/*.ts`.

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

1. **Postgres + schema + seed** — dựng DB, tạo 14 bảng, đổ dữ liệu từ
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

- Khi admin đổi slug bài đã xuất bản, có giữ redirect từ slug cũ không.
- Việc blog rút từ 54 trang xuống ~2 trang có chấp nhận được không.
