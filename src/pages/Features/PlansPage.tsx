import { useState } from 'react';
import { Sparkles, Image, Check, X, QrCode, History, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import CreditDisplay from '../../components/common/CreditDisplay';

const userCreditBatches = {
  posting: [
    { credits: 5, expiresDate: '22/05/2026', expiresIn: 3, packageName: 'Gói 1 Ngày' },
    { credits: 30, expiresDate: '28/05/2026', expiresIn: 9, packageName: 'Gói 7 Ngày' },
  ],
  featured: [
    { credits: 3, expiresDate: '24/05/2026', expiresIn: 5, packageName: 'Gói 1 Ngày' },
    { credits: 15, expiresDate: '01/06/2026', expiresIn: 13, packageName: 'Gói 7 Ngày' },
  ],
};

interface Transaction {
  id: string;
  date: string;
  time: string;
  type: 'purchase';
  packageName: string;
  packageType: 'posting' | 'featured';
  credits: number;
  amount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TX001', date: '28/05/2026', time: '14:32', type: 'purchase', packageName: 'Gói 7 Ngày', packageType: 'posting', credits: 30, amount: 80000, paymentMethod: 'VNPay', status: 'completed' },
  { id: 'TX002', date: '24/05/2026', time: '09:15', type: 'purchase', packageName: 'Gói 1 Ngày', packageType: 'featured', credits: 3, amount: 40000, paymentMethod: 'VNPay', status: 'completed' },
  { id: 'TX003', date: '22/05/2026', time: '16:20', type: 'purchase', packageName: 'Gói 1 Ngày', packageType: 'posting', credits: 5, amount: 10000, paymentMethod: 'VNPay', status: 'completed' },
  { id: 'TX004', date: '15/05/2026', time: '11:05', type: 'purchase', packageName: 'Gói 7 Ngày', packageType: 'featured', credits: 24, amount: 249999, paymentMethod: 'VNPay', status: 'completed' },
  { id: 'TX005', date: '10/05/2026', time: '08:30', type: 'purchase', packageName: 'Gói 30 Ngày', packageType: 'posting', credits: 35, amount: 249999, paymentMethod: 'VNPay', status: 'completed' },
  { id: 'TX006', date: '05/05/2026', time: '13:45', type: 'purchase', packageName: 'Gói 1 Ngày', packageType: 'posting', credits: 1, amount: 10000, paymentMethod: 'VNPay', status: 'failed' },
];

interface Package {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  credits: number;
  duration: number;
  badge: string;
  badgeColor: string;
  features: string[];
  cta: string;
  tier: number;
}

const postingPackages: Package[] = [
  {
    id: 'posting-day',
    title: 'Gói 1 Ngày',
    price: 10000,
    credits: 1,
    duration: 1,
    badge: 'Cơ bản',
    badgeColor: 'bg-blue-100 text-blue-800',
    features: [
      '1 credits đăng tin cơ bản',
      'Hiển thị sản phẩm trong 30 ngày',
      'Liên hệ người mua qua chat/Zalo',
      'Khả năng hiển thị tiêu chuẩn',
    ],
    cta: 'Mua Ngay',
    tier: 1,
  },
  {
    id: 'posting-week',
    title: 'Gói 7 Ngày',
    price: 80000,
    originalPrice: 100000,
    discountPercent: 20,
    credits: 10,
    duration: 7,
    badge: 'Phổ Biến',
    badgeColor: 'bg-purple-100 text-purple-800',
    features: [
      '30 credits đăng tin cơ bản',
      'Tiết kiệm 20% so với gói ngày',
      'Tất cả tính năng Gói 1 Ngày',
    ],
    cta: 'Chọn Gói',
    tier: 2,
  },
  {
    id: 'posting-month',
    title: 'Gói 30 Ngày',
    price: 249999,
    originalPrice: 350000,
    discountPercent: 30,
    credits: 35,
    duration: 30,
    badge: 'Tiết Kiệm Nhất',
    badgeColor: 'bg-green-100 text-green-800',
    features: [
      '35 credits đăng tin cơ bản',
      'Tiết kiệm 30% so với gói ngày',
      'Tất cả tính năng Gói 7 Ngày',
    ],
    cta: 'Nhận Gói',
    tier: 3,
  },
];

const featuredPackages: Package[] = [
  {
    id: 'featured-day',
    title: 'Gói 1 Ngày',
    price: 40000,
    credits: 3,
    duration: 1,
    badge: 'Tăng Tốc Nhanh',
    badgeColor: 'bg-orange-100 text-orange-800',
    features: [
      '3 credits nổi bật',
      'Mở khóa upload video Shorts',
      'Mở khóa hiển thị trên Banner',
      'Hiển thị sản phẩm trong 60 ngày',
      'Viền sản phẩm nổi bật',
      'Xuất hiện trên BXH Tuần',
    ],
    cta: 'Tăng Tốc',
    tier: 1,
  },
  {
    id: 'featured-week',
    title: 'Gói 7 Ngày',
    price: 249999,
    originalPrice: 320000,
    discountPercent: 22,
    credits: 24,
    duration: 7,
    badge: 'Được Đề Xuất',
    badgeColor: 'bg-pink-100 text-pink-800',
    features: [
      '24 credits nổi bật',
      'Tiết kiệm 22% so với gói ngày',
      // 'Ưu tiên xuất hiện trang chủ',
      // 'Vị trí tìm kiếm tốt hơn',
      // 'Badge "Người Bán Uy Tín"',
      'Tất cả tính năng Gói 1 Ngày',
    ],
    cta: 'Nâng Cấp',
    tier: 2,
  },
  {
    id: 'featured-month',
    title: 'Gói 30 Ngày',
    price: 649999,
    originalPrice: 920000,
    discountPercent: 30,
    credits: 69,
    duration: 30,
    badge: 'Tối Ưu Cao Cấp',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    features: [
      '69 credits nổi bật',
      'Tiết kiệm 30% so với gói ngày',
      // 'Ưu tiên hiển thị cao nhất',
      // 'Vị trí top trending',
      'Badge cao cấp "V.I.P"',
      // 'Hiệu ứng listing cao cấp',
      // 'Ưu tiên đề xuất tối đa',
      'Tất cả tính năng Gói 1 Ngày',
    ],
    cta: 'Mở Khóa VIP',
    tier: 3,
  },
];

export default function PlansPage() {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [packageType, setPackageType] = useState<'posting' | 'featured'>('posting');
  const [activeTab, setActiveTab] = useState<'packages' | 'history'>('packages');

  // Simulate user's active packages - user can have multiple packages active at once
  const activePackages = ['posting-week', 'featured-day']; // IDs of packages currently active

  const handleSelectPackage = (pkg: Package, type: 'posting' | 'featured') => {
    setSelectedPackage(pkg);
    setPackageType(type);
    setShowQRModal(true);
  };

  const isPackageActive = (packageId: string) => {
    return activePackages.includes(packageId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl text-gray-900 mb-4">Nâng Cấp Sức Mạnh Đăng Tin</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chọn gói phù hợp để tăng khả năng hiển thị, đăng sản phẩm và nổi bật trong cộng đồng thời trang REVORA
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'packages'
                ? 'bg-[#2D5A3D] text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Gói Credits</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-[#2D5A3D] text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <History className="w-5 h-5" />
            <span>Lịch Sử Giao Dịch</span>
          </button>
        </div>

        {/* Tab Content: Packages */}
        {activeTab === 'packages' && (
          <>
            {/* Current Credits Dashboard */}
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-16">
              <div className="mb-6">
                <h2 className="text-2xl text-gray-900 mb-2">Credits Hiện Tại</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CreditDisplay type="posting" batches={userCreditBatches.posting} />
                <CreditDisplay type="featured" batches={userCreditBatches.featured} />
              </div>
            </div>

        {/* Posting Packages Section */}
        <div className="mb-16">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Image className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl text-gray-900">Gói Credits Đăng Tin</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {postingPackages.map((pkg) => {
              const isActive = isPackageActive(pkg.id);

              return (
                <div
                  key={pkg.id}
                  className={`relative bg-white rounded-3xl shadow-lg p-8 transition-all ${
                    isActive
                      ? 'ring-4 ring-blue-500 scale-105'
                      : 'hover:shadow-2xl hover:scale-105'
                  }`}
                >
                  {/* Badge */}
                  <div className="absolute top-6 right-6">
                    <span className={`${pkg.badgeColor} px-4 py-1.5 rounded-full text-xs font-bold`}>
                      {pkg.badge}
                    </span>
                  </div>

                  {/* Active Plan Badge */}
                  {isActive && (
                    <div className="absolute top-6 left-6">
                      <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Đang Dùng</span>
                      </span>
                    </div>
                  )}

                  <div className="mt-8">
                    <h3 className="text-2xl text-gray-900 mb-4">{pkg.title}</h3>
                    <div className="mb-6">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-bold text-blue-600">
                          {pkg.price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      {pkg.originalPrice && (
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-gray-500 line-through text-sm">
                            {pkg.originalPrice.toLocaleString('vi-VN')}đ
                          </span>
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                            -{pkg.discountPercent}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{pkg.credits}</div>
                        <div className="text-sm text-gray-600">Credits Đăng Tin</div>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isActive ? (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-600 py-4 rounded-xl font-bold cursor-not-allowed"
                      >
                        Đang Sử Dụng
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectPackage(pkg, 'posting')}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all"
                      >
                        Mở Khóa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Featured Packages Section */}
        <div className="mb-16">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-[#C4603A]/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-[#C4603A]" />
            </div>
            <h2 className="text-3xl text-gray-900">Gói Credits Nổi Bật</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPackages.map((pkg) => {
              const isActive = isPackageActive(pkg.id);

              return (
                <div
                  key={pkg.id}
                  className={`relative bg-white rounded-3xl shadow-lg p-8 transition-all ${
                    isActive
                      ? 'ring-4 ring-[#C4603A] scale-105'
                      : 'hover:shadow-2xl hover:scale-105'
                  }`}
                >
                  {/* Badge */}
                  <div className="absolute top-6 right-6">
                    <span className={`${pkg.badgeColor} px-4 py-1.5 rounded-full text-xs font-bold`}>
                      {pkg.badge}
                    </span>
                  </div>

                  {/* Active Plan Badge */}
                  {isActive && (
                    <div className="absolute top-6 left-6">
                      <span className="bg-[#C4603A] text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Đang Dùng</span>
                      </span>
                    </div>
                  )}

                  <div className="mt-8">
                    <h3 className="text-2xl text-gray-900 mb-4">{pkg.title}</h3>
                    <div className="mb-6">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-bold text-[#C4603A]">
                          {pkg.price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      {pkg.originalPrice && (
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-gray-500 line-through text-sm">
                            {pkg.originalPrice.toLocaleString('vi-VN')}đ
                          </span>
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                            -{pkg.discountPercent}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#C4603A]/10 rounded-xl p-4 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[#C4603A]">{pkg.credits}</div>
                        <div className="text-sm text-gray-600">Credits Nổi Bật</div>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isActive ? (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-600 py-4 rounded-xl font-bold cursor-not-allowed"
                      >
                        Đang Sử Dụng
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSelectPackage(pkg, 'featured')}
                        className="w-full bg-gradient-to-r from-[#C4603A] to-[#d4724a] text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all"
                      >
                        Mở Khóa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* VNPay QR Modal */}
        {showQRModal && selectedPackage && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowQRModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="absolute top-6 right-6 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>

                <div className="text-center mb-6">
                  <h3 className="text-2xl text-gray-900 mb-2">Thanh Toán VNPay</h3>
                  <p className="text-gray-600">Quét mã QR để thanh toán</p>
                </div>

                {/* QR Code Placeholder */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-6">
                  <div className="bg-white p-6 rounded-xl shadow-inner flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="w-48 h-48 text-gray-300 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">QR Code VNPay</p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className={`rounded-2xl p-6 mb-6 ${
                  packageType === 'posting'
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-[#C4603A]/10 border-2 border-[#C4603A]'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-700">Gói:</span>
                    <span className="font-bold text-gray-900">{selectedPackage.title}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-700">Loại:</span>
                    <span className="font-bold text-gray-900">
                      {packageType === 'posting' ? 'Credits Đăng Tin' : 'Credits Nổi Bật'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-700">Credits:</span>
                    <span className="font-bold text-gray-900">{selectedPackage.credits} credits</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-700">Thời hạn:</span>
                    <span className="font-bold text-gray-900">{selectedPackage.duration} ngày</span>
                  </div>
                  {selectedPackage.originalPrice && (
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-700">Giá gốc:</span>
                      <span className="text-gray-500 line-through">
                        {selectedPackage.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                    <span className="text-lg font-bold text-gray-900">Tổng thanh toán:</span>
                    <span className={`text-2xl font-bold ${
                      packageType === 'posting' ? 'text-blue-600' : 'text-[#C4603A]'
                    }`}>
                      {selectedPackage.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Sau khi thanh toán thành công, credits sẽ được cập nhật tự động vào tài khoản của bạn trong vòng 1-2 phút
                </p>
              </div>
            </div>
          </>
        )}

            {/* FAQ Section */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl text-gray-900 mb-6 text-center">Câu Hỏi Thường Gặp</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Credits có hết hạn không?</h3>
                  <p className="text-sm text-gray-600">
                    Có, credits sẽ hết hạn theo thời gian của gói bạn đã mua (1/7/30 ngày). Hãy sử dụng trước khi hết hạn.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Tôi có thể mua nhiều gói cùng lúc?</h3>
                  <p className="text-sm text-gray-600">
                    Có, nhưng bạn chỉ có thể mua tối đa cả 2 gói mỗi loại (1 gói Đăng Tin + 1 gói Nổi Bật) cùng lúc. Credits mỗi loại về 0 thì bạn mới có thể mua tiếp các gói cùng loại.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Phương thức thanh toán nào được hỗ trợ?</h3>
                  <p className="text-sm text-gray-600">
                    Hiện tại chúng tôi hỗ trợ thanh toán qua VNPay (thẻ ATM, Visa, MasterCard, QR Code).
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab Content: Transaction History */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl text-gray-900 font-bold flex items-center gap-2">
                <History className="w-6 h-6 text-[#2D5A3D]" />
                Lịch Sử Giao Dịch
              </h2>
              <p className="text-gray-600 text-sm mt-1">Danh sách các giao dịch mua gói credits</p>
            </div>

            {/* Transaction List */}
            <div className="divide-y divide-gray-50">
              {MOCK_TRANSACTIONS.length === 0 ? (
                <div className="text-center py-16">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có giao dịch nào</h3>
                  <p className="text-gray-500 text-sm">Lịch sử mua gói của bạn sẽ hiển thị tại đây</p>
                </div>
              ) : (
                MOCK_TRANSACTIONS.map((tx) => (
                  <div key={tx.id} className="px-8 py-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      {/* Left: Transaction Info */}
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          tx.packageType === 'posting' ? 'bg-blue-50' : 'bg-orange-50'
                        }`}>
                          <TrendingUp className={`w-6 h-6 ${
                            tx.packageType === 'posting' ? 'text-blue-600' : 'text-[#C4603A]'
                          }`} />
                        </div>

                        {/* Details */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{tx.packageName}</h3>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              tx.packageType === 'posting'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-[#C4603A]'
                            }`}>
                              {tx.packageType === 'posting' ? 'Credit Đăng Tin' : 'Credit Nổi Bật'}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              tx.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : tx.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {tx.status === 'completed' ? 'Thành công' : tx.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {tx.date} {tx.time}
                            </span>
                            <span>•</span>
                            <span>Mã GD: {tx.id}</span>
                            <span>•</span>
                            <span>{tx.paymentMethod}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Credits */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <TrendingDown className="w-4 h-4 text-red-500" />
                          <span className="text-lg font-bold text-red-600">
                            -{tx.amount.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        <div className={`text-sm font-semibold ${
                          tx.packageType === 'posting' ? 'text-blue-600' : 'text-[#C4603A]'
                        }`}>
                          +{tx.credits} credits
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary */}
            {MOCK_TRANSACTIONS.length > 0 && (
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tổng số giao dịch:</span>
                  <span className="font-bold text-gray-900">{MOCK_TRANSACTIONS.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Tổng chi tiêu:</span>
                  <span className="font-bold text-red-600">
                    {MOCK_TRANSACTIONS.filter(tx => tx.status === 'completed')
                      .reduce((sum, tx) => sum + tx.amount, 0)
                      .toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Tổng credits đã mua:</span>
                  <span className="font-bold text-[#2D5A3D]">
                    {MOCK_TRANSACTIONS.filter(tx => tx.status === 'completed')
                      .reduce((sum, tx) => sum + tx.credits, 0)} credits
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
