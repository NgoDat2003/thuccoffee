import { useRef } from 'react';

import { getImageUrl } from '../../lib/image-url';
import { useUploadImage, type UploadKind } from '../../services/admin/uploads.service';

interface ImageFieldProps {
  kind: UploadKind;
  value?: string;
  onChange: (objectKey: string) => void;
  label: string;
}

export default function ImageField({ kind, value, onChange, label }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImage();

  function handleFile(file?: File) {
    if (!file) return;
    upload.mutate({ file, kind }, { onSuccess: ({ objectKey }) => onChange(objectKey) });
  }

  return (
    <div>
      <span className="mb-[10px] block text-[11px] font-bold uppercase tracking-[0.08em] text-admin-muted-2">{label}</span>
      {value && (
        <img src={getImageUrl(value)} alt={'Xem trước ' + label.toLowerCase()} className="mb-3 h-32 w-full rounded-[10px] border border-admin-border object-cover" />
      )}
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
        className="flex min-h-[132px] w-full flex-col items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-admin-border-input bg-admin-surface px-5 text-center text-admin-muted-2 transition-colors hover:border-admin-accent-strong hover:text-admin-accent-strong disabled:opacity-60"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 16V4" /><polyline points="7 9 12 4 17 9" /><path d="M5 20h14a2 2 0 002-2v-3" /><path d="M3 15v3a2 2 0 002 2" /></svg>
        <span className="text-[13px] font-semibold text-admin-field">{upload.isPending ? 'Đang tải ảnh…' : value ? 'Chọn ảnh khác' : 'Chọn ảnh để tải lên'}</span>
        <span className="text-[11.5px]">PNG, JPEG, WebP hoặc GIF · Tối đa 5MB</span>
      </button>
      {upload.isError && (
        <p role="alert" className="mt-2 text-[13px] text-admin-danger">
          {upload.error instanceof Error ? upload.error.message : 'Không thể tải ảnh lên.'}
        </p>
      )}
    </div>
  );
}
