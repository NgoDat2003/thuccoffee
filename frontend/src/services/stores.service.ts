import { useQuery } from '@tanstack/react-query';

import type {
  Store,
  StoreDetail,
} from '@server/src/modules/stores/stores.schemas';
import { apiGet } from '../lib/api';

export const storeKeys = {
  all: ['stores'] as const,
  list: () => [...storeKeys.all, 'list'] as const,
  detail: (slug: string) => [...storeKeys.all, 'detail', slug] as const,
};

export function useStores() {
  return useQuery({
    queryKey: storeKeys.list(),
    queryFn: () => apiGet<Store[]>('/stores'),
  });
}

export function useStore(slug: string) {
  return useQuery({
    queryKey: storeKeys.detail(slug),
    queryFn: () => apiGet<StoreDetail>(`/stores/${slug}`),
    enabled: Boolean(slug),
  });
}
