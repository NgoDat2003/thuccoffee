# Deviations from the Original Site

This project is a static React clone of `thuccoffee.com.vn`, built from a
one-time crawl and a fixed set of downloaded assets. The visual-parity update
completed on 2026-07-17 closes the known shared-shell, route, content, and media
gaps. The differences below remain intentional.

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

## No Backend or Account Services

- No real cart, checkout, payments, or member accounts exist. Order CTAs use
  the hotline or source-linked external delivery channels.
- `/account/login` is UI-only: no authentication, session, or protected routes.
  The page carries a visible disclosure and clears submitted values locally.
- The contact form performs client-side validation and shows a demo toast;
  nothing is transmitted. Footer newsletter and mobile search forms are also
  non-submitting UI shells.
- Header search controls do not provide search results.
- No embedded Facebook Messenger chat widget is included. Delivery links open
  the externally hosted Zalo/Messenger order destination instead.

## Snapshot Content Limitations

- The clone does not sync with the live site. Products, prices, promotions,
  jobs, store details, policies, and images reflect the committed crawl.
- The one-time blog crawl stores 267 `BlogPost` listing records in
  `src/data/blog.ts`; they contain metadata only. `src/data/blog-content.ts`
  stores full sanitized HTML keyed by slug and is lazy-loaded only on detail
  pages. The database
  seed imports both sources to populate `blog_posts.content`; this does not
  make the planned content API available.
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
