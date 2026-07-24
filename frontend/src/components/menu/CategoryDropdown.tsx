import { useCategories } from '../../services/categories.service';

interface CategoryDropdownProps {
  activeKey: string;
  onSelect: (key: string) => void;
}

export default function CategoryDropdown({ activeKey, onSelect }: CategoryDropdownProps) {
  const { data: categories = [] } = useCategories();

  return (
    <select
      value={activeKey}
      onChange={(event) => onSelect(event.target.value)}
      className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm font-medium uppercase md:hidden"
      aria-label="Chọn danh mục"
    >
      {categories.map((category) => (
        <option key={category.key} value={category.key}>
          {category.label}
        </option>
      ))}
    </select>
  );
}