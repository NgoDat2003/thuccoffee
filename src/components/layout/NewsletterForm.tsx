import { useState } from 'react';
import { useSubscribeNewsletter } from '../../services/public-submissions.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Form đăng ký nhận tin ở footer — lưu email vào backend, idempotent với
// email trùng.
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — người thật không thấy field này
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const subscribe = useSubscribeNewsletter();

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error');
      return;
    }
    subscribe.mutate(
      { email: email.trim(), website },
      {
        onSuccess: () => {
          setEmail('');
          setStatus('success');
        },
        onError: () => setStatus('error'),
      },
    );
  };

  return (
    <form onSubmit={onSubmit}>
      {/* Honeypot chống bot: ẩn khỏi người dùng và screen reader. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="newsletter-website">Website</label>
        <input
          id="newsletter-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>
      <div className="relative h-[35px] w-full">
        <label htmlFor="footer-email" className="sr-only">
          Nhập địa chỉ email
        </label>
        <input
          id="footer-email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setStatus('idle');
          }}
          placeholder="Nhập địa chỉ email"
          className="h-[35px] w-full rounded border border-[#d7dbdb] bg-white px-[10px] pr-[50px] text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          aria-label="Đăng ký nhận tin"
          className="absolute right-0 top-0 flex h-[35px] w-[40px] items-center justify-center text-[17px] text-[#696969] hover:text-primary disabled:opacity-60"
        >
          →
        </button>
      </div>
      {status === 'success' ? (
        <p className="mb-0 mt-3 font-medium italic text-primary" role="status">Đã đăng ký nhận tin. Cảm ơn bạn!</p>
      ) : status === 'error' ? (
        <p className="mb-0 mt-3 font-medium italic text-red-600" role="alert">Email không hợp lệ hoặc gửi thất bại. Thử lại nhé.</p>
      ) : (
        <p className="mb-0 mt-3 font-medium italic">Nhận tin khuyến mãi của Thức</p>
      )}
    </form>
  );
}
