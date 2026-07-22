import { Link } from 'react-router-dom';

export default function AdminNotFound() {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-stone-900">Chưa có màn hình này</h1>
      <p className="mt-2 text-stone-600">
        Chức năng quản trị này sẽ được bổ sung ở phase tiếp theo.
      </p>
      <Link
        to="/admin/products"
        className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2.5 font-semibold text-white"
      >
        Về sản phẩm
      </Link>
    </section>
  );
}