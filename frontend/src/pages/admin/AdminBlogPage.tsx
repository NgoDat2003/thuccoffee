import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import type { AdminBlogListItem } from '@server/src/modules/blog/blog.admin.schemas';
import AdminTable, {
  type AdminSortState,
  type AdminTableChange,
  type AdminTableColumn,
} from '../../components/admin/ui/AdminTable';
import AdminTableToolbar from '../../components/admin/ui/AdminTableToolbar';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import PublishSwitch from '../../components/admin/ui/PublishSwitch';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { formatDate } from '../../lib/format';
import { getImageUrl } from '../../lib/image-url';
import { usePageMeta } from '../../lib/use-page-meta';
import {
  useAdminBlogList,
  usePublishBlogPost,
  type AdminBlogListParams,
} from '../../services/admin/blog.service';

const blogSortMap = {
  post: 'title',
  publishedAt: 'publishedAt',
  updatedAt: 'updatedAt',
} as const;

type BlogStatus = AdminBlogListParams['status'];

function toBlogApiSort(sort: AdminSortState | null): Pick<AdminBlogListParams, 'sortBy' | 'sortDir'> {
  if (!sort || !(sort.key in blogSortMap)) return {};
  return {
    sortBy: blogSortMap[sort.key as keyof typeof blogSortMap],
    sortDir: sort.direction,
  };
}

function BlogContent() {
  usePageMeta('Quản lý bài viết');
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<BlogStatus>('all');
  const [sort, setSort] = useState<AdminSortState | null>({
    key: 'publishedAt',
    direction: 'desc',
  });
  const [pendingUnpublish, setPendingUnpublish] = useState<AdminBlogListItem>();
  const posts = useAdminBlogList({
    page,
    q: query,
    status,
    ...toBlogApiSort(sort),
  });
  const publish = usePublishBlogPost();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!posts.data) return;
    const lastPage = Math.max(1, posts.data.meta.totalPages);
    if (page > lastPage) setPage(lastPage);
  }, [page, posts.data]);

  const changePublished = (post: AdminBlogListItem, next: boolean) => {
    if (!next) return setPendingUnpublish(post);
    publish.mutate(
      { id: post.id, input: { isPublished: true } },
      {
        onSuccess: () => showToast('Đã hiển thị bài viết.'),
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  };

  const changeTable = (change: AdminTableChange) => {
    if (change.action !== 'sort') return;
    setSort(change.sort);
    setPage(1);
  };

  const columns: Array<AdminTableColumn<AdminBlogListItem>> = [
    {
      key: 'post',
      label: 'Bài viết',
      sortValue: (post) => post.title,
      render: (post) => (
        <div className="flex min-w-[260px] items-center gap-[13px]">
          <img src={getImageUrl(post.cover)} alt="" className="h-11 w-[62px] shrink-0 rounded-lg object-cover" />
          <div>
            <p className="text-[14.5px] font-semibold text-admin-ink">{post.title}</p>
            <p className="text-[12px] text-admin-muted-2">{post.slug}</p>
          </div>
        </div>
      ),
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
      render: (post) => (
        <div className="flex items-center gap-2.5">
          <PublishSwitch active={post.isPublished} disabled={publish.isPending} onChange={(next) => changePublished(post, next)} />
          <StatusBadge active={post.isPublished} />
        </div>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Cập nhật',
      sortValue: (post) => post.updatedAt,
      render: (post) => <span className="text-admin-muted-2">{formatDate(post.updatedAt)}</span>,
    },
    {
      key: 'actions',
      label: 'Thao tác',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (post) => (
        <div className="flex justify-end gap-4">
          <Link className="text-[13px] font-semibold text-admin-accent-strong" to={'/admin/blog/' + post.id}>Sửa</Link>
          <Link className="text-[13px] font-semibold text-admin-muted-2" to={'/chuyen-cua-thuc/' + post.slug} target="_blank">Xem</Link>
        </div>
      ),
    },
  ];

  const activeFilterCount = Number(Boolean(search)) + Number(status !== 'all');

  return (
    <section className="w-full min-w-0">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p>
          <h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Bài viết</h1>
        </div>
        <Link to="/admin/blog/new" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-admin-ink px-[22px] text-[14px] font-bold text-admin-bg">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Thêm bài viết
        </Link>
      </header>
      <p className="mb-5 text-[14px] text-admin-muted">Quản lý nội dung Chuyện của Thức.</p>

      <AdminTableToolbar
        resultCount={posts.data?.meta.total}
        activeFilterCount={activeFilterCount}
        onClearFilters={() => {
          setSearch('');
          setQuery('');
          setStatus('all');
          setPage(1);
        }}
      >
        <input
          aria-label="Tìm bài viết"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Tìm tiêu đề hoặc slug"
          className="min-w-[220px] flex-1 rounded-[10px] border border-admin-border-input bg-admin-surface px-3.5 py-2.5 text-[14px] text-admin-ink outline-none focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15"
        />
        <select
          aria-label="Lọc trạng thái bài viết"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as BlogStatus);
            setPage(1);
          }}
          className="rounded-[10px] border border-admin-border-input bg-admin-surface px-4 py-2.5 text-[14px] text-admin-ink outline-none focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đang hiển thị</option>
          <option value="draft">Bản nháp</option>
        </select>
      </AdminTableToolbar>

      {posts.isError ? (
        <p role="alert" className="py-8 text-admin-danger">{posts.error.message}</p>
      ) : (
        <AdminTable
          mode="server"
          rows={posts.data?.data ?? []}
          columns={columns}
          rowKey={(post) => post.id}
          isLoading={posts.isPending}
          emptyText="Không tìm thấy bài viết phù hợp."
          sort={sort}
          onChange={changeTable}
          pagination={posts.data ? {
            page: posts.data.meta.page,
            totalPages: posts.data.meta.totalPages,
            totalRows: posts.data.meta.total,
            onPageChange: setPage,
          } : undefined}
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
          publish.mutate(
            { id: pendingUnpublish.id, input: { isPublished: false } },
            {
              onSuccess: () => {
                setPendingUnpublish(undefined);
                showToast('Đã ẩn bài viết.');
              },
              onError: (error) => showToast(error.message, 'error'),
            },
          );
        }}
      />
    </section>
  );
}

export default function AdminBlogPage() {
  return <ToastProvider><BlogContent /></ToastProvider>;
}
