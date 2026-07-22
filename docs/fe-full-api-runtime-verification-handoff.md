# FE full API migration — runtime verification handoff

Ngày bàn giao: 2026-07-22  
Plan: `plans/260722-1830-fe-full-api-migration/plan.md`  
Branch: `feat/fe-product-detail-api`

## 1. Trạng thái code và contract

- Product detail, Menu/Category, Store, Blog, Home, Header/Footer đã chuyển sang public read API.
- `npm run build`: pass.
- `npm run lint`: pass.
- `server/npm run build`: pass, gồm typecheck seed.
- `server/npm run lint`: pass.
- `server/npm run smoke:api`: pass 9/9 endpoint.
- `server/npm run db:seed`: pass; 10 categories, 42 products, 267 blog posts,
  7 stores, 3 banners và 11 site settings.
- `/api/site-settings`: HTTP 200, có đủ 11 field và `hotline = 1800 6230`.

## 2. UI đã kiểm tra trước khi dừng browser test

- `/menu`: tải danh mục từ API, hiển thị đủ label; đổi sang COFFEE giữ URL `/menu`,
  hiển thị AMERICANO; request category trả 200.
- `/cua-hang`: tải danh sách 7 cửa hàng, default detail và 5 ảnh gallery từ API.
- `/cua-hang/thuc-coffee-duong-41-s931t2`: route detail mở và title đúng.

## 3. Claude cần kiểm tra tiếp

### 3.1 Store

- Mỗi selector cửa hàng đổi đúng slug/detail/gallery.
- `/cua-hang/slug-khong-ton-tai` redirect về `/cua-hang`.
- Loading skeleton không gây layout shift rõ rệt.

### 3.2 Blog

- `/chuyen-cua-thuc`, `/t1p2`, `/t1p54`: đúng 5/5/2 bài và pagination 54 trang.
- Mở một bài detail: content HTML, ảnh, emoji Unicode, ngày `DD.MM.YYYY`, related posts.
- Page/slug sai xử lý redirect/empty đúng, không crash.

### 3.3 Home

- `/`: 2 slider banner, 8 sản phẩm yêu thích, promo membership, blog carousel và
  store locator đều render từ API.
- Tắt backend hoặc chặn từng endpoint để xác nhận section lỗi ẩn gọn, trang không crash.
- `GalleryLightbox` vẫn dùng bộ ảnh curated local; đây là chủ đích vì chưa có API tương ứng.

### 3.4 Header/Footer và trang tĩnh

- Header desktop/mobile lấy logo, hotline, email và social từ site settings.
- Footer lấy hotline, Facebook, Instagram, YouTube và copyright từ site settings.
- `youtubeUrl` hiện rỗng: icon giữ chỗ nhưng không tạo link `#`.
- Khi site-settings loading/lỗi, fallback giữ Footer/Header hiển thị và không lệch layout.
- Smoke `/gioi-thieu`, `/tuyen-dung`, `/giao-hang`, `/lien-he`,
  `/chuong-trinh-thanh-vien`, `/chinh-sach` để bảo đảm nhóm B vẫn dùng `pages.ts`.

## 4. Cách chạy để kiểm tra

```powershell
docker compose up -d postgres minio backend
docker compose stop frontend
npm run dev -- --host 127.0.0.1 --port 3000
```

Mở `http://127.0.0.1:3000`. Sau khi test, chỉ dùng `docker compose stop`; không dùng
`docker compose down` để tránh xóa nhầm container/volume.

## 5. Lưu ý cleanup

- Đã xóa `src/data/index.ts` và đổi FE sang import trực tiếp `pages.ts` hoặc
  `category-paths.ts`; static collections không còn được bundle qua barrel.
- Không xóa `products.ts`, `blog.ts`, `blog-content.ts`, `stores.ts`, `categories.ts`
  và `types.ts`: chúng vẫn là fixture đầu vào của `server/src/db/seed.ts`.
- Chưa commit/push theo yêu cầu.
