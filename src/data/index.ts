import { products } from './products';
import { blogPosts } from './blog';
import { stores } from './stores';
import { categories } from './categories';
import { pages } from './pages';
import type { BlogPost, Product } from './types';

export { products, blogPosts, stores, categories, pages };
export {
  categoryHref,
  categoryKeyFromPath,
  categoryPaths,
  isCategoryPath,
} from './category-paths';
export type { CategoryPathKey } from './category-paths';
export type { Product, BlogPost, Store, Category } from './types';

export const BLOG_PAGE_COUNT = 54;

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categoryKey: string): Product[] {
  return products.filter((p) => p.categories.includes(categoryKey));
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.slug !== product.slug && p.categories.some((c) => product.categories.includes(c)))
    .slice(0, limit);
}

export function getFeaturedProducts(limit = 8): Product[] {
  return getProductsByCategory('yeu-thich-nhat').slice(0, limit);
}

export function getStoreBySlug(slug: string) {
  return stores.find((s) => s.slug === slug);
}

export function getBlogBySlug(slug: string) {
  return blogPosts.find((b) => b.slug === slug);
}

export function getBlogPage(page: number, perPage = 5): BlogPost[] {
  if (!Number.isInteger(page) || page < 1 || perPage < 1 || blogPosts.length === 0) {
    return [];
  }

  const pageOffset = (page - 1) * perPage;

  // Intentional: pages beyond the 10 real posts repeat them (user-approved); real dates stay unchanged.
  return Array.from(
    { length: perPage },
    (_, index) => blogPosts[(pageOffset + index) % blogPosts.length],
  );
}
