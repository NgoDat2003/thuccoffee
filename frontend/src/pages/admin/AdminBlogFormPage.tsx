import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';

import type { CreateAdminBlogInput, UpdateAdminBlogInput } from '@server/src/modules/blog/blog.admin.schemas';
import ImageField from '../../components/admin/ImageField';
import ContentEditor from '../../components/admin/blog-editor/ContentEditor';
import { classifyBlogHtmlForVisual } from '../../components/admin/blog-editor/blog-editor-compatibility';
import ConfirmDialog from '../../components/admin/ui/ConfirmDialog';
import FormActionBar from '../../components/admin/ui/FormActionBar';
import FormField from '../../components/admin/ui/FormField';
import PublishSwitch from '../../components/admin/ui/PublishSwitch';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { ApiError } from '../../lib/api';
import { resolveBlogContentImageUrls } from '../../lib/image-url';
import { usePageMeta } from '../../lib/use-page-meta';
import {
  useAdminBlogPost,
  useCreateBlogPost,
  usePreviewBlogContent,
  usePublishBlogPost,
  useUpdateBlogPost,
} from '../../services/admin/blog.service';
import { useUploadImage } from '../../services/admin/uploads.service';

interface BlogFormState {
  title: string;
  slug: string;
  cover: string;
  summary: string;
  content: string;
  publishedAt: string;
  priority: string;
}

const emptyForm: BlogFormState = { title: '', slug: '', cover: '', summary: '', content: '', publishedAt: '', priority: '0' };

function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !Array.isArray(error.details)) return {};
  const result: Record<string, string> = {};
  for (const detail of error.details) {
    if (
      typeof detail === 'object'
      && detail !== null
      && 'field' in detail
      && 'message' in detail
      && typeof detail.field === 'string'
      && typeof detail.message === 'string'
    ) {
      result[detail.field] = detail.message;
    }
  }
  return result;
}

function hasMetadataChanges(current: BlogFormState, original: BlogFormState): boolean {
  return current.title !== original.title
    || current.slug !== original.slug
    || current.cover !== original.cover
    || current.summary !== original.summary
    || current.publishedAt !== original.publishedAt
    || current.priority !== original.priority;
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
  const publishPost = usePublishBlogPost();
  const previewContent = usePreviewBlogContent();
  const uploadImage = useUploadImage();
  const [form, setForm] = useState<BlogFormState>({ ...emptyForm });
  const [original, setOriginal] = useState<BlogFormState>({ ...emptyForm });
  const [contentEdited, setContentEdited] = useState(false);
  const [preview, setPreview] = useState(false);
  const originalRawHtml = useRef('');
  const allowNavigation = useRef(false);
  const hydratedPostId = useRef<number | undefined>(undefined);
  const isDirty = contentEdited || hasMetadataChanges(form, original);
  const blocker = useBlocker(isDirty && !allowNavigation.current);
  const compatibility = classifyBlogHtmlForVisual(form.content);

  useEffect(() => {
    if (!post.data || hydratedPostId.current === post.data.id) return;
    hydratedPostId.current = post.data.id;
    const loaded = {
      title: post.data.title,
      slug: post.data.slug,
      cover: post.data.cover,
      summary: post.data.summary,
      content: post.data.content,
      publishedAt: post.data.publishedAt.slice(0, 10),
      priority: String(post.data.priority),
    };
    originalRawHtml.current = post.data.content;
    setContentEdited(false);
    setForm(loaded);
    setOriginal(loaded);
  }, [post.data]);

  const mutation = isEdit ? updatePost : createPost;
  const errors = fieldErrors(mutation.error);
  const updateField = <K extends keyof BlogFormState>(key: K, value: BlogFormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  function updateContent(value: string) {
    setContentEdited(true);
    updateField('content', value);
  }

  async function uploadInlineImage(file: File): Promise<string> {
    try {
      const { objectKey } = await uploadImage.mutateAsync({ file, kind: 'blog' });
      return objectKey;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể tải ảnh.', 'error');
      throw error;
    }
  }

  function togglePreview() {
    if (preview) {
      setPreview(false);
      return;
    }
    setPreview(true);
    previewContent.mutate(contentEdited ? form.content : originalRawHtml.current || form.content);
  }

  function hydrateSavedPost(saved: Awaited<ReturnType<typeof createPost.mutateAsync>>) {
    const savedForm: BlogFormState = {
      title: saved.title,
      slug: saved.slug,
      cover: saved.cover,
      summary: saved.summary,
      content: saved.content,
      publishedAt: saved.publishedAt.slice(0, 10),
      priority: String(saved.priority),
    };
    originalRawHtml.current = saved.content;
    setForm(savedForm);
    setOriginal(savedForm);
    setContentEdited(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const common: UpdateAdminBlogInput = {
      title: form.title,
      cover: form.cover,
      summary: form.summary,
      content: contentEdited ? form.content : originalRawHtml.current,
      publishedAt: form.publishedAt,
      priority: Number(form.priority),
    };
    const onSuccess = (saved: Awaited<ReturnType<typeof createPost.mutateAsync>>) => {
      hydrateSavedPost(saved);
      showToast(isEdit ? 'Đã cập nhật bài viết.' : 'Đã tạo bài viết.');
      if (!isEdit) {
        allowNavigation.current = true;
        window.setTimeout(() => navigate('/admin/blog'), 500);
      }
    };
    const onError = (error: Error) => showToast(error.message, 'error');
    if (isEdit) updatePost.mutate({ input: common, preserveContent: !contentEdited }, { onSuccess, onError });
    else createPost.mutate({ ...common, slug: form.slug } satisfies CreateAdminBlogInput, { onSuccess, onError });
  }

  function changePublished(next: boolean) {
    if (postId === undefined) return;
    publishPost.mutate(
      { id: postId, input: { isPublished: next } },
      {
        onSuccess: () => showToast(next ? 'Đã hiển thị bài viết.' : 'Đã ẩn bài viết.'),
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  }

  if (isEdit && post.isPending) return <p className="py-12 text-center text-admin-muted">Đang tải bài viết…</p>;
  if (isEdit && post.isError) return <p role="alert" className="rounded-[10px] border border-admin-danger/20 p-4 text-admin-danger">{post.error.message}</p>;

  return (
    <section className="w-full max-w-[1180px]">
      <Link to="/admin/blog" className="mb-7 inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-admin-muted">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="11 6 5 12 11 18" /></svg>
        Danh sách bài viết
      </Link>
      <h1 className="mb-8 text-[34px] font-black tracking-[-0.02em]">{isEdit ? 'Sửa bài viết' : 'Thêm bài viết'}</h1>

      <form onSubmit={handleSubmit} className="pb-28">
        <div className="grid items-start gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
          <div className="space-y-5">
            <FormField label="Tiêu đề" htmlFor="blog-title" error={errors.title} required><input id="blog-title" value={form.title} onChange={(event) => updateField('title', event.target.value)} required /></FormField>
            <FormField label="Slug" htmlFor="blog-slug" error={errors.slug} required><input id="blog-slug" value={form.slug} onChange={(event) => updateField('slug', event.target.value)} disabled={isEdit} required /></FormField>
            <FormField label="Tóm tắt" htmlFor="blog-summary" error={errors.summary} required variant="box"><textarea id="blog-summary" rows={2} value={form.summary} onChange={(event) => updateField('summary', event.target.value)} required /></FormField>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="text-[13px] font-semibold text-admin-field">Nội dung bài viết</span>
                <button type="button" onClick={togglePreview} className="min-h-9 text-[12.5px] font-semibold text-admin-accent-strong">{preview ? 'Quay lại soạn thảo' : 'Preview an toàn'}</button>
              </div>
              {preview ? (
                <div className="min-h-64 rounded-[10px] border border-admin-border-input bg-admin-surface p-4">
                  {previewContent.isPending && <p className="text-admin-muted">Đang tạo preview an toàn…</p>}
                  {previewContent.isError && <p role="alert" className="text-admin-danger">{previewContent.error.message}</p>}
                  {previewContent.data && <div className="[&_a]:text-admin-accent-strong [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_p]:my-3" dangerouslySetInnerHTML={{ __html: resolveBlogContentImageUrls(previewContent.data.html) }} />}
                </div>
              ) : (
                <ContentEditor
                  value={form.content}
                  onChange={updateContent}
                  onUploadImage={uploadInlineImage}
                  compatibility={compatibility.mode}
                  reasons={compatibility.mode === 'source-only' ? compatibility.reasons : []}
                  assetUrlScheme="blog-asset"
                />
              )}
              {errors.content && <p role="alert" className="mt-1.5 text-[13px] text-admin-danger">{errors.content}</p>}
            </div>
          </div>

          <aside className="space-y-7">
            <div><ImageField kind="blog" value={form.cover} onChange={(value) => updateField('cover', value)} label="Ảnh bìa" />{errors.cover && <p role="alert" className="mt-1.5 text-[13px] text-admin-danger">{errors.cover}</p>}</div>
            <div className="border-t border-admin-border pt-6">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-admin-muted-2">Xuất bản</p>
              {isEdit && post.data && <div className="flex items-center justify-between gap-4"><span className="text-[13.5px] font-semibold text-admin-ink-soft">Hiển thị công khai</span><div className="flex items-center gap-2.5"><StatusBadge active={post.data.isPublished} /><PublishSwitch active={post.data.isPublished} disabled={publishPost.isPending} onChange={changePublished} /></div></div>}
              <div className="mt-4">
                <label htmlFor="blog-date" className="mb-1.5 block text-[13px] font-semibold text-admin-field">Ngày đăng *</label>
                <input id="blog-date" type="date" value={form.publishedAt} onChange={(event) => updateField('publishedAt', event.target.value)} required className="w-full rounded-full border border-admin-border-input bg-admin-surface px-3.5 py-2 text-[14px] outline-none focus:border-admin-accent-strong" />
                {errors.publishedAt && <p role="alert" className="mt-1.5 text-[13px] text-admin-danger">{errors.publishedAt}</p>}
                <label htmlFor="blog-priority" className="mb-1.5 mt-3 block text-[13px] font-semibold text-admin-field">Ưu tiên (nhỏ đứng trước)</label>
                <input id="blog-priority" type="number" value={form.priority} onChange={(event) => updateField('priority', event.target.value)} className="w-full rounded-full border border-admin-border-input bg-admin-surface px-3.5 py-2 text-[14px] outline-none focus:border-admin-accent-strong" />
                {errors.priority && <p role="alert" className="mt-1.5 text-[13px] text-admin-danger">{errors.priority}</p>}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-9">
          <FormActionBar submitLabel="Lưu bài viết" pending={mutation.isPending} cancelTo="/admin/blog" />
        </div>
      </form>
      <ConfirmDialog open={blocker.state === 'blocked'} title="Rời trang khi chưa lưu?" message="Các thay đổi chưa lưu sẽ bị mất." confirmLabel="Rời trang" onCancel={() => blocker.reset?.()} onConfirm={() => blocker.proceed?.()} />
    </section>
  );
}

export default function AdminBlogFormPage() {
  return <ToastProvider><BlogFormContent /></ToastProvider>;
}
