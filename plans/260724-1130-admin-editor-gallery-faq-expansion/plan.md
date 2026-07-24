---
title: 'Blog editor mo rong, product content field, tach Gallery/FAQ'
description: >-
  Bat toan bo extension Tiptap co san cho blog, them cot content moi cho product
  dung chung editor, tach Gallery va FAQ thanh 2 trang rieng dung AdminTable/mau
  Banner.
status: completed
priority: P2
branch: feat/public-parity-cms-scope
tags:
  - admin
  - cms
  - tiptap
  - editor
blockedBy: []
blocks: []
created: '2026-07-24T04:15:57.498Z'
createdBy: 'ck:plan'
source: skill
---

# Blog editor mo rong, product content field, tach Gallery/FAQ

## Overview

3 viec doc lap, gop 1 task theo yeu cau nguoi dung. Nguon: brainstorm report
`plans/reports/260724-admin-editor-gallery-faq-brainstorm.md`.

1. **Blog editor** — bat toan bo extension Tiptap da cai san nhung chua dung
   (blockquote, code, code block, table nang cao) + cai moi (text-align,
   color/highlight). Khong doi thu vien. (Youtube/video embed da bi loai
   khoi scope — xem Validation Log.)
2. **Product content field** — them cot `content` moi vao bang `products`,
   tach biet voi `description` hien co, dung chung component editor voi
   blog. Chua hien thi public.
3. **Gallery/FAQ split** — tach route/menu "Gallery & FAQ" gop lam 1 thanh
   2 trang rieng. Gallery theo mau Banner (card grid + drawer). FAQ dung
   `AdminTable` that (du lieu dang liet ke van ban).

Ca 3 phase khong phu thuoc lan nhau ve code — co the lam theo bat ky thu tu
nao, nhung Phase 2 nen lam sau Phase 1 vi tai su dung component editor cua
Phase 1 (xem Phase 2 § Kien truc).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Mo rong Tiptap blog editor](./phase-01-mo-rong-tiptap-blog-editor.md) | Completed |
| 2 | [Them product content field](./phase-02-them-product-content-field.md) | Completed |
| 3 | [Tach Gallery va FAQ thanh 2 trang](./phase-03-tach-gallery-va-faq-thanh-2-trang.md) | Completed |

## Dependencies

Phase 2 blockedBy Phase 1 (tai su dung `ContentEditor` — `BlogContentEditor`
doi ten + them prop `assetUrlScheme` trong Phase 1, khong tach file moi).
Phase 3 khong phu thuoc phase nao.

Khong co cross-plan dependency — da scan `plans/` luc tao plan, 2 plan
`in-progress` con lai (`260721-1651-public-read-api-completion`,
`260722-1830-fe-full-api-migration`) noi ve "gallery" theo nghia khac (store
gallery / homepage lightbox tinh), khong dung file voi `site_gallery` admin
CMS trong plan nay.

## Validation Log

### Session 1 — 2026-07-24
**Trigger:** `/ck:plan validate` sau khi viet xong plan.md + 3 phase file
**Questions asked:** 5 (4 ban dau + 1 lam ro sau khi user phan hoi nguoc)

#### Verification Results
- **Tier:** Standard (3 phases → Fact Checker + Contract Verifier, 10
  claims/phase budget)
- **Claims checked:** 12 (9 file path + 3 contract/caller-count)
- **Verified:** 12 | **Failed:** 0 | **Unverified:** 0

Fact Checker — file path (tat ca VERIFIED):
`AdminTableToolbar.tsx`, `AdminDrawer.tsx`, `PublishSwitch.tsx`,
`StatusBadge.tsx`, `BannerForm.tsx`, `ConfirmDialog.tsx`,
`ImageField.tsx`, `membership-faqs.routes.ts`, `site-gallery.routes.ts`.

Contract Verifier:
- `BlogContentEditor` chi co **1 caller duy nhat**
  (`AdminBlogFormPage.tsx`) — xac nhan tach component la thao tac rui ro
  thap, khop huong "them 1 prop" da chon.
- `sanitizeBlogContent` co **3 call site** (`blog.admin.service.ts:127,
  157, 191`) — khop dung so lieu da neu trong Phase 1.
- `UpsertGalleryItemInput`/`UpsertMembershipFaqInput` types ton tai dung
  vi tri da trich dan trong Phase 3.

#### Questions & Answers

1. **[Scope]** Phase 1: Nhung youtube video vao blog content — chon cach
   nao?
   - Options: Custom node luu videoId (Recommended) | Allow raw iframe
     (whitelist domain)
   - **Answer:** User phan hoi nguoc — khong nho da yeu cau tinh nang
     nay, hoi web that (thuccoffee.com.vn) co dung video trong blog
     khong.
   - **Follow-up:** Da hoi lai ro — youtube embed la de xuat cua AI luc
     brainstorm ("bat toan bo extension chua dung"), KHONG phai yeu cau
     goc ro rang cua user. Anh mau TinyMCE co nut "chen media" nhung
     khong xac dinh la video.
   - **Answer (follow-up):** Bo hang muc nay khoi Phase 1.
   - **Rationale:** Tranh scope creep tu de xuat cua AI khong duoc xac
     nhan — dung nguyen tac "khong suy dien nghiep vu" trong CLAUDE.md
     du an. Neu web that co nhu cau video trong blog sau nay, lam rieng
     1 task voi input ro rang.

2. **[Architecture]** Phase 1: Muc do tach component `BlogContentEditor`
   de dung chung voi Phase 2 (product)?
   - Options: Chi them 1 prop, doi ten component (Recommended) | Tach
     thu muc `content-editor/` rieng
   - **Answer:** Chi them 1 prop, doi ten component.
   - **Rationale:** Verification xac nhan `BlogContentEditor` chi co 1
     caller — tach thu muc moi la over-engineering khong can thiet
     (YAGNI). Doi 1 prop (`assetUrlScheme`) + doi ten component la du.

3. **[Risk]** Phase 2: Whitelist ban dau cho product content sanitizer
   (chua co du lieu production de khao sat) gom nhung gi?
   - Options: Giong bo co ban cua blog, tru bang (Recommended) | Dong bo
     toan bo voi blog sanitizer (gom ca extension moi cua Phase 1)
   - **Answer:** Giong bo co ban cua blog, tru bang.
   - **Rationale:** Khong ap dat whitelist duoc khao sat tu DU LIEU BLOG
     len field PRODUCT chua co du lieu that — giu whitelist toi thieu,
     mo rong sau khi co du lieu production that (dung cach blog sanitizer
     da lam).

4. **[Assumptions]** Phase 2: Field "Noi dung" (content) tren
   `ProductForm` co bat buoc nhap khong?
   - Options: Optional, nullable (Recommended) | Bat buoc nhap
   - **Answer:** Optional, nullable.
   - **Rationale:** Khop tinh chat "field cho tuong lai" da neu tu luc
     brainstorm, giong cach `description` hien tai dang optional.

#### Confirmed Decisions
- Youtube/video embed: **loai khoi scope Phase 1** — khong phai yeu cau
  goc, la de xuat AI chua xac nhan.
- `BlogContentEditor` → doi ten `ContentEditor`, them prop
  `assetUrlScheme: string` thay the hardcode `blog-asset:` — KHONG tach
  thu muc moi.
- Product content sanitizer: whitelist rieng, toi thieu (p, br, strong,
  em, u, h1-h3, ul/ol/li, a, img, div, span) — KHONG dung chung file
  voi blog sanitizer, KHONG gom table/blockquote/code luc dau.
- `products.content`: optional/nullable, giong `description`.

#### Impact on Phases
- Phase 1: Bo toan bo hang muc youtube/video embed (extension, toolbar
  button, sanitizer allow tag/attribute lien quan, Related Code Files
  entry `BlogYoutubeEmbed.tsx`, Architecture section noi ve youtube node).
- Phase 2: Chot ten component `ContentEditor` + prop `assetUrlScheme`
  (thay vi de ngo "quyet dinh luc implement"). Chot whitelist sanitizer
  cu the (thay vi "toi thieu" chung chung). Xac nhan `content` la
  optional/nullable trong Zod schema.
- Phase 3: Khong bi anh huong boi cac quyet dinh tren.

### Whole-Plan Consistency Sweep
- Files reread: `plan.md`, `phase-01-mo-rong-tiptap-blog-editor.md`,
  `phase-02-them-product-content-field.md`,
  `phase-03-tach-gallery-va-faq-thanh-2-trang.md`
- Decision deltas checked: 4 (youtube removal, component rename+prop,
  sanitizer whitelist cu the, content optional confirmed)
- Reconciled stale references: 2 — `plan.md` Overview (dong 22-24, van
  liet ke "youtube embed" trong scope Phase 1) va `plan.md` Dependencies
  (dong 46, chu "tach ra" gay hieu lam la tach file moi thay vi doi ten +
  them prop). Ca 2 da sua.
- Unresolved contradictions: 0

### Session 2 — 2026-07-24
**Trigger:** `/code-review --pending` sau khi implement xong ca 3 phase
(cook). Code-reviewer subagent phat hien + toi tu verify doc lap 4 finding
tren `git diff HEAD`.

#### Findings tu code review
1. **[Critical - kien truc]** `ContentEditor.tsx` dung chung
   `createBlogEditorExtensions()` (khong phan biet owner) cho ca blog va
   product — toolbar cho product van co nut Bang/Trich dan/Ma du
   `products-content-sanitizer.ts` (nhu chot o Phase 2 goc) khong cho
   phep cac tag nay. Verified doc lap: sanitize input co table +
   blockquote + pre/code → output con lai text dinh lien khong dau cach
   ("cellquotecode"). Day la MAU THUAN TRUC TIEP voi quyet dinh da chot
   o Validation Session 1 Q3 ("KHONG gom table/blockquote/code").
2. **[High - bug]** The `<mark>` (Highlight extension, nut "Lam noi")
   khong co trong `allowedTags` cua CA 2 sanitizer — noi dung highlight
   bi xoa hoan toan khi luu, khong bao loi. Verified doc lap qua
   sanitizeHtml truc tiep.
3. **[High - bug]** `allowedAttributes` khong cap `style` cho h1/h2/h3 o
   ca 2 sanitizer trong khi TextAlign ap dung cho ca 3 heading level —
   can le tieu de bi xoa am tham khi luu. Verified doc lap.
4. **[Minor - scope creep]** Diff la trong `AdminPagesPage.tsx`
   (`max-w-2xl`/`max-w-4xl` bi xoa) khong thuoc pham vi 3 phase nao.

#### Questions & Answers (qua AskUserQuestion trong brainstorm)

1. **[Architecture]** Finding #1 — Product content nen dung toolbar rut
   gon (dung y dinh Validation Session 1) hay mo rong sanitizer product
   khop toolbar day du cua blog?
   - Options: Rut gon toolbar cho product (Recommended) | Mo rong
     sanitizer product khop voi blog
   - **Answer:** Mo rong sanitizer product khop voi blog.
   - **Rationale:** Nguoi dung chon don gian hoa — 1 component, 1 bo
     tinh nang, khong can them logic parameterize toolbar theo owner
     type. Day la DAO NGUOC quyet dinh da chot o Validation Session 1
     Q3 (nguyen nhan: don gian hoa kien truc uu tien hon viec giu
     product content "rut gon").

2. **[Risk]** Finding #2, #3 — sua ca 2 bug sanitizer ngay?
   - Options: Sua ca 2 ngay (Recommended) | Chi sua rieng tung cai
   - **Answer:** Sua ca 2 ngay.
   - **Rationale:** Day la bug that (da verify doc lap), khong phai lua
     chon kien truc — khong can ban them.

#### Confirmed Decisions
- **Dao nguoc Validation Session 1 Q3:** product content sanitizer
  (`products-content-sanitizer.ts`) MO RONG khop voi blog sanitizer —
  cho phep table/blockquote/code/th/mark/text-align/color/highlight,
  giong het bo tag cua blog. Chi khac o image src scheme
  (`product-asset` thay vi `blog-asset`). "Whitelist toi thieu, khong
  gom table/blockquote/code" cua ban dau KHONG con hieu luc.
- `mark` them vao `allowedTags` + `data-color`/`style` vao
  `allowedAttributes` o ca 2 sanitizer; `color` regex trong
  `allowedStyles['*']` mo rong them `inherit` (khop chinh xac output cua
  `@tiptap/extension-highlight`: `style="background-color: X;
  color: inherit"`).
- `h1`/`h2`/`h3` them `style` vao `allowedAttributes` o ca 2 sanitizer
  (giu nguyen `h2: dir` da co o blog).
- `AdminPagesPage.tsx` revert ve nguyen trang (`git checkout --`) — khong
  thuoc pham vi plan nay.

#### Impact on Phases
- Phase 2: Requirements/Architecture mo ta "whitelist toi thieu, KHONG
  gom table/blockquote/code" (dong ~70-77 cua phase-02 file) nay SAI so
  voi trien khai that. Khong sua lai phase file (work da xong, phase da
  completed) — ghi nhan tai day de nguoi doc sau khong hieu nham mo ta
  phase 2 la hien trang cuoi cung.
- Phase 1: khong bi anh huong ve scope, chi sua bug sanitizer.

### Whole-Plan Consistency Sweep (Session 2)
- Files reread: `plan.md`, ca 3 phase file, 2 file sanitizer sau khi sua
- Decision deltas checked: 1 (dao nguoc pham vi sanitizer product)
- Reconciled stale references: 0 (khong sua lai phase-02.md — ghi chu
  ro trong Validation Log thay vi sua nguoc history cua 1 phase da
  completed, tranh gay nham lan giua "du dinh luc plan" va "quyet dinh
  cuoi cung sau review")
- Unresolved contradictions: 0
