import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import type {
  BannerType,
  CreateAdminBannerInput,
} from '../../../server/src/modules/banners/banners.admin.schemas';
import ImageField from '../../components/admin/ImageField';
import FormField from '../../components/admin/ui/FormField';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { ApiError } from '../../lib/api';
import { usePageMeta } from '../../lib/use-page-meta';
import {
  useAdminBanners,
  useCreateBanner,
  useUpdateBanner,
} from '../../services/admin/banners.service';

interface BannerFormState {
  type: BannerType;
  image: string;
  altText: string;
  linkUrl: string;
  sortOrder: string;
}

const emptyForm: BannerFormState = {
  type: 'slider', image: '', altText: '', linkUrl: '', sortOrder: '0',
};
const inputClass = 'w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !Array.isArray(error.details)) return {};
  const result: Record<string, string> = {};
  for (const detail of error.details) {
    if (typeof detail === 'object' && detail !== null && 'field' in detail && 'message' in detail
      && typeof detail.field === 'string' && typeof detail.message === 'string') {
      result[detail.field] = detail.message;
    }
  }
  return result;
}

function BannerFormContent() {
  const params = useParams<{ id: string }>();
  const bannerId = params.id ? Number(params.id) : undefined;
  const isEdit = bannerId !== undefined;
  usePageMeta(isEdit ? 'Sửa banner' : 'Thêm banner');

  const navigate = useNavigate();
  const { showToast } = useToast();
  // Banner không có endpoint detail riêng — lấy record từ list (ít record).
  const banners = useAdminBanners();
  const banner = banners.data?.find((item) => item.id === bannerId);
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner(bannerId ?? 0);
  const [form, setForm] = useState<BannerFormState>(emptyForm);

  useEffect(() => {
    if (!banner) return;
    setForm({
      type: banner.type,
      image: banner.image,
      altText: banner.altText,
      linkUrl: banner.linkUrl ?? '',
      sortOrder: String(banner.sortOrder),
    });
  }, [banner]);

  const mutation = isEdit ? updateBanner : createBanner;
  const errors = fieldErrors(mutation.error);

  function updateField<K extends keyof BannerFormState>(key: K, value: BannerFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: CreateAdminBannerInput = {
      type: form.type,
      image: form.image,
      altText: form.altText,
      linkUrl: form.linkUrl || null,
      sortOrder: Number(form.sortOrder),
    };
    const onSuccess = () => {
      showToast(isEdit ? 'Đã cập nhật banner.' : 'Đã tạo banner.');
      if (!isEdit) window.setTimeout(() => navigate('/admin/banners'), 500);
    };
    const onError = (error: Error) => showToast(error.message, 'error');

    if (isEdit) updateBanner.mutate(input, { onSuccess, onError });
    else createBanner.mutate(input, { onSuccess, onError });
  }

  if (isEdit && banners.isPending) return <p className="py-12 text-center text-stone-500">Đang tải banner…</p>;
  if (isEdit && !banners.isPending && !banner) {
    return <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">Không tìm thấy banner.</p>;
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm lg:p-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-stone-900">{isEdit ? 'Sửa banner' : 'Thêm banner'}</h1>
        <Link to="/admin/banners" className="text-sm font-medium text-primary">Quay lại danh sách</Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid max-w-3xl gap-6 md:grid-cols-2">
        <FormField label="Vị trí hiển thị" htmlFor="banner-type" error={errors.type} required>
          <select
            id="banner-type"
            value={form.type}
            onChange={(event) => updateField('type', event.target.value as BannerType)}
            className={inputClass}
          >
            <option value="slider">Slider trang chủ</option>
            <option value="promotion">Khuyến mãi</option>
            <option value="right">Cột phải</option>
          </select>
        </FormField>
        <FormField label="Thứ tự" htmlFor="banner-order" error={errors.sortOrder} required>
          <input id="banner-order" type="number" value={form.sortOrder} onChange={(event) => updateField('sortOrder', event.target.value)} className={inputClass} required />
        </FormField>
        <div className="md:col-span-2">
          <FormField label="Mô tả (alt text)" htmlFor="banner-alt" error={errors.altText} required>
            <input id="banner-alt" value={form.altText} onChange={(event) => updateField('altText', event.target.value)} className={inputClass} required />
          </FormField>
        </div>
        <div className="md:col-span-2">
          <FormField label="Liên kết khi bấm (tùy chọn)" htmlFor="banner-link" error={errors.linkUrl}>
            <input id="banner-link" value={form.linkUrl} onChange={(event) => updateField('linkUrl', event.target.value)} className={inputClass} />
          </FormField>
        </div>
        <div className="md:col-span-2">
          <ImageField kind="banners" value={form.image} onChange={(value) => updateField('image', value)} label="Ảnh banner *" />
          {errors.image && <p role="alert" className="mt-1 text-sm text-red-700">{errors.image}</p>}
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white disabled:opacity-60">
            {mutation.isPending ? 'Đang lưu…' : 'Lưu banner'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function AdminBannerFormPage() {
  return <ToastProvider><BannerFormContent /></ToastProvider>;
}
