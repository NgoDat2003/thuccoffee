interface StatusBadgeProps {
  active: boolean;
}

export default function StatusBadge({ active }: StatusBadgeProps) {
  return (
    <span className={[
      'inline-flex items-center gap-2 text-[13px] font-semibold',
      active ? 'text-admin-success' : 'text-admin-muted-2',
    ].join(' ')}>
      <span className="size-[7px] rounded-full bg-current" aria-hidden="true" />
      {active ? 'Đang hiển thị' : 'Đã ẩn'}
    </span>
  );
}
