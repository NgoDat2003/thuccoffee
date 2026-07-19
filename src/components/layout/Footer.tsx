import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import { NAV_LINKS, SOCIAL_LINKS } from './nav-links';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '../ui/Icon';
import { getImageUrl } from '../../lib/image-url';

const footerLinks = [
  { label: 'Trang chủ', to: '/' },
  ...NAV_LINKS,
  { label: 'Cookie & Policy', to: '/chinh-sach' },
  { label: 'Đăng Nhập', to: '/account/login' },
];

const socialLinkClass =
  'flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#cdcdcd] text-[#1c1c1c] transition-colors hover:bg-primary hover:text-white';

export default function Footer() {
  return (
    <footer className="mt-[38px] pb-[30px]">
      <Container>
        <div className="h-px w-full bg-[#ccc] text-center">
          <img
            src={getImageUrl('icon-coffee.png')}
            alt=""
            className="relative top-[-14px] mx-auto bg-page px-[10px]"
          />
        </div>
      </Container>

      <div className="hidden pt-[35px] md:block">
        <Container className="grid grid-cols-[25%_50%_25%]">
          <div>
            <h2 className="mb-[10px] text-base font-semibold leading-[27px] text-text">
              THỨC COFFEE - OPEN 24/7
              <br />
              Hotline: 1800 6230
            </h2>
            <div className="flex gap-[5px]">
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialLinkClass}>
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialLinkClass}>
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={socialLinkClass}>
                <YoutubeIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <nav className="grid grid-cols-3 content-start pr-[30px]" aria-label="Điều hướng chân trang">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="mb-[5px] text-base font-medium text-[#1c1c1c] hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form onSubmit={(event) => event.preventDefault()}>
            <div className="relative h-[35px] w-full">
              <label htmlFor="footer-email" className="sr-only">
                Nhập địa chỉ email
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Nhập địa chỉ email"
                className="h-[35px] w-full rounded border border-[#d7dbdb] bg-white px-[10px] pr-[50px] text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                aria-label="Đăng ký nhận tin"
                className="absolute right-0 top-0 flex h-[35px] w-[40px] items-center justify-center text-[17px] text-[#696969] hover:text-primary"
              >
                →
              </button>
            </div>
            <p className="mb-0 mt-3 font-medium italic">Nhận tin khuyến mãi của Thức</p>
          </form>
        </Container>
      </div>

      <Container className="mt-[35px] text-center md:mt-5">
        <p className="m-0 text-base font-medium text-text">© 2018. All Right Reserved. Thức Coffee</p>
      </Container>
    </footer>
  );
}
