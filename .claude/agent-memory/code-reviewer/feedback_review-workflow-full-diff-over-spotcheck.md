---
name: review-workflow-full-diff-over-spotcheck
description: When asked to spot-check N of M records against a source table, write a quick script to diff all M instead — cheap and catches more
metadata:
  type: feedback
---

When a review task asks to "spot-check 8-10 of 42 records" against a structured source (e.g.
a markdown table), prefer writing a small Python/bash script to parse both the source table and
the generated code, then diff every field across all records — not just a manual sample.

**Why:** For the thuccoffee project's Phase 3 data-layer review, a full programmatic diff of all
42 products against `crawl-report.md` took one script call and surfaced the exact 3 rows
affected by the `cold-brew` → `cold-brew-origins` fix with certainty, plus confirmed zero
transcription errors elsewhere — something a manual 8-10 sample could easily have missed or
under-verified. This was not corrected/requested by the user; it was a self-directed choice
that produced a stronger, fully-certain finding instead of a probabilistic one.

**How to apply:** Whenever source data is tabular/structured (markdown tables, CSV-like data,
JSON) and the generated code has parseable literal fields (string literals, array literals),
default to a full automated diff over manual spot-checking, as long as the record count is
small enough (tens to low hundreds) that a quick regex-based parse is reliable. Fall back to
manual sampling only for unstructured prose or when field extraction via regex would be too
fragile to trust.
