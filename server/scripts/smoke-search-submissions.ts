// Smoke: search public + contact/newsletter submissions.
// Không cần auth; cần stack đang chạy và Postgres truy cập được để cleanup.
import { randomUUID } from 'node:crypto';

import { Pool } from 'pg';

type ApiResponse<T> =
  | { success: true; data: T; meta?: { page: number; pageSize: number; total: number; totalPages: number } }
  | { success: false; error: { code: string; message: string } };

interface HttpResult<T> {
  status: number;
  body?: ApiResponse<T>;
}

interface SearchResult {
  type: 'product' | 'blog';
  items: Array<Record<string, unknown>>;
  total: number;
}

const baseUrl = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8080').replace(/\/$/, '');
const databaseUrl = process.env.DATABASE_URL
  ?? 'postgresql://thuccoffee:thuccoffee@127.0.0.1:5432/thuccoffee';

const pool = new Pool({ connectionString: databaseUrl });
const testEmail = `smoke-${randomUUID()}@example.com`;
let failures = 0;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<HttpResult<T>> {
  const response = await fetch(baseUrl + path, init);
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) as ApiResponse<T> : undefined };
}

function post<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function expectSuccess<T>(result: HttpResult<T>, status = 200): T {
  assert(result.status === status, `Expected ${status}, received ${result.status}`);
  assert(result.body?.success, 'Expected success:true');
  return result.body.data;
}

async function check(name: string, run: () => Promise<void>): Promise<void> {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

await check('GET /api/search product', async () => {
  const result = await request<SearchResult>('/api/search?type=Product&keyword=coffee');
  const data = expectSuccess(result);
  assert(data.type === 'product', 'Expected product result type');
  assert(data.total > 0 && data.items.length > 0, 'Expected product matches for "coffee"');
  assert(result.body?.success && result.body.meta, 'Expected pagination meta');
});

await check('GET /api/search blog with diacritics', async () => {
  const keyword = encodeURIComponent('Khai trương');
  const data = expectSuccess(await request<SearchResult>(`/api/search?type=Blog&keyword=${keyword}`));
  assert(data.type === 'blog', 'Expected blog result type');
  assert(data.total > 0, 'Expected blog matches for "Khai trương"');
});

await check('GET /api/search empty result', async () => {
  const data = expectSuccess(await request<SearchResult>('/api/search?type=Product&keyword=zzz-khong-ton-tai'));
  assert(data.total === 0 && data.items.length === 0, 'Expected empty result');
});

await check('GET /api/search rejects invalid type', async () => {
  const result = await request('/api/search?type=Order&keyword=x');
  assert(result.status === 400, `Expected 400, received ${result.status}`);
});

await check('POST /api/submissions/contact persists', async () => {
  expectSuccess(await post('/api/submissions/contact', {
    name: 'Smoke Test',
    email: testEmail,
    phone: '0900000000',
    message: 'smoke-search-submissions contact check',
  }), 201);
  const { rows } = await pool.query(
    'SELECT status FROM contact_submissions WHERE email = $1',
    [testEmail],
  );
  assert(rows.length === 1 && rows[0].status === 'new', 'Expected 1 new contact row');
});

await check('POST /api/submissions/contact honeypot not persisted', async () => {
  const botEmail = `smoke-bot-${randomUUID()}@example.com`;
  expectSuccess(await post('/api/submissions/contact', {
    name: 'Bot',
    email: botEmail,
    message: 'spam',
    website: 'http://spam.example',
  }), 201);
  const { rows } = await pool.query(
    'SELECT 1 FROM contact_submissions WHERE email = $1',
    [botEmail],
  );
  assert(rows.length === 0, 'Honeypot submission must not be stored');
});

await check('POST /api/submissions/newsletter idempotent', async () => {
  expectSuccess(await post('/api/submissions/newsletter', { email: testEmail }), 201);
  expectSuccess(await post('/api/submissions/newsletter', { email: testEmail }), 201);
  const { rows } = await pool.query(
    'SELECT count(*)::int AS total FROM newsletter_subscriptions WHERE email = $1',
    [testEmail],
  );
  assert(rows[0].total === 1, 'Duplicate email must not create a second row');
});

// Cleanup record test.
await pool.query('DELETE FROM contact_submissions WHERE email = $1', [testEmail]);
await pool.query('DELETE FROM newsletter_subscriptions WHERE email = $1', [testEmail]);
await pool.end();

if (failures > 0) {
  console.error(`Smoke search/submissions failed: ${failures} check(s).`);
  process.exit(1);
}
console.log(`Smoke search/submissions passed: 7/7 checks at ${baseUrl}.`);
