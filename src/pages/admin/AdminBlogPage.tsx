import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import type { AdminBlogListItem } from '../../../server/src/modules/blog/blog.admin.schemas';
import AdminTable, { type AdminTableColumn } from '../../components/admin/ui/AdminTable';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import PublishSwitch from '../../components/admin/ui/PublishSwitch';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { formatDate } from '../../lib/format';
import { getImageUrl } from '../../lib/image-url';
import { usePageMeta } from '../../lib/use-page-meta';
import { useAdminBlogList, usePublishBlogPost } from '../../services/admin/blog.service';

function BlogContent() {
  usePageMeta('Quản lý bài viết');
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [pendingUnpublish, setPendingUnpublish] = useState<AdminBlogListItem>();
  const posts = useAdminBlogList({ page, q: query });
  const publish = usePublishBlogPost();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setQuery(search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  function changePublished(post: AdminBlogListItem, next: boolean) {
    if (!next) {
      setPendingUnpublish(post);
      return;
    }
    publish.mutate(
      { id: post.id, input: { isPublished: true } },
      {
        onSuccess: () => showToast('Đã hiển thị bài viết.'),
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  }

  const columns: Array<AdminTableColumn<AdminBlogListItem>> = [
    {
      key: 'cover',
      label: 'Ảnh',
      render: (post) => <img src={getImageUrl(post.cover)} alt="" className="h-12 w-20 rounded object-cover" />,
    },
    {
      key: 'title',
      label: 'Bài viết',
      sortValue: (post) => post.title,
      render: (post) => <div><p className="font-semibold text-stone-900">{post.title}</p><p className="text-xs text-stone-500">{post.slug}</p></div>,
    },
    {
      key: 'publishedAt',
      label: 'Ngày đăng',
      sortValue: (post) => post.publishedAt,
      render: (post) => formatDate(post.publishedAt),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (post) => <div className="flex items-center gap-3"><StatusBadge active={post.isPublished} /><PublishSwitch active={post.isPublished} disabled={publish.isPending} onChange={(next) => changePublished(post, next)} /></div>,
    },
    {
      key: 'updatedAt',
      label: 'Cập nhật',
      sortValue: (post) => post.updatedAt,
      render: (post) => formatDate(post.updatedAt),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (post) => <div className="flex gap-3"><Link className="font-medium text-primary" to={'/admin/blog/' + post.id}>Sửa</Link><Link className="text-stone-600" to={'/chuyen-cua-thuc/' + post.slug} target="_blank">Xem</Link></div>,
    },
  ];

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-stone-900">Bài viết</h1><p className="mt-1 text-sm text-stone-600">Quản lý 267 bài Chuyện của Thức.</p></div>
        <Link to="/admin/blog/new" className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-white">Thêm bài viết</Link>
      </div>
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tiêu đề hoặc slug" className="my-6 w-full max-w-md rounded-lg border border-stone-300 px-3 py-2.5" />
      {posts.isError ? <p role="alert" className="py-8 text-red-700">{posts.error.message}</p> : (
        <AdminTable
          rows={posts.data?.data ?? []}
          columns={columns}
          rowKey={(post) => post.id}
          isLoading={posts.isPending}
          emptyText="Không tìm thấy bài viết phù hợp."
          pagination={posts.data ? { page: posts.data.meta.page, totalPages: posts.data.meta.totalPages, onPageChange: setPage } : undefined}
        />
      )}
      <ConfirmDialog
        open={Boolean(pendingUnpublish)}
        title="Ẩn bài viết?"
        message="Bài viết sẽ biến mất khỏi website công khai nhưng dữ liệu vẫn được giữ."
        confirmLabel="Ẩn bài viết"
        pending={publish.isPending}
        onCancel={() => setPendingUnpublish(undefined)}
        onConfirm={() => {
          if (!pendingUnpublish) return;
          publish.mutate({ id: pendingUnpublish.id, input: { isPublished: false } }, {
            onSuccess: () => { setPendingUnpublish(undefined); showToast('Đã ẩn bài viết.'); },
            onError: (error) => showToast(error.message, 'error'),
          });
        }}
      />
    </section>
  );
}

export default function AdminBlogPage() {
  return <ToastProvider><BlogContent /></ToastProvider>;
}