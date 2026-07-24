import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';

import BlogCard from '../components/blog/BlogCard';
import Container from '../components/ui/Container';
import ProductCard from '../components/ui/ProductCard';
import SectionTitle from '../components/ui/SectionTitle';
import { usePageMeta } from '../lib/use-page-meta';
import { useSearch } from '../services/search.service';

// Path segment khớp URL nguồn: `p{n}` cho product, `t3p{n}` cho blog.
function parseSegment(segment: string | undefined): {
  page: number;
  pathType: 'product' | 'blog';
} | undefined {
  if (!segment) return { page: 1, pathType: 'product' };
  const match = segment.match(/^(t3)?p(\d+)$/);
  if (!match) return undefined;
  return { page: Number(match[2]), pathType: match[1] ? 'blog' : 'product' };
}

function searchHref(type: 'product' | 'blog', keyword: string, page: number): string {
  const segment = type === 'blog' ? `t3p${page}` : `p${page}`;
  const params = new URLSearchParams({
    type: type === 'blog' ? 'Blog' : 'Product',
    keyword,
  });
  return `/search/${segment}/?${params.toString()}`;
}

function SearchPagination({ type, keyword, currentPage, totalPages }: {
  type: 'product' | 'blog';
  keyword: string;
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Phân trang tìm kiếm">
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) =>
        page === currentPage ? (
          <span key={page} aria-current="page" className="rounded border border-primary bg-primary px-3 py-2 text-sm text-white">{page}</span>
        ) : (
          <Link key={page} to={searchHref(type, keyword, page)} className="rounded border border-gray-300 px-3 py-2 text-sm hover:border-primary hover:text-primary">{page}</Link>
        ),
      )}
    </nav>
  );
}

export default function SearchPage() {
  const { segment } = useParams<{ segment: string }>();
  const [searchParams] = useSearchParams();
  const parsed = parseSegment(segment);
  const keyword = searchParams.get('keyword')?.trim() ?? '';
  // Query `type` của nguồn (Product/Blog) thắng; thiếu thì suy từ path segment.
  const queryType = searchParams.get('type')?.toLowerCase();
  const type: 'product' | 'blog' = queryType === 'blog' || queryType === 'product'
    ? queryType
    : (parsed?.pathType ?? 'product');
  const page = parsed?.page ?? 1;

  const { data: result, isLoading, isError } = useSearch({ type, keyword, page });

  usePageMeta(
    keyword ? `Tìm kiếm: ${keyword}` : 'Tìm kiếm',
    'Tìm kiếm sản phẩm và bài viết của Thức Coffee.',
  );

  if (!parsed) return <Navigate to="/search/p1/" replace />;

  const title = type === 'blog' ? 'Kết quả bài viết' : 'Kết quả sản phẩm';

  return (
    <Container className="py-10">
      <SectionTitle title={keyword ? `${title}: “${keyword}”` : 'Tìm kiếm'} />

      {!keyword ? (
        <p className="text-gray-500">Nhập từ khóa để tìm kiếm sản phẩm hoặc bài viết.</p>
      ) : isLoading ? (
        <div className="grid animate-pulse grid-cols-2 gap-6 md:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index}>
              <div className="h-[180px] rounded-[5px] bg-gray-100 md:h-[245px]" />
              <div className="mt-4 h-5 w-4/5 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : isError || !result ? (
        <p className="text-gray-500">Không thể tìm kiếm. Vui lòng thử lại sau.</p>
      ) : result.data.items.length === 0 ? (
        <p className="text-gray-500">Không tìm thấy kết quả cho “{keyword}”.</p>
      ) : result.data.type === 'product' ? (
        <>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {result.data.items.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
          <SearchPagination type={type} keyword={keyword} currentPage={page} totalPages={result.meta.totalPages} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {result.data.items.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
          <SearchPagination type={type} keyword={keyword} currentPage={page} totalPages={result.meta.totalPages} />
        </>
      )}
    </Container>
  );
}
