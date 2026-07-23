import { z } from 'zod';

const productFields = {
  name: z.string().trim().min(1),
  price: z.number().int().nonnegative(),
  priceEstimated: z.boolean(),
  thumb: z.string().trim().min(1),
  image: z.string().trim().min(1).nullable(),
  description: z.string().trim().nullable(),
  sortOrder: z.number().int(),
  // optional: payload cũ thiếu field vẫn hợp lệ; update giữ nguyên giá trị
  // hiện có (undefined không được set vào DB), create dùng default của DB.
  isFeatured: z.boolean().optional(),
  showOnHome: z.boolean().optional(),
  homePriority: z.number().int().optional(),
  categoryIds: z.array(z.number().int().positive()),
  // Giá tuyệt đối của lựa chọn (nóng/lạnh/size); thứ tự mảng = sortOrder.
  // optional (không default): payload thiếu field = GIỮ NGUYÊN link hiện có,
  // tránh client cũ vô tình xóa sạch option/sticker khi update.
  optionLinks: z.array(z.object({
    optionId: z.number().int().positive(),
    price: z.number().int().nonnegative(),
  })).optional(),
  stickerIds: z.array(z.number().int().positive()).optional(),
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

export interface AdminProductOptionLink {
  optionId: number;
  name: string;
  price: number;
}

export interface AdminProductSticker {
  id: number;
  label: string;
  color: string;
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
  isFeatured: boolean;
  showOnHome: boolean;
  homePriority: number;
  createdAt: string;
  updatedAt: string;
  categories: AdminProductCategory[];
  optionLinks: AdminProductOptionLink[];
  stickers: AdminProductSticker[];
}

export type AdminProductIdParams = z.infer<typeof adminProductIdParamsSchema>;
export type CreateAdminProductInput = z.infer<typeof createAdminProductSchema>;
export type UpdateAdminProductInput = z.infer<typeof updateAdminProductSchema>;
export type PublishAdminProductInput = z.infer<typeof publishAdminProductSchema>;