---
phase: 3
title: Tach Gallery va FAQ thanh 2 trang
status: completed
priority: P2
effort: 0.5d
dependencies: []
---

# Phase 3: Tach Gallery va FAQ thanh 2 trang

## Overview

Tach trang gop "Gallery & FAQ" (`AdminGalleryPage.tsx`) thanh 2 route/menu
rieng. Gallery giu dang card grid theo mau Banner (khong dung `AdminTable`
vi la du lieu anh, khong phai bang dong). FAQ chuyen sang dung `AdminTable`
that vi la du lieu dang liet ke van ban — giong Products/Blog/Stores.

## Key Insights (tu scout)

- Hooks data-fetching **da co san va dung duoc nguyen**, khong doi:
  `useAdminGallery`, `useCreateGalleryItem`, `useUpdateGalleryItem`,
  `useDeleteGalleryItem`, `useAdminMembershipFaqs`,
  `useCreateMembershipFaq`, `useUpdateMembershipFaq`,
  `useDeleteMembershipFaq` (`src/services/admin/static-pages.service.ts`).
  **Ca 2 hook update (PUT full upsert) da ton tai** — du de wire
  `PublishSwitch`/toggle trang thai cho ca Gallery (`isActive`) va FAQ
  (`isPublished`) ma khong can API moi. Phase nay chi doi UI + routing,
  khong doi service/backend.
- Schema DB **da du**, khong can migration:
  - `site_gallery` (`server/src/db/schema.ts:207-214`): `storageKey`,
    `altText`, `sortOrder`, `isActive`.
  - `membership_faqs` (`server/src/db/schema.ts:198-205`): `question`,
    `answer`, `sortOrder`, `isPublished`.
- Mau Banner nguoi dung chi dinh tham khao (`AdminBannersPage.tsx`)
  **khong thuc su dung `AdminTable`** — day la card grid nhom theo loai,
  dung `AdminTableToolbar` (filter), `PublishSwitch`, `StatusBadge`,
  `AdminDrawer` (form them/sua qua drawer), `Pagination` (helper export
  tu `AdminTable.tsx`, khong phai component bang chinh). Ap dung dung
  pattern nay cho Gallery — KHONG ep Gallery vao `AdminTableColumn`.
- FAQ hop voi `AdminTable` that (`AdminTable.tsx` — component bang voi
  cot, sort, pagination) vi la danh sach cau hoi/tra loi dang text, giong
  cach Products/Blog/Stores/Categories to chuc.
- Route hien tai: `routes.tsx:97` — `{ path: 'gallery', element:
  <AdminGalleryPage /> }`, sidebar: `AdminSidebar.tsx:31` — 1 muc "Gallery
  & FAQ" tro `/admin/gallery`.

## Requirements

**Functional**
- 2 route rieng: `/admin/gallery` (chi Gallery) va `/admin/faq` (FAQ moi).
- 2 muc sidebar rieng thay vi 1 muc gop, dat lien ke nhau trong nhom
  "Noi dung" (`AdminSidebar.tsx` nhom `groups[0].links`).
- Gallery: giu dang card grid anh, nang cap theo mau Banner — them
  `AdminTableToolbar` (filter theo trang thai active/inactive, dung
  `isActive` co san), `PublishSwitch` cho bat/tat (thay vi chi co
  nut Xoa), giu `AdminDrawer` cho form them anh moi (thay vi form inline
  hien tai).
- FAQ: chuyen sang `AdminTable` that — cot: cau hoi, tra loi (rut gon),
  thu tu (sortOrder), trang thai published, actions (sua/xoa). Form
  them/sua qua `AdminDrawer` (thay vi form inline + list hien tai).
- Giu nguyen toan bo logic tao/xoa hien co (khong doi API contract).

**Non-functional**
- Khong doi schema, khong doi service/hook layer.
- Giu nguyen text/copy tieng Viet hien co noi hop ly, chi doi cau truc
  UI va tach file.

## Architecture

```
routes.tsx
  ├─ 'gallery' → AdminGalleryPage (chi con GallerySection, doi ten UI "Gallery")
  └─ 'faq'     → AdminFaqPage (MOI, tach tu FaqSection cu, dung AdminTable)

AdminSidebar.tsx groups[0].links
  ├─ { to: '/admin/gallery', label: 'Gallery', icon: icons.gallery }
  └─ { to: '/admin/faq', label: 'FAQ', icon: icons.faq (MOI icon) }
```

Gallery UI theo mau `AdminBannersPage.tsx`: card grid + `AdminTableToolbar`
+ `PublishSwitch` + `StatusBadge` + `AdminDrawer` (form) + `Pagination`.
FAQ UI theo mau `AdminProductsPage.tsx`/`AdminBlogPage.tsx`: `AdminTable`
+ `AdminTableToolbar` + `AdminDrawer` (form) + `Pagination`.

## Related Code Files

- Modify: `src/pages/admin/AdminGalleryPage.tsx` (xoa `FaqSection`, xoa
  import FAQ hooks, doi tieu de trang tu "Gallery & FAQ" sang "Gallery",
  nang cap UI theo mau Banner)
- Create: `src/pages/admin/AdminFaqPage.tsx` (tach tu `FaqSection` cu,
  viet lai dung `AdminTable`)
- Modify: `src/routes.tsx` (them route `faq`, import `AdminFaqPage`)
- Modify: `src/components/admin/AdminSidebar.tsx` (tach 1 muc sidebar
  thanh 2, them icon FAQ moi trong object `icons`)
- Create (neu can form component rieng cho drawer): mot form component
  cho gallery item va 1 cho FAQ item — kiem tra co the dung inline JSX
  trong `AdminDrawer` nhu cac trang khac hay can tach `GalleryItemForm`/
  `FaqItemForm` rieng theo pattern `BannerForm.tsx`/`ProductForm.tsx`.
- Read for context: `src/pages/admin/AdminBannersPage.tsx` (mau tham
  khao cho Gallery), `src/pages/admin/AdminProductsPage.tsx` (mau
  `AdminTable` cho FAQ), `src/components/admin/ui/AdminTable.tsx`,
  `src/components/admin/ui/AdminDrawer.tsx`,
  `src/components/admin/ui/PublishSwitch.tsx`,
  `src/components/admin/ui/StatusBadge.tsx`,
  `src/services/admin/static-pages.service.ts`

## Implementation Steps

1. Tao `src/pages/admin/AdminFaqPage.tsx`: copy logic tu `FaqSection`
   trong `AdminGalleryPage.tsx` (dung `useAdminMembershipFaqs`,
   `useCreateMembershipFaq`, `useUpdateMembershipFaq`,
   `useDeleteMembershipFaq`), viet lai UI dung `AdminTable` voi cot: Cau
   hoi, Tra loi (rut gon/truncate), Thu tu, Trang thai — dung
   `PublishSwitch` gan voi `isPublished`, goi `useUpdateMembershipFaq`
   (PUT full upsert, da co san, khong can API moi).
2. Them `AdminTableToolbar` (filter theo trang thai neu co du lieu),
   `AdminDrawer` cho form them/sua cau hoi (thay the form inline hien
   tai o dong 135-141 cua file cu).
3. Sua `AdminGalleryPage.tsx`: xoa ham `FaqSection` va cac import lien
   quan FAQ (`useAdminMembershipFaqs`, `useCreateMembershipFaq`,
   `useDeleteMembershipFaq`), doi `usePageMeta('Gallery & FAQ')` thanh
   `usePageMeta('Gallery')`, doi tieu de H1.
4. Nang cap `GallerySection` (giu nguyen logic create/delete) theo mau
   `AdminBannersPage.tsx`: them `AdminTableToolbar` (filter active/
   inactive), `PublishSwitch` gan voi `isActive`, goi
   `useUpdateGalleryItem` (PUT full upsert, da co san) de toggle, chuyen
   form them anh sang `AdminDrawer` (thay vi inline nhu hien tai dong
   49-59).
5. Them route `{ path: 'faq', element: <AdminFaqPage /> }` vao
   `routes.tsx` sau dong `gallery` (dong 97), import `AdminFaqPage`.
6. Sua `AdminSidebar.tsx`: doi icon `gallery` object them icon `faq`
   moi (svg don gian, vd dau hoi trong khung), tach dong 31 thanh 2
   dong: `{ to: '/admin/gallery', label: 'Gallery', icon: icons.gallery
   }` va `{ to: '/admin/faq', label: 'FAQ', icon: icons.faq }`.
7. `npm run lint` + `npm run build`.
8. Test thu cong: vao `/admin/gallery` xac nhan chi con gallery, hoat
   dong them/xoa anh nhu cu; vao `/admin/faq` xac nhan bang FAQ hoat
   dong dung, them/sua/xoa cau hoi; xac nhan public site (trang chu
   gallery, trang thanh vien FAQ) khong doi hanh vi.

## Success Criteria

- [ ] `/admin/gallery` va `/admin/faq` la 2 route doc lap, sidebar co 2
      muc rieng
- [ ] Gallery dung dang card grid + `AdminTableToolbar` + `AdminDrawer`,
      theo mau Banner
- [ ] FAQ dung `AdminTable` that voi cot Cau hoi/Tra loi/Thu tu/Trang
      thai
- [ ] Khong co API/mutation moi duoc bia ra — chi dung hook da co san
      trong `static-pages.service.ts`
- [ ] Public site (homepage gallery, trang thanh vien FAQ) khong doi
      hanh vi sau khi tach admin UI
- [ ] `npm run lint` + `npm run build` sach

## Risk Assessment

- **Sidebar dong lech reference sau khi sua** — `AdminSidebar.tsx` la
  file nho, rui ro thap, nhung can kiem tra icon moi khong trung id voi
  icon co san trong object `icons`.
- **`useUpdateGalleryItem`/`useUpdateMembershipFaq` la PUT full upsert**
  (khong phai patch rieng 1 truong) — khi wire `PublishSwitch`, phai gui
  du toan bo payload (vd `storageKey`, `altText`, `sortOrder`,
  `isActive` cho gallery) chu khong chi gui `{ isActive }`, neu khong se
  ghi de mat du lieu cac truong khac. Kiem tra ky kieu
  `UpsertGalleryItemInput`/`UpsertMembershipFaqInput` truoc khi goi.
