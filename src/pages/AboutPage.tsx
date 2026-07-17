import Container from '../components/ui/Container';
import { pages } from '../data';
import { usePageMeta } from '../lib/use-page-meta';

export default function AboutPage() {
  usePageMeta('Về chúng tôi', 'Câu chuyện thương hiệu Thức Coffee - cà phê 24/7 tại TP.HCM.');

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">{pages.about.heading}</h1>
      <div className="max-w-2xl space-y-4 text-gray-700">
        {pages.about.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </Container>
  );
}
