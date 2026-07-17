import { categories } from '../../data';

interface CategoryDropdownProps {
  activeKey: string;
  onSelect: (key: string) => void;
}

export default function CategoryDropdown({ activeKey, onSelect }: CategoryDropdownProps) {
  return (
    <select
      value={activeKey}
      onChange={(e) => onSelect(e.target.value)}
      className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm font-medium uppercase md:hidden"
      aria-label="Chọn danh mục"
    >
      {categories.map((cat) => (
        <option key={cat.key} value={cat.key}>
          {cat.label}
        </option>
      ))}
    </select>
  );
}
