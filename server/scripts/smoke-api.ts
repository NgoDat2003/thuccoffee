interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

type ApiResponse<T> =
  | { success: true; data: T; meta?: PaginationMeta }
  | { success: false; error: { code: string; message: string } };

interface HttpResult<T> {
  status: number;
  body: ApiResponse<T>;
}

interface Store {
  slug: string;
}

interface BlogPost {
  slug: string;
  date: string;
  content?: string;
}

interface Product {
  slug: string;
  price: number;
  priceEstimated: boolean;
  categories: string[];
}

const baseUrl = (
  process.argv[2]
  ?? process.env.API_BASE_URL
  ?? 'http://127.0.0.1:8080'
).replace(/\/$/, '');

let failures = 0;
let storeSlug: string | undefined;
let blogSlug: string | undefined;
let productSlug: string | undefined;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function get<T>(path: string): Promise<HttpResult<T>> {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.json() as ApiResponse<T>;
  return { status: response.status, body };
}

function expectSuccess<T>(result: HttpResult<T>): T {
  assert(result.status === 200, `Expected 200, received ${result.status}`);
  assert(result.body.success, 'Expected success:true');
  return result.body.data;
}

function expectError<T>(result: HttpResult<T>, status: number): void {
  assert(result.status === status, `Expected ${status}, received ${result.status}`);
  assert(!result.body.success, 'Expected success:false');
}

async function check(name: string, run: () => Promise<void>): Promise<void> {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL ${name}: ${message}`);
  }
}

await check('GET /api/categories', async () => {
  const data = expectSuccess(await get<Array<{ key: string; label: string }>>(
    '/api/categories',
  ));
  assert(Array.isArray(data) && data.length === 10, 'Expected 10 categories');
  assert(data.every((item) => item.key && item.label), 'Invalid category shape');
});

await check('GET /api/banners', async () => {
  const data = expectSuccess(await get<unknown[]>('/api/banners'));
  assert(Array.isArray(data), 'Expected banner array');
});

await check('GET /api/stores', async () => {
  const data = expectSuccess(await get<Store[]>('/api/stores'));
  assert(data.length === 7, 'Expected 7 stores');
  assert(data[0]?.slug, 'Expected a dynamic store slug');
  storeSlug = data[0].slug;
});

await check('GET /api/stores/:slug', async () => {
  assert(storeSlug, 'Store list did not provide a slug');
  const data = expectSuccess(await get<Store>(`/api/stores/${storeSlug}`));
  assert(data.slug === storeSlug, 'Store detail slug mismatch');
  expectError(await get<never>('/api/stores/khong-ton-tai'), 404);
});

await check('GET /api/blog', async () => {
  const page1 = await get<BlogPost[]>('/api/blog?page=1');
  const data = expectSuccess(page1);
  assert(data.length === 5, 'Expected 5 posts on page 1');
  assert(page1.body.success && page1.body.meta, 'Expected pagination meta');
  assert(page1.body.meta.total === 267, 'Expected 267 published posts');
  assert(page1.body.meta.totalPages === 54, 'Expected 54 pages');
  assert(data[0]?.slug, 'Expected a dynamic blog slug');
  assert(!Number.isNaN(Date.parse(data[0].date)), 'Expected ISO blog date');
  blogSlug = data[0].slug;

  const page2 = expectSuccess(await get<BlogPost[]>('/api/blog?page=2'));
  assert(page2.length === 5, 'Expected 5 posts on page 2');
  assert(page2[0]?.slug !== blogSlug, 'Page 2 must differ from page 1');
  const page54 = expectSuccess(await get<BlogPost[]>('/api/blog?page=54'));
  assert(page54.length === 2, 'Expected 2 posts on page 54');
  expectError(await get<never>('/api/blog?page=abc'), 400);
});

await check('GET /api/blog/:slug', async () => {
  assert(blogSlug, 'Blog list did not provide a slug');
  const data = expectSuccess(await get<BlogPost>(`/api/blog/${blogSlug}`));
  assert(data.slug === blogSlug, 'Blog detail slug mismatch');
  assert(typeof data.content === 'string' && data.content.length > 0, 'Missing content');
  expectError(await get<never>('/api/blog/khong-ton-tai'), 404);
});

await check('GET /api/products', async () => {
  const data = expectSuccess(await get<Product[]>('/api/products'));
  assert(data.length === 42, 'Expected 42 products');
  assert(data.every((item) => typeof item.price === 'number'), 'Price must be a number');
  assert(data.every((item) => Array.isArray(item.categories)), 'Missing categories array');
  assert(data.every((item) => typeof item.priceEstimated === 'boolean'), 'Missing priceEstimated');
  const product = data.find((item) => item.categories.length > 0);
  assert(product, 'Expected a product with a category');
  const selectedCategory = product.categories[0];
  assert(selectedCategory, 'Expected a dynamic category key');
  productSlug = product.slug;

  const filtered = expectSuccess(await get<Product[]>(
    `/api/products?category=${encodeURIComponent(selectedCategory)}`,
  ));
  assert(filtered.length > 0, 'Expected filtered products');
  assert(
    filtered.every((item) => item.categories.includes(selectedCategory)),
    'Category filter returned an unrelated product',
  );
  const invalid = expectSuccess(await get<Product[]>(
    '/api/products?category=khong-ton-tai',
  ));
  assert(invalid.length === 0, 'Unknown category must return an empty array');
});

await check('GET /api/products/:slug', async () => {
  assert(productSlug, 'Product list did not provide a slug');
  const data = expectSuccess(await get<Product>(`/api/products/${productSlug}`));
  assert(data.slug === productSlug, 'Product detail slug mismatch');
  assert(typeof data.price === 'number', 'Product detail price must be a number');
  expectError(await get<never>('/api/products/khong-ton-tai'), 404);
});

if (failures > 0) {
  console.error(`Smoke API failed: ${failures}/8 checks failed.`);
  process.exitCode = 1;
} else {
  console.log(`Smoke API passed: 8/8 checks at ${baseUrl}.`);
}
