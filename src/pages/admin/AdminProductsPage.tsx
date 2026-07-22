import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { AdminProduct } from '../../../server/src/modules/products/products.admin.schemas';
import AdminTable, {
  type AdminTableColumn,
} from '../../components/admin/ui/AdminTable';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import PublishSwitch from '../../components/admin/ui/PublishSwitch';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { getImageUrl } from '../../lib/image-url';
import { usePageMeta } from '../../lib/use-page-meta';
import {
  useAdminProducts,
  usePublishProduct,
} from '../../services/admin/products.service';

function ProductsContent() {
  usePageMeta('Quản lý sản phẩm');
  const products = useAdminProducts();
  const publishProduct = usePublishProduct();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('all');
  const [pendingUnpublish, setPendingUnpublish] = useState<AdminProduct>();

  const categoryOptions = useMemo(() => {
    const values = new Map<number, string>();
    for (const product of products.data ?? []) {
      for (const category of product.categories) values.set(category.id, category.label);
    }
    return [...values.entries()];
  }, [products.data]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('vi');
    return (products.data ?? []).filter((product) => {
      const matchesSearch = !normalizedSearch
        || product.name.toLocaleLowerCase('vi').includes(normalizedSearch)
        || product.slug.includes(normalizedSearch);
      const matchesCategory = !categoryId
        || product.categories.some((category) => String(category.id) === categoryId);
      const matchesStatus = status === 'all'
        || (status === 'published' ? product.isPublished : !product.isPublished);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryId, products.data, search, status]);

  function changePublished(product: AdminProduct, next: boolean) {
    if (!next) {
      setPendingUnpublish(product);
      return;
    }
    publishProduct.mutate(
      { id: product.id, input: { isPublished: true } },
      {
        onSuccess: () => showToast('Đã hiển thị sản phẩm.'),
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  }

  const columns: Array<AdminTableColumn<AdminProduct>> = [
    {
      key: 'thumb',
      label: 'Ảnh',
      render: (product) => (
        <img
          src={getImageUrl(product.thumb)}
          alt=""
          className="h-12 w-12 rounded-lg object-cover"
        />
      ),
    },
    {
      key: 'name',
      label: 'Tên sản phẩm',
      sortValue: (product) => product.name,
      render: (product) => (
        <div>
          <p className="font-semibold text-stone-900">{product.name}</p>
          <p className="text-xs text-stone-500">{product.slug}</p>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Giá',
      sortValue: (product) => product.price ?? 0,
      render: (product) => product.price === null
        ? '—'
        : product.price.toLocaleString('vi-VN') + 'đ',
    },
    {
      key: 'categories',
      label: 'Danh mục',
      render: (product) => product.categories.map((item) => item.label).join(', ') || '—',
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (product) => (
        <div className="flex items-center gap-3">
          <StatusBadge active={product.isPublished} />
          <PublishSwitch
            active={product.isPublished}
            disabled={publishProduct.isPending}
            onChange={(next) => changePublished(product, next)}
          />
        </div>
      ),
    },
    {
      key: 'sortOrder',
      label: 'Thứ tự',
      sortValue: (product) => product.sortOrder,
      render: (product) => product.sortOrder,
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (product) => (
        <div className="flex gap-3">
          <Link className="font-medium text-primary" to={'/admin/products/' + product.id}>
            Sửa
          </Link>
          <Link className="text-stone-600" to={'/menu/' + product.slug} target="_blank">
            Xem
          </Link>
        </div>
      ),
    },
  ];

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Sản phẩm</h1>
          <p className="mt-1 text-sm text-stone-600">Quản lý nội dung hiển thị trên menu.</p>
        </div>
        <Link to="/admin/products/new" className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-white">
          Thêm sản phẩm
        </Link>
      </div>

      <div className="my-6 grid gap-3 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm tên hoặc slug"
          className="rounded-lg border border-stone-300 px-3 py-2.5"
        />
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="rounded-lg border border-stone-300 px-3 py-2.5">
          <option value="">Tất cả danh mục</option>
          {categoryOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-stone-300 px-3 py-2.5">
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đang hiển thị</option>
          <option value="hidden">Đã ẩn</option>
        </select>
      </div>

      {products.isError ? (
        <p role="alert" className="py-8 text-red-700">{products.error.message}</p>
      ) : (
        <AdminTable
          rows={filteredProducts}
          columns={columns}
          rowKey={(product) => product.id}
          isLoading={products.isPending}
          emptyText="Không tìm thấy sản phẩm phù hợp."
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingUnpublish)}
        title="Ẩn sản phẩm?"
        message="Sản phẩm sẽ biến mất khỏi menu công khai nhưng dữ liệu vẫn được giữ."
        confirmLabel="Ẩn sản phẩm"
        pending={publishProduct.isPending}
        onCancel={() => setPendingUnpublish(undefined)}
        onConfirm={() => {
          if (!pendingUnpublish) return;
          publishProduct.mutate(
            { id: pendingUnpublish.id, input: { isPublished: false } },
            {
              onSuccess: () => {
                setPendingUnpublish(undefined);
                showToast('Đã ẩn sản phẩm.');
              },
              onError: (error) => showToast(error.message, 'error'),
            },
          );
        }}
      />
    </section>
  );
}

export default function AdminProductsPage() {
  return <ToastProvider><ProductsContent /></ToastProvider>;
}