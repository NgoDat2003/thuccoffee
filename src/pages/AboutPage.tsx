import aboutImage from '../assets/images/stores/698435b6_thuc-duong41.jpg';
import Container from '../components/ui/Container';
import { pages } from '../data';
import { usePageMeta } from '../lib/use-page-meta';

export default function AboutPage() {
  usePageMeta('Về chúng tôi', 'Câu chuyện thương hiệu Thức Coffee - cà phê 24/7 tại TP.HCM.');

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">{pages.about.heading}</h1>
      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <div className="space-y-4 text-gray-700">
          {pages.about.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <img
          src={aboutImage}
          alt="Không gian Thức Coffee mở cửa 24/7"
          className="w-full rounded object-cover"
        />
      </div>
    </Container>
  );
}
