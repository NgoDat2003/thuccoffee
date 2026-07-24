import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  MembershipFaq,
  UpsertMembershipFaqInput,
} from '@server/src/modules/membership-faqs/membership-faqs.routes';
import type {
  GalleryItem,
  UpsertGalleryItemInput,
} from '@server/src/modules/site-gallery/site-gallery.routes';
import type {
  StaticPage,
  StaticPageKey,
  UpdateStaticPageInput,
} from '@server/src/modules/static-pages/static-pages.schemas';
import { apiDelete, apiGet, apiPost, apiPut } from '../../lib/api';
import {
  homeGalleryKeys,
  membershipFaqKeys,
  staticPageKeys,
} from '../static-pages.service';

export const adminStaticPageKeys = {
  all: ['admin-static-pages'] as const,
  list: () => [...adminStaticPageKeys.all, 'list'] as const,
};

export const adminFaqKeys = {
  all: ['admin-membership-faqs'] as const,
  list: () => [...adminFaqKeys.all, 'list'] as const,
};

export const adminGalleryKeys = {
  all: ['admin-gallery'] as const,
  list: () => [...adminGalleryKeys.all, 'list'] as const,
};

export function useAdminStaticPages() {
  return useQuery({
    queryKey: adminStaticPageKeys.list(),
    queryFn: () => apiGet<StaticPage[]>('/admin/pages'),
  });
}

export function useUpdateStaticPage(key: StaticPageKey) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateStaticPageInput) =>
      apiPut<StaticPage>('/admin/pages/' + key, input),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: adminStaticPageKeys.all }),
      queryClient.invalidateQueries({ queryKey: staticPageKeys.all }),
    ]),
  });
}

export function useAdminMembershipFaqs() {
  return useQuery({
    queryKey: adminFaqKeys.list(),
    queryFn: () => apiGet<MembershipFaq[]>('/admin/membership-faqs'),
  });
}

function useInvalidateFaqs() {
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: adminFaqKeys.all }),
    queryClient.invalidateQueries({ queryKey: membershipFaqKeys.all }),
  ]);
}

export function useCreateMembershipFaq() {
  const invalidate = useInvalidateFaqs();
  return useMutation({
    mutationFn: (input: UpsertMembershipFaqInput) =>
      apiPost<MembershipFaq>('/admin/membership-faqs', input),
    onSuccess: invalidate,
  });
}

export function useUpdateMembershipFaq() {
  const invalidate = useInvalidateFaqs();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpsertMembershipFaqInput }) =>
      apiPut<MembershipFaq>('/admin/membership-faqs/' + id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteMembershipFaq() {
  const invalidate = useInvalidateFaqs();
  return useMutation({
    mutationFn: (id: number) => apiDelete('/admin/membership-faqs/' + id),
    onSuccess: invalidate,
  });
}

export function useAdminGallery() {
  return useQuery({
    queryKey: adminGalleryKeys.list(),
    queryFn: () => apiGet<GalleryItem[]>('/admin/gallery'),
  });
}

function useInvalidateGallery() {
  const queryClient = useQueryClient();
  return () => Promise.all([
    queryClient.invalidateQueries({ queryKey: adminGalleryKeys.all }),
    queryClient.invalidateQueries({ queryKey: homeGalleryKeys.all }),
  ]);
}

export function useCreateGalleryItem() {
  const invalidate = useInvalidateGallery();
  return useMutation({
    mutationFn: (input: UpsertGalleryItemInput) =>
      apiPost<GalleryItem>('/admin/gallery', input),
    onSuccess: invalidate,
  });
}

export function useUpdateGalleryItem() {
  const invalidate = useInvalidateGallery();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpsertGalleryItemInput }) =>
      apiPut<GalleryItem>('/admin/gallery/' + id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteGalleryItem() {
  const invalidate = useInvalidateGallery();
  return useMutation({
    mutationFn: (id: number) => apiDelete('/admin/gallery/' + id),
    onSuccess: invalidate,
  });
}
