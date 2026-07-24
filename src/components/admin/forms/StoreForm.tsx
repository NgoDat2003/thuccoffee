import { useEffect, useState, type FormEvent } from 'react';

import type { CreateAdminStoreInput, UpdateAdminStoreInput } from '../../../../server/src/modules/stores/stores.admin.schemas';
import { ApiError } from '../../../lib/api';
import { useAdminStore, useCreateStore, useUpdateStore } from '../../../services/admin/stores.service';
import ImageField from '../ImageField';
import FormActionBar from '../ui/FormActionBar';
import FormField from '../ui/FormField';
import { useToast } from '../ui/Toast';
import StoreGallerySection from './StoreGallerySection';

interface StoreFormProps { storeId?: number; onDone: () => void; }
interface StoreFormState { name: string; slug: string; address: string; phone: string; hours: string; image: string; region: string; mapEmbedUrl: string; sortOrder: string; }
const emptyForm: StoreFormState = { name: '', slug: '', address: '', phone: '', hours: '', image: '', region: '', mapEmbedUrl: '', sortOrder: '0' };

function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !Array.isArray(error.details)) return {};
  const result: Record<string, string> = {};
  for (const detail of error.details) {
    if (typeof detail === 'object' && detail !== null && 'field' in detail && 'message' in detail && typeof detail.field === 'string' && typeof detail.message === 'string') result[detail.field] = detail.message;
  }
  return result;
}

export default function StoreForm({ storeId, onDone }: StoreFormProps) {
  const isEdit = storeId !== undefined;
  const { showToast } = useToast();
  const store = useAdminStore(storeId);
  const createStore = useCreateStore();
  const updateStore = useUpdateStore(storeId ?? 0);
  const [form, setForm] = useState<StoreFormState>({ ...emptyForm });

  useEffect(() => {
    if (!isEdit) { setForm({ ...emptyForm }); return; }
    if (!store.data) return;
    setForm({ name: store.data.name, slug: store.data.slug, address: store.data.address, phone: store.data.phone, hours: store.data.hours, image: store.data.image, region: store.data.region ?? '', mapEmbedUrl: store.data.mapEmbedUrl ?? '', sortOrder: String(store.data.sortOrder) });
  }, [isEdit, store.data]);

  const mutation = isEdit ? updateStore : createStore;
  const errors = fieldErrors(mutation.error);
  const updateField = <K extends keyof StoreFormState>(key: K, value: StoreFormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const common: UpdateAdminStoreInput = { name: form.name, address: form.address, phone: form.phone, hours: form.hours, image: form.image, region: form.region || null, mapEmbedUrl: form.mapEmbedUrl || null, sortOrder: Number(form.sortOrder) };
    const onSuccess = () => { showToast(isEdit ? 'Đã cập nhật cửa hàng.' : 'Đã tạo cửa hàng.'); onDone(); };
    const onError = (error: Error) => showToast(error.message, 'error');
    if (isEdit) updateStore.mutate(common, { onSuccess, onError });
    else createStore.mutate({ ...common, slug: form.slug } satisfies CreateAdminStoreInput, { onSuccess, onError });
  }

  if (isEdit && store.isPending) return <p className="py-12 text-center text-admin-muted">Đang tải cửa hàng…</p>;
  if (isEdit && store.isError) return <p role="alert" className="rounded-[10px] border border-admin-danger/20 p-4 text-admin-danger">{store.error.message}</p>;

  return (
    <div className="space-y-8">
      <form id="store-form" onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-[14px] border border-admin-border bg-admin-surface p-5">
          <div className="mb-5">
            <h3 className="text-[16px] font-black text-admin-ink">Thông tin cửa hàng</h3>
            <p className="mt-1 text-[12.5px] text-admin-muted">Thông tin liên hệ, vị trí và ảnh đại diện công khai.</p>
          </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Tên cửa hàng" htmlFor="store-name" error={errors.name} required><input id="store-name" value={form.name} onChange={(e) => updateField('name', e.target.value)} required /></FormField>
          <FormField label="Slug" htmlFor="store-slug" error={errors.slug} required><input id="store-slug" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} disabled={isEdit} required /></FormField>
          <div className="sm:col-span-2"><FormField label="Địa chỉ" htmlFor="store-address" error={errors.address} required><input id="store-address" value={form.address} onChange={(e) => updateField('address', e.target.value)} required /></FormField></div>
          <FormField label="Điện thoại" htmlFor="store-phone" error={errors.phone} required><input id="store-phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} required /></FormField>
          <FormField label="Giờ mở cửa" htmlFor="store-hours" error={errors.hours} required><input id="store-hours" value={form.hours} onChange={(e) => updateField('hours', e.target.value)} required /></FormField>
          <FormField label="Khu vực" htmlFor="store-region" error={errors.region}><input id="store-region" value={form.region} onChange={(e) => updateField('region', e.target.value)} /></FormField>
          <FormField label="Google Maps embed URL (tùy chọn)" htmlFor="store-map" error={errors.mapEmbedUrl}><input id="store-map" type="url" placeholder="https://www.google.com/maps/embed?..." value={form.mapEmbedUrl} onChange={(e) => updateField('mapEmbedUrl', e.target.value)} /></FormField>
          <FormField label="Thứ tự" htmlFor="store-order" error={errors.sortOrder} required><input id="store-order" type="number" value={form.sortOrder} onChange={(e) => updateField('sortOrder', e.target.value)} required /></FormField>
        </div>
        <div><ImageField kind="stores" value={form.image} onChange={(value) => updateField('image', value)} label="Ảnh đại diện *" />{errors.image && <p role="alert" className="mt-1.5 text-[13px] text-admin-danger">{errors.image}</p>}</div>
        </section>
      </form>
      {isEdit && store.data && <StoreGallerySection storeId={store.data.id} initial={store.data.gallery} />}
      <FormActionBar submitLabel="Lưu cửa hàng" pending={mutation.isPending} onCancel={onDone} formId="store-form" />
    </div>
  );
}
