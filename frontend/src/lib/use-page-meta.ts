import { useEffect } from 'react';

const SITE_TITLE = 'Thức Coffee - Open 24/7';
const DEFAULT_DESCRIPTION =
  'Thương hiệu cà phê tự hào tiên phong trong lĩnh vực hoạt động 24H tại TP.HCM';

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} - ${SITE_TITLE}` : SITE_TITLE;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description ?? DEFAULT_DESCRIPTION;
  }, [title, description]);
}
