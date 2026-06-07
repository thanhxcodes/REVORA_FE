import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPaymentStatusAPI, cancelPaymentAPI } from '../paymentApi';
import { PaymentStatus, PaymentStatusResponse } from '../payment';

export type UIState = 
  | 'resolving' 
  | 'polling' 
  | 'success' 
  | 'failed' 
  | 'expired' 
  | 'cancelled' 
  | 'system_error' 
  | 'timeout' 
  | 'not_found';

export const usePaymentPolling = () => {
  const [searchParams] = useSearchParams();
  const [uiState, setUiState] = useState<UIState>('resolving');
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentStatusResponse | null>(null);
  const [progress, setProgress] = useState(0);

  // Các tham số cấu hình Polling
  const INTERVAL_MS = 3000; // Khoảng cách giữa các lần đệ quy (3 giây)
  const MAX_TIMEOUT_MS = 180000; // Timeout tổng (180 giây)
  const MAX_FAILURES = 3; // Giới hạn lỗi liên tiếp

  // Sử dụng useRef để tracking trạng thái bên trong đệ quy mà không gây re-render
  const consecutiveErrorsRef = useRef(0);
  const elapsedTimeRef = useRef(0);
  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // ---------------------------------------------------------------------------
  // EFFECT 1: ORDER RESOLUTION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    isMountedRef.current = true;
    
    // Ưu tiên 1: Lấy `revoraOrder` từ Query String
    let code = searchParams.get('revoraOrder');
    
    // Ưu tiên 2: Fallback về `sessionStorage`
    if (!code) {
      code = sessionStorage.getItem('lastOrderCode');
    }

    if (!code) {
      setUiState('not_found');
      return;
    }

    const isCancelled = searchParams.get('cancel') === 'true' || searchParams.get('status') === 'CANCELLED';
    setOrderCode(code);
    
    if (isCancelled) {
      setUiState('cancelled');
      if (code) {
        cancelPaymentAPI(code).catch((err) => console.error("Failed to cancel order:", err));
      }
    } else {
      setUiState('polling'); // Kích hoạt Effect 2
    }

    return () => {
      isMountedRef.current = false;
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
    };
  }, [searchParams]);

  // ---------------------------------------------------------------------------
  // EFFECT 2: RECURSIVE POLLING LOGIC
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (uiState !== 'polling' || !orderCode) return;

    // Reset bộ đếm khi bắt đầu phiên Polling mới
    consecutiveErrorsRef.current = 0;
    elapsedTimeRef.current = 0;
    setProgress(0);

    const pollStatus = async () => {
      // 1. Kiểm tra Component còn mount hay không trước khi thực thi
      if (!isMountedRef.current) return;

      // 2. Kiểm tra Timeout
      if (elapsedTimeRef.current >= MAX_TIMEOUT_MS) {
        setUiState('timeout');
        return;
      }

      // 3. Tiến hành gọi API
      try {
        const response = await getPaymentStatusAPI(orderCode);
        
        // Ngắt nếu component đã unmount trong lúc đang await API
        if (!isMountedRef.current) return;

        if (response.success && response.data) {
          consecutiveErrorsRef.current = 0; // Reset lỗi vì đã kết nối thành công

          switch (response.data.paymentStatus) {
            case PaymentStatus.Pending:
              // Tính toán thời gian đã trôi qua và cập nhật Progress Bar
              elapsedTimeRef.current += INTERVAL_MS;
              setProgress(Math.min((elapsedTimeRef.current / MAX_TIMEOUT_MS) * 100, 100));
              
              // Gọi đệ quy setTimeout: Chỉ chạy tiếp SAU KHI API đã phản hồi xong
              timerIdRef.current = setTimeout(pollStatus, INTERVAL_MS);
              break;
              
            case PaymentStatus.Successful:
              setPaymentData(response.data);
              setUiState('success');
              break;
              
            case PaymentStatus.Failed:
              setPaymentData(response.data);
              setUiState('failed');
              break;
              
            case PaymentStatus.Expired:
              setPaymentData(response.data);
              setUiState('expired');
              break;
              
            case PaymentStatus.Cancelled:
              setPaymentData(response.data);
              setUiState('cancelled');
              break;
              
            default:
              timerIdRef.current = setTimeout(pollStatus, INTERVAL_MS);
              break;
          }
        } else {
          // Xử lý như một lỗi Network/500 nếu response format sai
          throw new Error('API returned unsuccessful response');
        }
      } catch (error) {
        // Ngắt nếu unmount trong lúc await lỗi
        if (!isMountedRef.current) return;

        consecutiveErrorsRef.current += 1;
        console.error(`Polling error (${consecutiveErrorsRef.current}/${MAX_FAILURES}):`, error);

        if (consecutiveErrorsRef.current >= MAX_FAILURES) {
          setUiState('system_error');
        } else {
          // Vẫn chờ 3 giây rồi mới thử lại để tránh spam server đang bị lỗi
          timerIdRef.current = setTimeout(pollStatus, INTERVAL_MS);
        }
      }
    };

    // Kích hoạt ngay lần gọi đầu tiên
    pollStatus();

    // Hàm dọn dẹp (Cleanup Function) để ngắt Timeout nếu component unmount giữa chừng
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
    };
  }, [uiState, orderCode]);

  return {
    uiState,
    orderCode,
    paymentData,
    progress,
    isResolving: uiState === 'resolving',
    isPolling: uiState === 'polling',
    isFinished: ['success', 'failed', 'expired', 'cancelled', 'timeout', 'system_error', 'not_found'].includes(uiState)
  };
};
