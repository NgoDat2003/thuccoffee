import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';

import type { CreateAdminBlogInput, UpdateAdminBlogInput } from '../../../server/src/modules/blog/blog.admin.schemas';
import ImageField from '../../components/admin/ImageField';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import FormField from '../../components/admin/ui/FormField';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { ApiError } from '../../lib/api';
import { resolveBlogContentImageUrls } from '../../lib/image-url';
import { usePageMeta } from '../../lib/use-page-meta';
import { useAdminBlogPost, useCreateBlogPost, usePreviewBlogContent, useUpdateBlogPost } from '../../services/admin/blog.service';

interface BlogFormState {
  title: string;
  slug: string;
  cover: string;
  summary: string;
  content: string;
  publishedAt: string;
}

const emptyForm: BlogFormState = { title: '', slug: '', cover: '', summary: '', content: '', publishedAt: '' };
const inputClass = 'w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !Array.isArray(error.details)) return {};
  const result: Record<string, string> = {};
  for (const detail of error.details) {
    if (typeof detail === 'object' && detail !== null && 'field' in detail && 'message' in detail && typeof detail.field === 'string' && typeof detail.message === 'string') {
      result[detail.field] = detail.message;
    }
  }
  return result;
}

function BlogFormContent() {
  const params = useParams<{ id: string }>();
  const postId = params.id ? Number(params.id) : undefined;
  const isEdit = postId !== undefined;
  usePageMeta(isEdit ? 'Sửa bài viết' : 'Thêm bài viết');

  const navigate = useNavigate();
  const { showToast } = useToast();
  const post = useAdminBlogPost(postId);
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost(postId ?? 0);
  const previewContent = usePreviewBlogContent();
  const [form, setForm] = useState<BlogFormState>(emptyForm);
  const [original, setOriginal] = useState<BlogFormState>(emptyForm);
  const [preview, setPreview] = useState(false);
  const allowNavigation = useRef(false);
  const isDirty = JSON.stringify(form) !== JSON.stringify(original);
  const blocker = useBlocker(isDirty && !allowNavigation.current);

  useEffect(() => {
    if (!post.data) return;
    const loaded = {
      title: post.data.title,
      slug: post.data.slug,
      cover: post.data.cover,
      summary: post.data.summary,
      content: post.data.content,
      publishedAt: post.data.publishedAt.slice(0, 10),
    };
    setForm(loaded);
    setOriginal(loaded);
  }, [post.data]);

  const mutation = isEdit ? updatePost : createPost;
  const errors = fieldErrors(mutation.error);

  function updateField<K extends keyof BlogFormState>(key: K, value: BlogFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function togglePreview() {
    if (preview) {
      setPreview(false);
      return;
    }
    setPreview(true);
    previewContent.mutate(form.content);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const common: UpdateAdminBlogInput = {
      title: form.title,
      cover: form.cover,
      summary: form.summary,
      content: form.content,
      publishedAt: form.publishedAt,
    };
    const onSuccess = () => {
      setOriginal(form);
      showToast(isEdit ? 'Đã cập nhật bài viết.' : 'Đã tạo bài viết.');
      if (!isEdit) {
        allowNavigation.current = true;
        window.setTimeout(() => navigate('/admin/blog'), 500);
      }
    };
    const onError = (error: Error) => showToast(error.message, 'error');

    if (isEdit) updatePost.mutate(common, { onSuccess, onError });
    else createPost.mutate({ ...common, slug: form.slug } satisfies CreateAdminBlogInput, { onSuccess, onError });
  }

  if (isEdit && post.isPending) return <p className="py-12 text-center text-stone-500">Đang tải bài viết…</p>;
  if (isEdit && post.isError) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{post.error.message}</p>;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm lg:p-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-stone-900">{isEdit ? 'Sửa bài viết' : 'Thêm bài viết'}</h1>
        <Link to="/admin/blog" className="text-sm font-medium text-primary">Quay lại danh sách</Link>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 grid max-w-5xl gap-6 md:grid-cols-2">
        <FormField label="Tiêu đề" htmlFor="blog-title" error={errors.title} required>
          <input id="blog-title" value={form.title} onChange={(event) => updateField('title', event.target.value)} className={inputClass} required />
        </FormField>
        <FormField label="Slug" htmlFor="blog-slug" error={errors.slug} required>
          <input id="blog-slug" value={form.slug} onChange={(event) => updateField('slug', event.target.value)} className={inputClass} disabled={isEdit} required />
        </FormField>
        <FormField label="Ngày đăng" htmlFor="blog-date" error={errors.publishedAt} required>
          <input id="blog-date" type="date" value={form.publishedAt} onChange={(event) => updateField('publishedAt', event.target.value)} className={inputClass} required />
        </FormField>
        <div className="md:col-span-2">
          <ImageField kind="blog" value={form.cover} onChange={(value) => updateField('cover', value)} label="Ảnh cover *" />
          {errors.cover && <p role="alert" className="mt-1 text-sm text-red-700">{errors.cover}</p>}
        </div>
        <div className="md:col-span-2">
          <FormField label="Tóm tắt" htmlFor="blog-summary" error={errors.summary} required>
            <textarea id="blog-summary" rows={3} value={form.summary} onChange={(event) => updateField('summary', event.target.value)} className={inputClass} required />
          </FormField>
        </div>
        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="blog-content" className="text-sm font-medium text-stone-700">Nội dung HTML</label>
            <button type="button" onClick={togglePreview} className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium">{preview ? 'Sửa HTML' : 'Preview an toàn'}</button>
          </div>
          {preview ? (
            <div className="min-h-64 rounded-lg border border-stone-300 p-4">
              {previewContent.isPending && <p className="text-stone-500">Đang tạo preview an toàn…</p>}
              {previewContent.isError && <p role="alert" className="text-red-700">{previewContent.error.message}</p>}
              {previewContent.data && (
                <div className="[&_a]:text-primary [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_p]:my-3" dangerouslySetInnerHTML={{ __html: resolveBlogContentImageUrls(previewContent.data.html) }} />
              )}
            </div>
          ) : (
            <textarea id="blog-content" rows={18} value={form.content} onChange={(event) => updateField('content', event.target.value)} className={inputClass + ' font-mono text-sm'} />
          )}
          {errors.content && <p role="alert" className="mt-1 text-sm text-red-700">{errors.content}</p>}
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white disabled:opacity-60">{mutation.isPending ? 'Đang lưu…' : 'Lưu bài viết'}</button>
        </div>
      </form>
      <ConfirmDialog open={blocker.state === 'blocked'} title="Rời trang khi chưa lưu?" message="Các thay đổi chưa lưu sẽ bị mất." confirmLabel="Rời trang" onCancel={() => blocker.reset?.()} onConfirm={() => blocker.proceed?.()} />
    </section>
  );
}

export default function AdminBlogFormPage() {
  return <ToastProvider><BlogFormContent /></ToastProvider>;
}