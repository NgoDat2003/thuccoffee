import { Link } from 'react-router-dom';

interface FormActionBarProps {
  // Nhãn nút submit, ví dụ "Lưu sản phẩm".
  submitLabel: string;
  pending: boolean;
  pendingLabel?: string;
  // Hủy: truyền onCancel (đóng drawer) hoặc cancelTo (điều hướng trang).
  onCancel?: () => void;
  cancelTo?: string;
  // Đặt khi nút submit nằm ngoài <form> (nối bằng thuộc tính form của HTML).
  formId?: string;
}

const cancelClass = 'inline-flex min-h-11 items-center rounded-full border border-admin-border px-5 text-[14px] font-semibold text-admin-ink-soft hover:bg-admin-border-soft';

// Hàng nút Hủy/Lưu cuối form admin — block tĩnh trong flow (không sticky/fixed),
// có border-t phân tách với nội dung form.
export default function FormActionBar({
  submitLabel,
  pending,
  pendingLabel = 'Đang lưu…',
  onCancel,
  cancelTo,
  formId,
}: FormActionBarProps) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-admin-border pt-5">
      {cancelTo ? (
        <Link to={cancelTo} className={cancelClass}>Hủy</Link>
      ) : (
        <button type="button" onClick={onCancel} className={cancelClass}>Hủy</button>
      )}
      <button
        type="submit"
        form={formId}
        disabled={pending}
        className="min-h-11 rounded-full bg-admin-accent px-6 text-[14px] font-bold text-white hover:bg-admin-accent-strong disabled:opacity-60"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </div>
  );
}
