import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import DesktopNav from './DesktopNav';
import MobileDrawer from './MobileDrawer';
import { HamburgerIcon, PhoneIcon, SearchIcon } from '../ui/Icon';
import { getImageUrl } from '../../lib/image-url';

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-[50px] bg-primary shadow md:h-[82px] md:bg-white">
      <div className="flex h-[50px] items-center justify-between px-[15px] text-white md:hidden">
        <button
          type="button"
          aria-label="Mở menu"
          aria-controls="mobile-navigation"
          aria-expanded={drawerOpen}
          className="flex h-[50px] w-[50px] items-center justify-start"
          onClick={openDrawer}
        >
          <HamburgerIcon className="h-6 w-6" />
        </button>
        <button
          type="button"
          aria-label="Mở tìm kiếm"
          aria-controls="mobile-navigation"
          aria-expanded={drawerOpen}
          className="flex h-[50px] w-[50px] items-center justify-end"
          onClick={openDrawer}
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </div>

      <Container className="hidden h-[82px] items-stretch md:flex">
        <Link to="/" className="flex w-[100px] shrink-0 items-center" aria-label="Thức Coffee - Trang chủ">
          <img
            src={getImageUrl('151b6674_circlelogo-white-blue-jul2023.png')}
            alt="Thức Coffee"
            className="max-h-[70px] w-auto max-w-full"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-[35px] items-center justify-end pt-[7px]">
            <a href="tel:18006230" className="flex items-center gap-2 font-medium text-text">
              <PhoneIcon /> 1800 6230
            </a>
          </div>
          <div className="flex min-h-0 flex-1 items-start justify-end">
            <DesktopNav />
            <button
              type="button"
              aria-label="Tìm kiếm"
              className="ml-[5px] flex h-[35px] w-[35px] shrink-0 items-center justify-end text-text hover:text-primary"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Container>

      <MobileDrawer open={drawerOpen} onClose={closeDrawer} />
    </header>
  );
}
