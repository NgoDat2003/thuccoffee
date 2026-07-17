import EmblaCarousel from '../ui/EmblaCarousel';
import { getImageUrl } from '../../lib/image-url';

const BANNER_IMAGES = ['3eb3f0f8_cover-2-.jpg', '446135be_cover-fb.jpg'];

export default function BannerSlider() {
  const slides = BANNER_IMAGES.map((filename) => (
    <img
      key={filename}
      src={getImageUrl(filename)}
      alt="Thức Coffee"
      className="h-[300px] w-full rounded object-cover md:h-[450px]"
    />
  ));

  return <EmblaCarousel slides={slides} autoplayMs={6000} />;
}
