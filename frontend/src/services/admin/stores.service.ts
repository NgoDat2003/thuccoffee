import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  AdminStore,
  AdminStoreListItem,
  CreateAdminStoreInput,
  PublishAdminStoreInput,
  ReplaceAdminStoreGalleryInput,
  UpdateAdminStoreInput,
} from '@server/src/modules/stores/stores.admin.schemas';
import { apiGet, apiPatch, apiPost, apiPut } from '../../lib/api';
import { storeKeys } from '../stores.service';

export const adminStoreKeys = {
  all: ['admin-stores'] as const,
  list: () => [...adminStoreKeys.all, 'list'] as const,
  detail: (id: number) => [...adminStoreKeys.all, 'detail', id] as const,
};

function useInvalidateStores() {
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: adminStoreKeys.all }),
    queryClient.invalidateQueries({ queryKey: storeKeys.all }),
  ]);
}

export function useAdminStores() {
  return useQuery({
    queryKey: adminStoreKeys.list(),
    queryFn: () => apiGet<AdminStoreListItem[]>('/admin/stores'),
  });
}

export function useAdminStore(id?: number) {
  return useQuery({
    queryKey: adminStoreKeys.detail(id ?? 0),
    queryFn: () => apiGet<AdminStore>('/admin/stores/' + id),
    enabled: id !== undefined,
  });
}

export function useCreateStore() {
  const invalidate = useInvalidateStores();
  return useMutation({
    mutationFn: (input: CreateAdminStoreInput) =>
      apiPost<AdminStore>('/admin/stores', input),
    onSuccess: invalidate,
  });
}

export function useUpdateStore(id: number) {
  const invalidate = useInvalidateStores();
  return useMutation({
    mutationFn: (input: UpdateAdminStoreInput) =>
      apiPut<AdminStore>('/admin/stores/' + id, input),
    onSuccess: invalidate,
  });
}

export function usePublishStore() {
  const invalidate = useInvalidateStores();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PublishAdminStoreInput }) =>
      apiPatch<AdminStore>('/admin/stores/' + id + '/publish', input),
    onSuccess: invalidate,
  });
}

export function useReplaceStoreGallery(id: number) {
  const invalidate = useInvalidateStores();
  return useMutation({
    mutationFn: (input: ReplaceAdminStoreGalleryInput) =>
      apiPut<AdminStore>('/admin/stores/' + id + '/gallery', input),
    onSuccess: invalidate,
  });
}
