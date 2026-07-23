import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import NewsletterForm from './NewsletterForm';
import { NAV_LINKS, SOCIAL_LINKS } from './nav-links';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '../ui/Icon';
import { getImageUrl } from '../../lib/image-url';
import { useSiteSettings } from '../../services/site-settings.service';

const footerLinks = [
  { label: 'Trang chủ', to: '/' },
  ...NAV_LINKS,
  { label: 'Cookie & Policy', to: '/chinh-sach' },
  { label: 'Đăng Nhập', to: '/account/login' },
];

const socialLinkClass =
  'flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#cdcdcd] text-[#1c1c1c] transition-colors hover:bg-primary hover:text-white';

export default function Footer() {
  const { data: settings } = useSiteSettings();
  const hotline = settings?.hotline ?? '1800 6230';
  const instagramUrl = settings?.instagramUrl ?? SOCIAL_LINKS.instagram;
  const facebookUrl = settings?.facebookUrl ?? SOCIAL_LINKS.facebook;
  const youtubeUrl = settings ? settings.youtubeUrl : SOCIAL_LINKS.youtube;
  const copyright = settings?.footerCopyright ?? '© 2018. All Right Reserved. Thức Coffee';

  return (    <footer className="mt-[38px] pb-[30px]">
      <Container>
        <div className="h-px w-full bg-[#ccc] text-center">
          <img
            src={getImageUrl('site/icon-coffee.png')}
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
              Hotline: {hotline}
            </h2>
            <div className="flex gap-[5px]">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialLinkClass}>
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialLinkClass}>
                <FacebookIcon className="h-4 w-4" />
              </a>
              {youtubeUrl ? (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={socialLinkClass}>
                  <YoutubeIcon className="h-4 w-4" />
                </a>
              ) : (
                <span aria-label="YouTube chưa được cấu hình" className={`${socialLinkClass} cursor-default`}>
                  <YoutubeIcon className="h-4 w-4" />
                </span>
              )}
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

          <NewsletterForm />
        </Container>
      </div>

      <Container className="mt-[35px] text-center md:mt-5">
        <p className="m-0 text-base font-medium text-text">{copyright}</p>
      </Container>
    </footer>
  );
}
