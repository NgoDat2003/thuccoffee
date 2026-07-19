import { useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'thuc_cookie_ok';

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    try {
      return !localStorage.getItem(STORAGE_KEY);
    } catch {
      return true;
    }
  });

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // localStorage unavailable (e.g. privacy mode) — banner just re-shows next visit
    }
    setVisible(false);
  };

  return (
    <div className="fixed right-0 bottom-0 left-0 z-40 bg-[#292929] px-4 py-2.5 text-sm leading-[30px] text-white">
      <div className="mx-auto flex max-w-[1170px] flex-col items-center justify-center gap-2 text-center">
        <p className="m-0">
          Trang web có sử dụng cookies. Nếu bạn tiếp tục, chúng tôi xem như bạn đã chấp nhận việc sử
          dụng cookies.
          {' '}
          <Link to="/chinh-sach" className="italic text-white hover:underline">
            {'Xem ch\u00ednh s\u00e1ch s\u1eed d\u1ee5ng cookie'}
          </Link>
        </p>
        <button
          onClick={accept}
          className="h-[30px] shrink-0 bg-white px-4 text-[15px] font-medium leading-[30px] text-secondary hover:bg-gray-100"
        >
          Chấp nhận &amp; Đóng
        </button>
      </div>
    </div>
  );
}
