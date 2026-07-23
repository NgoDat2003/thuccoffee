import Container from '../components/ui/Container';
import { StaticPageError, StaticPageLoading } from '../components/ui/StaticPageState';
import type { CookiePolicyPageContent } from '../data/pages';
import { usePageMeta } from '../lib/use-page-meta';
import { useStaticPage } from '../services/static-pages.service';

export default function CookiePolicyPage() {
  usePageMeta('Chính sách Cookie', 'Chính sách sử dụng cookie của Thức Coffee.');
  const { data: page, isLoading, isError } = useStaticPage<CookiePolicyPageContent>('cookie-policy');

  if (isLoading) return <StaticPageLoading />;
  if (isError || !page) return <StaticPageError />;
  const content = page.data;

  return (
    <Container className="py-10">
      <h1 className="mb-8 text-2xl font-bold uppercase text-primary">{content.heading}</h1>
      <div className="max-w-3xl space-y-8 text-gray-700">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-3 text-xl font-semibold text-primary">{section.heading}</h2>
            <div className="space-y-4">
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
