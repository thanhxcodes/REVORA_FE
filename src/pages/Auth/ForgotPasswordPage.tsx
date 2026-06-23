import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import logoImg from '../../assets/images/logo.jpg';

import { sendResetPasswordOtpAPI, verifyResetPasswordOtpAPI, resetPasswordWithOtpAPI } from '../../providers/authProvider/authService';

type Step = 'email' | 'otp' | 'newPassword' | 'success';

const DECORATIVE_PATTERN_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='white' stroke-width='0.8'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E")`,
};

const BRAND_STYLE: React.CSSProperties = {
  fontFamily: 'Raleway, sans-serif',
  letterSpacing: '0.25em',
};

const FLOATING_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop', top: '10%', left: '8%', width: '180px', delay: 0, rotate: -6 },
  { url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop', top: '65%', left: '12%', width: '150px', delay: 1.5, rotate: 4 },
  { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&auto=format&fit=crop', top: '15%', right: '10%', width: '160px', delay: 0.5, rotate: 8 },
  { url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=400&auto=format&fit=crop', top: '55%', right: '6%', width: '200px', delay: 2, rotate: -5 },
  { url: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop', bottom: '-5%', left: '30%', width: '220px', delay: 1, rotate: 12 },
  { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=400&auto=format&fit=crop', top: '5%', right: '35%', width: '180px', delay: 2.5, rotate: -10 },
];

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendResetPasswordOtpAPI(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Vui lòng nhập đầy đủ mã OTP');
      setLoading(false);
      return;
    }

    try {
      await verifyResetPasswordOtpAPI(email, otpValue);
      setStep('newPassword');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp');
      return;
    }

    setLoading(true);

    try {
      const otpValue = otp.join('');
      await resetPasswordWithOtpAPI(email, otpValue, newPassword);
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await sendResetPasswordOtpAPI(email);
      setSuccessMsg('Mã OTP mới đã được gửi thành công!');
      setTimeout(() => setSuccessMsg(''), 5000); // Tự động ẩn sau 5 giây
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) * 0.03,
        y: (e.clientY - window.innerHeight / 2) * 0.03,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-brand-dark">
      {/* Nền chuyển sắc trang trí (Animated) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-gradient-to-br from-[#122a1f] via-[#20422c] to-[#0a1a10]" 
      />

      {/* Lớp Parallax chứa các họa tiết trôi nổi và hình ảnh */}
      <motion.div 
        animate={{ x: -mousePos.x, y: -mousePos.y }}
        transition={{ type: "spring", stiffness: 50, damping: 20, mass: 0.5 }}
        className="absolute inset-0 pointer-events-none z-0"
      >
        {/* Vòng tròn họa tiết trang trí trôi nổi */}
        <div className="absolute inset-0 overflow-hidden opacity-80">
          <motion.div 
            animate={{ y: [0, -30, 0], rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" 
          />
          <motion.div 
            animate={{ y: [0, 40, 0], x: [0, -30, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl" 
          />
          <motion.div 
            animate={{ y: ['-50%', '-40%', '-50%'], x: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 left-1/4 w-[30rem] h-[30rem] rounded-full bg-white/[0.02] blur-2xl" 
          />
          <div className="absolute inset-0 opacity-[0.04]" style={DECORATIVE_PATTERN_STYLE} />
        </div>

        {/* Các hình ảnh thời trang trôi nổi */}
        {FLOATING_IMAGES.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.45, scale: 1, y: [0, -20, 0] }}
            transition={{
              opacity: { duration: 1.5, delay: img.delay * 0.3 },
              scale: { duration: 1.5, delay: img.delay * 0.3 },
              y: { duration: 7 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: img.delay }
            }}
            style={{
              position: 'absolute',
              top: img.top,
              left: img.left,
              right: img.right,
              bottom: img.bottom,
              width: img.width,
              rotate: img.rotate,
            }}
            className="rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/10"
          >
            {/* Lớp phủ màu xanh lá để blend hình ảnh vào nền */}
            <div className="absolute inset-0 bg-emerald-900/30 mix-blend-overlay z-10" />
            <img 
              src={img.url} 
              alt="Fashion Inspiration" 
              className="w-full h-auto object-cover filter grayscale-[30%] contrast-125 brightness-90"
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-[460px] z-10"
      >
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block group">
            <div className="flex items-center justify-center gap-3 mb-3">
              <motion.img 
                whileHover={{ rotate: 10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                src={logoImg} 
                alt="REVORA Logo" 
                className="w-[52px] h-[52px] rounded-full object-cover shadow-lg border-2 border-white/20" 
              />
              <div className="text-left">
                <h1 className="text-4xl font-black text-white leading-none drop-shadow-md" style={BRAND_STYLE}>
                  REVORA
                </h1>
                <p className="text-white/70 text-[10px] tracking-[0.25em] uppercase mt-1 font-semibold">
                  Revive Your Aura
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/40">
          <div className="h-1.5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#2D5A3D] rounded-full flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {step === 'email' && 'Quên Mật Khẩu'}
                    {step === 'otp' && 'Xác Thực OTP'}
                    {step === 'newPassword' && 'Đặt Mật Khẩu Mới'}
                    {step === 'success' && 'Thành Công'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {step === 'email' && 'Nhập email để nhận mã xác thực'}
                    {step === 'otp' && 'Nhập mã OTP đã gửi đến email'}
                    {step === 'newPassword' && 'Tạo mật khẩu mới cho tài khoản'}
                    {step === 'success' && 'Mật khẩu đã được thay đổi'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Step 1: Email */}
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email đăng ký
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Vui lòng nhập email bạn đã đăng ký để nhận mã xác thực OTP.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Tiếp Tục'}
                </button>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Mã OTP đã được gửi đến email <span className="font-semibold text-[#2D5A3D]">{email}</span>
                  </p>
                  <p className="text-[13px] text-amber-700 bg-amber-50 px-3.5 py-3 rounded-xl mb-5 border border-amber-200 flex gap-2 items-start shadow-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-80" />
                    <span>Lưu ý: Nếu không thấy email trong Hộp thư đến, vui lòng kiểm tra cả mục <b>Thư rác (Spam)</b> hoặc đợi vài phút.</span>
                  </p>

                  {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2 mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-emerald-700 font-medium">{successMsg}</span>
                    </div>
                  )}

                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] focus:border-transparent transition-all"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    💡 Demo: Nhập mã OTP <span className="font-semibold text-[#2D5A3D]">123456</span>
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xác thực...' : 'Xác Thực'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-[#2D5A3D] hover:underline font-medium"
                  >
                    Gửi lại mã OTP
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 'newPassword' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      required
                      className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full py-3 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang cập nhật...' : 'Đặt Lại Mật Khẩu'}
                </button>
              </form>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Đặt Lại Mật Khẩu Thành Công!
                </h3>
                <p className="text-gray-600 mb-8">
                  Mật khẩu của bạn đã được thay đổi. Bạn có thể đăng nhập bằng mật khẩu mới.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Đăng Nhập Ngay
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {step !== 'success' && (
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-[#2D5A3D] transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại Đăng nhập</span>
              </Link>
            </div>
          )}
        </div>

        {/* Helper text */}
        {step === 'email' && (
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              Bạn sẽ nhận được email chứa mã OTP để xác thực và đặt lại mật khẩu
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
