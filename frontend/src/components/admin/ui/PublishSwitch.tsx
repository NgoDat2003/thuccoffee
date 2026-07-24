interface PublishSwitchProps {
  active: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}

export default function PublishSwitch({
  active,
  disabled = false,
  onChange,
}: PublishSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      disabled={disabled}
      onClick={() => onChange(!active)}
      className={[
        'relative h-[22px] w-[38px] rounded-full transition-colors disabled:opacity-50',
        active ? 'bg-admin-success' : 'bg-admin-border-input',
      ].join(' ')}
    >
      <span className={[
        'absolute top-[3px] size-4 rounded-full bg-admin-surface transition-[left]',
        active ? 'left-[19px]' : 'left-[3px]',
      ].join(' ')} />
      <span className="sr-only">{active ? 'Ẩn khỏi website' : 'Hiển thị trên website'}</span>
    </button>
  );
}
