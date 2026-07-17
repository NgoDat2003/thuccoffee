import Container from '../components/ui/Container';
import ContactForm from '../components/ui/ContactForm';
import { pages } from '../data';
import { usePageMeta } from '../lib/use-page-meta';

export default function ContactPage() {
  usePageMeta('Liên hệ', 'Thông tin liên hệ Thức Coffee.');

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">{pages.contact.heading}</h1>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <p className="text-gray-700">{pages.contact.location}</p>
          <a href="tel:18006230" className="mt-2 block text-primary hover:underline">
            {pages.contact.hotline}
          </a>
          <a href={`mailto:${pages.contact.email}`} className="mt-1 block text-primary hover:underline">
            {pages.contact.email}
          </a>
        </div>
        <ContactForm />
      </div>
    </Container>
  );
}
