import { z } from 'zod';

const productFields = {
  name: z.string().trim().min(1),
  price: z.number().int().nonnegative(),
  priceEstimated: z.boolean(),
  thumb: z.string().trim().min(1),
  image: z.string().trim().min(1).nullable(),
  description: z.string().trim().nullable(),
  sortOrder: z.number().int(),
  categoryIds: z.array(z.number().int().positive()),
};

export const adminProductIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createAdminProductSchema = z.object({
  ...productFields,
  slug: z.string().trim().regex(/^[a-z0-9-]+$/),
}).strict();

export const updateAdminProductSchema = z.object(productFields).strict();

export const publishAdminProductSchema = z.object({
  isPublished: z.boolean(),
}).strict();

export interface AdminProductCategory {
  id: number;
  key: string;
  label: string;
}

export interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  priceEstimated: boolean;
  thumb: string;
  image: string | null;
  description: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  categories: AdminProductCategory[];
}

export type AdminProductIdParams = z.infer<typeof adminProductIdParamsSchema>;
export type CreateAdminProductInput = z.infer<typeof createAdminProductSchema>;
export type UpdateAdminProductInput = z.infer<typeof updateAdminProductSchema>;
export type PublishAdminProductInput = z.infer<typeof publishAdminProductSchema>;