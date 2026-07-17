---
phase: 7
title: "blog-pages"
status: pending
effort: "1.5h"
---

# Phase 7: Blog Pages

## Context Links
- Blog index/detail: task brief routes #4, #5
- Data: `src/data/blog.ts` (5 posts, Phase 3)

## Overview
- **Priority:** P2
- **Status:** Pending
- Build `/chuyen-cua-thuc` (5-card grid) and `/chuyen-cua-thuc/:slug` (post detail using summary as body).

## Key Insights
- Only 5 posts, promotional. Card = cover + title + summary.
- **No article body available from source** → detail reuses `summary` as body content. Add ONE terse code comment (no plan refs) noting summary-as-placeholder.
- **Layout for thin content (red-team fix — Assumption Destroyer finding):** a 1-2 sentence summary alone on a full detail-page layout reads as broken next to the original site's full articles. Compensate with a larger cover image (full-width, taller aspect) + a "Related posts" strip (other 4 blog cards) below the summary, so the page doesn't look empty. Decide this now, not during Phase 10 QA.
- Reuses `SectionTitle`, `Breadcrumb`, `Container`, `getImageUrl` (Phase 4).

## Requirements
### Functional
- Index grid links each card to detail; detail resolves by `:slug`, shows cover + title + body(summary) + breadcrumb + back.
- Unknown slug → NotFound/redirect.
### Non-functional
- Responsive grid (3/2/1 col by breakpoint).

## Architecture
- `src/pages/BlogIndexPage.tsx` — `blog.map(BlogCard)`.
- `src/pages/BlogDetailPage.tsx` — `useParams().slug` → `getBlogBySlug`; render cover, title, body(summary), breadcrumb, "Trở Lại".
- `src/components/blog/BlogCard.tsx` — cover + title + truncated summary, links to detail. (Home `BlogCarousel` may reuse this.)
- **Data flow:** index imports `blog[]`; detail looks up by slug.

## Related Code Files
### Create
- `src/pages/BlogIndexPage.tsx` (replace stub), `src/pages/BlogDetailPage.tsx` (replace stub)
- `src/components/blog/BlogCard.tsx`
### Reuse
- `SectionTitle`, `Breadcrumb`, `Container`, `getImageUrl`.

## Implementation Steps
1. `BlogCard` — cover (`getImageUrl(post.cover)`), title, summary (line-clamp), `Link` to `/chuyen-cua-thuc/:slug`.
2. `BlogIndexPage` — `SectionTitle "Chuyện của Thức"` + grid of 5 `BlogCard`.
3. `BlogDetailPage` — resolve slug; NotFound if missing; breadcrumb (Home > Chuyện của Thức > title), large cover, `<h1>`, body = summary (terse comment: body unavailable, summary used), related-posts strip (other 4), back button.
4. Quick mobile sanity check (~375px, not the full sweep — Phase 10 owns that) + `tsc --noEmit`.

## Todo List
- [ ] `BlogCard`
- [ ] `BlogIndexPage` (5-grid)
- [ ] `BlogDetailPage` (large cover + summary-as-body + comment + related strip)
- [ ] Unknown-slug handling + responsive + tsc clean

## Success Criteria
- [ ] Index shows 5 cards with covers, links to details.
- [ ] Detail resolves each source slug; renders cover + title + body.
- [ ] Back button works; unknown slug handled.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Blog body = summary (thin content)** | High | Low | Documented limitation (terse comment); acceptable for static clone. |
| Emoji in slug breaks routing | Med | Med | Slugs stored verbatim but URL-safe; if emoji present, strip/encode in `blog.ts` slug (keep title with emoji, slug clean). |
| Cover image missing | Low | Low | `getImageUrl` placeholder fallback. |

## Security Considerations
- Summary rendered as plain text (no `dangerouslySetInnerHTML`). No user input.

## Next Steps
- Phase 10 QA verifies blog deep-links.
