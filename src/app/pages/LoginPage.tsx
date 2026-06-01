import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, User as UserIcon, Mail, X, CheckCircle, ChevronLeft, Phone, FileText, Shield } from 'lucide-react';
import type { User } from '../App';
import logoImg from '../../imports/logo1.jpg';

const MOCK_CREDENTIALS: Record<string, { password: string; user: User }> = {
  user1: { password: '123', user: { username: 'user1', name: 'Minh Anh', avatar: 'M', role: 'user' } },
  user2: { password: '123', user: { username: 'user2', name: 'Thu Hà', avatar: 'T', role: 'user' } },
  admin: { password: '123', user: { username: 'admin', name: 'Admin REVORA', avatar: 'A', role: 'admin' } },
};

interface LoginPageProps {
  setCurrentUser?: (user: User | null) => void;
}

/* ─── Google SVG ─────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/* ─── Terms of Service Modal ───────────────────────────────────────────────── */
function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] px-8 py-6 flex items-center gap-3 flex-shrink-0">
          <FileText className="w-6 h-6 text-white" />
          <h2 className="text-white text-xl font-semibold flex-1">Điều Khoản Sử Dụng</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
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
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Privacy Policy Modal ─────────────────────────────────────────────────── */
function PrivacyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] px-8 py-6 flex items-center gap-3 flex-shrink-0">
          <Shield className="w-6 h-6 text-white" />
          <h2 className="text-white text-xl font-semibold flex-1">Chính Sách Bảo Mật</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
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
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Forgot Password Modal ───────────────────────────────────────────────── */
function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] px-8 py-6 flex items-center gap-3">
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-white text-lg font-semibold">Quên Mật Khẩu</h2>
          <button onClick={onClose} className="ml-auto text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8">
          {!sent ? (
            <>
              <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-[#2D5A3D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[#2D5A3D]" />
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white py-3.5 rounded-full hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
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
              <p className="text-[#2D5A3D] font-semibold text-sm mb-6">{email}</p>
              <p className="text-xs text-gray-400 mb-6">
                Không thấy email? Kiểm tra thư mục spam hoặc thử lại sau 60 giây.
              </p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white px-8 py-3 rounded-full hover:shadow-lg transition-all font-medium"
              >
                Về Trang Đăng Nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Register Success Modal ──────────────────────────────────────────────── */
function RegisterSuccessModal({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#2D5A3D] via-[#C4603A] to-[#3D7054]" />
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#2D5A3D]/10 to-[#C4603A]/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-[#2D5A3D]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng Ký Thành Công!</h3>
          <p className="text-gray-500 text-sm mb-1">Chào mừng bạn đến với REVORA,</p>
          <p className="text-[#2D5A3D] font-semibold mb-6">{name} 🎉</p>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Tài khoản của bạn đã được tạo. Hãy đăng nhập để bắt đầu mua bán thời trang nhé!
          </p>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white py-3 rounded-2xl hover:shadow-lg hover:shadow-[#2D5A3D]/25 transition-all font-semibold"
          >
            Đăng Nhập Ngay
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Register Form ───────────────────────────────────────────────────────── */
function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const validate = () => {
    if (!fullName.trim()) return 'Vui lòng nhập họ và tên.';
    if (username.trim().length < 3) return 'Tên đăng nhập phải có ít nhất 3 ký tự.';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Tên đăng nhập chỉ gồm chữ, số và dấu gạch dưới.';
    if (MOCK_CREDENTIALS[username]) return 'Tên đăng nhập này đã được sử dụng.';
    if (!email.includes('@')) return 'Email không hợp lệ.';
    if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp.';
    if (!agree) return 'Bạn cần đồng ý với điều khoản sử dụng.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setSuccess(true);
  };

  if (success) {
    return <RegisterSuccessModal name={fullName} onClose={onSwitchToLogin} />;
  }

  return (
    <div className="px-8 py-7">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Tạo tài khoản mới</h2>
      <p className="text-gray-500 text-sm mb-6">Tham gia cộng đồng thời trang REVORA</p>

      {/* Google Register */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-2xl py-3 px-4 hover:bg-gray-50 hover:border-gray-300 transition-all mb-4 group"
      >
        <GoogleIcon />
        <span className="text-gray-700 font-medium text-sm group-hover:text-gray-900 transition-colors">
          Đăng ký với Google
        </span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="px-4 text-xs text-gray-400 font-medium uppercase tracking-wider">hoặc điền form</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên</label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setError(''); }}
              placeholder="Nguyễn Văn A"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/25 focus:border-[#2D5A3D]/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
              autoComplete="name"
            />
          </div>
        </div>

        {/* Username + Phone in a row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên đăng nhập</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value.toLowerCase()); setError(''); }}
                placeholder="username"
                className="w-full pl-8 pr-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/25 focus:border-[#2D5A3D]/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
                autoComplete="username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901 234 567"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/25 focus:border-[#2D5A3D]/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
                autoComplete="tel"
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="email@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/25 focus:border-[#2D5A3D]/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400 text-sm"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full pl-10 pr-9 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/25 focus:border-[#2D5A3D]/40 bg-gray-50 focus:bg-white transition-all text-gray-900 text-sm"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Xác nhận</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-9 py-3 rounded-xl border focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-all text-gray-900 text-sm ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                    : confirmPassword && password === confirmPassword
                    ? 'border-green-300 focus:ring-green-200 focus:border-green-400'
                    : 'border-gray-200 focus:ring-[#2D5A3D]/25 focus:border-[#2D5A3D]/40'
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Password strength hint */}
        {password && (
          <div className="flex gap-1.5 items-center">
            {[
              password.length >= 6,
              /[A-Z]/.test(password),
              /[0-9]/.test(password),
              /[^a-zA-Z0-9]/.test(password),
            ].map((ok, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  ok ? (password.length >= 10 ? 'bg-green-500' : 'bg-[#C4603A]') : 'bg-gray-200'
                }`}
              />
            ))}
            <span className="text-[10px] text-gray-400 ml-1 whitespace-nowrap">
              {password.length < 6 ? 'Quá ngắn' : password.length < 10 ? 'Trung bình' : 'Mạnh'}
            </span>
          </div>
        )}

        {/* Terms */}
        <label className="flex items-start gap-2.5 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => { setAgree(e.target.checked); setError(''); }}
              className="sr-only"
            />
            <div
              className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-all ${
                agree ? 'bg-[#2D5A3D] border-[#2D5A3D]' : 'border-gray-300 bg-white group-hover:border-[#2D5A3D]/50'
              }`}
            >
              {agree && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-600 leading-relaxed">
            Tôi đồng ý với{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowTerms(true);
              }}
              className="text-[#2D5A3D] font-semibold hover:underline cursor-pointer"
            >
              Điều khoản sử dụng
            </button>
            {' '}và{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPrivacy(true);
              }}
              className="text-[#2D5A3D] font-semibold hover:underline cursor-pointer"
            >
              Chính sách bảo mật
            </button>
            {' '}của REVORA
          </span>
        </label>

        {/* Modals */}
        {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
        {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
            <span className="text-red-400 flex-shrink-0">⚠</span> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white py-3.5 rounded-2xl hover:shadow-lg hover:shadow-[#2D5A3D]/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none font-semibold mt-1"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Tạo Tài Khoản <ArrowRight className="w-[18px] h-[18px]" /></>
          )}
        </button>
      </form>

      {/* Switch to login */}
      <p className="text-center text-sm text-gray-500 mt-5">
        Đã có tài khoản?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-[#2D5A3D] font-semibold hover:text-[#3D7054] hover:underline transition-colors"
        >
          Đăng nhập ngay
        </button>
      </p>
    </div>
  );
}

/* ─── Login Form ──────────────────────────────────────────────────────────── */
function LoginForm({
  setCurrentUser,
  onSwitchToRegister,
  onForgot,
}: {
  setCurrentUser?: (user: User | null) => void;
  onSwitchToRegister: () => void;
  onForgot: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 650));
    const entry = MOCK_CREDENTIALS[username.trim()];
    if (!entry || entry.password !== password) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
      setIsLoading(false);
      return;
    }
    if (setCurrentUser) setCurrentUser(entry.user);
    if (entry.user.role === 'admin') navigate('/admin/dashboard');
    else navigate('/');
  };

  const quickLogin = (u: string) => {
    setUsername(u);
    setPassword('123');
    setError('');
  };

  return (
    <div className="px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Chào mừng trở lại</h2>
      <p className="text-gray-500 text-sm mb-7">Đăng nhập để tiếp tục mua bán</p>

      {/* Google Login */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-2xl py-3 px-4 hover:bg-gray-50 hover:border-gray-300 transition-all mb-4 group"
      >
        <GoogleIcon />
        <span className="text-gray-700 font-medium text-sm group-hover:text-gray-900 transition-colors">
          Tiếp tục với Google
        </span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="px-4 text-xs text-gray-400 font-medium uppercase tracking-wider">hoặc đăng nhập</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tên đăng nhập</label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="user1, user2 hoặc admin"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/25 focus:border-[#2D5A3D]/40 bg-gray-50 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
              required
              autoComplete="username"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Mật Khẩu</label>
            <button
              type="button"
              onClick={onForgot}
              className="text-xs text-[#2D5A3D] hover:text-[#3D7054] hover:underline transition-colors font-medium"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/25 focus:border-[#2D5A3D]/40 bg-gray-50 focus:bg-white transition-all text-gray-900"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <span className="text-red-400 flex-shrink-0">⚠</span> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white py-3.5 rounded-2xl hover:shadow-lg hover:shadow-[#2D5A3D]/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none font-semibold mt-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Đăng Nhập <ArrowRight className="w-[18px] h-[18px]" /></>
          )}
        </button>
      </form>

      {/* Demo accounts */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <p className="text-xs text-center text-gray-400 font-medium mb-3 uppercase tracking-wider">
          Tài khoản demo — nhấn để điền nhanh
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { u: 'user1', label: 'Minh Anh', role: 'Người dùng', color: '#2D5A3D' },
            { u: 'user2', label: 'Thu Hà', role: 'Người dùng', color: '#533483' },
            { u: 'admin', label: 'Admin', role: 'Quản trị', color: '#374151' },
          ].map(({ u, label, role, color }) => (
            <button
              key={u}
              type="button"
              onClick={() => quickLogin(u)}
              className={`rounded-2xl py-3 px-2 text-center transition-all border-2 hover:scale-[1.02] ${
                username === u
                  ? 'border-[#2D5A3D] bg-[#2D5A3D]/5'
                  : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto mb-1.5"
                style={{ backgroundColor: color }}
              >
                {label[0]}
              </div>
              <div className="text-gray-800 text-xs font-semibold leading-tight">{label}</div>
              <div className="text-gray-400 text-[10px] mt-0.5">{role}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Switch to register */}
      <p className="text-center text-sm text-gray-500 mt-5 pt-4 border-t border-gray-100">
        Chưa có tài khoản?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-[#2D5A3D] font-semibold hover:text-[#3D7054] hover:underline transition-colors"
        >
          Đăng ký ngay
        </button>
      </p>
    </div>
  );
}

/* ─── Main Login Page ─────────────────────────────────────────────────────── */
export default function LoginPage({ setCurrentUser }: LoginPageProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <>
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E4029] via-[#2D5A3D] to-[#152E20]" />

        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-white/[0.03] -translate-y-1/2" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='white' stroke-width='0.8'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative w-full max-w-[460px]">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block group">
              <div className="flex items-center justify-center gap-3 mb-3">
                <img src={logoImg} alt="REVORA Logo" className="w-[52px] h-[52px] rounded-xl" />
                <div className="text-left">
                  <h1 className="text-4xl font-black text-white leading-none" style={{ fontFamily: 'Raleway, sans-serif', letterSpacing: '0.25em' }}>REVORA</h1>
                  <p className="text-white/55 text-[10px] tracking-[0.25em] uppercase mt-0.5">Revive Your Aura</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-1 mb-4 border border-white/20">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#2D5A3D] shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#2D5A3D] shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Đăng Ký
            </button>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#2D5A3D] via-[#C4603A] to-[#3D7054]" />

            {mode === 'login' ? (
              <LoginForm
                setCurrentUser={setCurrentUser}
                onSwitchToRegister={() => setMode('register')}
                onForgot={() => navigate('/forgot-password')}
              />
            ) : (
              <RegisterForm onSwitchToLogin={() => setMode('login')} />
            )}
          </div>

          <p className="text-center text-white/50 text-xs mt-6">
            &copy; 2025 REVORA. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </>
  );
}
