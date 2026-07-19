---
phase: 6
title: "Static page content rewrite"
status: completed
effort: "4h"
priority: P1
---

# Phase 6: Static page content rewrite

## Context Links

- Gap audit P1 §7 (static pages are shortened/self-written) — `clone-website-gap-audit.md`
- Static page anatomy — `source-website-scout-report.md` §"Static and account pages"
- Real verbatim copy — `thuccoffee-site-crawl.json` (about, membership, careers, contact, delivery, cookie policy pages — confirmed complete/untruncated)
- Current placeholder copy — `src/data/pages.ts:12-88`

## Overview

**Priority:** P1. **Status:** completed. **Depends on:** phase 1.

Replace the paraphrased/placeholder copy in `pages.ts` with the **real crawled text verbatim** for the 6 static pages, and add the missing Phone field to the contact form. The prior plan deliberately paraphrased and used a generic city location to avoid fabricating; the real content and the real office address are now legitimately sourced from the crawl, so using them is correct — this phase calls that out so it doesn't look like the earlier no-fabrication constraint was violated.

## Key Insights

- **Address change is legitimate, not a violation.** `pages.ts:80-87` intentionally used only `TP.HCM, Việt Nam` with a comment ("no invented street address"). The real address `40D Lý Tự Trọng, P.Sài Gòn, TP.HCM` is now sourced from the crawl → legitimate to use. Update the comment to reflect it's now sourced.
- Contact form (`ContactForm.tsx:6-9`) has name/email/message — **missing Phone**. Source form is Name/Email/Phone/Content. Add a Phone field + include it in the required-field validation (`ContactForm.tsx:16`).
- Membership needs the full structure: intro + `10.000đ = 1 point` rule + 4-tier table (MEMBER / BẠC 5% / VÀNG 10% / KIM CƯƠNG 15%) with maintenance conditions + the full 6-question FAQ with real answers (incl. Zalo registration steps). Current FAQ (`pages.ts:22-47`) is paraphrased — replace with real answers.
- Careers needs real roles (Phục vụ / Pha chế / Thu ngân / Bảo vệ) + 3 shifts (7-15 / 15-23 / 23-7) + districts (Q1 / Q4 / Phú Nhuận / Gò Vấp) + apply link. Current `jobs` (`pages.ts:49-65`) is generic — replace.
- Delivery needs FREESHIP (≥70k under 3km) + Zalo/Messenger order CTAs + discount codes FBFRSHIP & FBKHAO20 (20%, max 50k). Current `delivery` (`pages.ts:67-70`) is a one-liner — expand.
- Cookie policy needs the full real text (`pages.ts:72-78` is 2 short paragraphs).
- About needs the 24/7 brand story verbatim + the already-local `698435b6_thuc-duong41.jpg` image rendered (audit: local but not rendered).

## Requirements

Functional (per page, verbatim from crawl):
- **about** — 24/7 brand story + large image (`698435b6_thuc-duong41.jpg`).
- **membership** — intro + point rule + 4-tier table w/ maintenance conditions + full 6-Q FAQ (real answers incl. Zalo steps) + the two already-local images rendered.
- **careers** — real roles + 3 shifts + districts + apply link.
- **contact** — real office `40D Lý Tự Trọng, P.Sài Gòn, TP.HCM` + Name/Email/**Phone**/Content form + 60/40 grid.
- **delivery** — FREESHIP policy + Zalo/Messenger CTAs + FBFRSHIP & FBKHAO20 codes + `249fc9a9_post-17042023.png` image.
- **cookie policy** — full real text.

Non-functional: verbatim source text (no paraphrase, no fabrication); structured data in `pages.ts` (not hardcoded in JSX) where it fits the existing shape (DRY).

## Architecture

Data flow: crawl JSON page text → `pages.ts` structured fields → page components render. Extend `pages.ts` shapes where needed: add `tiers` (membership), expand `jobs` (add shift/district/applyLink), expand `delivery` (freeship, channels, codes), add `phone` handling to contact block. Page components (`MembershipPage`, `CareersPage`, `DeliveryPage`, `ContactPage`, `AboutPage`, `CookiePolicyPage`) render the richer data — grid split 60/40 for contact, 570/570 for membership per source geometry (`source-website-scout-report.md` §Template geometry).

`ContactForm` gains a Phone input (controlled state + required validation), matching source's Name/Email/Phone/Content.

## Related Code Files

Modify:
- `src/data/pages.ts:12-88` — replace all 6 blocks with verbatim crawl content; add membership `tiers` + point rule, real FAQ answers, careers shifts/districts/applyLink, delivery freeship/channels/codes, contact real address + phone. Update the contact comment (address now sourced).
- `src/data/pages.ts` interfaces (`FaqItem:1-4`, `JobListing:6-10`) — extend `JobListing` (shift, district, applyLink); add a `Tier` interface for membership.
- `src/components/ui/ContactForm.tsx:6-31,34-79` — add Phone field (state, input, required validation).
- `src/pages/AboutPage.tsx` — render brand story + `698435b6_thuc-duong41.jpg`.
- `src/pages/MembershipPage.tsx` — render intro + point rule + 4-tier table + real FAQ + 2 local images.
- `src/pages/CareersPage.tsx` — render roles + shifts + districts + apply link.
- `src/pages/ContactPage.tsx` — 60/40 grid + real office; Phone via updated form.
- `src/pages/DeliveryPage.tsx` — freeship + Zalo/Messenger CTAs + discount codes + `249fc9a9_post-17042023.png`.
- `src/pages/CookiePolicyPage.tsx` — full real text.

Create: none (extend existing data + pages). Extract a `MembershipTierTable.tsx` only if `MembershipPage` exceeds 200 lines.

## Implementation Steps

1. Pull verbatim text for each of the 6 pages from `thuccoffee-site-crawl.json` (confirmed complete). Keep Vietnamese copy exact incl. diacritics.
2. Extend `pages.ts` interfaces (`JobListing` + new `Tier`) and replace all 6 content blocks with sourced text; update the contact comment to note the address is now sourced (not fabricated).
3. Add Phone to `ContactForm` (state + input + include in required validation at `ContactForm.tsx:16`).
4. Rewrite the 6 page components to render the richer data at source geometry (contact 60/40, membership tiers table, careers shift/district blocks, delivery CTAs + codes).
5. Wire the already-local images (about, membership ×2, delivery) so they render.
6. `npm run build` + `npm run lint`.

## Todo List

- [x] Extract verbatim text for 6 pages from crawl JSON
- [x] Extend `JobListing` + add `Tier`; replace all 6 blocks in `pages.ts`
- [x] Update contact comment (address now sourced, not fabricated)
- [x] Add Phone field to `ContactForm` + required validation
- [x] Rewrite 6 page components at source geometry
- [x] Render already-local images (about / membership×2 / delivery)
- [x] build + lint

## Success Criteria

- [x] All 6 static pages show verbatim source content (about story, 4-tier membership + point rule + full FAQ, careers roles/shifts/districts/apply, delivery freeship + Zalo/Messenger + FBFRSHIP/FBKHAO20, full cookie policy).
- [x] Contact shows real `40D Lý Tự Trọng, P.Sài Gòn, TP.HCM` + Name/Email/Phone/Content form + 60/40 grid.
- [x] Previously-local-but-unrendered images now render (about, membership ×2, delivery).
- [x] build + lint pass.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Address change looks like the earlier no-fabrication rule was broken | Low | Low | It's sourced from the crawl — legitimate. Call it out in the code comment + here so intent is clear. |
| Vietnamese diacritics mangled on copy | Med | Med | Copy verbatim from crawl JSON; verify rendered text in phase 7 (audit noted PowerShell mojibake ≠ UI bug). |
| Membership tier table overflows `MembershipPage` past 200 lines | Low | Low | Extract `MembershipTierTable.tsx` if needed. |
| Phone field breaks existing contact validation flow | Low | Med | Add to the same required check; keep email-regex behavior; verify submit still shows the demo toast. |

## Security Considerations

Contact/subscribe forms remain client-only demos (no POST) matching source; do not wire real endpoints (YAGNI). No PII is transmitted.

## Next Steps

Independent of phases 2-5. Phase 7 verifies all 6 pages render sourced content at correct geometry.
