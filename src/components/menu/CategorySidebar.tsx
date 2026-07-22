import { Link } from 'react-router-dom';
import { categoryHref } from '../../data/category-paths';
import { useCategories } from '../../services/categories.service';

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
  const { data: categories = [] } = useCategories();

  return (
    <ul className="hidden flex-col gap-1 md:flex">
      {categories.map((category) => (
        <li key={category.key}>
          <Link
            to={categoryHref(category.key)}
            onClick={(event) => {
              if (clientSideSelection) {
                event.preventDefault();
                onSelect(category.key);
              }
            }}
            className={
              'block w-full rounded px-3 py-2 text-left text-sm font-medium uppercase ' +
              (category.key === activeKey
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-50')
            }
          >
            {category.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}