import { z } from 'zod';

export const adminStickerIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const upsertAdminStickerSchema = z.object({
  label: z.string().trim().min(1).max(100),
  // Màu badge dạng CSS color (hex hoặc tên màu) hiển thị trên card sản phẩm.
  color: z.string().trim().min(1).max(50),
}).strict();

export interface AdminSticker {
  id: number;
  label: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminStickerIdParams = z.infer<typeof adminStickerIdParamsSchema>;
export type UpsertAdminStickerInput = z.infer<typeof upsertAdminStickerSchema>;
