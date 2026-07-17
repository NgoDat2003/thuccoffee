import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_LINKS, SOCIAL_LINKS } from './nav-links';
import { CloseIcon, FacebookIcon, InstagramIcon, YoutubeIcon, PhoneIcon } from '../ui/Icon';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const location = useLocation();

  useEffect(() => {
    if (open) onClose();
    // intentionally only tracking pathname, not open/onClose, to avoid re-closing on every render
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <button
        aria-label="Đóng menu"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-72 bg-white p-6 shadow-xl">
        <button aria-label="Đóng menu" className="mb-6" onClick={onClose}>
          <CloseIcon />
        </button>
        <nav className="flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium uppercase ${isActive ? 'text-primary font-bold' : 'text-gray-700'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <a href="tel:18006230" className="mt-6 flex items-center gap-2 text-sm font-medium text-secondary">
          <PhoneIcon /> 1800 6230
        </a>
        <div className="mt-6 flex gap-4">
          <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FacebookIcon />
          </a>
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <InstagramIcon />
          </a>
          <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <YoutubeIcon />
          </a>
        </div>
      </div>
    </div>
  );
}
