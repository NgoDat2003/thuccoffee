# CLAUDE.md

Stack, scripts, lệnh container: @README.md

## Đọc tài liệu nào

Đọc theo việc đang làm, không đọc hết.

| Đang làm | Đọc |
|---|---|
| Backend, database, admin | `docs/backend-architecture.md` → `docs/database-design.md` |
| Giao diện, nội dung trang | `docs/deviations-from-original.md` |
| Container, deploy, CI | `docs/deployment.md`, `docs/local-environment-and-ci.md` |

`plans/` là lịch sử các đợt làm việc đã xong. Không cần đọc trừ khi truy nguồn
một quyết định cũ.

## Dự án này là gì

Bản clone của một site chuỗi cà phê Việt Nam đang chạy thật, gồm frontend React,
backend Express (`server/`) với API đọc công khai + admin CMS (JWT, CRUD 6 nhóm
resource, upload MinIO, editor Tiptap), và hạ tầng Postgres/MinIO local. Không có
giỏ hàng thật, thanh toán, hay tài khoản public — đó là quyết định scope, không
phải bug (xem `plans/reports/260723-thuccoffee-full-functional-parity-audit.md`
§13). Đọc `docs/deviations-from-original.md` trước khi kết luận một khoảng trống
là bug.

**Trạng thái data fetching:** toàn bộ trang public đọc từ API qua
`frontend/src/services/*.service.ts` — products, blog, stores, banners,
categories, site-settings, 6 trang nội dung (static_pages), FAQ thành viên,
gallery trang chủ. Search sản phẩm/bài viết, contact form, newsletter có
backend thật (submissions lưu DB). `frontend/src/data/*.ts` chỉ còn là nguồn
seed + nơi khai báo type dùng chung — không thêm nghiệp vụ mới vào lớp này.
Tag `v1.0.0` là điểm quay về cho bản frontend tĩnh thuần (trước khi có
`frontend/` — ở thời điểm đó code còn ở root).

## Hỏi lại thay vì đoán

Không suy diễn nghiệp vụ. Khi gặp một trong các trường hợp sau thì **dừng lại
và hỏi**, không tự chọn hướng rồi viết code:

- Yêu cầu có thể hiểu theo nhiều cách, và các cách đó dẫn tới cấu trúc dữ liệu
  hoặc luồng khác nhau.
- Cần thêm field/route/trạng thái mà `frontend/src/data/types.ts` chưa có, và không rõ
  giá trị hợp lệ là gì.
- Không tìm thấy nội dung tương ứng trên site gốc để đối chiếu.
- Yêu cầu mâu thuẫn với `docs/deviations-from-original.md`.

Khi chưa chắc, nói thẳng "chưa đủ thông tin, cần xác nhận X" kèm 2–3 phương án
cụ thể để chọn. Không viết code chạy tạm rồi sửa sau.

Không bịa: tên file, tên hàm, tên field, API, tên gói, đường dẫn. Kiểm tra bằng
Read/Grep/Glob trước khi nhắc tới chúng. Nếu đã kiểm tra mà không có thì nói là
không có, đừng tạo ra một cái nghe hợp lý.

Báo cáo trung thực: lint/build/test fail thì nói fail kèm output, bỏ qua bước
nào thì nói rõ. Không mô tả việc chưa làm như đã làm.

## Phản biện, không gật đầu

Khi thấy cách làm tốt hơn về cấu trúc, luồng dữ liệu, hoặc khả năng bảo trì thì
phải nêu ra trước khi thực hiện — kể cả khi yêu cầu đã nói rõ phải làm cách kia.
Nêu ngắn gọn: cách đang định làm, cách tốt hơn, đánh đổi cụ thể, rồi khuyến nghị
một hướng.

Nói thẳng khi một yêu cầu là over-engineering, trùng lặp thứ đã có, hoặc sẽ tạo
nợ kỹ thuật. YAGNI/KISS/DRY được ưu tiên hơn việc làm hài lòng.

Phản biện xong vẫn tôn trọng quyết định cuối của người dùng. Nếu đã trao đổi và
người dùng vẫn chọn hướng ban đầu thì làm theo, không nêu lại.

## Quy ước không đọc code là biết

**Ảnh phải qua `getImageUrl()`** (`frontend/src/lib/image-url.ts`). Hàm này nối
MinIO object key (ví dụ `products/abc.png`) với base URL — dev là MinIO trực
tiếp (`localhost:9000/thuccoffee`), production là proxy `/media`. Không dùng
`import img from '...'`, không hardcode `/assets/...` hay URL MinIO. Ảnh trong
`frontend/src/assets/images/` chỉ còn là nguồn seed (`db:seed-images`), không
được import ở runtime. HTML bài viết dùng marker `blog-asset:<key>` và phân
giải qua `resolveBlogContentImageUrls()`.

**Meta trang phải qua `usePageMeta()`** (`frontend/src/lib/use-page-meta.ts`),
không tự gán `document.title`. Mọi page cấp route đều gọi hook này.

**Tailwind v4 là CSS-first.** Design token nằm trong block `@theme` ở
`frontend/src/styles/main.css` (`--color-primary`, `--container-max`, …).
**Không có `tailwind.config.js`** — đừng tạo. Thêm token ở đó rồi dùng như
utility bình thường (`text-primary`, `bg-page`).

**Routing config-based** trong `frontend/src/routes.tsx` (React Router v7),
không phải file-based. Trang mới phải khai báo ở đó. Slug tiếng Việt
(`/chuyen-cua-thuc`, `/cua-hang`, `/gioi-thieu`) khớp site gốc, không được đổi.

**Nội dung nằm ở `frontend/src/data/*.ts`** dạng module có kiểu, không phải
JSON hay CMS. Kiểu dữ liệu ở `frontend/src/data/types.ts`.

**Data fetching phía frontend đi qua ba lớp.** `frontend/src/lib/api/` giữ
axios client, unwrap `ApiResponse<T>` và chuẩn hoá `ApiError`;
`frontend/src/services/*.service.ts` giữ `queryKeys`, type backend và hook
TanStack Query theo tài nguyên; `frontend/src/providers/query-provider.tsx`
giữ `QueryClient`. Page/component chỉ gọi hook và render, không gọi
axios/`apiGet` trực tiếp. `frontend/src/data/*.ts` và
`frontend/src/data/index.ts` còn tồn tại tạm thời cho tới khi từng page
chuyển sang API; không tạo thêm nghiệp vụ data-fetching mới trong lớp tĩnh này.

## Backend: quy ước `server/`

Chi tiết ở `docs/backend-architecture.md`. Những điều không đọc code là biết:

**Module đóng theo tài nguyên**, không gom theo loại file. Mỗi tài nguyên là một
thư mục trong `server/src/modules/` chứa route + nghiệp vụ + schema Zod của nó.
Không tạo `controllers/` chứa mọi controller.

**Drizzle schema tập trung ở `server/src/db/schema.ts`** (ngoại lệ của quy ước
module) — các bảng tham chiếu nhau qua FK, tách theo module sẽ tạo vòng import.
Đổi schema thì `npm run db:generate` sinh migration mới, không sửa tay file SQL
trong `db/migrations/`.

**Mọi phản hồi có body bọc trong `ApiResponse<T>`** (`server/src/common/api-response.ts`),
là discriminated union theo `success`. Nhưng **HTTP status giữ đúng ngữ nghĩa**:
không tìm thấy là `404`, chưa đăng nhập là `401` — không trả `200` kèm
`success:false`. `204` không có body. Ném `ApiError` cho lỗi có chủ đích;
error-handler ở cuối chuỗi lo phần bọc.

**Biến môi trường validate bằng Zod lúc khởi động** (`server/src/common/env.ts`).
Thêm biến mới thì khai báo trong schema đó, đọc qua `env`, không đọc thẳng
`process.env`.

**Kiểu chia sẻ bằng import trực tiếp**, không sinh code: frontend import type
thẳng từ module backend. Không thêm OpenAPI/Orval ở quy mô hiện tại.

**`argon2` cho hash mật khẩu, không `bcrypt`.** Ảnh vẫn trong repo — DB chỉ lưu
tên file trong `storage_key`; không thêm `multer`/`sharp`/upload.

## Bố cục

Mã nguồn Frontend nằm trong thư mục con `frontend/` (không phải root); Backend
vẫn ở `server/` như cũ. Cả hai đều dưới root cùng `compose.yaml`.

- `frontend/src/components/<area>/` — `.tsx` PascalCase, nhóm theo mảng
  (`blog`, `home`, `layout`, `menu`, `store`, `ui`)
- `frontend/src/pages/` — mỗi route một component
- `frontend/src/lib/` — helper dùng chung, tên file kebab-case
- `deploy/nginx.conf` — cấu hình Nginx production, nướng vào image

## Nginx: ba nhánh có chủ ý

`deploy/nginx.conf` phân biệt ba trường hợp: file `/assets/` có hash được cache
vĩnh viễn, `index.html` không bao giờ cache, và đường dẫn trông như file tĩnh mà
không tồn tại thì trả `404` chứ không rơi về `index.html`. Chỉ route không khớp
và không phải asset mới fallback cho client-side routing. Gộp cả ba thành một
`try_files` sẽ phá 404 của asset thiếu.

## Git

**Không làm bất cứ việc gì trực tiếp trên `main`.** Rẽ nhánh **trước khi chạm
file đầu tiên** — áp dụng cho mọi thay đổi không trừ loại nào: code, tài liệu,
plan, brainstorm, ghi chú. Kể cả việc chỉ tạo file trong `plans/` cũng phải nằm
trên nhánh riêng, không để rơi trên `main`. Nếu lỡ bắt đầu trên `main` thì rẽ
nhánh rồi mang thay đổi theo trước khi làm tiếp.

Mỗi việc mới rẽ một nhánh riêng, đặt tên theo loại việc:

| Tiền tố | Dùng khi |
|---|---|
| `feat/` | Tính năng mới |
| `fix/` | Sửa lỗi |
| `docs/` | Chỉ đổi tài liệu |
| `refactor/` | Đổi cấu trúc, không đổi hành vi |
| `chore/` | Cấu hình, phụ thuộc, việc lặt vặt |

`main` giữ trạng thái build được (FE + `server/` đều lint/build sạch) — merge vào
khi việc đã chạy được đầu-cuối và verify. `main` hiện đã gồm cả backend (foundation,
MinIO, public read API); **frontend vẫn đọc tĩnh, chưa gọi API**. Tag `v1.0.0` là
điểm quay về cho bản frontend tĩnh thuần (trước khi có backend).

Task mới rẽ từ `main` (đã có backend). Vòng "FE đọc DB" cần API đọc đang có trên
`main`.

**Không tự ý commit hay push.** Sửa file thì được, nhưng `git commit` và
`git push` đều phải hỏi trước — kể cả tài liệu, plan, hay thay đổi nhỏ. Viết
xong thì dừng lại, nói rõ đã đổi gì, rồi chờ đồng ý.

Repo có hai remote: `origin` là repo cá nhân (mặc định làm việc ở đây), `work`
là repo công ty (chỉ đẩy khi có mốc bàn giao, và phải hỏi riêng).

## Trước khi commit

Chạy `npm run lint` và `npm run build` trong `frontend/`. Backend có checks
riêng trong `server/` (`npm run lint`, `npm run build`). CI chạy tất cả cộng
kiểm tra container ở mỗi lần push lên bất kỳ nhánh nào — xem
`.github/workflows/ci.yml`.

Chữ tiếng Việt là nội dung hiển thị cho người dùng: giữ nguyên dấu, không "sửa"
sang tiếng Anh.
