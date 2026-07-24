import { useEffect, useState, type FormEvent } from 'react';

import ImageField from '../../components/admin/ImageField';
import FormActionBar from '../../components/admin/ui/FormActionBar';
import FormField from '../../components/admin/ui/FormField';
import { useToast } from '../../components/admin/ui/Toast';
import {
  useAdminGallery,
  useCreateGalleryItem,
  useUpdateGalleryItem,
} from '../../services/admin/static-pages.service';

interface GalleryItemFormProps {
  itemId?: number;
  onDone: () => void;
}

export function GalleryItemForm({ itemId, onDone }: GalleryItemFormProps) {
  const isEdit = itemId !== undefined;
  const { showToast } = useToast();
  const gallery = useAdminGallery();
  const createItem = useCreateGalleryItem();
  const updateItem = useUpdateGalleryItem();

  const [storageKey, setStorageKey] = useState('');
  const [altText, setAltText] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const mutation = isEdit ? updateItem : createItem;

  useEffect(() => {
    if (!isEdit || !gallery.data) return;
    const item = gallery.data.find((g) => g.id === itemId);
    if (!item) return;
    setStorageKey(item.storageKey);
    setAltText(item.altText ?? '');
    setSortOrder(String(item.sortOrder));
    setIsActive(item.isActive);
  }, [isEdit, itemId, gallery.data]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storageKey) return;

    const nextOrder = isEdit
      ? Number(sortOrder)
      : Math.max(0, ...(gallery.data ?? []).map((item) => item.sortOrder + 1));

    const payload = {
      storageKey,
      altText: altText.trim(),
      sortOrder: nextOrder,
      isActive,
    };

    const onSuccess = () => {
      showToast(isEdit ? 'Đã cập nhật ảnh gallery.' : 'Đã thêm ảnh vào gallery.');
      onDone();
    };
    const onError = (error: Error) => showToast(error.message, 'error');

    if (isEdit) {
      updateItem.mutate({ id: itemId, input: payload }, { onSuccess, onError });
    } else {
      createItem.mutate(payload, { onSuccess, onError });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ImageField kind="site" value={storageKey} onChange={setStorageKey} label="Ảnh gallery *" />
      
      <FormField label="Chú thích ảnh (Alt Text)" htmlFor="gallery-alt-text">
        <input id="gallery-alt-text" value={altText} onChange={(e) => setAltText(e.target.value)} />
      </FormField>

      {isEdit && (
        <FormField label="Thứ tự" htmlFor="gallery-sort-order" required>
          <input id="gallery-sort-order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} required />
        </FormField>
      )}

      <label className="flex items-center gap-2.5 text-[13.5px] font-semibold text-admin-field">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Hiển thị công khai
      </label>

      <FormActionBar submitLabel={isEdit ? 'Lưu thay đổi' : 'Thêm vào gallery'} pending={mutation.isPending} onCancel={onDone} />
    </form>
  );
}
