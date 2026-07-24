import { getImageUrl } from '../../lib/image-url';
import { useBanners } from '../../services/banners.service';
import EmblaCarousel from '../ui/EmblaCarousel';

export default function BannerSlider() {
  const { data: banners = [], isLoading, isError } = useBanners();
  const sliderBanners = banners
    .filter((banner) => banner.type === 'slider')
    .sort((left, right) => left.sortOrder - right.sortOrder);

  if (isLoading) {
    return <div className="-mx-2 aspect-[16/7] animate-pulse bg-gray-100 md:h-[calc(100vh-82px)]" />;
  }
  if (isError || sliderBanners.length === 0) return null;

  const slides = sliderBanners.map((banner) => (
    <img
      key={`${banner.image}-${banner.sortOrder}`}
      src={getImageUrl(banner.image)}
      alt={banner.altText}
      className="block h-auto w-full object-cover md:h-[calc(100vh-82px)]"
    />
  ));

  return (
    <div className="relative -mx-2 overflow-hidden [&_.mt-3]:absolute [&_.mt-3]:bottom-4 [&_.mt-3]:left-0 [&_.mt-3]:right-0">
      <EmblaCarousel slides={slides} autoplayMs={6000} />
    </div>
  );
}