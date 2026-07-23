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
    const timer = window.setTimeout(() => { setPage(1); setQuery(search.trim()); }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const changePublished = (post: AdminBlogListItem, next: boolean) => {
    if (!next) return setPendingUnpublish(post);
    publish.mutate({ id: post.id, input: { isPublished: true } }, { onSuccess: () => showToast('Đã hiển thị bài viết.'), onError: (error) => showToast(error.message, 'error') });
  };

  const columns: Array<AdminTableColumn<AdminBlogListItem>> = [
    { key: 'post', label: 'Bài viết', sortValue: (p) => p.title, render: (p) => <div className="flex min-w-[260px] items-center gap-[13px]"><img src={getImageUrl(p.cover)} alt="" className="h-11 w-[62px] shrink-0 rounded-lg object-cover" /><div><p className="text-[14.5px] font-semibold text-admin-ink">{p.title}</p><p className="text-[12px] text-admin-muted-2">{p.slug}</p></div></div> },
    { key: 'publishedAt', label: 'Ngày đăng', sortValue: (p) => p.publishedAt, render: (p) => formatDate(p.publishedAt) },
    { key: 'status', label: 'Trạng thái', render: (p) => <div className="flex items-center gap-2.5"><PublishSwitch active={p.isPublished} disabled={publish.isPending} onChange={(next) => changePublished(p, next)} /><StatusBadge active={p.isPublished} /></div> },
    { key: 'updatedAt', label: 'Cập nhật', sortValue: (p) => p.updatedAt, render: (p) => <span className="text-admin-muted-2">{formatDate(p.updatedAt)}</span> },
    { key: 'actions', label: 'Thao tác', render: (p) => <div className="flex justify-end gap-4"><Link className="text-[13px] font-semibold text-admin-accent-strong" to={'/admin/blog/' + p.id}>Sửa</Link><Link className="text-[13px] font-semibold text-admin-muted-2" to={'/chuyen-cua-thuc/' + p.slug} target="_blank">Xem</Link></div> },
  ];

  return (
    <section>
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p><h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Bài viết</h1></div>
        <Link to="/admin/blog/new" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-admin-ink px-[22px] text-[14px] font-bold text-admin-bg"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Thêm bài viết</Link>
      </header>
      <p className="mb-5 text-[14px] text-admin-muted">Quản lý nội dung Chuyện của Thức.</p>
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tiêu đề hoặc slug" className="mb-6 w-full max-w-[340px] border-0 border-b border-admin-border-input bg-transparent px-1 py-[9px] text-[14px] outline-none focus:border-admin-accent-strong" />
      {posts.isError ? <p role="alert" className="py-8 text-admin-danger">{posts.error.message}</p> : <AdminTable rows={posts.data?.data ?? []} columns={columns} rowKey={(post) => post.id} isLoading={posts.isPending} emptyText="Không tìm thấy bài viết phù hợp." pagination={posts.data ? { page: posts.data.meta.page, totalPages: posts.data.meta.totalPages, onPageChange: setPage } : undefined} />}
      <ConfirmDialog open={Boolean(pendingUnpublish)} title="Ẩn bài viết?" message="Bài viết sẽ biến mất khỏi website công khai nhưng dữ liệu vẫn được giữ." confirmLabel="Ẩn bài viết" pending={publish.isPending} onCancel={() => setPendingUnpublish(undefined)} onConfirm={() => { if (!pendingUnpublish) return; publish.mutate({ id: pendingUnpublish.id, input: { isPublished: false } }, { onSuccess: () => { setPendingUnpublish(undefined); showToast('Đã ẩn bài viết.'); }, onError: (error) => showToast(error.message, 'error') }); }} />
    </section>
  );
}

export default function AdminBlogPage() {
  return <ToastProvider><BlogContent /></ToastProvider>;
}
