import { useEffect, useState, type FormEvent } from 'react';

import ImageField from '../../components/admin/ImageField';
import FormField from '../../components/admin/ui/FormField';
import { ToastProvider, useToast } from '../../components/admin/ui/Toast';
import { usePageMeta } from '../../lib/use-page-meta';
import { useAdminSiteSettings, useUpdateSiteSettings } from '../../services/admin/site-settings.service';

const settingLabels: Record<string, string> = {
  site_title: 'Tiêu đề website', brand_heading: 'Tên thương hiệu', tagline: 'Khẩu hiệu',
  logo_storage_key: 'Logo', hotline: 'Hotline', contact_email: 'Email liên hệ',
  office_address: 'Địa chỉ văn phòng', facebook_url: 'Facebook', instagram_url: 'Instagram',
  youtube_url: 'YouTube', footer_copyright: 'Chân trang (copyright)',
};
const generalKeys = ['site_title', 'brand_heading', 'tagline', 'hotline', 'contact_email', 'office_address', 'footer_copyright'];
const socialKeys = ['facebook_url', 'instagram_url', 'youtube_url'];

function SettingsContent() {
  usePageMeta('Cài đặt website');
  const settings = useAdminSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const { showToast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const loadedValues = Object.fromEntries((settings.data ?? []).map((item) => [item.key, item.value]));

  useEffect(() => { if (settings.data) setValues(Object.fromEntries(settings.data.map((item) => [item.key, item.value]))); }, [settings.data]);
  const updateValue = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const reset = () => setValues(loadedValues);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSettings.mutate(values, { onSuccess: () => showToast('Đã lưu cài đặt website.'), onError: (error) => showToast(error.message, 'error') });
  };

  if (settings.isPending) return <p className="py-12 text-center text-admin-muted">Đang tải cài đặt…</p>;
  if (settings.isError) return <p role="alert" className="rounded-[10px] border border-admin-danger/20 p-4 text-admin-danger">{settings.error.message}</p>;

  const renderField = (key: string) => (
    <FormField key={key} label={settingLabels[key] ?? key} htmlFor={'setting-' + key}>
      <input id={'setting-' + key} value={values[key] ?? ''} onChange={(event) => updateValue(key, event.target.value)} />
    </FormField>
  );

  return (
    <section className="w-full max-w-[1180px]">
      <p className="text-[13px] font-semibold text-admin-accent-strong">Quản trị</p>
      <h1 className="mt-1 text-[34px] font-black tracking-[-0.02em]">Cài đặt website</h1>
      <p className="mt-2 mb-8 text-[14px] text-admin-muted">Thông tin chung hiển thị ở header, footer và trang liên hệ.</p>
      <form onSubmit={handleSubmit} className="pb-28">
        <div className="grid items-start gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
          <div>
            <p className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-admin-muted-2">Thông tin chung</p>
            <div className="grid gap-5 sm:grid-cols-2">{generalKeys.map((key) => <div key={key} className={key === 'office_address' || key === 'footer_copyright' ? 'sm:col-span-2' : ''}>{renderField(key)}</div>)}</div>
            <p className="mt-8 mb-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-admin-muted-2">Mạng xã hội</p>
            <div className="grid gap-5 sm:grid-cols-2">{socialKeys.map(renderField)}</div>
          </div>
          <div><ImageField kind="site" value={values.logo_storage_key} onChange={(value) => updateValue('logo_storage_key', value)} label="Logo" /></div>
        </div>
        <div className="sticky bottom-6 ml-auto mt-9 flex max-w-[400px] items-center justify-end gap-3 rounded-full bg-admin-ink px-5 py-3.5">
          <button type="button" onClick={reset} className="min-h-11 px-2 text-[14px] font-semibold text-admin-muted-2">Hủy</button>
          <button type="submit" disabled={updateSettings.isPending} className="min-h-11 rounded-full bg-admin-accent px-6 text-[14px] font-bold text-white hover:bg-admin-accent-strong disabled:opacity-60">{updateSettings.isPending ? 'Đang lưu…' : 'Lưu cài đặt'}</button>
        </div>
      </form>
    </section>
  );
}

export default function AdminSettingsPage() {
  return <ToastProvider><SettingsContent /></ToastProvider>;
}
