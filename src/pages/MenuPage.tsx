import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CategoryDropdown from '../components/menu/CategoryDropdown';
import CategorySidebar from '../components/menu/CategorySidebar';
import MenuSkeleton from '../components/menu/MenuSkeleton';
import Container from '../components/ui/Container';
import ProductCard from '../components/ui/ProductCard';
import SectionTitle from '../components/ui/SectionTitle';
import { categoryHref, categoryKeyFromPath } from '../data/category-paths';
import { usePageMeta } from '../lib/use-page-meta';
import { useProducts } from '../services/products.service';

export default function MenuPage() {
  usePageMeta('Menu', 'Thực đơn thức uống Thức Coffee - cà phê, trà, milk tea, đá xay và bánh.');

  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const routeCategory = slug ? categoryKeyFromPath(slug) : undefined;
  const [selectedCategory, setSelectedCategory] = useState('san-pham-moi');
  const activeCategory = routeCategory ?? selectedCategory;
  const { data: products = [], isLoading, isError } = useProducts(activeCategory);

  const handleSelect = (categoryKey: string) => {
    if (routeCategory) {
      navigate(categoryHref(categoryKey));
      return;
    }

    setSelectedCategory(categoryKey);
  };

  return (
    <Container className="py-10">
      <SectionTitle title="Thức Menu" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
        <div>
          <CategoryDropdown activeKey={activeCategory} onSelect={handleSelect} />
          <CategorySidebar
            activeKey={activeCategory}
            clientSideSelection={!routeCategory}
            onSelect={handleSelect}
          />
        </div>

        <div>
          {isLoading ? (
            <MenuSkeleton />
          ) : isError ? (
            <p className="text-gray-500">Không thể tải thực đơn. Vui lòng thử lại sau.</p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Chưa có sản phẩm trong danh mục này.</p>
          )}
        </div>
      </div>
    </Container>
  );
}