import { useNavigate, useParams, Navigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Breadcrumb from '../components/ui/Breadcrumb';
import SectionTitle from '../components/ui/SectionTitle';
import BlogCard from '../components/blog/BlogCard';
import { blogPosts, getBlogBySlug } from '../data';
import { getImageUrl } from '../lib/image-url';
import { usePageMeta } from '../lib/use-page-meta';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const post = slug ? getBlogBySlug(slug) : undefined;

  usePageMeta(post?.title ?? 'Chuyện của Thức', post?.summary);

  if (!post) {
    return <Navigate to="/chuyen-cua-thuc" replace />;
  }

  // Source articles have no body text — the summary is reused as the body.
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 4);

  return (
    <Container className="py-10">
      <Breadcrumb
        items={[
          { label: 'Trang chủ', to: '/' },
          { label: 'Chuyện của Thức', to: '/chuyen-cua-thuc' },
          { label: post.title },
        ]}
      />

      <div className="mx-auto max-w-2xl">
        <img
          src={getImageUrl(post.cover)}
          alt={post.title}
          className="aspect-video w-full rounded-[5px] object-cover"
        />
        <h1 className="mt-6 text-2xl font-bold text-primary">{post.title}</h1>
        <p className="mt-4 text-gray-700">{post.summary}</p>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 block text-sm font-medium text-gray-600 hover:text-primary"
        >
          ‹ Trở Lại
        </button>
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <SectionTitle title="Bài viết khác" />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {related.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
