import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { SearchResult } from '../../server/src/modules/search/search.schemas';
import { apiGetPaginated } from '../lib/api';

export interface SearchFilter {
  type: 'product' | 'blog';
  keyword: string;
  page: number;
}

export const searchKeys = {
  all: ['search'] as const,
  result: (filter: SearchFilter) => [...searchKeys.all, filter] as const,
};

export function useSearch(filter: SearchFilter) {
  return useQuery({
    queryKey: searchKeys.result(filter),
    queryFn: () => apiGetPaginated<SearchResult>('/search', {
      params: {
        type: filter.type,
        keyword: filter.keyword,
        page: String(filter.page),
      },
    }),
    enabled: filter.keyword.trim().length > 0,
    placeholderData: keepPreviousData,
  });
}
