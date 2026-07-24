import { useEffect, useMemo, useState, type FormEvent } from 'react';

import type { StaticPageKey } from '@server/src/modules/static-pages/static-pages.schemas';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { usePageMeta } from '../../lib/use-page-meta';
import {
  useAdminStaticPages,
  useUpdateStaticPage,
} from '../../services/admin/static-pages.service';

const pageLabels: Record<string, string> = {
  about: 'Giới thiệu',
  membership: 'Chương trình thành viên',
  careers: 'Tuyển dụng',
  delivery: 'Thức Delivery',
  'cookie-policy': 'Chính sách Cookie',
  contact: 'Liên hệ',
};

const inputClass = 'w-full rounded-[10px] border border-admin-border-input bg-admin-surface px-3.5 py-2.5 text-[15px] text-admin-ink outline-none focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15';

// Nội dung page là JSON structured (giữ layout trang public); admin sửa trực
// tiếp JSON với validate trước khi lưu.
function PagesContent() {
  usePageMeta('Quản lý trang nội dung');
  const pages = useAdminStaticPages();
  const { showToast } = useToast();
  const [selectedKey, setSelectedKey] = useState<StaticPageKey>('about');
  const updatePage = useUpdateStaticPage(selectedKey);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [jsonError, setJsonError] = useState('');

  const selected = useMemo(
    () => (pages.data ?? []).find((page) => page.key === selectedKey),
    [pages.data, selectedKey],
  );

  useEffect(() => {
    if (!selected) return;
    setTitle(selected.title);
    try {
      setContent(JSON.stringify(JSON.parse(selected.content), null, 2));
    } catch {
      setContent(selected.content);
    }
    setJsonError('');
  }, [selected]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      JSON.parse(content);
    } catch {
      setJsonError('Content không phải JSON hợp lệ. Kiểm tra dấu ngoặc/dấu phẩy.');
      return;
    }
    setJsonError('');
    updatePage.mutate(
      { title, content: JSON.stringify(JSON.parse(content)) },
      {
        onSuccess: () => showToast('Đã lưu trang. Nội dung public cập nhật ngay.'),
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  }

  return (
    <section className="w-full min-w-0">
      <header className="mb-2">
        <p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p>
        <h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Trang nội dung</h1>
      </header>
      <p className="mb-7 max-w-2xl text-[14px] text-admin-muted">
        Nội dung 6 trang tĩnh (giới thiệu, thành viên, tuyển dụng, delivery,
        chính sách, liên hệ). Nội dung lưu dạng JSON theo cấu trúc từng trang —
        sửa giá trị text, giữ nguyên tên field. FAQ thành viên quản lý ở mục riêng
        trong trang Gallery &amp; FAQ.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {(pages.data ?? []).map((page) => (
          <button
            key={page.key}
            type="button"
            onClick={() => setSelectedKey(page.key as StaticPageKey)}
            className={
              'rounded-full border px-4 py-2 text-[13.5px] font-semibold ' +
              (page.key === selectedKey
                ? 'border-admin-accent bg-admin-accent text-white'
                : 'border-admin-border text-admin-ink-soft hover:border-admin-accent')
            }
          >
            {pageLabels[page.key] ?? page.key}
          </button>
        ))}
      </div>

      {pages.isPending ? (
        <p className="text-admin-muted">Đang tải trang…</p>
      ) : pages.isError ? (
        <p role="alert" className="text-admin-danger">{pages.error.message}</p>
      ) : selected ? (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-admin-field">Tiêu đề</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} required />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-admin-field">Nội dung (JSON)</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={24}
              spellCheck={false}
              className={inputClass + ' font-mono text-[13px] leading-relaxed'}
            />
          </label>
          {jsonError && <p role="alert" className="text-[13.5px] text-admin-danger">{jsonError}</p>}
          <button type="submit" disabled={updatePage.isPending} className="rounded-full bg-admin-ink px-6 py-3 text-[14px] font-bold text-white disabled:opacity-50">
            {updatePage.isPending ? 'Đang lưu…' : 'Lưu trang'}
          </button>
        </form>
      ) : null}
    </section>
  );
}

export default function AdminPagesPage() {
  return <ToastProvider><PagesContent /></ToastProvider>;
}
