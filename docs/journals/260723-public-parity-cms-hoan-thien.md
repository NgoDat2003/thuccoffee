# Public Parity + CMS Hoàn chỉnh trong một hôm — Codex dự án + tôi execute 8 phase

**Ngày:** 2026-07-23
**Nhánh:** `feat/public-parity-cms-scope` (nối từ `main`)
**Phạm vi:** Âm dương trước đó: frontend đã gọi API từ bữa hôm qua, admin MVP xanh bùng 260722; hôm nay lock scope (public parity chỉ, bỏ giỏ/member/RBAC), rồi đóng 8 phase end-to-end.

## Đã ship — tóm tắt 8 phase

Codex audit site gốc, viết báo cáo parity + draft 8-phase plan, rồi hết token mid-way (phase 7-8 stub). Tôi hoàn chỉnh plan rồi execute `/cook --auto`:

1. **Scope & docs** — §13 báo cáo lock 8 quyết định (public chỉ, no cart/member/RBAC); dọn CLAUDE.md/README cũ (còn bảo "FE đọc tĩnh", getImageUrl description sai).
2. **Ordering rules** — products: is_featured/show_on_home/home_priority; blog priority; categories.kind tách 8 thực + 2 presentation-only; home render đúng rule, không .slice(0,8).
3. **Search + contact** — `/search/p{n}`, `/search/t3p{n}` khớp source URL; contact/newsletter POST idempotent (honeypot + prevent-dup); email lowercase.
4. **Product options/stickers** — end-to-end từ DB tới admin UI; Americano duy nhất seeded (45k Nóng, 45k/55k Lạnh M/L — audit evidence); 41 product khác 0 option (không bịa data).
5. **Static pages CMS** — 6 page JSON config (About/Careers/...), membership_faqs + site_gallery; admin editor JSON + gallery builder; trang public render đúng.
6. **Banner/store/blog CMS** — banner CTA/new-tab/schedule window, store map_embed_url, blog priority, admin UI cho 3 cái này.
7. **Regression + new smoke** — Codex schema strict đó gây smoke cũ 400 (unknown field). **Fix: optional() với semantics "absent = keep old"** (cẩn thận không xóa dữ liệu khi old client update). 3 smoke suite mới (11 tổng).
8. **Route replay verify** — 400 URL từ source → 391/391 qua ✓, 9 loại (doc cụ thể lý do). **Phát hiện**: source dùng slug text khác clone (normalize emoji/diacritics) — thêm getBySlug fallback matching `-s{id}t{n}` suffix duy nhất.

## Review code-reviewer flags 4, all fixed

**HIGH:** Admin JSON editor white-screen (valid JSON, sai form) → per-key Zod validation server-side + route errorElement. **HIGH:** `z.coerce.boolean()` năng lực `?home=false` → true → enum 'true'/'false'. **MED:** mapEmbedUrl accept any URL → https:// guard. **MED:** NewsletterForm missing honeypot (dead branch) → add. **Deferred:** rate-limit /submissions noted in deployment.md (pre-exposure).

## UI polish sau cook — user catch ghi chép

- **Scroll 3 layer** trong drawer form: `<dialog>` không lock body scroll, UA overflow ở từng content. Fix: body.overflow = hidden + overflow-hidden CSS.
- **Sticky save bar** overlap form input. Fix: static action row cuối form.
- **Save text tối** trên dark-blue bg. Fix: text-white all; kiểm lại admin-sidebar-on-accent.
- **Copy-paste 4 FormActionBar** (Product/Banner/Store/AdminBlog). Codex do — tôi extract FormActionBar component, 4 form dùng chung; blog sticky xóa theo request user.

## Bài học từ khó khăn

- **Regression tự gây** ở phase 2-6, chỉ lộ vì smoke cũ chạy lại. Phần khó: suy nghĩ "absent vs empty array" semantics để không làm mất dữ liệu khi update từ old client.
- **Slug mismatch discovery** — 30+ URL blog "mất" thực chất là normalization từ crawl gốc. Không phải re-crawl, fix bằng ID-suffix fallback.
- **Duplicate component tượng vọng nhanh** — copy-paste FormActionBar 4 chỗ thay vì extract ngay. User nhìn, chỉ ra.

## Verify

FE/server lint/build ✓, vitest 10/10, Playwright e2e 5/5, 11 smoke xanh, route replay 391/391. Chưa commit.
