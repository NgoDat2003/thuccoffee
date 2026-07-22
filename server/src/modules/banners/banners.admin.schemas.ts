import { z } from 'zod';

// Khớp check DB banners_type_valid: in ('promotion', 'right', 'slider').
export const bannerTypeSchema = z.enum(['promotion', 'right', 'slider']);

const bannerFields = {
  type: bannerTypeSchema,
  image: z.string().trim().min(1),
  altText: z.string().trim().min(1),
  linkUrl: z.string().trim().min(1).nullable(),
  sortOrder: z.number().int(),
};

export const adminBannerIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createAdminBannerSchema = z.object(bannerFields).strict();
export const updateAdminBannerSchema = z.object(bannerFields).strict();

export const activateAdminBannerSchema = z.object({
  isActive: z.boolean(),
}).strict();

export interface AdminBanner {
  id: number;
  type: z.infer<typeof bannerTypeSchema>;
  image: string;
  altText: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BannerType = z.infer<typeof bannerTypeSchema>;
export type CreateAdminBannerInput = z.infer<typeof createAdminBannerSchema>;
export type UpdateAdminBannerInput = z.infer<typeof updateAdminBannerSchema>;
export type ActivateAdminBannerInput = z.infer<typeof activateAdminBannerSchema>;
