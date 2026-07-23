import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  AdminSticker,
  UpsertAdminStickerInput,
} from '../../../server/src/modules/stickers/stickers.admin.schemas';
import { apiDelete, apiGet, apiPost, apiPut } from '../../lib/api';
import { productKeys } from '../products.service';

export interface AdminProductOption {
  id: number;
  name: string;
  sortOrder: number;
}

export const adminStickerKeys = {
  all: ['admin-stickers'] as const,
  list: () => [...adminStickerKeys.all, 'list'] as const,
};

export const adminProductOptionKeys = {
  all: ['admin-product-options'] as const,
  list: () => [...adminProductOptionKeys.all, 'list'] as const,
};

export function useAdminProductOptions() {
  return useQuery({
    queryKey: adminProductOptionKeys.list(),
    queryFn: () => apiGet<AdminProductOption[]>('/admin/product-options'),
  });
}

export function useAdminStickers() {
  return useQuery({
    queryKey: adminStickerKeys.list(),
    queryFn: () => apiGet<AdminSticker[]>('/admin/stickers'),
  });
}

function useInvalidateStickers() {
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: adminStickerKeys.all }),
    // Sticker hiển thị trên public product — invalidate luôn cache public.
    queryClient.invalidateQueries({ queryKey: productKeys.all }),
  ]);
}

export function useCreateSticker() {
  const invalidate = useInvalidateStickers();
  return useMutation({
    mutationFn: (input: UpsertAdminStickerInput) =>
      apiPost<AdminSticker>('/admin/stickers', input),
    onSuccess: invalidate,
  });
}

export function useUpdateSticker(id: number) {
  const invalidate = useInvalidateStickers();
  return useMutation({
    mutationFn: (input: UpsertAdminStickerInput) =>
      apiPut<AdminSticker>('/admin/stickers/' + id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteSticker() {
  const invalidate = useInvalidateStickers();
  return useMutation({
    mutationFn: (id: number) => apiDelete('/admin/stickers/' + id),
    onSuccess: invalidate,
  });
}
