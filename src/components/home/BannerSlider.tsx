import EmblaCarousel from '../ui/EmblaCarousel';
import { getImageUrl } from '../../lib/image-url';

const BANNER_IMAGES = ['3eb3f0f8_cover-2-.jpg', '446135be_cover-fb.jpg'];

export default function BannerSlider() {
  const slides = BANNER_IMAGES.map((filename) => (
    <img
      key={filename}
      src={getImageUrl(filename)}
      alt="Thức Coffee"
      className="block h-auto w-full object-cover md:h-[calc(100vh-82px)]"
    />
  ));

  return (
    <div className="relative -mx-2 overflow-hidden [&_.mt-3]:absolute [&_.mt-3]:bottom-4 [&_.mt-3]:left-0 [&_.mt-3]:right-0">
      <EmblaCarousel slides={slides} autoplayMs={6000} />
    </div>
  );
}
