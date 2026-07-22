import { useQuery } from '@tanstack/react-query';

import type { Banner } from '../../server/src/modules/banners/banners.schemas';
import { apiGet } from '../lib/api';

export const bannerKeys = {
  all: ['banners'] as const,
  list: () => [...bannerKeys.all, 'list'] as const,
};

export function useBanners() {
  return useQuery({
    queryKey: bannerKeys.list(),
    queryFn: () => apiGet<Banner[]>('/banners'),
  });
}
