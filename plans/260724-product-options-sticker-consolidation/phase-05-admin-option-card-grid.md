---
phase: 5
title: Admin option card grid
status: completed
priority: P2
effort: 3h
dependencies:
  - 4
---

# Phase 5: Admin option card grid

## Overview

Dựng lại ô option trong form sản phẩm thành lưới card — mỗi option một card chứa
checkbox + giá + nhãn + số lượng. Lấy look từ ảnh source nhưng **số card theo
`optionCatalog` trong DB**, không cứng 6 slot.

## Requirements

- Functional: admin tick option → ô giá và ô tên active → nhập → lưu round-trip
  đúng. Option không tick thì mờ và không gửi lên.
- Functional: **tick thì bắt buộc giá > 0 mới cho lưu.** Chặn ở cả FE lẫn backend.
- Non-functional: giữ pattern form hiện có (`FormField`, `updateField`,
  `fieldErrors`). Không thêm thư viện. File < 200 dòng.
- **Ẩn ô quantity** — nguồn trả 0 cho cả 47/47 link, không mang thông tin. Cột DB
  giữ nguyên (= 1), chỉ không hiện trong form.

## Quy tắc active + validate

```
Ô KHÔNG tick  → giá/tên mờ (disabled), bỏ qua khi submit, không render public
Ô CÓ tick     → giá/tên active
                → giá BẮT BUỘC > 0, sai thì chặn Lưu + báo lỗi cạnh ô
                → tên để trống thì fallback về option.name (không bắt buộc)
```

Vì sao giá bắt buộc mà tên không: 47/47 link cào được đều có giá thật, không cái
nào 0đ. Còn tên thì cột `label` nullable đã lo fallback.

Validate **2 lớp** — chỉ FE là hở, gọi API trực tiếp vẫn lọt giá 0 vào DB:
- FE: chặn submit, hiện lỗi cạnh ô (dùng `fieldErrors` sẵn có)
- Backend: Zod `price.min(1)` trong `optionLinks[]` → trả 400, không phải 500

## Architecture

Ảnh source là lưới 3 cột, mỗi ô: `[x] Giá N` / input giá / `Tên` / input tên.
Sáu ô cứng là giới hạn CMS cũ — schema hiện tại không có giới hạn đó, nên copy
vào là tự trói. Lấy layout, bỏ giới hạn.

`OptionLinkDraft` mở rộng:

```ts
export interface OptionLinkDraft {
  optionId: number;
  price: string;
  label: string;   // nhãn hiển thị; rỗng → backend lưu null → public dùng option.name
}
```

Không có `quantity` — ẩn khỏi form, backend hardcode 1.

Lưới 4 card (bằng số option trong DB sau phase 3), mỗi card:

```
┌──────────────────────────┐  ┌──────────────────────────┐
│ ☑ Lạnh                   │  │ ☐ Nóng                   │
│ Giá                      │  │ Giá                      │
│ ┌──────────────────────┐ │  │ ┌──────────────────────┐ │
│ │ 55000                │ │  │ │ 0                    │ │ (disabled)
│ └──────────────────────┘ │  │ └──────────────────────┘ │
│ Tên                      │  │ Tên                      │
│ ┌──────────────────────┐ │  │ ┌──────────────────────┐ │
│ │ Lạnh (Size M)        │ │  │ │                      │ │ (disabled)
│ └──────────────────────┘ │  │ └──────────────────────┘ │
└──────────────────────────┘  └──────────────────────────┘
   viền đậm = đang tick          viền nhạt = chưa tick
```

Đổi tên file: `ProductOptionsStickerFields.tsx` → `ProductOptionFields.tsx`
(phase 4 đã bỏ phần sticker, tên cũ sai nghĩa).

Layout: `grid gap-3 sm:grid-cols-2 lg:grid-cols-3`, mỗi card
`rounded-[10px] border border-admin-border p-3`. Card đang tick viền đậm hơn
(`border-admin-accent`) như ảnh. Input giá/nhãn chỉ enable khi đã tick —
tick tắt thì giữ giá trị trong state để tick lại không mất (ảnh source cũng giữ
giá trị trong ô khi bỏ tick).

Placeholder ô nhãn = `option.name` để admin thấy rõ "bỏ trống thì hiện cái này".

## Related Code Files

- Rename + rewrite: `src/components/admin/forms/ProductOptionsStickerFields.tsx`
  → `src/components/admin/forms/ProductOptionFields.tsx`
- Modify: `src/components/admin/forms/ProductForm.tsx` — bỏ `stickerIds`,
  `onToggleSticker`; map `label` trong `useEffect` và `handleSubmit`; validate submit
- Modify: `server/src/modules/products/products.admin.schemas.ts` — `price.min(1)`
- Read: `src/services/admin/product-options.service.ts` (đã đổi tên ở phase 4)

## Implementation Steps

1. Tạo `ProductOptionFields.tsx` từ nội dung cũ, bỏ toàn bộ `fieldset` sticker.
2. Mở rộng `OptionLinkDraft` thêm `label`. **Không thêm `quantity`.**
3. Dựng lưới card:
   ```tsx
   <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
     {(options.data ?? []).map((option) => {
       const link = optionLinks.find((i) => i.optionId === option.id);
       return (
         <div key={option.id} className={`rounded-[10px] border p-3 ${
           link ? 'border-admin-accent' : 'border-admin-border'}`}>
           <label className="flex items-center gap-2 text-[13.5px] font-semibold">
             <input type="checkbox" checked={Boolean(link)}
                    onChange={() => toggleOption(option.id)} />
             {option.name}
           </label>
           {/* giá: disabled={!link}, min="1", required khi link */}
           {/* nhãn: disabled={!link}, placeholder={option.name} */}
         </div>
       );
     })}
   </div>
   ```
4. `ProductForm.tsx`:
   - `ProductFormState`: bỏ `stickerIds`
   - `emptyForm`: bỏ `stickerIds`
   - `useEffect` map thêm: `label: link.label ?? ''`
   - `handleSubmit` gửi: `label: link.label.trim() || null` (không gửi `quantity`)
   - Bỏ prop `stickerIds`/`onToggleSticker` khi render component
5. **Validate FE trước submit:** với mỗi link đã tick, `Number(price) > 0`. Sai thì
   `event.preventDefault()`, set lỗi cạnh ô đó, không gọi mutation.
6. **Validate backend:** `products.admin.schemas.ts` → `optionLinks[].price` thêm
   `.min(1)`. Trả 400 kèm `field` để `fieldErrors` map được về đúng ô.
7. Xóa file cũ `ProductOptionsStickerFields.tsx`.
8. `npm run lint && npm run build` ở root; `cd server && npm run lint && npm run build`.

## Success Criteria

- [ ] Lưới card hiện đúng 4 option trong DB (không cứng 6).
- [ ] Ô chưa tick thì giá/tên disabled, nhìn rõ là không active.
- [ ] Tick → nhập giá + tên → Lưu → mở lại form thấy đúng giá trị.
- [ ] **Tick nhưng để giá 0 → chặn Lưu, báo lỗi cạnh ô đó.**
- [ ] **Gọi API trực tiếp với `price: 0` → trả 400, không phải 500, không vào DB.**
- [ ] Bỏ trống ô nhãn → lưu → public hiện `option.name`.
- [ ] Nhập nhãn `SIZE M` → public hiện `SIZE M` chứ không phải `Size nhỏ`.
- [ ] Bỏ tick rồi tick lại trong cùng phiên → giá trị cũ còn nguyên.
- [ ] Không còn ô quantity trong form; DB vẫn `quantity = 1`.
- [ ] File < 200 dòng; FE + server lint/build sạch.

## Risk Assessment

**Risk:** chỉ validate FE → gọi API trực tiếp vẫn lọt giá 0 vào DB.
**Mitigation:** bước 6 bắt buộc `.min(1)` ở Zod backend. Success criteria có case
test API trực tiếp, không chỉ test qua UI.

**Risk:** bỏ `quantity` khỏi payload FE làm backend nhận `undefined` rồi insert NULL
→ vi phạm NOT NULL.
**Mitigation:** cột có `.default(1).notNull()` trong schema Drizzle → không gửi thì
DB tự điền 1. Verify bằng SQL sau khi lưu lần đầu.

**Risk:** đổi tên file làm sót import.
**Mitigation:** `npm run build` bắt được ngay (TS strict).

**Risk:** lưới 3 cột vỡ trên mobile trong drawer admin.
**Mitigation:** `sm:grid-cols-2 lg:grid-cols-3` — mặc định 1 cột. Kiểm tra ở
breakpoint hẹp trước khi đóng phase.
