import Container from '../components/ui/Container';
import { StaticPageError, StaticPageLoading } from '../components/ui/StaticPageState';
import type { AboutPageContent } from '../data/pages';
import { getImageUrl } from '../lib/image-url';
import { usePageMeta } from '../lib/use-page-meta';
import { useStaticPage } from '../services/static-pages.service';

export default function AboutPage() {
  usePageMeta('Về chúng tôi', 'Câu chuyện thương hiệu Thức Coffee - cà phê 24/7 tại TP.HCM.');
  const { data: page, isLoading, isError } = useStaticPage<AboutPageContent>('about');

  if (isLoading) return <StaticPageLoading />;
  if (isError || !page) return <StaticPageError />;
  const content = page.data;

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">{content.heading}</h1>
      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <div className="space-y-4 text-gray-700">
          {content.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <img
          src={getImageUrl('stores/698435b6_thuc-duong41.jpg')}
          alt="Không gian Thức Coffee mở cửa 24/7"
          className="w-full rounded object-cover"
        />
      </div>
    </Container>
  );
}
