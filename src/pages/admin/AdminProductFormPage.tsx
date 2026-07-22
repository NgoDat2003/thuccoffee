import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import type {
  CreateAdminProductInput,
  UpdateAdminProductInput,
} from '../../../server/src/modules/products/products.admin.schemas';
import ImageField from '../../components/admin/ImageField';
import FormField from '../../components/admin/ui/FormField';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { ApiError } from '../../lib/api';
import { usePageMeta } from '../../lib/use-page-meta';
import { useAdminCategories } from '../../services/admin/categories.service';
import {
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
} from '../../services/admin/products.service';

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
  name: '',
  slug: '',
  price: '0',
  priceEstimated: false,
  thumb: '',
  image: '',
  description: '',
  sortOrder: '0',
  categoryIds: [],
};

const inputClass = 'w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

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

function ProductFormContent() {
  const params = useParams<{ id: string }>();
  const productId = params.id ? Number(params.id) : undefined;
  const isEdit = productId !== undefined;
  usePageMeta(isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm');

  const navigate = useNavigate();
  const { showToast } = useToast();
  const product = useAdminProduct(productId);
  const categories = useAdminCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(productId ?? 0);
  const [form, setForm] = useState<ProductFormState>(emptyForm);

  useEffect(() => {
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
  }, [product.data]);

  const mutation = isEdit ? updateProduct : createProduct;
  const errors = fieldErrors(mutation.error);

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleCategory(id: number) {
    setForm((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(id)
        ? current.categoryIds.filter((value) => value !== id)
        : [...current.categoryIds, id],
    }));
  }

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
      if (!isEdit) window.setTimeout(() => navigate('/admin/products'), 500);
    };
    const onError = (error: Error) => showToast(error.message, 'error');

    if (isEdit) {
      updateProduct.mutate(common, { onSuccess, onError });
    } else {
      const input: CreateAdminProductInput = { ...common, slug: form.slug };
      createProduct.mutate(input, { onSuccess, onError });
    }
  }

  if (isEdit && product.isPending) {
    return <p className="py-12 text-center text-stone-500">Đang tải sản phẩm…</p>;
  }

  if (isEdit && product.isError) {
    return <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{product.error.message}</p>;
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm lg:p-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-stone-900">
          {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        </h1>
        <Link to="/admin/products" className="text-sm font-medium text-primary">Quay lại danh sách</Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid max-w-4xl gap-6 md:grid-cols-2">
        <FormField label="Tên sản phẩm" htmlFor="product-name" error={errors.name} required>
          <input id="product-name" value={form.name} onChange={(event) => updateField('name', event.target.value)} className={inputClass} required />
        </FormField>
        <FormField label="Slug" htmlFor="product-slug" error={errors.slug} required>
          <input id="product-slug" value={form.slug} onChange={(event) => updateField('slug', event.target.value)} className={inputClass} disabled={isEdit} required />
        </FormField>
        <FormField label="Giá" htmlFor="product-price" error={errors.price} required>
          <input id="product-price" type="number" min="0" value={form.price} onChange={(event) => updateField('price', event.target.value)} className={inputClass} required />
        </FormField>
        <FormField label="Thứ tự" htmlFor="product-order" error={errors.sortOrder} required>
          <input id="product-order" type="number" value={form.sortOrder} onChange={(event) => updateField('sortOrder', event.target.value)} className={inputClass} required />
        </FormField>

        <label className="flex items-center gap-3 text-sm font-medium text-stone-700">
          <input type="checkbox" checked={form.priceEstimated} onChange={(event) => updateField('priceEstimated', event.target.checked)} />
          Giá ước tính
        </label>

        <div className="md:col-span-2">
          <ImageField kind="products" value={form.thumb} onChange={(value) => updateField('thumb', value)} label="Ảnh thumbnail *" />
          {errors.thumb && <p role="alert" className="mt-1 text-sm text-red-700">{errors.thumb}</p>}
        </div>
        <div className="md:col-span-2">
          <ImageField kind="products" value={form.image} onChange={(value) => updateField('image', value)} label="Ảnh chi tiết" />
        </div>

        <div className="md:col-span-2">
          <FormField label="Mô tả" htmlFor="product-description" error={errors.description}>
            <textarea id="product-description" rows={5} value={form.description} onChange={(event) => updateField('description', event.target.value)} className={inputClass} />
          </FormField>
        </div>

        <fieldset className="md:col-span-2">
          <legend className="mb-3 text-sm font-medium text-stone-700">Danh mục</legend>
          {categories.isPending ? (
            <p className="text-sm text-stone-500">Đang tải danh mục…</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(categories.data ?? []).map((category) => (
                <label key={category.id} className="flex items-center gap-3 rounded-lg border border-stone-200 px-3 py-2">
                  <input type="checkbox" checked={form.categoryIds.includes(category.id)} onChange={() => toggleCategory(category.id)} />
                  {category.label}
                </label>
              ))}
            </div>
          )}
          {errors.categoryIds && <p role="alert" className="mt-1 text-sm text-red-700">{errors.categoryIds}</p>}
        </fieldset>

        <div className="md:col-span-2">
          <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white disabled:opacity-60">
            {mutation.isPending ? 'Đang lưu…' : 'Lưu sản phẩm'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function AdminProductFormPage() {
  return <ToastProvider><ProductFormContent /></ToastProvider>;
}