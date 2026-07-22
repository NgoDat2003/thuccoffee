# FE chuyển từ dữ liệu tĩnh sang đọc API

**Ngày:** 2026-07-22
**Nhánh:** `feat/fe` (ahead 3, chưa push)
**Phạm vi:** Bước 3 roadmap ("Frontend đọc từ API") — từ dựng structure tới migration
gần trọn nhóm page có API.

## Đã làm

Ba vòng nối tiếp, mỗi vòng brainstorm → plan → validate → (Codex code) → review 3 tầng:

1. **Data-layer structure** (`2bef119`, `def6f59`) — axios client + interceptor unwrap
   `ApiResponse<T>` + `ApiError`; TanStack Query v5 provider; 6 service theo tài nguyên
   (queryKeys + type import thẳng từ backend + hook). Pattern học từ dự án `inno-pos`.
   Chưa page nào dùng.

2. **ProductDetail (page mẫu)** — chốt pattern render: `useProduct` → skeleton →
   `Navigate` khi lỗi; related tách component tự fetch (tránh rules-of-hooks). Type
   `Product` chuyển hẳn sang nguồn backend (Mức B: xóa `interface Product` FE).

3. **Full migration nhóm A** (`735f7f4`, `4e63e14`) — Menu/Store/Blog/Home +
   Header/Footer đọc API. Xóa `src/data/index.ts` (barrel). Banners + site-settings
   cũng chuyển ("DB có gì chuyển hết").

4. **Fix hạ tầng production** (`34334c5`) — nginx proxy `/api`, server/ vào docker
   build context.

## Quyết định quan trọng

- **Bỏ ranh giới `src/data/index.ts`** (quy ước CLAUDE.md cũ) → thay bằng service+hook.
  Cập nhật CLAUDE.md tương ứng. Lý do: khớp yêu cầu "component chỉ render, nghiệp vụ ở
  hook"; index.ts và service+hook không sống chung được.
- **Type một nguồn = backend (Mức B).** Không giữ type FE lệch. `priceEstimated` thêm
  `false` cho 31 product tĩnh (khớp DB), không map layer.
- **Nhóm B giữ tĩnh** (About/Careers/Contact/Cookie/Delivery/Membership) — backend
  không có endpoint `pages`. "Full" = nhóm có API.
- **`category-paths.ts` giữ nguyên** (routing, slug khớp site gốc) — chỉ chuyển mảng
  `categories` (label). GalleryLightbox giữ static (không có nguồn DB).
- **Blog**: phân trang từ `meta.totalPages` (bỏ hardcode 54); content từ API (bỏ lazy
  `blog-content.ts`); `formatDate` UTC.
- **Banner "hardcode → API"** là feature mới về bản chất, nhưng verify DB khớp chính
  xác ảnh hardcode nên không lệch giao diện gốc — phản biện được data giải tỏa.

## Bug phát hiện qua validate/review (không phải khi code)

- **`/api/site-settings` trả 500** — DB thiếu key `hotline` (seed từ bản cũ). Codex fix
  bằng chạy lại `db:seed`. → memory `site-settings-500-missing-hotline`.
- **Docker build FE fail (TS2307)** — FE import type từ `server/` nhưng `.dockerignore`
  loại `server/`. **`npm run build` local pass che giấu** (có server/node_modules cạnh);
  chỉ lộ khi build Docker thật. **CI sẽ đỏ nếu push mà chưa vá.** Fix: server/ +
  server/node_modules vào build context; runtime nginx vẫn chỉ COPY dist. → memory
  `fe-docker-build-needs-server-context`.
- **nginx production không proxy `/api`** — Vite dev proxy không áp dụng cho nginx.
  Không có nó, `:3000` gọi API trả HTML fallback. Thêm `location /api/`.

## Bài học

- **Local build đánh lừa.** `npm run build` xanh không đảm bảo docker/CI xanh khi có
  cross-boundary import + dockerignore. Phải build Docker thật để verify production.
- **Review 3 tầng bắt lỗi mắt thường không thấy.** Validate bắt bug site-settings +
  banner giả định sai; review DOM (agent-browser) xác nhận render thật, không chỉ HTTP.
- **Câu hỏi vô tình của người dùng** ("sao :3000 không call API") lộ ra lỗ hổng CI thật
  — giá trị của việc kiểm chứng ở môi trường giống production.

## Còn lại

- `feat/fe` chưa push (chờ đồng ý); nhánh con đã merge chưa xoá.
- Nhóm B cần endpoint backend `pages` mới chuyển được (hoặc sang phase auth/admin).
- Runtime verify tới DOM cho page chính; chưa quét hết mọi tương tác (store selector
  đổi slug, mọi trang blog).
