import { Navigate, useNavigate, useParams } from 'react-router-dom';
import type { StoreDetail } from '@server/src/modules/stores/stores.schemas';
import BranchSelector from '../components/store/BranchSelector';
import MapEmbed from '../components/store/MapEmbed';
import StoreDetailSkeleton from '../components/store/StoreDetailSkeleton';
import StoreGallery from '../components/store/StoreGallery';
import Container from '../components/ui/Container';
import { toTelHref } from '../lib/format';
import { usePageMeta } from '../lib/use-page-meta';
import { useStore } from '../services/stores.service';

export default function StoreDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: store, isLoading, isError } = useStore(slug ?? '');

  usePageMeta(store?.name ?? 'Cửa hàng', store ? `${store.address} - ${store.hours}` : undefined);

  if (isLoading) return <StoreDetailSkeleton />;
  if (isError || !store) return <Navigate to="/cua-hang" replace />;

  return <StoreDetailView store={store} onBack={() => navigate(-1)} />;
}

interface StoreDetailViewProps {
  store: StoreDetail;
  onBack?: () => void;
}

export function StoreDetailView({ store, onBack }: StoreDetailViewProps) {
  return (
    <Container className="py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,620px)_minmax(0,1fr)]">
        <StoreGallery images={store.gallery} storeName={store.name} />

        <div>
          <MapEmbed address={store.address} embedUrl={store.mapEmbedUrl} />
          <h1 className="mt-6 text-2xl font-bold text-primary">{store.name}</h1>
          <p className="mt-2 text-gray-700">{store.address}</p>
          <p className="mt-1 text-primary">
            Liên hệ:{' '}
            <a href={toTelHref(store.phone)} className="hover:underline">
              {store.phone}
            </a>
          </p>
          <p className="mt-1 font-medium text-secondary">{store.hours}</p>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mt-6 block text-sm font-medium text-gray-600 hover:text-primary"
            >
              ‹ Trở Lại
            </button>
          )}
        </div>
      </div>

      <BranchSelector activeSlug={store.slug} />
    </Container>
  );
}