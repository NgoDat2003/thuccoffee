interface StatusBadgeProps {
  active: boolean;
}

export default function StatusBadge({ active }: StatusBadgeProps) {
  return (
    <span className={[
      'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
      active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700',
    ].join(' ')}>
      {active ? 'Đang hiển thị' : 'Đã ẩn'}
    </span>
  );
}