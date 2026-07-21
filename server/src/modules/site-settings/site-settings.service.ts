import { inArray } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { siteSettings } from '../../db/schema.js';
import {
  publicSiteSettingsSchema,
  type PublicSiteSettings,
} from './site-settings.schemas.js';

const publicSettingKeys = [
  'site_title',
  'brand_heading',
  'tagline',
  'logo_storage_key',
  'hotline',
  'contact_email',
  'office_address',
  'facebook_url',
  'instagram_url',
  'youtube_url',
  'footer_copyright',
] as const;

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const rows = await db
    .select({ key: siteSettings.key, value: siteSettings.value })
    .from(siteSettings)
    .where(inArray(siteSettings.key, [...publicSettingKeys]));

  const values = new Map(rows.map(({ key, value }) => [key, value]));
  const parsed = publicSiteSettingsSchema.safeParse({
    siteTitle: values.get('site_title'),
    brandHeading: values.get('brand_heading'),
    tagline: values.get('tagline'),
    logoStorageKey: values.get('logo_storage_key'),
    hotline: values.get('hotline'),
    contactEmail: values.get('contact_email'),
    officeAddress: values.get('office_address'),
    facebookUrl: values.get('facebook_url'),
    instagramUrl: values.get('instagram_url'),
    youtubeUrl: values.get('youtube_url'),
    footerCopyright: values.get('footer_copyright'),
  });

  if (!parsed.success) {
    throw new Error('Cấu hình website công khai thiếu hoặc không hợp lệ.', {
      cause: parsed.error,
    });
  }

  return parsed.data;
}
