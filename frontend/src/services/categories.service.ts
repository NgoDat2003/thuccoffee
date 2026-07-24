import { useQuery } from '@tanstack/react-query';

import type { Category } from '@server/src/modules/categories/categories.schemas';
import { apiGet } from '../lib/api';

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => apiGet<Category[]>('/categories'),
  });
}
