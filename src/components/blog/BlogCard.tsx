import { Link } from 'react-router-dom';
import type { BlogListItem } from '../../../server/src/modules/blog/blog.schemas';
import { formatDate } from '../../lib/format';
import { getImageUrl } from '../../lib/image-url';

interface BlogCardProps {
  post: BlogListItem;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link to={'/chuyen-cua-thuc/' + post.slug} className="group block">
      <div className="aspect-square w-full overflow-hidden rounded">
        <img
          src={getImageUrl(post.cover)}
          alt={post.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
        />
      </div>
      <time dateTime={post.date} className="mt-3 block text-sm text-[#959595]">
        {formatDate(post.date)}
      </time>
      <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-800">{post.title}</p>
      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{post.summary}</p>
      <span className="mt-2 inline-block text-sm font-medium text-primary">Xem Tiếp</span>
    </Link>
  );
}