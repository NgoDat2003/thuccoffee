---
phase: 8
title: "store-pages"
status: pending
effort: "1.5h"
---

# Phase 8: Store Pages

## Context Links
- Store list/detail: task brief routes #7, #8
- Data: `src/data/stores.ts` (7 stores, Phase 3)
- Map embed: `https://maps.google.com/maps?q={url-encoded address}&output=embed` (no API key)

## Overview
- **Priority:** P2
- **Status:** Pending
- Build `/cua-hang` (7 store cards) and `/cua-hang/:slug` (detail + Google Maps embed).

## Key Insights
- 7 stores: name, slug, address, phone (default hotline), image, `store.hours` (Phase 3 field, value "Mở cửa 24/7" for all 7 — **render via `{store.hours}` interpolation, not a hardcoded literal string**, so the type/data field isn't dead weight — red-team fix, Scope Critic finding).
- Map embed = free `output=embed` iframe, no API key — `q` = `encodeURIComponent(address)`.
- Reuses `SectionTitle`, `Breadcrumb`, `Container`, `getImageUrl` (Phase 4).

## Requirements
### Functional
- List grid links to detail; detail shows name, full address, phone (`tel:`), "Open 24/7", image, working map iframe.
- Unknown slug → NotFound/redirect.
### Non-functional
- Responsive grid; iframe responsive (aspect-ratio box).

## Architecture
- `src/pages/StoreListPage.tsx` — `stores.map(StoreCard)`.
- `src/pages/StoreDetailPage.tsx` — `useParams().slug` → `getStoreBySlug`; render info + `MapEmbed`.
- `src/components/store/StoreCard.tsx` — image + name + address + phone, link to detail.
- `src/components/store/MapEmbed.tsx` — `<iframe>` with encoded address `q`.
- **Data flow:** list imports `stores[]`; detail looks up by slug; MapEmbed builds src from `store.address`.

## Related Code Files
### Create
- `src/pages/StoreListPage.tsx` (replace stub), `src/pages/StoreDetailPage.tsx` (replace stub)
- `src/components/store/StoreCard.tsx`, `MapEmbed.tsx`
### Reuse
- `SectionTitle`, `Breadcrumb`, `Container`, `getImageUrl`.

## Implementation Steps
1. `StoreCard` — `getImageUrl(store.image)`, name, address, phone (`tel:`), `Link` to `/cua-hang/:slug`.
2. `StoreListPage` — `SectionTitle "Cửa hàng"` + grid of 7 `StoreCard`.
3. `MapEmbed` — `src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}`, responsive aspect box, `loading="lazy"`, `sandbox="allow-scripts allow-same-origin"` (red-team fix — Security Adversary finding: limit blast radius if the embed endpoint is ever compromised/hijacked).
4. `StoreDetailPage` — resolve slug; NotFound if missing; breadcrumb, name, address, phone, `{store.hours}`, image, `MapEmbed`, back button.
5. **Verify all 7 map iframes now, not deferred to Phase 10 (red-team fix — Assumption Destroyer finding: `output=embed` is an undocumented endpoint that can degrade silently).** If any store's embed fails to load a real location, the fallback is a locally-hosted static screenshot committed under `src/assets/images/stores/` (captured during this phase) — never a live third-party hotlink, which would reintroduce the runtime origin dependency Phase 2 explicitly avoids.
6. Quick mobile sanity check (~375px, not the full sweep — Phase 10 owns that) + `tsc --noEmit`.

## Todo List
- [ ] `StoreCard`
- [ ] `StoreListPage` (7-grid)
- [ ] `MapEmbed` (encoded address, responsive, sandboxed)
- [ ] `StoreDetailPage` (info + `{store.hours}` + map + back)
- [ ] Verify all 7 map iframes load real locations now (not deferred)
- [ ] Unknown-slug handling + responsive + tsc clean

## Success Criteria
- [ ] List shows 7 stores, links to details.
- [ ] Detail resolves each source slug; shows full info + `{store.hours}` (data-driven, not hardcoded).
- [ ] Map iframe renders the store's location (no API key error) for all 7 stores, verified in this phase.
- [ ] Phone is a working `tel:` link.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Map embed shows wrong/none location | Med | Med | Use full "…, HCMC, Vietnam" address for `q`; verify all 7 iframes visually in this phase, not Phase 10. |
| Google embed rate-limits / blocks iframe | Low | Med | `output=embed` is the public no-key format; if blocked, use a locally-hosted static screenshot fallback (committed asset, not a live hotlink). |
| Store image missing | Med | Low | `getImageUrl` placeholder fallback (logo). |

## Security Considerations
- iframe from `maps.google.com` only; add `referrerPolicy="no-referrer-when-downgrade"` and `sandbox="allow-scripts allow-same-origin"`. No user input in `q` (fixed addresses).

## Next Steps
- Phase 10 QA verifies map embeds + store deep-links.
