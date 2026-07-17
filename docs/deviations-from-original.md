# Deviations from the original site

This is a static clone of thuccoffee.com.vn built from a one-time crawl. The
following differences from the original are intentional, not bugs.

## No backend
- No real cart, checkout, payments, or member accounts. Order CTAs link to
  the hotline (`tel:18006230`) or a store page, matching the original's own
  "call to order" pattern (the original also had no cart).
- Login page (`/account/login`) is UI-only: no real authentication, no
  session, no protected routes. Carries a visible on-page disclosure.
- Contact form and newsletter inputs are client-side only; nothing is sent
  anywhere.
- No Facebook Messenger chat widget (required a real Facebook Page ID tied
  to the business).

## Content
- **Blog article bodies**: the source site's blog posts have no separate
  article body in the crawled markup, only a short summary shown on the
  index. The detail page reuses that summary as the body, compensated with
  a larger cover image and a related-posts strip.
- **Product prices**: some products (see `research/crawl-report.md`) had no
  price in the crawled category view. Those carry an estimated price
  (flagged `priceEstimated: true` in `src/data/products.ts`) based on their
  category's typical range.
- **Product full-resolution images**: the crawl only discovered a full-res
  image URL for one product (`berry-mango`). All other products' detail
  pages show the same thumbnail used in the grid, scaled up.
- Static page copy (About, Membership FAQ, Careers, Cookie Policy) is
  original writing in the spirit of the source, not transcribed — the
  crawl didn't capture full prose for these pages. No invented statistics
  or dates. The contact page uses only the real hotline and email found in
  the source; no street address is shown since one wasn't verifiable
  against committed crawl data.

## Behavior
- Search icon in the header is decorative (no results backend exists).
- Newsletter subscribe inputs from the original were dropped rather than
  built as inert no-ops (a non-functional input is worse UX than omitting
  it).

## Technical
- Origin's HTTPS certificate is mismatched (serves a certificate for an
  unrelated domain). This clone was built entirely from content fetched
  over plain HTTP from the origin; the clone itself is a static site with
  no such issue once deployed normally.
