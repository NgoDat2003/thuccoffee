import { Link } from 'react-router-dom';
import { getImageUrl } from '../../lib/image-url';

export default function FloatingOrderButton() {
  return (
    <Link
      to="/delivery"
      aria-label={'\u0110\u1eb7t h\u00e0ng'}
      className="fixed right-6 bottom-[130px] z-30 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white shadow-lg"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full border-2 border-primary/60" aria-hidden="true" />
      <img src={getImageUrl('site/icon-delivery.png')} alt="" className="max-h-[60px] w-auto" />

    </Link>
  );
}
