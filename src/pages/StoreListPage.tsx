import { StoreDetailView } from './StoreDetailPage';
import { stores } from '../data';
import { usePageMeta } from '../lib/use-page-meta';

export default function StoreListPage() {
  const [defaultStore] = stores;

  usePageMeta(
    defaultStore?.name ?? 'Cửa hàng',
    defaultStore ? `${defaultStore.address} - ${defaultStore.hours}` : undefined,
  );

  if (!defaultStore) return null;

  return <StoreDetailView store={defaultStore} />;
}
