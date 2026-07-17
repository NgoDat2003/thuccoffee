import SectionTitle from '../ui/SectionTitle';
import ProductCard from '../ui/ProductCard';
import type { Product } from '../../data';

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="mt-12">
      <SectionTitle title="Sản phẩm cùng danh mục" />
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
