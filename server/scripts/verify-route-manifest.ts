// Replay manifest URL nguồn trên local: mô phỏng route resolution của SPA
// (routes.tsx + category-paths.ts) và verify dữ liệu tồn tại qua API.
// Nginx fallback SPA luôn trả 200, nên check data-level chính xác hơn HTTP.
// Usage: tsx scripts/verify-route-manifest.ts [manifest.csv] [apiBaseUrl]
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const manifestPath = resolve(
  process.argv[2]
  ?? '../plans/260717-1000-thuccoffee-static-clone/reports/source-route-manifest.csv',
);
const apiBase = (process.argv[3] ?? process.env.API_BASE_URL ?? 'http://127.0.0.1:8080')
  .replace(/\/$/, '');

// Khớp categoryPaths trong src/data/category-paths.ts.
const categoryPathKeys = new Set([
  'san-pham-moi-t5p1s549', 'yeu-thich-nhat-t5p1s548', 'mango-breeze-t1p1s1470',
  'cold-brew-origins-t1p1s1408', 'coffee-t1p1s494', 'non-coffee-t1p1s138',
  'tea-t1p1s123', 'milk-tea-t1p1s139', 'blended-t1p1s119', 'cake-t1p1s136',
]);
const productSlugPattern = /-s\d+t\d+$/;

interface ManifestRow {
  status: string;
  kind: string;
  path: string;
}

function parseCsv(content: string): ManifestRow[] {
  const lines = content.replace(/^﻿/, '').split(/\r?\n/).filter(Boolean);
  const rows: ManifestRow[] = [];
  for (const line of lines.slice(1)) {
    // CSV field nào cũng được quote; tách bằng regex "..." đơn giản.
    const fields = [...line.matchAll(/"((?:[^"]|"")*)"/g)].map((m) => m[1]!.replaceAll('""', '"'));
    if (fields.length < 3) continue;
    rows.push({ status: fields[0]!, kind: fields[1]!, path: fields[2]! });
  }
  return rows;
}

const knownSlugs = {
  products: new Set<string>(),
  blog: new Set<string>(),
  stores: new Set<string>(),
};
// API resolve theo ID suffix khi text slug lệch (clone normalize slug).
const knownSuffixes = {
  products: new Set<string>(),
  blog: new Set<string>(),
};

function idSuffix(slug: string): string | undefined {
  return slug.match(/-s\d+t\d+$/)?.[0];
}

function hasSlugOrSuffix(kind: 'products' | 'blog', slug: string): boolean {
  if (knownSlugs[kind].has(slug)) return true;
  const suffix = idSuffix(slug);
  return suffix !== undefined && knownSuffixes[kind].has(suffix);
}
let blogTotalPages = 0;

async function apiGet<T>(path: string): Promise<{ data: T; meta?: { totalPages: number } }> {
  const response = await fetch(apiBase + path);
  if (!response.ok) throw new Error(`${path} → ${response.status}`);
  const body = await response.json() as { success: boolean; data: T; meta?: { totalPages: number } };
  if (!body.success) throw new Error(`${path} → success:false`);
  return { data: body.data, meta: body.meta };
}

// Nạp toàn bộ slug hợp lệ một lần thay vì gọi API từng URL (267 bài, 54 trang).
async function loadKnownData(): Promise<void> {
  const products = await apiGet<Array<{ slug: string }>>('/api/products');
  for (const product of products.data) {
    knownSlugs.products.add(product.slug);
    const suffix = idSuffix(product.slug);
    if (suffix) knownSuffixes.products.add(suffix);
  }

  const stores = await apiGet<Array<{ slug: string }>>('/api/stores');
  for (const store of stores.data) knownSlugs.stores.add(store.slug);

  const firstPage = await apiGet<unknown[]>('/api/blog?page=1');
  blogTotalPages = firstPage.meta?.totalPages ?? 0;
  for (let page = 1; page <= blogTotalPages; page += 1) {
    const result = await apiGet<Array<{ slug: string }>>(`/api/blog?page=${page}`);
    for (const post of result.data) {
      knownSlugs.blog.add(post.slug);
      const suffix = idSuffix(post.slug);
      if (suffix) knownSuffixes.blog.add(suffix);
    }
  }
}

type Verdict = { ok: true } | { ok: false; reason: string } | { excluded: string };

function normalizePath(path: string): string {
  // Manifest lưu path URL-encoded; DB slug lưu dạng decoded.
  const decoded = decodeURIComponent(path);
  return decoded.replace(/\/+$/, '') || '/';
}

async function verifyRoute(row: ManifestRow): Promise<Verdict> {
  const path = normalizePath(row.path);

  // 8 route legacy HTTP 500 phía nguồn: chủ động không tái tạo (scope §13).
  if (row.status !== '200') {
    return { excluded: `nguồn trả ${row.status} — không tái tạo lỗi legacy` };
  }
  // Public account nằm ngoài scope: login giữ demo, forgot-password không làm.
  if (path === '/account/forgot-password') {
    return { excluded: 'public account ngoài scope (quyết định §13.2)' };
  }

  if (path === '/') return { ok: true };
  if (path === '/account/login') return { ok: true }; // demo UI có route
  if (path === '/menu') return { ok: true };
  if (path === '/cua-hang') return { ok: true };
  if (path === '/chuyen-cua-thuc') return { ok: true };

  const staticPaths = new Set([
    '/gioi-thieu', '/chuong-trinh-thanh-vien', '/tuyen-dung',
    '/lien-he', '/chinh-sach', '/delivery',
  ]);
  if (staticPaths.has(path)) return { ok: true };

  const menuMatch = path.match(/^\/menu\/([^/]+)$/);
  if (menuMatch) {
    const slug = menuMatch[1]!;
    // Dispatcher FE: category path đã biết → MenuPage; slug có hậu tố sản phẩm
    // → ProductDetailPage; còn lại coi là category key trần.
    if (categoryPathKeys.has(slug)) return { ok: true };
    if (productSlugPattern.test(slug)) {
      return hasSlugOrSuffix('products', slug)
        ? { ok: true }
        : { ok: false, reason: 'product slug/suffix không có trong DB' };
    }
    return { ok: false, reason: 'menu slug không resolve được' };
  }

  const blogPageMatch = path.match(/^\/chuyen-cua-thuc\/t1p(\d+)$/);
  if (blogPageMatch) {
    const page = Number(blogPageMatch[1]);
    return page >= 1 && page <= blogTotalPages
      ? { ok: true }
      : { ok: false, reason: `blog page ${page} > totalPages ${blogTotalPages}` };
  }

  const blogDetailMatch = path.match(/^\/chuyen-cua-thuc\/([^/]+)$/);
  if (blogDetailMatch) {
    const slug = blogDetailMatch[1]!;
    return hasSlugOrSuffix('blog', slug)
      ? { ok: true }
      : { ok: false, reason: 'blog slug/suffix không có trong DB' };
  }

  const storeMatch = path.match(/^\/cua-hang\/([^/]+)$/);
  if (storeMatch) {
    const slug = storeMatch[1]!;
    return knownSlugs.stores.has(slug)
      ? { ok: true }
      : { ok: false, reason: 'store slug không có trong DB' };
  }

  return { ok: false, reason: 'không khớp route nào của SPA' };
}

const rows = parseCsv(readFileSync(manifestPath, 'utf-8'));
console.log(`Manifest: ${rows.length} URL từ ${manifestPath}`);
await loadKnownData();
console.log(`Data: ${knownSlugs.products.size} products, ${knownSlugs.blog.size} blog posts (${blogTotalPages} pages), ${knownSlugs.stores.size} stores.`);

let pass = 0;
const failures: Array<{ path: string; kind: string; reason: string }> = [];
const excluded: Array<{ path: string; reason: string }> = [];

for (const row of rows) {
  const verdict = await verifyRoute(row);
  if ('excluded' in verdict) excluded.push({ path: row.path, reason: verdict.excluded });
  else if (verdict.ok) pass += 1;
  else failures.push({ path: row.path, kind: row.kind, reason: verdict.reason });
}

console.log(`\nPASS: ${pass}/${rows.length - excluded.length} URL trong scope`);
console.log(`EXCLUDED: ${excluded.length} URL (có lý do ghi nhận)`);
for (const item of excluded) console.log(`  - ${item.path}: ${item.reason}`);

if (failures.length > 0) {
  console.error(`\nFAIL: ${failures.length} URL`);
  for (const item of failures) console.error(`  - [${item.kind}] ${item.path}: ${item.reason}`);
  process.exit(1);
}
console.log('\nRoute manifest replay: PASS.');
