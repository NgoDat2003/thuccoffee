---
title: Thức Coffee Static Clone
description: >-
  Static React frontend clone of thuccoffee.com.vn with hardcoded data and real
  downloaded images, no backend.
status: pending
priority: P2
effort: 26h
branch: main
tags:
  - frontend
  - feature
  - react
  - static-clone
blockedBy: []
blocks: []
created: '2026-07-17'
createdBy: 'ck:plan'
source: skill
---

# Thức Coffee Static Clone

## Overview

Faithful static clone of the Vietnamese coffee chain site http://www.thuccoffee.com.vn as a
Vite + React + TypeScript SPA. 14 routes, 42-product catalog, 5 blog posts, 7 stores, 7 static
pages. All data hardcoded in TS modules; all images downloaded from origin. No backend, DB, auth,
cart, or payments. Tailwind v4 (CSS-first `@theme`), React Router v6 (config-based), Roboto self-hosted.

Design tokens: primary `#0c5278`, secondary `#40260a`, accent `#79a3b1`; container 1170px; fixed
82px header. Lightbox = `yet-another-react-lightbox`, carousel = `embla-carousel-react`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [project-scaffolding](./phase-01-project-scaffolding.md) | Completed |
| 2 | [bulk-image-download](./phase-02-bulk-image-download.md) | Completed |
| 3 | [data-layer](./phase-03-data-layer.md) | Completed |
| 4 | [shared-layout-components](./phase-04-shared-layout-components.md) | Completed |
| 5 | [home-page](./phase-05-home-page.md) | Completed |
| 6 | [menu-pages](./phase-06-menu-pages.md) | Completed |
| 7 | [blog-pages](./phase-07-blog-pages.md) | Completed |
| 8 | [store-pages](./phase-08-store-pages.md) | Pending |
| 9 | [static-pages](./phase-09-static-pages.md) | Pending |
| 10 | [polish-pass](./phase-10-polish-pass.md) | Pending |

## Dependencies

- **Phase 1** (scaffold) blocks all others — no code runs without Vite/Tailwind/Router set up.
- **Phase 2** (images) blocks Phase 3+ — data files reference image paths; UI needs real assets.
- **Phase 3** (data) blocks Phases 5–9 — all pages consume `products/blog/stores/pages` data.
- **Phase 4** (layout) blocks Phases 5–9 — every route renders inside shared Layout.
- **Phases 5–9** are parallel-safe after 1–4 (disjoint route/file ownership, see per-phase files).
- **Phase 10** (polish) depends on 5–9 — cross-route QA runs last.

## Key Risks (see per-phase Risk Assessment)

- Some products (count per `research/crawl-report.md`) lack source prices → estimated per category range, flagged in data file.
- Blog detail bodies unavailable from source → summary reused as body (documented in code comment), compensated with larger cover + related-posts strip so the page doesn't read as broken.
- Origin HTTPS cert broken → use `http://` for one-time asset fetch only (informational, not a blocker); re-rated origin-drift risk to Medium given this evidence, mitigated with a pre-flight HEAD-check sweep.
- Login page is UI-only (no real auth) → carries a visible on-page "demo only" banner, not just a code comment, to avoid a credential-harvesting-page appearance.
- Contact page info block uses only the real sourced hotline + a generic city location — no invented street address/phone for the real company being cloned.

## Red Team Review

### Session — 2026-07-17
**Findings:** ~24 raw findings across 4 reviewers (Security Adversary, Failure Mode Analyst, Assumption Destroyer, Scope & Complexity Critic), deduplicated to ~19 distinct issues.
**Severity breakdown:** 1 Critical (deduplicated from 4 independent reports of the same root cause), 4 High, ~14 Medium.

| # | Finding | Severity | Disposition | Applied To |
|---|---------|----------|-------------|------------|
| 1 | Cited source data (`scratchpad/crawl-report.md` etc.) doesn't exist in repo — reported independently by all 4 reviewers | Critical | Accept | Completed |
| 2 | `Breadcrumb`/`ProductCard`/`SectionTitle` file-ownership race between "parallel-safe" Phases 5/6 and their consumers (Failure Mode + Scope Critic, independently) | High | Accept | Completed |
| 3 | Phase 10 QA duplicates per-phase "Responsive" checks with no stated authority split | High | Accept | Completed |
| 4 | Login page indistinguishable from real auth (code comment only, no visible disclosure) | High | Accept | Completed |
| 5 | Bulk download has no hard fail-gate; partial/corrupt (HTML-as-image) files can silently proceed to Phase 3+ | High | Accept | Completed |
| 6 | Fabricating a specific contact address/phone for a real operating company | Medium | Accept | Completed |
| 7 | `console.warn` on missing image conflicts with Phase 10's "no console warnings" criterion | Medium | Accept | Completed |
| 8 | Download script not idempotent/resume-safe (no tmp+atomic-rename) | Medium | Accept | Phase 2 |
| 9 | ~20 ambiguous image subfolder assignments left to implementer memory, not recorded | Medium | Accept | Phase 2 (mandatory annotation) |
| 10 | Unpinned npm deps + no `npm audit` gate (supply chain) | Medium | Accept | Phase 1 |
| 11 | Tailwind v4 + Vite plugin combo asserted as fact without a verify step | Medium | Accept | Phase 1 (spike-verify step added) |
| 12 | Product slugs assumed "clean" while blog slugs got explicit emoji-sanitization treatment | Medium | Accept | Phase 6 (same treatment now required in Phase 3) |
| 13 | Google Maps iframe has no `sandbox` attribute; fallback path unspecified | Medium | Accept | Phase 8 |
| 14 | Map-embed verification deferred to Phase 10 despite being an undocumented endpoint that can degrade silently | Medium | Accept | Phase 8 (verification moved into this phase) |
| 15 | `Store.hours` typed field but detail page was to hardcode the literal string instead of reading it | Medium | Accept | Phase 8 |
| 16 | "9 estimated prices" hardcoded as a magic number in a success criterion, unverifiable at plan-authoring time | Medium | Accept | Phase 3, plan.md (reworded to structural check) |
| 17 | Store array order unspecified, unlike categories — home page "default = first" could diverge from source silently | Medium | Accept | Phase 3, Phase 5 |
| 18 | Blog detail = thin content (summary only) on a full-page layout, discovered only at Phase 10 | Medium | Accept | Phase 7 (larger cover + related strip added now) |
| 19 | `SearchOverlay` and newsletter-subscribe inputs are dead-weight no-op stubs, worse UX than omitting them | Medium | Accept | Phase 4 (both cut) |
| 20 | Reflected-XSS risk if a later phase echoes raw user input into a toast/success message | Medium | Accept | Phase 4 (global constraint), Phase 9 |
| 21 | Origin 404-drift risk under-rated "Low" despite the plan's own evidence of neglected infra (broken cert) | Medium | Accept | Phase 2 (re-rated Medium, pre-flight HEAD sweep added) |
| 22 | `import.meta.glob` image resolver called "over-engineered" vs. direct per-image imports | Medium | Reject | — rejected: with 92 images referenced by string from hardcoded data, per-image imports require more manual mapping code, not less; no simpler alternative offered |
| 23 | Merge Phase 7 (blog) + Phase 8 (store) — structurally near-identical, could be one phase | Medium | Reject | — rejected: cosmetic phase-count reduction, no functional risk; renumbering this late adds cross-reference churn without fixing a defect; effort/sequencing unaffected either way |
| 24 | 26h estimate has no contingency buffer for the plan's own Medium-rated risks | Medium | Reject | — rejected: no evidence-backed alternative number offered; noted as a soft caveat rather than a plan defect |

### Whole-Plan Consistency Sweep
- Re-read `plan.md` and all 10 `phase-*.md` files after applying the 21 accepted findings.
- Confirmed zero remaining `scratchpad/` references (all repointed to `research/`).
- Confirmed `Breadcrumb`/`ProductCard`/`SectionTitle` now appear as "Create" only in Phase 4; every other phase referencing them says "Reuse ... (Phase 4)".
- Confirmed `SearchOverlay.tsx` and subscribe-input mentions removed from Phase 4's Architecture, Related Code Files, Implementation Steps, Todo, and Security Considerations sections (all five needed the same fix, not just the summary bullet).
- Confirmed the "9 estimated prices" hardcoded figure was removed from all three locations it appeared (plan.md Key Risks, phase-03 Todo List, phase-03 Risk Assessment) and reworded consistently to "count per `research/crawl-report.md`".
- Confirmed the "Responsive + tsc" step wording was updated consistently across Phases 5, 6, 7, 8, 9 to the same "quick mobile sanity check, Phase 10 owns the full sweep" phrasing.
- Confirmed Phase 1's duplicate step-9 numbering (introduced by the spike-verify insert) was fixed and renumbered through step 14.
- No unresolved contradictions found. Plan is internally consistent and ready for implementation.
