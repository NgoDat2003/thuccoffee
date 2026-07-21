import { z } from 'zod';

export const categorySchema = z.object({
  key: z.string(),
  label: z.string(),
});

export type Category = z.infer<typeof categorySchema>;
