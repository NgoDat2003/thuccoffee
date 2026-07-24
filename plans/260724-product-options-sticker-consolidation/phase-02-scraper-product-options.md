---
phase: 2
title: Scraper product options
status: completed
priority: P1
effort: 3h
dependencies:
  - 1
---

# Phase 2: Scraper product options

## Overview

Viết script cào option từ source, xuất ra **file data review được**, không ghi
thẳng DB.

**Việc cào đã chạy xong ngày 2026-07-24 trên 42/42 sản phẩm, 0 lỗi.** Phase này
là port script probe thành script chính thức trong repo + chốt bảng mapping. Không
còn ẩn số kỹ thuật, không còn rủi ro "source đổi markup".

Kết quả cào (đã verify, dùng làm tiêu chí nghiệm thu):

| Chỉ số | Giá trị |
|---|---|
| Sản phẩm | **42** |
| Có nhiều mức giá | **18** |
| Một giá (không option) | **24** |
| Tổng option link | **47** |
| Nhãn hiển thị distinct | 14 |
| Loại chuẩn distinct | 4 |
| Lệch giá DOM vs JSON | 0 |

## Requirements

- Functional: với 42 slug trong `src/data/products.ts`, xuất được nhãn hiển thị,
  giá, thứ tự và loại chuẩn của từng option.
- Non-functional: chạy lại được không cần fetch lại (cache HTML thô). Tuần tự,
  có delay, không đập source. Script nằm trong `server/scripts/`, chạy bằng `tsx`.
- **Không cần tài khoản admin của source.** Toàn bộ dữ liệu nằm ở trang public
  `/menu/<slug>` — giá và tên option hiển thị công khai cho khách. Đã cào đủ 42/42
  qua đường này.

## Architecture

**Hai nguồn dữ liệu trên cùng một trang detail, phải merge:**

1. **DOM** cho nhãn + giá hiển thị, và **thứ tự**:
   ```
   <div class="option-item">
     <span class="opt-name">Lạnh (Size M)</span>
     <span class="opt-price">45.000đ</span>
   ```
2. **JSON nhúng** cho giá dạng số:
   ```
   ng-init="initDetailsPage('{"ITM_ID":...,"SelectedOptions":[
      {"ITL_Name":"Lạnh (Size M)","ITL_PriceAmount":45000.0,
       "ITL_Quantity":0,"DefaultName":"Lạnh"} ]}')"
   ```
   Attribute bị HTML-escape (`&quot;`) → phải `html.unescape` trước khi parse JSON.

Ghép theo `ITL_Name` ↔ `.opt-name`. Giá lấy từ JSON (`ITL_PriceAmount`, số
nguyên) chứ không parse chuỗi `"45.000đ"` — tránh lỗi định dạng. Đã verify 47/47
link khớp giữa DOM và JSON.

### KHÔNG dùng `DefaultName` để gán loại chuẩn

`DefaultName` **không phải phân loại ngữ nghĩa** — nó là tên slot cố định của CMS
nguồn (slot 1 = "Size nhỏ", slot 2 = "Lạnh", slot 3 = "2 Eggs"…). Admin nguồn gõ
tự do vào ô "Tên" của slot nào thì `DefaultName` mang tên slot đó.

Bằng chứng: form admin nguồn hiện slot tên `1 Egg`/`2 Eggs` ở sản phẩm không bán
trứng. Và `espresso` có nhãn `Nóng (size M)` nhưng `DefaultName` = `Lạnh` — chỉ vì
gõ vào slot 2.

Dùng `DefaultName` để gán `option_id` sẽ tạo dữ liệu sai. **Suy loại từ chính
`label`**, qua bảng mapping viết tay dưới đây.

### Bảng mapping nhãn → loại chuẩn (14 nhãn → 4 loại)

Viết tay trong file seed, không dùng regex đoán tự động. 14 dòng, đọc mắt thường
được, sai thì sửa ngay.

| Nhãn hiển thị (label) | Loại chuẩn (option) |
|---|---|
| `Nóng` | Nóng |
| `HOT` | Nóng |
| `Nóng (size M)` | Nóng |
| `Nóng (size L)` | Size vừa |
| `Lạnh` | Lạnh |
| `Lạnh (Size M)` | Lạnh |
| `Lạnh (size M)` | Lạnh |
| `Lạnh(Size M)` *(thiếu space, nguồn gõ vậy)* | Lạnh |
| `Lạnh (size S)` | Size nhỏ |
| `COLD (SIZE S)` | Size nhỏ |
| `SIZE M` | Size nhỏ |
| `Lạnh (Size L)` | Size vừa |
| `Lạnh (size L)` | Size vừa |
| `SIZE L` | Size vừa |

Phân bố sau map: `Size vừa` 15, `Nóng` 13, `Lạnh` 11, `Size nhỏ` 8 = 47 link.

**Đã verify 0 xung đột `PRIMARY KEY (product_id, option_id)`** — không sản phẩm nào
có 2 nhãn map về cùng một loại. Đây là ràng buộc bắt buộc kiểm lại nếu mapping đổi.

### Không cào sticker nữa

DB **đã có sẵn** dữ liệu này: `san-pham-moi` 16 sản phẩm, `yeu-thich-nhat` 19 sản
phẩm (đã verify bằng query). Số 16 khớp chính xác số card `SẢN PHẨM MỚI` cào được
từ `/menu`.

Việc còn lại chỉ là thêm **2 giá trị `badge_color`** — thuộc phase 4, không phải
việc cào. Bỏ toàn bộ phần enumerate category page khỏi phase này.

**Sản phẩm không có option thật:** khi chỉ có 1 `option-item` và `.opt-name` rỗng,
đó là sản phẩm một giá — không ghi option nào, giữ `products.price`. Có **24** sản
phẩm dạng này (`berry-mango`, `black-cold-brew`, `flan-gato`, …).

## Related Code Files

- Create: `server/scripts/scrape-product-options.ts`
- Create: `server/scripts/.cache/` (HTML thô, thêm vào `.gitignore`)
- Create: `server/src/db/seed-data/product-options-scraped.ts` (output, commit)
- Modify: `.gitignore`

## Implementation Steps

1. Đọc 42 slug từ `src/data/products.ts` (regex `slug: '...'`) — không hardcode.
2. Fetch `/menu/<slug>` cho từng slug, cache vào `server/scripts/.cache/<slug>.html`.
   Có cache thì đọc cache. Delay 400ms giữa request. Retry 2 lần khi lỗi mạng.
3. Parse mỗi trang:
   - `option-item` → `optName`, `optPriceText`
   - `initDetailsPage('...')` → unescape → `JSON.parse` → `SelectedOptions[]`
   - merge theo `ITL_Name`; giá = `ITL_PriceAmount`; `sortOrder` = thứ tự DOM
   - **`option` = tra bảng mapping ở §Architecture theo `label`**, KHÔNG lấy `DefaultName`
4. Xuất `product-options-scraped.ts`:
   ```ts
   // Cào từ thuccoffee.com.vn ngày 2026-07-24. Snapshot, không phải chân lý —
   // giá nguồn có thể đã đổi. 42 sản phẩm: 18 có option, 24 một giá, 47 link.
   export const scrapedOptionCatalog = ['Lạnh', 'Nóng', 'Size nhỏ', 'Size vừa'];

   // Nhãn hiển thị → loại chuẩn. Viết tay, suy từ label (KHÔNG từ DefaultName —
   // DefaultName là tên slot cố định của CMS nguồn, không phải phân loại).
   export const labelToOption: Record<string, string> = { ... };  // 14 dòng

   export const scrapedProductOptions: Record<string, {
     label: string; option: string; price: number;
   }[]> = { ... };  // 18 sản phẩm, 47 link
   ```
   Không xuất `quantity` — nguồn trả 0 cho cả 47/47, vô nghĩa (xem phase 3).
5. In báo cáo cuối: số sản phẩm có option / một giá / fetch lỗi; nhãn distinct;
   loại chuẩn distinct; **danh sách nhãn chưa có trong bảng mapping**.
6. **Dừng và báo user nếu:** có nhãn chưa map, hoặc có sản phẩm nào 2 nhãn map về
   cùng một loại (vi phạm PK). Không seed bừa.
7. So `products.price` hiện có với giá cào được, in cảnh báo chỗ lệch — **không tự
   sửa**, để người quyết định ở phase 3.

## Success Criteria

- [ ] Script chạy hết **42** slug, 0 lỗi.
- [ ] Kết quả khớp số đã verify: **18** sản phẩm có option, **24** một giá, **47** link.
- [ ] 0 nhãn chưa map; 0 xung đột PK.
- [ ] Phân bố loại chuẩn khớp: `Size vừa` 15, `Nóng` 13, `Lạnh` 11, `Size nhỏ` 8.
- [ ] File output commit được, đọc được, có ghi ngày cào.
- [ ] Chạy lần 2 dùng cache, không fetch lại.
- [ ] Spot-check tay 3 sản phẩm: `americano` (3 option 45k/55k/45k),
      `black-coffee` (4 option 35k/39k/49k/39k), `caramel-coffee-jelly-ib`
      (2 option `SIZE M` 55k / `SIZE L` 65k).

## Risk Assessment

**Risk (đã giảm):** source đổi markup giữa lúc plan và lúc chạy → parser gãy.
**Mitigation:** HTML thô của cả 42 trang đã cache lại từ lần cào 2026-07-24, nên
kể cả source đổi vẫn dựng được data. Script vẫn fail loud (throw) khi không thấy
`option-item` hoặc `initDetailsPage` trên trang lẽ ra phải có.

**Risk:** giá source đã đổi so với `src/data/products.ts`.
**Mitigation:** bước 7 in cảnh báo chỗ lệch. Không tự sửa — `products.price` là
giá mặc định hiển thị ở card menu, khác với giá theo option; đè lên nhau là sai.

**Risk:** bảng mapping 14 nhãn bị sửa sau này làm 2 nhãn cùng sản phẩm map về một
loại → vi phạm `PRIMARY KEY (product_id, option_id)`, insert fail.
**Mitigation:** bước 6 kiểm tra xung đột PK trước khi xuất file. Hiện tại 0 xung đột.

**Risk:** nhãn mới xuất hiện trên source mà bảng mapping chưa có.
**Mitigation:** bước 5 in danh sách nhãn chưa map; bước 6 dừng hẳn. Không im lặng
bỏ qua hay đoán bừa.
