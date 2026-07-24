import { NavLink, useNavigate } from 'react-router-dom';

import type { AuthUser } from '../../../server/src/modules/auth/auth.schemas';
import { useLogout } from '../../services/auth.service';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  user: AuthUser;
}

const icons = {
  products: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="8" width="13" height="10" rx="2" /><path d="M17 10h2a2.5 2.5 0 010 5h-2" /><line x1="4" y1="21" x2="17" y2="21" /></svg>,
  categories: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="4" width="9" height="6" rx="1.5" /><rect x="7.5" y="9" width="9" height="6" rx="1.5" /><rect x="11" y="14" width="9" height="6" rx="1.5" /></svg>,
  blog: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="13" y2="16" /></svg>,
  stores: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="10" r="6" /><circle cx="12" cy="10" r="2" fill="currentColor" stroke="none" /><line x1="12" y1="16" x2="12" y2="21" /></svg>,
  banners: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.8" /><path d="M3 16l5-4 4 3 4-5 5 6" /></svg>,
  settings: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6" /><circle cx="9" cy="6" r="2" fill="#1c150f" /><line x1="4" y1="12" x2="20" y2="12" /><circle cx="15" cy="12" r="2" fill="#1c150f" /><line x1="4" y1="18" x2="20" y2="18" /><circle cx="11" cy="18" r="2" fill="#1c150f" /></svg>,
  pages: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /></svg>,
  gallery: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="4" width="8" height="8" rx="1.5" /><rect x="13" y="4" width="8" height="8" rx="1.5" /><rect x="3" y="14" width="8" height="6" rx="1.5" /><rect x="13" y="14" width="8" height="6" rx="1.5" /></svg>,
};

const groups = [
  {
    label: 'Nội dung',
    links: [
      { to: '/admin/products', label: 'Sản phẩm', icon: icons.products },
      { to: '/admin/categories', label: 'Danh mục', icon: icons.categories },
      { to: '/admin/blog', label: 'Bài viết', icon: icons.blog },
      { to: '/admin/pages', label: 'Trang nội dung', icon: icons.pages },
      { to: '/admin/gallery', label: 'Gallery & FAQ', icon: icons.gallery },
    ],
  },
  {
    label: 'Vận hành',
    links: [
      { to: '/admin/stores', label: 'Cửa hàng', icon: icons.stores },
      { to: '/admin/banners', label: 'Banner', icon: icons.banners },
      { to: '/admin/settings', label: 'Cài đặt website', icon: icons.settings },
    ],
  },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  'flex items-center gap-[11px] rounded-[9px] px-[10px] py-[10px] text-left text-[14px] font-semibold transition-colors '
  + (isActive
    ? 'bg-admin-sidebar-hover text-admin-accent'
    : 'text-admin-sidebar-text hover:bg-admin-sidebar-hover hover:text-admin-accent');

export default function AdminSidebar({ open, onClose, user }: AdminSidebarProps) {
  const navigate = useNavigate();
  const logout = useLogout();
  const initial = user.email.charAt(0).toUpperCase();
  const roleLabel = user.role === 'admin' ? 'Quản trị viên' : 'Biên tập viên';

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => navigate('/admin/login', { replace: true }),
    });
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Đóng menu quản trị"
          className="fixed inset-0 z-30 bg-admin-sidebar/60 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex h-screen w-[232px] flex-col gap-[30px] bg-admin-sidebar px-[14px] py-7 transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center gap-[10px] px-[10px]">
          <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-admin-accent text-[15px] font-black text-white">T</div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-admin-accent">Thức Coffee</p>
            <p className="mt-px text-[16px] font-bold text-admin-bg">Quản trị</p>
          </div>
        </div>
        <nav aria-label="Điều hướng quản trị" className="flex min-h-0 flex-1 flex-col gap-[22px]">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-[10px] text-[10.5px] font-bold uppercase tracking-[0.1em] text-admin-sidebar-muted">{group.label}</p>
              <div className="flex flex-col gap-0.5">
                {group.links.map((link) => (
                  <NavLink key={link.to} to={link.to} className={linkClass} onClick={onClose}>
                    <span className="shrink-0">{link.icon}</span>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-[10px] border-t border-admin-sidebar-hover pt-4">
          <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-admin-sidebar-hover text-[12.5px] font-bold text-admin-accent">{initial}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-admin-bg">{user.email}</p>
            <p className="text-[11.5px] text-admin-sidebar-muted">{roleLabel}</p>
          </div>
          <button
            type="button"
            title="Đăng xuất"
            aria-label="Đăng xuất"
            disabled={logout.isPending}
            onClick={handleLogout}
            className="flex size-[26px] shrink-0 items-center justify-center rounded-[7px] border border-admin-sidebar-hover text-[#8a7f6f] transition-colors hover:text-admin-accent disabled:opacity-50"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          </button>
        </div>
      </aside>
    </>
  );
}
