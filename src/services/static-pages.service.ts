import { useQuery } from '@tanstack/react-query';

import type { MembershipFaq } from '../../server/src/modules/membership-faqs/membership-faqs.routes';
import type { GalleryItem } from '../../server/src/modules/site-gallery/site-gallery.routes';
import type {
  StaticPage,
  StaticPageKey,
} from '../../server/src/modules/static-pages/static-pages.schemas';
import { apiGet } from '../lib/api';

export const staticPageKeys = {
  all: ['static-pages'] as const,
  page: (key: StaticPageKey) => [...staticPageKeys.all, key] as const,
};

export const membershipFaqKeys = {
  all: ['membership-faqs'] as const,
  list: () => [...membershipFaqKeys.all, 'list'] as const,
};

export const homeGalleryKeys = {
  all: ['home-gallery'] as const,
  list: () => [...homeGalleryKeys.all, 'list'] as const,
};

// content của page là JSON theo shape từng trang; hook parse sẵn cho page dùng.
export function useStaticPage<TContent>(key: StaticPageKey) {
  return useQuery({
    queryKey: staticPageKeys.page(key),
    queryFn: async () => {
      const page = await apiGet<StaticPage>(`/pages/${key}`);
      return { ...page, data: JSON.parse(page.content) as TContent };
    },
  });
}

export function useMembershipFaqs() {
  return useQuery({
    queryKey: membershipFaqKeys.list(),
    queryFn: () => apiGet<MembershipFaq[]>('/membership-faqs'),
  });
}

export function useHomeGallery() {
  return useQuery({
    queryKey: homeGalleryKeys.list(),
    queryFn: () => apiGet<GalleryItem[]>('/home-gallery'),
  });
}
