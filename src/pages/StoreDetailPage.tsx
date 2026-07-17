import { useNavigate, useParams, Navigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Breadcrumb from '../components/ui/Breadcrumb';
import MapEmbed from '../components/store/MapEmbed';
import { getStoreBySlug } from '../data';
import { getImageUrl } from '../lib/image-url';
import { toTelHref } from '../lib/format';

export default function StoreDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const store = slug ? getStoreBySlug(slug) : undefined;

  if (!store) {
    return <Navigate to="/cua-hang" replace />;
  }

  return (
    <Container className="py-10">
      <Breadcrumb
        items={[{ label: 'Trang chủ', to: '/' }, { label: 'Cửa hàng', to: '/cua-hang' }, { label: store.name }]}
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <img
            src={getImageUrl(store.image)}
            alt={store.name}
            className="aspect-video w-full rounded-[5px] object-cover"
          />
          <h1 className="mt-6 text-2xl font-bold text-primary">{store.name}</h1>
          <p className="mt-2 text-gray-700">{store.address}</p>
          <p className="mt-1 text-primary">
            Liên hệ:{' '}
            <a href={toTelHref(store.phone)} className="hover:underline">
              {store.phone}
            </a>
          </p>
          <p className="mt-1 font-medium text-secondary">{store.hours}</p>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 block text-sm font-medium text-gray-600 hover:text-primary"
          >
            ‹ Trở Lại
          </button>
        </div>

        <MapEmbed address={store.address} />
      </div>
    </Container>
  );
}
