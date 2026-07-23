import { z } from 'zod';

// Boolean query parse tường minh: 'true'/'1' bật filter, 'false'/'0' tắt —
// z.coerce.boolean() coi mọi chuỗi khác rỗng là true nên '?home=false' sẽ sai.
const queryFlagSchema = z
  .enum(['true', 'false', '1', '0'])
  .transform((value) => value === 'true' || value === '1')
  .optional();

export const listProductsQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  featured: queryFlagSchema,
  home: queryFlagSchema,
});

export const productParamsSchema = z.object({
  slug: z.string().trim().min(1),
});

// Lựa chọn phục vụ (nóng/lạnh/size) với giá tuyệt đối cho lựa chọn đó.
export const productOptionSchema = z.object({
  name: z.string(),
  price: z.number().int().nonnegative(),
});

export const productStickerSchema = z.object({
  label: z.string(),
  color: z.string(),
});

export const productSchema = z.object({
  name: z.string(),
  slug: z.string(),
  price: z.number().int().nonnegative(),
  priceEstimated: z.boolean(),
  categories: z.array(z.string()),
  thumb: z.string(),
  image: z.string().optional(),
  description: z.string().optional(),
  // default giữ input type optional — src/data/products.ts (nguồn seed)
  // dùng chung type này và không mang field trình bày/quan hệ.
  isFeatured: z.boolean().default(false),
  options: productOptionSchema.array().default([]),
  stickers: productStickerSchema.array().default([]),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type ProductParams = z.infer<typeof productParamsSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductOption = z.infer<typeof productOptionSchema>;
export type ProductSticker = z.infer<typeof productStickerSchema>;
// Input type cho dữ liệu crawl trong src/data/products.ts — không mang các
// field trình bày có default (isFeatured).
export type ProductSeedInput = z.input<typeof productSchema>;
