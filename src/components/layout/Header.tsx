import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-[82px] items-center bg-white shadow">
      <div className="mx-auto flex w-full max-w-[1170px] items-center justify-between px-[15px]">
        <Link to="/" className="text-lg font-bold text-primary">
          Thức Coffee
        </Link>
        <nav className="text-sm text-secondary">Menu</nav>
      </div>
    </header>
  );
}
