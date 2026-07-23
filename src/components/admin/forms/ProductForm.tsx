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
import FormActionBar from '../ui/FormActionBar';
import FormField from '../ui/FormField';
import { useToast } from '../ui/Toast';
import ProductOptionsStickerFields, { type OptionLinkDraft } from './ProductOptionsStickerFields';

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
  isFeatured: boolean;
  showOnHome: boolean;
  homePriority: string;
  categoryIds: number[];
  optionLinks: OptionLinkDraft[];
  stickerIds: number[];
}

const emptyForm: ProductFormState = {
  name: '', slug: '', price: '0', priceEstimated: false, thumb: '', image: '',
  description: '', sortOrder: '0', isFeatured: false, showOnHome: false,
  homePriority: '0', categoryIds: [], optionLinks: [], stickerIds: [],
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
      isFeatured: product.data.isFeatured,
      showOnHome: product.data.showOnHome,
      homePriority: String(product.data.homePriority),
      categoryIds: product.data.categories.map((category) => category.id),
      optionLinks: product.data.optionLinks.map((link) => ({
        optionId: link.optionId,
        price: String(link.price),
      })),
      stickerIds: product.data.stickers.map((sticker) => sticker.id),
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
      isFeatured: form.isFeatured,
      showOnHome: form.showOnHome,
      homePriority: Number(form.homePriority),
      categoryIds: form.categoryIds,
      optionLinks: form.optionLinks.map((link) => ({
        optionId: link.optionId,
        price: Number(link.price),
      })),
      stickerIds: form.stickerIds,
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
    <form onSubmit={handleSubmit} className="space-y-7">
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

      <div>
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-admin-muted-2">Hiển thị trang chủ</p>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2.5 text-[13.5px] font-semibold text-admin-field"><input type="checkbox" checked={form.isFeatured} onChange={(event) => updateField('isFeatured', event.target.checked)} />Yêu thích nhất</label>
          <label className="flex items-center gap-2.5 text-[13.5px] font-semibold text-admin-field"><input type="checkbox" checked={form.showOnHome} onChange={(event) => updateField('showOnHome', event.target.checked)} />Hiện ở trang chủ</label>
          <FormField label="Ưu tiên trang chủ" htmlFor="product-home-priority" error={errors.homePriority}><input id="product-home-priority" type="number" value={form.homePriority} onChange={(event) => updateField('homePriority', event.target.value)} /></FormField>
        </div>
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

      <ProductOptionsStickerFields
        optionLinks={form.optionLinks}
        stickerIds={form.stickerIds}
        onOptionLinksChange={(optionLinks) => updateField('optionLinks', optionLinks)}
        onToggleSticker={(id) => setForm((current) => ({
          ...current,
          stickerIds: current.stickerIds.includes(id)
            ? current.stickerIds.filter((value) => value !== id)
            : [...current.stickerIds, id],
        }))}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <div><ImageField kind="products" value={form.thumb} onChange={(value) => updateField('thumb', value)} label="Ảnh thumbnail *" />{errors.thumb && <p role="alert" className="mt-1.5 text-[13px] text-admin-danger">{errors.thumb}</p>}</div>
        <ImageField kind="products" value={form.image} onChange={(value) => updateField('image', value)} label="Ảnh chi tiết" />
      </div>

      <FormActionBar submitLabel="Lưu sản phẩm" pending={mutation.isPending} onCancel={onDone} />
    </form>
  );
}
