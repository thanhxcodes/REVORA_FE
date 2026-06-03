import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import logoImg from '../../assets/images/logo1.jpg';

type Step = 'email' | 'otp' | 'newPassword' | 'success';

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
  const [loading, setLoading] = useState(false);

  // Mock registered email for demo
  const REGISTERED_EMAIL = 'minhanh@gmail.com';

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email.toLowerCase() === REGISTERED_EMAIL.toLowerCase()) {
        setStep('otp');
        setLoading(false);
      } else {
        setError('Email không tồn tại trong hệ thống');
        setLoading(false);
      }
    }, 1000);
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

    // Simulate API call - mock OTP is "123456"
    setTimeout(() => {
      if (otpValue === '123456') {
        setStep('newPassword');
        setLoading(false);
      } else {
        setError('Mã OTP không đúng. Vui lòng thử lại');
        setLoading(false);
      }
    }, 1000);
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

    // Simulate API call
    setTimeout(() => {
      setStep('success');
      setLoading(false);
    }, 1000);
  };

  const handleResendOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    // In real app, this would trigger OTP resend API
    alert('Mã OTP mới đã được gửi đến email của bạn!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D5A3D] via-[#3D7054] to-[#2D5A3D] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <img src={logoImg} alt="REVORA Logo" className="w-16 h-16 rounded-2xl shadow-lg" />
          </Link>
          <h1 className="text-white text-3xl font-bold tracking-widest" style={{ fontFamily: 'Raleway, sans-serif', letterSpacing: '0.22em' }}>
            REVORA
          </h1>
          <p className="text-white/70 text-xs tracking-[0.18em] uppercase mt-1">Revive Your Aura</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
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
                    💡 Demo: Sử dụng email <span className="font-semibold text-[#2D5A3D]">{REGISTERED_EMAIL}</span>
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
                  <p className="text-sm text-gray-600 mb-4">
                    Mã OTP đã được gửi đến email <span className="font-semibold text-[#2D5A3D]">{email}</span>
                  </p>
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
      </div>
    </div>
  );
}
