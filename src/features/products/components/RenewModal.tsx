import React, { useState, useEffect } from 'react';
import { X, Info, TrendingUp, Image, Sparkles, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { renewProductAPI } from '../services/productApi';
import { ProductResponseDto } from '../types';
import toast from 'react-hot-toast';

interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToRenew: ProductResponseDto | null;
  totalPostingPermanent: number;
  totalFeaturedPermanent: number;
  onRenewSuccess: () => void;
}

export default function RenewModal({
  isOpen,
  onClose,
  productToRenew,
  totalPostingPermanent,
  totalFeaturedPermanent,
  onRenewSuccess
}: RenewModalProps) {
  const [renewProductOption, setRenewProductOption] = useState(false);
  const [renewBannerOption, setRenewBannerOption] = useState(false);
  const [renewShortOption, setRenewShortOption] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [showRenewInfoModal, setShowRenewInfoModal] = useState(false);

  const isProductExpired = productToRenew?.productExpiredAt ? new Date(productToRenew.productExpiredAt + (productToRenew.productExpiredAt.endsWith('Z') ? '' : 'Z')).getTime() <= new Date().getTime() : false;

  useEffect(() => {
    if (isOpen && productToRenew) {
      setRenewProductOption(isProductExpired);
      setRenewBannerOption(false);
      setRenewShortOption(false);
    }
  }, [isOpen, productToRenew, isProductExpired]);

  useEffect(() => {
    if (!productToRenew) return;
    
    if (isProductExpired || renewShortOption) {
      setRenewProductOption(true);
    }
  }, [renewShortOption, productToRenew, isProductExpired]);

  const confirmRenew = async () => {
    if (!productToRenew) return;
    if (!renewProductOption && !renewBannerOption && !renewShortOption) {
      toast.error('Vui lòng chọn ít nhất một dịch vụ để gia hạn.');
      return;
    }
    
    setIsRenewing(true);
    const toastId = toast.loading('Đang xử lý gia hạn...');
    try {
      const res = await renewProductAPI(productToRenew.productId, {
        renewProduct: renewProductOption,
        renewBanner: renewBannerOption,
        renewShort: renewShortOption,
        newBannerUrl: undefined
      });
      if (res.success) {
        toast.success('Gia hạn thành công!', { id: toastId });
        onRenewSuccess();
        onClose();
        window.dispatchEvent(new Event('revora_credit_updated'));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gia hạn.', { id: toastId });
    } finally {
      setIsRenewing(false);
    }
  };

  if (!isOpen || !productToRenew) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => !isRenewing && onClose()}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl my-8"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-gray-900">Gia Hạn Dịch Vụ</h2>
                  <button onClick={() => setShowRenewInfoModal(true)} className="text-blue-500 hover:text-blue-600 transition-colors p-1">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
                <button onClick={() => !isRenewing && onClose()} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4">
                <div className="flex-1">
                  <span className="text-xs text-blue-700 font-semibold block">Credit Đăng Tin vĩnh viễn</span>
                  <span className="text-lg font-bold text-blue-800">{totalPostingPermanent}</span>
                </div>
                <div className="flex-1 border-l border-blue-200 pl-4">
                  <span className="text-xs text-blue-700 font-semibold block">Credit Nổi Bật vĩnh viễn</span>
                  <span className="text-lg font-bold text-blue-800">{totalFeaturedPermanent}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột 1: Lựa chọn dịch vụ */}
                <div className="flex flex-col">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm đang chọn</label>
                    <input type="text" value={productToRenew.title} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 font-medium" />
                  </div>

                  <div className="space-y-4">
                    {/* Renew Product */}
                    <label className={`flex items-start space-x-3 p-3 border rounded-xl transition-colors ${(isRenewing || isProductExpired || renewShortOption) ? 'opacity-70 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'}`}>
                      <input type="checkbox" checked={renewProductOption} onChange={(e) => setRenewProductOption(e.target.checked)} className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300" disabled={isRenewing || isProductExpired || renewShortOption} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="block text-sm font-semibold text-gray-900">Gia hạn Sản Phẩm</span>
                          {isProductExpired && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Đã hết hạn</span>}
                        </div>
                        <span className="block text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Image className="w-3.5 h-3.5 text-blue-500" /> Tốn 1 Credit Đăng Tin vĩnh viễn</span>
                      </div>
                    </label>

                {/* Renew Banner */}
                {!!productToRenew.bannerExpiredAt && (
                  <label className="flex items-start space-x-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="checkbox" checked={renewBannerOption} onChange={(e) => setRenewBannerOption(e.target.checked)} className="mt-1 w-4 h-4 text-orange-500 rounded border-gray-300" disabled={isRenewing} />
                    <div>
                      <span className="block text-sm font-semibold text-gray-900">Gia hạn Banner (+24h)</span>
                      <span className="block text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-orange-500" /> Tốn 1 Credit Nổi Bật vĩnh viễn</span>
                    </div>
                  </label>
                )}

                {/* Renew Short */}
                {!!productToRenew.shortExpiredAt && (
                  <label className="flex items-start space-x-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" checked={renewShortOption} onChange={(e) => setRenewShortOption(e.target.checked)} className="mt-1 w-4 h-4 text-orange-500 rounded border-gray-300" disabled={isRenewing} />
                  <div>
                    <span className="block text-sm font-semibold text-gray-900">Gia hạn Short Video</span>
                    <span className="block text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-orange-500" /> Tốn 1 Credit Nổi Bật vĩnh viễn (Không hỗ trợ đổi Video)</span>
                  </div>
                  </label>
                )}
              </div>
            </div>

              {/* Cột 2: Tổng kết */}
              <div className="flex flex-col h-full">
                <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 h-full flex flex-col justify-center">
                  <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#2D5A3D]" />
                    Dự kiến sau khi gia hạn
                  </h3>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 mb-4">
                    <div className="flex justify-between items-center text-sm mb-3">
                      <span className="text-gray-600 flex items-center gap-1.5"><Image className="w-4 h-4 text-blue-500" /> Credit Đăng Tin:</span>
                      <span className={`font-bold text-base ${renewProductOption ? 'text-red-600' : 'text-gray-400'}`}>
                        {renewProductOption ? '-1' : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-orange-500" /> Credit Nổi Bật:</span>
                      <span className={`font-bold text-base ${(renewBannerOption || renewShortOption) ? 'text-red-600' : 'text-gray-400'}`}>
                        -{(renewBannerOption ? 1 : 0) + (renewShortOption ? 1 : 0)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-[#2D5A3D] font-medium bg-green-50/70 p-4 rounded-xl border border-green-100/50 flex-grow flex flex-col justify-center">
                    {(() => {
                      let productDays = 0;
                      let highlightDays = 0;
                      
                      if (renewShortOption) {
                        productDays = 60;
                        highlightDays = 60;
                      }
                      else if (renewProductOption && renewBannerOption) {
                        productDays = 60;
                        highlightDays = 60;
                      }
                      else if (renewProductOption) {
                        productDays = 30;
                      }
                      else if (renewBannerOption) {
                        productDays = 30;
                        highlightDays = 30;
                      }

                      const results = [];
                      if (productDays > 0) results.push(`+ ${productDays} ngày Sản Phẩm`);
                      if (renewShortOption) results.push(`+ 60 ngày Video Short`);
                      if (renewBannerOption) results.push(`+ 24 giờ Banner`);
                      if (highlightDays > 0) results.push(`+ ${highlightDays} ngày Viền Nổi Bật`);
                      
                      if (results.length === 0) return <span className="text-gray-500 font-normal italic text-center w-full block">Vui lòng chọn dịch vụ để xem trước.</span>;
                      return results.map((res, i) => <div key={i} className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-[#2D5A3D] flex-shrink-0" /><span>{res}</span></div>);
                    })()}
                  </div>
                </div>
              </div>
            </div>

              <div className="mt-6 flex space-x-3">
                <button onClick={() => onClose()} disabled={isRenewing} className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50">
                  Hủy
                </button>
                <button onClick={confirmRenew} disabled={isRenewing} className="flex-1 py-2.5 rounded-lg bg-[#2D5A3D] text-white font-semibold hover:bg-[#2D5A3D]/90 transition-colors disabled:opacity-50">
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRenewInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={() => setShowRenewInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Quy định gia hạn</h2>
                <button onClick={() => setShowRenewInfoModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>1. Các dịch vụ gia hạn <strong>chỉ trừ Credit vĩnh viễn</strong>, không sử dụng credit được tặng có thời hạn.</p>
                <p>2. Viền Nổi Bật luôn đồng bộ theo thời hạn dài nhất (của Sản Phẩm, Banner hoặc Video Short).</p>
                <p>3. Khi gia hạn <strong>Video Short</strong>, hệ thống tự động tặng kèm gia hạn Sản Phẩm (+60 ngày).</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
