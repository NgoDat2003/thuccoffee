export default function MenuSkeleton() {
  return (
    <div
      aria-label="Đang tải thực đơn"
      className="grid animate-pulse grid-cols-2 gap-6 md:grid-cols-3"
      data-testid="menu-skeleton"
      role="status"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index}>
          <div className="h-[180px] rounded-[5px] bg-gray-100 md:h-[245px]" />
          <div className="mt-4 h-5 w-4/5 rounded bg-gray-100" />
          <div className="mt-4 h-6 w-24 rounded bg-gray-100" />
        </div>
      ))}
      <span className="sr-only">Đang tải thực đơn...</span>
    </div>
  );
}