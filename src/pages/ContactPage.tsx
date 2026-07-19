import Container from '../components/ui/Container';
import ContactForm from '../components/ui/ContactForm';
import { pages } from '../data';
import { usePageMeta } from '../lib/use-page-meta';

export default function ContactPage() {
  usePageMeta('Liên hệ', 'Thông tin liên hệ Thức Coffee.');

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-bold uppercase text-primary">{pages.contact.heading}</h1>
      <p className="mt-2 text-gray-600">{pages.contact.intro}</p>
      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-[3fr_2fr]">
        <div className="order-2 md:order-1">
          <ContactForm />
        </div>
        <div className="order-1 md:order-2">
          <h2 className="mb-3 text-lg font-semibold text-primary">{pages.contact.officeHeading}</h2>
          <p className="text-gray-700">{pages.contact.location}</p>
          <a href="tel:18006230" className="mt-2 block text-primary hover:underline">
            Hotline: {pages.contact.hotline}
          </a>
          <a href={`mailto:${pages.contact.email}`} className="mt-1 block text-primary hover:underline">
            Email: {pages.contact.email}
          </a>
        </div>
      </div>
    </Container>
  );
}
