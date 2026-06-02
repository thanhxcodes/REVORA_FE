import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, User as UserIcon, Mail } from 'lucide-react';
import type { User } from '../App';
import logoImg from '../../imports/logo1.jpg';
import { useAuth } from '../context/AuthContext';

// Import các Modal độc lập đã được bóc tách
import TermsModal from './components/TermsModal';
import PrivacyModal from './components/PrivacyModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import RegisterSuccessModal from './components/RegisterSuccessModal';

const MOCK_CREDENTIALS: Record<string, { password: string; user: User }> = {
  user1: { password: '123', user: { username: 'user1', name: 'Minh Anh', avatar: 'M', role: 'user' } },
  user2: { password: '123', user: { username: 'user2', name: 'Thu Hà', avatar: 'T', role: 'user' } },
  admin: { password: '123', user: { username: 'admin', name: 'Admin REVORA', avatar: 'A', role: 'admin' } },
};
// Trạng thái đăng nhập được quản lý hoàn toàn tập trung thông qua useAuth context

/* ─── Google SVG ─────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/* ─── Register Form ───────────────────────────────────────────────────────── */
interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Hook xác thực từ Context
  const { register } = useAuth();

  const validate = (): string | null => {
    if (!fullName.trim()) return 'Vui lòng nhập họ và tên.';
    if (!username.trim()) return 'Vui lòng nhập tên đăng nhập.';
    if (username.trim().length < 3) return 'Tên đăng nhập phải có ít nhất 3 ký tự.';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Tên đăng nhập chỉ gồm chữ, số và dấu gạch dưới.';
    
    // Regex kiểm tra định dạng Email chuẩn hóa
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Email không hợp lệ.';
    
    if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp.';
    if (!agree) return 'Bạn cần đồng ý với điều khoản sử dụng và chính sách bảo mật của REVORA.';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Chạy xác thực dữ liệu Client-side
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    setIsSubmitting(true);

    try {
      // 2. Gửi yêu cầu đăng ký lên Backend (chuẩn hóa dữ liệu đầu vào)
      await register({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });

      // 3. Đánh dấu đăng ký thành công hiển thị Modal
      setSuccess(true);
    } catch (err: any) {
      console.error('Đăng ký thất bại:', err);
      // 4. Trích xuất thông điệp lỗi động từ Backend (Ví dụ: trùng Email, trùng Username)
      const serverMessage = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return <RegisterSuccessModal isOpen={success} name={fullName} onClose={onSwitchToLogin} />;
  }

  return (
    <div className="px-8 py-7">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Tạo tài khoản mới</h2>
      <p className="text-gray-500 text-sm mb-6">Tham gia cộng đồng thời trang REVORA</p>

      {/* Google Register */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-2xl py-3 px-4 hover:bg-gray-50 hover:border-gray-300 transition-all mb-4 group"
      >
        <GoogleIcon />
        <span className="text-gray-700 font-medium text-sm group-hover:text-gray-900 transition-colors">
          Đăng ký với Google
        </span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="px-4 text-xs text-gray-400 font-medium uppercase tracking-wider">hoặc điền form</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Họ và tên */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên</label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setError(''); }}
              placeholder="Nguyễn Văn A"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
              autoComplete="name"
            />
          </div>
        </div>

        {/* Tên đăng nhập (Username) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên đăng nhập</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value.toLowerCase()); setError(''); }}
              placeholder="username"
              className="w-full pl-8 pr-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
              autoComplete="username"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="email@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Mật khẩu và Xác nhận mật khẩu */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full pl-10 pr-9 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900 text-sm"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xác nhận</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-9 py-3 rounded-xl border focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-all text-gray-900 text-sm ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                    : confirmPassword && password === confirmPassword
                    ? 'border-green-300 focus:ring-green-200 focus:border-green-400'
                    : 'border-gray-200 focus:ring-brand-primary/25 focus:border-brand-primary/40'
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Password strength hint */}
        {password && (
          <div className="flex gap-1.5 items-center">
            {[
              password.length >= 6,
              /[A-Z]/.test(password),
              /[0-9]/.test(password),
              /[^a-zA-Z0-9]/.test(password),
            ].map((ok, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  ok ? (password.length >= 10 ? 'bg-green-500' : 'bg-brand-accent') : 'bg-gray-200'
                }`}
              />
            ))}
            <span className="text-[10px] text-gray-400 ml-1 whitespace-nowrap">
              {password.length < 6 ? 'Quá ngắn' : password.length < 10 ? 'Trung bình' : 'Mạnh'}
            </span>
          </div>
        )}

        {/* Đồng ý điều khoản sử dụng */}
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => { setAgree(e.target.checked); setError(''); }}
              className="sr-only"
            />
            <div
              className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-all ${
                agree ? 'bg-brand-primary border-brand-primary' : 'border-gray-300 bg-white group-hover:border-brand-primary/50'
              }`}
            >
              {agree && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-600 leading-relaxed">
            Tôi đồng ý với{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowTerms(true);
              }}
              className="text-brand-primary font-semibold hover:underline cursor-pointer"
            >
              Điều khoản sử dụng
            </button>
            {' '}và{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPrivacy(true);
              }}
              className="text-brand-primary font-semibold hover:underline cursor-pointer"
            >
              Chính sách bảo mật
            </button>
            {' '}của REVORA
          </span>
        </label>

        {/* Modals điều khoản */}
        <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />

        {/* Thông báo lỗi */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
            <span className="text-red-400 flex-shrink-0">⚠</span> {error}
          </div>
        )}

        {/* Nút bấm đăng ký */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-3.5 rounded-2xl hover:shadow-lg hover:shadow-brand-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none font-semibold mt-1"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Tạo Tài Khoản <ArrowRight className="w-[18px] h-[18px]" /></>
          )}
        </button>
      </form>

      {/* Chuyển hướng nhanh sang Đăng nhập */}
      <p className="text-center text-sm text-gray-500 mt-5">
        Đã có tài khoản?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-brand-primary font-semibold hover:text-brand-secondary hover:underline transition-colors"
        >
          Đăng nhập ngay
        </button>
      </p>
    </div>
  );
}

/* ─── Login Form ──────────────────────────────────────────────────────────── */
interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgot: () => void;
}

function LoginForm({
  onSwitchToRegister,
  onForgot,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Lấy trạng thái đăng nhập và hàm login từ context
  const { login, currentUser } = useAuth();

  // Hiệu ứng lắng nghe sự thay đổi của currentUser để điều hướng phân quyền an toàn
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Gọi hàm login từ AuthContext thực tế
      await login({ email: email.trim(), password });
    } catch (err: any) {
      console.error('Đăng nhập thất bại:', err);
      // Trích xuất thông điệp lỗi chi tiết được trả về từ Backend thông qua Axios Interceptor
      const errMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tính năng đăng nhập nhanh WOW UX: Điền form và thực hiện API login ngay lập tức
  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email: demoEmail, password: demoPassword });
    } catch (err: any) {
      console.error('Đăng nhập nhanh thất bại:', err);
      const errMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Chào mừng trở lại</h2>
      <p className="text-gray-500 text-sm mb-7">Đăng nhập để tiếp tục mua bán</p>

      {/* Google Login */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-2xl py-3 px-4 hover:bg-gray-50 hover:border-gray-300 transition-all mb-4 group"
      >
        <GoogleIcon />
        <span className="text-gray-700 font-medium text-sm group-hover:text-gray-900 transition-colors">
          Tiếp tục với Google
        </span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="px-4 text-xs text-gray-400 font-medium uppercase tracking-wider">hoặc đăng nhập</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trường nhập Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="email@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
              required
              autoComplete="email"
            />
          </div>
        </div>

        {/* Trường nhập Mật khẩu */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Mật Khẩu</label>
            <button
              type="button"
              onClick={onForgot}
              className="text-xs text-brand-primary hover:text-brand-secondary hover:underline transition-colors font-medium"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <span className="text-red-400 flex-shrink-0">⚠</span> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-3.5 rounded-2xl hover:shadow-lg hover:shadow-brand-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none font-semibold mt-2"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Đăng Nhập <ArrowRight className="w-[18px] h-[18px]" /></>
          )}
        </button>
      </form>

      {/* Demo accounts */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <p className="text-xs text-center text-gray-400 font-medium mb-3 uppercase tracking-wider">
          Tài khoản demo — nhấn để điền nhanh
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { email: 'minhanh@gmail.com', label: 'Minh Anh', role: 'Người dùng', bgClass: 'bg-brand-primary' },
            { email: 'thuha@gmail.com', label: 'Thu Hà', role: 'Người dùng', bgClass: 'bg-[#533483]' },
            { email: 'admin@revora.vn', label: 'Admin', role: 'Quản trị', bgClass: 'bg-[#374151]' },
          ].map(({ email: demoEmail, label, role, bgClass }) => (
            <button
              key={demoEmail}
              type="button"
              onClick={() => quickLogin(demoEmail, '123')}
              className={`rounded-2xl py-3 px-2 text-center transition-all border-2 hover:scale-[1.02] ${
                email === demoEmail
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto mb-1.5 ${bgClass}`}
              >
                {label[0]}
              </div>
              <div className="text-gray-800 text-xs font-semibold leading-tight">{label}</div>
              <div className="text-gray-400 text-[10px] mt-0.5">{role}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Switch to register */}
      <p className="text-center text-sm text-gray-500 mt-5 pt-4 border-t border-gray-100">
        Chưa có tài khoản?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-brand-primary font-semibold hover:text-brand-secondary hover:underline transition-colors"
        >
          Đăng ký ngay
        </button>
      </p>
    </div>
  );
}

/* ─── Main Login Page ─────────────────────────────────────────────────────── */
export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <>
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-primary to-brand-deep" />

        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-white/[0.03] -translate-y-1/2" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='white' stroke-width='0.8'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative w-full max-w-[460px]">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block group">
              <div className="flex items-center justify-center gap-3 mb-3">
                <img src={logoImg} alt="REVORA Logo" className="w-[52px] h-[52px] rounded-xl" />
                <div className="text-left">
                  <h1 className="text-4xl font-black text-white leading-none" style={{ fontFamily: 'Raleway, sans-serif', letterSpacing: '0.25em' }}>REVORA</h1>
                  <p className="text-white/55 text-[10px] tracking-[0.25em] uppercase mt-0.5">Revive Your Aura</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-1 mb-4 border border-white/20">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white text-brand-primary shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-white text-brand-primary shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Đăng Ký
            </button>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary" />

            {mode === 'login' ? (
              <LoginForm
                onSwitchToRegister={() => setMode('register')}
                onForgot={() => navigate('/forgot-password')}
              />
            ) : (
              <RegisterForm onSwitchToLogin={() => setMode('login')} />
            )}
          </div>

          <p className="text-center text-white/50 text-xs mt-6">
            &copy; 2025 REVORA. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </>
  );
}
