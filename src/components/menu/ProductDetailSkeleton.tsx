import Container from '../ui/Container';

export default function ProductDetailSkeleton() {
  return (
    <Container className="py-10">
      <div
        aria-label="Đang tải sản phẩm"
        className="animate-pulse"
        data-testid="product-detail-skeleton"
        role="status"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-square w-full rounded-[5px] bg-gray-100" />

          <div>
            <div className="h-8 w-2/3 rounded bg-gray-100" />
            <div className="mt-4 h-4 w-full rounded bg-gray-100" />
            <div className="mt-2 h-4 w-4/5 rounded bg-gray-100" />
            <div className="mt-5 h-8 w-32 rounded bg-gray-100" />
            <div className="mt-6 h-11 w-44 rounded bg-gray-100" />
            <div className="mt-4 h-5 w-20 rounded bg-gray-100" />
          </div>
        </div>

        <div className="mt-12">
          <div className="mx-auto h-7 w-64 rounded bg-gray-100" />
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index}>
                <div className="h-[180px] rounded-[5px] bg-gray-100 md:h-[245px]" />
                <div className="mt-4 h-5 w-4/5 rounded bg-gray-100" />
                <div className="mt-4 h-6 w-24 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>

        <span className="sr-only">Đang tải sản phẩm...</span>
      </div>
    </Container>
  );
}