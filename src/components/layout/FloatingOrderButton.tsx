import { Link } from 'react-router-dom';

export default function FloatingOrderButton() {
  return (
    <Link
      to="/delivery"
      className="fixed bottom-6 right-6 z-30 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-primary/90"
    >
      Đặt hàng
    </Link>
  );
}
