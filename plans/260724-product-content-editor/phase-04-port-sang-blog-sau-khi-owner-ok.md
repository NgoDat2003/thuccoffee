---
phase: 4
title: "Port sang blog sau khi owner OK"
status: completed
priority: P3
effort: "15m (chi la verify, khong can code moi)"
dependencies: [1, 2, 3]
---

# Phase 4: Port sang blog sau khi owner OK

## Overview

Owner yêu cầu: sau khi duyệt phase 1-3 trên product, áp y hệt lên blog,
không đổi/thêm gì khác. Trước khi triển, cần nêu rõ một phát hiện quan
trọng: **Phase 1 và Phase 3 đã tự động áp dụng cho blog**, vì
`BlogAssetImage.tsx` và `BlogEditorToolbar.tsx` là component dùng chung
cho cả `ProductForm.tsx` và `AdminBlogFormPage.tsx` (cùng gọi qua
`ContentEditor.tsx`). Sửa 1 lần ở phase 1/3 đã có hiệu lực ở cả 2 nơi.

Phase 2 (public render content) khác — blog **đã có sẵn từ trước** khi dự
án làm public parity: `BlogDetailPage.tsx:39` đã
`dangerouslySetInnerHTML` với `resolveBlogContentImageUrls(post.content)`,
và `blog.schemas.ts`/`blog.service.ts` đã select + trả `content` ở public
API. Vậy phase 2 không có gì để "port" sang blog — nó đã tồn tại, product
chỉ đang đuổi theo cho kịp blog.

**Kết luận: phase này không cần viết code mới.** Chỉ cần verify không có
gì bị bỏ sót, và xác nhận với owner rằng "port sang blog" thực chất đã
xong tự động qua việc dùng chung component.

## Requirements

- Functional: xác nhận blog vẫn hoạt động đúng sau các thay đổi ở phase
  1-3 (không regress).
- Non-functional: không viết thêm code, không đổi gì ở blog ngoài những gì
  phase 1/3 đã tự động mang lại.
- Scope boundary: nếu owner phát hiện blog thực sự thiếu gì đó khác (ví dụ
  tính năng blog-only), đó là việc mới, ngoài scope phase này — quay lại
  brainstorm riêng, không tự ý mở rộng ở đây.

## Architecture

Không có thay đổi kiến trúc — đây là phase verify/xác nhận, không phải
implementation.

## Related Code Files

Không có file cần sửa. Đọc lại để verify:
- `frontend/src/components/admin/blog-editor/BlogAssetImage.tsx` (đã sửa ở
  phase 1)
- `frontend/src/components/admin/blog-editor/BlogEditorToolbar.tsx` (đã
  sửa ở phase 3)
- `frontend/src/pages/admin/AdminBlogFormPage.tsx` (nơi dùng
  `assetUrlScheme="blog-asset"`)
- `frontend/src/pages/BlogDetailPage.tsx` (public render, đã có từ trước)

## Implementation Steps

1. Sau khi owner duyệt phase 1-3 trên product, mở admin, sửa 1 bài blog,
   chèn ảnh vào nội dung — verify ảnh hiện đúng (đã đúng từ trước phase 1,
   xác nhận không regress sau khi đổi regex nhận diện scheme).
2. Verify color picker mới (phase 3) cũng xuất hiện và hoạt động trong
   blog editor — vì cùng `BlogEditorToolbar.tsx`.
3. Verify public blog detail page vẫn hiện đúng content + ảnh + màu chữ
   tự do sau khi lưu.
4. Báo lại owner: phase 1 và 3 đã tự động áp dụng cho blog; phase 2 blog
   vốn đã có sẵn không cần port. Nếu owner xác nhận đây đúng là ý muốn
   ("i chang ko đổi" — port y hệt, không đổi thêm), đóng phase này.
5. Nếu owner muốn blog có thêm thứ gì khác ngoài "y hệt product" (ví dụ
   phase 2 riêng cho blog vì lý do khác), dừng lại và hỏi — không tự suy
   diễn thêm việc.

## Success Criteria

- [x] Blog admin editor: ảnh chèn vào content hiện đúng, color picker mới
      hoạt động — không cần sửa code thêm.
- [x] Public blog detail page không regress sau các thay đổi ở phase 1-3.
- [x] Owner xác nhận việc "port sang blog" đã đủ (tự động qua component
      dùng chung), không cần thêm code riêng cho blog.

## Risk Assessment

Rủi ro thấp nhất trong 4 phase — về bản chất là bước verify, không phải
code mới. Rủi ro duy nhất: owner kỳ vọng phase 2 (public render) cũng phải
"port" tức là có thay đổi code nhìn thấy được ở blog, trong khi thực tế nó
đã tồn tại từ trước. Cần nói rõ điều này ở bước 4 để tránh hiểu lầm "chưa
làm gì cho blog".
