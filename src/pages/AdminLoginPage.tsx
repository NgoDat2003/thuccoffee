import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePageMeta } from '../lib/use-page-meta';
import { useLogin } from '../services/auth.service';

export default function AdminLoginPage() {
  usePageMeta('Đăng nhập quản trị');

  const navigate = useNavigate();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => navigate('/admin', { replace: true }) },
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Thức Coffee
        </p>
        <h1 className="text-2xl font-bold text-stone-900">Đăng nhập quản trị</h1>
        <p className="mt-2 text-sm text-stone-600">
          Sử dụng tài khoản quản trị đã được tạo bằng CLI.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="admin-password">
              Mật khẩu
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {login.isError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {login.error instanceof Error
                ? login.error.message
                : 'Không thể đăng nhập. Vui lòng thử lại.'}
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {login.isPending ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </section>
    </main>
  );
}
