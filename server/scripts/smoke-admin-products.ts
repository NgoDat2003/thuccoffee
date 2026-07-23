import { randomUUID } from 'node:crypto';

import { Pool } from 'pg';

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } };

interface HttpResult<T> {
  status: number;
  body?: ApiResponse<T>;
}

interface AdminCategory {
  id: number;
  key: string;
  label: string;
  sortOrder: number;
}

interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  isPublished: boolean;
  categories: AdminCategory[];
}

const baseUrl = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8080').replace(/\/$/, '');
const adminEmail = process.env.ADMIN_EMAIL ?? '';
const adminPassword = process.env.ADMIN_PASSWORD ?? '';
const databaseUrl = process.env.DATABASE_URL
  ?? 'postgresql://thuccoffee:thuccoffee@127.0.0.1:5432/thuccoffee';

if (!adminEmail || !adminPassword) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
}

const pool = new Pool({ connectionString: databaseUrl });
const slug = 'smoke-test-' + randomUUID();
let cookie = '';
let productId: number | undefined;
let categoryToRestore: AdminCategory | undefined;
let failures = 0;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<HttpResult<T>> {
  const response = await fetch(baseUrl + path, init);
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) as ApiResponse<T> : undefined };
}

function jsonRequest<T>(method: string, path: string, body?: unknown, authenticated = true) {
  return request<T>(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated && cookie ? { Cookie: cookie } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function get<T>(path: string, authenticated = true) {
  return request<T>(path, {
    headers: authenticated && cookie ? { Cookie: cookie } : undefined,
  });
}

function expectSuccess<T>(result: HttpResult<T>, status = 200): T {
  assert(result.status === status, 'Expected ' + status + ', received ' + result.status);
  assert(result.body?.success, 'Expected success:true');
  return result.body.data;
}

function expectError<T>(result: HttpResult<T>, status: number, code?: string) {
  assert(result.status === status, 'Expected ' + status + ', received ' + result.status);
  assert(result.body && !result.body.success, 'Expected success:false');
  if (code) assert(result.body.error.code === code, 'Expected error code ' + code);
  return result.body.error;
}

async function check(name: string, run: () => Promise<void>): Promise<void> {
  try {
    await run();
    console.log('PASS ' + name);
  } catch (cause) {
    failures += 1;
    console.error('FAIL ' + name + ': ' + (cause instanceof Error ? cause.message : String(cause)));
  }
}

async function login() {
  const response = await fetch(baseUrl + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  assert(response.status === 200, 'Login failed with ' + response.status);
  const setCookie = response.headers.getSetCookie?.()[0] ?? response.headers.get('set-cookie');
  assert(setCookie, 'Login cookie missing');
  cookie = setCookie.split(';', 1)[0] ?? '';
}

await login();

try {
  await check('1. every admin endpoint requires authentication', async () => {
    const endpoints: Array<[string, string, unknown?]> = [
      ['GET', '/api/admin/products'],
      ['GET', '/api/admin/products/1'],
      ['POST', '/api/admin/products', {}],
      ['PUT', '/api/admin/products/1', {}],
      ['PATCH', '/api/admin/products/1/publish', {}],
      ['GET', '/api/admin/categories'],
      ['PUT', '/api/admin/categories/1', {}],
    ];
    for (const [method, path, body] of endpoints) {
      const result = method === 'GET'
        ? await get(path, false)
        : await jsonRequest(method, path, body, false);
      expectError(result, 401, 'UNAUTHORIZED');
    }
  });

  const categories = expectSuccess(await get<AdminCategory[]>('/api/admin/categories'));
  assert(categories.length > 0, 'No categories available for smoke test');
  const firstCategory = categories[0]!;
  const secondCategory = categories[1] ?? firstCategory;
  categoryToRestore = firstCategory;

  const createBody = {
    name: 'Smoke product',
    slug,
    price: 49000,
    priceEstimated: false,
    thumb: 'products/smoke.png',
    image: null,
    description: 'Created by smoke test',
    sortOrder: 9999,
    categoryIds: [firstCategory.id],
  };

  await check('2. create and admin list includes unpublished', async () => {
    const created = expectSuccess(
      await jsonRequest<AdminProduct>('POST', '/api/admin/products', createBody),
      201,
    );
    productId = created.id;
    assert(created.categories[0]?.id === firstCategory.id, 'Wrong category link');
    expectSuccess(await jsonRequest<AdminProduct>(
      'PATCH',
      '/api/admin/products/' + created.id + '/publish',
      { isPublished: false },
    ));
    const listed = expectSuccess(await get<AdminProduct[]>('/api/admin/products'));
    assert(listed.some((item) => item.id === created.id && !item.isPublished), 'Unpublished product omitted');
  });

  await check('3. duplicate slug maps to 409', async () => {
    expectError(
      await jsonRequest<AdminProduct>('POST', '/api/admin/products', createBody),
      409,
      'CONFLICT',
    );
  });

  await check('4. invalid slug returns field details', async () => {
    const apiError = expectError(
      await jsonRequest<AdminProduct>(
        'POST',
        '/api/admin/products',
        { ...createBody, slug: 'Invalid Slug ' + randomUUID() },
      ),
      400,
      'BAD_REQUEST',
    );
    assert(Array.isArray(apiError.details), 'Expected validation details array');
    assert(apiError.details.some((detail) => (
      typeof detail === 'object'
      && detail !== null
      && 'field' in detail
      && detail.field === 'slug'
    )), 'Expected slug validation detail');
  });

  await check('5. slug locked; fields and category links update', async () => {
    assert(productId, 'Product was not created');
    expectError(
      await jsonRequest<AdminProduct>(
        'PUT',
        '/api/admin/products/' + productId,
        { ...createBody, slug: slug + '-changed' },
      ),
      400,
      'BAD_REQUEST',
    );
    const updated = expectSuccess(await jsonRequest<AdminProduct>(
      'PUT',
      '/api/admin/products/' + productId,
      {
        name: 'Smoke product updated',
        price: 52000,
        priceEstimated: true,
        thumb: 'products/smoke-updated.png',
        image: 'products/smoke-detail.png',
        description: 'Updated by smoke test',
        sortOrder: 9998,
        categoryIds: [secondCategory.id],
      },
    ));
    assert(updated.name === 'Smoke product updated', 'Name did not update');
    assert(updated.categories[0]?.id === secondCategory.id, 'Category links not replaced');
  });

  await check('6. publish state is reflected by public API', async () => {
    assert(productId, 'Product was not created');
    expectSuccess(await jsonRequest<AdminProduct>(
      'PATCH',
      '/api/admin/products/' + productId + '/publish',
      { isPublished: false },
    ));
    const hidden = expectSuccess(await get<Array<{ slug: string }>>('/api/products', false));
    assert(!hidden.some((item) => item.slug === slug), 'Unpublished item remained public');
    expectSuccess(await jsonRequest<AdminProduct>(
      'PATCH',
      '/api/admin/products/' + productId + '/publish',
      { isPublished: true },
    ));
    const visible = expectSuccess(await get<Array<{ slug: string }>>('/api/products', false));
    assert(visible.some((item) => item.slug === slug), 'Published item missing publicly');
  });

  await check('7. category label updates and key is immutable', async () => {
    assert(categoryToRestore, 'No category selected');
    const temporaryLabel = categoryToRestore.label + ' smoke';
    const updated = expectSuccess(await jsonRequest<AdminCategory>(
      'PUT',
      '/api/admin/categories/' + categoryToRestore.id,
      { label: temporaryLabel, sortOrder: categoryToRestore.sortOrder },
    ));
    assert(updated.label === temporaryLabel, 'Category label did not update');
    const attempted = await jsonRequest<AdminCategory>(
      'PUT',
      '/api/admin/categories/' + categoryToRestore.id,
      {
        key: categoryToRestore.key + '-changed',
        label: temporaryLabel,
        sortOrder: categoryToRestore.sortOrder,
      },
    );
    if (attempted.status === 200) {
      assert(expectSuccess(attempted).key === categoryToRestore.key, 'Category key changed');
    } else {
      expectError(attempted, 400, 'BAD_REQUEST');
    }
  });

  await check('8. category create/delete with product-link guard', async () => {
    // Tạo mới: key tự sinh từ label có dấu tiếng Việt.
    const created = expectSuccess(await jsonRequest<AdminCategory>(
      'POST',
      '/api/admin/categories',
      { label: 'Món Smoke Thử ' + Date.now(), sortOrder: 9999 },
    ), 201);
    assert(/^mon-smoke-thu-\d+$/.test(created.key), 'Generated key mismatch: ' + created.key);

    // Gắn sản phẩm smoke vào danh mục mới → xóa phải bị 409.
    assert(productId, 'Product was not created');
    await pool.query(
      'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)',
      [productId, created.id],
    );
    expectError(await jsonRequest('DELETE', '/api/admin/categories/' + created.id), 409, 'CONFLICT');

    // Gỡ liên kết → xóa 204; xóa lần hai → 404.
    await pool.query('DELETE FROM product_categories WHERE category_id = $1', [created.id]);
    const removed = await jsonRequest('DELETE', '/api/admin/categories/' + created.id);
    assert(removed.status === 204, 'Expected 204, received ' + removed.status);
    expectError(await jsonRequest('DELETE', '/api/admin/categories/' + created.id), 404, 'NOT_FOUND');
  });
} finally {
  if (categoryToRestore) {
    await pool.query(
      'UPDATE categories SET label = $1, sort_order = $2 WHERE id = $3',
      [categoryToRestore.label, categoryToRestore.sortOrder, categoryToRestore.id],
    );
  }
  await pool.query('DELETE FROM products WHERE slug = $1', [slug]);
  await pool.end();
}

if (failures > 0) {
  console.error('Smoke admin products failed: ' + failures + '/8 checks failed.');
  process.exitCode = 1;
} else {
  console.log('Smoke admin products passed: 8/8 checks at ' + baseUrl + '.');
}