# Deviations from the Original Site

This project clones `thuccoffee.com.vn` from a one-time crawl. It began as a
static React SPA; since then a backend (Express + Postgres + MinIO) and an admin
CMS were added, and the public pages for products, blog, stores, banners, site
settings, and categories now read from the API. The visual-parity update
completed on 2026-07-17 closed the known shared-shell, route, content, and media
gaps. The differences below remain intentional.

Scope decision (2026-07-23): the target is functional parity for the **public
site currently in use**, plus an admin able to manage all public data. Public
member accounts, cart/checkout/payment, legacy StaticText CMS, and multi-role
admin are explicitly out of scope — see
`plans/reports/260723-thuccoffee-full-functional-parity-audit.md` §13.

## Implemented Parity Scope

- Shared header, mobile drawer, menu mega-menu, full-bleed home banner, footer,
  cookie banner, product cards, and floating order control follow the crawled
  layout and responsive breakpoints.
- Menu routing supports the 10 source-shaped category URLs under `/menu/*` and
  keeps the 42 product-detail URLs distinct from category URLs.
- All 42 product details use downloaded full-resolution primary images. Source
  descriptions are included where available; 11 prices unavailable in the
  crawl remain explicitly marked as estimates in `src/data/products.ts`.
- `/cua-hang` renders the first crawled branch as the default detail view. All
  7 branch URLs render branch-specific contact data, maps, selectors, and
  5-image galleries.
- Blog pagination supports the source-shaped `/chuyen-cua-thuc/t1p1` through
  `/chuyen-cua-thuc/t1p54` URLs with 267 static posts: pages 1–53 contain five
  posts and page 54 contains two.
- About, membership, careers, contact, delivery, and cookie-policy pages render
  the crawled copy and available local images. The contact form includes the
  source Name, Email, Phone, and Content fields.

## Backend Present; No Commerce or Public Accounts

- A backend exists (`server/`): public read API, JWT admin auth, and admin CRUD
  for products, categories, blog, stores, banners, and site settings. Public
  pages for those resources read from the API; images are served from MinIO
  via the `/media` proxy.
- No real cart, checkout, payments, or public member accounts exist — by scope
  decision, not as a gap. Order CTAs use the hotline or source-linked external
  delivery channels.
- `/account/login` is UI-only: no authentication, session, or protected routes.
  The page carries a visible disclosure and clears submitted values locally.
- The contact form performs client-side validation and shows a demo toast;
  nothing is transmitted. Footer newsletter and mobile search forms are also
  non-submitting UI shells. (Real search and submission persistence are planned
  in `plans/260723-public-parity-cms-completion/`.)
- Header search controls do not provide search results.
- No embedded Facebook Messenger chat widget is included. Delivery links open
  the externally hosted Zalo/Messenger order destination instead.

## Snapshot Content Limitations

- The clone does not sync with the live site. Products, prices, promotions,
  jobs, store details, policies, and images reflect the committed crawl.
- The one-time blog crawl stored 267 `BlogPost` records in `src/data/blog.ts`
  and full sanitized HTML in `src/data/blog-content.ts`. The database seed
  imports both sources into `blog_posts`, and the public blog pages now read
  from the blog API. The static files remain only as the seed source; static
  pages (about, membership, careers, contact, delivery, cookie policy) still
  render from `src/data/pages.ts` until the static-page CMS lands.
- 456 live source images were downloaded locally. Eighteen dead source image
  URLs use the existing logo placeholder; the local blog image set is about
  344 MB.
- No crawler or crawler dependency runs in the application. The committed
  records and images are a fixed snapshot and do not refresh at runtime.
- Five products had no captured source description and intentionally omit the
  description. Eleven products had no captured price and retain category-based
  estimated prices with `priceEstimated: true`.
- The cookie-policy copy is reproduced from the source and mentions services
  such as accounts, commerce, newsletters, and analytics. Those references
  describe the source policy; this static clone does not implement those
  services.

## Intentionally Omitted Legacy Fields

Per the 2026-07-23 scope decision, some source-admin fields were deliberately
not cloned because no public consumer uses them:

- **Right banner**: the `right` type stays valid in the schema and admin, but
  no public renderer exists and no data is seeded — legacy-inactive until a
  real placement is confirmed on the source.
- **Blog category/tags/featured**: the public blog reads priority + date only;
  taxonomy fields would have no consumer.
- **Product old-price, tags, per-role media galleries**: not rendered by the
  current public detail template.
- **Stickers table and product stickers**: Consolidated (2026-07-24). The database audit showed the stickers table was completely empty/obsolete. Product badges are instead derived directly from presentation categories (`san-pham-moi`, `yeu-thich-nhat`) using the new `categories.badge_color` field.
- **Product detail HTML (`detail_html`)**: Omitted. The live site's product detail pages only render plain text descriptions (or the HTML field was empty/obsolete), so product descriptions are stored and rendered as plain text rather than structured HTML fields.
- **Legacy StaticText (~100 UI strings), analytics/SMTP/counter settings**: UI
  microcopy stays in code; secrets stay in the environment.

## External and Local-Only Behavior

- Store maps are Google Maps embeds and require network access to display.
- Cookie acceptance is stored only in the browser's `localStorage`. If storage
  is unavailable, the banner can appear again on a later visit.
- Social, delivery, telephone, and email links leave the static application or
  invoke the corresponding device handler.

## Technical Constraint

- The origin's HTTPS certificate is mismatched and serves a certificate for an
  unrelated domain. Source content and media were fetched over plain HTTP. The
  clone itself is a static build and can be deployed behind normal HTTPS.
