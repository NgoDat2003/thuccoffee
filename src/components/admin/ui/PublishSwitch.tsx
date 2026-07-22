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
        'relative h-7 w-12 rounded-full transition disabled:opacity-50',
        active ? 'bg-emerald-600' : 'bg-stone-300',
      ].join(' ')}
    >
      <span className={[
        'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition',
        active ? 'left-6' : 'left-1',
      ].join(' ')} />
      <span className="sr-only">{active ? 'Ẩn khỏi website' : 'Hiển thị trên website'}</span>
    </button>
  );
}