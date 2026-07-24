import { z } from 'zod';

export const bannerSchema = z.object({
  type: z.enum(['promotion', 'right', 'slider']),
  image: z.string(),
  altText: z.string(),
  linkUrl: z.string().nullable(),
  buttonLabel: z.string().nullable(),
  openInNewTab: z.boolean(),
  sortOrder: z.number().int(),
});

export type Banner = z.infer<typeof bannerSchema>;
