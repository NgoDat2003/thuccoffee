import { useNavigate } from 'react-router-dom';

import { usePageMeta } from '../lib/use-page-meta';
import { useLogout, useMe } from '../services/auth.service';

export default function AdminHomePage() {
  usePageMeta('Quản trị');

  const navigate = useNavigate();
  const currentUser = useMe();
  const logout = useLogout();

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => navigate('/admin/login', { replace: true }),
    });
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-12">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Thức Coffee Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold text-stone-900">Trang quản trị</h1>
        <p className="mt-4 text-stone-600">
          Đây là trang tạm để xác minh nền tảng đăng nhập. Admin shell và CRUD sẽ được xây ở phase sau.
        </p>

        {currentUser.data && (
          <p className="mt-6 rounded-lg bg-stone-50 px-4 py-3 text-sm text-stone-700">
            Đang đăng nhập: <strong>{currentUser.data.email}</strong> ({currentUser.data.role})
          </p>
        )}

        {currentUser.isError && (
          <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.
          </p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={logout.isPending}
          className="mt-8 rounded-lg border border-stone-300 px-4 py-2.5 font-medium text-stone-800 transition hover:bg-stone-50 disabled:opacity-60"
        >
          {logout.isPending ? 'Đang đăng xuất…' : 'Đăng xuất'}
        </button>
      </section>
    </main>
  );
}
