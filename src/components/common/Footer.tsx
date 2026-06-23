import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl mb-4 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-[#C4603A]" />
              <span>Về REVORA</span>
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Khơi nguồn vòng đời mới cho những món đồ thời trang. REVORA - Nền tảng mua bán đồ secondhand uy tín, kiến tạo xu hướng thời trang bền vững và phong cách.
            </p>
            <div className="mt-4 flex items-center space-x-3">
              <a href="https://www.facebook.com/profile.php?id=61590421353638" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl mb-4">Liên Kết</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-white/80 hover:text-white transition-colors">Trang Chủ</Link>
              </li>
              <li>
                <Link to="/sell" className="text-white/80 hover:text-white transition-colors">Đăng tin</Link>
              </li>
              <li>
                <Link to="/shorts" className="text-white/80 hover:text-white transition-colors">Shorts</Link>
              </li>
              <li>
                <Link to="/plans" className="text-white/80 hover:text-white transition-colors">Gói Nâng Cấp</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl mb-4">Hỗ Trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms-of-use" className="text-white/80 hover:text-white transition-colors">Điều Khoản Sử Dụng</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-white/80 hover:text-white transition-colors">Chính Sách Bảo Mật</Link>
              </li>
              <li>
                <Link to="/payment-guide" className="text-white/80 hover:text-white transition-colors">Hướng Dẫn Thanh Toán</Link>
              </li>
              <li>
                <Link to="/feedback" className="text-white/80 hover:text-white transition-colors">Đóng góp ý kiến</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl mb-4">Liên Hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">daohuyhoang507@gmail.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">0337535877</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">Khu GD&ĐT, khu CNC Hoà Lạc, KM29, Đại lộ Thăng Long, Xã Hoà Lạc, TP Hà Nội, Vietnam, 10000</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quote Section */}
        <div className="border-t border-white/20 pt-8 mb-8">
          <div className="text-center">
            <p className="text-lg italic text-white/90 mb-2">
              "Đánh thức vẻ đẹp vượt thời gian từ những món đồ secondhand"
            </p>
            <p className="text-sm text-white/60">- REVORA Team</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-6 text-center text-sm text-white/70">
          <p>&copy; 2026 REVORA. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
