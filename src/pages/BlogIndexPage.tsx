import Container from '../components/ui/Container';
import SectionTitle from '../components/ui/SectionTitle';
import BlogCard from '../components/blog/BlogCard';
import { blogPosts } from '../data';
import { usePageMeta } from '../lib/use-page-meta';

export default function BlogIndexPage() {
  usePageMeta('Chuyện của Thức', 'Tin tức và khuyến mãi mới nhất từ Thức Coffee.');

  return (
    <Container className="py-10">
      <SectionTitle title="Chuyện của Thức" />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        {blogPosts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </Container>
  );
}
