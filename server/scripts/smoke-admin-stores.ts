import { randomUUID } from 'node:crypto';

import { Pool } from 'pg';

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } };

interface Result<T> {
  status: number;
  body?: ApiResponse<T>;
}

interface GalleryItem {
  storageKey: string;
  sortOrder: number;
}

interface AdminStore {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
  region: string | null;
  isPublished: boolean;
  sortOrder: number;
  galleryCount?: number;
  gallery?: GalleryItem[];
}

const baseUrl = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8080').replace(/\/$/, '');
const email = process.env.ADMIN_EMAIL ?? '';
const password = process.env.ADMIN_PASSWORD ?? '';
const databaseUrl = process.env.DATABASE_URL
  ?? 'postgresql://thuccoffee:thuccoffee@127.0.0.1:5432/thuccoffee';
const pool = new Pool({ connectionString: databaseUrl });
const slug = 'smoke-store-' + randomUUID();
let cookie = '';
let storeId: number | undefined;
let failures = 0;

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<Result<T>> {
  const response = await fetch(baseUrl + path, init);
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) as ApiResponse<T> : undefined };
}

function json<T>(method: string, path: string, body?: unknown, auth = true) {
  return request<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(auth && cookie ? { Cookie: cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

function get<T>(path: string, auth = true) {
  return request<T>(path, { headers: auth && cookie ? { Cookie: cookie } : undefined });
}

function success<T>(result: Result<T>, status = 200): T {
  assert(result.status === status, 'Expected ' + status + ', received ' + result.status);
  assert(result.body?.success, 'Expected success:true');
  return result.body.data;
}

function failure<T>(result: Result<T>, status: number, code?: string) {
  assert(result.status === status, 'Expected ' + status + ', received ' + result.status);
  assert(result.body && !result.body.success, 'Expected success:false');
  if (code) assert(result.body.error.code === code, 'Expected ' + code);
  return result.body.error;
}

async function check(name: string, run: () => Promise<void>) {
  try {
    await run();
    console.log('PASS ' + name);
  } catch (error) {
    failures += 1;
    console.error('FAIL ' + name + ': ' + (error instanceof Error ? error.message : String(error)));
  }
}

const login = await fetch(baseUrl + '/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
assert(login.status === 200, 'Login failed with ' + login.status);
const setCookie = login.headers.getSetCookie?.()[0] ?? login.headers.get('set-cookie');
assert(setCookie, 'Login cookie missing');
cookie = setCookie.split(';', 1)[0] ?? '';

const createBody = {
  name: 'Smoke store',
  slug,
  address: '1 Smoke Street',
  phone: '0900000000',
  hours: '07:00 - 22:00',
  image: 'stores/smoke-cover.png',
  region: 'Smoke region',
  sortOrder: 9999,
};
const gallery = [
  { storageKey: 'stores/smoke-b.png', sortOrder: 0 },
  { storageKey: 'stores/smoke-a.png', sortOrder: 1 },
];

try {
  await check('1. every admin store endpoint requires auth', async () => {
    const endpoints: Array<[string, string]> = [
      ['GET', '/api/admin/stores'],
      ['GET', '/api/admin/stores/1'],
      ['POST', '/api/admin/stores'],
      ['PUT', '/api/admin/stores/1'],
      ['PATCH', '/api/admin/stores/1/publish'],
      ['PUT', '/api/admin/stores/1/gallery'],
    ];
    for (const [method, path] of endpoints) {
      const result = method === 'GET' ? await get(path, false) : await json(method, path, {}, false);
      failure(result, 401, 'UNAUTHORIZED');
    }
  });

  await check('2. CRUD, duplicate slug and slug lock', async () => {
    const created = success(await json<AdminStore>('POST', '/api/admin/stores', createBody), 201);
    storeId = created.id;
    failure(await json('POST', '/api/admin/stores', createBody), 409, 'CONFLICT');
    // Update schema là strict và không có slug: gửi kèm slug (kể cả không đổi)
    // phải bị 400 — cùng cơ chế khóa slug với products/blog.
    failure(await json('PUT', '/api/admin/stores/' + created.id, { ...createBody, slug: slug + '-changed' }), 400, 'BAD_REQUEST');
    const { slug: _slug, ...updateBody } = createBody;
    const updated = success(await json<AdminStore>('PUT', '/api/admin/stores/' + created.id, {
      ...updateBody,
      name: 'Smoke store updated',
      sortOrder: 9998,
    }));
    assert(updated.name === 'Smoke store updated', 'Store update failed');
    const listed = success(await get<AdminStore[]>('/api/admin/stores'));
    assert(listed.some((item) => item.id === created.id), 'Admin list omitted created store');
  });

  await check('3. publish state reflects public list', async () => {
    assert(storeId, 'Store was not created');
    success(await json('PATCH', '/api/admin/stores/' + storeId + '/publish', { isPublished: false }));
    const hidden = success(await get<Array<{ slug: string }>>('/api/stores', false));
    assert(!hidden.some((item) => item.slug === slug), 'Unpublished store remained public');
    success(await json('PATCH', '/api/admin/stores/' + storeId + '/publish', { isPublished: true }));
    const visible = success(await get<Array<{ slug: string }>>('/api/stores', false));
    assert(visible.some((item) => item.slug === slug), 'Published store missing publicly');
  });

  await check('4. gallery replace is ordered, scoped and idempotent', async () => {
    assert(storeId, 'Store was not created');
    await pool.query(
      `INSERT INTO media_attachments (owner_type, owner_id, storage_key, role, sort_order)
       VALUES ('store', $1, 'stores/smoke-cover-role.png', 'cover', 0)`,
      [storeId],
    );
    success(await json('PUT', '/api/admin/stores/' + storeId + '/gallery', { items: gallery }));
    success(await json('PUT', '/api/admin/stores/' + storeId + '/gallery', { items: gallery }));

    const detail = success(await get<AdminStore>('/api/admin/stores/' + storeId));
    assert(JSON.stringify(detail.gallery) === JSON.stringify(gallery), 'Admin gallery order mismatch');
    const publicDetail = success(await get<{ gallery: string[] }>('/api/stores/' + slug, false));
    assert(JSON.stringify(publicDetail.gallery) === JSON.stringify(gallery.map((item) => item.storageKey)), 'Public gallery order mismatch');
    const coverRows = await pool.query(
      `SELECT count(*)::int AS count FROM media_attachments
       WHERE owner_type = 'store' AND owner_id = $1 AND role = 'cover'`,
      [storeId],
    );
    assert(coverRows.rows[0]?.count === 1, 'Gallery replace deleted another role');
  });

  await check('5. duplicate gallery key returns 400 before DB change', async () => {
    assert(storeId, 'Store was not created');
    const duplicate = { items: [gallery[0], { ...gallery[0], sortOrder: 2 }] };
    failure(await json('PUT', '/api/admin/stores/' + storeId + '/gallery', duplicate), 400, 'BAD_REQUEST');
    const rows = await pool.query<{ storage_key: string }>(
      `SELECT storage_key FROM media_attachments
       WHERE owner_type = 'store' AND owner_id = $1 AND role = 'gallery'
       ORDER BY sort_order, id`,
      [storeId],
    );
    assert(JSON.stringify(rows.rows.map((row) => row.storage_key)) === JSON.stringify(gallery.map((item) => item.storageKey)), 'Duplicate request touched DB');
  });
} finally {
  if (storeId) await pool.query("DELETE FROM media_attachments WHERE owner_type = 'store' AND owner_id = $1", [storeId]);
  await pool.query('DELETE FROM stores WHERE slug = $1', [slug]);
  await pool.end();
}

if (failures > 0) {
  console.error('Smoke admin stores failed: ' + failures + '/5 checks failed.');
  process.exitCode = 1;
} else {
  console.log('Smoke admin stores passed: 5/5 checks at ' + baseUrl + '.');
}