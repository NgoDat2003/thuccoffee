import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import { blogPosts, getBlogBySlug } from '../data';
import { getImageUrl, resolveBlogContentImageUrls } from '../lib/image-url';
import { usePageMeta } from '../lib/use-page-meta';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = slug ? getBlogBySlug(slug) : undefined;
  const postSlug = post?.slug;
  const [loadedContent, setLoadedContent] = useState<{ slug: string; html: string } | null>(null);
  const [contentLoadState, setContentLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [contentLoadAttempt, setContentLoadAttempt] = useState(0);

  usePageMeta(post?.title ?? 'Chuyện của Thức', post?.summary);

  useEffect(() => {
    if (!postSlug) return;
    let active = true;
    setContentLoadState('loading');
    void import('../data/blog-content')
      .then(({ blogContentBySlug }) => {
        if (!active) return;
        setLoadedContent({ slug: postSlug, html: blogContentBySlug[postSlug] ?? '' });
        setContentLoadState('loaded');
      })
      .catch(() => {
        if (active) setContentLoadState('error');
      });
    return () => {
      active = false;
    };
  }, [contentLoadAttempt, postSlug]);

  if (!post) {
    return <Navigate to="/chuyen-cua-thuc" replace />;
  }

  const content = loadedContent?.slug === post.slug ? loadedContent.html : null;
  const related = blogPosts.filter((candidate) => candidate.slug !== post.slug).slice(0, 4);

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
          <time className="mt-2 block text-sm text-[#959595]">{post.date}</time>
          {contentLoadState === 'error' ? (
            <div className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p>Không thể tải nội dung bài viết.</p>
              <button
                type="button"
                onClick={() => setContentLoadAttempt((attempt) => attempt + 1)}
                className="mt-2 font-medium underline hover:no-underline"
              >
                Thử lại
              </button>
            </div>
          ) : content === null ? (
            <p className="mt-4 text-gray-700">{post.summary}</p>
          ) : (
            <div
              className="mt-4 text-gray-700 [&_a]:text-primary [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_p]:my-3"
              dangerouslySetInnerHTML={{ __html: resolveBlogContentImageUrls(content) }}
            />
          )}

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
                    <time className="text-xs text-[#959595]">{candidate.date}</time>
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
