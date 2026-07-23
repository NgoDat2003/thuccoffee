import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  ActivateAdminBannerInput,
  AdminBanner,
  CreateAdminBannerInput,
  UpdateAdminBannerInput,
} from '../../../server/src/modules/banners/banners.admin.schemas';
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../../lib/api';
import { bannerKeys } from '../banners.service';

export const adminBannerKeys = {
  all: ['admin-banners'] as const,
  list: () => [...adminBannerKeys.all, 'list'] as const,
};

function useInvalidateBanners() {
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: adminBannerKeys.all }),
    queryClient.invalidateQueries({ queryKey: bannerKeys.all }),
  ]);
}

export function useAdminBanners() {
  return useQuery({
    queryKey: adminBannerKeys.list(),
    queryFn: () => apiGet<AdminBanner[]>('/admin/banners'),
  });
}

export function useCreateBanner() {
  const invalidate = useInvalidateBanners();
  return useMutation({
    mutationFn: (input: CreateAdminBannerInput) =>
      apiPost<AdminBanner>('/admin/banners', input),
    onSuccess: invalidate,
  });
}

export function useUpdateBanner(id: number) {
  const invalidate = useInvalidateBanners();
  return useMutation({
    mutationFn: (input: UpdateAdminBannerInput) =>
      apiPut<AdminBanner>('/admin/banners/' + id, input),
    onSuccess: invalidate,
  });
}

export function useActivateBanner() {
  const invalidate = useInvalidateBanners();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ActivateAdminBannerInput }) =>
      apiPatch<AdminBanner>('/admin/banners/' + id + '/activate', input),
    onSuccess: invalidate,
  });
}

export function useDeleteBanner() {
  const invalidate = useInvalidateBanners();
  return useMutation({
    mutationFn: (id: number) => apiDelete('/admin/banners/' + id),
    onSuccess: invalidate,
  });
}
