import { Link } from 'react-router-dom';
import { getImageUrl } from '../../lib/image-url';
import { useBanners } from '../../services/banners.service';

export default function PromoBanner() {
  const { data: banners = [], isLoading, isError } = useBanners();
  const promotion = banners.find((banner) => banner.type === 'promotion');

  if (isLoading) return <div className="aspect-[16/7] animate-pulse rounded bg-gray-100" />;
  if (isError || !promotion) return null;

  const href = promotion.linkUrl ?? '/chuong-trinh-thanh-vien';
  const image = (
    <img
      src={getImageUrl(promotion.image)}
      alt={promotion.altText}
      className="w-full object-cover"
    />
  );
  const cta = promotion.buttonLabel && (
    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded bg-primary px-5 py-2 text-sm font-semibold text-white shadow">
      {promotion.buttonLabel}
    </span>
  );

  // Link ngoài hoặc banner đánh dấu mở tab mới dùng thẻ <a>; nội bộ dùng <Link>.
  if (promotion.openInNewTab || href.startsWith('http')) {
    return (
      <a
        href={href}
        target={promotion.openInNewTab ? '_blank' : undefined}
        rel={promotion.openInNewTab ? 'noreferrer' : undefined}
        className="relative block overflow-hidden rounded"
      >
        {image}
        {cta}
      </a>
    );
  }

  return (
    <Link to={href} className="relative block overflow-hidden rounded">
      {image}
      {cta}
    </Link>
  );
}