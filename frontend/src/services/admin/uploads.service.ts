import { useMutation } from '@tanstack/react-query';

import { apiPostFormData } from '../../lib/api';

export type UploadKind = 'products' | 'blog' | 'stores' | 'banners' | 'site';

interface UploadResponse {
  objectKey: string;
}

interface UploadImageInput {
  file: File;
  kind: UploadKind;
}

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ file, kind }: UploadImageInput) => {
      const form = new FormData();
      form.set('kind', kind);
      form.set('file', file);
      return apiPostFormData<UploadResponse>('/admin/uploads', form);
    },
  });
}