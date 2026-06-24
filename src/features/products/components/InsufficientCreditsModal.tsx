import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, X, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'posting' | 'featured';
}

export default function InsufficientCreditsModal({ isOpen, onClose, type }: InsufficientCreditsModalProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
          >
            {/* Nút đóng */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/50 hover:bg-gray-200 text-gray-500 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header với Gradient */}
            <div className="relative pt-10 pb-6 px-6 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-rose-50" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-200/40 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-200/40 rounded-full blur-3xl" />
              
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="relative w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 p-0.5 shadow-lg shadow-orange-500/30 rotate-3"
              >
                <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center -rotate-3 transition-transform hover:rotate-0">
                  {type === 'posting' ? (
                    <CreditCard className="w-10 h-10 text-orange-500" />
                  ) : (
                    <Sparkles className="w-10 h-10 text-rose-500" />
                  )}
                </div>
              </motion.div>
              
              <h3 className="relative text-2xl font-black text-gray-900 mb-2 tracking-tight">
                Oops! Đã hết Credit
              </h3>
              <p className="relative text-gray-600 text-sm leading-relaxed px-2">
                {type === 'posting' 
                  ? 'Bạn đã sử dụng hết Credit Đăng Tin. Hãy nạp thêm để tiếp tục đưa sản phẩm của bạn đến với khách hàng nhé!'
                  : 'Gói Credit Nổi Bật của bạn không đủ để dùng các tính năng VIP. Nâng cấp ngay để đột phá doanh số!'}
              </p>
            </div>

            {/* Nút Action */}
            <div className="p-6 pt-2 bg-white flex flex-col gap-3">
              <button
                onClick={() => navigate('/plans')}
                className="group relative w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm overflow-hidden shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative">Xem Ưu Đãi Nạp Credit</span>
                <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-gray-500 font-medium text-sm hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Để sau
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
