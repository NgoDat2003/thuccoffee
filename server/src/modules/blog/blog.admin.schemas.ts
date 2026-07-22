import { z } from 'zod';

const dateInputSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const blogFields = {
  title: z.string().trim().min(1),
  cover: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  content: z.string(),
  publishedAt: dateInputSchema,
};

export const listAdminBlogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  q: z.string().trim().min(1).optional(),
});

export const adminBlogIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createAdminBlogSchema = z.object({
  ...blogFields,
  slug: z.string().trim().regex(/^[a-z0-9-]+$/),
}).strict();

export const updateAdminBlogSchema = z.object(blogFields).strict();

export const publishAdminBlogSchema = z.object({
  isPublished: z.boolean(),
}).strict();

export const previewAdminBlogSchema = z.object({
  content: z.string(),
}).strict();

export interface AdminBlogListItem {
  id: number;
  title: string;
  slug: string;
  cover: string;
  summary: string;
  publishedAt: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBlogPost extends AdminBlogListItem {
  content: string;
}

export type ListAdminBlogQuery = z.infer<typeof listAdminBlogQuerySchema>;
export type CreateAdminBlogInput = z.infer<typeof createAdminBlogSchema>;
export type UpdateAdminBlogInput = z.infer<typeof updateAdminBlogSchema>;
export type PublishAdminBlogInput = z.infer<typeof publishAdminBlogSchema>;