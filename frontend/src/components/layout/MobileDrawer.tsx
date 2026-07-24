import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { NAV_LINKS, SOCIAL_LINKS } from './nav-links';
import {
  CloseIcon,
  FacebookIcon,
  InstagramIcon,
  PhoneIcon,
  SearchIcon,
  YoutubeIcon,
} from '../ui/Icon';
import { getImageUrl } from '../../lib/image-url';
import type { PublicSiteSettings } from '@server/src/modules/site-settings/site-settings.schemas';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  settings?: PublicSiteSettings;
}

const drawerLinkClass = ({ isActive }: { isActive: boolean }) =>
  `border-b border-gray-200 py-3 text-sm font-medium uppercase ${
    isActive ? 'text-primary' : 'text-text hover:text-primary'
  }`;

export default function MobileDrawer({ open, onClose, settings }: MobileDrawerProps) {
  const hotline = settings?.hotline ?? '1800 6230';
  const hotlineHref = `tel:${hotline.replace(/\s+/g, '')}`;
  const contactEmail = settings?.contactEmail ?? 'info.thuccoffee247@gmail.com';
  const logoStorageKey = settings?.logoStorageKey ?? 'site/151b6674_circlelogo-white-blue-jul2023.png';
  const facebookUrl = settings?.facebookUrl ?? SOCIAL_LINKS.facebook;
  const instagramUrl = settings?.instagramUrl ?? SOCIAL_LINKS.instagram;
  const youtubeUrl = settings ? settings.youtubeUrl : SOCIAL_LINKS.youtube;
  const location = useLocation();
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');

  const onSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const keyword = searchKeyword.trim();
    if (!keyword) return;
    // URL khớp dạng nguồn: /search/p1/?type=Product&keyword=...
    navigate(`/search/p1/?type=Product&keyword=${encodeURIComponent(keyword)}`);
    setSearchKeyword('');
    onClose();
  };

  useEffect(() => {
    if (open) onClose();
    // intentionally only tracking pathname so the drawer closes after navigation
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const desktopQuery = window.matchMedia('(min-width: 768px)');
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const onBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    desktopQuery.addEventListener('change', onBreakpointChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      desktopQuery.removeEventListener('change', onBreakpointChange);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <aside
      id="mobile-navigation"
      className="fixed bottom-0 left-0 right-0 top-[50px] z-[60] overflow-y-auto bg-white md:hidden"
      aria-label="Menu di động"
    >
      <div className="mx-auto flex min-h-full w-full max-w-[640px] flex-col px-[15px] pb-8">
        <div className="flex items-center justify-between py-4">
          <NavLink to="/" aria-label="Thức Coffee - Trang chủ">
            <img
              src={getImageUrl(logoStorageKey)}
              alt="Thức Coffee"
              className="h-[70px] w-[70px]"
            />
          </NavLink>
          <button type="button" aria-label="Đóng menu" className="p-2 text-text" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form className="relative mb-4" role="search" onSubmit={onSearchSubmit}>
          <label htmlFor="mobile-search" className="sr-only">
            Tìm kiếm
          </label>
          <input
            id="mobile-search"
            type="search"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="Tìm kiếm"
            className="h-[40px] w-full border border-[#b5b5b5] bg-white px-3 pr-10 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="absolute right-0 top-0 flex h-[40px] w-[40px] items-center justify-center text-text"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
        </form>

        <nav className="flex flex-col" aria-label="Điều hướng di động">
          <NavLink to="/" className={drawerLinkClass}>
            Trang chủ
          </NavLink>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={drawerLinkClass}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/account/login" className={drawerLinkClass}>
            Đăng Nhập
          </NavLink>
        </nav>

        <div className="mt-6 space-y-2 text-sm font-medium">
          <a href={hotlineHref} className="flex items-center gap-2 text-secondary">
            <PhoneIcon /> {hotline}
          </a>
          <a href={`mailto:${contactEmail}`} className="block text-text hover:text-primary">
            {contactEmail}
          </a>
        </div>

        <div className="mt-6 flex gap-2">
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#cdcdcd] hover:bg-primary hover:text-white">
            <FacebookIcon className="h-4 w-4" />
          </a>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#cdcdcd] hover:bg-primary hover:text-white">
            <InstagramIcon className="h-4 w-4" />
          </a>
          {youtubeUrl ? (
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#cdcdcd] hover:bg-primary hover:text-white">
              <YoutubeIcon className="h-4 w-4" />
            </a>
          ) : (
            <span aria-label="YouTube chưa được cấu hình" className="flex h-[35px] w-[35px] cursor-default items-center justify-center rounded-full border border-[#cdcdcd]">
              <YoutubeIcon className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
