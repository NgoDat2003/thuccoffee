import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  AdminProduct,
  CreateAdminProductInput,
  PublishAdminProductInput,
  UpdateAdminProductInput,
} from '../../../server/src/modules/products/products.admin.schemas';
import { apiGet, apiPatch, apiPost, apiPut } from '../../lib/api';
import { productKeys } from '../products.service';

export const adminProductKeys = {
  all: ['admin-products'] as const,
  list: () => [...adminProductKeys.all, 'list'] as const,
  detail: (id: number) => [...adminProductKeys.all, 'detail', id] as const,
};

function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: adminProductKeys.all }),
    queryClient.invalidateQueries({ queryKey: productKeys.all }),
  ]);
}

export function useAdminProducts() {
  return useQuery({
    queryKey: adminProductKeys.list(),
    queryFn: () => apiGet<AdminProduct[]>('/admin/products'),
  });
}

export function useAdminProduct(id?: number) {
  return useQuery({
    queryKey: adminProductKeys.detail(id ?? 0),
    queryFn: () => apiGet<AdminProduct>('/admin/products/' + id),
    enabled: id !== undefined,
  });
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (input: CreateAdminProductInput) =>
      apiPost<AdminProduct>('/admin/products', input),
    onSuccess: invalidate,
  });
}

export function useUpdateProduct(id: number) {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (input: UpdateAdminProductInput) =>
      apiPut<AdminProduct>('/admin/products/' + id, input),
    onSuccess: invalidate,
  });
}

export function usePublishProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PublishAdminProductInput }) =>
      apiPatch<AdminProduct>('/admin/products/' + id + '/publish', input),
    onSuccess: invalidate,
  });
}