import Container from '../components/ui/Container';
import ContactForm from '../components/ui/ContactForm';
import { StaticPageError, StaticPageLoading } from '../components/ui/StaticPageState';
import type { ContactPageContent } from '../data/pages';
import { usePageMeta } from '../lib/use-page-meta';
import { useStaticPage } from '../services/static-pages.service';

export default function ContactPage() {
  usePageMeta('Liên hệ', 'Thông tin liên hệ Thức Coffee.');
  const { data: page, isLoading, isError } = useStaticPage<ContactPageContent>('contact');

  if (isLoading) return <StaticPageLoading />;
  if (isError || !page) return <StaticPageError />;
  const content = page.data;

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-bold uppercase text-primary">{content.heading}</h1>
      <p className="mt-2 text-gray-600">{content.intro}</p>
      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-[3fr_2fr]">
        <div className="order-2 md:order-1">
          <ContactForm />
        </div>
        <div className="order-1 md:order-2">
          <h2 className="mb-3 text-lg font-semibold text-primary">{content.officeHeading}</h2>
          <p className="text-gray-700">{content.location}</p>
          <a href={`tel:${content.hotline.replace(/\s+/g, '')}`} className="mt-2 block text-primary hover:underline">
            Hotline: {content.hotline}
          </a>
          <a href={`mailto:${content.email}`} className="mt-1 block text-primary hover:underline">
            Email: {content.email}
          </a>
        </div>
      </div>
    </Container>
  );
}
