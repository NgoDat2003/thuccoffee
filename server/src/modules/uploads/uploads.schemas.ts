import { z } from 'zod';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const uploadKindSchema = z.enum([
  'products',
  'blog',
  'stores',
  'banners',
  'site',
]);

export type UploadKind = z.infer<typeof uploadKindSchema>;

export const allowedImageExtensions = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
] as const;

export type AllowedImageExtension = typeof allowedImageExtensions[number];