import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useMe } from '../../services/auth.service';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  const currentUser = useMe();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (currentUser.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-admin-bg text-admin-muted">
        Đang tải trang quản trị…
      </main>
    );
  }

  if (currentUser.isError || !currentUser.data) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-admin-bg text-admin-ink">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={currentUser.data}
      />
      <div className="min-w-0 flex-1 lg:pl-[232px]">
        <button
          type="button"
          className="fixed top-4 left-4 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-admin-border bg-admin-surface px-4 text-[13px] font-bold text-admin-ink lg:hidden"
          aria-label="Mở menu quản trị"
          onClick={() => setSidebarOpen(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
          Menu
        </button>
        <main className="mx-auto max-w-[1180px] px-4 pt-20 pb-[70px] sm:px-6 lg:px-12 lg:pt-11">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
