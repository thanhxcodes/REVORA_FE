import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { Mail, ChevronLeft, ArrowRight, CheckCircle } from 'lucide-react';

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Giả lập thời gian gửi mail reset mật khẩu
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="md" closeButtonTheme="light">
      {/* Header Modal */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-8 py-6 flex items-center gap-3">
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors focus:outline-none">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-white text-lg font-semibold">Quên Mật Khẩu</h2>
      </div>

      {/* Body Modal */}
      <div className="p-8">
        {!sent ? (
          <>
            <div className="mb-6 text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-brand-primary" />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Nhập địa chỉ email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
              </p>
            </div>
            <form onSubmit={handleSend} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-3.5 rounded-full hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Gửi Link Đặt Lại Mật Khẩu <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Email Đã Được Gửi!</h3>
            <p className="text-gray-500 text-sm mb-2">
              Chúng tôi đã gửi link đặt lại mật khẩu đến
            </p>
            <p className="text-brand-primary font-semibold text-sm mb-6">{email}</p>
            <p className="text-xs text-gray-400 mb-6">
              Không thấy email? Kiểm tra thư mục spam hoặc thử lại sau 60 giây.
            </p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-8 py-3 rounded-full hover:shadow-lg transition-all font-medium"
            >
              Về Trang Đăng Nhập
            </button>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
