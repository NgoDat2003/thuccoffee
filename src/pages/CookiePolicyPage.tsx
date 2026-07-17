import Container from '../components/ui/Container';
import { pages } from '../data';

export default function CookiePolicyPage() {
  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">{pages.cookiePolicy.heading}</h1>
      <div className="max-w-2xl space-y-4 text-gray-700">
        {pages.cookiePolicy.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </Container>
  );
}
