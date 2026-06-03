import { Link } from 'react-router-dom';
import { Home, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  errorCode?: '404' | '500' | '403';
  title?: string;
  message?: string;
}

export default function ErrorPage({
  errorCode = '404',
  title,
  message
}: ErrorPageProps) {
  const errorConfig = {
    '404': {
      title: title || 'Không Tìm Thấy Trang',
      message: message || 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
      emoji: '🔍',
      bgGradient: 'from-blue-50 to-blue-100',
      iconColor: 'text-blue-600',
    },
    '500': {
      title: title || 'Lỗi Máy Chủ',
      message: message || 'Đã xảy ra lỗi trên máy chủ. Vui lòng thử lại sau.',
      emoji: '⚠️',
      bgGradient: 'from-red-50 to-red-100',
      iconColor: 'text-red-600',
    },
    '403': {
      title: title || 'Truy Cập Bị Từ Chối',
      message: message || 'Bạn không có quyền truy cập trang này.',
      emoji: '🚫',
      bgGradient: 'from-yellow-50 to-yellow-100',
      iconColor: 'text-yellow-600',
    },
  };

  const config = errorConfig[errorCode];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} flex items-center justify-center px-4 py-20`}>
      <div className="max-w-2xl w-full">
        {/* Error Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] px-8 py-12 text-center">
            <div className="text-8xl mb-4">{config.emoji}</div>
            <div className="text-white/90 text-6xl font-bold mb-2">{errorCode}</div>
            <div className="text-white/70 text-sm uppercase tracking-wider">Error Code</div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-12">
            <div className={`flex items-center justify-center mb-6`}>
              <div className={`p-4 bg-gray-50 rounded-full ${config.iconColor}`}>
                <AlertTriangle className="w-12 h-12" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
              {config.title}
            </h1>
            <p className="text-gray-600 text-center mb-8 text-lg leading-relaxed">
              {config.message}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                <Home className="w-5 h-5" />
                <span>Về Trang Chủ</span>
              </Link>
              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Quay Lại</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Tải Lại</span>
              </button>
            </div>
          </div>

          {/* Footer Section */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Cần hỗ trợ? Liên hệ với chúng tôi</p>
              <div className="flex flex-wrap gap-4 justify-center text-sm">
                <a href="mailto:support@revora.vn" className="text-[#2D5A3D] hover:underline font-medium">
                  📧 support@revora.vn
                </a>
                <span className="text-gray-300">|</span>
                <a href="tel:1900000000" className="text-[#2D5A3D] hover:underline font-medium">
                  📞 1900 0000
                </a>
                <span className="text-gray-300">|</span>
                <Link to="/help" className="text-[#2D5A3D] hover:underline font-medium">
                  💬 Trung tâm trợ giúp
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-900 mb-3 text-center">Có thể bạn đang tìm</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/all-products"
              className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all border border-gray-100"
            >
              <div className="w-10 h-10 bg-[#2D5A3D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🛍️</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Khám Phá Sản Phẩm</div>
                <div className="text-xs text-gray-500">Xem tất cả sản phẩm</div>
              </div>
            </Link>
            <Link
              to="/shorts"
              className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all border border-gray-100"
            >
              <div className="w-10 h-10 bg-[#2D5A3D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📹</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Video Shorts</div>
                <div className="text-xs text-gray-500">Xem video thời trang</div>
              </div>
            </Link>
            <Link
              to="/ranking"
              className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all border border-gray-100"
            >
              <div className="w-10 h-10 bg-[#2D5A3D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🏆</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">BXH Tuần</div>
                <div className="text-xs text-gray-500">Top seller tuần này</div>
              </div>
            </Link>
            <Link
              to="/match"
              className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all border border-gray-100"
            >
              <div className="w-10 h-10 bg-[#2D5A3D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Revora Match</div>
                <div className="text-xs text-gray-500">Tìm outfit hoàn hảo</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
