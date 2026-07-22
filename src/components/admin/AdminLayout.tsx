import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useMe } from '../../services/auth.service';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

export default function AdminLayout() {
  const currentUser = useMe();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (currentUser.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100 text-stone-600">
        Đang tải trang quản trị…
      </main>
    );
  }

  if (currentUser.isError || !currentUser.data) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <AdminTopbar
          user={currentUser.data}
          onOpenMenu={() => setSidebarOpen(true)}
        />
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}