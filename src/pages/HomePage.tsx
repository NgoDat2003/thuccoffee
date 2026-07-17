import Container from '../components/ui/Container';
import SectionTitle from '../components/ui/SectionTitle';
import ProductCard from '../components/ui/ProductCard';
import BannerSlider from '../components/home/BannerSlider';
import PromoBanner from '../components/home/PromoBanner';
import BlogCarousel from '../components/home/BlogCarousel';
import StoreLocator from '../components/home/StoreLocator';
import GalleryLightbox from '../components/home/GalleryLightbox';
import { getFeaturedProducts } from '../data';

export default function HomePage() {
  const featured = getFeaturedProducts(8);

  return (
    <>
      <Container className="pt-6">
        <BannerSlider />
      </Container>

      <Container className="py-10">
        <SectionTitle title="Top thức uống được ưa thích" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </Container>

      <Container className="py-10">
        <SectionTitle title="Ưu đãi khi đến với Thức" />
        <PromoBanner />
      </Container>

      <Container className="py-10">
        <SectionTitle title="Chuyện của Thức" />
        <BlogCarousel />
      </Container>

      <Container className="py-10">
        <SectionTitle title="Hệ thống cửa hàng" />
        <StoreLocator />
      </Container>

      <Container className="py-10">
        <SectionTitle title="Bộ sưu tập của Thức" />
        <GalleryLightbox />
      </Container>
    </>
  );
}
