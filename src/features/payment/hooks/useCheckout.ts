import { useState } from 'react';
import { checkoutAPI, cancelPaymentAPI } from '../paymentApi';
import toast from 'react-hot-toast';

export const useCheckout = () => {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [loadingPackageId, setLoadingPackageId] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const initiateCheckout = async (packageId: number) => {
    if (isCheckoutLoading) return;
    
    setIsCheckoutLoading(true);
    setLoadingPackageId(packageId);
    setCheckoutError(null);

    try {
      const response = await checkoutAPI({ packageId });
      if (response.success && response.data) {
        sessionStorage.setItem("lastOrderCode", response.data.orderCode);
        
        // Delay 1.5s để UI Loading hiển thị rõ ràng trước khi văng sang PayOS
        setTimeout(() => {
          window.location.href = response.data.paymentUrl;
        }, 1500);
        // DO NOT set isCheckoutLoading to false here to prevent redirect glitch
      } else {
        const errMsg = response.message || 'Có lỗi xảy ra khi tạo thanh toán.';
        setCheckoutError(errMsg);
        toast.error(errMsg);
        setIsCheckoutLoading(false);
        setLoadingPackageId(null);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      const errMsg = error.response?.data?.message || 'Không thể kết nối đến máy chủ thanh toán. Vui lòng thử lại sau.';
      setCheckoutError(errMsg);
      toast.error(errMsg);
      setIsCheckoutLoading(false);
      setLoadingPackageId(null);
    }
  };

  const cancelOrder = async (orderCode: string): Promise<boolean> => {
    try {
      const response = await cancelPaymentAPI(orderCode);
      return response.success;
    } catch (error) {
      console.error('Cancel order error:', error);
      return false;
    }
  };

  return { initiateCheckout, isCheckoutLoading, loadingPackageId, checkoutError, cancelOrder };
};
