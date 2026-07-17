import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import { pages } from '../data';

export default function DeliveryPage() {
  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">{pages.delivery.heading}</h1>
      <p className="max-w-2xl text-gray-700">{pages.delivery.body}</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href="tel:18006230"
          className="rounded bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
        >
          Gọi đặt hàng: 1800 6230
        </a>
        <Link
          to="/cua-hang"
          className="rounded border border-primary px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-white"
        >
          Tìm cửa hàng gần nhất
        </Link>
      </div>
    </Container>
  );
}
