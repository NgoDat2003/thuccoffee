import { useRef } from 'react';

import { getImageUrl } from '../../lib/image-url';
import {
  useUploadImage,
  type UploadKind,
} from '../../services/admin/uploads.service';

interface ImageFieldProps {
  kind: UploadKind;
  value?: string;
  onChange: (objectKey: string) => void;
  label: string;
}

export default function ImageField({
  kind,
  value,
  onChange,
  label,
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImage();

  function handleFile(file?: File) {
    if (!file) return;
    upload.mutate(
      { file, kind },
      { onSuccess: ({ objectKey }) => onChange(objectKey) },
    );
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-stone-700">{label}</span>
      <div className="flex flex-wrap items-center gap-4">
        {value ? (
          <img
            src={getImageUrl(value)}
            alt={'Xem trước ' + label.toLowerCase()}
            className="h-28 w-28 rounded-lg border border-stone-200 object-cover"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-lg border border-dashed border-stone-300 text-center text-xs text-stone-500">
            Chưa có ảnh
          </div>
        )}
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <button
            type="button"
            disabled={upload.isPending}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-stone-50 disabled:opacity-60"
          >
            {upload.isPending ? 'Đang tải ảnh…' : 'Chọn ảnh'}
          </button>
          <p className="mt-2 text-xs text-stone-500">PNG, JPEG, WebP hoặc GIF. Tối đa 5MB.</p>
        </div>
      </div>
      {upload.isError && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {upload.error instanceof Error
            ? upload.error.message
            : 'Không thể tải ảnh lên.'}
        </p>
      )}
    </div>
  );
}