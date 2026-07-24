import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { BlogDetailSkeleton } from '../components/blog/BlogSkeletons';
import Container from '../components/ui/Container';
import { formatDate } from '../lib/format';
import { getImageUrl, resolveBlogContentImageUrls } from '../lib/image-url';
import { usePageMeta } from '../lib/use-page-meta';
import { useBlogPage, useBlogPost } from '../services/blog.service';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = useBlogPost(slug ?? '');
  const { data: relatedResult } = useBlogPage(1);

  usePageMeta(post?.title ?? 'Chuyện của Thức', post?.summary);

  if (isLoading) return <BlogDetailSkeleton />;
  if (isError || !post) return <Navigate to="/chuyen-cua-thuc" replace />;

  const related = (relatedResult?.data ?? [])
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(0, 4);

  return (
    <Container className="py-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,866px)_274px]">
        <article>
          <img
            src={getImageUrl(post.cover)}
            alt={post.title}
            className="aspect-video w-full rounded-[5px] object-cover"
          />
          <h1 className="mt-6 text-2xl font-bold text-primary">{post.title}</h1>
          <time dateTime={post.date} className="mt-2 block text-sm text-[#959595]">
            {formatDate(post.date)}
          </time>
          <div
            className="mt-4 text-gray-700 [&_a]:text-primary [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_p]:my-3"
            dangerouslySetInnerHTML={{ __html: resolveBlogContentImageUrls(post.content) }}
          />

          <button
            onClick={() => navigate(-1)}
            className="mt-6 block text-sm font-medium text-gray-600 hover:text-primary"
          >
            ‹ Trở Lại
          </button>
        </article>

        <aside className="space-y-8" aria-label="Bài viết liên quan và khuyến mãi">
          <section>
            <h2 className="border-b border-gray-200 pb-3 text-lg font-medium text-primary">
              Bài viết liên quan
            </h2>
            <div className="mt-4 space-y-4">
              {related.map((candidate) => (
                <Link
                  key={candidate.slug}
                  to={'/chuyen-cua-thuc/' + candidate.slug}
                  className="group grid grid-cols-[72px_1fr] gap-3"
                >
                  <img
                    src={getImageUrl(candidate.cover)}
                    alt=""
                    className="aspect-square w-full rounded object-cover"
                  />
                  <div>
                    <time dateTime={candidate.date} className="text-xs text-[#959595]">
                      {formatDate(candidate.date)}
                    </time>
                    <p className="mt-1 line-clamp-3 text-sm font-medium group-hover:text-primary">
                      {candidate.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <Link
            to="/chuong-trinh-thanh-vien"
            className="block rounded bg-primary p-5 text-white hover:bg-primary/90"
          >
            <span className="text-lg font-medium">Ưu đãi thành viên</span>
            <span className="mt-2 block text-sm">Tích điểm và nhận ưu đãi cùng Thức Coffee.</span>
            <span className="mt-3 block text-sm font-medium">Xem Tiếp →</span>
          </Link>
        </aside>
      </div>
    </Container>
  );
}