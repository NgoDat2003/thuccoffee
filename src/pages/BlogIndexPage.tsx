import { Navigate, useParams } from 'react-router-dom';
import BlogCard from '../components/blog/BlogCard';
import BlogPagination from '../components/blog/BlogPagination';
import { BlogListSkeleton } from '../components/blog/BlogSkeletons';
import Container from '../components/ui/Container';
import SectionTitle from '../components/ui/SectionTitle';
import { usePageMeta } from '../lib/use-page-meta';
import { useBlogPage } from '../services/blog.service';

export default function BlogIndexPage() {
  const { slug } = useParams<{ slug: string }>();
  const pageMatch = slug?.match(/^t1p(\d+)$/);
  const page = pageMatch ? Number(pageMatch[1]) : 1;
  const hasValidPageNumber = Number.isInteger(page) && page >= 1;
  const { data: result, isLoading, isError } = useBlogPage(hasValidPageNumber ? page : 0);

  usePageMeta(
    page === 1 ? 'Chuyện của Thức' : 'Chuyện của Thức - Trang ' + page,
    'Tin tức và khuyến mãi mới nhất từ Thức Coffee.',
  );

  if (!hasValidPageNumber) return <Navigate to="/chuyen-cua-thuc" replace />;
  if (isLoading) {
    return (
      <Container className="py-10">
        <SectionTitle title="Chuyện của Thức" />
        <BlogListSkeleton />
      </Container>
    );
  }
  if (isError || !result) {
    return (
      <Container className="py-10">
        <p className="text-gray-500">Không thể tải bài viết. Vui lòng thử lại sau.</p>
      </Container>
    );
  }
  if (page > result.meta.totalPages) return <Navigate to="/chuyen-cua-thuc" replace />;

  return (
    <Container className="py-10">
      <SectionTitle title="Chuyện của Thức" />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        {result.data.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
      <BlogPagination currentPage={page} totalPages={result.meta.totalPages} />
    </Container>
  );
}