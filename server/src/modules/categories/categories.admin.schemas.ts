import { z } from 'zod';

export const adminCategoryIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createAdminCategorySchema = z.object({
  label: z.string().trim().min(1),
  sortOrder: z.number().int(),
  badgeColor: z.string().trim().nullable().optional(),
}).strict();

export const updateAdminCategorySchema = z.object({
  label: z.string().trim().min(1),
  sortOrder: z.number().int(),
  badgeColor: z.string().trim().nullable().optional(),
}).strict();

export interface AdminCategory {
  id: number;
  key: string;
  label: string;
  sortOrder: number;
  badgeColor: string | null;
  productCount: number;
}

export type AdminCategoryIdParams = z.infer<typeof adminCategoryIdParamsSchema>;
export type CreateAdminCategoryInput = z.infer<typeof createAdminCategorySchema>;
export type UpdateAdminCategoryInput = z.infer<typeof updateAdminCategorySchema>;
