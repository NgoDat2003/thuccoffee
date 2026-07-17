import { useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import DesktopNav from './DesktopNav';
import MobileDrawer from './MobileDrawer';
import { HamburgerIcon, PhoneIcon, SearchIcon } from '../ui/Icon';
import { getImageUrl } from '../../lib/image-url';

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-[82px] items-center bg-white shadow">
      <Container className="flex w-full items-center justify-between">
        <Link to="/">
          <img
            src={getImageUrl('151b6674_circlelogo-white-blue-jul2023.png')}
            alt="Thức Coffee"
            className="h-12 w-12"
          />
        </Link>

        <DesktopNav />

        <div className="flex items-center gap-4">
          <a
            href="tel:18006230"
            className="hidden items-center gap-2 text-sm font-medium text-gray-700 md:flex"
          >
            <PhoneIcon /> 1800 6230
          </a>
          <SearchIcon className="hidden h-5 w-5 text-gray-400 md:block" />
          <button
            aria-label="Mở menu"
            className="md:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <HamburgerIcon />
          </button>
        </div>
      </Container>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
