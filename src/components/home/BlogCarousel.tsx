import BlogCard from '../blog/BlogCard';
import EmblaCarousel from '../ui/EmblaCarousel';
import { useBlogPage } from '../../services/blog.service';

export default function BlogCarousel() {
  const { data: result, isLoading, isError } = useBlogPage(1);

  if (isLoading) return <div className="h-[420px] animate-pulse rounded bg-gray-100" />;
  if (isError || !result) return null;

  const slides = result.data
    .slice(0, 10)
    .map((post) => <BlogCard key={post.slug} post={post} />);

  return <EmblaCarousel slides={slides} slideClassName="w-full md:w-1/3" />;
}