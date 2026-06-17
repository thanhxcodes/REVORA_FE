import React from 'react';
import { Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] px-8 py-10 text-white text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl font-bold mb-2">Chính Sách Bảo Mật</h1>
          <p className="text-white/80">Cập nhật lần cuối: Tháng 6 năm 2026</p>
        </div>
        
        <div className="p-8 sm:p-10 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2D5A3D]/10 text-[#2D5A3D] flex items-center justify-center text-sm">1</span>
              Thu Thập Thông Tin
            </h2>
            <p className="mb-3">Chúng tôi thu thập các thông tin sau khi bạn sử dụng nền tảng REVORA:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Thông tin cá nhân:</strong> Tên, email, số điện thoại, địa chỉ khi bạn đăng ký tài khoản.</li>
              <li><strong>Dữ liệu giao dịch:</strong> Lịch sử đăng tin, lịch sử nạp credit, lịch sử liên hệ.</li>
              <li><strong>Dữ liệu thiết bị:</strong> Địa chỉ IP, loại trình duyệt, hệ điều hành nhằm mục đích phân tích và cải thiện dịch vụ.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2D5A3D]/10 text-[#2D5A3D] flex items-center justify-center text-sm">2</span>
              Mục Đích Sử Dụng
            </h2>
            <p className="mb-3">Thông tin của bạn được sử dụng vào các mục đích:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Cung cấp, duy trì và nâng cao chất lượng dịch vụ.</li>
              <li>Hiển thị thông tin liên hệ chính xác cho người mua và người bán trên nền tảng.</li>
              <li>Gửi các thông báo quan trọng về bảo mật, cập nhật hệ thống hoặc khuyến mãi.</li>
              <li>Hỗ trợ người dùng giải quyết khiếu nại, tranh chấp (nếu có).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2D5A3D]/10 text-[#2D5A3D] flex items-center justify-center text-sm">3</span>
              Chia Sẻ Dữ Liệu
            </h2>
            <p>REVORA cam kết không bán, cho thuê hoặc chia sẻ dữ liệu cá nhân của bạn cho bên thứ ba vì mục đích thương mại độc lập mà không có sự đồng ý của bạn, ngoại trừ các yêu cầu cung cấp thông tin từ cơ quan pháp luật có thẩm quyền.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2D5A3D]/10 text-[#2D5A3D] flex items-center justify-center text-sm">4</span>
              Bảo Mật Dữ Liệu
            </h2>
            <p>Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức bảo mật tiên tiến nhất để bảo vệ thông tin của bạn khỏi tình trạng mất mát, truy cập trái phép, hoặc rò rỉ. Mật khẩu của bạn được mã hóa an toàn trên hệ thống máy chủ của chúng tôi.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#2D5A3D]/10 text-[#2D5A3D] flex items-center justify-center text-sm">5</span>
              Quyền Của Người Dùng
            </h2>
            <p>Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa bỏ thông tin cá nhân của mình thông qua phần Cài đặt tài khoản. Nếu cần hỗ trợ thêm về quyền riêng tư, vui lòng liên hệ bộ phận hỗ trợ của REVORA.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
