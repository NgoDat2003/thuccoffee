import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import type {
  AdminStoreGalleryItem,
  CreateAdminStoreInput,
  UpdateAdminStoreInput,
} from '../../../server/src/modules/stores/stores.admin.schemas';
import ImageField from '../../components/admin/ImageField';
import FormField from '../../components/admin/ui/FormField';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { ApiError } from '../../lib/api';
import { getImageUrl } from '../../lib/image-url';
import { usePageMeta } from '../../lib/use-page-meta';
import {
  useAdminStore,
  useCreateStore,
  useReplaceStoreGallery,
  useUpdateStore,
} from '../../services/admin/stores.service';

interface StoreFormState {
  name: string;
  slug: string;
  address: string;
  phone: string;
  hours: string;
  image: string;
  region: string;
  sortOrder: string;
}

const emptyForm: StoreFormState = {
  name: '', slug: '', address: '', phone: '', hours: '', image: '', region: '', sortOrder: '0',
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

// Section gallery: state local, đổi thứ tự bằng nút lên/xuống, lưu một lần
// bằng PUT replace toàn bộ (API idempotent).
function GallerySection({ storeId, initial }: { storeId: number; initial: AdminStoreGalleryItem[] }) {
  const { showToast } = useToast();
  const replaceGallery = useReplaceStoreGallery(storeId);
  const [items, setItems] = useState<string[]>(initial.map((item) => item.storageKey));

  useEffect(() => {
    setItems(initial.map((item) => item.storageKey));
  }, [initial]);

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const swapped = next[target];
    if (next[index] === undefined || swapped === undefined) return;
    [next[index], next[target]] = [swapped, next[index]];
    setItems(next);
  }

  function addImage(objectKey: string) {
    if (items.includes(objectKey)) {
      showToast('Ảnh này đã có trong gallery.', 'error');
      return;
    }
    setItems((current) => [...current, objectKey]);
  }

  function save() {
    replaceGallery.mutate(
      { items: items.map((storageKey, sortOrder) => ({ storageKey, sortOrder })) },
      {
        onSuccess: () => showToast('Đã lưu gallery.'),
        onError: (error) => showToast(error.message, 'error'),
      },
    );
  }

  return (
    <fieldset className="md:col-span-2 rounded-xl border border-stone-200 p-4">
      <legend className="px-2 text-sm font-medium text-stone-700">Gallery ({items.length} ảnh)</legend>
      {items.length === 0 && <p className="text-sm text-stone-500">Chưa có ảnh gallery.</p>}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((storageKey, index) => (
          <li key={storageKey} className="flex items-center gap-3 rounded-lg border border-stone-200 p-2">
            <img src={getImageUrl(storageKey)} alt="" className="h-14 w-14 rounded object-cover" />
            <span className="min-w-0 flex-1 truncate text-xs text-stone-500">{storageKey}</span>
            <div className="flex flex-col gap-1">
              <button type="button" aria-label="Đưa ảnh lên" disabled={index === 0} onClick={() => move(index, -1)} className="rounded border border-stone-300 px-1.5 text-sm disabled:opacity-30">↑</button>
              <button type="button" aria-label="Đưa ảnh xuống" disabled={index === items.length - 1} onClick={() => move(index, 1)} className="rounded border border-stone-300 px-1.5 text-sm disabled:opacity-30">↓</button>
            </div>
            <button type="button" aria-label="Xóa ảnh" onClick={() => setItems(items.filter((key) => key !== storageKey))} className="rounded border border-red-200 px-2 py-1 text-sm text-red-700">Xóa</button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <ImageField kind="stores" onChange={addImage} label="Thêm ảnh gallery" />
        <button type="button" onClick={save} disabled={replaceGallery.isPending} className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-white disabled:opacity-60">
          {replaceGallery.isPending ? 'Đang lưu…' : 'Lưu gallery'}
        </button>
      </div>
    </fieldset>
  );
}

function StoreFormContent() {
  const params = useParams<{ id: string }>();
  const storeId = params.id ? Number(params.id) : undefined;
  const isEdit = storeId !== undefined;
  usePageMeta(isEdit ? 'Sửa cửa hàng' : 'Thêm cửa hàng');

  const navigate = useNavigate();
  const { showToast } = useToast();
  const store = useAdminStore(storeId);
  const createStore = useCreateStore();
  const updateStore = useUpdateStore(storeId ?? 0);
  const [form, setForm] = useState<StoreFormState>(emptyForm);

  useEffect(() => {
    if (!store.data) return;
    setForm({
      name: store.data.name,
      slug: store.data.slug,
      address: store.data.address,
      phone: store.data.phone,
      hours: store.data.hours,
      image: store.data.image,
      region: store.data.region ?? '',
      sortOrder: String(store.data.sortOrder),
    });
  }, [store.data]);

  const mutation = isEdit ? updateStore : createStore;
  const errors = fieldErrors(mutation.error);

  function updateField<K extends keyof StoreFormState>(key: K, value: StoreFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const common: UpdateAdminStoreInput = {
      name: form.name,
      address: form.address,
      phone: form.phone,
      hours: form.hours,
      image: form.image,
      region: form.region || null,
      sortOrder: Number(form.sortOrder),
    };
    const onSuccess = () => {
      showToast(isEdit ? 'Đã cập nhật cửa hàng.' : 'Đã tạo cửa hàng.');
      if (!isEdit) window.setTimeout(() => navigate('/admin/stores'), 500);
    };
    const onError = (error: Error) => showToast(error.message, 'error');

    if (isEdit) updateStore.mutate(common, { onSuccess, onError });
    else createStore.mutate({ ...common, slug: form.slug } satisfies CreateAdminStoreInput, { onSuccess, onError });
  }

  if (isEdit && store.isPending) return <p className="py-12 text-center text-stone-500">Đang tải cửa hàng…</p>;
  if (isEdit && store.isError) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{store.error.message}</p>;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm lg:p-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-stone-900">{isEdit ? 'Sửa cửa hàng' : 'Thêm cửa hàng'}</h1>
        <Link to="/admin/stores" className="text-sm font-medium text-primary">Quay lại danh sách</Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid max-w-4xl gap-6 md:grid-cols-2">
        <FormField label="Tên cửa hàng" htmlFor="store-name" error={errors.name} required>
          <input id="store-name" value={form.name} onChange={(event) => updateField('name', event.target.value)} className={inputClass} required />
        </FormField>
        <FormField label="Slug" htmlFor="store-slug" error={errors.slug} required>
          <input id="store-slug" value={form.slug} onChange={(event) => updateField('slug', event.target.value)} className={inputClass} disabled={isEdit} required />
        </FormField>
        <div className="md:col-span-2">
          <FormField label="Địa chỉ" htmlFor="store-address" error={errors.address} required>
            <input id="store-address" value={form.address} onChange={(event) => updateField('address', event.target.value)} className={inputClass} required />
          </FormField>
        </div>
        <FormField label="Điện thoại" htmlFor="store-phone" error={errors.phone} required>
          <input id="store-phone" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className={inputClass} required />
        </FormField>
        <FormField label="Giờ mở cửa" htmlFor="store-hours" error={errors.hours} required>
          <input id="store-hours" value={form.hours} onChange={(event) => updateField('hours', event.target.value)} className={inputClass} required />
        </FormField>
        <FormField label="Khu vực" htmlFor="store-region" error={errors.region}>
          <input id="store-region" value={form.region} onChange={(event) => updateField('region', event.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Thứ tự" htmlFor="store-order" error={errors.sortOrder} required>
          <input id="store-order" type="number" value={form.sortOrder} onChange={(event) => updateField('sortOrder', event.target.value)} className={inputClass} required />
        </FormField>

        <div className="md:col-span-2">
          <ImageField kind="stores" value={form.image} onChange={(value) => updateField('image', value)} label="Ảnh đại diện *" />
          {errors.image && <p role="alert" className="mt-1 text-sm text-red-700">{errors.image}</p>}
        </div>

        <div className="md:col-span-2">
          <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white disabled:opacity-60">
            {mutation.isPending ? 'Đang lưu…' : 'Lưu cửa hàng'}
          </button>
        </div>
      </form>

      {isEdit && store.data && (
        <div className="mt-8 grid max-w-4xl">
          <GallerySection storeId={store.data.id} initial={store.data.gallery} />
        </div>
      )}
    </section>
  );
}

export default function AdminStoreFormPage() {
  return <ToastProvider><StoreFormContent /></ToastProvider>;
}
