import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentPolling, UIState } from '../../features/payment/hooks/usePaymentPolling';
import type { PaymentStatusResponse } from '../../features/payment/payment';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Loader2 
} from 'lucide-react';

// ============================================================================
// MAIN COMPONENT: PAYMENT RESULT PAGE
// ============================================================================
export default function PaymentResultPage() {
  const { uiState, orderCode, paymentData, progress } = usePaymentPolling();

  // Hàm Mapping Strategy: Tránh if/else lồng nhau bằng switch-case sạch sẽ
  const renderState = () => {
    switch (uiState) {
      case 'resolving':
        return <StateResolving />;
      case 'polling':
        return <StatePolling progress={progress} />;
      case 'success':
        return <StateSuccess data={paymentData} />;
      case 'failed':
      case 'cancelled':
      case 'expired':
        return <StateError type={uiState} data={paymentData} />;
      case 'system_error':
      case 'timeout':
        return <StateInterrupted type={uiState} orderCode={orderCode} />;
      case 'not_found':
      default:
        return <StateNotFound />;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50/50 p-4">
      {/* Wrapper duy nhất giúp chống Cumulative Layout Shift (CLS) */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center transition-all duration-300">
        {renderState()}
      </div>
    </div>
  );
}

// ============================================================================
// LOCAL SUB-COMPONENTS (Dumb Components)
// ============================================================================

// 1. State: Resolving (Khởi tạo, đang tìm mã đơn)
const StateResolving = () => (
  <div className="flex flex-col items-center justify-center py-8">
    <Loader2 className="w-12 h-12 text-gray-300 animate-spin mb-6" />
    <h2 className="text-xl font-semibold text-gray-800">Đang khởi tạo...</h2>
    <p className="text-gray-500 mt-2">Vui lòng đợi trong giây lát.</p>
  </div>
);

// 2. State: Polling (Đang chờ thanh toán với thanh Progress Bar)
const StatePolling = ({ progress }: { progress: number }) => (
  <div className="flex flex-col items-center justify-center py-6">
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
      <div className="relative bg-white rounded-full p-4 shadow-sm border border-blue-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    </div>
    <h2 className="text-xl font-semibold text-gray-800">Đang chờ xác nhận thanh toán</h2>
    <p className="text-gray-500 mt-2 text-sm leading-relaxed px-4">
      Hệ thống đang xử lý giao dịch. Quá trình này có thể mất vài phút. Vui lòng không đóng trang này.
    </p>
    
    {/* Progress Bar 180s */}
    <div className="w-full bg-gray-100 rounded-full h-2 mt-8 overflow-hidden">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

// 3. State: Success (Thanh toán thành công)
const StateSuccess = ({ data }: { data: PaymentStatusResponse | null }) => {
  const navigate = useNavigate();
  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="flex flex-col items-center py-4">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
      <p className="text-gray-500 mb-8">Cảm ơn bạn đã nâng cấp dịch vụ.</p>

      {data && (
        <div className="w-full bg-gray-50 rounded-2xl p-4 mb-8 text-left space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Gói dịch vụ</span>
            <span className="font-semibold text-gray-900">{data.packageName || 'Gói Credit'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Số tiền</span>
            <span className="font-bold text-blue-600 text-lg">{formatCurrency(data.amount)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-gray-500 text-sm">Mã đơn</span>
            <span className="text-gray-900 text-sm font-mono">{data.orderCode}</span>
          </div>
        </div>
      )}

      <div className="w-full space-y-3">
        <button 
          onClick={() => navigate('/plans?tab=history')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Đăng tin ngay
        </button>
        <button 
          onClick={() => navigate('/')}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl border border-gray-200 transition-colors"
        >
          Trở về trang chủ
        </button>
      </div>
    </div>
  );
};

// 4. State: Error (Dùng chung cho Failed, Cancelled, Expired)
const StateError = ({ type, data }: { type: 'failed' | 'cancelled' | 'expired'; data: PaymentStatusResponse | null }) => {
  const navigate = useNavigate();
  
  const getErrorContent = () => {
    switch (type) {
      case 'expired': return { title: 'Đơn hàng quá hạn', desc: 'Đã quá thời gian thanh toán cho phép (15 phút).' };
      case 'cancelled': return { title: 'Đã hủy giao dịch', desc: 'Giao dịch đã bị hủy bỏ theo yêu cầu.' };
      case 'failed': default: return { title: 'Giao dịch thất bại', desc: 'Có lỗi xảy ra trong quá trình thanh toán hoặc số tiền chuyển không chính xác.' };
    }
  };

  const { title, desc } = getErrorContent();

  return (
    <div className="flex flex-col items-center py-4">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <XCircle className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 mb-8 px-4">{desc}</p>

      {data && (
        <div className="w-full bg-gray-50 rounded-2xl p-4 mb-8 text-left">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Mã đơn</span>
            <span className="text-gray-900 text-sm font-mono">{data.orderCode}</span>
          </div>
        </div>
      )}

      <button 
        onClick={() => navigate('/plans')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
};

// 5. State: Interrupted (Lỗi hệ thống hoặc quá thời gian Polling)
const StateInterrupted = ({ type, orderCode }: { type: 'system_error' | 'timeout'; orderCode: string | null }) => {
  const navigate = useNavigate();
  const isTimeout = type === 'timeout';

  return (
    <div className="flex flex-col items-center py-4">
      <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {isTimeout ? 'Quá thời gian chờ' : 'Gián đoạn kết nối'}
      </h2>
      <p className="text-gray-500 mb-8 px-2 text-sm leading-relaxed">
        {isTimeout 
          ? 'Hệ thống chưa nhận được phản hồi từ ngân hàng. Tuy nhiên, nếu bạn đã chuyển khoản thành công, vui lòng không thanh toán lại.' 
          : 'Hệ thống đang gặp sự cố kết nối tạm thời. Vui lòng kiểm tra trạng thái giao dịch trong phần Lịch sử.'}
      </p>

      {orderCode && (
        <div className="w-full bg-amber-50/50 rounded-2xl p-4 mb-8 border border-amber-100 text-left">
          <p className="text-amber-800 text-sm mb-1">Mã tra cứu của bạn:</p>
          <p className="font-mono text-lg font-bold text-amber-900">{orderCode}</p>
        </div>
      )}

      <div className="w-full space-y-3">
        <button 
          onClick={() => navigate('/plans?tab=history')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Kiểm tra lịch sử
        </button>
        <button 
          onClick={() => navigate('/')}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl border border-gray-200 transition-colors"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
};

// 6. State: Not Found (Không tìm thấy mã đơn)
const StateNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center py-8">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <Search className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy giao dịch</h2>
      <p className="text-gray-500 mb-8">Phiên thanh toán đã hết hạn hoặc mã giao dịch không hợp lệ.</p>

      <button 
        onClick={() => navigate('/plans')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
      >
        Về trang Gói Credit
      </button>
    </div>
  );
};
