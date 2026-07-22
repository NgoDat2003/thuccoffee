import { Link } from 'react-router-dom';
import { getImageUrl } from '../../lib/image-url';
import { useBanners } from '../../services/banners.service';

export default function PromoBanner() {
  const { data: banners = [], isLoading, isError } = useBanners();
  const promotion = banners.find((banner) => banner.type === 'promotion');

  if (isLoading) return <div className="aspect-[16/7] animate-pulse rounded bg-gray-100" />;
  if (isError || !promotion) return null;

  return (
    <Link
      to={promotion.linkUrl ?? '/chuong-trinh-thanh-vien'}
      className="block overflow-hidden rounded"
    >
      <img
        src={getImageUrl(promotion.image)}
        alt={promotion.altText}
        className="w-full object-cover"
      />
    </Link>
  );
}