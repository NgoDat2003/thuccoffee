import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  AdminCategory,
  UpdateAdminCategoryInput,
} from '../../../server/src/modules/categories/categories.admin.schemas';
import { apiGet, apiPut } from '../../lib/api';
import { categoryKeys } from '../categories.service';

export const adminCategoryKeys = {
  all: ['admin-categories'] as const,
  list: () => [...adminCategoryKeys.all, 'list'] as const,
};

function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: adminCategoryKeys.all }),
    queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  ]);
}

export function useAdminCategories() {
  return useQuery({
    queryKey: adminCategoryKeys.list(),
    queryFn: () => apiGet<AdminCategory[]>('/admin/categories'),
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