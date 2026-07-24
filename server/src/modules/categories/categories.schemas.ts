import { z } from 'zod';

export const categorySchema = z.object({
  key: z.string(),
  label: z.string(),
  // 'category' = danh mục thật; 'presentation' = nhóm trình bày (Sản phẩm mới,
  // Yêu thích nhất). Nav menu khớp nguồn hiển thị cả hai; consumer cần taxonomy
  // thật thì lọc kind === 'category'.
  kind: z.enum(['category', 'presentation']),
  badgeColor: z.string().nullable().optional(),
});

export type Category = z.infer<typeof categorySchema>;
