import { Link } from 'react-router-dom';
import { getImageUrl } from '../../lib/image-url';

export default function PromoBanner() {
  return (
    <Link to="/chuong-trinh-thanh-vien" className="block overflow-hidden rounded">
      <img
        src={getImageUrl('2e94f8cc_cover-fb.jpg')}
        alt="Ưu đãi khi đến với Thức"
        className="w-full object-cover"
      />
    </Link>
  );
}
