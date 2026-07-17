import { useState } from 'react';

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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 px-4 py-3 text-sm text-white">
      <div className="mx-auto flex max-w-[1170px] flex-wrap items-center justify-between gap-3">
        <p>
          Trang web có sử dụng cookies. Nếu bạn tiếp tục, chúng tôi xem như bạn đã chấp nhận việc sử
          dụng cookies.
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded border border-white px-4 py-1.5 font-medium hover:bg-white hover:text-gray-900"
        >
          Chấp nhận &amp; Đóng
        </button>
      </div>
    </div>
  );
}
