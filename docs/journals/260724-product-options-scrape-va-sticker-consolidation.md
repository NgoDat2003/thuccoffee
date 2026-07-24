# Product Options Scrape + Sticker Consolidation — brainstorm/plan/cook/review/fix một mạch

**Ngày:** 2026-07-24
**Nhánh:** `feat/public-parity-cms-scope` (tiếp tục, không rẽ nhánh mới — quyết định
có chủ ý, xem plan.md §Dependencies)
**Phạm vi:** `product_option_links` chỉ có 1/18 sản phẩm thật (Americano), sticker
seed rỗng hoàn toàn. Cào lại đủ, gộp sticker vào presentation category, dựng lại
UI option admin.

## Đường đi: brainstorm → cào thật → plan → red-team → cook (Anti) → review → fix

### Brainstorm — phát hiện quan trọng nhất session

User hỏi "còn sản phẩm nào nhiều giá không" → cào thật 42/42 sản phẩm từ
`/menu/<slug>` (public, không cần acc admin). Kết quả: **18 sản phẩm nhiều giá,
47 option link, 24 một giá**.

User gửi ảnh admin CMS gốc — lật đổ giả định ban đầu: ô "Tên" trong ảnh là
**input tự do admin gõ**, không phải chọn từ danh mục chuẩn. Nghĩa là
`DefaultName` trong JSON nhúng nguồn **không phải phân loại ngữ nghĩa** — nó là
tên slot cố định của CMS cũ (slot 1 = "Size nhỏ", slot 2 = "Lạnh"...). Bằng
chứng: form gốc hiện slot `1 Egg`/`2 Eggs` ở sản phẩm không bán trứng.

**Phải hủy một quyết định đã chốt trước đó** (user từng chọn "sửa 3 chỗ
DefaultName sai trên nguồn") — không có lỗi nào để sửa, chỉ là hiểu sai field.
Thay bằng mapping 14 nhãn hiển thị → 4 loại chuẩn, viết tay, verify 0 xung đột
primary key.

User chốt: giữ catalog 4 loại (không copy y hệt CMS gốc chỉ 2 ô) vì muốn giữ khả
năng lọc/báo cáo sau này — dù hiện tại "không cần lọc". Admin nhập 3 ô: chọn
loại + giá + tên hiển thị.

### Không dùng credentials admin site thật

User gửi email/password admin của `thuccoffee.com.vn` (site thật đang chạy) kèm
yêu cầu cào. Từ chối dùng — không có ủy quyền rõ ràng, rủi ro ghi đè dữ liệu thật.
Không cần thiết vì toàn bộ giá/option đã public. Cảnh báo user đổi mật khẩu vì đã
lộ trong lịch sử chat.

### Plan + red-team tự bắt 3 lỗi trước khi cook

Soi plan đối chiếu code thật (không chỉ đọc lại plan):
1. Phase 4 giả định `product.categories` là mảng object có `kind` — thực tế
   `string[]` chỉ chứa key. Sửa: query `product_categories` join `categories`
   riêng.
2. Public option picker (`ProductDetailPage.tsx`) key theo `option.name` — sau
   khi `name` thành loại chuẩn dùng chung, 2 link có thể trùng tên. Đưa việc
   thêm `label` lên phase 1 để tránh build đỏ giữa chừng.
3. Ràng buộc giá > 0 (phase 5) chưa có gì chặn ở schema hiện tại
   (`nonnegative()` cho phép 0) và chưa có test.

Bẫy tránh được: không đổi `categories: z.array(z.string())` thành mảng object —
sẽ gãy `src/data/products.ts` + `seed.ts:112`.

### Cook (Antigravity) + review

Anti cook xong 6 phase, cả 3 fix của red-team đều làm đúng. Verify bằng chạy
thật (không chỉ đọc code): data DB khớp chính xác 18/47/4, phân bố loại
15/13/11/8, 11/11 smoke xanh, FE/server build sạch.

**3 lỗi review tìm được, đã tự fix:**
1. **Bug 500 thay vì 400** khi payload có 2 `optionLinks` trùng `optionId` —
   Zod không chặn trùng, chạm `PRIMARY KEY (product_id, option_id)` ở DB, lỗi
   rơi xuống 500. Verify bằng repro thật trước/sau fix (`.superRefine()`).
2. **Docs tự mâu thuẫn** — `database-design.md` dòng 57 nói còn bảng
   `product_stickers`, dòng 100 cùng file nói đã bỏ.
3. **Bỏ tick option mất giá/nhãn đã nhập** — lệch chính spec phase 5 đã ghi
   ("tick tắt thì giữ giá trị"). Thêm field `ticked: boolean` tách trạng thái
   hiển thị khỏi dữ liệu.

### Trục trặc kỹ thuật đáng nhớ

`docker compose up --build` **không** nạp code mới do cache layer — fix code
xong test vẫn ra kết quả cũ (500), tưởng fix sai. Phải `docker compose build
--no-cache` mới đúng. `compose.yaml` build từ Dockerfile production, không
bind-mount source — khác thói quen dev server có hot-reload.

`ck plan check` tìm-thay chuỗi `Phase N` trên toàn file plan, không chỉ bảng
trạng thái — từng ăn nhầm nội dung giải thích trong bảng red-team thành chữ
"Completed". Phải viết thường (`phase N`) trong văn bản để tránh dính.

## Bài học

- **Cào dữ liệu thật trước khi tin giả định** — brainstorm ban đầu suýt seed sai
  nếu không có ảnh admin gốc + probe trực tiếp source.
- **Field tên gợi ý sai** (`DefaultName` nghe như "phân loại mặc định") có thể
  là bẫy — verify bằng cách đối chiếu UI thật, không suy diễn từ tên field.
- **Rebuild Docker sau khi sửa `server/` phải `--no-cache`** khi nghi ngờ code
  không được nạp — đừng kết luận "fix sai" trước khi loại trừ cache.

## Verify

Plan `260724-product-options-sticker-consolidation`: 6/6 phase completed.
FE/server lint/build sạch, vitest 10/10, 11/11 smoke xanh. Data verify qua SQL
trực tiếp (18/47/4, badge 2 category). Chưa commit.
