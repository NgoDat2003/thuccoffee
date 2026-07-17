---
name: project-thuccoffee-clone-provenance
description: Data provenance rules for the thuccoffee static clone project — what counts as a verified source vs a fabricated fact
metadata:
  type: project
---

Thức Coffee static clone (`d:\work\maycha\thuccoffee`) rebuilds a real, currently-operating
Vietnamese coffee chain's site as hardcoded data. `research/crawl-report.md` is the
authoritative source for products/blog/stores/categories. Because the subject is a real
company, any specific identifying detail (street address, phone, email) that isn't traceable
to `research/` is a misinformation/impersonation risk, not just a nitpick — this was already
red-teamed once (see phase-03-data-layer.md's "Security Adversary" fixes) and the constraint
was scoped narrowly to "street address" — but the same logic applies to ANY specific contact
identifier, including emails.

**Why:** Phase 3 review found `info.thuccoffee247@gmail.com` hardcoded in `src/data/pages.ts`
with no occurrence anywhere in `research/crawl-report.md` or any other plan file — grepped the
whole plan dir, zero hits. The rest of that phase's data (all 42 products, full diff-checked)
was transcribed with zero errors, and the `stores.ts` full-address/phone data was honestly
disclosed as sourced from an uncommitted scratchpad `homepage.html` (legitimate, just needs to
be committed to `research/` for audit trail). The email had no disclosed source at all.

**How to apply:** When reviewing future phases of this project (menu pages, static pages,
contact forms, footer, etc.), grep any specific contact detail (email, phone, address, social
handle) against `research/*.md` and `research/*.txt` before accepting it as sourced. If a
detail isn't traceable to a committed research file, flag it as Critical even if it "looks
plausible" — plausibility is not verification for a real business's public-facing identity
info. See [[review-workflow-full-diff-over-spotcheck]].
