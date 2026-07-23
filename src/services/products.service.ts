import { useQuery } from '@tanstack/react-query';

import type { Product } from '../../server/src/modules/products/products.schemas';
import { apiGet } from '../lib/api';

export interface ProductListFilter {
  category?: string;
  featured?: boolean;
  home?: boolean;
}

export const productKeys = {
  all: ['products'] as const,
  list: (filter: ProductListFilter = {}) => [
    ...productKeys.all,
    'list',
    filter,
  ] as const,
  detail: (slug: string) => [...productKeys.all, 'detail', slug] as const,
};

export function useProducts(filter: ProductListFilter = {}) {
  const params: Record<string, string> = {};
  if (filter.category) params.category = filter.category;
  if (filter.featured) params.featured = 'true';
  if (filter.home) params.home = 'true';

  return useQuery({
    queryKey: productKeys.list(filter),
    queryFn: () => apiGet<Product[]>('/products', {
      params: Object.keys(params).length > 0 ? params : undefined,
    }),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => apiGet<Product>(`/products/${slug}`),
    enabled: Boolean(slug),
  });
}
