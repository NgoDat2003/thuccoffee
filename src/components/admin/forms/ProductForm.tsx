import { useEffect, useState, type FormEvent } from 'react';

import type {
  CreateAdminProductInput,
  UpdateAdminProductInput,
} from '../../../../server/src/modules/products/products.admin.schemas';
import { ApiError } from '../../../lib/api';
import { useAdminCategories } from '../../../services/admin/categories.service';
import {
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
} from '../../../services/admin/products.service';
import ImageField from '../ImageField';
import FormField from '../ui/FormField';
import { useToast } from '../ui/Toast';

interface ProductFormProps {
  productId?: number;
  onDone: () => void;
}

interface ProductFormState {
  name: string;
  slug: string;
  price: string;
  priceEstimated: boolean;
  thumb: string;
  image: string;
  description: string;
  sortOrder: string;
  categoryIds: number[];
}

const emptyForm: ProductFormState = {
  name: '', slug: '', price: '0', priceEstimated: false, thumb: '', image: '',
  description: '', sortOrder: '0', categoryIds: [],
};

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

export default function ProductForm({ productId, onDone }: ProductFormProps) {
  const isEdit = productId !== undefined;
  const { showToast } = useToast();
  const product = useAdminProduct(productId);
  const categories = useAdminCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(productId ?? 0);
  const [form, setForm] = useState<ProductFormState>({ ...emptyForm });

  useEffect(() => {
    if (!isEdit) {
      setForm({ ...emptyForm });
      return;
    }
    if (!product.data) return;
    setForm({
      name: product.data.name,
      slug: product.data.slug,
      price: String(product.data.price ?? 0),
      priceEstimated: product.data.priceEstimated,
      thumb: product.data.thumb,
      image: product.data.image ?? '',
      description: product.data.description ?? '',
      sortOrder: String(product.data.sortOrder),
      categoryIds: product.data.categories.map((category) => category.id),
    });
  }, [isEdit, product.data]);

  const mutation = isEdit ? updateProduct : createProduct;
  const errors = fieldErrors(mutation.error);
  const updateField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  const toggleCategory = (id: number) => setForm((current) => ({
    ...current,
    categoryIds: current.categoryIds.includes(id)
      ? current.categoryIds.filter((value) => value !== id)
      : [...current.categoryIds, id],
  }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const common: UpdateAdminProductInput = {
      name: form.name,
      price: Number(form.price),
      priceEstimated: form.priceEstimated,
      thumb: form.thumb,
      image: form.image || null,
      description: form.description || null,
      sortOrder: Number(form.sortOrder),
      categoryIds: form.categoryIds,
    };
    const onSuccess = () => {
      showToast(isEdit ? 'Đã cập nhật sản phẩm.' : 'Đã tạo sản phẩm.');
      onDone();
    };
    const onError = (error: Error) => showToast(error.message, 'error');
    if (isEdit) updateProduct.mutate(common, { onSuccess, onError });
    else createProduct.mutate({ ...common, slug: form.slug } as CreateAdminProductInput, { onSuccess, onError });
  }

  if (isEdit && product.isPending) return <p className="py-12 text-center text-admin-muted">Đang tải sản phẩm…</p>;
  if (isEdit && product.isError) return <p role="alert" className="rounded-[10px] border border-admin-danger/20 p-4 text-admin-danger">{product.error.message}</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-7 pb-28">
      <div>
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-admin-muted-2">Thông tin cơ bản</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Tên sản phẩm" htmlFor="product-name" error={errors.name} required><input id="product-name" value={form.name} onChange={(event) => updateField('name', event.target.value)} required /></FormField>
          <FormField label="Slug" htmlFor="product-slug" error={errors.slug} required><input id="product-slug" value={form.slug} onChange={(event) => updateField('slug', event.target.value)} disabled={isEdit} required /></FormField>
          <FormField label="Giá (đ)" htmlFor="product-price" error={errors.price} required><input id="product-price" type="number" min="0" value={form.price} onChange={(event) => updateField('price', event.target.value)} required /></FormField>
          <FormField label="Thứ tự" htmlFor="product-order" error={errors.sortOrder} required><input id="product-order" type="number" value={form.sortOrder} onChange={(event) => updateField('sortOrder', event.target.value)} required /></FormField>
        </div>
        <label className="mt-5 flex items-center gap-2.5 text-[13.5px] font-semibold text-admin-field"><input type="checkbox" checked={form.priceEstimated} onChange={(event) => updateField('priceEstimated', event.target.checked)} />Giá ước tính</label>
      </div>

      <FormField label="Mô tả" htmlFor="product-description" error={errors.description} variant="box"><textarea id="product-description" rows={4} value={form.description} onChange={(event) => updateField('description', event.target.value)} /></FormField>

      <fieldset>
        <legend className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-admin-muted-2">Danh mục</legend>
        {categories.isPending ? <p className="text-[13px] text-admin-muted">Đang tải danh mục…</p> : (
          <div className="flex flex-wrap gap-2">
            {(categories.data ?? []).map((category) => (
              <label key={category.id} className="flex items-center gap-2.5 rounded-full border border-admin-border px-3.5 py-2 text-[13.5px] text-admin-ink-soft">
                <input type="checkbox" checked={form.categoryIds.includes(category.id)} onChange={() => toggleCategory(category.id)} />{category.label}
              </label>
            ))}
          </div>
        )}
        {errors.categoryIds && <p role="alert" className="mt-1.5 text-[13px] text-admin-danger">{errors.categoryIds}</p>}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div><ImageField kind="products" value={form.thumb} onChange={(value) => updateField('thumb', value)} label="Ảnh thumbnail *" />{errors.thumb && <p role="alert" className="mt-1.5 text-[13px] text-admin-danger">{errors.thumb}</p>}</div>
        <ImageField kind="products" value={form.image} onChange={(value) => updateField('image', value)} label="Ảnh chi tiết" />
      </div>

      <div className="sticky bottom-0 ml-auto flex max-w-[520px] items-center justify-end gap-3 rounded-full bg-admin-ink px-5 py-3.5">
        <button type="button" onClick={onDone} className="min-h-11 px-2 text-[14px] font-semibold text-admin-muted-2">Hủy</button>
        <button type="submit" disabled={mutation.isPending} className="min-h-11 rounded-full bg-admin-accent px-6 text-[14px] font-bold text-admin-sidebar disabled:opacity-60">{mutation.isPending ? 'Đang lưu…' : 'Lưu sản phẩm'}</button>
      </div>
    </form>
  );
}
