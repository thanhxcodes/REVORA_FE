import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from '../../../providers/authProvider/AuthContext';
import { LOGIN_TXT } from '../constants/login';
import GoogleLoginButton from './GoogleLoginButton';

const WARNING_ICON = '⚠';
const AUTO_COMPLETE_EMAIL = 'email';
const AUTO_COMPLETE_PASSWORD = 'current-password';
const LOGIN_MODE = 'login';
const REGISTER_MODE = 'register';
const ADMIN_DASHBOARD = '/admin/dashboard';

export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User'
}

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgot: () => void;
}

export default function LoginForm({
  onSwitchToRegister,
  onForgot,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedAccount, setSuggestedAccount] = useState<{ fullName: string, avatarUrl: string, username: string } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const { login, currentUser } = useAuth();

  const [firstLogin, setFirstLogin] = useState(false);

  // Hiệu ứng lắng nghe sự thay đổi của currentUser để điều hướng phân quyền an toàn
  useEffect(() => {
    if (currentUser) {
      const from = (location.state as any)?.from?.pathname || '/';
      if (currentUser.role === UserRole.ADMIN) {
        navigate(from.startsWith('/admin') ? from : ADMIN_DASHBOARD, { replace: true });
      } else {
        navigate(from, { replace: true, state: { isFirstLogin: firstLogin } });
      }
    }
  }, [currentUser, navigate, location, firstLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Call Login API
      const result = await login({ email: email.trim(), password });
      if (result?.isFirstLogin) {
        setFirstLogin(true);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      // Extract error message from Backend
      const serverMessage = err.response?.data?.detail || err.response?.data?.message;
      const errMsg = serverMessage || LOGIN_TXT.errorDefault;
      setError(errMsg);

      const errorData = err.response?.data?.data;
      if (errorData && errorData.fullName) {
        setSuggestedAccount({
          fullName: errorData.fullName,
          avatarUrl: errorData.avatarUrl,
          username: errorData.username
        });
      } else {
        setSuggestedAccount(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-8 pt-6 pb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{LOGIN_TXT.title}</h2>
      <p className="text-gray-500 text-sm mb-6">{LOGIN_TXT.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {suggestedAccount && (
          <div className="flex items-center gap-3 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-xl mb-2 animate-fade-in">
            <img
              src={suggestedAccount.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + suggestedAccount.username}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
            />
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">Bạn muốn đăng nhập vào tài khoản này?</p>
              <p className="text-sm font-bold text-gray-900 leading-tight">
                {suggestedAccount.fullName} <span className="font-normal text-gray-500">(@{suggestedAccount.username})</span>
              </p>
            </div>
          </div>
        )}

        {/* Email */}
        <div className="group/input">
          <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within/input:text-emerald-600 transition-colors">{LOGIN_TXT.emailLabel}</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-emerald-500 transition-colors duration-300" />
            <input
              type="text"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); setSuggestedAccount(null); }}
              placeholder={LOGIN_TXT.emailPlaceholder}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-[3px] focus:ring-emerald-500/20 focus:border-emerald-500 bg-gray-50/50 hover:bg-gray-50 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
              required
              autoComplete={AUTO_COMPLETE_EMAIL}
              tabIndex={1}
            />
          </div>
        </div>

        {/* Password */}
        <div className="group/input">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-gray-700 group-focus-within/input:text-emerald-600 transition-colors">{LOGIN_TXT.passwordLabel}</label>
            <button
              type="button"
              onClick={onForgot}
              className="text-xs text-emerald-600 hover:text-emerald-500 hover:underline transition-colors font-semibold"
              tabIndex={3}
            >
              {LOGIN_TXT.forgotPassword}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-emerald-500 transition-colors duration-300" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder={LOGIN_TXT.passwordPlaceholder}
              className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-[3px] focus:ring-emerald-500/20 focus:border-emerald-500 bg-gray-50/50 hover:bg-gray-50 focus:bg-white transition-all duration-300 text-gray-900 font-medium tracking-wide"
              required
              autoComplete={AUTO_COMPLETE_PASSWORD}
              tabIndex={2}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors duration-300 bg-white rounded-full p-0.5"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50/80 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-shake">
            <span className="text-red-500 flex-shrink-0 font-bold">{WARNING_ICON}</span> <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="relative w-full overflow-hidden group bg-gradient-to-r from-[#2D5A3D] via-emerald-600 to-[#2D5A3D] bg-[length:200%_auto] text-white py-3.5 rounded-xl hover:shadow-[0_8px_20px_rgb(45,90,61,0.3)] hover:-translate-y-0.5 transition-all duration-500 flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none font-bold mt-4 text-[15px]"
          style={{ backgroundPosition: 'left center' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundPosition = 'right center')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundPosition = 'left center')}
          tabIndex={4}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="relative z-10 flex items-center gap-2">
              {LOGIN_TXT.submitBtn}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          )}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative flex items-center justify-center mb-6">
        </div>
        <GoogleLoginButton />
      </div>

      {/* Switch to Register */}
      <p className="text-center text-sm text-gray-500 mt-5 pt-4 border-t border-gray-100">
        {LOGIN_TXT.noAccount}
        <button
          onClick={onSwitchToRegister}
          className="text-brand-primary font-semibold hover:text-brand-secondary hover:underline transition-colors cursor-pointer"
        >
          {LOGIN_TXT.registerNow}
        </button>
      </p>
    </div>
  );
}
