import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import ProductDetailSkeleton from '../components/menu/ProductDetailSkeleton';
import RelatedProducts from '../components/menu/RelatedProducts';
import Container from '../components/ui/Container';
import { formatPrice } from '../lib/format';
import { getImageUrl } from '../lib/image-url';
import { usePageMeta } from '../lib/use-page-meta';
import { useProduct } from '../services/products.service';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { data: product, isLoading, isError } = useProduct(slug ?? '');

  usePageMeta(product?.name ?? 'Menu', product?.description);

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError || !product) return <Navigate to="/menu" replace />;

  const fullImage = product.image ?? product.thumb;

  return (
    <Container className="py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <button onClick={() => setLightboxOpen(true)} className="block">
          <img
            src={getImageUrl(fullImage)}
            alt={product.name}
            className="w-full rounded-[5px] object-cover"
          />
        </button>

        <div>
          <h1 className="text-2xl font-bold uppercase text-primary">{product.name}</h1>
          {product.description && <p className="mt-3 text-gray-600">{product.description}</p>}
          <p className="mt-4 text-2xl font-medium text-primary">
            {formatPrice(product.price)}
          </p>

          <a
            href="tel:18006230"
            className="mt-6 inline-block rounded border border-primary px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-white"
          >
            Order xin gọi: 1800 6230
          </a>

          <div>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 block text-sm font-medium text-gray-600 hover:text-primary"
            >
              ‹ Trở Lại
            </button>
          </div>
        </div>
      </div>

      <RelatedProducts categoryKey={product.categories[0]} currentSlug={product.slug} />

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: getImageUrl(fullImage) }]}
        carousel={{ finite: true }}
      />
    </Container>
  );
}