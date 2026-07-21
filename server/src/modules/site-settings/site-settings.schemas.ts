import { z } from 'zod';

export const publicSiteSettingsSchema = z.object({
  siteTitle: z.string().min(1),
  brandHeading: z.string().min(1),
  tagline: z.string().min(1),
  logoStorageKey: z.string().min(1),
  hotline: z.string().min(1),
  contactEmail: z.string().email(),
  officeAddress: z.string().min(1),
  facebookUrl: z.string().url(),
  instagramUrl: z.string().url(),
  youtubeUrl: z.union([z.string().url(), z.literal('')]),
  footerCopyright: z.string().min(1),
});

export type PublicSiteSettings = z.infer<typeof publicSiteSettingsSchema>;
