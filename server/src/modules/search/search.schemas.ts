import { z } from 'zod';

// Khớp URL nguồn: /search/...?type=Product|Blog&keyword=... — chấp nhận cả
// chữ hoa của nguồn lẫn chữ thường.
export const searchQuerySchema = z.object({
  type: z
    .string()
    .trim()
    .transform((value) => value.toLowerCase())
    .pipe(z.enum(['product', 'blog'])),
  keyword: z.string().trim().min(1).max(200),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(12),
});

export const productSearchItemSchema = z.object({
  name: z.string(),
  slug: z.string(),
  price: z.number().int().nonnegative(),
  priceEstimated: z.boolean(),
  thumb: z.string(),
});

export const blogSearchItemSchema = z.object({
  title: z.string(),
  slug: z.string(),
  cover: z.string(),
  date: z.string().datetime(),
  summary: z.string(),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type ProductSearchItem = z.infer<typeof productSearchItemSchema>;
export type BlogSearchItem = z.infer<typeof blogSearchItemSchema>;

export type SearchResult =
  | { type: 'product'; items: ProductSearchItem[]; total: number }
  | { type: 'blog'; items: BlogSearchItem[]; total: number };
