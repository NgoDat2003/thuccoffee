import Container from '../ui/Container';

export function BlogListSkeleton() {
  return (
    <div
      aria-label="Đang tải bài viết"
      className="grid animate-pulse grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3"
      data-testid="blog-list-skeleton"
      role="status"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index}>
          <div className="aspect-square rounded bg-gray-100" />
          <div className="mt-3 h-4 w-24 rounded bg-gray-100" />
          <div className="mt-3 h-5 w-full rounded bg-gray-100" />
          <div className="mt-2 h-4 w-4/5 rounded bg-gray-100" />
        </div>
      ))}
      <span className="sr-only">Đang tải bài viết...</span>
    </div>
  );
}

export function BlogDetailSkeleton() {
  return (
    <Container className="py-10">
      <div
        aria-label="Đang tải nội dung bài viết"
        className="grid animate-pulse gap-10 lg:grid-cols-[minmax(0,866px)_274px]"
        data-testid="blog-detail-skeleton"
        role="status"
      >
        <div>
          <div className="aspect-video rounded-[5px] bg-gray-100" />
          <div className="mt-6 h-8 w-3/4 rounded bg-gray-100" />
          <div className="mt-3 h-4 w-28 rounded bg-gray-100" />
          <div className="mt-6 h-4 w-full rounded bg-gray-100" />
          <div className="mt-3 h-4 w-5/6 rounded bg-gray-100" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-20 rounded bg-gray-100" />
          ))}
        </div>
        <span className="sr-only">Đang tải nội dung bài viết...</span>
      </div>
    </Container>
  );
}