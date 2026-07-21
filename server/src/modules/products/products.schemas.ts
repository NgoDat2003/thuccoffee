import { z } from 'zod';

export const listProductsQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
});

export const productParamsSchema = z.object({
  slug: z.string().trim().min(1),
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
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type ProductParams = z.infer<typeof productParamsSchema>;
export type Product = z.infer<typeof productSchema>;
