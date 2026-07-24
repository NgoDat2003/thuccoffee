import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import ProductDetailSkeleton from '../components/menu/ProductDetailSkeleton';
import RelatedProducts from '../components/menu/RelatedProducts';
import Container from '../components/ui/Container';
import { formatPrice } from '../lib/format';
import { getImageUrl, resolveProductContentImageUrls } from '../lib/image-url';
import { usePageMeta } from '../lib/use-page-meta';
import { useProduct } from '../services/products.service';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>();
  const { data: product, isLoading, isError } = useProduct(slug ?? '');

  usePageMeta(product?.name ?? 'Menu', product?.description);

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError || !product) return <Navigate to="/menu" replace />;

  const fullImage = product.image ?? product.thumb;
  const options = product.options;
  // Sản phẩm có option: mặc định chọn option đầu (đã sort ở API); giá hiển thị
  // theo lựa chọn. Không có option thì dùng giá gốc như cũ.
  const activeOption = options.length > 0
    ? (options.find((option) => option.label === selectedOption) ?? options[0])
    : undefined;
  const displayPrice = activeOption ? activeOption.price : product.price;

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
          {product.stickers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {product.stickers.map((sticker) => (
                <span
                  key={sticker.label}
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: sticker.color }}
                >
                  {sticker.label}
                </span>
              ))}
            </div>
          )}
          {product.description && <p className="mt-3 text-gray-600">{product.description}</p>}

          {options.length > 0 && (
            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-medium text-gray-700">Lựa chọn</legend>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const isActive = option.label === activeOption?.label;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setSelectedOption(option.label)}
                      className={
                        'rounded border px-4 py-2 text-sm font-medium ' +
                        (isActive
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 text-gray-700 hover:border-primary hover:text-primary')
                      }
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <p className="mt-4 text-2xl font-medium text-primary">
            {formatPrice(displayPrice)}
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

      {product.content && (
        <div
          className="mt-10 text-gray-700 [&_a]:text-primary [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_p]:my-3"
          dangerouslySetInnerHTML={{ __html: resolveProductContentImageUrls(product.content) }}
        />
      )}

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