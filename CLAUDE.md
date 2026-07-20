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

Bản clone tĩnh của một site chuỗi cà phê Việt Nam đang chạy thật. Nội dung
hardcode, không backend, không auth, không giỏ hàng thật, không thanh toán.
Nhiều thứ trông có vẻ tương tác trên bản gốc thì ở đây chỉ là giao diện — đọc
`docs/deviations-from-original.md` trước khi kết luận một khoảng trống là bug.

## Hỏi lại thay vì đoán

Không suy diễn nghiệp vụ. Khi gặp một trong các trường hợp sau thì **dừng lại
và hỏi**, không tự chọn hướng rồi viết code:

- Yêu cầu có thể hiểu theo nhiều cách, và các cách đó dẫn tới cấu trúc dữ liệu
  hoặc luồng khác nhau.
- Cần thêm field/route/trạng thái mà `src/data/types.ts` chưa có, và không rõ
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

**Ảnh phải qua `getImageUrl()`** (`src/lib/image-url.ts`). Hàm này map tên file
trần vào `import.meta.glob` của `src/assets/images/**`. Không dùng
`import img from '...'`, không hardcode `/assets/...` — tên file sau build có
hash khác, và file thiếu sẽ rơi về ảnh placeholder kèm cảnh báo ở dev.

**Meta trang phải qua `usePageMeta()`** (`src/lib/use-page-meta.ts`), không tự
gán `document.title`. Mọi page cấp route đều gọi hook này.

**Tailwind v4 là CSS-first.** Design token nằm trong block `@theme` ở
`src/styles/main.css` (`--color-primary`, `--container-max`, …). **Không có
`tailwind.config.js`** — đừng tạo. Thêm token ở đó rồi dùng như utility bình
thường (`text-primary`, `bg-page`).

**Routing config-based** trong `src/routes.tsx` (React Router v7), không phải
file-based. Trang mới phải khai báo ở đó. Slug tiếng Việt (`/chuyen-cua-thuc`,
`/cua-hang`, `/gioi-thieu`) khớp site gốc, không được đổi.

**Nội dung nằm ở `src/data/*.ts`** dạng module có kiểu, không phải JSON hay CMS.
Kiểu dữ liệu ở `src/data/types.ts`.

## Bố cục

- `src/components/<area>/` — `.tsx` PascalCase, nhóm theo mảng (`blog`, `home`,
  `layout`, `menu`, `store`, `ui`)
- `src/pages/` — mỗi route một component
- `src/lib/` — helper dùng chung, tên file kebab-case
- `deploy/nginx.conf` — cấu hình Nginx production, nướng vào image

## Nginx: ba nhánh có chủ ý

`deploy/nginx.conf` phân biệt ba trường hợp: file `/assets/` có hash được cache
vĩnh viễn, `index.html` không bao giờ cache, và đường dẫn trông như file tĩnh mà
không tồn tại thì trả `404` chứ không rơi về `index.html`. Chỉ route không khớp
và không phải asset mới fallback cho client-side routing. Gộp cả ba thành một
`try_files` sẽ phá 404 của asset thiếu.

## Git

**Không sửa trực tiếp trên `main`.** Mỗi việc mới rẽ một nhánh riêng, đặt tên
theo loại việc:

| Tiền tố | Dùng khi |
|---|---|
| `feat/` | Tính năng mới |
| `fix/` | Sửa lỗi |
| `docs/` | Chỉ đổi tài liệu |
| `refactor/` | Đổi cấu trúc, không đổi hành vi |
| `chore/` | Cấu hình, phụ thuộc, việc lặt vặt |

`main` giữ trạng thái deploy được — merge vào khi việc đã chạy được đầu-cuối.
Tag `v1.0.0` là điểm quay về cho bản frontend tĩnh.

**Không tự ý push.** Commit thì được, nhưng `git push` phải hỏi trước — kể cả
tài liệu, plan, hay thay đổi nhỏ. Push là hành động ra ngoài, người khác thấy
được, và khó thu hồi.

Repo có hai remote: `origin` là repo cá nhân (mặc định làm việc ở đây), `work`
là repo công ty (chỉ đẩy khi có mốc bàn giao, và phải hỏi riêng).

## Trước khi commit

Chạy `npm run lint` và `npm run build`. CI chạy cả hai cộng thêm kiểm tra
container ở mỗi lần push lên `main` — xem `.github/workflows/ci.yml`.

Chữ tiếng Việt là nội dung hiển thị cho người dùng: giữ nguyên dấu, không "sửa"
sang tiếng Anh.
