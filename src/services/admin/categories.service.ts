import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  AdminCategory,
  CreateAdminCategoryInput,
  UpdateAdminCategoryInput,
} from '../../../server/src/modules/categories/categories.admin.schemas';
import { apiDelete, apiGet, apiPost, apiPut } from '../../lib/api';
import { categoryKeys } from '../categories.service';
import { productKeys } from '../products.service';

export const adminCategoryKeys = {
  all: ['admin-categories'] as const,
  list: () => [...adminCategoryKeys.all, 'list'] as const,
};

function useInvalidateCategories() {
  const queryClient = useQueryClient();
  // Sửa/xóa danh mục ảnh hưởng cả nav menu public lẫn nhãn danh mục trên
  // sản phẩm → invalidate cả ba nhóm key.
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all }),
    queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
    queryClient.invalidateQueries({ queryKey: productKeys.all }),
  ]);
}

export function useAdminCategories() {
  return useQuery({
    queryKey: adminCategoryKeys.list(),
    queryFn: () => apiGet<AdminCategory[]>('/admin/categories'),
  });
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (input: CreateAdminCategoryInput) =>
      apiPost<AdminCategory>('/admin/categories', input),
    onSuccess: invalidate,
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateAdminCategoryInput }) =>
      apiPut<AdminCategory>('/admin/categories/' + id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (id: number) => apiDelete('/admin/categories/' + id),
    onSuccess: invalidate,
  });
}
