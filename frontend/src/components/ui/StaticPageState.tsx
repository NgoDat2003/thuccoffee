import Container from './Container';

// Trạng thái loading/error dùng chung cho các trang nội dung đọc từ API.
export function StaticPageLoading() {
  return (
    <Container className="py-10">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-2/5 rounded bg-gray-100" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-11/12 rounded bg-gray-100" />
        <div className="h-4 w-4/5 rounded bg-gray-100" />
      </div>
    </Container>
  );
}

export function StaticPageError() {
  return (
    <Container className="py-10">
      <p className="text-gray-500">Không thể tải nội dung. Vui lòng thử lại sau.</p>
    </Container>
  );
}
