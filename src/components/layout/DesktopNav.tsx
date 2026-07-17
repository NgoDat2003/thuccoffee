import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from './nav-links';
import { categories } from '../../data';

export default function DesktopNav() {
  return (
    <nav className="hidden items-center gap-6 md:flex">
      {NAV_LINKS.map((link) =>
        link.to === '/menu' ? (
          <div key={link.to} className="group relative">
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium uppercase ${isActive ? 'text-primary font-bold' : 'text-gray-700'}`
              }
            >
              {link.label}
            </NavLink>
            <div className="invisible absolute left-0 top-full z-10 w-56 rounded bg-white py-2 opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {categories.map((cat) => (
                <NavLink
                  key={cat.key}
                  to="/menu"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
                >
                  {cat.label}
                </NavLink>
              ))}
            </div>
          </div>
        ) : (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `text-sm font-medium uppercase ${isActive ? 'text-primary font-bold' : 'text-gray-700'}`
            }
          >
            {link.label}
          </NavLink>
        ),
      )}
    </nav>
  );
}
