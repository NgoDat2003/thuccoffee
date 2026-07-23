import { z } from 'zod';

// Khớp check DB banners_type_valid: in ('promotion', 'right', 'slider').
export const bannerTypeSchema = z.enum(['promotion', 'right', 'slider']);

const bannerFields = {
  type: bannerTypeSchema,
  image: z.string().trim().min(1),
  altText: z.string().trim().min(1),
  linkUrl: z.string().trim().min(1).nullable(),
  // Field mở rộng optional: payload cũ thiếu field vẫn hợp lệ và giữ nguyên
  // giá trị hiện có khi update (undefined không được set vào DB).
  buttonLabel: z.string().trim().min(1).max(100).nullable().optional(),
  openInNewTab: z.boolean().optional(),
  // ISO datetime hoặc null = không giới hạn phía đó.
  startsAt: z.string().datetime({ offset: true }).nullable().optional(),
  endsAt: z.string().datetime({ offset: true }).nullable().optional(),
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
  buttonLabel: string | null;
  openInNewTab: boolean;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BannerType = z.infer<typeof bannerTypeSchema>;
export type CreateAdminBannerInput = z.infer<typeof createAdminBannerSchema>;
export type UpdateAdminBannerInput = z.infer<typeof updateAdminBannerSchema>;
export type ActivateAdminBannerInput = z.infer<typeof activateAdminBannerSchema>;
