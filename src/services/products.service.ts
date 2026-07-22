import { useQuery } from '@tanstack/react-query';

import type { Product } from '../../server/src/modules/products/products.schemas';
import { apiGet } from '../lib/api';

export const productKeys = {
  all: ['products'] as const,
  list: (category?: string) => [
    ...productKeys.all,
    'list',
    { category },
  ] as const,
  detail: (slug: string) => [...productKeys.all, 'detail', slug] as const,
};

export function useProducts(category?: string) {
  return useQuery({
    queryKey: productKeys.list(category),
    queryFn: () => apiGet<Product[]>('/products', {
      params: category ? { category } : undefined,
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
