import { Link } from 'react-router-dom';
import EmblaCarousel from '../ui/EmblaCarousel';
import { blogPosts } from '../../data';
import { getImageUrl } from '../../lib/image-url';

export default function BlogCarousel() {
  const slides = blogPosts.map((post) => (
    <Link key={post.slug} to={`/chuyen-cua-thuc/${post.slug}`} className="block">
      <div className="aspect-square w-full overflow-hidden rounded">
        <img src={getImageUrl(post.cover)} alt={post.title} className="h-full w-full object-cover" />
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium text-gray-800">{post.title}</p>
    </Link>
  ));

  return <EmblaCarousel slides={slides} slideClassName="w-full md:w-1/3" />;
}
