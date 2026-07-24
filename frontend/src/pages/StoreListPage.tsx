import Container from '../components/ui/Container';
import StoreDetailSkeleton from '../components/store/StoreDetailSkeleton';
import { usePageMeta } from '../lib/use-page-meta';
import { useStore, useStores } from '../services/stores.service';
import { StoreDetailView } from './StoreDetailPage';

export default function StoreListPage() {
  const { data: stores = [], isLoading: storesLoading, isError: storesError } = useStores();
  const defaultSlug = stores[0]?.slug ?? '';
  const {
    data: defaultStore,
    isLoading: detailLoading,
    isError: detailError,
  } = useStore(defaultSlug);

  usePageMeta(
    defaultStore?.name ?? 'Cửa hàng',
    defaultStore ? `${defaultStore.address} - ${defaultStore.hours}` : undefined,
  );

  if (storesLoading || detailLoading) return <StoreDetailSkeleton />;

  if (storesError || detailError || !defaultStore) {
    return (
      <Container className="py-10">
        <p className="text-gray-500">Không thể tải thông tin cửa hàng. Vui lòng thử lại sau.</p>
      </Container>
    );
  }

  return <StoreDetailView store={defaultStore} />;
}