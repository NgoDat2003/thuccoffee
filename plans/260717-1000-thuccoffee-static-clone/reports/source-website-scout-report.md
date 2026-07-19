---
title: THỨC Coffee source website scout report
source: http://www.thuccoffee.com.vn
scanned_at: 2026-07-17
scope: Source website only; no clone comparison
---

# THỨC Coffee Source Website Scout Report

## Summary

Live source scan complete. Reachable graph is much larger than top navigation: **404 observed URL variants**, normalized into **400 content paths**. Normalized results: **392 HTTP 200**, **8 HTTP 500**. Route queue exhausted.

The source is an ASP.NET MVC 5.2 / IIS 10 site. Real content is served over HTTP. Chromium secure-first behavior upgrades HTTP to HTTPS, where the host returns invalid-certificate / Not Found behavior. Route and content truth therefore comes from direct live HTTP responses; rendered checks used Chromium with HTTPS-first disabled or a read-only local pass-through.

No local clone source was inspected or compared in this phase.

## Method

- Recursive same-origin crawl from `/`, following all internal anchors until queue empty.
- Direct verification of search patterns, sitemap, robots, status codes, headings, visible text, assets, stylesheets, scripts and forms.
- Representative rendered checks at desktop `1440px`, tablet `768px`, and mobile `375px`.
- Static accessibility checks on 12 primary templates.
- CSS/JS reverse inspection for breakpoints, geometry, carousels, lightbox, search and POST endpoints.

## Route Inventory

| Family | Normalized paths | Template detail |
|---|---:|---|
| `/chuyen-cua-thuc` | 322 | 1 listing, 54 pagination paths, 267 story details |
| `/menu` | 61 | 1 listing, 13 category paths, 47 product details |
| `/cua-hang` | 8 | 1 default selected-store view, 7 store details |
| `/account` | 2 | Login, forgot password |
| Other | 7 | Home, About, Membership, Recruitment, Contact, Delivery, Cookie policy |
| **Total** | **400** | **392 working, 8 server errors** |

Observed request variants total 404 because query-tracking and slash variants duplicate normalized paths. No canonical tags were found.

### Stories

- Listing: `/chuyen-cua-thuc/`.
- Pagination: `/chuyen-cua-thuc/t1p1/` through `/chuyen-cua-thuc/t1p54/`.
- Pages 1–53 expose five cards each; page 54 exposes two.
- `/chuyen-cua-thuc/` and `/chuyen-cua-thuc/t1p1/` have identical visible content.
- Detail pattern: `/chuyen-cua-thuc/{slug}-s{id}t2/`.
- Detail content: H1/title, publication date, rich article body, images, related/promotion sidebar.

### Menu

Working categories:

- `/menu/san-pham-moi-t5p1s549/` — 16 cards.
- `/menu/yeu-thich-nhat-t5p1s548/` — 19 cards.
- `/menu/mango-breeze-t1p1s1470/` — 3 cards.
- `/menu/cold-brew-origins-t1p1s1408/` — 3 cards.
- `/menu/coffee-t1p1s494/` — 12 cards.
- `/menu/non-coffee-t1p1s138/` — 4 cards.
- `/menu/tea-t1p1s123/` — 8 cards.
- `/menu/milk-tea-t1p1s139/` — 3 cards.
- `/menu/blended-t1p1s119/` — 5 cards.
- `/menu/cake-t1p1s136/` — 4 cards.

These expose 42 unique working product details. Product detail pattern: `/menu/{slug}-s{id}t2/`. Detail content includes name, description, price, order hotline, back link, main/extended images and related products.

Broken historical routes linked from old stories:

- `/menu/banh-trung-thu-t1p1s587/`
- `/menu/banh-trung-thu-t1p1s763/`
- `/menu/christmas-collection-t1p1s649/`
- `/menu/christmas-vanilla-peppermint-s652t2/`
- `/menu/combo-christmas-vanilla-peppermint-frozen-cake-s653t2/`
- `/menu/combo-frozen-blue-ocean-frozen-cake-s654t2/`
- `/menu/frozen-blue-ocean-s651t2/`
- `/menu/frozen-cake-s650t2/`

All eight normalized paths return HTTP 500. One tracking-query variant produces a ninth observed 500 request.

### Stores

`/cua-hang/` is not a pure index. It is the selected detail for 40D Lý Tự Trọng and duplicates that detail's visible content. Seven branches are present:

- 40D Lý Tự Trọng
- Đường 41
- 42 Cống Quỳnh
- 42 Hoa Phượng
- 45 Nguyễn Oanh
- 320 Nguyễn Thái Sơn
- 37 Lý Tự Trọng

Each template contains branch name, address, phone, irregular mixed-ratio gallery, Google Maps iframe and the seven-branch selector.

### Static and account pages

| Path | Content anatomy |
|---|---|
| `/` | Hero, featured products, promotion, stories, stores, gallery |
| `/gioi-thieu/` | 24/7 brand story, large square image, rich text |
| `/chuong-trinh-thanh-vien/` | Benefits, point rules, tiers, birthday rule, FAQ accordion, support |
| `/tuyen-dung/` | Campaign image, roles, shifts, locations, application guidance |
| `/lien-he/` | Office details and Name/Email/Phone/Content contact form |
| `/delivery/` | 24/7 delivery policy, hotline, Zalo/Messenger CTAs, promotions |
| `/chinh-sach/` | Cookie policy; both slash and no-slash variants work |
| `/account/login/` | Email, password, remember-me, forgot password |
| `/account/forgot-password/` | Email recovery form |

## Search and Action Paths

- Product/blog search: `/search/p1/?type={Product|Blog}&keyword={query}`.
- Blog pagination: `/search/t3p{n}/?type=Blog&keyword={query}`.
- Verified `coffee` blog search returns 20, 20 and 2 results on pages 1–3.
- `/search/p1/` and `/search/t3p1/` are duplicate first-page views.
- POST-only endpoints discovered but not submitted:
  - `/api/subscribe`
  - `/api/contact`
  - `/account/Login?ReturnUrl=%2F`
  - `/account/forgot-password`
  - `/account/LogOff`
- No live cart or registration control was found on Home, Menu or Login markup despite unused cart CSS existing in the bundle.

## Visual System

### Global tokens

- Body: Roboto, `16px`, weight 400, line-height `24px`.
- Primary title: `24px/28.8px`, weight 500.
- Medium title: `20px/24px`, weight 500.
- Small/story title: `18px`; story listing uses weight 600.
- Product price: `20px/30px`, weight 500.
- Primary blue `#0c5278`; text `#292929`; page `#f5f5f5`; white `#fff`.
- Brown hover `#40260a`; store blue-gray `#79a3b1`; selected gold `#fcb934`.
- Borders `#ccc`, control border `#d7dbdb`, muted date `#959595`.
- Main container `.gb-page-width`: `1170px` including 15px gutters; usable width `1140px`.
- Primary custom responsive boundary: `767/768px`. Bundle also contains 576, 992 and 1200 Bootstrap breakpoints.
- Important mismatch: CSS switches below 768px; JS defines mobile as `innerWidth < 755`. Widths 755–767px can receive mobile CSS with desktop JS.

### Shared layout

- Desktop header: fixed white bar, 82px, 70px visible logo, uppercase 16px navigation, 35px item gaps, blue 3px active underline.
- Mobile intended header: fixed 50px blue bar, hamburger and search; drawer fills viewport below 50px.
- Footer: desktop three columns 25/50/25, coffee-divider, open time/contact, links/social; mobile hides the full top part and keeps divider/copyright.
- Standard section spacing: 30px.
- Product card: 5px radius; image 245px desktop / 180px mobile; info 120px; translucent white panel; price blue.
- Hero: Slick, desktop height `viewport - 82px`, mobile intrinsic ratio, 6000ms autoplay.
- Story slider: 3 desktop / 1 mobile, 8000ms autoplay.
- Lightbox: Colorbox, 80% desktop / 100% mobile max dimensions, opacity .8, elastic transition.

### Template geometry

| Template | Desktop | Mobile |
|---|---|---|
| Home | 4 product columns; 3 story slides; 470px store media + 670px selector | 2 product columns; 1 story; stacked stores |
| Menu | 340px category rail + 800px product area; 3 columns | 340×55 selector; 2 product columns |
| Product detail | 445px image + 695px info; main image 415px | info first, then 345px image; 2 related columns |
| Story | 866px main + 274px sidebar | stacked; lead image about 345px square |
| Stores | 620px gallery + 520px map; four-column branch selector | 345px gallery/map; one branch per row |
| Membership | 570/570 split | stacked benefits, FAQ, banners |
| Contact | 60% form + 40% office info | office info first, full-width form |
| Login | centered 600px white card | about 95% viewport width |

## Full Media Inventory

Full-domain media enumeration covered all 400 normalized crawl paths plus two representative search result pages.

- Source pages attempted: 402; successful: 394; non-2xx: the same eight broken Menu paths.
- Unique same-origin media references: **473** from **4,849 discoveries**.
- Extensions: 279 JPG, 184 PNG, 4 GIF, 3 JPEG, 2 SVG, 1 ICO.
- Dimensions captured for 462 assets.
- Ten genuinely missing images return 404. All ten are referenced by the historical story `/chuyen-cua-thuc/🎉-thang-12-–-doi-diem-lien-tay-qua-bay-ve-nha-🎉-s1085t2/`.
- One additional reported 404 is a normalization artifact: `/tuyen-dung/` changes the relative recruitment image into `/tuyen-dung/s-media/...`; the canonical navigation path `/tuyen-dung` resolves the actual `/s-media/a82444c5_post-tuyendung-oct2023.png` asset with 200.
- Shared assets with highest reuse include the logo, coffee divider, delivery icon and favicon.

## Browser and Accessibility Findings

- High: normal Chromium secure-first flow upgrades HTTP to HTTPS and fails. Source is reliably reachable only over HTTP.
- High: at 375px, rendered homepage exposed no usable top navigation/hamburger in the accessibility tree or DOM geometry, despite drawer CSS existing.
- Medium: at 768px, page width exceeded viewport by 15px.
- Medium: contact exposes four unnamed textboxes; no accessible required/placeholder state; “Gửi” is a generic clickable element, not a semantic button.
- Medium: newsletter textbox/submit have no accessible names and invalid email produced no accessible feedback.
- Medium: product share URLs are malformed/obsolete: empty Facebook/Twitter values and removed Google+ endpoint.
- Medium: sampled pages contain many images without alt/title; Home has no H1, Menu has no H1, Membership has two H1s.
- Low: two collection links use `www.thuccoffee.com` instead of `.com.vn`; YouTube footer link resolves to current page plus `#`.
- Confirmed working in sampled browser flows: hero/story carousels, gallery lightbox open/next/close, cookie dismissal persistence, Menu category change, deep-link Back/Forward.
- No broken loaded images or console errors were observed on sampled Home, Menu, Product Detail and Contact routes.
- Contrary to the store template, Contact has no map iframe.

## Sitemap and Source Quirks

- `robots.txt` incorrectly declares `Sitemap: http://www.shop/sitemap.xml`.
- Local `/sitemap.xml` has 48 entries: only `/index` returns 200 and duplicates `/`; the other 47 legacy paths return 404.
- Old sitemap aliases `/about`, `/product`, `/blog`, `/contact` are dead.
- All 43 sitemap `/product/proid/...` paths are dead.
- Raw numeric emoji entities inside some story hrefs can confuse naïve crawlers into false truncated routes.
- No canonical URLs are emitted for slash/query duplicates.

## Evidence Files

- `thuccoffee-site-crawl.json` — 400 normalized pages with status, title, headings, internal links and visible text.
- `source-route-manifest.csv` — one row per normalized path with template classification and content lead.
- `thuccoffee-sitemap-route-check.json` — all 48 sitemap entries and live status.
- `source-a11y-static-check.json` — template-level H1, image-name and form-label counts.
- `source-full-media-manifest.json` — 473 media references, discovery sources, statuses, sizes and dimensions.
- `thuccoffee-site-crawl.ps1` — reproducible HTTP crawler.
- Browser screenshots are stored in the thread visualization directory.

## Unresolved Questions

- Search keywords are unbounded; route shape and representative results are verified, not every possible keyword.
- POST forms were not submitted to production.
- Authenticated-only behavior was not tested.
- Source bugs are documented as observed; whether the clone should reproduce or correct them must be decided during clone comparison.


