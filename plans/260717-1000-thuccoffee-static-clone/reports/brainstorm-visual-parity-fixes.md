---
title: Brainstorm — visual parity fixes after gap audit
date: 2026-07-17
inputs:
  - plans/260717-1000-thuccoffee-static-clone/reports/clone-website-gap-audit.md
  - plans/260717-1000-thuccoffee-static-clone/reports/source-website-scout-report.md
  - plans/260717-1000-thuccoffee-static-clone/reports/thuccoffee-site-crawl.json
  - plans/260717-1000-thuccoffee-static-clone/reports/source-full-media-manifest.json
---

# Brainstorm: Visual Parity Fixes

## Problem statement

Gap audit (clone-website-gap-audit.md) found the clone diverges from source in layout/component fidelity across nearly every route, plus route/data gaps (menu category deep-links dead, blog pagination redirects, product/store media incomplete). Root cause: original build was scoped to a 14-route static sample from a light crawl; a deeper crawl (400 normalized source paths, 473 real assets) run afterward exposed the real site is bigger and styled differently than assumed.

## User decisions (locked in)

- **Blog scope**: expand from 5 to ~10 real posts; build all 54 pagination routes (`/chuyen-cua-thuc/t1p1`–`t1p54`) as live routes (no redirect); pages beyond available data reuse/repeat existing posts rather than showing empty state.
- **Fix order**: P0 (shared shell: footer/header/hero) → P1 (routes/data expansion) → static page content rewrite, in that order.
- **Data source**: reuse already-crawled reports before crawling anything new. Scout confirmed this is sufficient — no new crawl needed.

## Scout findings (this session)

Three existing report files fully cover what's needed:
- `source-website-scout-report.md` — exact CSS px/color/breakpoint values for every shared component (header, footer, hero, cards, spacing tokens).
- `thuccoffee-site-crawl.json` — 400 pages, each with full extracted `text` content. Confirmed real, complete Vietnamese copy for all 6 static pages (about, membership+FAQ, careers, contact, delivery, cookie policy) — no fabrication needed, this is source-accurate content.
- `source-full-media-manifest.json` — 473 real asset URLs with dimensions/content-type, including store-gallery-tagged and product-detail-tagged assets not yet downloaded locally.

Confirmed via direct JSON inspection: 54 pagination pages exist in the crawl (`t1p1`–`t1p54`), story detail sample pattern confirmed (`/chuyen-cua-thuc/{slug}-s{id}t2/`), static-page text is complete (not truncated) for all 6 target pages.

## Approaches considered

### Option A: Fix everything in one large phase
Rejected — 10+ independent concerns (shell, routing, 3 different data models, content rewrite) in one phase makes review/rollback hard and violates the plan's own phase-decomposition convention used successfully in the original 10-phase build.

### Option B: Phase-decompose by audit priority (P0 shell → P1 routes/data → content) — SELECTED
Matches user's explicit fix order. Each phase has a clean success criterion (visual diff against source CSS values, route returns 200 not redirect, text matches crawled source). Mirrors the original plan's phase style so `/ck:plan` can produce consistent phase files.

### Option C: Fix only P0 shell, defer P1/content to a second round
Rejected — user explicitly asked for full P0→P1 sweep in one plan, not split further.

## Recommended phase breakdown for /ck:plan

1. **Shared shell rebuild** — Footer (3-col 25/50/25, circle social icons, coffee divider, newsletter, mobile collapse), Header desktop (70px logo, 35px nav gaps, blue underline, mega-menu), Header mobile (50px blue bar, 768px breakpoint, full-width drawer), Hero (full-bleed, viewport-height), global tokens (`#f5f5f5` bg, `#292929` text, 30px section padding), SectionTitle (left-align), ProductCard (exact sizing), FloatingOrderButton (icon+circle+ring).
2. **Menu category deep-links** — real `/menu/:categorySlug` routes matching source `-t1p1s{id}` pattern, dropdown/sidebar links point to real category URLs instead of all pointing to `/menu`.
3. **Blog expansion + pagination** — grow `blog.ts` to ~10 real posts (source data already in crawl JSON), build `/chuyen-cua-thuc/t1p{1-54}` as real routes reusing/repeating the 10 posts, add date + "Xem Tiếp" to listing cards, add sidebar metadata to detail.
4. **Store default-detail + galleries** — `/cua-hang` renders the first store's detail (not a grid), each of 7 stores gets its real multi-image gallery (asset URLs already identified in media manifest, need download).
5. **Product data enrichment** — add descriptions (only source that exists is the crawled product detail text where present), download the 41 missing full-resolution images identified in the manifest.
6. **Static page content rewrite** — replace `pages.ts` placeholder copy with the real crawled text for about/membership/careers/contact(+Phone field)/delivery(+Zalo/Messenger)/cookie-policy, verbatim from `thuccoffee-site-crawl.json`.
7. **Final QA sweep** — re-run the same audit methodology (route-parity check + breakpoint screenshots) to confirm gaps closed; update `clone-website-gap-audit.md` status or produce a follow-up delta report.

## Risks / considerations to carry into planning

- Blog pagination with repeated data is a deliberate, user-approved simplification — plan should document this explicitly in a code comment (no fabricated dates) so it isn't "fixed" again later by mistake.
- Menu category route pattern in source includes an opaque numeric ID (`-t1p1s494`) — decide whether the clone needs to replicate the exact ID suffix or can use a clean slug-only route; source-parity favors replicating it since deep-links must "work" per the audit's own success metric.
- Store gallery + product full-res images require a second download pass (new script run, same pattern as Phase 2 of the original plan) — should be its own step with the same content-type verification gate used before.
- 25 currently-downloaded-but-unused assets (16.8MB) flagged by audit — cleanup can piggyback on this pass once new images are wired in and old unused ones are confirmed still unused.

## Next steps

Hand off to `/ck:plan` for detailed phase files (this report as context). Recommend default `/ck:plan` mode (not `--tdd`) since this is content/layout work, not business-logic refactoring with existing test coverage to preserve.

## Unresolved questions

None — all decisions were confirmed with the user in this session.
