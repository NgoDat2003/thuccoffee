const fallbackBaseUrl = import.meta.env.DEV
  ? 'http://localhost:9000/thuccoffee'
  : '/media';
const minioBaseUrl = (import.meta.env.VITE_MINIO_BASE_URL || fallbackBaseUrl)
  .replace(/\/+$/, '');
const placeholderKey = 'site/151b6674_circlelogo-white-blue-jul2023.png';

export function getImageUrl(objectKey: string): string {
  const normalizedKey = objectKey.replace(/^\/+/, '') || placeholderKey;
  return `${minioBaseUrl}/${normalizedKey}`;
}

const blogAssetPattern = /src="blog-asset:([^"]+)"/g;

export function resolveBlogContentImageUrls(content: string): string {
  // Marker `blog-asset:<objectKey>` đã chứa full object key (seed resolve sẵn),
  // nên chỉ nối base URL — không tự thêm prefix `blog/` (sai với ảnh dùng chung ở `site/`).
  return content.replace(blogAssetPattern, (_, objectKey: string) => (
    `src="${getImageUrl(objectKey)}"`
  ));
}
