import { useState } from 'react';
import { X, Video, Image as ImageIcon, AlertCircle, Sparkles, Crown, Upload } from 'lucide-react';
import CreditDisplay from '../../components/common/CreditDisplay';

const categories = ['Quần Áo', 'Giày Dép', 'Túi Xách', 'Phụ Kiện', 'Đồng Hồ', 'Trang Sức'];
const conditions = ['Mới 100%', 'Như Mới', 'Tuyệt Vời', 'Tốt', 'Khá'];

const userCreditBatches = {
  posting: [
    { credits: 5, expiresDate: '22/05/2026', expiresIn: 3, packageName: 'Posting Day' },
    { credits: 30, expiresDate: '28/05/2026', expiresIn: 9, packageName: 'Posting Week' },
  ],
  featured: [
    { credits: 3, expiresDate: '24/05/2026', expiresIn: 5, packageName: 'Featured Day' },
    { credits: 15, expiresDate: '01/06/2026', expiresIn: 13, packageName: 'Featured Week' },
  ],
};

const totalPostingCredits = userCreditBatches.posting.reduce((sum, batch) => sum + batch.credits, 0);
const totalFeaturedCredits = userCreditBatches.featured.reduce((sum, batch) => sum + batch.credits, 0);

export default function SellProductPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [uploadedBanner, setUploadedBanner] = useState<string | null>(null);
  const [enableVideoUpload, setEnableVideoUpload] = useState(false);
  const [enableBannerBoost, setEnableBannerBoost] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(() =>
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400'
      );
      setUploadedImages([...uploadedImages, ...newImages]);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedVideo('video-placeholder.mp4');
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedBanner('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200');
    }
  };

  const totalFeaturedCreditsUsed = (enableVideoUpload ? 1 : 0) + (enableBannerBoost ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl text-gray-900 mb-4">Đăng Sản Phẩm Thời Trang</h1>
          <p className="text-gray-600">Điền thông tin và chọn tính năng nâng cao để tăng hiệu quả</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl text-gray-900 mb-6">Thông Tin Sản Phẩm</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Tên Sản Phẩm</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Áo Khoác Da Vintage"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Danh Mục</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]">
                      <option value="">Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Tình Trạng</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]">
                      <option value="">Chọn tình trạng</option>
                      {conditions.map((cond) => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Giá (VNĐ)</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Thương Hiệu (Tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Gucci, Chanel"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Mô Tả</label>
                  <textarea
                    rows={5}
                    placeholder="Mô tả chi tiết sản phẩm của bạn..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Thẻ Phong Cách</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: vintage, streetwear, thanh lịch"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]"
                  />
                  <p className="text-xs text-gray-500 mt-2">Phân cách các thẻ bằng dấu phẩy</p>
                </div>
              </div>
            </div>

            {/* Upload Images */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl text-gray-900 mb-6">Hình Ảnh Sản Phẩm</h2>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-[#2D5A3D] transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Kéo thả ảnh hoặc click để chọn</p>
                  <p className="text-sm text-gray-500">Khuyến nghị: Tối thiểu 5 ảnh chất lượng cao</p>
                </label>
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-6">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img src={img} alt={`Upload ${index + 1}`} className="w-full aspect-square object-cover rounded-xl" />
                      <button
                        onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== index))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Upload (Premium Feature) */}
            <div className={`bg-white rounded-3xl shadow-lg p-8 border-2 transition-all ${
              enableVideoUpload ? 'border-[#2D5A3D]' : 'border-transparent'
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl text-gray-900">Upload Video Shorts</h2>
                    <p className="text-sm text-gray-600">Tăng engagement lên 3x</p>
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableVideoUpload}
                    onChange={(e) => setEnableVideoUpload(e.target.checked)}
                    disabled={totalFeaturedCredits === 0}
                    className="w-5 h-5 text-orange-600 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Sử dụng 1 Credit Nổi Bật
                  </span>
                </label>
              </div>

              {enableVideoUpload && totalFeaturedCredits > 0 ? (
                <div>
                  {!uploadedVideo ? (
                    <div className="border-2 border-dashed border-[#2D5A3D] rounded-2xl p-12 text-center">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <label htmlFor="video-upload" className="cursor-pointer">
                        <Video className="w-16 h-16 text-[#2D5A3D] mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Click để tải video (tối đa 30 giây)</p>
                        <p className="text-sm text-gray-500">Định dạng: MP4, MOV, AVI</p>
                      </label>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-2xl p-6 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Video className="w-8 h-8 text-[#2D5A3D]" />
                        <div>
                          <div className="font-medium text-gray-900">Video đã tải lên</div>
                          <div className="text-sm text-gray-600">{uploadedVideo}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadedVideo(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                !enableVideoUpload && (
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <p className="text-gray-600 text-sm">
                      Tick checkbox phía trên để mở khóa tính năng upload video
                    </p>
                  </div>
                )
              )}

              {totalFeaturedCredits === 0 && (
                <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 rounded-lg p-4 mt-4">
                  <AlertCircle className="w-4 h-4" />
                  <span>Bạn đã hết credit nổi bật. Mua thêm gói để sử dụng tính năng này.</span>
                </div>
              )}
            </div>

            {/* Banner Boost (Premium Feature) */}
            <div className={`bg-white rounded-3xl shadow-lg p-8 border-2 transition-all ${
              enableBannerBoost ? 'border-[#C4603A]' : 'border-transparent'
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#C4603A] to-[#B8941F] rounded-xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl text-gray-900">Hiển Thị Banner Nổi Bật</h2>
                    <p className="text-sm text-gray-600">Xuất hiện carousel trang chủ 24h</p>
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableBannerBoost}
                    onChange={(e) => setEnableBannerBoost(e.target.checked)}
                    disabled={totalFeaturedCredits - (enableVideoUpload ? 1 : 0) === 0}
                    className="w-5 h-5 text-orange-600 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Sử dụng 1 Credit Nổi Bật
                  </span>
                </label>
              </div>

              {enableBannerBoost ? (
                <div className="space-y-4">
                  {/* Banner Upload */}
                  {!uploadedBanner ? (
                    <div className="border-2 border-dashed border-orange-300 rounded-2xl p-8 text-center hover:border-orange-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                        id="banner-upload"
                      />
                      <label htmlFor="banner-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                        <p className="text-gray-600 mb-2 font-medium">Tải ảnh banner ngang</p>
                        <p className="text-sm text-gray-500">Khuyến nghị: 1200x400px (tỷ lệ 3:1)</p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative group">
                      <img src={uploadedBanner} alt="Banner" className="w-full aspect-[3/1] object-cover rounded-2xl border-2 border-orange-200" />
                      <button
                        onClick={() => setUploadedBanner(null)}
                        className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Benefits */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-gray-900 text-sm">Lợi ích Banner Boost:</span>
                    </div>
                    <ul className="space-y-1 text-xs text-gray-700">
                      <li>★ Hiển thị trên carousel banner trang chủ</li>
                      <li>★ Tăng lượt xem lên đến 5x</li>
                      <li>★ Ưu tiên trong 24 giờ đầu</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-gray-600 text-sm">
                    Tick checkbox phía trên để đưa sản phẩm lên banner trang chủ
                  </p>
                </div>
              )}

              {totalFeaturedCredits - (enableVideoUpload ? 1 : 0) === 0 && (
                <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 rounded-lg p-4 mt-4">
                  <AlertCircle className="w-4 h-4" />
                  <span>Không đủ credit nổi bật. Bỏ tick video hoặc mua thêm gói.</span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Credits & Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Credits Status */}
            <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg text-gray-900 mb-4">Credits Của Bạn</h3>
              <p className="text-xs text-gray-600 mb-6">Di chuột vào icon (i) để xem chi tiết</p>

              <div className="space-y-4 mb-6">
                <CreditDisplay type="posting" batches={userCreditBatches.posting} />
                <CreditDisplay type="featured" batches={userCreditBatches.featured} />
              </div>

              {/* Summary */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm text-gray-600 mb-4">Sẽ Sử Dụng:</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Đăng tin</span>
                    <span className="font-bold text-blue-600">-1</span>
                  </div>
                  {enableVideoUpload && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Video Shorts</span>
                      <span className="font-bold text-orange-600">-1</span>
                    </div>
                  )}
                  {enableBannerBoost && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Banner Nổi Bật</span>
                      <span className="font-bold text-orange-600">-1</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="text-sm text-gray-600 mb-2">Còn Lại:</div>
                    <div className="flex justify-between text-sm">
                      <span>Đăng tin:</span>
                      <span className="font-bold text-blue-600">{totalPostingCredits - 1}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Nổi bật:</span>
                      <span className="font-bold text-orange-600">{totalFeaturedCredits - totalFeaturedCreditsUsed}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white py-4 rounded-full hover:shadow-lg hover:scale-[1.02] transition-all">
                Đăng Sản Phẩm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
