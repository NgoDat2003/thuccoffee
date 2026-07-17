import { useState } from 'react';
import Container from '../components/ui/Container';
import Toast from '../components/ui/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
    setPassword('');
    setShowToast(true);
  };

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-2xl font-bold uppercase text-primary">Đăng nhập</h1>

      <div className="max-w-sm">
        <div className="mb-6 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Demo — không phải đăng nhập thật. Thông tin bạn nhập sẽ không được gửi đi đâu cả.
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Đăng Nhập
          </button>
        </form>
      </div>

      {showToast && <Toast message="Đăng nhập (demo)" onDismiss={() => setShowToast(false)} />}
    </Container>
  );
}
