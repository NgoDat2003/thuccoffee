import { Link } from 'react-router-dom';
import type { Product } from '../../data';
import { getImageUrl } from '../../lib/image-url';
import { formatPrice } from '../../lib/format';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/menu/${product.slug}`} className="group block">
      <div className="h-[245px] w-full overflow-hidden rounded-[5px] bg-gray-100">
        <img
          src={getImageUrl(product.thumb)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="mt-2">
        <p className="truncate text-sm font-medium uppercase text-primary">{product.name}</p>
        <p className="text-lg font-medium text-primary">
          {product.price !== null ? formatPrice(product.price) : 'Liên hệ'}
        </p>
      </div>
    </Link>
  );
}
