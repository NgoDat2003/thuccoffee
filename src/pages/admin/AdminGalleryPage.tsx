import { useState, type FormEvent } from 'react';

import ImageField from '../../components/admin/ImageField';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { getImageUrl } from '../../lib/image-url';
import { usePageMeta } from '../../lib/use-page-meta';
import {
  useAdminGallery,
  useAdminMembershipFaqs,
  useCreateGalleryItem,
  useCreateMembershipFaq,
  useDeleteGalleryItem,
  useDeleteMembershipFaq,
} from '../../services/admin/static-pages.service';

const inputClass = 'w-full rounded-[10px] border border-admin-border-input bg-admin-surface px-3.5 py-2.5 text-[15px] text-admin-ink outline-none focus:border-admin-accent focus:ring-[3px] focus:ring-admin-accent/15';

function GallerySection() {
  const gallery = useAdminGallery();
  const createItem = useCreateGalleryItem();
  const deleteItem = useDeleteGalleryItem();
  const { showToast } = useToast();
  const [newKey, setNewKey] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number>();

  function handleAdd() {
    if (!newKey) return;
    const nextOrder = Math.max(0, ...(gallery.data ?? []).map((item) => item.sortOrder + 1));
    createItem.mutate(
      { storageKey: newKey, altText: '', sortOrder: nextOrder, isActive: true },
      {
        onSuccess: () => {
          setNewKey('');
          showToast('Đã thêm ảnh vào gallery.');
        },
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  }

  return (
    <section className="mb-12">
      <h2 className="mb-2 text-[22px] font-black tracking-[-0.01em]">Gallery trang chủ</h2>
      <p className="mb-5 max-w-2xl text-[14px] text-admin-muted">
        Ảnh khối “Bộ sưu tập của Thức” trên trang chủ, hiển thị theo thứ tự.
      </p>

      <div className="mb-6 grid gap-4 sm:grid-cols-[280px_auto] sm:items-end">
        <ImageField kind="site" value={newKey} onChange={setNewKey} label="Ảnh mới cho gallery" />
        <button
          type="button"
          disabled={!newKey || createItem.isPending}
          onClick={handleAdd}
          className="h-11 rounded-full bg-admin-ink px-5 text-[14px] font-bold text-white disabled:opacity-50"
        >
          {createItem.isPending ? 'Đang thêm…' : 'Thêm vào gallery'}
        </button>
      </div>

      {gallery.isError ? (
        <p role="alert" className="text-admin-danger">{gallery.error.message}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(gallery.data ?? []).map((item) => (
            <figure key={item.id} className="relative">
              <img src={getImageUrl(item.storageKey)} alt={item.altText} className="aspect-square w-full rounded-[10px] border border-admin-border object-cover" />
              <button
                type="button"
                onClick={() => setPendingDeleteId(item.id)}
                className="absolute right-2 top-2 rounded-full bg-admin-danger px-2.5 py-1 text-[12px] font-bold text-white"
              >
                Xóa
              </button>
            </figure>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== undefined}
        title="Xóa ảnh gallery?"
        message="Ảnh sẽ biến mất khỏi khối bộ sưu tập trên trang chủ."
        confirmLabel="Xóa ảnh"
        pending={deleteItem.isPending}
        onCancel={() => setPendingDeleteId(undefined)}
        onConfirm={() => {
          if (pendingDeleteId === undefined) return;
          deleteItem.mutate(pendingDeleteId, {
            onSuccess: () => {
              setPendingDeleteId(undefined);
              showToast('Đã xóa ảnh gallery.');
            },
            onError: (error) => showToast(error.message, 'error'),
          });
        }}
      />
    </section>
  );
}

function FaqSection() {
  const faqs = useAdminMembershipFaqs();
  const createFaq = useCreateMembershipFaq();
  const deleteFaq = useDeleteMembershipFaq();
  const { showToast } = useToast();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number>();

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    const nextOrder = Math.max(0, ...(faqs.data ?? []).map((faq) => faq.sortOrder + 1));
    createFaq.mutate(
      { question: question.trim(), answer: answer.trim(), sortOrder: nextOrder, isPublished: true },
      {
        onSuccess: () => {
          setQuestion('');
          setAnswer('');
          showToast('Đã thêm câu hỏi.');
        },
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  }

  return (
    <section>
      <h2 className="mb-2 text-[22px] font-black tracking-[-0.01em]">FAQ thành viên</h2>
      <p className="mb-5 max-w-2xl text-[14px] text-admin-muted">
        Câu hỏi thường gặp trên trang Chương trình thành viên.
      </p>

      <form onSubmit={handleCreate} className="mb-6 max-w-3xl space-y-3">
        <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Câu hỏi mới" className={inputClass} />
        <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Câu trả lời" rows={3} className={inputClass} />
        <button type="submit" disabled={createFaq.isPending || !question.trim() || !answer.trim()} className="rounded-full bg-admin-ink px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-50">
          {createFaq.isPending ? 'Đang thêm…' : 'Thêm câu hỏi'}
        </button>
      </form>

      {faqs.isError ? (
        <p role="alert" className="text-admin-danger">{faqs.error.message}</p>
      ) : (
        <ul className="max-w-3xl divide-y divide-admin-border">
          {(faqs.data ?? []).map((faq) => (
            <li key={faq.id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-[14.5px] font-semibold text-admin-ink">{faq.question}</p>
                <p className="mt-1 line-clamp-2 text-[13.5px] text-admin-muted">{faq.answer}</p>
              </div>
              <button type="button" onClick={() => setPendingDeleteId(faq.id)} className="shrink-0 text-[13px] font-semibold text-admin-danger">
                Xóa
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== undefined}
        title="Xóa câu hỏi?"
        message="Câu hỏi sẽ biến mất khỏi trang Chương trình thành viên."
        confirmLabel="Xóa câu hỏi"
        pending={deleteFaq.isPending}
        onCancel={() => setPendingDeleteId(undefined)}
        onConfirm={() => {
          if (pendingDeleteId === undefined) return;
          deleteFaq.mutate(pendingDeleteId, {
            onSuccess: () => {
              setPendingDeleteId(undefined);
              showToast('Đã xóa câu hỏi.');
            },
            onError: (error) => showToast(error.message, 'error'),
          });
        }}
      />
    </section>
  );
}

function GalleryFaqContent() {
  usePageMeta('Gallery & FAQ');
  return (
    <div className="w-full min-w-0">
      <header className="mb-2">
        <p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p>
        <h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Gallery &amp; FAQ</h1>
      </header>
      <p className="mb-8 max-w-2xl text-[14px] text-admin-muted">
        Bộ sưu tập ảnh trang chủ và câu hỏi thường gặp của chương trình thành viên.
      </p>
      <GallerySection />
      <FaqSection />
    </div>
  );
}

export default function AdminGalleryPage() {
  return <ToastProvider><GalleryFaqContent /></ToastProvider>;
}
