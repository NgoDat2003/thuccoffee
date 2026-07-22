import { NavLink } from 'react-router-dom';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  { to: '/admin/products', label: 'Sản phẩm' },
  { to: '/admin/categories', label: 'Danh mục' },
  { to: '/admin/blog', label: 'Bài viết' },
  { to: '/admin/stores', label: 'Cửa hàng' },
  { to: '/admin/banners', label: 'Banner' },
  { to: '/admin/site-settings', label: 'Cài đặt website' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  'block rounded-lg px-4 py-3 text-sm font-medium transition '
  + (isActive
    ? 'bg-primary text-white'
    : 'text-stone-700 hover:bg-stone-100 hover:text-primary');

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Đóng menu quản trị"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-stone-200 bg-white p-5 transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Thức Coffee
          </p>
          <p className="mt-1 text-xl font-bold text-stone-900">Quản trị</p>
        </div>
        <nav aria-label="Điều hướng quản trị" className="space-y-1">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={onClose}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}