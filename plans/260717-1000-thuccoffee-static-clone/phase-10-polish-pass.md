---
phase: 10
title: "polish-pass"
status: pending
effort: "2.5h"
---

# Phase 10: Polish Pass

## Context Links
- All prior phases (1–9). Original site for visual comparison: http://www.thuccoffee.com.vn (HTTP).
- Logo/favicon: `src/assets/images/site/151b6674_circlelogo-white-blue-jul2023.png`

## Overview
- **Priority:** P2 (final)
- **Status:** Pending
- Cross-route QA: responsive checks, 404, favicon, per-route meta tags, final visual comparison. No new features.

## Key Insights
- Depends on Phases 5–9 complete. This is a correctness/quality gate, not a feature phase.
- Per-route `<title>`/meta: use `react-router` route-level effect OR a tiny `usePageMeta(title, description)` hook (document.title + meta) — avoids adding react-helmet (YAGNI for 14 routes).
- 404 (`NotFoundPage`) already routed (Phase 1); polish its content + link home.
- **QA ownership split (red-team fix — Scope Critic finding: Phases 5-9's own "Responsive" checkbox and this phase's 4-breakpoint sweep both claimed full ownership, double-counting effort with no stated authority):** Phases 5-9's own "Responsive" step is a quick single-breakpoint (mobile ~375px) sanity check during that phase's own build. **This phase is the sole authority for the full 375/768/1024/1440 × 14-route sweep** — it is not redundant with the per-phase checks, it's the first and only pass at that full matrix.
- Store map-embed verification (all 7 iframes) already happened in Phase 8, not deferred here — this phase's console/build audit just confirms no regressions.
- `getImageUrl`'s `console.warn` is dev-only (Phase 3) — a clean production build should show zero console output for missing assets by construction, not because this phase manually filters them out.

## Requirements
### Functional
- Every route: correct `<title>` + meta description (Vietnamese); favicon set; NotFound renders on bad paths.
- No console errors/warnings across routes (broken images, key warnings, missing lightbox CSS).
### Non-functional
- Responsive OK at 375 / 768 / 1024 / 1440. Lighthouse pass reasonable (no blocking issues). Production build succeeds.

## Architecture
- `src/lib/use-page-meta.ts` — `usePageMeta(title, description?)` sets `document.title` + meta on mount/param change.
- Each page calls `usePageMeta(...)`. Home sets default + brand.
- **Data flow:** static per-route strings (detail pages derive title from product/store/blog name).

## Related Code Files
### Create
- `src/lib/use-page-meta.ts`
- `public/favicon.*` (from logo; convert PNG → ico/png favicon).
### Modify
- All `src/pages/*.tsx` — add `usePageMeta` call.
- `index.html` — default title, meta description, favicon link, `lang="vi"` (confirm).
- `src/pages/NotFoundPage.tsx` — friendly 404 + home link.

## Implementation Steps
1. `usePageMeta` hook (document.title + `<meta name=description>`).
2. Add `usePageMeta` to all 14 pages + 404 (detail pages: dynamic from record).
3. Generate favicon from logo (imagemagick: `convert logo.png -resize 64x64 public/favicon.png`); link in `index.html`.
4. `NotFoundPage` — heading, message, "Về trang chủ" link.
5. Responsive sweep: 375/768/1024/1440 across all 14 routes; fix overflow/broken grids/header overlap.
6. Console audit: fix broken images (verify `getImageUrl` hits), React key warnings, ensure lightbox `styles.css` imported once.
7. `npm run build` — resolve any prod-only errors; `npm run preview` smoke test.
8. Visual comparison vs original (open http://www.thuccoffee.com.vn side-by-side); note intentional deviations (no Messenger, estimated prices, summary-as-body).
9. Optional: run `/ck:preview --diagram` for route map if useful for docs.

## Todo List
- [ ] `usePageMeta` hook + apply to all routes
- [ ] Favicon from logo + index.html meta
- [ ] Polish `NotFoundPage`
- [ ] Responsive sweep (4 breakpoints × 14 routes)
- [ ] Console audit (images/keys/lightbox CSS)
- [ ] `npm run build` + preview smoke test
- [ ] Visual comparison vs original; log deviations

## Success Criteria
- [ ] Each route has unique correct title + meta description.
- [ ] Favicon visible in tab.
- [ ] Bad URL → NotFound with home link.
- [ ] No console errors/warnings on any route.
- [ ] Responsive at all 4 breakpoints, no horizontal scroll.
- [ ] `npm run build` succeeds; `preview` works.
- [ ] Visual parity with original within documented deviations.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Prod build reveals import.meta.glob path issues | Med | Med | Test `build`+`preview` early; fix asset URLs; `getImageUrl` covered Phase 3. |
| Meta hook races on param change (detail pages) | Low | Low | Depend on record in effect deps; fallback default title. |
| Responsive regressions from earlier phases | Med | Med | Systematic breakpoint sweep; fix at source component. |
| Favicon conversion (imagemagick absent) | Low | Low | Fallback: use PNG favicon directly or Vite default. |

## Security Considerations
- Final check: no `.env`/secrets committed; external links `rel=noopener`; no `dangerouslySetInnerHTML`; forms remain no-op. Confirm no analytics/tracking pixels pulled from original.

## Next Steps
- Hand off for `code-review` + `docs` update. Deploy target (static host) out of scope for this plan.
