import { Navigate, useParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import SectionTitle from '../components/ui/SectionTitle';
import BlogCard from '../components/blog/BlogCard';
import BlogPagination from '../components/blog/BlogPagination';
import { BLOG_PAGE_COUNT, getBlogPage } from '../data';
import { usePageMeta } from '../lib/use-page-meta';

export default function BlogIndexPage() {
  const { slug } = useParams<{ slug: string }>();
  const pageMatch = slug?.match(/^t1p(\d+)$/);
  const page = pageMatch ? Number(pageMatch[1]) : 1;
  const isValidPage = Number.isInteger(page) && page >= 1 && page <= BLOG_PAGE_COUNT;

  usePageMeta(
    page === 1 ? 'Chuyện của Thức' : 'Chuyện của Thức - Trang ' + page,
    'Tin tức và khuyến mãi mới nhất từ Thức Coffee.',
  );

  if (!isValidPage) {
    return <Navigate to="/chuyen-cua-thuc" replace />;
  }

  const posts = getBlogPage(page);

  return (
    <Container className="py-10">
      <SectionTitle title="Chuyện của Thức" />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        {posts.map((post, index) => (
          <BlogCard key={post.slug + '-' + index} post={post} />
        ))}
      </div>
      <BlogPagination currentPage={page} />
    </Container>
  );
}
