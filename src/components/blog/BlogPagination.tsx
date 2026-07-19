import { Link } from 'react-router-dom';
import { BLOG_PAGE_COUNT } from '../../data';

interface BlogPaginationProps {
  currentPage: number;
}

export default function BlogPagination({ currentPage }: BlogPaginationProps) {
  const pageLink = (page: number) => '/chuyen-cua-thuc/t1p' + page;

  return (
    <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="Phân trang bài viết">
      {currentPage > 1 && (
        <Link
          to={pageLink(currentPage - 1)}
          className="rounded border border-gray-300 px-3 py-2 text-sm hover:border-primary hover:text-primary"
        >
          Trước
        </Link>
      )}

      {Array.from({ length: BLOG_PAGE_COUNT }, (_, index) => index + 1).map((page) =>
        page === currentPage ? (
          <span
            key={page}
            className="rounded border border-primary bg-primary px-3 py-2 text-sm text-white"
            aria-current="page"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            to={pageLink(page)}
            className="rounded border border-gray-300 px-3 py-2 text-sm hover:border-primary hover:text-primary"
          >
            {page}
          </Link>
        ),
      )}

      {currentPage < BLOG_PAGE_COUNT && (
        <Link
          to={pageLink(currentPage + 1)}
          className="rounded border border-gray-300 px-3 py-2 text-sm hover:border-primary hover:text-primary"
        >
          Sau
        </Link>
      )}
    </nav>
  );
}
