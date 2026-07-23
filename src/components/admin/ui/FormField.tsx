import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  /** Giữ lại cho tương thích — cả hai variant giờ cùng render box mềm. */
  variant?: 'underline' | 'box';
  children: ReactNode;
}

// Một kiểu field duy nhất (góp ý #5 — bỏ underline mỏng): box trắng, viền
// mềm, radius 10px, focus ring xanh 3px. Áp qua arbitrary variant để consumer
// không phải sửa markup; font input ≥16px tránh zoom trên mobile.
const fieldClass = [
  '[&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-admin-border-input [&_input]:bg-admin-surface [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-[16px] [&_input]:text-admin-ink [&_input]:outline-none [&_input]:transition-shadow [&_input]:placeholder:text-admin-muted-2',
  'focus-within:[&_input]:border-admin-accent focus-within:[&_input]:ring-[3px] focus-within:[&_input]:ring-admin-accent/15',
  '[&_input:disabled]:bg-admin-bg [&_input:disabled]:text-admin-muted [&_input:disabled]:cursor-not-allowed',
  '[&_textarea]:w-full [&_textarea]:rounded-[10px] [&_textarea]:border [&_textarea]:border-admin-border-input [&_textarea]:bg-admin-surface [&_textarea]:px-3.5 [&_textarea]:py-2.5 [&_textarea]:text-[16px] [&_textarea]:text-admin-ink [&_textarea]:outline-none [&_textarea]:transition-shadow',
  'focus-within:[&_textarea]:border-admin-accent focus-within:[&_textarea]:ring-[3px] focus-within:[&_textarea]:ring-admin-accent/15',
  '[&_select]:w-full [&_select]:rounded-[10px] [&_select]:border [&_select]:border-admin-border-input [&_select]:bg-admin-surface [&_select]:px-3.5 [&_select]:py-2.5 [&_select]:text-[16px] [&_select]:text-admin-ink [&_select]:outline-none',
  'focus-within:[&_select]:border-admin-accent focus-within:[&_select]:ring-[3px] focus-within:[&_select]:ring-admin-accent/15',
].join(' ');

export default function FormField({
  label,
  htmlFor,
  error,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-admin-field">
        {label}{required ? ' *' : ''}
      </label>
      <div className={fieldClass}>{children}</div>
      {error && <p role="alert" className="mt-1.5 text-[13px] text-admin-danger">{error}</p>}
    </div>
  );
}
