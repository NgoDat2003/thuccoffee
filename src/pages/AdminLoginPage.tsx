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
    <main className="flex min-h-screen items-center justify-center bg-admin-bg px-4 py-12 text-admin-ink">
      <section className="w-full max-w-[420px] border-t border-admin-border px-2 pt-8 sm:px-8">
        <div className="mb-7 flex items-center gap-[10px]">
          <div className="flex size-[34px] items-center justify-center rounded-full bg-admin-accent text-[15px] font-black text-admin-sidebar">T</div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-admin-accent-strong">Thức Coffee</p>
            <p className="mt-px text-[16px] font-bold">Quản trị</p>
          </div>
        </div>
        <h1 className="text-[34px] font-black tracking-[-0.02em]">Đăng nhập</h1>
        <p className="mt-2 text-sm text-admin-muted">Sử dụng tài khoản quản trị đã được tạo bằng CLI.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-admin-field" htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border-0 border-b-[1.5px] border-admin-border-input bg-transparent px-0.5 py-2.5 outline-none transition-colors focus:border-admin-accent-strong"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-admin-field" htmlFor="admin-password">Mật khẩu</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border-0 border-b-[1.5px] border-admin-border-input bg-transparent px-0.5 py-2.5 outline-none transition-colors focus:border-admin-accent-strong"
            />
          </div>

          {login.isError && (
            <p role="alert" className="rounded-[10px] border border-admin-danger/20 bg-admin-danger/5 px-3 py-2 text-sm text-admin-danger">
              {login.error instanceof Error ? login.error.message : 'Không thể đăng nhập. Vui lòng thử lại.'}
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-full bg-admin-ink px-4 py-3 font-bold text-admin-bg transition-colors hover:bg-admin-ink-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {login.isPending ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </section>
    </main>
  );
}
