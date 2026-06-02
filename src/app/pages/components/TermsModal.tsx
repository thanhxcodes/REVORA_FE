import BaseModal from './BaseModal';
import { FileText } from 'lucide-react';

export interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="3xl" closeButtonTheme="light">
      {/* Header Modal */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-8 py-6 flex items-center gap-3 flex-shrink-0">
        <FileText className="w-6 h-6 text-white" />
        <h2 className="text-white text-xl font-semibold flex-1 pr-8">Điều Khoản Sử Dụng</h2>
      </div>

      {/* Body Modal (Hỗ trợ cuộn tự động khi quá dài) */}
      <div className="p-8 overflow-y-auto flex-1">
        <div className="prose prose-sm max-w-none">
          <h3 className="text-lg font-bold text-gray-900 mb-4">1. Chấp Nhận Điều Khoản</h3>
          <p className="text-gray-600 mb-4">
            Bằng việc truy cập và sử dụng nền tảng REVORA, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sau đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">2. Mô Tả Dịch Vụ</h3>
          <p className="text-gray-600 mb-4">
            REVORA là nền tảng marketplace thời trang second-hand, cho phép người dùng đăng bán, mua sắm và trao đổi các sản phẩm thời trang đã qua sử dụng. Chúng tôi cung cấp:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Nền tảng đăng tin sản phẩm thời trang second-hand</li>
            <li>Tính năng video shorts theo phong cách TikTok</li>
            <li>Hệ thống credits để đăng tin và nổi bật sản phẩm</li>
            <li>Công cụ chat và liên hệ qua Zalo với người mua/bán</li>
            <li>Tính năng Revora Match để tìm outfit phù hợp</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">3. Tài Khoản Người Dùng</h3>
          <p className="text-gray-600 mb-4">
            Để sử dụng một số tính năng của REVORA, bạn cần tạo tài khoản. Bạn cam kết:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
            <li>Bảo mật thông tin tài khoản và mật khẩu của bạn</li>
            <li>Chịu trách nhiệm về mọi hoạt động diễn ra dưới tài khoản của bạn</li>
            <li>Thông báo ngay cho chúng tôi nếu phát hiện việc sử dụng trái phép</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">4. Quy Định Đăng Tin</h3>
          <p className="text-gray-600 mb-4">
            Khi đăng sản phẩm lên REVORA, người dùng cần tuân thủ:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Chỉ đăng sản phẩm thời trang hợp pháp, không vi phạm bản quyền</li>
            <li>Mô tả chính xác tình trạng sản phẩm (Như Mới, Tốt, Đã Sử Dụng...)</li>
            <li>Sử dụng hình ảnh thật của sản phẩm, không sao chép từ nguồn khác</li>
            <li>Không đăng các sản phẩm bị cấm theo quy định pháp luật</li>
            <li>Tuân thủ hệ thống credits khi đăng tin và nổi bật sản phẩm</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">5. Giao Dịch và Thanh Toán</h3>
          <p className="text-gray-600 mb-4">
            REVORA không trực tiếp xử lý giao dịch mua bán. Người mua và người bán tự thỏa thuận và giao dịch qua chat hoặc Zalo. Chúng tôi:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Không chịu trách nhiệm về chất lượng sản phẩm hoặc giao dịch</li>
            <li>Khuyến khích người dùng kiểm tra kỹ trước khi mua</li>
            <li>Cung cấp công cụ để báo cáo các giao dịch gian lận</li>
            <li>Có quyền xóa các tin đăng vi phạm quy định</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">6. Credits và Gói Dịch Vụ</h3>
          <p className="text-gray-600 mb-4">
            REVORA sử dụng hệ thống credits để người dùng đăng tin và nổi bật sản phẩm:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Credits có thời hạn sử dụng theo gói đã mua (1/7/30 ngày)</li>
            <li>Credits không thể hoàn lại hoặc chuyển đổi thành tiền mặt</li>
            <li>Mọi giao dịch mua credits đều được xử lý qua VNPay</li>
            <li>Credits sẽ hết hạn nếu không sử dụng trong thời gian quy định</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">7. Quyền Sở Hữu Trí Tuệ</h3>
          <p className="text-gray-600 mb-4">
            Tất cả nội dung trên REVORA, bao gồm logo, thiết kế, văn bản, đồ họa và phần mềm, đều thuộc quyền sở hữu của REVORA hoặc các bên cấp phép. Người dùng không được:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Sao chép, sửa đổi hoặc phân phối nội dung mà không có sự cho phép</li>
            <li>Sử dụng logo hoặc thương hiệu REVORA cho mục đích thương mại</li>
            <li>Thu thập dữ liệu từ nền tảng một cách tự động</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">8. Giới Hạn Trách Nhiệm</h3>
          <p className="text-gray-600 mb-4">
            REVORA không chịu trách nhiệm về:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Bất kỳ thiệt hại nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ</li>
            <li>Chất lượng, tính chính xác của sản phẩm được đăng bán</li>
            <li>Hành vi của người dùng khác trên nền tảng</li>
            <li>Mất mát dữ liệu hoặc gián đoạn dịch vụ</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">9. Thay Đổi Điều Khoản</h3>
          <p className="text-gray-600 mb-4">
            REVORA có quyền thay đổi các điều khoản này bất cứ lúc nào. Chúng tôi sẽ thông báo về các thay đổi quan trọng qua email hoặc thông báo trên nền tảng. Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">10. Liên Hệ</h3>
          <p className="text-gray-600 mb-4">
            Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi qua:
          </p>
          <ul className="list-none text-gray-600 mb-4 space-y-2">
            <li>📧 Email: support@revora.vn</li>
            <li>📞 Hotline: 1900 0000</li>
            <li>🏢 Địa chỉ: 123 Đường ABC, Quận 1, TP. HCM</li>
          </ul>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 italic">
              Điều khoản có hiệu lực từ ngày 01/01/2026
            </p>
          </div>
        </div>
      </div>

      {/* Footer Modal */}
      <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Đã Hiểu
        </button>
      </div>
    </BaseModal>
  );
}
