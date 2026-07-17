import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import { NAV_LINKS, SOCIAL_LINKS } from './nav-links';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '../ui/Icon';

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-200 py-10">
      <Container className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <p className="font-semibold uppercase text-secondary">
            THỨC COFFEE - OPEN 24/7
            <br />
            Hotline: 1800 6230
          </p>
          <div className="mt-4 flex gap-4">
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <YoutubeIcon />
            </a>
          </div>
        </div>

        <nav className="flex flex-col gap-2 text-sm text-gray-700">
          <Link to="/" className="hover:text-primary">
            Trang chủ
          </Link>
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-primary">
              {link.label}
            </Link>
          ))}
          <Link to="/chinh-sach" className="hover:text-primary">
            Cookie &amp; Policy
          </Link>
        </nav>
      </Container>

      <Container className="mt-8 border-t border-gray-100 pt-6 text-sm text-gray-500">
        © 2018. All Right Reserved. Thức Coffee
      </Container>
    </footer>
  );
}
