---
phase: 2
title: Them product content field
status: completed
priority: P2
effort: 1d
dependencies:
  - 1
---

# Phase 2: Them product content field

## Overview

Them cot `content` (rich text HTML, optional/nullable) moi vao bang
`products`, doc lap voi `description` (textarea ngan) hien co. Dung chung
`ContentEditor` (doi ten + them prop tu Phase 1) voi blog. Chua hien thi o
trang public san pham trong dot nay.

<!-- Updated: Validation Session 1 - chot ten component ContentEditor, whitelist sanitizer cu the, content optional confirmed -->

## Key Insights (tu scout + Validation Session 1)

- `products.description` (`server/src/db/schema.ts:35-55`) la `text()`
  thuong, bind `<textarea>` (`ProductForm.tsx:184`) — **khong dong** —
  giu nguyen, khong sua.
- `media_attachments.owner_type` check constraint
  (`server/src/db/schema.ts:162`) **da co san** `'product'` ben canh
  `'blog_post'`, `'store'` — ha tang owner-type da san sang, khong can
  doi schema `media_attachments`.
- Upload kind `'products'` **da ton tai** trong
  `server/src/modules/uploads/uploads.schemas.ts:6` (dung cho
  `ImageField` anh dai dien san pham hien co) — tai su dung cho upload
  anh inline trong content editor, khong can them kind moi.
- **Da chot (Phase 1):** `BlogContentEditor.tsx` da doi ten thanh
  `ContentEditor.tsx` cung thu muc `blog-editor/`, them prop
  `assetUrlScheme: string` thay hardcode `blog-asset:` (dong 52 cu).
  Phase nay CHI can truyen `assetUrlScheme="product-asset"` khi dung cho
  product — khong can tach them file/thu muc nao nua.
- **Da chot (Validation Session 1):** product content sanitizer dung
  whitelist rieng, KHONG dung chung file voi blog sanitizer (blog
  whitelist duoc khao sat tu 267 bai production that, khong phai chuan
  chung). Whitelist cu the: giong bo co ban cua blog **truoc khi** Phase 1
  mo rong — tuc KHONG gom table/blockquote/code/text-align/color/
  highlight. Xem Requirements ben duoi cho danh sach day du.
- **Da chot (Validation Session 1):** field `content` la **optional/
  nullable**, giong `description` hien tai — khong bat buoc nhap.

## Requirements

**Functional**
- Them cot `content` (`text`, nullable) vao bang `products` trong
  `server/src/db/schema.ts`, generate migration qua `npm run db:generate`
  (KHONG sua tay file SQL trong `db/migrations/`).
- Cap nhat Zod schema: `products.admin.schemas.ts` — them `content:
  z.string().trim().nullable()` giong dung pattern `description` (dong 9,
  76) — **optional/nullable, khong bat buoc**.
- `products.schemas.ts` (public schema): KHONG doi trong phase nay — field
  chua public.
- Cap nhat `products.admin.service.ts` (select + insert/update — theo
  pattern dong 30, 123, 196, 244 cua `description`).
- Truyen prop `assetUrlScheme="product-asset"` vao `ContentEditor` khi
  dung trong `ProductForm.tsx` (component da san sang tu Phase 1, khong
  can sua them logic component).
- Them field "Noi dung" (dung `ContentEditor`) vao `ProductForm.tsx`, dat
  sau field "Mo ta" hien co (dong 184), khong thay the. Label ro rang de
  phan biet: "Mo ta" (ngan, textarea) vs "Noi dung chi tiet" (rich text).
- Upload anh inline trong product content: dung
  `uploadImage.mutateAsync({ file, kind: 'products' })` (kind da co san),
  luu qua `media_attachments` voi `ownerType: 'product'`.
- Viet sanitizer rieng cho product content
  (`products-content-sanitizer.ts`), whitelist cu the:
  - `allowedTags`: `p`, `br`, `strong`, `em`, `u`, `h1`, `h2`, `h3`, `ul`,
    `ol`, `li`, `a`, `img`, `div`, `span`.
  - `allowedAttributes`: `a: ['href', 'rel', 'target']`, `img: ['alt',
    'src', 'style']`, `div: ['style']`, `span: ['style']`.
  - `allowedSchemes`: `['http', 'https', 'mailto', 'tel', 'product-asset']`,
    `allowedSchemesByTag: { a: ['http', 'https', 'mailto', 'tel'], img:
    ['https', 'product-asset'] }` (khop scheme `product-asset` da chot o
    Phase 1).
  - **KHONG** gom `table`/`tbody`/`tr`/`td`/`th`, `blockquote`, `code`,
    `pre` — day la tinh nang cua blog editor (Phase 1), product content
    dung bo toolbar co ban hon.

**Non-functional**
- Khong doi hanh vi field `description` hien co (van la textarea, van
  optional nhu cu).
- Khong render `content` o bat ky trang public nao trong dot nay.
- Migration phai la file moi sinh boi Drizzle, khong sua tay.

## Architecture

```
ProductForm.tsx
  ├─ FormField "Mo ta" (giu nguyen, textarea, bind description)
  └─ FormField "Noi dung chi tiet" (MOI, bind content)
        └─ ContentEditor assetUrlScheme="product-asset" (component da co tu Phase 1, khong sua them)
              └─ onUploadImage → uploadImage.mutateAsync({ file, kind: 'products' })
                    → media_attachments (ownerType: 'product')
```

Luu: `products.content` (text, HTML string, nullable) → sanitize rieng
(BE, tren save, `products-content-sanitizer.ts`, whitelist hep hon blog)
→ luu DB. Khong co duong render public trong phase nay.

## Related Code Files

- Modify: `server/src/db/schema.ts` (them cot `content` vao `products`)
- Create: migration moi qua `npm run db:generate` (khong dat ten file tay)
- Modify: `server/src/modules/products/products.admin.schemas.ts` (them
  `content: z.string().trim().nullable()` vao input/output schema)
- Modify: `server/src/modules/products/products.admin.service.ts` (them
  `content` vao select/insert/update, goi sanitizer moi truoc khi luu)
- Create: `server/src/modules/products/products-content-sanitizer.ts`
  (whitelist rieng, cu the nhu liet ke tren — KHONG dung chung file
  sanitizer cua blog)
- Modify: `src/components/admin/forms/ProductForm.tsx` (them field
  content, truyen `assetUrlScheme="product-asset"` vao `ContentEditor`)
- Read for context: `server/src/modules/uploads/uploads.schemas.ts`,
  `server/src/db/schema.ts` (mediaAttachments, dong 152-166),
  `src/components/admin/blog-editor/ContentEditor.tsx` (component da doi
  ten + them prop tu Phase 1 — KHONG sua lai trong phase nay tru khi phat
  hien loi)

## Implementation Steps

1. Them cot `content: text('content')` vao `products` trong
   `server/src/db/schema.ts`, sau `description`.
2. Chay `npm run db:generate` (trong `server/`), review migration sinh
   ra, chay `npm run db:migrate` tren DB local.
3. Cap nhat `products.admin.schemas.ts`: them `content:
   z.string().trim().nullable()` vao schema input/output (theo dung
   pattern `description` dong 9, 76).
4. Cap nhat `products.admin.service.ts`: them `content` vao cau select
   (dong 30, 123), insert (dong 196), update (dong 244), goi
   `sanitizeProductContent(input.content)` truoc khi luu (tuong tu cach
   blog goi `sanitizeBlogContent`).
5. Viet `products-content-sanitizer.ts` voi whitelist cu the da liet ke o
   Requirements (KHONG copy blog whitelist mo rong tu Phase 1 — do la ket
   qua khao sat du lieu blog, khong phai chuan chung cho product).
6. Them field "Noi dung chi tiet" vao `ProductForm.tsx` sau field "Mo ta"
   (dong 184), dung `ContentEditor` (import tu
   `src/components/admin/blog-editor/ContentEditor.tsx`), truyen
   `assetUrlScheme="product-asset"`, wire `onUploadImage` qua
   `uploadImage.mutateAsync({ file, kind: 'products' })`.
7. Cap nhat `ProductFormState`, `emptyForm`, load logic (dong 25-45,
   75-94) them `content` (mac dinh `''` hoac `null` giong pattern
   `description`).
8. `npm run lint` + `npm run build` (root), `cd server && npm run lint &&
   npm run build`.
9. Test thu cong: tao/sua san pham voi noi dung content moi (text + anh
   upload), luu, reload, xac nhan du lieu giu nguyen, xac nhan tao san
   pham KHONG dien content van thanh cong (nullable), xac nhan field
   khong xuat hien o bat ky trang public nao.

## Success Criteria

- [ ] Cot `content` co trong `products` qua migration Drizzle sinh tu
      `db:generate` (khong sua tay SQL), la nullable
- [ ] Form san pham co field "Noi dung chi tiet" rieng biet voi "Mo ta",
      dung `ContentEditor` voi `assetUrlScheme="product-asset"`
- [ ] Tao san pham khong dien content van thanh cong (xac nhan optional)
- [ ] Upload anh trong product content luu qua `media_attachments` voi
      `ownerType: 'product'`, dung `kind: 'products'`
- [ ] Product content co sanitizer rieng
      (`products-content-sanitizer.ts`), whitelist KHONG gom table/
      blockquote/code — khac blog sanitizer
- [ ] Khong co thay doi nao o trang public san pham (verify bang grep —
      khong co component nao import/render `product.content`)
- [ ] `npm run lint` + `npm run build` sach ca root va `server/`

## Risk Assessment

- **Nham lan `description` va `content`:** 2 field ten gan giong, de gay
  nham lan luc code UI hoac migration data sau nay. Dat ten field ro
  rang trong form label ("Mo ta" vs "Noi dung chi tiet") de tranh nham
  lan cho nguoi dung admin.
- **Sanitizer rieng nhung whitelist qua chat/qua long:** vi chua co du
  lieu production de khao sat (khac blog), whitelist ban dau chi la uoc
  luong hop ly — co the can dieu chinh sau khi co du lieu that. Ghi ro
  trong comment code day la whitelist khoi tao, khong phai khao sat du
  lieu that (khac cach lam cua blog sanitizer).
- **Phu thuoc Phase 1:** `ContentEditor` (doi ten tu `BlogContentEditor`)
  phai hoan tat truoc — neu Phase 1 chua xong hoac ten/prop khac voi mo
  ta o day, can doi chieu lai truoc khi code Phase 2.
