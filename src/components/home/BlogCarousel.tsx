import EmblaCarousel from '../ui/EmblaCarousel';
import BlogCard from '../blog/BlogCard';
import { blogPosts } from '../../data';

export default function BlogCarousel() {
  const slides = blogPosts
    .slice(0, 10)
    .map((post) => <BlogCard key={post.slug} post={post} />);

  return <EmblaCarousel slides={slides} slideClassName="w-full md:w-1/3" />;
}
