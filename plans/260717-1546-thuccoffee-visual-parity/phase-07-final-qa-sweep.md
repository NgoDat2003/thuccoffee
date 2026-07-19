---
phase: 7
title: "Final QA sweep"
status: completed
effort: "3h"
priority: P1
---

# Phase 7: Final QA sweep

## Context Links

- Audit methodology to re-run — `clone-website-gap-audit.md` §"Runtime verification" + route-by-route table
- Breakpoints + geometry to check against — `source-website-scout-report.md`
- Unused-asset list (25 assets, 16.85MB) — `clone-website-gap-audit.md` §"Asset inventory"

## Overview

**Priority:** P1. **Status:** completed. **Depends on:** phases 1-6.

Re-run the audit methodology to confirm gaps closed: route-parity (all category/pagination/store routes return content, not redirect), 4-breakpoint screenshots (375 / 768 / 1024 / 1440), console/error audit, production build, and a delta report vs `clone-website-gap-audit.md`. Also clean up the 25 now-unused downloaded assets once new images are wired in (verify still-unused first).

## Key Insights

- The audit ran on `http://127.0.0.1:4178` (Vite) with `agent-browser` (Playwright not a dependency) — reuse the same tooling; do not add Playwright (YAGNI).
- The 768px nav-switch change (phase 1) is the highest regression risk — the 768–1023px band used the wrong layout before and the mega-menu must now fit 768px. Screenshot that exact band.
- Breadcrumb removal + header-height change (phase 1) are global — every route family must be re-checked, not just the changed pages.
- Asset cleanup: the 25 unused assets may no longer all be unused after phases 4/5 wire new images. **Re-verify still-unused before deleting** — `import.meta.glob` is `eager:true` (`image-url.ts:1-5`), so anything in `src/assets/images` enters the build graph whether referenced or not.

## Requirements

Functional:
- Route-parity check: 10 category routes, 54 blog pagination routes, 7 store routes + `/cua-hang`, 42 product routes — all return content, none redirect.
- 4-breakpoint screenshots for each template family.
- Console/error audit: no broken `<img>`, no console errors on sampled routes.
- Production `npm run build` + `npm run lint` pass.
- Delta report or updated audit status confirming which gaps closed.
- Asset cleanup: delete confirmed-still-unused assets.

Non-functional: no new test framework; reuse existing lint/build + agent-browser.

## Architecture

Verification flow: build → serve → for each route family, request + assert content (not redirect) → screenshot at 375/768/1024/1440 → diff against source CSS values / template geometry → log deltas. Asset cleanup: grep every filename in `src/assets/images` against `src/` references; anything with zero references AND confirmed not newly wired → delete.

## Related Code Files

Read-only (verification): all routes + components touched in phases 1-6.

Modify:
- `plans/260717-1000-thuccoffee-static-clone/reports/clone-website-gap-audit.md` — update status, OR produce a new delta report in this plan's `reports/`.
- `src/assets/images/**` — delete confirmed-unused assets only.

Create:
- `plans/260717-1546-thuccoffee-visual-parity/reports/qa-delta-report.md` — closed vs open gaps, screenshots, residual issues.

## Implementation Steps

1. `npm run build` + `npm run lint` — must pass.
2. Route-parity sweep: assert each of the 10 category, 54 pagination, `/cua-hang` + 7 store, 42 product routes returns content (not a redirect to a parent). Specifically re-check the audit's failing cases: `/menu/coffee-t1p1s494` (was → `/menu`), `/chuyen-cua-thuc/t1p2` (was → listing).
3. Screenshots at 375 / 768 / 1024 / 1440 for: home, menu, category, product detail, blog listing, blog pagination, blog detail, store default, store detail, and the 6 static pages. Pay special attention to the **768px band** (nav switch + mega-menu fit).
4. Console/error audit on sampled routes: no broken `<img>`, no console errors.
5. Verify global changes didn't regress any route: header height (50/82), no stray breadcrumbs, `#f5f5f5` bg, 30px sections, full-bleed hero.
6. Re-verify the 25 previously-unused assets: grep each filename across `src/`. Delete only those still unreferenced after phases 4/5 wiring.
7. Write `qa-delta-report.md` and update the original audit's status.

## Todo List

- [x] build + lint pass
- [x] Route-parity: 10 category + 54 pagination + 8 store + 42 product all return content
- [x] 4-breakpoint screenshots (esp. 768px band + mega-menu fit)
- [x] Console/broken-img audit clean on sampled routes
- [x] Global-change regression check (header height, no breadcrumb, tokens, hero)
- [x] Re-verify + delete still-unused assets (grep first)
- [x] `qa-delta-report.md` + update original audit status

## Success Criteria

- [x] 0 category/pagination/store routes redirect; all return content.
- [x] Screenshots captured at all 4 breakpoints; 768px nav switch + mega-menu render correctly (no crowding/overflow).
- [x] No broken `<img>` or console errors on sampled routes.
- [x] `npm run build` + `npm run lint` pass.
- [x] Confirmed-unused assets removed; no referenced asset deleted (build still passes after cleanup).
- [x] Delta report produced; original audit status updated.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 768px mega-menu still crowds/overflows | Med | High | Dedicated 768px screenshots; if crowding, loop back to phase 1 mega-menu sizing before sign-off. |
| Deleting an asset that IS newly wired (phases 4/5) | Med | High | Grep every filename across `src/` before deleting; delete only zero-reference files; re-run build after cleanup to confirm no missing-asset warnings (`image-url.ts:16-19` logs missing in DEV). |
| A phase-1 global change silently regressed an unrelated route | Med | Med | Full route-family screenshot matrix, not just changed pages. |
| `agent-browser` HTTPS-upgrade quirk (source-only issue) misread as clone bug | Low | Low | Clone is local Vite over http — not affected; noted for awareness only. |

## Security Considerations

None — verification + asset cleanup only. Confirm no secrets/dotenv accidentally added to `src/assets` during download passes.

## Next Steps

Final phase. On pass, the plan is complete; update `plan.md` status to completed and the original audit's status to reflect closed gaps.
