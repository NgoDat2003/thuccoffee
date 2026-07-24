import { useEffect, useState } from 'react';

import type { AdminStoreGalleryItem } from '@server/src/modules/stores/stores.admin.schemas';
import { getImageUrl } from '../../../lib/image-url';
import { useReplaceStoreGallery } from '../../../services/admin/stores.service';
import ImageField from '../ImageField';
import { useToast } from '../ui/Toast';

interface StoreGallerySectionProps {
  storeId: number;
  initial: AdminStoreGalleryItem[];
}

export default function StoreGallerySection({ storeId, initial }: StoreGallerySectionProps) {
  const { showToast } = useToast();
  const replaceGallery = useReplaceStoreGallery(storeId);
  const [items, setItems] = useState<string[]>(initial.map((item) => item.storageKey));

  useEffect(() => setItems(initial.map((item) => item.storageKey)), [initial]);

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
    if (items.includes(objectKey)) return showToast('Ảnh này đã có trong gallery.', 'error');
    setItems((current) => [...current, objectKey]);
  }

  function save() {
    replaceGallery.mutate(
      { items: items.map((storageKey, sortOrder) => ({ storageKey, sortOrder })) },
      { onSuccess: () => showToast('Đã lưu gallery.'), onError: (error) => showToast(error.message, 'error') },
    );
  }

  return (
    <fieldset className="rounded-[14px] border border-admin-border bg-admin-surface p-5">
      <legend className="pr-3 text-[11px] font-bold uppercase tracking-[0.08em] text-admin-muted-2">Thư viện · {items.length} ảnh</legend>
      {items.length === 0 && <p className="mb-4 text-[13px] text-admin-muted">Chưa có ảnh gallery.</p>}
      <ul className="space-y-2.5">
        {items.map((storageKey, index) => (
          <li key={storageKey} className="flex items-center gap-3 border-b border-admin-border-soft pb-2.5">
            <img src={getImageUrl(storageKey)} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
            <span className="min-w-0 flex-1 truncate text-[11.5px] text-admin-muted-2">{storageKey}</span>
            <div className="flex gap-1">
              <button type="button" aria-label="Đưa ảnh lên" disabled={index === 0} onClick={() => move(index, -1)} className="size-8 rounded-full border border-admin-border text-admin-muted disabled:opacity-30">↑</button>
              <button type="button" aria-label="Đưa ảnh xuống" disabled={index === items.length - 1} onClick={() => move(index, 1)} className="size-8 rounded-full border border-admin-border text-admin-muted disabled:opacity-30">↓</button>
              <button type="button" aria-label="Xóa ảnh" onClick={() => setItems(items.filter((key) => key !== storageKey))} className="min-h-8 px-2 text-[12px] font-semibold text-admin-danger">Xóa</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-5"><ImageField kind="stores" onChange={addImage} label="Thêm ảnh gallery" /></div>
      <button type="button" onClick={save} disabled={replaceGallery.isPending} className="mt-4 min-h-11 rounded-full bg-admin-ink px-5 text-[13px] font-bold text-admin-bg disabled:opacity-60">{replaceGallery.isPending ? 'Đang lưu…' : 'Lưu gallery'}</button>
    </fieldset>
  );
}
