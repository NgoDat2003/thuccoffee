import { useProducts } from '../../services/products.service';
import SectionTitle from '../ui/SectionTitle';
import ProductCard from '../ui/ProductCard';

interface RelatedProductsProps {
  categoryKey: string;
  currentSlug: string;
}

export default function RelatedProducts({ categoryKey, currentSlug }: RelatedProductsProps) {
  const { data: products = [] } = useProducts(categoryKey);
  const related = products
    .filter((product) => product.slug !== currentSlug)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className="mt-12">
      <SectionTitle title="Sản phẩm cùng danh mục" />
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {related.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}