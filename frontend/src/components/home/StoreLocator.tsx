import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toTelHref } from '../../lib/format';
import { getImageUrl } from '../../lib/image-url';
import { useStores } from '../../services/stores.service';

export default function StoreLocator() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: stores = [], isLoading, isError } = useStores();
  const selected = stores[selectedIndex] ?? stores[0];

  if (isLoading) {
    return <div className="h-[480px] animate-pulse rounded bg-accent/80" aria-label="Đang tải cửa hàng" />;
  }
  if (isError || !selected) return null;

  return (
    <div className="rounded bg-accent p-6 text-white md:p-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <img
            src={getImageUrl(selected.image)}
            alt={selected.name}
            className="mb-4 h-64 w-full rounded object-cover"
          />
          <p className="font-semibold">{selected.name}</p>
          <p className="mt-1 text-sm">{selected.address}</p>
          <p className="mt-1 text-sm">
            Liên hệ:{' '}
            <a href={toTelHref(selected.phone)} className="underline">
              {selected.phone}
            </a>
          </p>
          <Link
            to={`/cua-hang/${selected.slug}`}
            className="mt-4 inline-block rounded border border-white px-4 py-1.5 text-sm hover:bg-white hover:text-accent"
          >
            Xem chi tiết
          </Link>
        </div>

        <ul className="flex flex-col gap-2">
          {stores.map((store, index) => (
            <li key={store.slug}>
              <button
                onClick={() => setSelectedIndex(index)}
                className={`w-full rounded px-3 py-2 text-left text-sm font-medium ${
                  index === selectedIndex ? 'bg-white text-accent' : 'hover:bg-white/10'
                }`}
              >
                {store.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}