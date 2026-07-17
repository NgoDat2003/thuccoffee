import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CookieBanner from './CookieBanner';
import FloatingOrderButton from './FloatingOrderButton';

export default function Layout() {
  return (
    <>
      <Header />
      <main className="pt-[82px]">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
      <FloatingOrderButton />
    </>
  );
}
