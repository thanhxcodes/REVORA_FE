import { useState, useEffect } from 'react';
import { Lock, ArrowRight, Eye, EyeOff, User as UserIcon, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../../../providers/authProvider/AuthContext';
import { sendRegisterLinkAPI, checkRegisterStatusAPI } from '../../../providers/authProvider/authService';
import TermsModal from './TermsModal';
import PrivacyModal from './PrivacyModal';
import RegisterSuccessModal from './RegisterSuccessModal';
import { REGISTER_TXT } from '../constants/register';
import GoogleLoginButton from './GoogleLoginButton';

const WARNING_ICON = '⚠';
const AT_SYMBOL = '@';
const INPUT_TYPE_TEXT = 'text';
const INPUT_TYPE_PASSWORD = 'password';
const AUTO_COMPLETE_NAME = 'name';
const AUTO_COMPLETE_USERNAME = 'username';
const AUTO_COMPLETE_EMAIL = 'email';
const AUTO_COMPLETE_NEW_PASSWORD = 'new-password';

const VIETNAM_CITIES = [
  "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", 
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", 
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", 
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", 
  "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", 
  "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình", 
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", 
  "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", 
  "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", 
  "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", 
  "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", 
  "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", 
  "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 fields
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [city, setCity] = useState('');
  const [isWaitingForVerification, setIsWaitingForVerification] = useState(false);

  // Step 2 fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
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

  const { register } = useAuth();

  useEffect(() => {
    let pollingInterval: any;
    if (isWaitingForVerification) {
      pollingInterval = setInterval(async () => {
        try {
          const res = await checkRegisterStatusAPI(email.trim().toLowerCase());
          if (res.data && res.data.verified) {
            clearInterval(pollingInterval);
            setIsWaitingForVerification(false);
            setStep(2);
            setError('');
          }
        } catch (err) {
          // Ignore errors during polling, might just be network hiccups
        }
      }, 3000);
    }
    return () => clearInterval(pollingInterval);
  }, [isWaitingForVerification, email]);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(REGISTER_TXT.validation.emailInvalid);
      return;
    }
    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setError('Email nhập lại không khớp.');
      return;
    }
    if (!city) {
      setError('Vui lòng chọn Tỉnh/Thành phố.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await sendRegisterLinkAPI(email.trim().toLowerCase());
      setIsWaitingForVerification(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Lỗi khi gửi link xác thực. Vui lòng thử lại.');
      setIsWaitingForVerification(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep2 = (): string | null => {
    if (!fullName.trim()) return REGISTER_TXT.validation.fullNameRequired;
    if (!username.trim()) return REGISTER_TXT.validation.usernameRequired;
    if (username.trim().length < 3) return REGISTER_TXT.validation.usernameMinLength;
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return REGISTER_TXT.validation.usernamePattern;
    if (password.length < 6) return REGISTER_TXT.validation.passwordMinLength;
    if (password !== confirmPassword) return REGISTER_TXT.validation.confirmPasswordMismatch;
    if (!agree) return REGISTER_TXT.validation.agreeTermsRequired;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateStep2();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    try {
      await register({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        city: city,
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Đăng ký thất bại:', err);
      const serverMessage = err.response?.data?.message || err.response?.data?.detail;
      setError(serverMessage || REGISTER_TXT.errorDefault);
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
      <p className="text-gray-500 text-sm mb-6">
        {step === 1 ? 'Bước 1: Xác thực Email' : 'Bước 2: Thông tin tài khoản'}
      </p>

      {step === 1 ? (
        <form onSubmit={handleSendLink} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{REGISTER_TXT.emailLabel}</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type={AUTO_COMPLETE_EMAIL}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); setIsWaitingForVerification(false); }}
                placeholder={REGISTER_TXT.emailPlaceholder}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
                disabled={isWaitingForVerification}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nhập lại Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type={AUTO_COMPLETE_EMAIL}
                value={confirmEmail}
                onChange={(e) => { setConfirmEmail(e.target.value); setError(''); setIsWaitingForVerification(false); }}
                placeholder="Xác nhận lại email"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
                disabled={isWaitingForVerification}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tỉnh/Thành phố</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); setError(''); setIsWaitingForVerification(false); }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all text-gray-900 text-sm appearance-none"
                disabled={isWaitingForVerification}
              >
                <option value="" disabled>Chọn Tỉnh/Thành phố</option>
                {VIETNAM_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
              <span className="text-red-400 flex-shrink-0">{WARNING_ICON}</span> {error}
            </div>
          )}

          {isWaitingForVerification && !error && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-4 py-3 rounded-xl flex flex-col items-center justify-center gap-2 text-center animate-pulse">
              <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
              <span>
                Chúng tôi đã gửi một email xác thực đến <b>{email}</b>. 
                <br/>Vui lòng mở email và bấm vào link xác nhận. Hệ thống đang chờ...
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isWaitingForVerification}
            className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-3.5 rounded-2xl hover:shadow-lg hover:shadow-brand-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none font-semibold mt-1 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isWaitingForVerification ? (
              <>Đang chờ xác thực...</>
            ) : (
              <>Xác thực Email <ArrowRight className="w-[18px] h-[18px]" /></>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
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
              />
            </div>
          </div>

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
              />
            </div>
          </div>

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

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => { setAgree(e.target.checked); setError(''); }}
              className="sr-only"
            />
            <div
              className={`w-[18px] h-[18px] rounded-[6px] border-2 flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${
                agree ? 'bg-brand-primary border-brand-primary' : 'border-gray-300 bg-white group-hover:border-brand-primary/50'
              }`}
            >
              {agree && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-xs text-gray-500 leading-relaxed select-none">
              {REGISTER_TXT.agreeTerms}
              <span
                onClick={(e) => { e.stopPropagation(); setShowTerms(true); }}
                className="text-brand-primary font-semibold hover:underline cursor-pointer text-xs"
              >
                {REGISTER_TXT.termsOfUse}
              </span>
              {REGISTER_TXT.and}
              <span
                onClick={(e) => { e.stopPropagation(); setShowPrivacy(true); }}
                className="text-brand-primary font-semibold hover:underline cursor-pointer text-xs"
              >
                {REGISTER_TXT.privacyPolicy}
              </span>
              {REGISTER_TXT.ofRevora}
            </span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
              <span className="text-red-400 flex-shrink-0">{WARNING_ICON}</span> {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => { setStep(1); setError(''); setIsWaitingForVerification(false); }}
            className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2.5 font-semibold mt-1 cursor-pointer"
          >
            Quay lại
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-3.5 rounded-2xl hover:shadow-lg hover:shadow-brand-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none font-semibold mt-2 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>{REGISTER_TXT.submitBtn} <ArrowRight className="w-[18px] h-[18px]" /></>
            )}
          </button>
        </form>
      )}

      {step === 1 && <GoogleLoginButton />}

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

      {/* Terms Modal */}
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      {/* Privacy Modal */}
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
}
