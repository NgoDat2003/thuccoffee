import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  variant?: 'underline' | 'box';
  children: ReactNode;
}

const fieldStyles = {
  underline: '[&_input]:w-full [&_input]:border-0 [&_input]:border-b-[1.5px] [&_input]:border-admin-border-input [&_input]:bg-transparent [&_input]:px-0.5 [&_input]:py-2 [&_input]:outline-none [&_input]:transition-colors focus-within:[&_input]:border-admin-accent-strong [&_select]:w-full [&_select]:border-0 [&_select]:border-b-[1.5px] [&_select]:border-admin-border-input [&_select]:bg-transparent [&_select]:px-0.5 [&_select]:py-2 [&_select]:outline-none focus-within:[&_select]:border-admin-accent-strong',
  box: '[&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-admin-border-input [&_input]:bg-admin-surface [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:outline-none focus-within:[&_input]:border-admin-accent-strong [&_textarea]:w-full [&_textarea]:rounded-[10px] [&_textarea]:border [&_textarea]:border-admin-border-input [&_textarea]:bg-admin-surface [&_textarea]:px-3.5 [&_textarea]:py-2.5 [&_textarea]:outline-none focus-within:[&_textarea]:border-admin-accent-strong [&_select]:w-full [&_select]:rounded-[10px] [&_select]:border [&_select]:border-admin-border-input [&_select]:bg-admin-surface [&_select]:px-3.5 [&_select]:py-2.5 [&_select]:outline-none',
};

export default function FormField({
  label,
  htmlFor,
  error,
  required = false,
  variant = 'underline',
  children,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-admin-field">
        {label}{required ? ' *' : ''}
      </label>
      <div className={fieldStyles[variant]}>{children}</div>
      {error && <p role="alert" className="mt-1.5 text-[13px] text-admin-danger">{error}</p>}
    </div>
  );
}
