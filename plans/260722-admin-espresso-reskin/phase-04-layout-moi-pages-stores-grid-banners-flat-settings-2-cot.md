---
phase: 4
title: "Layout-mới pages: stores grid + banners flat + settings 2 cột"
status: completed
priority: P1
effort: "1d"
dependencies: [2]
---

# Phase 4: Layout-mới — stores card grid, banners flat list, settings 2 cột

## Overview

3 màn ĐỔI HẲN LAYOUT (không chỉ đổi skin): stores từ table sang 2-column card
grid; banners từ tabs sang flat list; settings từ 1 cột sang 2 cột + sticky
action bar. Phần render viết lại, hooks/mutation/dialog GIỮ NGUYÊN.

## Nguồn design

Đọc từng view trong `./design-reference-espresso.dc.html`:
- **isStores**: 2-column grid; mỗi row = ảnh cover `140×104` radius 8-14px +
  (tên store + link "Sửa" copper) + địa chỉ 2-line clamp + (phone + "● Mở cửa
  24/7" dot xanh) — hairline phân cách. Đối chiếu file xem publish toggle nằm
  đâu trong card (nếu design không vẽ toggle thì GIỮ toggle từ bản hiện tại,
  đặt vị trí hợp lý cùng idiom — không được mất chức năng publish).
- **isBanners**: flat list rows (KHÔNG tabs): ảnh `150×66` + (altText +
  "{type} · Thứ tự {n}" muted) + toggle + label + "Sửa" link. Mọi type chung
  một list. Nút xóa: đối chiếu file — nếu không vẽ thì giữ nút Xóa hiện tại
  cùng idiom text-link đỏ.
- **isSiteSettings**: 2 cột — trái: thông tin chung (tên site, hotline, địa
  chỉ, SEO meta) + social (Facebook/Instagram/Zalo); phải: dropzone Logo +
  Favicon. Sticky dark pill bar đáy-phải: "Hủy" text + "Lưu" pill copper.
  **LƯU Ý lệch data:** design vẽ field theo ý tưởng (SEO meta, Zalo, Favicon);
  allow-list BE thật là 11 key cố định (site_title, brand_heading, tagline,
  logo_storage_key, hotline, contact_email, office_address, facebook_url,
  instagram_url, youtube_url, footer_copyright). CHỐT: hiển thị ĐÚNG 11 key
  thật, sắp theo layout 2 cột của design (nhóm thông tin trái, social trái
  dưới, logo_storage_key thành ImageField dropzone bên phải kind="site");
  KHÔNG thêm field design vẽ mà BE không có (SEO meta/Zalo/Favicon bỏ).

## Requirements

- Functional: publish/activate/delete/save giữ nguyên hành vi; settings lưu
  qua PUT một lần như hiện tại (nút sticky bar thay nút cũ); "Hủy" reset form
  về giá trị đã load.
  **Stores + banners chuyển sang DRAWER** (như products phase 3): "Sửa"/
  "Thêm" mở AdminDrawer chứa StoreForm/BannerForm tách từ 2 form page; route
  `stores/new`, `stores/:id`, `banners/new`, `banners/:id` XÓA. StoreForm
  trong drawer GỒM CẢ GallerySection (drawer 560px đủ cho list ảnh dọc).
  **Pagination client**: stores + banners `pageSize={10}` (banners flat list
  không dùng AdminTable thì tự slice cùng pattern — chốt lúc impl theo markup
  design).
- Non-functional: grid responsive (2 cột desktop → 1 cột mobile); FE
  lint/build sạch.

## Related Code Files

- Create: `src/components/admin/forms/{StoreForm,BannerForm}.tsx` (tách từ
  2 form page, logic giữ nguyên)
- Modify: `src/pages/admin/{AdminStoresPage,AdminBannersPage,AdminSettingsPage}.tsx`,
  `src/routes.tsx` (xóa 4 route form stores/banners)
- Delete: `src/pages/admin/{AdminStoreFormPage,AdminBannerFormPage}.tsx`
- Read for context: file design 3 view; services admin tương ứng (không sửa)

## Implementation Steps

1. Tách StoreForm (kèm GallerySection) + BannerForm; xóa 2 page + 4 route.
2. AdminStoresPage: table → card grid theo spec + drawer + pagination; giữ
   ConfirmDialog unpublish.
3. AdminBannersPage: tabs → flat list + drawer + pagination; giữ toggle +
   delete dialog.
4. AdminSettingsPage: 2 cột + logo_storage_key thành ImageField + sticky bar
   Hủy/Lưu (settings không drawer — form là chính trang).
5. FE lint/build; dev: đủ luồng trên layout mới (tạo/sửa store qua drawer kèm
   gallery, banner qua drawer, xóa banner, sửa hotline + logo).

## Success Criteria

- [ ] 3 màn khớp layout design; lệch data settings xử lý đúng chốt (11 key
      thật, không field ảo).
- [ ] Store/banner create/edit qua drawer đầy đủ (kể cả gallery reorder trong
      drawer); 4 route form cũ đã xóa.
- [ ] Mọi hành vi cũ hoạt động (toggle, dialog, save, upload logo).
- [ ] Pagination client stores/banners hoạt động.
- [ ] FE lint/build sạch.

## Risk Assessment

- **Rủi ro:** bỏ tabs banner làm list dài lẫn type — "{type} · Thứ tự {n}"
  trong subtitle + sort theo type trước sortOrder sau giúp vẫn đọc được.
- **Rủi ro:** design vẽ field BE không có → impl tự thêm field chết. Chốt ở
  trên: CHỈ 11 key thật. Không thêm key mới vào allow-list BE trong vòng này.
