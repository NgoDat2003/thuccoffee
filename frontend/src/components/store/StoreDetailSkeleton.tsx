import Container from '../ui/Container';

export default function StoreDetailSkeleton() {
  return (
    <Container className="py-10">
      <div
        aria-label="Đang tải cửa hàng"
        className="animate-pulse"
        data-testid="store-detail-skeleton"
        role="status"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,620px)_minmax(0,1fr)]">
          <div className="aspect-video rounded bg-gray-100" />
          <div>
            <div className="aspect-video rounded bg-gray-100" />
            <div className="mt-6 h-8 w-3/4 rounded bg-gray-100" />
            <div className="mt-3 h-4 w-full rounded bg-gray-100" />
            <div className="mt-3 h-4 w-2/3 rounded bg-gray-100" />
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-12 rounded bg-gray-100" />
          ))}
        </div>
        <span className="sr-only">Đang tải cửa hàng...</span>
      </div>
    </Container>
  );
}