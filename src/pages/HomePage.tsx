import BannerSlider from '../components/home/BannerSlider';
import BlogCarousel from '../components/home/BlogCarousel';
import GalleryLightbox from '../components/home/GalleryLightbox';
import PromoBanner from '../components/home/PromoBanner';
import StoreLocator from '../components/home/StoreLocator';
import Container from '../components/ui/Container';
import ProductCard from '../components/ui/ProductCard';
import SectionTitle from '../components/ui/SectionTitle';
import { usePageMeta } from '../lib/use-page-meta';
import { useProducts } from '../services/products.service';

export default function HomePage() {
  usePageMeta('', 'Thương hiệu cà phê tự hào tiên phong trong lĩnh vực hoạt động 24H tại TP.HCM');
  const { data: products = [], isLoading, isError } = useProducts('yeu-thich-nhat');
  const featured = products.slice(0, 8);

  return (
    <>
      <BannerSlider />

      {!isError && (
        <Container className="py-[30px]">
          <SectionTitle title="Top thức uống được ưa thích" />
          {isLoading ? (
            <div className="grid animate-pulse grid-cols-2 gap-6 md:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index}>
                  <div className="h-[180px] rounded-[5px] bg-gray-100 md:h-[245px]" />
                  <div className="mt-4 h-5 w-4/5 rounded bg-gray-100" />
                  <div className="mt-4 h-6 w-24 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </Container>
      )}

      <Container className="py-[30px]">
        <SectionTitle title="Ưu đãi khi đến với Thức" />
        <PromoBanner />
      </Container>

      <Container className="py-[30px]">
        <SectionTitle title="Chuyện của Thức" />
        <BlogCarousel />
      </Container>

      <Container className="py-[30px]">
        <SectionTitle title="Hệ thống cửa hàng" />
        <StoreLocator />
      </Container>

      <Container className="py-[30px]">
        <SectionTitle title="Bộ sưu tập của Thức" />
        <GalleryLightbox />
      </Container>
    </>
  );
}