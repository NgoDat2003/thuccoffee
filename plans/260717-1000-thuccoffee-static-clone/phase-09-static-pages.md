---
phase: 9
title: "static-pages"
status: pending
effort: "3h"
---

# Phase 9: Static Pages

## Context Links
- Routes #6, #9–#14: about, membership, careers, contact, cookie-policy, delivery, login
- Content: `src/data/pages.ts` (Phase 3)

## Overview
- **Priority:** P2
- **Status:** Pending
- Build 7 remaining routes: `/gioi-thieu`, `/chuong-trinh-thanh-vien`, `/tuyen-dung`, `/lien-he`,
  `/chinh-sach`, `/delivery`, `/account/login`. All content-driven or UI-only forms.

## Key Insights
- Copy pulled from `pages.ts` (original Vietnamese-spirit; no fabricated stats/dates).
- Contact + Login = UI-only forms (client validation, toast/no-op submit). No backend.
- Membership page includes 6-Q FAQ accordion. Careers lists sample positions.
- Reuses `SectionTitle`, `Container`, `Breadcrumb`, `getImageUrl` (Phase 4).
- **Login page must visibly disclose it's non-functional (red-team fix — Security Adversary finding: a real-looking email+password form that silently discards input, with only a code comment marking it UI-only, is indistinguishable from a credential-harvesting dark pattern to an actual visitor).** Requirements below make this a hard functional requirement, not a code-comment-only mitigation.
- Toast/success messages app-wide (contact form here + any other) render **static strings only** — never interpolate raw user-typed input (per Phase 4's global no-echo constraint).

## Requirements
### Functional
- Each route renders its section content. Contact form validates (name/email/message) client-side → success toast (static text) on submit, no network call. Login form (email/password) → demo toast/no-op, NO real auth, no protected routes.
- Login page displays a persistent, visible "Demo — không phải đăng nhập thật" banner above the form (not just a code comment); password field has `autocomplete="off"` to discourage browser password-manager save prompts.
- FAQ accordion expands/collapses.
### Non-functional
- Responsive; toast accessible (aria-live).

## Architecture
### Components
- `src/pages/AboutPage.tsx` — brand story, mission, 24/7 commitment (from `pages.about`).
- `src/pages/MembershipPage.tsx` — points system intro + `FaqAccordion` (6 Q&A).
- `src/pages/CareersPage.tsx` — sample job listings (Barista, Store Manager, …).
- `src/pages/ContactPage.tsx` — office info block + `ContactForm`.
- `src/pages/CookiePolicyPage.tsx` — cookie/privacy copy.
- `src/pages/DeliveryPage.tsx` — delivery blurb + promo banner + CTA (hotline / store list).
- `src/pages/LoginPage.tsx` — UI-only login form.
- `src/components/ui/FaqAccordion.tsx` — reusable Q&A accordion.
- `src/components/ui/ContactForm.tsx` — validated form + toast.
- `src/components/ui/Toast.tsx` (or a tiny toast helper/`useToast`) — success message.
- **Data flow:** pages import `pages.ts` copy. Form state local `useState`; validation on submit; success → toast; no persistence.

## Related Code Files
### Create
- `src/pages/AboutPage.tsx`, `MembershipPage.tsx`, `CareersPage.tsx`, `ContactPage.tsx`, `CookiePolicyPage.tsx`, `DeliveryPage.tsx`, `LoginPage.tsx` (all replace Phase 1 stubs)
- `src/components/ui/FaqAccordion.tsx`, `ContactForm.tsx`, `Toast.tsx`
### Reuse
- `SectionTitle`, `Container`, `Breadcrumb`, `getImageUrl`, `PromoBanner` (from home, optional on delivery).

## Implementation Steps
1. `Toast` — minimal success toast (aria-live polite), auto-dismiss.
2. `FaqAccordion` — items `{q,a}[]`, one-open-at-a-time or independent; keyboard toggle.
3. `AboutPage` — render `pages.about` sections + store/logo image.
4. `MembershipPage` — intro + `FaqAccordion(pages.membershipFaq)` (6 Q&A).
5. `CareersPage` — map `pages.jobs` (title, location, blurb); "Ứng tuyển: 1800 6230" CTA.
6. `ContactForm` — fields name/email/message; validate required + email format; submit `preventDefault` → clear + show Toast "Đã gửi (demo)". No fetch.
7. `ContactPage` — office info block (`pages.contact`) + `ContactForm`.
8. `CookiePolicyPage` — render `pages.cookiePolicy`.
9. `DeliveryPage` — blurb + promo image + CTA buttons (`tel:` / `/cua-hang`).
10. `LoginPage` — visible banner "Demo — không phải đăng nhập thật" above the form; email + password (`autocomplete="off"`) inputs + "Đăng Nhập" button; submit no-op/demo Toast (static text). No auth, no redirect, no protected routes.
11. Quick mobile sanity check (~375px, not the full sweep — Phase 10 owns that) + `tsc --noEmit`.

## Todo List
- [ ] `Toast` + `FaqAccordion` + `ContactForm`
- [ ] `AboutPage`
- [ ] `MembershipPage` (6-Q FAQ)
- [ ] `CareersPage` (sample jobs)
- [ ] `ContactPage` (info + validated form)
- [ ] `CookiePolicyPage`
- [ ] `DeliveryPage` (promo + CTA)
- [ ] `LoginPage` (UI-only)
- [ ] Responsive + tsc clean

## Success Criteria
- [ ] All 7 routes render meaningful Vietnamese content.
- [ ] Contact form: empty/invalid email blocked; valid submit → success toast, no network.
- [ ] Login submit is a no-op/demo toast; no auth state, no protected routes exist; visible "demo only" banner present and password field has `autocomplete="off"`.
- [ ] FAQ accordion expands/collapses all 6 items.
- [ ] No fabricated stats/dates in about/membership copy.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Form scope creep (real submission) | Med | Low | Hard scope: client validation + toast only; documented non-goal. |
| Invented facts in original copy | Med | Med | Keep copy generic (values/commitment), no specific numbers/dates. |
| Login mistaken for real auth | Low→**Med, mitigated back to Low by visible banner** (re-assessed — red-team fix, Security Adversary finding: a code comment alone is invisible to end users) | Med | Visible on-page "demo only" banner (not just a code comment) + `autocomplete="off"`; no auth store, no route guards anywhere. |

## Security Considerations
- No credentials stored/sent. Password field `type="password"`, `autocomplete="off"`, never persisted/logged. Email validation client-side only (no injection surface). No `dangerouslySetInnerHTML`. Toast/success messages are static strings only — never interpolate raw form input (global constraint, Phase 4).

## Next Steps
- Phase 10 QA covers all these routes + meta tags.
