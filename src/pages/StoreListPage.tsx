import Container from '../components/ui/Container';
import SectionTitle from '../components/ui/SectionTitle';
import StoreCard from '../components/store/StoreCard';
import { stores } from '../data';
import { usePageMeta } from '../lib/use-page-meta';

export default function StoreListPage() {
  usePageMeta('Cửa hàng', '7 điểm đến của những ai mê cà phê nguyên chất, yêu sự thân thiện gần gũi.');

  return (
    <Container className="py-10">
      <SectionTitle title="Cửa hàng" subtitle="7 điểm đến của những ai mê cà phê nguyên chất" />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        {stores.map((store) => (
          <StoreCard key={store.slug} store={store} />
        ))}
      </div>
    </Container>
  );
}
