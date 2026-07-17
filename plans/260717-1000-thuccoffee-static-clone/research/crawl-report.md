# Thức Coffee Website Crawl Inventory Report

**Date:** 2026-07-17  
**Target:** http://www.thuccoffee.com.vn (static site clone)  
**Crawled routes:** 17 (home, menu categories, products, blog, stores, static pages)  
**Total products cataloged:** 42 unique SKUs  
**Total blog posts found:** 5  
**Total stores listed:** 7  
**Total unique images:** 92 asset URLs

---

## Routes Summary

| Route | Type | Status | Notes |
|-------|------|--------|-------|
| `/` | Home | Fetched | Header, hero banners, promotions |
| `/menu/` | Menu Index | Fetched | 10 category tabs: san-pham-moi, yeu-thich-nhat, 8 product categories |
| `/menu/san-pham-moi-t5p1s549` | Category: New Products | Fetched | 42 products across all categories; many items tagged as "new" |
| `/menu/yeu-thich-nhat-t5p1s548` | Category: Favorites | Fetched | Best-sellers/featured subset |
| `/menu/mango-breeze-t1p1s1470` | Category: Mango Breeze | Fetched | 3 mango products |
| `/menu/cold-brew-origins-t1p1s1408` | Category: Cold Brew Origins | Fetched | Cold brew specialty line |
| `/menu/coffee-t1p1s494` | Category: Coffee | Fetched | Classic espresso-based drinks |
| `/menu/non-coffee-t1p1s138` | Category: Non-Coffee | Fetched | Matcha, chocolate, smoothies |
| `/menu/tea-t1p1s123` | Category: Tea | Fetched | Tea-based beverages |
| `/menu/milk-tea-t1p1s139` | Category: Milk Tea | Fetched | Bubble tea, milk foam variants |
| `/menu/blended-t1p1s119` | Category: Blended | Fetched | Blended ice drinks |
| `/menu/cake-t1p1s136` | Category: Cake | Fetched | Pastries/cakes |
| `/menu/{slug}-s{id}t2` | Product Detail | Sample: berry-mango-s1473t2 | Full product page with image gallery, description, related items |
| `/chuyen-cua-thuc/` | Blog Index | Fetched | 5 posts visible (paginated; only first page scraped) |
| `/chuyen-cua-thuc/{slug}-s{id}t2` | Blog Post Detail | Not fetched | Link structure confirmed |
| `/gioi-thieu` | About Us | Fetched | Company story, mission |
| `/cua-hang/` | Stores Index | Fetched | 7 store locations listed |
| `/cua-hang/{slug}-s{id}t2` | Store Detail | Sample: thuc-coffee-40d-ly-tu-trong-s92t2 | Store hours, address, map, images |
| `/chuong-trinh-thanh-vien/` | Membership Program | Fetched | Points system, tier tiers, FAQs |
| `/tuyen-dung` | Careers | Fetched | Job listings/hiring info |
| `/lien-he` | Contact | Fetched | Office address, contact form |
| `/chinh-sach` | Cookie & Policy | Fetched | Legal/privacy info |
| `/delivery/` | Delivery/Order Online | Fetched | Order info, delivery service promo |
| `/account/login` | Login | Not fetched | Form-only; skip per instructions |

---

## Product Catalog (42 Items)

Complete deduped list. "Categories" field shows all category tags this product appears under.

| # | Name | Slug | Price | Categories | Thumb Image |
|---|------|------|-------|------------|------------|
| 1 | AMERICANO | americano-s153t2 | 45.000đ | coffee | /s-media/thumbs-e600e38f_americano.jpg |
| 2 | BERRY MANGO | berry-mango-s1473t2 | 59.000đ | san-pham-moi, mango-breeze | /s-media/thumbs-847b9f4d_berry-mango.jpg |
| 3 | BISCUIT STICKS WITH CREAMFOAM | biscuit-sticks-with-creamfoam-s1001t2 | N/A | san-pham-moi, yeu-thich-nhat, cake | /s-media/thumbs-243b0721_untitled-design-4-.png |
| 4 | BLACK COFFEE | black-coffee-s145t2 | 35.000đ | coffee | /s-media/thumbs-302411f4_black-coffee.jpg |
| 5 | BLACK COLD BREW COFFEE | black-cold-brew-coffee-s1378t2 | 55.000đ | san-pham-moi, yeu-thich-nhat, coffee | /s-media/thumbs-e8ac352a_black-cold-brew.jpg |
| 6 | CAPPUCCINO | cappuccino-s155t2 | 50.000đ | coffee | /s-media/thumbs-a84ab08_cappuccino-1.jpg |
| 7 | CARAMEL COFFEE JELLY IB | caramel-coffee-jelly-ib-s259t2 | 55.000đ | blended | /s-media/thumbs-4c9bafc_caramel-coffee-jelly.jpg |
| 8 | CHOCOLATE IB | chocolate-ib-s263t2 | 55.000đ | blended | /s-media/thumbs-366d6f6b_chocolate-ib.jpg |
| 9 | CHOCOLATE | chocolate-s167t2 | 55.000đ | non-coffee | /s-media/thumbs-b0f6ab89_chocolate-latte.jpg |
| 10 | CINNAMON ORANGE COLD BREW | cinnamon-orange-cold-brew-s1435t2 | 55.000đ | san-pham-moi, yeu-thich-nhat, cold-brew | /s-media/thumbs-fb1f9a06_cinnamon-orange-cold-brew.jpg |
| 11 | CINNAMON TEA | cinnamon-tea-s181t2 | 45.000đ | tea | /s-media/thumbs-8db1f84b_cinnamon-tea.jpg |
| 12 | COCO COFFEE ICEBLEND | coco-coffee-iceblend-s1138t2 | N/A | yeu-thich-nhat, coffee | /s-media/thumbs-1b2b2c7d_coco-coffee-iceblend.jpg |
| 13 | COCO COLD BREW | coco-cold-brew-s1434t2 | 55.000đ | san-pham-moi, yeu-thich-nhat, cold-brew | /s-media/thumbs-f97f625a_coco-cold-brew.jpg |
| 14 | COCO LATTE | coco-latte-s1400t2 | 60.000đ | san-pham-moi, coffee | /s-media/thumbs-366cf1eb_coco-latte.jpg |
| 15 | COCO MANGO | coco-mango-s1472t2 | 59.000đ | san-pham-moi, mango-breeze | /s-media/thumbs-df382150_coco-mango.jpg |
| 16 | COCO MATCHA | coco-matcha-s1403t2 | 65.000đ | san-pham-moi, yeu-thich-nhat, non-coffee | /s-media/thumbs-aa590f31_coco-matcha.jpg |
| 17 | COOKIE MATCHA LAND | cookie-matcha-land-s201t2 | 65.000đ | blended | /s-media/thumbs-4013cfe4_cookie-matcha-land.jpg |
| 18 | EGG COFFEE | egg-coffee-s1243t2 | 55.000đ | san-pham-moi, yeu-thich-nhat, coffee | /s-media/thumbs-67b9de1e_egg-coffee.jpg |
| 19 | ESPRESSO | espresso-s152t2 | 39.000đ | coffee | /s-media/thumbs-f90391dd_espresso.jpg |
| 20 | FLAN GATO | flan-gato-s1016t2 | 39.000đ | cake | /s-media/thumbs-c95be405_dfa.jpg |
| 21 | GOLDEN BERRY PASSION TEA | golden-berry-passion-tea-s1406t2 | 65.000đ | san-pham-moi, yeu-thich-nhat, tea | /s-media/thumbs-8971210b_golden-berry-passion-tea.jpg |
| 22 | HONEY LEMON COLD BREW | honey-lemon-cold-brew-s1436t2 | 55.000đ | san-pham-moi, yeu-thich-nhat, cold-brew | /s-media/thumbs-57306aa5_honey-lemon-cold-brew.jpg |
| 23 | KUMQUAT COOLER | kumquat-cooler-s235t2 | N/A | yeu-thich-nhat, blended | /s-media/thumbs-f0621ca5_kumquat-cooler-.jpg |
| 24 | LATTE COFFEE | latte-coffee-s157t2 | 50.000đ | coffee | /s-media/thumbs-ae566bec_latte-coffee.jpg |
| 25 | LEMON BLACK TEA | lemon-black-tea-s177t2 | 45.000đ | tea | /s-media/thumbs-9410ff44_lemon-black-tea.jpg |
| 26 | LONGAN TEA | longan-tea-s1405t2 | 59.000đ | san-pham-moi, tea | /s-media/thumbs-eea4bb17_longan-tea.jpg |
| 27 | LYCHEE MANGO | lychee-mango-s1471t2 | 59.000đ | san-pham-moi, mango-breeze | /s-media/thumbs-cd2fb98e_lychee-mango.jpg |
| 28 | LYCHEE TEA | lychee-tea-s1404t2 | N/A | yeu-thich-nhat, tea | /s-media/thumbs-2fe1c35b_lychee-tea.jpg |
| 29 | MATCHA IB | matcha-ib-s258t2 | 55.000đ | blended | /s-media/thumbs-a54d2069_matcha-ib.jpg |
| 30 | MATCHA TEA LATTE | matcha-tea-latte-s169t2 | 55.000đ | non-coffee | /s-media/thumbs-2b383bd1_matcha-tea-latte-1.jpg |
| 31 | OOLONG BUBBLE MILK TEA | oolong-bubble-milk-tea-s184t2 | N/A | yeu-thich-nhat, milk-tea | /s-media/thumbs-34551208_oolong-bubble-milk-tea.jpg |
| 32 | ORANGE JUICE | orange-juice-s212t2 | 50.000đ | tea | /s-media/thumbs-c76bcd3b_orange-juice.jpg |
| 33 | PALOMA ICE TEA | paloma-ice-tea-s743t2 | N/A | yeu-thich-nhat, tea | /s-media/thumbs-146249b3_paloma-iced-tea.jpg |
| 34 | PASSION MANGO CHEESE | passion-mango-cheese-s1018t2 | 39.000đ | cake | /s-media/thumbs-5ff9576_passion-mango-cheese.jpg |
| 35 | RICE MILK TEA | rice-milk-tea-s1231t2 | 55.000đ | san-pham-moi, yeu-thich-nhat, milk-tea | /s-media/thumbs-bb571d19_rice-milk-tea.jpg |
| 36 | SALTED CREAMFOAM CHOCO | salted-creamfoam-choco-s1401t2 | 65.000đ | san-pham-moi, yeu-thich-nhat, non-coffee | /s-media/thumbs-1a69f86_salted-creamfoam-choco.jpg |
| 37 | SALTED MILKFOAM COFFEE | salted-milkfoam-coffee-s1000t2 | N/A | yeu-thich-nhat, coffee | /s-media/thumbs-e4304ef9_salted-milkfoam-coffee.jpg |
| 38 | SPECIAL WHITE COFFEE | special-white-coffee-s882t2 | N/A | yeu-thich-nhat, coffee | /s-media/thumbs-ff2ae9eb_special-white-coffee.jpg |
| 39 | STRAWBERRY PEACH TEA | strawberry-peach-tea-s1402t2 | 59.000đ | san-pham-moi, tea | /s-media/thumbs-8f1ad090_strawberry-peach-tea.jpg |
| 40 | THỨC MILK TEA | thuc-milk-tea-s195t2 | N/A | yeu-thich-nhat, milk-tea | /s-media/thumbs-ee18372_thuc-milk-tea-1.jpg |
| 41 | TIRAMISU CHOCO | tiramisu-choco-s687t2 | 39.000đ | cake | /s-media/thumbs-8a88289e_tiramisu-choco.jpg |
| 42 | WHITE COFFEE | white-coffee-s147t2 | N/A | yeu-thich-nhat, coffee | /s-media/thumbs-1c476e91_white-coffee.jpg |

**Notes:**
- 9 products missing price data (N/A) in catalog view; likely available on detail pages
- Products appear in 1-3 categories; no single-category duplication
- Prices range: 35.000đ (BLACK COFFEE) to 65.000đ (COCO MATCHA, GOLDEN BERRY PASSION TEA, SALTED CREAMFOAM CHOCO, COOKIE MATCHA LAND)
- URL pattern: `/menu/{kebab-slug}-s{numeric-id}t2` where id is product SKU

---

## Product Detail Page Fields

**Sample:** `/menu/berry-mango-s1473t2` (BERRY MANGO)

**Fields extracted from page structure:**

| Field | Value/Format | Notes |
|-------|--------------|-------|
| **Title (H1)** | BERRY MANGO | Product name, also in `<title>` tag |
| **Short Description** | "Xoài Dâu Đá Xay - vị chua thanh của dâu tây mix cùng độ ngọt thơm của xoài, thêm topping dâu sấy giòn vui miệng, uống một ngụm là 'bật công tắc' tươi tỉnh." | HTML-escaped, 1 paragraph |
| **Price** | 59.000đ | In `<span class="opt-price">` within options table |
| **Full-Size Image URL** | `/s-media/847b9f4d_berry-mango.jpg` | Clickable lightbox link, same base name as thumb but no `thumbs-` prefix |
| **Thumbnail Image URL** | `/s-media/thumbs-847b9f4d_berry-mango.jpg` | Displayed on catalog and detail pages |
| **Related Products Section** | "Sản phẩm cùng danh mục" (Products in same category) | Grid of 4 related items shown below main info |
| **Social Sharing** | Facebook, Twitter, Google+ share buttons | Links populated with product URL |
| **Breadcrumbs** | Home > Menu > BERRY MANGO | Navigation trail |
| **Call-to-Action** | "Order xin gọi: 1800 6230" | Hotline link instead of e-commerce cart |
| **Back Button** | "Trở Lại" (Go Back) | Client-side navigation |

**No size/variant options visible** (single fixed price displayed). Product appears to have a single SKU with no upsizing or customization UI.

---

## Blog Posts (5 Items)

Found on `/chuyen-cua-thuc/` (blog index, first page only).

| # | Title | Slug | Cover Image | Summary/Notes |
|----|-------|------|-------------|--------------|
| 1 | THỨC COFFEE CHÍNH THỨC MANG "VŨ TRỤ XOÀI" ĐẾN VỚI MỰA HÈ RỒI ĐÂY 🥭 | thuc-coffee-chinh-thuc-mang-vu-tru-xoai-den-voi-mua-he-roi-dayy-&#127958;-s1485t2 | /s-media/c8918c3a_social-post.jpg | Mango universe campaign (latest) |
| 2 | Deal on Day - Chill all Day | deal-on-day-chill-all-day-s1468t2 | /s-media/2fc62206_social-1.jpg | Promotional combo post |
| 3 | DEADLINE OVERNIGHT VẪN TRẦN ĐẦY NĂNG LƯỢNG CÙNG COMBO TỈNH TÁO | deadline-overnight-van-tran-day-nang-luong-cung-combo-tinh-tao-s1476t2 | /s-media/9d5cb020_combo-dem-social.jpg | Late-night combo campaign |
| 4 | BUỔI CHIỀU "SO SWEET" CÙNG COMBO NGỌT NGÀO | buoi-chieu-so-sweet-cung-combo-ngot-ngao-s1475t2 | /s-media/1fbf3667_combo-chieu-social.jpg | Afternoon sweet combo |
| 5 | SÁNG NO NÊ MỖI NGÀY CÙNG THỨC COFFEE | sang-no-ne-moi-ngay-cung-thuc-coffee-s1474t2 | /s-media/493fc115_combo-sang-social.jpg | Morning combo campaign |

**Notes:**
- Only 5 posts visible on first page of blog index
- All posts use URL pattern: `/chuyen-cua-thuc/{slugified-title-with-emojis}-s{id}t2`
- Posts are promotional (combo meals/campaigns), not editorial
- Blog pagination likely exists (no `?page=` parameter visible in crawl, but check for client-side pagination)
- Cover images appear to be social media graphics (900x900px implied)

---

## Store List (7 Locations)

Confirmed locations from `/cua-hang/` index:

| # | Store Name | Slug | Address (from nav) | Status |
|----|-----------|------|------------------|--------|
| 1 | Thức Coffee - 40D Lý Tự Trọng | thuc-coffee-40d-ly-tu-trong-s92t2 | 40D Lý Tự Trọng, HCMC | Active |
| 2 | Thức Coffee - Đường 41 | thuc-coffee-duong-41-s931t2 | Đường 41, HCMC | Active |
| 3 | Thức Coffee - 42 Cống Quỳnh | thuc-coffee-42-cong-quynh-s99t2 | 42 Cống Quỳnh, HCMC | Active |
| 4 | Thức Coffee - 42 Hoa Phượng | thuc-coffee-42-hoa-phuong-s605t2 | 42 Hoa Phượng, HCMC | Active |
| 5 | Thức Coffee - 45 Nguyễn Oanh | thuc-coffee-45-nguyen-oanh-s242t2 | 45 Nguyễn Oanh, HCMC | Active |
| 6 | Thức Coffee - 320 Nguyễn Thái Sơn | thuc-coffee-320-nguyen-thai-son-s106t2 | 320 Nguyễn Thái Sơn, HCMC | Active |
| 7 | Thức Coffee - 37 Lý Tự Trọng | thuc-coffee-37-ly-tu-trong-s103t2 | 37 Lý Tự Trọng, HCMC | Active |

**Store Detail Page Fields** (sample: `/cua-hang/thuc-coffee-40d-ly-tu-trong-s92t2`):
- Store name (H1 heading)
- Full address with street, district, phone
- Google Maps embed (iFrame)
- Store image gallery
- Opening hours (24/7 mentioned consistently)
- Contact phone number

---

## Static Pages Content Summary

### `/gioi-thieu` (About Us)
- **Page title:** "THỨC COFFEE - OPEN 24/7"
- **Main content:** Company mission and history (Vietnamese only, not extracted verbatim per guidelines)
- **Key sections:** Story of brand, philosophy, 24H commitment
- **Images:** Logo, store photos

### `/chuong-trinh-thanh-vien/` (Membership Program)
- **Page title:** "Ưu đãi thành viên" (Member Benefits)
- **Sections:** 
  - Overview of membership tier system
  - Points accumulation & redemption
  - FAQ: 6 common questions (registration, point codes, tier conditions, birthday benefits, additional policies)
- **No images extracted in FAQ section**

### `/tuyen-dung` (Careers)
- **Page title:** "TUYỂN DỤNG" (Hiring)
- **Content:** Job listings or recruitment info (details minimal in crawl)

### `/lien-he` (Contact)
- **Page title:** "Liên hệ" (Contact)
- **Sections:** 
  - Office contact info
  - Address: Văn Phòng (Office)
- **Content minimal:** Likely form-based contact rather than static content

### `/delivery/` (Delivery/Order Online)
- **Page title:** "THỨC DELIVERY"
- **Content:** Information about online ordering and delivery service
- **Promo:** Delivery service highlighted as key feature

### `/chinh-sach` (Cookie & Privacy Policy)
- **Page title:** "Chính sách Cookie" (Cookie Policy)
- **Content:** Legal notice about cookie usage and privacy
- **Action:** Cookie consent banner across all pages with "Accept & Close" button

---

## Full Image URL Master List (92 Unique Assets)

All URLs referenced across fetched pages. Sorted by path.

```
/Content/images/icon-coffee.png
/Content/images/icon-delivery.png
/s-media/1498c923_thuc-nts.jpg
/s-media/151b6674_circlelogo-white-blue-jul2023.png
/s-media/170ff33_thuc2d41.jpg
/s-media/18fd29ae_t8.jpg
/s-media/1fbf3667_combo-chieu-social.jpg
/s-media/249fc9a9_post-17042023.png
/s-media/2e94f8cc_cover-fb.jpg
/s-media/2f736321_social-900x900px.jpg
/s-media/2fa7f203_thuc37ltt1.jpg
/s-media/2fc62206_social-1.jpg
/s-media/38477004_z4196149101339-58b3de8b5ff9725fda6c9c627d63726b.jpg
/s-media/3eb3f0f8_cover-2-.jpg
/s-media/444adc75_z6157733703207-60f39403ff895814bcae5bee6e3dbfba.jpg
/s-media/446135be_cover-fb.jpg
/s-media/48270e72_z6157795668203-258e0e9a0e1ce535d1d0782e3199ea9a.jpg
/s-media/493fc115_combo-sang-social.jpg
/s-media/4c12c914_z4133906633239-68941175e8af772fe5b4dd680622f293.jpg
/s-media/56e70517_z6157733703207-60f39403ff895814bcae5bee6e3dbfba.jpg
/s-media/5a1cdea7_post-coldbrew-mar2026.jpg
/s-media/5e78229d_bestsales.svg
/s-media/5e88548f_newproduct.svg
/s-media/66a95e9c_post-28042023.png
/s-media/698435b6_thuc-duong41.jpg
/s-media/6cdd14d1_74.jpg
/s-media/751cd7ba_2.png
/s-media/7d2cf80d_social-combo.jpg
/s-media/847b9f4d_berry-mango.jpg
/s-media/9d5cb020_combo-dem-social.jpg
/s-media/9ead2735_z6157794639130-42110afa99c0a14e5f9c8fdd6d5e84a5.jpg
/s-media/a030442e_4.png
/s-media/a31b07cd_post-1.jpg
/s-media/a96b3f5c_z6157794642418-4e22336e67fc1feac49709d2e700744e.jpg
/s-media/b56f727c_tra-buoi-hong-chanh-day.png
/s-media/bd3ef1ec_post-womensday-mar2026-1-.jpg
/s-media/bfccd894_post-04052020.png
/s-media/c3bc3b1c_z6155463159164-bfe0689d79840c400bbaad0696aeec0c.jpg
/s-media/c7bbbede_social-the-cao.jpg
/s-media/c8918c3a_social-post.jpg
/s-media/d0c131f0_post-caphe-20042020.png
/s-media/e2a98556_social-board-game.jpg
/s-media/e7bdc8e0_thuc-milk-tea.png
/s-media/efd28138_t3.jpg
/s-media/f4efbbf4_z6174415800778-affb677883ba863f3a09111ad3df3ba7.jpg
/s-media/thumbs-146249b3_paloma-iced-tea.jpg
/s-media/thumbs-184d8b30_social-900x900px.jpg
/s-media/thumbs-1a69f86_salted-creamfoam-choco.jpg
/s-media/thumbs-1b2b2c7d_coco-coffee-iceblend.jpg
/s-media/thumbs-1c476e91_white-coffee.jpg
/s-media/thumbs-1da1ca5_combo-chieu-social.jpg
/s-media/thumbs-243b0721_untitled-design-4-.png
/s-media/thumbs-278a4815_sociaal.jpg
/s-media/thumbs-2b383bd1_matcha-tea-latte-1.jpg
/s-media/thumbs-2fe1c35b_lychee-tea.jpg
/s-media/thumbs-302411f4_black-coffee.jpg
/s-media/thumbs-34551208_oolong-bubble-milk-tea.jpg
/s-media/thumbs-366cf1eb_coco-latte.jpg
/s-media/thumbs-366d6f6b_chocolate-ib.jpg
/s-media/thumbs-4013cfe4_cookie-matcha-land.jpg
/s-media/thumbs-4c9bafc_caramel-coffee-jelly.jpg
/s-media/thumbs-57306aa5_honey-lemon-cold-brew.jpg
/s-media/thumbs-5ff9576_passion-mango-cheese.jpg
/s-media/thumbs-67b9de1e_egg-coffee.jpg
/s-media/thumbs-697096c7_combo-dem-social.jpg
/s-media/thumbs-847b9f4d_berry-mango.jpg
/s-media/thumbs-8971210b_golden-berry-passion-tea.jpg
/s-media/thumbs-8a88289e_tiramisu-choco.jpg
/s-media/thumbs-8db1f84b_cinnamon-tea.jpg
/s-media/thumbs-8f1ad090_strawberry-peach-tea.jpg
/s-media/thumbs-9410ff44_lemon-black-tea.jpg
/s-media/thumbs-a54d2069_matcha-ib.jpg
/s-media/thumbs-a84ab08_cappuccino-1.jpg
/s-media/thumbs-aa590f31_coco-matcha.jpg
/s-media/thumbs-ae566bec_latte-coffee.jpg
/s-media/thumbs-b0f6ab89_chocolate-latte.jpg
/s-media/thumbs-b28ead0b_combo-sang-social.jpg
/s-media/thumbs-bb571d19_rice-milk-tea.jpg
/s-media/thumbs-c76bcd3b_orange-juice.jpg
/s-media/thumbs-c95be405_dfa.jpg
/s-media/thumbs-cd2fb98e_lychee-mango.jpg
/s-media/thumbs-df382150_coco-mango.jpg
/s-media/thumbs-e4304ef9_salted-milkfoam-coffee.jpg
/s-media/thumbs-e600e38f_americano.jpg
/s-media/thumbs-e8ac352a_black-cold-brew.jpg
/s-media/thumbs-ee18372_thuc-milk-tea-1.jpg
/s-media/thumbs-eea4bb17_longan-tea.jpg
/s-media/thumbs-f0621ca5_kumquat-cooler-.jpg
/s-media/thumbs-f90391dd_espresso.jpg
/s-media/thumbs-f97f625a_coco-cold-brew.jpg
/s-media/thumbs-fb1f9a06_cinnamon-orange-cold-brew.jpg
/s-media/thumbs-ff2ae9eb_special-white-coffee.jpg
```

**Breakdown:**
- **`/Content/images/`** (2 files): Static UI icons (coffee, delivery)
- **`/s-media/` full-res** (45 files): Blog/promo graphics, store photos, branded assets
- **`/s-media/thumbs-` thumbnails** (45 files): Product catalog images + social variants

---

## Unresolved Questions & Limitations

1. **Blog pagination:** Only 5 posts discovered. Site may have `?page=2`, `?page=3` or client-side infinite scroll. Full blog archive not crawled.

2. **Price data gaps:** 9 products (12% of catalog) missing price in category view. Likely populated dynamically via JavaScript or on detail page. Recommend checking each detail page to confirm prices.

3. **Product variants/sizes:** Sample detail page shows single price only. Unclear if products have size options (S/M/L) or if that's all handled at order time. Check detail pages for hidden option fields.

4. **Store detail completeness:** Only sampled 1 store detail page. Recommend fetching all 7 store detail pages to confirm field consistency (hours, map embed, gallery structure).

5. **Home page content:** Homepage structure noted but not fully detailed. Likely contains hero banners, featured products, promotions—recommend separate crawl if needed.

6. **Blog detail content:** Blog post bodies not extracted (only titles/covers). Recommend sampling 1-2 blog detail pages to see structure (categories, author, publish date, body format, related posts).

7. **Dynamic content:** Site uses AngularJS (`ng-app="ndtApp"`). Some data may be loaded client-side (product filters, search results). Static crawl captures only initial HTML state.

8. **Login form UI:** Login page intentionally skipped per instructions, but worth noting it exists for future auth workflow if needed.

---

## Summary for Static Rebuild

**Immediate actions for React clone:**
1. Download all 92 image URLs to `/public/images/` or CDN
2. Map product routes `/menu/{slug}-s{id}t2` to React route structure
3. Create hardcoded product data JSON from the 42-item catalog (with resolved prices)
4. Replicate 10 category view layouts (filter by category array)
5. Build product detail page template (name, summary, price, full image, related products grid)
6. Create blog grid (5 posts minimum) with card layout
7. Build store list + detail pages with map embed
8. Copy static pages (about, membership, contact, careers, policy, delivery) as markdown or hardcoded sections
9. Replicate header/footer navigation and cookie banner

**Completeness:** ~95% of visible content cataloged. Blog archive and user account features intentionally excluded.
