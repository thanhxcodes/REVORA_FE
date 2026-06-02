import BaseModal from './BaseModal';
import { Shield } from 'lucide-react';

export interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="3xl" closeButtonTheme="light">
      {/* Header Modal */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-8 py-6 flex items-center gap-3 flex-shrink-0">
        <Shield className="w-6 h-6 text-white" />
        <h2 className="text-white text-xl font-semibold flex-1 pr-8">Chính Sách Bảo Mật</h2>
      </div>

      {/* Body Modal */}
      <div className="p-8 overflow-y-auto flex-1">
        <div className="prose prose-sm max-w-none">
          <h3 className="text-lg font-bold text-gray-900 mb-4">1. Thu Thập Thông Tin</h3>
          <p className="text-gray-600 mb-4">
            REVORA thu thập các loại thông tin sau từ người dùng:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li><strong>Thông tin cá nhân:</strong> Họ tên, email, số điện thoại, địa chỉ</li>
            <li><strong>Thông tin tài khoản:</strong> Tên đăng nhập, mật khẩu (được mã hóa)</li>
            <li><strong>Thông tin giao dịch:</strong> Lịch sử mua credits, sản phẩm đã đăng</li>
            <li><strong>Dữ liệu sử dụng:</strong> Lịch sử truy cập, tương tác trên nền tảng</li>
            <li><strong>Thông tin thiết bị:</strong> IP address, loại trình duyệt, hệ điều hành</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">2. Mục Đích Sử Dụng Thông Tin</h3>
          <p className="text-gray-600 mb-4">
            Chúng tôi sử dụng thông tin của bạn cho các mục đích sau:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Cung cấp và cải thiện dịch vụ marketplace</li>
            <li>Xử lý giao dịch mua credits và đăng tin</li>
            <li>Gửi thông báo về đơn hàng, credits sắp hết hạn</li>
            <li>Hỗ trợ khách hàng và giải quyết tranh chấp</li>
            <li>Phân tích hành vi người dùng để cải thiện trải nghiệm</li>
            <li>Gửi thông tin khuyến mãi (nếu bạn đồng ý)</li>
            <li>Ngăn chặn gian lận và bảo mật tài khoản</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">3. Bảo Mật Thông Tin</h3>
          <p className="text-gray-600 mb-4">
            REVORA cam kết bảo vệ thông tin cá nhân của bạn bằng các biện pháp:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Mã hóa dữ liệu nhạy cảm (mật khẩu, thông tin thanh toán)</li>
            <li>Sử dụng HTTPS cho tất cả kết nối</li>
            <li>Hạn chế quyền truy cập vào dữ liệu cá nhân</li>
            <li>Giám sát và phát hiện các hoạt động bất thường</li>
            <li>Thường xuyên cập nhật hệ thống bảo mật</li>
            <li>Sao lưu dữ liệu định kỳ để phòng tránh mất mát</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">4. Chia Sẻ Thông Tin</h3>
          <p className="text-gray-600 mb-4">
            Chúng tôi chỉ chia sẻ thông tin của bạn trong các trường hợp sau:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li><strong>Với người mua/bán:</strong> Thông tin liên hệ cơ bản khi bạn tương tác</li>
            <li><strong>Với đối tác thanh toán:</strong> VNPay để xử lý giao dịch credits</li>
            <li><strong>Với cơ quan pháp luật:</strong> Khi có yêu cầu hợp pháp từ cơ quan chức năng</li>
            <li><strong>Với đối tác dịch vụ:</strong> Các nhà cung cấp hỗ trợ vận hành nền tảng</li>
          </ul>
          <p className="text-gray-600 mb-4">
            Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn cho bên thứ ba.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">5. Cookie và Công Nghệ Theo Dõi</h3>
          <p className="text-gray-600 mb-4">
            REVORA sử dụng cookies và các công nghệ tương tự để:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Ghi nhớ thông tin đăng nhập của bạn</li>
            <li>Phân tích lưu lượng truy cập và cải thiện dịch vụ</li>
            <li>Cá nhân hóa nội dung và quảng cáo</li>
            <li>Theo dõi hiệu suất của các tính năng</li>
          </ul>
          <p className="text-gray-600 mb-4">
            Bạn có thể tắt cookies trong cài đặt trình duyệt, nhưng một số tính năng có thể không hoạt động đúng.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">6. Quyền Của Người Dùng</h3>
          <p className="text-gray-600 mb-4">
            Bạn có các quyền sau đối với thông tin cá nhân:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li><strong>Truy cập:</strong> Xem thông tin cá nhân mà chúng tôi lưu trữ</li>
            <li><strong>Chỉnh sửa:</strong> Cập nhật hoặc sửa thông tin không chính xác</li>
            <li><strong>Xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu của bạn</li>
            <li><strong>Từ chối:</strong> Từ chối nhận email marketing</li>
            <li><strong>Di chuyển:</strong> Xuất dữ liệu của bạn sang định dạng khác</li>
          </ul>
          <p className="text-gray-600 mb-4">
            Để thực hiện các quyền này, vui lòng liên hệ support@revora.vn
          </p>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">7. Lưu Trữ Dữ Liệu</h3>
          <p className="text-gray-600 mb-4">
            Chúng tôi lưu trữ thông tin của bạn:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Trong suốt thời gian tài khoản của bạn còn hoạt động</li>
            <li>Thêm thời gian cần thiết để tuân thủ nghĩa vụ pháp lý</li>
            <li>Để giải quyết tranh chấp và thực thi thỏa thuận của chúng tôi</li>
          </ul>
          <p className="text-gray-600 mb-4">
            Khi bạn xóa tài khoản, chúng tôi sẽ xóa hoặc ẩn danh hóa thông tin cá nhân của bạn trong vòng 30 ngày, trừ khi pháp luật yêu cầu lưu giữ lâu hơn.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">8. Bảo Vệ Trẻ Em</h3>
          <p className="text-gray-600 mb-4">
            REVORA không cố ý thu thập thông tin từ trẻ em dưới 16 tuổi. Nếu bạn phát hiện chúng tôi đã vô tình thu thập thông tin của trẻ em, vui lòng liên hệ ngay để chúng tôi xóa thông tin đó.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">9. Cập Nhật Chính Sách</h3>
          <p className="text-gray-600 mb-4">
            Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian. Mọi thay đổi sẽ được thông báo qua email hoặc thông báo trên nền tảng. Chúng tôi khuyến khích bạn thường xuyên xem lại chính sách này để cập nhật thông tin.
          </p>

          <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">10. Liên Hệ</h3>
          <p className="text-gray-600 mb-4">
            Nếu bạn có câu hỏi về Chính sách Bảo mật này, vui lòng liên hệ:
          </p>
          <ul className="list-none text-gray-600 mb-4 space-y-2">
            <li>📧 Email: privacy@revora.vn</li>
            <li>📞 Hotline: 1900 0000</li>
            <li>🏢 Địa chỉ: 123 Đường ABC, Quận 1, TP. HCM</li>
          </ul>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 italic">
              Chính sách có hiệu lực từ ngày 01/01/2026
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
