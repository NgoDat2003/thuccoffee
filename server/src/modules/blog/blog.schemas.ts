import { z } from 'zod';

export const listBlogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

export const blogParamsSchema = z.object({
  slug: z.string().trim().min(1),
});

export const blogListItemSchema = z.object({
  title: z.string(),
  slug: z.string(),
  cover: z.string(),
  date: z.string().datetime(),
  summary: z.string(),
});

export const blogDetailSchema = blogListItemSchema.extend({
  content: z.string(),
});

export type ListBlogQuery = z.infer<typeof listBlogQuerySchema>;
export type BlogParams = z.infer<typeof blogParamsSchema>;
export type BlogListItem = z.infer<typeof blogListItemSchema>;
export type BlogDetail = z.infer<typeof blogDetailSchema>;
