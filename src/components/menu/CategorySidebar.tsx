import { categories } from '../../data';

interface CategorySidebarProps {
  activeKey: string;
  onSelect: (key: string) => void;
}

export default function CategorySidebar({ activeKey, onSelect }: CategorySidebarProps) {
  return (
    <ul className="hidden flex-col gap-1 md:flex">
      {categories.map((cat) => (
        <li key={cat.key}>
          <button
            onClick={() => onSelect(cat.key)}
            className={`w-full rounded px-3 py-2 text-left text-sm font-medium uppercase ${
              cat.key === activeKey ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
