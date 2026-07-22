import { useEffect, useState, type FormEvent } from 'react';

import FormField from '../../components/admin/ui/FormField';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { usePageMeta } from '../../lib/use-page-meta';
import {
  useAdminSiteSettings,
  useUpdateSiteSettings,
} from '../../services/admin/site-settings.service';

// Nhãn tiếng Việt thân thiện cho từng key allow-list; key không có nhãn sẽ
// hiển thị chính key đó (không xảy ra với allow-list hiện tại).
const settingLabels: Record<string, string> = {
  site_title: 'Tiêu đề website',
  brand_heading: 'Tên thương hiệu',
  tagline: 'Khẩu hiệu',
  logo_storage_key: 'Object key logo',
  hotline: 'Hotline',
  contact_email: 'Email liên hệ',
  office_address: 'Địa chỉ văn phòng',
  facebook_url: 'Facebook',
  instagram_url: 'Instagram',
  youtube_url: 'YouTube',
  footer_copyright: 'Chân trang (copyright)',
};

const inputClass = 'w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

function SettingsContent() {
  usePageMeta('Cài đặt website');
  const settings = useAdminSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const { showToast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!settings.data) return;
    setValues(Object.fromEntries(settings.data.map((item) => [item.key, item.value])));
  }, [settings.data]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSettings.mutate(values, {
      onSuccess: () => showToast('Đã lưu cài đặt website.'),
      onError: (error) => showToast(error.message, 'error'),
    });
  }

  if (settings.isPending) return <p className="py-12 text-center text-stone-500">Đang tải cài đặt…</p>;
  if (settings.isError) {
    return <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{settings.error.message}</p>;
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm lg:p-8">
      <h1 className="text-2xl font-bold text-stone-900">Cài đặt website</h1>
      <p className="mt-1 text-sm text-stone-600">
        Các giá trị hiển thị ở header, footer và trang liên hệ công khai.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid max-w-3xl gap-5">
        {(settings.data ?? []).map((setting) => (
          <FormField
            key={setting.key}
            label={settingLabels[setting.key] ?? setting.key}
            htmlFor={'setting-' + setting.key}
          >
            <input
              id={'setting-' + setting.key}
              value={values[setting.key] ?? ''}
              onChange={(event) => setValues((current) => ({
                ...current,
                [setting.key]: event.target.value,
              }))}
              className={inputClass}
            />
          </FormField>
        ))}
        <div>
          <button type="submit" disabled={updateSettings.isPending} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white disabled:opacity-60">
            {updateSettings.isPending ? 'Đang lưu…' : 'Lưu cài đặt'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function AdminSettingsPage() {
  return <ToastProvider><SettingsContent /></ToastProvider>;
}
