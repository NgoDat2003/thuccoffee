import { Link } from 'react-router-dom';
import { useStores } from '../../services/stores.service';

interface BranchSelectorProps {
  activeSlug: string;
}

export default function BranchSelector({ activeSlug }: BranchSelectorProps) {
  const { data: stores = [], isError } = useStores();

  if (isError || stores.length === 0) return null;

  return (
    <nav aria-label="Chọn cửa hàng" className="mt-10">
      <h2 className="mb-4 text-xl font-bold text-primary">Hệ thống cửa hàng</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stores.map((store) => {
          const active = store.slug === activeSlug;
          const label = store.name.replace('Thức Coffee - ', '');

          return (
            <Link
              key={store.slug}
              to={`/cua-hang/${store.slug}`}
              aria-current={active ? 'page' : undefined}
              className={
                active
                  ? 'rounded border border-[#fcb934] bg-[#fcb934] px-4 py-3 text-center font-medium text-secondary'
                  : 'rounded border border-accent bg-white px-4 py-3 text-center font-medium text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white'
              }
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}