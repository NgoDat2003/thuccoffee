import { useMemo, useState } from 'react';

import type { MembershipFaq } from '../../../server/src/modules/membership-faqs/membership-faqs.routes';
import { FaqForm } from './FaqForm';
import AdminDrawer from '../../components/admin/ui/AdminDrawer';
import AdminTable, { type AdminTableColumn } from '../../components/admin/ui/AdminTable';
import AdminTableToolbar from '../../components/admin/ui/AdminTableToolbar';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import PublishSwitch from '../../components/admin/ui/PublishSwitch';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { usePageMeta } from '../../lib/use-page-meta';
import {
  useAdminMembershipFaqs,
  useDeleteMembershipFaq,
  useUpdateMembershipFaq,
} from '../../services/admin/static-pages.service';

type FaqStatus = 'all' | 'published' | 'draft';

function FaqContent() {
  usePageMeta('FAQ thành viên');
  const faqs = useAdminMembershipFaqs();
  const deleteFaq = useDeleteMembershipFaq();
  const updateFaq = useUpdateMembershipFaq();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<FaqStatus>('all');
  const [pendingDelete, setPendingDelete] = useState<MembershipFaq>();
  const [drawerFaq, setDrawerFaq] = useState<number | null>(); // null = create, undefined = closed, number = edit

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (faqs.data ?? [])
      .filter((faq) => {
        const matchesSearch =
          !query ||
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query);
        const matchesStatus =
          status === 'all' ||
          (status === 'published' ? faq.isPublished : !faq.isPublished);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [faqs.data, search, status]);

  const columns: Array<AdminTableColumn<MembershipFaq>> = [
    {
      key: 'question',
      label: 'Câu hỏi',
      sortValue: (faq) => faq.question,
      render: (faq) => (
        <span className="text-[14.5px] font-semibold text-admin-ink">{faq.question}</span>
      ),
    },
    {
      key: 'answer',
      label: 'Câu trả lời',
      render: (faq) => (
        <span className="line-clamp-2 max-w-xl text-[13.5px] text-admin-muted">{faq.answer}</span>
      ),
    },
    {
      key: 'sortOrder',
      label: 'Thứ tự',
      headerClassName: '!text-center',
      cellClassName: 'text-center',
      sortValue: (faq) => faq.sortOrder,
      render: (faq) => (
        <span className="text-[13.5px] text-admin-muted-2">{faq.sortOrder}</span>
      ),
    },
    {
      key: 'isPublished',
      label: 'Trạng thái',
      headerClassName: '!text-center',
      cellClassName: 'text-center',
      render: (faq) => (
        <div className="flex items-center justify-center gap-2.5">
          <PublishSwitch
            active={faq.isPublished}
            disabled={updateFaq.isPending}
            onChange={(next) => {
              // useUpdateMembershipFaq is full PUT upsert
              updateFaq.mutate(
                {
                  id: faq.id,
                  input: {
                    question: faq.question,
                    answer: faq.answer,
                    sortOrder: faq.sortOrder,
                    isPublished: next,
                  },
                },
                {
                  onSuccess: () => showToast(next ? 'Đã xuất bản câu hỏi.' : 'Đã đưa câu hỏi về nháp.'),
                  onError: (error) => showToast(error.message, 'error'),
                }
              );
            }}
          />
          <StatusBadge active={faq.isPublished} />
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      headerClassName: '!text-right',
      cellClassName: 'text-right',
      render: (faq) => (
        <div className="flex justify-end gap-3.5">
          <button
            type="button"
            onClick={() => setDrawerFaq(faq.id)}
            className="text-[13px] font-bold text-admin-accent-strong hover:underline"
          >
            Sửa
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(faq)}
            className="text-[13px] font-bold text-admin-danger hover:underline"
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full min-w-0">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p>
          <h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">FAQ thành viên</h1>
        </div>
        <button
          type="button"
          onClick={() => setDrawerFaq(null)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-admin-ink px-[22px] text-[14px] font-bold text-admin-bg"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Thêm câu hỏi
        </button>
      </header>
      <p className="mb-6 text-[14px] text-admin-muted">
        Quản lý các câu hỏi thường gặp trên trang Chương trình thành viên công khai.
      </p>

      <AdminTableToolbar
        resultCount={filteredFaqs.length}
        activeFilterCount={Number(Boolean(search)) + Number(status !== 'all')}
        onClearFilters={() => {
          setSearch('');
          setStatus('all');
        }}
      >
        <input
          type="search"
          placeholder="Tìm câu hỏi, câu trả lời..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded-[10px] border border-admin-border-input bg-admin-surface px-4 py-2.5 text-[14px] outline-none focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15"
        />
        <select
          aria-label="Lọc trạng thái FAQ"
          value={status}
          onChange={(event) => setStatus(event.target.value as FaqStatus)}
          className="rounded-[10px] border border-admin-border-input bg-admin-surface px-4 py-2.5 text-[14px] outline-none focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đang hiển thị</option>
          <option value="draft">Đã ẩn (Nháp)</option>
        </select>
      </AdminTableToolbar>

      {faqs.isError ? (
        <p role="alert" className="py-8 text-admin-danger">{faqs.error.message}</p>
      ) : (
        <AdminTable
          mode="client"
          rows={filteredFaqs}
          columns={columns}
          rowKey={(faq) => faq.id}
          isLoading={faqs.isPending}
          emptyText="Không tìm thấy câu hỏi phù hợp."
          pageSize={10}
        />
      )}

      <AdminDrawer
        size="wide"
        open={drawerFaq !== undefined}
        title={drawerFaq === null ? 'Thêm câu hỏi' : 'Sửa câu hỏi'}
        onClose={() => setDrawerFaq(undefined)}
      >
        {drawerFaq !== undefined && (
          <FaqForm
            key={drawerFaq ?? 'new'}
            faqId={drawerFaq ?? undefined}
            onDone={() => setDrawerFaq(undefined)}
          />
        )}
      </AdminDrawer>

      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="Xóa câu hỏi FAQ?"
        message="Câu hỏi này sẽ bị xóa vĩnh viễn khỏi trang Chương trình thành viên."
        confirmLabel="Xóa câu hỏi"
        pending={deleteFaq.isPending}
        onCancel={() => setPendingDelete(undefined)}
        onConfirm={() => {
          if (pendingDelete === undefined) return;
          deleteFaq.mutate(pendingDelete.id, {
            onSuccess: () => {
              setPendingDelete(undefined);
              showToast('Đã xóa câu hỏi.');
            },
            onError: (error) => showToast(error.message, 'error'),
          });
        }}
      />
    </div>
  );
}

export default function AdminFaqPage() {
  return (
    <ToastProvider>
      <FaqContent />
    </ToastProvider>
  );
}
