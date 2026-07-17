import { Link } from 'react-router-dom';
import type { BlogPost } from '../../data';
import { getImageUrl } from '../../lib/image-url';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link to={`/chuyen-cua-thuc/${post.slug}`} className="block">
      <div className="aspect-square w-full overflow-hidden rounded">
        <img src={getImageUrl(post.cover)} alt={post.title} className="h-full w-full object-cover" />
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium text-gray-800">{post.title}</p>
      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{post.summary}</p>
    </Link>
  );
}
