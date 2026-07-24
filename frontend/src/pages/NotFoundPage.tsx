import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import { usePageMeta } from '../lib/use-page-meta';

export default function NotFoundPage() {
  usePageMeta('404', 'Không tìm thấy trang bạn yêu cầu.');

  return (
    <Container className="py-20 text-center">
      <h1 className="text-4xl font-bold text-primary">404</h1>
      <p className="mt-4 text-gray-600">Không tìm thấy trang bạn yêu cầu.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
      >
        Về trang chủ
      </Link>
    </Container>
  );
}
