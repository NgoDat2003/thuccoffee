import { useQuery } from '@tanstack/react-query';

import type {
  BlogDetail,
  BlogListItem,
} from '@server/src/modules/blog/blog.schemas';
import { apiGet, apiGetPaginated } from '../lib/api';

export const blogKeys = {
  all: ['blog'] as const,
  page: (page: number) => [...blogKeys.all, 'list', { page }] as const,
  detail: (slug: string) => [...blogKeys.all, 'detail', slug] as const,
};

export function useBlogPage(page: number) {
  return useQuery({
    queryKey: blogKeys.page(page),
    queryFn: () => apiGetPaginated<BlogListItem[]>('/blog', {
      params: { page },
    }),
    enabled: page > 0,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: blogKeys.detail(slug),
    queryFn: () => apiGet<BlogDetail>(`/blog/${slug}`),
    enabled: Boolean(slug),
  });
}
