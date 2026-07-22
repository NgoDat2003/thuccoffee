import { z } from 'zod';

export const adminCategoryIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateAdminCategorySchema = z.object({
  label: z.string().trim().min(1),
  sortOrder: z.number().int(),
}).strict();

export interface AdminCategory {
  id: number;
  key: string;
  label: string;
  sortOrder: number;
}

export type AdminCategoryIdParams = z.infer<typeof adminCategoryIdParamsSchema>;
export type UpdateAdminCategoryInput = z.infer<typeof updateAdminCategorySchema>;