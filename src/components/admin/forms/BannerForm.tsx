import { useEffect, useState, type FormEvent } from 'react';

import type { BannerType, CreateAdminBannerInput } from '../../../../server/src/modules/banners/banners.admin.schemas';
import { ApiError } from '../../../lib/api';
import { useAdminBanners, useCreateBanner, useUpdateBanner } from '../../../services/admin/banners.service';
import ImageField from '../ImageField';
import FormField from '../ui/FormField';
import { useToast } from '../ui/Toast';

interface BannerFormProps { bannerId?: number; onDone: () => void; }
interface BannerFormState { type: BannerType; image: string; altText: string; linkUrl: string; sortOrder: string; }
const emptyForm: BannerFormState = { type: 'slider', image: '', altText: '', linkUrl: '', sortOrder: '0' };
const placementOptions: Array<{ type: BannerType; label: string; detail: string; ratio: string }> = [
  { type: 'slider', label: 'Slider trang chủ', detail: 'Mỗi banner đang bật là một slide riêng.', ratio: '21:9' },
  { type: 'promotion', label: 'Khuyến mãi', detail: 'Trang công khai hiện lấy mục đang bật đầu tiên.', ratio: '16:7' },
  { type: 'right', label: 'Cột phải', detail: 'Đã có trong dữ liệu; frontend công khai chưa render.', ratio: '4:3' },
];

function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !Array.isArray(error.details)) return {};
  const result: Record<string, string> = {};
  for (const detail of error.details) {
    if (typeof detail === 'object' && detail !== null && 'field' in detail && 'message' in detail && typeof detail.field === 'string' && typeof detail.message === 'string') result[detail.field] = detail.message;
  }
  return result;
}

export default function BannerForm({ bannerId, onDone }: BannerFormProps) {
  const isEdit = bannerId !== undefined;
  const { showToast } = useToast();
  const banners = useAdminBanners();
  const banner = banners.data?.find((item) => item.id === bannerId);
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner(bannerId ?? 0);
  const [form, setForm] = useState<BannerFormState>({ ...emptyForm });

  useEffect(() => {
    if (!isEdit) {
      setForm({ ...emptyForm });
      return;
    }
    if (!banner) return;
    setForm({
      type: banner.type,
      image: banner.image,
      altText: banner.altText,
      linkUrl: banner.linkUrl ?? '',
      sortOrder: String(banner.sortOrder),
    });
  }, [banner, isEdit]);

  const mutation = isEdit ? updateBanner : createBanner;
  const errors = fieldErrors(mutation.error);
  const updateField = <K extends keyof BannerFormState>(key: K, value: BannerFormState[K]) => setForm((current) => ({ ...current, [key]: value }));

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
      onDone();
    };
    const onError = (error: Error) => showToast(error.message, 'error');
    if (isEdit) updateBanner.mutate(input, { onSuccess, onError });
    else createBanner.mutate(input, { onSuccess, onError });
  }

  if (isEdit && banners.isPending) return <p className="py-12 text-center text-admin-muted">Đang tải banner…</p>;
  if (isEdit && !banners.isPending && !banner) return <p role="alert" className="rounded-[10px] border border-admin-danger/20 p-4 text-admin-danger">Không tìm thấy banner.</p>;

  const selectedPlacement = placementOptions.find((option) => option.type === form.type);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-28">
      <fieldset className="rounded-[14px] border border-admin-border bg-admin-surface p-5">
        <legend className="px-2 text-[11px] font-black uppercase tracking-[0.08em] text-admin-accent-strong">Vị trí hiển thị</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {placementOptions.map((option) => (
            <label key={option.type} className={`cursor-pointer rounded-[12px] border p-3 transition ${form.type === option.type ? 'border-admin-accent bg-admin-accent/5 ring-2 ring-admin-accent/10' : 'border-admin-border hover:border-admin-accent/50'}`}>
              <input
                type="radio"
                name="banner-type"
                value={option.type}
                checked={form.type === option.type}
                onChange={() => updateField('type', option.type)}
                className="sr-only"
              />
              <span className="block text-[13px] font-black text-admin-ink">{option.label}</span>
              <span className="mt-1 block text-[11.5px] leading-[1.4] text-admin-muted">{option.detail}</span>
              <span className="mt-2 inline-flex rounded-full bg-admin-border-soft px-2 py-1 text-[10px] font-bold text-admin-muted-2">Gợi ý {option.ratio}</span>
            </label>
          ))}
        </div>
        {errors.type && <p role="alert" className="mt-2 text-[13px] text-admin-danger">{errors.type}</p>}
      </fieldset>

      <section className="rounded-[14px] border border-admin-border bg-admin-surface p-5">
        <div className="mb-5">
          <h3 className="text-[16px] font-black text-admin-ink">Nội dung và media</h3>
          <p className="mt-1 text-[12.5px] text-admin-muted">Ảnh cho {selectedPlacement?.label.toLocaleLowerCase('vi')}; ưu tiên đúng tỷ lệ {selectedPlacement?.ratio} để tránh cắt nội dung.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
          <FormField label="Mô tả (alt text)" htmlFor="banner-alt" error={errors.altText} required><input id="banner-alt" value={form.altText} onChange={(event) => updateField('altText', event.target.value)} required /></FormField>
          <FormField label="Thứ tự" htmlFor="banner-order" error={errors.sortOrder} required><input id="banner-order" type="number" value={form.sortOrder} onChange={(event) => updateField('sortOrder', event.target.value)} required /></FormField>
        </div>
        <div className="mt-5">
          <FormField label="Liên kết khi bấm (tùy chọn)" htmlFor="banner-link" error={errors.linkUrl}><input id="banner-link" value={form.linkUrl} onChange={(event) => updateField('linkUrl', event.target.value)} /></FormField>
        </div>
        <div className="mt-5">
          <ImageField kind="banners" value={form.image} onChange={(value) => updateField('image', value)} label="Ảnh banner *" />
          {errors.image && <p role="alert" className="mt-1.5 text-[13px] text-admin-danger">{errors.image}</p>}
        </div>
      </section>

      <div className="sticky bottom-0 ml-auto flex max-w-[520px] items-center justify-end gap-3 rounded-full bg-admin-ink px-5 py-3.5">
        <button type="button" onClick={onDone} className="min-h-11 px-2 text-[14px] font-semibold text-admin-muted-2">Hủy</button>
        <button type="submit" disabled={mutation.isPending} className="min-h-11 rounded-full bg-admin-accent px-6 text-[14px] font-bold text-admin-sidebar disabled:opacity-60">{mutation.isPending ? 'Đang lưu…' : 'Lưu banner'}</button>
      </div>
    </form>
  );
}
