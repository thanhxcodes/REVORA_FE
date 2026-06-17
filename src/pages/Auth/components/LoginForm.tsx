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
      const serverMessage = err.response?.data?.message;
      const errMsg = serverMessage || LOGIN_TXT.errorDefault;
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-8 pt-6 pb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{LOGIN_TXT.title}</h2>
      <p className="text-gray-500 text-sm mb-6">{LOGIN_TXT.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{LOGIN_TXT.emailLabel}</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="text"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder={LOGIN_TXT.emailPlaceholder}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
              required
              autoComplete={AUTO_COMPLETE_EMAIL}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">{LOGIN_TXT.passwordLabel}</label>
            <button
              type="button"
              onClick={onForgot}
              className="text-xs text-brand-primary hover:text-brand-secondary hover:underline transition-colors font-medium cursor-pointer"
            >
              {LOGIN_TXT.forgotPassword}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder={LOGIN_TXT.passwordPlaceholder}
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900"
              required
              autoComplete={AUTO_COMPLETE_PASSWORD}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <span className="text-red-400 flex-shrink-0">{WARNING_ICON}</span> {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-3.5 rounded-2xl hover:shadow-lg hover:shadow-brand-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none font-semibold mt-2 cursor-pointer"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>{LOGIN_TXT.submitBtn} <ArrowRight className="w-[18px] h-[18px]" /></>
          )}
        </button>
      </form>

      <GoogleLoginButton />

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
