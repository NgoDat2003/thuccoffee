import { Link } from 'react-router-dom';
import { categories, categoryHref } from '../../data';

interface CategorySidebarProps {
  activeKey: string;
  clientSideSelection: boolean;
  onSelect: (key: string) => void;
}

export default function CategorySidebar({
  activeKey,
  clientSideSelection,
  onSelect,
}: CategorySidebarProps) {
  return (
    <ul className="hidden flex-col gap-1 md:flex">
      {categories.map((cat) => (
        <li key={cat.key}>
          <Link
            to={categoryHref(cat.key)}
            onClick={(event) => {
              if (clientSideSelection) {
                event.preventDefault();
                onSelect(cat.key);
              }
            }}
            className={
              'block w-full rounded px-3 py-2 text-left text-sm font-medium uppercase ' +
              (cat.key === activeKey
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-50')
            }
          >
            {cat.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
