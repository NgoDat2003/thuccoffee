import { useNavigate } from 'react-router-dom';

import type { AuthUser } from '../../../server/src/modules/auth/auth.schemas';
import { useLogout } from '../../services/auth.service';

interface AdminTopbarProps {
  user: AuthUser;
  onOpenMenu: () => void;
}

export default function AdminTopbar({ user, onOpenMenu }: AdminTopbarProps) {
  const navigate = useNavigate();
  const logout = useLogout();

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => navigate('/admin/login', { replace: true }),
    });
  }

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-stone-200 bg-white px-4 lg:px-8">
      <button
        type="button"
        className="rounded-lg border border-stone-300 px-3 py-2 text-sm lg:hidden"
        aria-label="Mở menu quản trị"
        onClick={onOpenMenu}
      >
        Menu
      </button>
      <div className="ml-auto flex items-center gap-4">
        <span className="hidden text-sm text-stone-600 sm:inline">{user.email}</span>
        <button
          type="button"
          onClick={handleLogout}
          disabled={logout.isPending}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-60"
        >
          {logout.isPending ? 'Đang đăng xuất…' : 'Đăng xuất'}
        </button>
      </div>
    </header>
  );
}