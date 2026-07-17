import { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Container from '../components/ui/Container';
import Breadcrumb from '../components/ui/Breadcrumb';
import RelatedProducts from '../components/menu/RelatedProducts';
import { getProductBySlug, getRelatedProducts } from '../data';
import { getImageUrl } from '../lib/image-url';
import { formatPrice } from '../lib/format';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const product = slug ? getProductBySlug(slug) : undefined;

  if (!product) {
    return <Navigate to="/menu" replace />;
  }

  const related = getRelatedProducts(product, 4);
  const fullImage = product.image ?? product.thumb;

  return (
    <Container className="py-10">
      <Breadcrumb
        items={[{ label: 'Trang chủ', to: '/' }, { label: 'Menu', to: '/menu' }, { label: product.name }]}
      />

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
            {product.price !== null ? formatPrice(product.price) : 'Liên hệ'}
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

      <RelatedProducts products={related} />

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={[{ src: getImageUrl(fullImage) }]}
        carousel={{ finite: true }}
      />
    </Container>
  );
}
