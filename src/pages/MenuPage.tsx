import { useState } from 'react';
import Container from '../components/ui/Container';
import SectionTitle from '../components/ui/SectionTitle';
import ProductCard from '../components/ui/ProductCard';
import CategorySidebar from '../components/menu/CategorySidebar';
import CategoryDropdown from '../components/menu/CategoryDropdown';
import { getProductsByCategory } from '../data';

export default function MenuPage() {
  const [activeCat, setActiveCat] = useState('san-pham-moi');
  const products = getProductsByCategory(activeCat);

  return (
    <Container className="py-10">
      <SectionTitle title="Thức Menu" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
        <div>
          <CategoryDropdown activeKey={activeCat} onSelect={setActiveCat} />
          <CategorySidebar activeKey={activeCat} onSelect={setActiveCat} />
        </div>

        <div>
          {products.length > 0 ? (
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
