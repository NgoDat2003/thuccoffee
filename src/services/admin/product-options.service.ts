import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../lib/api';

export interface AdminProductOption {
  id: number;
  name: string;
  sortOrder: number;
}

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
