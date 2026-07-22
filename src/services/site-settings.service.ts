import { useQuery } from '@tanstack/react-query';

import type { PublicSiteSettings } from '../../server/src/modules/site-settings/site-settings.schemas';
import { apiGet } from '../lib/api';

export const siteSettingKeys = {
  all: ['site-settings'] as const,
  detail: () => [...siteSettingKeys.all, 'detail'] as const,
};

export function useSiteSettings() {
  return useQuery({
    queryKey: siteSettingKeys.detail(),
    queryFn: () => apiGet<PublicSiteSettings>('/site-settings'),
  });
}
