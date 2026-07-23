import { randomUUID } from 'node:crypto';

import { Pool } from 'pg';

type ApiResponse<T> =
  | { success: true; data: T; meta?: PaginationMeta }
  | { success: false; error: { code: string; message: string; details?: unknown } };

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface Result<T> {
  status: number;
  body?: ApiResponse<T>;
}

interface AdminBlogPost {
  id: number;
  title: string;
  slug: string;
  cover: string;
  summary: string;
  content: string;
  publishedAt: string;
  isPublished: boolean;
}

const baseUrl = (process.env.API_BASE_URL ?? 'http://127.0.0.1:8080').replace(/\/$/, '');
const email = process.env.ADMIN_EMAIL ?? '';
const password = process.env.ADMIN_PASSWORD ?? '';
const databaseUrl = process.env.DATABASE_URL
  ?? 'postgresql://thuccoffee:thuccoffee@127.0.0.1:5432/thuccoffee';
const pool = new Pool({ connectionString: databaseUrl });
const slug = 'smoke-blog-' + randomUUID();
const validContent = '<p>Safe content.</p><h2>Heading</h2><img src="blog-asset:blog/smoke.png" alt="Smoke" />';
const unsafeContent = validContent
  + '<script>alert(1)</script><img src="blog-asset:blog/smoke.png" onerror="alert(2)">'
  + '<a href="javascript:alert(3)">x</a>';

let cookie = '';
let createdId: number | undefined;
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
    headers: {
      'Content-Type': 'application/json',
      ...(auth && cookie ? { Cookie: cookie } : {}),
    },
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

try {
  await check('1. every admin blog endpoint requires auth', async () => {
    const endpoints: Array<[string, string]> = [
      ['GET', '/api/admin/blog'],
      ['GET', '/api/admin/blog/1'],
      ['POST', '/api/admin/blog'],
      ['POST', '/api/admin/blog/preview'],
      ['PUT', '/api/admin/blog/1'],
      ['PATCH', '/api/admin/blog/1/publish'],
    ];
    for (const [method, path] of endpoints) {
      const result = method === 'GET' ? await get(path, false) : await json(method, path, {}, false);
      failure(result, 401, 'UNAUTHORIZED');
    }
  });

  await check('2. pagination returns exact metadata', async () => {
    const result = await get<AdminBlogPost[]>('/api/admin/blog?page=1&limit=3');
    const items = success(result);
    assert(items.length === 3, 'Expected three records');
    assert(result.body?.success && result.body.meta?.page === 1, 'Wrong page meta');
    assert(result.body?.success && result.body.meta?.pageSize === 3, 'Wrong page size meta');
    assert(result.body?.success && result.body.meta.total >= 267, 'Wrong total');
  });

  await check('3. create, search, duplicate slug and slug lock', async () => {
    const body = {
      title: 'Smoke admin blog',
      slug,
      cover: 'blog/smoke.png',
      summary: 'Smoke summary',
      content: unsafeContent,
      publishedAt: '2026-07-22',
    };
    const created = success(await json<AdminBlogPost>('POST', '/api/admin/blog', body), 201);
    createdId = created.id;
    failure(await json('POST', '/api/admin/blog', body), 409, 'CONFLICT');

    const searched = await get<AdminBlogPost[]>('/api/admin/blog?page=1&limit=10&q=' + slug);
    assert(success(searched).some((item) => item.id === created.id), 'Search did not find created post');
    assert(searched.body?.success && searched.body.meta?.total === 1, 'Search total must be one');

    failure(await json('PUT', '/api/admin/blog/' + created.id, {
      ...body,
      slug: slug + '-changed',
    }), 400, 'BAD_REQUEST');
  });

  await check('4. sanitizer removes vectors and preserves valid bytes/marker', async () => {
    assert(createdId, 'Create did not succeed');
    const preview = success(await json<{ html: string }>('POST', '/api/admin/blog/preview', { content: unsafeContent }));
    assert(!/<script|onerror|javascript:/i.test(preview.html), 'Unsafe HTML survived preview');
    assert(preview.html.includes('src="blog-asset:blog/smoke.png"'), 'Preview marker lost');
    const stored = success(await get<AdminBlogPost>('/api/admin/blog/' + createdId));
    assert(!/<script|onerror|javascript:/i.test(stored.content), 'Unsafe HTML survived');
    assert(stored.content.includes(validContent), 'Valid content changed');
    assert(stored.content.includes('src="blog-asset:blog/smoke.png"'), 'blog-asset marker lost');
  });

  await check('5. publish toggle is reflected in public API', async () => {
    assert(createdId, 'Create did not succeed');
    success(await json('PATCH', '/api/admin/blog/' + createdId + '/publish', { isPublished: false }));
    const hidden = success(await get<Array<{ slug: string }>>('/api/blog?page=1', false));
    assert(!hidden.some((item) => item.slug === slug), 'Unpublished post remained public');

    success(await json('PATCH', '/api/admin/blog/' + createdId + '/publish', { isPublished: true }));
    const visible = success(await get<Array<{ slug: string }>>('/api/blog?page=1', false));
    assert(visible.some((item) => item.slug === slug), 'Published post missing publicly');
  });

  await check('6. five longest real posts sanitize byte-for-byte', async () => {
    const { sanitizeBlogContent } = await import('../src/modules/blog/blog-content-sanitizer.js');
    const longest = await pool.query<{
      id: number;
      slug: string;
      title: string;
      cover: string;
      summary: string;
      content: string;
      publishedAt: string;
      updatedAt: Date;
    }>(
      `SELECT id, slug, title, cover, summary, content,
        published_at::text AS "publishedAt", updated_at AS "updatedAt"
       FROM blog_posts WHERE slug <> $1 ORDER BY length(content) DESC LIMIT 5`,
      [slug],
    );
    assert(longest.rows.length === 5, 'Expected five real posts');
    for (const row of longest.rows) {
      const sanitized = sanitizeBlogContent(row.content);
      if (sanitized !== row.content) {
        const normalized = row.content
          .replace(/style="([^"]*)"/gi, (_match, value: string) => (
            `style="${value.replace(/\s*:\s*/g, ':').replace(/\s*;\s*/g, ';')}"`
          ))
          .replace(/<(br|hr|img)([^>]*?)\s*\/?>/gi, '<$1$2 />')
          .replace(/&nbsp;/gi, '\u00a0');
        let index = 0;
        while (sanitized[index] === normalized[index]) index += 1;
        throw new Error(
          'Sanitize diff for ' + row.slug + ' at ' + index
          + '; original=' + JSON.stringify(normalized.slice(index, index + 120))
          + '; sanitized=' + JSON.stringify(sanitized.slice(index, index + 120)),
        );
      }
    }

    const real = longest.rows[0];
    assert(real, 'Expected a real post');
    try {
      success(await json<AdminBlogPost>('PUT', '/api/admin/blog/' + real.id, {
        title: real.title,
        cover: real.cover,
        summary: real.summary,
        content: real.content,
        publishedAt: real.publishedAt,
      }));
      const publicPost = success(await get<{ content: string }>('/api/blog/' + real.slug, false));
      assert(publicPost.content === real.content, 'Real post format changed after save');
      if (real.content.includes('blog-asset:')) {
        assert(publicPost.content.includes('blog-asset:'), 'Real inline image marker lost');
      }
    } finally {
      await pool.query('UPDATE blog_posts SET updated_at = $1 WHERE id = $2', [real.updatedAt, real.id]);
    }
  });
} finally {
  await pool.query('DELETE FROM blog_posts WHERE slug = $1', [slug]);
  await pool.end();
}

if (failures > 0) {
  console.error('Smoke admin blog failed: ' + failures + '/6 checks failed.');
  process.exitCode = 1;
} else {
  console.log('Smoke admin blog passed: 6/6 checks at ' + baseUrl + '.');
}