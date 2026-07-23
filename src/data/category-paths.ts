export const categoryPaths = {
  'san-pham-moi': 'san-pham-moi-t5p1s549',
  'yeu-thich-nhat': 'yeu-thich-nhat-t5p1s548',
  'mango-breeze': 'mango-breeze-t1p1s1470',
  'cold-brew-origins': 'cold-brew-origins-t1p1s1408',
  coffee: 'coffee-t1p1s494',
  'non-coffee': 'non-coffee-t1p1s138',
  tea: 'tea-t1p1s123',
  'milk-tea': 'milk-tea-t1p1s139',
  blended: 'blended-t1p1s119',
  cake: 'cake-t1p1s136',
} as const;

export type CategoryPathKey = keyof typeof categoryPaths;
type CategoryPath = (typeof categoryPaths)[CategoryPathKey];

// These opaque -t{n}p{n}s{id} suffixes intentionally mirror the source URLs.
const categoryKeysByPath = new Map<CategoryPath, CategoryPathKey>(
  Object.entries(categoryPaths).map(([key, path]) => [path, key as CategoryPathKey]),
);

// Product slug luôn mang hậu tố -s<id>t<n> cào từ site gốc; category tạo mới
// từ admin dùng key trần (không hậu tố). Dispatcher dựa vào đó để phân biệt
// mà không cần map tĩnh phủ hết.
const productSlugPattern = /-s\d+t\d+$/;

export function isCategoryPath(slug: string): boolean {
  return categoryKeysByPath.has(slug as CategoryPath) || !productSlugPattern.test(slug);
}

export function categoryKeyFromPath(slug: string): string | undefined {
  return categoryKeysByPath.get(slug as CategoryPath)
    ?? (productSlugPattern.test(slug) ? undefined : slug);
}

export function categoryHref(categoryKey: string): string {
  const path = categoryPaths[categoryKey as CategoryPathKey];
  // Category legacy giữ URL có hậu tố khớp site gốc; category mới dùng key trần.
  return '/menu/' + (path ?? categoryKey);
}
