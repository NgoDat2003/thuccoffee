import Container from '../components/ui/Container';
import SectionTitle from '../components/ui/SectionTitle';
import BlogCard from '../components/blog/BlogCard';
import { blogPosts } from '../data';

export default function BlogIndexPage() {
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
