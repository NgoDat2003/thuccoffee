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

export function isCategoryPath(slug: string): slug is CategoryPath {
  return categoryKeysByPath.has(slug as CategoryPath);
}

export function categoryKeyFromPath(slug: string): CategoryPathKey | undefined {
  return categoryKeysByPath.get(slug as CategoryPath);
}

export function categoryHref(categoryKey: string): string {
  const path = categoryPaths[categoryKey as CategoryPathKey];
  return path ? '/menu/' + path : '/menu';
}
