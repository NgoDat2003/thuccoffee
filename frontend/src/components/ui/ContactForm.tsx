import { useState } from 'react';
import { useSubmitContact } from '../../services/public-submissions.service';
import Toast from './Toast';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — người thật không thấy field này
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const submitContact = useSubmitContact();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError('Email không hợp lệ.');
      return;
    }

    setError('');
    submitContact.mutate(
      { name, email, phone, message, website },
      {
        onSuccess: () => {
          setName('');
          setEmail('');
          setPhone('');
          setMessage('');
          setShowToast(true);
        },
        onError: () => {
          setError('Không thể gửi liên hệ. Vui lòng thử lại sau.');
        },
      },
    );
  };

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-gray-700">
            Tên
          </label>
          <input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="mb-1 block text-sm font-medium text-gray-700">
            Điện thoại
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-gray-700">
            Nội dung
          </label>
          <textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {/* Honeypot chống bot: ẩn khỏi người dùng và screen reader. */}
        <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitContact.isPending}
          className="self-start rounded bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {submitContact.isPending ? 'Đang gửi…' : 'Gửi'}
        </button>
      </form>

      {showToast && <Toast message="Đã gửi liên hệ. Cảm ơn bạn!" onDismiss={() => setShowToast(false)} />}
    </>
  );
}
