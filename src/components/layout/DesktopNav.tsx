import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from './nav-links';
import { categories, categoryHref } from '../../data';

const rootLinkClass = (isActive: boolean) =>
  `whitespace-nowrap border-b-[3px] pb-[6px] text-[11px] font-normal uppercase leading-6 transition-colors lg:text-sm xl:text-base ${
    isActive
      ? 'border-primary text-primary'
      : 'border-transparent text-text hover:border-primary hover:text-primary'
  }`;

export default function DesktopNav() {
  return (
    <nav className="hidden h-[35px] items-end gap-3 md:flex lg:gap-5 xl:gap-[35px]" aria-label="Điều hướng chính">
      {NAV_LINKS.map((link) =>
        link.to === '/menu' ? (
          <div key={link.to} className="group relative flex h-[35px] items-end">
            <NavLink to={link.to} className={({ isActive }) => rootLinkClass(isActive)}>
              {link.label}
            </NavLink>
            <div className="pointer-events-none invisible fixed left-1/2 top-[70px] z-10 w-[calc(100vw-30px)] max-w-[1140px] -translate-x-1/2 pt-[12px] opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
              <div className="grid grid-cols-4 bg-white px-[30px] py-5 shadow-[0_2px_2px_rgba(11,25,28,0.1)]">
                {categories.map((category) => (
                  <NavLink
                    key={category.key}
                    to={categoryHref(category.key)}
                    className="h-10 truncate pr-3 text-sm font-medium leading-10 text-text hover:text-primary xl:pr-[30px] xl:text-base"
                  >
                    {category.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => rootLinkClass(isActive)}
          >
            {link.label}
          </NavLink>
        ),
      )}
    </nav>
  );
}
