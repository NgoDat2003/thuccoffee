---
phase: 1
title: Mo rong Tiptap blog editor
status: completed
priority: P2
effort: 0.75d
dependencies: []
---

# Phase 1: Mo rong Tiptap blog editor

## Overview

Bat toan bo extension Tiptap da cai san trong `package.json` nhung chua
dung trong `blog-editor-extensions.ts` (blockquote, code inline, code
block, table header + resize), cai moi 2 goi (text-align, color/highlight),
them nut toolbar tuong ung, va mo rong whitelist sanitize backend dong bo
— neu khong lam dong thoi, noi dung moi se bi `sanitizeBlogContent` am
tham xoa mat luc luu.

<!-- Updated: Validation Session 1 - bo youtube/video embed khoi scope -->

## Key Insights (tu brainstorm + scout)

- Toolbar hien tai (`BlogEditorToolbar.tsx`) khong giong TinyMCE trong anh
  mau nguoi dung dua — do la UI TinyMCE/CKEditor. Quyet dinh da chot: giu
  Tiptap, khong doi thu vien (xem brainstorm report).
- **Rui ro chinh, khong duoc bo qua:** `server/src/modules/blog/blog-content-sanitizer.ts:23-50`
  co whitelist tag/attribute duoc khao sat tu **267 bai blog production
  thuc te** (comment tai dong 23). `iframe` dang bi chan tuong minh (dong
  24: "iframe was absent, so it stays blocked"). Bat extension moi phia FE
  ma khong mo rong whitelist nay => noi dung bi am tham strip luc save,
  khong loi ro rang, rat kho debug sau.
- `mergeCells`/`splitCell` command chua duoc dung o dau trong codebase
  (grep 0 ket qua) — Tiptap 3.27.4 `@tiptap/extension-table` ho tro cac
  command nay san (xac nhan qua doc chinh thuc Tiptap luc implement, dung
  `ck:docs-seeker`), chi can wire nut toolbar + CSS resize handle.
- `BlogTableRow` hien tai la `TableRow.extend({ content: 'tableCell*' })`
  (khong co `tableHeader` cell) — bat `tableHeader: true` trong `TableKit`
  co the xung dot voi custom `BlogTableRow` nay, can kiem tra lai co con
  can override khong hay dung `TableRow` mac dinh cua `TableKit`.
- **Validation Session 1 (2026-07-24):** Youtube/video embed **da bi loai
  khoi scope**. Day la de xuat cua AI luc brainstorm ("bat toan bo
  extension chua dung"), khong phai yeu cau goc ro rang cua user — user
  phan hoi khong nho da yeu cau tinh nang nay va hoi web that
  (thuccoffee.com.vn) co dung video trong blog khong. Quyet dinh: bo hang
  muc nay, chi giu 6 hang muc da xac nhan ro (blockquote, code, code
  block, table nang cao, text-align, color/highlight).
- **Validation Session 1:** `BlogContentEditor` chi co **1 caller duy
  nhat** (`AdminBlogFormPage.tsx` — verified qua grep). Quyet dinh: doi
  ten component thanh `ContentEditor`, them prop `assetUrlScheme: string`
  thay the hardcode `blog-asset:` (dong 52 hien tai), KHONG tach thu muc
  moi — de Phase 2 tai su dung. Xem chi tiet trong Phase 2 § Architecture.

## Requirements

**Functional**
- Bat trong `blog-editor-extensions.ts`: blockquote, code (inline), code
  block, `TableKit.table.resizable: true`, `TableKit.tableHeader: true`.
- Cai va cau hinh moi: `@tiptap/extension-text-align`,
  `@tiptap/extension-color` (kem `@tiptap/extension-text-style` — `Color`
  yeu cau `TextStyle` di kem), `@tiptap/extension-highlight`.
- Toolbar (`BlogEditorToolbar.tsx`) them nut: blockquote, code, code block,
  text-align (trai/giua/phai/deu), mau chu (vai mau co dinh, khong can
  full color picker), highlight, table resize/merge/split cell.
- Mo rong `sanitizeBlogContent` whitelist: `blockquote`, `code`, `pre`,
  `th` (table header cell) + cac attribute/style moi sinh ra tu cac
  extension tren (`text-align` style da co san trong `allowedStyles['*']`,
  chi can bo sung `right` neu thieu; `color` cho nhieu tag hon;
  `background-color` cho highlight).
- **Khong** them bat ky tag/extension lien quan video/media-embed/iframe
  nao trong phase nay.

**Non-functional**
- Khong pha vo 267 bai blog hien co — `sanitizeBlogContent` phai van xu
  ly dung cac bai cu (test bang smoke suite `npm run smoke:admin-blog`,
  da co gate byte-identity cho 267 bai theo README).
- Khong doi cach luu tru (`content: text()` van la HTML string).
- Doi ten `BlogContentEditor` → `ContentEditor` khong duoc lam vo hanh vi
  hien co cua blog editor (chi 1 caller, rui ro thap nhung van phai test
  lai `npm run smoke:admin-blog` sau khi doi).

## Architecture

Khong doi luong du lieu tong the: Tiptap editor (FE) → HTML string →
`sanitizeBlogContent` (BE, tren save) → luu `blog_posts.content` → render
qua `dangerouslySetInnerHTML` + `resolveBlogContentImageUrls` (khong
sanitize lai o frontend — dung whitelist BE la nguon that duy nhat).

Doi ten component (chuan bi cho Phase 2 tai su dung):
`src/components/admin/blog-editor/BlogContentEditor.tsx` →
`ContentEditor.tsx` (giu nguyen thu muc `blog-editor/`, khong tach moi).
Prop moi `assetUrlScheme: string` thay the hardcode `blog-asset:` (dong
52 hien tai: `` `blog-asset:${objectKey}` `` → `` `${assetUrlScheme}:${objectKey}` ``).
`AdminBlogFormPage.tsx` truyen `assetUrlScheme="blog-asset"` de giu nguyen
hanh vi cu.

## Related Code Files

- Modify: `src/components/admin/blog-editor/blog-editor-extensions.ts`
  (bat extension co san, them extension moi)
- Modify: `src/components/admin/blog-editor/BlogEditorToolbar.tsx` (them
  nut toolbar)
- Rename + Modify: `src/components/admin/blog-editor/BlogContentEditor.tsx`
  → `ContentEditor.tsx` (them prop `assetUrlScheme`, thay hardcode
  `blog-asset:`)
- Modify: `src/pages/admin/AdminBlogFormPage.tsx` (cap nhat import ten
  moi, truyen `assetUrlScheme="blog-asset"`)
- Modify: `server/src/modules/blog/blog-content-sanitizer.ts` (mo rong
  `allowedTags`, `allowedAttributes`, `allowedStyles`)
- Modify: `package.json` (them 3 goi Tiptap moi: text-align, color,
  text-style — highlight da la 1 goi rieng thu 4 neu chua co, kiem tra
  lai luc implement)
- Read for context: `src/pages/BlogDetailPage.tsx` (public render, dung
  `resolveBlogContentImageUrls`), `src/lib/image-url.ts`

## Implementation Steps

1. Doc doc Tiptap 3.x chinh thuc (`ck:docs-seeker`) cho:
   `TableKit`/`mergeCells`/`splitCell` command API, `TextAlign`, `Color`,
   `TextStyle`, `Highlight`.
2. `npm install` cac goi Tiptap moi vao root `package.json`
   (`@tiptap/extension-text-align`, `@tiptap/extension-color`,
   `@tiptap/extension-text-style`, `@tiptap/extension-highlight`).
3. Doi ten `BlogContentEditor.tsx` → `ContentEditor.tsx`, them prop
   `assetUrlScheme: string` vao interface props, thay hardcode
   `blog-asset:${objectKey}` (dong 52) thanh
   `${assetUrlScheme}:${objectKey}`. Cap nhat `AdminBlogFormPage.tsx`
   import + truyen `assetUrlScheme="blog-asset"`.
4. Cap nhat `blog-editor-extensions.ts`: bat blockquote/code/codeBlock
   trong `StarterKit.configure()`, doi `TableKit.table.resizable: true`,
   `tableHeader: true`; kiem tra `BlogTableRow` custom co con can thiet
   khong khi `tableHeader: true` (co the phai bo custom `BlogTableRow`,
   dung TableRow mac dinh cua TableKit). Them `TextAlign.configure({
   types: ['heading', 'paragraph'] })`, `Color`, `TextStyle`,
   `Highlight.configure({ multicolor: true })`.
5. Cap nhat `BlogEditorToolbar.tsx`: them nhom nut moi (blockquote, code,
   code block, 3-4 nut text-align, color picker don gian — vai mau co
   dinh la du, khop YAGNI), highlight, nut merge/split cell cho table
   (chi hien khi cursor trong table — dung `editor.isActive('table')`).
6. Mo rong `blog-content-sanitizer.ts`:
   - `allowedTags`: them `blockquote`, `code`, `pre`, `th`.
   - `allowedAttributes`: `th: ['colspan', 'rowspan', 'style']`, `td` them
     `colspan`, `span`/`p`/`div` them style moi neu can (mark `color` sinh
     ra the `<span style="color:...">`).
   - `allowedStyles['*']`: `text-align` da co san (dong 10, gom
     center/justify/left — kiem tra co thieu `right` khong, TextAlign moi
     can ca 4 huong), them `background-color` cho highlight (da co dong
     18 nhung dang gan cho bang, kiem tra pham vi ap dung dung cho
     `mark`/`span`).
   - Cap nhat comment dong 23 phan anh dot khao sat/mo rong moi (khong
     ghi so phase/finding code — chi ghi ngay + ly do, theo quy uoc
     "khong tham chieu plan artifact trong code comment").
7. Chay `npm run smoke:admin-blog` (can `ADMIN_EMAIL`/`ADMIN_PASSWORD`) de
   xac nhan byte-identity gate 267 bai cu van pass sau khi doi sanitizer
   va doi ten component.
8. Test thu cong: tao/sua 1 bai blog dung het cac tinh nang moi (blockquote,
   code block, table co header + resize + merge/split, text-align, color,
   highlight), luu, reload, xac nhan HTML giu nguyen sau sanitize, xem
   lai o trang public `BlogDetailPage`.
9. `npm run lint` + `npm run build` (root), `cd server && npm run lint &&
   npm run build`.

## Success Criteria

- [ ] Toolbar co du nut: blockquote, code, code block, text-align (4
      huong), color, highlight, table voi header/resize/merge/split cell
- [ ] `sanitizeBlogContent` whitelist da mo rong dung bo, khong xoa mat
      noi dung tao boi cac extension moi
- [ ] `ContentEditor` (doi ten tu `BlogContentEditor`) hoat dong dung cho
      blog voi `assetUrlScheme="blog-asset"`, khong doi hanh vi cu
- [ ] `npm run smoke:admin-blog` pass, gom byte-identity gate 267 bai cu
- [ ] Bai blog moi dung du tinh nang moi hien thi dung tren
      `BlogDetailPage` (public) sau khi luu va reload
- [ ] Khong co tag/extension/UI nao lien quan video/media-embed trong
      scope phase nay
- [ ] `npm run lint` + `npm run build` sach ca root va `server/`

## Risk Assessment

- **Rui ro cao nhat:** quen mo rong sanitizer whitelist dong bo voi FE →
  noi dung bi am tham mat luc save, khong co error message. Mitigation:
  buoc 6 va 7 phai lam truoc khi coi phase la xong; luon test round-trip
  (tao noi dung → luu → doc lai → so sanh) cho tung extension moi, khong
  chi test UI hien thi dung trong editor.
- **`BlogTableRow` custom co the xung dot voi `tableHeader: true`:** can
  kiem tra thuc te khi implement, co the phai bo custom extend nay.
- **Gia tri `merge`/`splitCell`:** chua co code tham khao trong repo, can
  doc doc chinh thuc luc code, khong doan API.
- **Doi ten component:** rui ro thap (verified chi 1 caller) nhung van
  can chay smoke test blog sau khi doi de chac chan khong lam vo luong
  hien co.
