import { useEffect, useState, type FormEvent } from 'react';

import FormActionBar from '../../components/admin/ui/FormActionBar';
import FormField from '../../components/admin/ui/FormField';
import { useToast } from '../../components/admin/ui/Toast';
import {
  useAdminMembershipFaqs,
  useCreateMembershipFaq,
  useUpdateMembershipFaq,
} from '../../services/admin/static-pages.service';

interface FaqFormProps {
  faqId?: number;
  onDone: () => void;
}

export function FaqForm({ faqId, onDone }: FaqFormProps) {
  const isEdit = faqId !== undefined;
  const { showToast } = useToast();
  const faqs = useAdminMembershipFaqs();
  const createFaq = useCreateMembershipFaq();
  const updateFaq = useUpdateMembershipFaq();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isPublished, setIsPublished] = useState(true);

  const mutation = isEdit ? updateFaq : createFaq;

  useEffect(() => {
    if (!isEdit || !faqs.data) return;
    const faq = faqs.data.find((f) => f.id === faqId);
    if (!faq) return;
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setSortOrder(String(faq.sortOrder));
    setIsPublished(faq.isPublished);
  }, [isEdit, faqId, faqs.data]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    const nextOrder = isEdit
      ? Number(sortOrder)
      : Math.max(0, ...(faqs.data ?? []).map((faq) => faq.sortOrder + 1));

    const payload = {
      question: question.trim(),
      answer: answer.trim(),
      sortOrder: nextOrder,
      isPublished,
    };

    const onSuccess = () => {
      showToast(isEdit ? 'Đã cập nhật câu hỏi.' : 'Đã thêm câu hỏi.');
      onDone();
    };
    const onError = (error: Error) => showToast(error.message, 'error');

    if (isEdit) {
      updateFaq.mutate({ id: faqId, input: payload }, { onSuccess, onError });
    } else {
      createFaq.mutate(payload, { onSuccess, onError });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField label="Câu hỏi" htmlFor="faq-question" required>
        <input id="faq-question" value={question} onChange={(e) => setQuestion(e.target.value)} required />
      </FormField>
      <FormField label="Câu trả lời" htmlFor="faq-answer" required variant="box">
        <textarea
          id="faq-answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={5}
          required
          className="w-full rounded-[10px] border border-admin-border-input bg-admin-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-admin-accent"
        />
      </FormField>
      {isEdit && (
        <FormField label="Thứ tự" htmlFor="faq-sort-order" required>
          <input id="faq-sort-order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} required />
        </FormField>
      )}
      <label className="flex items-center gap-2.5 text-[13.5px] font-semibold text-admin-field">
        <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
        Hiển thị công khai
      </label>
      <FormActionBar submitLabel={isEdit ? 'Lưu thay đổi' : 'Thêm câu hỏi'} pending={mutation.isPending} onCancel={onDone} />
    </form>
  );
}
