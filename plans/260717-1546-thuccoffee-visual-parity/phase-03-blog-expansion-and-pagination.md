---
phase: 3
title: "Blog expansion and pagination"
status: completed
effort: "4h"
priority: P1
---

# Phase 3: Blog expansion and pagination

## Context Links

- Gap audit P0 §2 (blog system barely cloned, 0/54 pagination, 4/267 slugs) — `clone-website-gap-audit.md`
- Story structure + pagination facts — `source-website-scout-report.md` §Stories
- Real story data — `thuccoffee-site-crawl.json` (story pages `/chuyen-cua-thuc/{slug}-s{id}t2/`, 54 pagination pages `t1p1`–`t1p54`)
- Current blog data (5 posts) — `src/data/blog.ts:5-37`

## Overview

**Priority:** P1. **Status:** completed. **Depends on:** phase 1.

Grow blog from 5 to ~10 real posts (real title/slug/cover/summary/date from the crawl JSON). Build all 54 pagination routes `/chuyen-cua-thuc/t1p1` … `t1p54` as **live routes that render content** (not redirect), 5 cards/page. Pages beyond available data **repeat the ~10 posts** to fill each page — a deliberate, user-approved simplification (no fabricated dates). Listing cards gain date + "Xem Tiếp"; detail gains date + sidebar.

## Key Insights

- **User decision (locked):** pagination pages beyond real data repeat the ~10 posts. This is intentional — a **mandatory terse code comment** must mark it so a future review does not "fix" it as a bug. No fabricated dates: repeated cards reuse the real post's real date.
- Source: pages 1–53 show 5 cards each, page 54 shows 2; `/chuyen-cua-thuc` and `/chuyen-cua-thuc/t1p1` show identical content (`source-website-scout-report.md` §Stories). Clone can mirror "identical first page" simply by having the index render page 1.
- Route hazard: `chuyen-cua-thuc/:slug` (`routes.tsx:28`) currently swallows `t1p{n}` and redirects. The pagination route must be declared **before** (or distinguished from) the `:slug` story route — `t1p{n}` is a fixed shape, so a dedicated `chuyen-cua-thuc/t1p:page` route (or exact-pattern check) resolves cleanly.
- `BlogPost` type (`types.ts:14-19`) has no `date`; add `date` (and optional `body` already noted as absent). Detail currently reuses `summary` as body (`BlogDetailPage.tsx:42`) — keep that (source articles have thin bodies) but add date + sidebar.

## Requirements

Functional:
- `blog.ts` grows to ~10 posts with real `date` added.
- Routes `/chuyen-cua-thuc/t1p1` … `t1p54` render 5 cards/page (page 54 may show 2 to mirror source, or repeat to 5 — pick one; simplest is 5 everywhere with repeat, document the choice).
- `/chuyen-cua-thuc` and `/chuyen-cua-thuc/t1p1` render identical page-1 content.
- Listing cards show date + "Xem Tiếp" affordance.
- Detail shows date + related/promotion sidebar; back-link preserved.
- All ~10 real story slugs resolve at `/chuyen-cua-thuc/{slug}`.

Non-functional:
- Pagination math in one helper (DRY); repeat-logic isolated + commented.

## Architecture

Data flow: `blog.ts` (10 posts) → pagination helper `getBlogPage(page, perPage=5)` that indexes into the post array **modulo length** to fill 54 pages → `BlogIndexPage` (page from route param, default 1) → `BlogCard[]`.

Repeat mechanism: `posts[(pageOffset + i) % posts.length]` — deterministic, real dates preserved. React `key` must be unique per rendered card (index-in-page + slug), since the same slug repeats across pages.

Component interactions:
- New `chuyen-cua-thuc/t1p:page` route → `BlogIndexPage` reading `:page`.
- `chuyen-cua-thuc` index route → `BlogIndexPage` with page=1.
- `chuyen-cua-thuc/:slug` → `BlogDetailPage` (only reached when slug is NOT `t1p{n}` — order routes so `t1p:page` matches first, or guard).

## Related Code Files

Modify:
- `src/data/types.ts:14-19` — add `date: string` to `BlogPost`.
- `src/data/blog.ts:5-37` — expand to ~10 posts (real data from crawl) + `date` on each. Pull real title/clean-slug/cover/summary/date from `thuccoffee-site-crawl.json` story pages.
- `src/data/index.ts:33-35` — add `getBlogPage(page, perPage)` pagination helper with the documented repeat-comment; keep `getBlogBySlug`.
- `src/routes.tsx:27-28` — add `chuyen-cua-thuc/t1p:page` route before/alongside `:slug`; ensure `t1p{n}` resolves to pagination, not story.
- `src/pages/BlogIndexPage.tsx:7-19` — read page param (default 1), render `getBlogPage`, add pagination controls; cards get date + "Xem Tiếp".
- `src/pages/BlogDetailPage.tsx:14-49` — add date display + sidebar (related posts / promotion block); breadcrumb already removed in phase 1.
- `src/components/blog/BlogCard.tsx` — add date (muted `#959595`) + "Xem Tiếp" link affordance.

Create: none required (pagination controls can be inline in `BlogIndexPage`, or a small `BlogPagination.tsx` if it exceeds ~30 lines — prefer extraction if `BlogIndexPage` passes 200 lines).

## Implementation Steps

1. Extract ~10 real story records from `thuccoffee-site-crawl.json` (title, clean ASCII slug ending `-s{id}t2`, cover filename, summary, publication date). Confirm cover filenames exist in `src/assets/images` or add to a download list (most home/blog covers already local).
2. Add `date: string` to `BlogPost`; populate all ~10 posts in `blog.ts`.
3. Add `getBlogPage(page, perPage=5)` to `index.ts` using modulo indexing to fill 54 pages. **Add the mandatory comment**: e.g. `// Intentional: pages beyond the ~10 real posts repeat them (user-approved). Real dates preserved — do NOT treat as a bug.`
4. Add `chuyen-cua-thuc/t1p:page` route; make index render page 1; guard `:slug` so `t1p{n}` never reaches the story handler.
5. `BlogIndexPage`: page from param, render 5 cards, pagination nav (prev/next + page numbers within source range 1–54).
6. `BlogCard`: add date + "Xem Tiếp".
7. `BlogDetailPage`: add date + sidebar (reuse related list already present at `BlogDetailPage.tsx:23`).
8. Verify `/chuyen-cua-thuc/t1p2`, `/t1p54`, index==t1p1, and all ~10 slugs resolve. `npm run build` + `npm run lint`.

## Todo List

- [x] Extract ~10 real posts + dates from crawl JSON
- [x] `BlogPost.date` field
- [x] `getBlogPage` with modulo repeat + mandatory intentional-repeat comment
- [x] `t1p:page` route + `:slug` guard against `t1p{n}`
- [x] `BlogIndexPage` pagination + date + "Xem Tiếp" on cards
- [x] `BlogDetailPage` date + sidebar
- [x] Verify t1p1==index, t1p2, t1p54, all slugs; build + lint

## Success Criteria

- [x] `blog.ts` has ~10 real posts each with a real date.
- [x] `/chuyen-cua-thuc/t1p{1..54}` all render 5 cards (repeat past real data), none redirect.
- [x] `/chuyen-cua-thuc` == `/chuyen-cua-thuc/t1p1`.
- [x] Listing cards show date + "Xem Tiếp"; detail shows date + sidebar.
- [x] All ~10 story slugs resolve; repeat-logic carries the intentional comment.
- [x] build + lint pass.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Future review "fixes" the repeat-data as a bug** | Med | Med | Mandatory terse code comment on the repeat helper explaining it's user-approved; also recorded here in the plan. |
| `t1p{n}` swallowed by `:slug` story route (still redirects) | Med | High | Declare `t1p:page` route so it matches first; guard `:slug` handler against `t1p` prefix; verify `/t1p2` at runtime in phase 7. |
| Duplicate React keys from repeated slugs across a page | Med | Low | Composite key (`${slug}-${indexInPage}`). |
| Repeated card links all point to the same detail (expected) | Low | Low | Acceptable — matches the repeat simplification; not a bug. |

## Security Considerations

None — static content rendering.

## Next Steps

Independent of phases 2, 4-6. Phase 7 verifies 54 pagination routes return content.
