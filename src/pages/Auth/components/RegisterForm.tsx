import { useState } from 'react';
import { Lock, ArrowRight, Eye, EyeOff, User as UserIcon, Mail } from 'lucide-react';
import { useAuth } from '../../../providers/authProvider/AuthContext';
import TermsModal from './TermsModal';
import PrivacyModal from './PrivacyModal';
import RegisterSuccessModal from './RegisterSuccessModal';
import { REGISTER_TXT } from '../constants/register';

const WARNING_ICON = '⚠';
const AT_SYMBOL = '@';
const INPUT_TYPE_TEXT = 'text';
const INPUT_TYPE_PASSWORD = 'password';
const AUTO_COMPLETE_NAME = 'name';
const AUTO_COMPLETE_USERNAME = 'username';
const AUTO_COMPLETE_EMAIL = 'email';
const AUTO_COMPLETE_NEW_PASSWORD = 'new-password';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
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

  // Lấy hàm đăng ký từ AuthContext
  const { register } = useAuth();

  const validate = (): string | null => {
    if (!fullName.trim()) return REGISTER_TXT.validation.fullNameRequired;
    if (!username.trim()) return REGISTER_TXT.validation.usernameRequired;
    if (username.trim().length < 3) return REGISTER_TXT.validation.usernameMinLength;
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return REGISTER_TXT.validation.usernamePattern;
    
    // Kiểm tra định dạng Email chuẩn hóa
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return REGISTER_TXT.validation.emailInvalid;
    
    if (password.length < 6) return REGISTER_TXT.validation.passwordMinLength;
    if (password !== confirmPassword) return REGISTER_TXT.validation.confirmPasswordMismatch;
    if (!agree) return REGISTER_TXT.validation.agreeTermsRequired;
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Xác thực dữ liệu Client-side
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    setIsSubmitting(true);

    try {
      // 2. Gửi yêu cầu đăng ký lên Backend (chỉ đóng gói các thuộc tính thuộc RegisterDto)
      await register({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });

      // 3. Đăng ký thành công, hiển thị Modal thông báo
      setSuccess(true);
    } catch (err: any) {
      console.error('Đăng ký thất bại:', err);
      // 4. Trích xuất thông điệp lỗi động từ Backend
      const serverMessage = err.response?.data.detail;
      const errMsg = serverMessage || REGISTER_TXT.errorDefault;
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return <RegisterSuccessModal isOpen={success} name={fullName} onClose={onSwitchToLogin} />;
  }

  return (
    <div className="px-8 pt-6 pb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">{REGISTER_TXT.title}</h2>
      <p className="text-gray-500 text-sm mb-6">{REGISTER_TXT.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{REGISTER_TXT.fullNameLabel}</label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type={INPUT_TYPE_TEXT}
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setError(''); }}
              placeholder={REGISTER_TXT.fullNamePlaceholder}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
              autoComplete={AUTO_COMPLETE_NAME}
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{REGISTER_TXT.usernameLabel}</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">{AT_SYMBOL}</span>
            <input
              type={INPUT_TYPE_TEXT}
              value={username}
              onChange={(e) => { setUsername(e.target.value.toLowerCase()); setError(''); }}
              placeholder={REGISTER_TXT.usernamePlaceholder}
              className="w-full pl-8 pr-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
              autoComplete={AUTO_COMPLETE_USERNAME}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{REGISTER_TXT.emailLabel}</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type={AUTO_COMPLETE_EMAIL}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder={REGISTER_TXT.emailPlaceholder}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
              autoComplete={AUTO_COMPLETE_EMAIL}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{REGISTER_TXT.passwordLabel}</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type={showPassword ? INPUT_TYPE_TEXT : INPUT_TYPE_PASSWORD}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder={REGISTER_TXT.passwordPlaceholder}
              className="w-full pl-10 pr-9 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900 text-sm"
              autoComplete={AUTO_COMPLETE_NEW_PASSWORD}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{REGISTER_TXT.confirmPasswordLabel}</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type={showConfirm ? INPUT_TYPE_TEXT : INPUT_TYPE_PASSWORD}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
              placeholder={REGISTER_TXT.confirmPasswordPlaceholder}
              className={`w-full pl-10 pr-9 py-3 rounded-xl border focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-all text-gray-900 text-sm ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                  : confirmPassword && password === confirmPassword
                  ? 'border-green-300 focus:ring-green-200 focus:border-green-400'
                  : 'border-gray-200 focus:ring-brand-primary/25 focus:border-brand-primary/40'
              }`}
              autoComplete={AUTO_COMPLETE_NEW_PASSWORD}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password strength */}
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
              {password.length < 6 ? REGISTER_TXT.strengthShort : password.length < 10 ? REGISTER_TXT.strengthMedium : REGISTER_TXT.strengthStrong}
            </span>
          </div>
        )}

        {/* Agree to Terms */}
        <div className="flex items-start gap-2.5">
          <label className="relative mt-0.5 cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => { setAgree(e.target.checked); setError(''); }}
              className="sr-only"
            />
            <div
              className={`w-[18px] h-[18px] rounded-[6px] border-2 flex items-center justify-center transition-all ${
                agree ? 'bg-brand-primary border-brand-primary' : 'border-gray-300 bg-white group-hover:border-brand-primary/50'
              }`}
            >
              {agree && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </label>
          <span className="text-xs text-gray-500 leading-relaxed select-none">
            {REGISTER_TXT.agreeTerms}
            <span
              onClick={() => setShowTerms(true)}
              className="text-brand-primary font-semibold hover:underline cursor-pointer text-xs"
            >
              {REGISTER_TXT.termsOfUse}
            </span>
            {REGISTER_TXT.and}
            <span
              onClick={() => setShowPrivacy(true)}
              className="text-brand-primary font-semibold hover:underline cursor-pointer text-xs"
            >
              {REGISTER_TXT.privacyPolicy}
            </span>
            {REGISTER_TXT.ofRevora}
          </span>
        </div>

        {/* Terms Modal */}
        <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        {/* Privacy Modal */}
        <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
            <span className="text-red-400 flex-shrink-0">{WARNING_ICON}</span> {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-3.5 rounded-2xl hover:shadow-lg hover:shadow-brand-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none font-semibold mt-1 cursor-pointer"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>{REGISTER_TXT.submitBtn} <ArrowRight className="w-[18px] h-[18px]" /></>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <p className="text-center text-sm text-gray-500 mt-5">
        {REGISTER_TXT.haveAccount}
        <button
          onClick={onSwitchToLogin}
          className="text-brand-primary font-semibold hover:text-brand-secondary hover:underline transition-colors cursor-pointer"
        >
          {REGISTER_TXT.loginNow}
        </button>
      </p>
    </div>
  );
}
