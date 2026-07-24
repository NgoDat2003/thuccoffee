import { z } from 'zod';

const storeFields = {
  name: z.string().trim().min(1),
  address: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  hours: z.string().trim().min(1),
  image: z.string().trim().min(1),
  region: z.string().trim().min(1).nullable(),
  // optional: payload cũ thiếu field giữ nguyên giá trị hiện có khi update.
  // Chỉ nhận https — URL này vào iframe src, chặn javascript:/http:.
  mapEmbedUrl: z.string().trim().url().max(2000)
    .refine((value) => value.startsWith('https://'), 'URL bản đồ phải dùng https.')
    .nullable().optional(),
  sortOrder: z.number().int(),
};

export const adminStoreIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createAdminStoreSchema = z.object({
  ...storeFields,
  slug: z.string().trim().regex(/^[a-z0-9-]+$/),
}).strict();

export const updateAdminStoreSchema = z.object(storeFields).strict();

export const publishAdminStoreSchema = z.object({
  isPublished: z.boolean(),
}).strict();

// Trùng storageKey trong cùng payload sẽ nổ uniqueIndex ở DB — chặn bằng Zod
// trước khi transaction chạy để trả 400 thay vì rơi vào lỗi constraint.
export const replaceAdminStoreGallerySchema = z.object({
  items: z.array(z.object({
    storageKey: z.string().trim().min(1),
    sortOrder: z.number().int(),
  })),
}).strict().refine(
  ({ items }) => new Set(items.map((item) => item.storageKey)).size === items.length,
  { message: 'Ảnh trong gallery không được trùng nhau.', path: ['items'] },
);

export interface AdminStoreGalleryItem {
  storageKey: string;
  sortOrder: number;
}

export interface AdminStoreListItem {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
  region: string | null;
  mapEmbedUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  galleryCount: number;
}

export interface AdminStore extends Omit<AdminStoreListItem, 'galleryCount'> {
  gallery: AdminStoreGalleryItem[];
}

export type AdminStoreIdParams = z.infer<typeof adminStoreIdParamsSchema>;
export type CreateAdminStoreInput = z.infer<typeof createAdminStoreSchema>;
export type UpdateAdminStoreInput = z.infer<typeof updateAdminStoreSchema>;
export type PublishAdminStoreInput = z.infer<typeof publishAdminStoreSchema>;
export type ReplaceAdminStoreGalleryInput = z.infer<typeof replaceAdminStoreGallerySchema>;
