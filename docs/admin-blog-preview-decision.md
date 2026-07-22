# Admin blog preview sanitizer decision

- Date: 2026-07-22
- Baseline FE bundle: `161.18 kB gzip`.
- Direct BE sanitizer import: `226.80 kB gzip` (`+65.62 kB`), exceeding the plan's `50 kB` threshold.
- Decision: use authenticated `POST /api/admin/blog/preview`; the server calls the same `sanitizeBlogContent` used on writes. The FE renders only returned sanitized HTML, then resolves `blog-asset:` URLs.
- Bundle after endpoint fallback: `163.13 kB gzip` (`+1.95 kB` from baseline).