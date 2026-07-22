---
phase: 3
title: "Verify build/lint & cập nhật docs"
status: completed
priority: P2
effort: "1h"
dependencies: [2]
---

# Phase 3: Verify build/lint & cập nhật docs

## Overview

Chốt vòng structure: verify build/lint sạch, xác nhận không page nào bị đụng, và
cập nhật CLAUDE.md + docs cho quy ước mới (service+hook thay ranh giới `index.ts`).

## Requirements

- Functional: quy ước tài liệu phản ánh đúng structure mới.
- Non-functional: FE build/lint sạch; CI container check (nếu chạy) pass.

## Architecture

Quyết định đổi quy ước ranh giới cần ghi lại để session sau không hiểu nhầm:
- CLAUDE.md mục "Quy ước không đọc code là biết" đang nói *"`src/data/index.ts` là
  ranh giới sẵn có với backend… chỉ đổi ruột các hàm này"*. Đổi thành: data-fetching
  qua service+hook trong `src/services/`, api client ở `src/lib/api/`, provider ở
  `src/providers/`. `src/data/*.ts` còn giữ cho tới khi page chuyển hết.

## Related Code Files

- Modify: `CLAUDE.md` — cập nhật mục ranh giới dữ liệu + thêm quy ước data-layer.
- Modify: `docs/backend-architecture.md` — mục "Ảnh hưởng tới frontend": ghi structure
  đã dựng (chỉ mô tả, không đổi quyết định).
- (Không sửa page/component nào.)

## Implementation Steps

1. `npm run build` + `npm run lint` — phải sạch.
2. `git status` / `git diff --stat` — xác nhận chỉ đụng: `package.json`,
   `package-lock.json`, `vite.config.ts`, `src/main.tsx`, các file mới trong
   `src/lib/api/`, `src/providers/`, `src/services/`, và tài liệu. **Không** file nào
   trong `src/pages/` hay `src/components/`.
3. Cập nhật CLAUDE.md mục ranh giới dữ liệu (giữ tiếng Việt, giữ dấu).
4. Cập nhật `docs/backend-architecture.md` phần FE impact (mô tả structure mới).
5. (Tùy chọn) chạy thử dev: `npm run dev` + backend `:8080`, gọi tay 1 hook trong
   một component tạm/throwaway để smoke-test proxy + unwrap, rồi xoá — KHÔNG commit
   file smoke. Chỉ làm nếu muốn chắc runtime; structure không bắt buộc bước này.

## Success Criteria

- [x] `npm run build` + `npm run lint` sạch.
- [x] `git diff` không chạm `src/pages/` hoặc `src/components/`.
- [x] CLAUDE.md phản ánh quy ước service+hook mới.
- [x] `docs/backend-architecture.md` mô tả structure đã dựng.

## Risk Assessment

- **Quên cập nhật CLAUDE.md → session sau theo quy ước cũ.** Đây là success criteria
  cứng của phase.
- **CI container check.** CI chạy mọi push; structure không đổi Dockerfile/nginx nên
  rủi ro thấp, nhưng verify build local trước khi đề nghị commit.

## Next Steps

Sau phase này structure sẵn sàng. Vòng kế (ngoài plan này): đổi từng page sang gọi
hook, xử lý 3 điểm lệch dữ liệu (date ISO, price/priceEstimated, async loading/error),
rồi xoá dần `src/data/index.ts`.
