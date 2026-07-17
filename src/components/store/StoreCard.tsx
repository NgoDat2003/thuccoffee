import { Link } from 'react-router-dom';
import type { Store } from '../../data';
import { getImageUrl } from '../../lib/image-url';
import { toTelHref } from '../../lib/format';

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <div>
      <Link to={`/cua-hang/${store.slug}`} className="block">
        <div className="aspect-video w-full overflow-hidden rounded">
          <img src={getImageUrl(store.image)} alt={store.name} className="h-full w-full object-cover" />
        </div>
        <p className="mt-2 font-medium text-gray-800">{store.name}</p>
        <p className="mt-1 text-sm text-gray-500">{store.address}</p>
      </Link>
      <a href={toTelHref(store.phone)} className="mt-1 block text-sm text-primary hover:underline">
        {store.phone}
      </a>
    </div>
  );
}
