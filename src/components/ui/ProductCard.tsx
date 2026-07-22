import { Link } from 'react-router-dom';
import type { Product } from '../../../server/src/modules/products/products.schemas';
import { getImageUrl } from '../../lib/image-url';
import { formatPrice } from '../../lib/format';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/menu/${product.slug}`} className="group block">
      <div className="h-[180px] w-full overflow-hidden rounded-[5px] bg-gray-100 md:h-[245px]">
        <img
          src={getImageUrl(product.thumb)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="h-[120px] overflow-hidden bg-white/60 px-[15px] pt-[15px]">
        <p className="mb-[15px] truncate text-base font-normal uppercase text-[#292929] transition-colors group-hover:text-primary">
          {product.name}
        </p>
        <p className="text-xl font-medium leading-[30px] text-primary">
          {product.price !== null ? formatPrice(product.price) : 'Liên hệ'}
        </p>
      </div>
    </Link>
  );
}
