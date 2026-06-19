import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../providers/authProvider/AuthContext';
import { authClient } from '../../providers/authProvider/authService';
import toast from 'react-hot-toast';

export default function FeedbackPage() {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      toast.error('Vui lòng điền đầy đủ email và nội dung góp ý.');
      return;
    }

    setIsSubmitting(true);
    try {
      // POST to /Feedback
      await authClient.post('/Feedback', {
        email: email.trim(),
        message: message.trim(),
      });
      setIsSuccess(true);
      toast.success('Cảm ơn bạn đã đóng góp ý kiến!');
      setMessage('');
    } catch (error: any) {
      console.error('Lỗi khi gửi góp ý:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="h-2 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary" />
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Đóng Góp Ý Kiến</h1>
            <p className="text-gray-500 text-sm">
              Ý kiến của bạn giúp chúng tôi cải thiện REVORA ngày một tốt hơn. Cảm ơn bạn đã đồng hành cùng chúng tôi!
            </p>
          </div>

          {isSuccess ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gửi Thành Công!</h2>
              <p className="text-gray-500 mb-8">
                Chúng tôi đã ghi nhận đóng góp của bạn. Đội ngũ REVORA sẽ xem xét và phản hồi sớm nhất có thể.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="px-6 py-2.5 bg-brand-primary/10 text-brand-primary font-semibold rounded-xl hover:bg-brand-primary/20 transition-colors"
              >
                Gửi thêm ý kiến
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email của bạn
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ví dụ: user@gmail.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all"
                    required
                    readOnly={!!currentUser}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nội dung góp ý
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hãy chia sẻ suy nghĩ, trải nghiệm hoặc đề xuất của bạn về REVORA..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/25 focus:border-brand-primary/40 bg-gray-50 focus:bg-white transition-all min-h-[160px] resize-y"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-4 rounded-xl hover:shadow-lg hover:shadow-brand-primary/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-bold text-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Gửi Ý Kiến
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
