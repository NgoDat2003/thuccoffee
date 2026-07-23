import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  AdminBlogListItem,
  AdminBlogPost,
  CreateAdminBlogInput,
  PublishAdminBlogInput,
  UpdateAdminBlogInput,
} from '../../../server/src/modules/blog/blog.admin.schemas';
import { apiGet, apiGetPaginated, apiPatch, apiPost, apiPut } from '../../lib/api';
import { blogKeys } from '../blog.service';

export interface AdminBlogListParams {
  page: number;
  q: string;
  status: 'all' | 'published' | 'draft';
  sortBy?: 'title' | 'publishedAt' | 'updatedAt';
  sortDir?: 'asc' | 'desc';
}

export const adminBlogKeys = {
  all: ['admin-blog'] as const,
  list: (params: AdminBlogListParams) => [...adminBlogKeys.all, 'list', params] as const,
  detail: (id: number) => [...adminBlogKeys.all, 'detail', id] as const,
};

function useInvalidateBlog() {
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: adminBlogKeys.all }),
    queryClient.invalidateQueries({ queryKey: blogKeys.all }),
  ]);
}

export function useAdminBlogList(params: AdminBlogListParams) {
  return useQuery({
    queryKey: adminBlogKeys.list(params),
    queryFn: () => apiGetPaginated<AdminBlogListItem[]>('/admin/blog', {
      params: {
        page: params.page,
        limit: 10,
        status: params.status,
        ...(params.q ? { q: params.q } : {}),
        ...(params.sortBy && params.sortDir
          ? { sortBy: params.sortBy, sortDir: params.sortDir }
          : {}),
      },
    }),
  });
}

export function useAdminBlogPost(id?: number) {
  return useQuery({
    queryKey: adminBlogKeys.detail(id ?? 0),
    queryFn: () => apiGet<AdminBlogPost>('/admin/blog/' + id),
    enabled: id !== undefined,
  });
}

export function useCreateBlogPost() {
  const invalidate = useInvalidateBlog();
  return useMutation({
    mutationFn: (input: CreateAdminBlogInput) => apiPost<AdminBlogPost>('/admin/blog', input),
    onSuccess: invalidate,
  });
}

export function useUpdateBlogPost(id: number) {
  const invalidate = useInvalidateBlog();
  return useMutation({
    mutationFn: ({ input, preserveContent }: { input: UpdateAdminBlogInput; preserveContent?: boolean }) => (
      apiPut<AdminBlogPost>(
        '/admin/blog/' + id,
        input,
        preserveContent
          ? { headers: { 'X-Thuc-Preserve-Blog-Content': 'true' } }
          : undefined,
      )
    ),
    onSuccess: invalidate,
  });
}

export function usePublishBlogPost() {
  const invalidate = useInvalidateBlog();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PublishAdminBlogInput }) => (
      apiPatch<AdminBlogPost>('/admin/blog/' + id + '/publish', input)
    ),
    onSuccess: invalidate,
  });
}

export function usePreviewBlogContent() {
  return useMutation({
    mutationFn: (content: string) => apiPost<{ html: string }>('/admin/blog/preview', { content }),
  });
}
