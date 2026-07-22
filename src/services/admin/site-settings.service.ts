import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  AdminSiteSetting,
  UpdateAdminSiteSettingsInput,
} from '../../../server/src/modules/site-settings/site-settings.admin.schemas';
import { apiGet, apiPut } from '../../lib/api';
import { siteSettingKeys } from '../site-settings.service';

export const adminSiteSettingKeys = {
  all: ['admin-site-settings'] as const,
  list: () => [...adminSiteSettingKeys.all, 'list'] as const,
};

export function useAdminSiteSettings() {
  return useQuery({
    queryKey: adminSiteSettingKeys.list(),
    queryFn: () => apiGet<AdminSiteSetting[]>('/admin/site-settings'),
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAdminSiteSettingsInput) =>
      apiPut<AdminSiteSetting[]>('/admin/site-settings', input),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: adminSiteSettingKeys.all }),
      queryClient.invalidateQueries({ queryKey: siteSettingKeys.all }),
    ]),
  });
}
