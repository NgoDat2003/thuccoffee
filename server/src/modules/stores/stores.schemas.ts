import { z } from 'zod';

export const storeParamsSchema = z.object({
  slug: z.string().trim().min(1),
});

export const storeSchema = z.object({
  name: z.string(),
  slug: z.string(),
  address: z.string(),
  phone: z.string(),
  hours: z.string(),
  image: z.string(),
});

export type StoreParams = z.infer<typeof storeParamsSchema>;
export type Store = z.infer<typeof storeSchema>;
