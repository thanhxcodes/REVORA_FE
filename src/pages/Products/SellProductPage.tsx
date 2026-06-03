import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Video, Image as ImageIcon, Sparkles, Crown, Upload, Info } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { uploadProductImagesAPI, createProductAPI, getMyCreditsAPI } from '../../features/products/services/productApi';

const categories = [
  { id: 1, name: 'Quần Áo' },
  { id: 2, name: 'Giày Dép' },
  { id: 3, name: 'Túi Xách' },
];
const conditions = ['Mới 100%', 'Như Mới', 'Tuyệt Vời', 'Tốt', 'Khá'];

// --- BỘ CÔNG CỤ ĐỌC SỐ TIỀN TIẾNG VIỆT ---
const DOCSO = {
  chuSo: ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"],
  tien: ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"],
  doc3so: function (so: number) {
    let tram = Math.floor(so / 100);
    let chuc = Math.floor((so % 100) / 10);
    let donVi = so % 10;
    let ketQua = "";

    if (tram === 0 && chuc === 0 && donVi === 0) return "";
    if (tram !== 0) {
      ketQua += this.chuSo[tram] + " trăm ";
      if (chuc === 0 && donVi !== 0) ketQua += "linh ";
    }
    if (chuc !== 0 && chuc !== 1) {
      ketQua += this.chuSo[chuc] + " mươi ";
      if (chuc === 0 && donVi !== 0) ketQua += "linh ";
    }
    if (chuc === 1) ketQua += "mười ";
    switch (donVi) {
      case 1:
        if (chuc > 1) ketQua += "mốt ";
        else ketQua += this.chuSo[donVi] + " ";
        break;
      case 5:
        if (chuc === 0) ketQua += this.chuSo[donVi] + " ";
        else ketQua += "lăm ";
        break;
      default:
        if (donVi !== 0) ketQua += this.chuSo[donVi] + " ";
        break;
    }
    return ketQua;
  },
  doc: function (so: number) {
    if (so === 0) return "Không đồng";
    if (so < 0) return "Số âm";
    let lan = 0;
    let i = 0;
    let ketQua = "";
    let viTri = [];

    while (so > 0) {
      viTri[lan] = so % 1000;
      so = Math.floor(so / 1000);
      lan++;
    }
    for (i = lan - 1; i >= 0; i--) {
      if (viTri[i] !== 0) {
        ketQua += this.doc3so(viTri[i]) + this.tien[i] + " ";
      }
    }
    return ketQua.replace(/\s+/g, ' ').trim();
  }
};

export default function SellProductPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    categoryId: 0,
    condition: '',
    price: 0, // Lưu số thực để gửi API
    brand: '',
    description: '',
  });

  // State phục vụ riêng cho UI Format Giá Tiền
  const [displayPrice, setDisplayPrice] = useState('');
  const [priceText, setPriceText] = useState('');

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [uploadedBanner, setUploadedBanner] = useState<string | null>(null);
  const [enableVideoUpload, setEnableVideoUpload] = useState(false);
  const [enableBannerBoost, setEnableBannerBoost] = useState(false);

  const [postingCredits, setPostingCredits] = useState(0);
  const [featuredCredits, setFeaturedCredits] = useState(0);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);

  const totalFeaturedCreditsUsed = (enableVideoUpload ? 1 : 0) + (enableBannerBoost ? 1 : 0);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await getMyCreditsAPI();
        if (res.success) {
          setPostingCredits(res.data.postingCredits);
          setFeaturedCredits(res.data.featuredCredits);
        }
      } catch (error) {
        toast.error("Không thể tải thông tin Credit. Vui lòng thử lại sau.");
      } finally {
        setIsLoadingCredits(false);
      }
    };
    fetchCredits();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- XỬ LÝ FORMAT & ĐỌC GIÁ TIỀN ---
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Chỉ lấy số
    
    if (value.length > 15) value = value.substring(0, 15); // Giới hạn 15 số

    if (!value) {
      setDisplayPrice('');
      setPriceText('');
      setFormData({ ...formData, price: 0 });
      return;
    }

    // Cập nhật text hiển thị có dấu phẩy
    setDisplayPrice(new Intl.NumberFormat('en-US').format(Number(value)));
    
    // Cập nhật raw data
    const numericValue = parseInt(value, 10);
    setFormData({ ...formData, price: numericValue });

    // Đọc số thành chữ
    if (!isNaN(numericValue)) {
      let text = DOCSO.doc(numericValue);
      if (text) {
        text = text.charAt(0).toUpperCase() + text.slice(1);
        setPriceText(text + ' đồng');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // VALIDATION: Tối đa 5 ảnh
    if (uploadedImages.length + files.length > 5) {
      return toast.error(`Bạn chỉ được tải lên tối đa 5 ảnh. Đang có sẵn ${uploadedImages.length} ảnh.`);
    }

    try {
      setIsUploadingImage(true);
      const toastId = toast.loading(`Đang tải ${files.length} ảnh lên máy chủ. Vui lòng đợi...`);
      
      const fileArray = Array.from(files);
      const result = await uploadProductImagesAPI(fileArray);
      
      if (result.success) {
        setUploadedImages(prev => [...prev, ...result.urls]);
        toast.success(`Đã tải thành công ${files.length} ảnh!`, { id: toastId });
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Lỗi khi tải ảnh lên.');
    } finally {
      setIsUploadingImage(false);
      // Reset thẻ input để có thể chọn lại cùng 1 file nếu vừa xóa
      e.target.value = ''; 
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedVideo('video-placeholder.mp4'); 
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedBanner('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200'); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- FULL VALIDATION TRƯỚC KHI SUBMIT ---
    if (formData.title.trim().length < 10) return toast.error('Tên sản phẩm phải có ít nhất 10 ký tự.');
    if (formData.categoryId === 0) return toast.error('Vui lòng chọn Danh mục.');
    if (!formData.condition) return toast.error('Vui lòng chọn Tình trạng sản phẩm.');
    if (formData.price < 1000) return toast.error('Giá sản phẩm tối thiểu là 1,000 VNĐ.');
    if (formData.description.trim().length < 20) return toast.error('Mô tả sản phẩm quá ngắn (tối thiểu 20 ký tự).');
    if (uploadedImages.length === 0) return toast.error('Vui lòng tải lên ít nhất 1 hình ảnh.');
    if (postingCredits < 1) return toast.error('Bạn đã hết Credit Đăng Tin.');
    if (enableVideoUpload && !uploadedVideo) return toast.error('Vui lòng chọn file Video Shorts.');
    if (enableBannerBoost && !uploadedBanner) return toast.error('Vui lòng chọn ảnh cho Banner nổi bật.');

    try {
      setIsSubmitting(true);
      const toastId = toast.loading('Đang xử lý đăng tin...');

      const payload = {
        categoryId: Number(formData.categoryId),
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        brand: formData.brand,
        condition: formData.condition,
        imageUrls: uploadedImages,
        enableVideoUpload: enableVideoUpload,
        videoUrl: enableVideoUpload ? uploadedVideo : null,
        enableBannerBoost: enableBannerBoost,
        bannerUrl: enableBannerBoost ? uploadedBanner : null
      };

      const result = await createProductAPI(payload);

      if (result.success) {
        toast.success('Sản phẩm của bạn đã được đăng thành công!', { id: toastId, duration: 3000 });
        setTimeout(() => navigate('/'), 2000); 
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster position="top-right" reverseOrder={false} />

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl text-gray-900 mb-4 font-bold">Đăng Sản Phẩm Thời Trang</h1>
          <p className="text-gray-600">Điền thông tin và chọn tính năng nâng cao để tăng hiệu quả hiển thị</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* THÔNG TIN SẢN PHẨM */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl text-gray-900 mb-6 font-semibold">Thông Tin Sản Phẩm</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-medium">Tên Sản Phẩm *</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    type="text"
                    placeholder="Ví dụ: Áo Khoác Da Vintage (Tối thiểu 10 ký tự)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 font-medium">Danh Mục *</label>
                    <select 
                      name="categoryId" 
                      value={formData.categoryId} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] transition-colors bg-white"
                    >
                      <option value={0}>Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 font-medium">Tình Trạng *</label>
                    <select 
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] transition-colors bg-white"
                    >
                      <option value="">Chọn tình trạng</option>
                      {conditions.map((cond) => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 font-medium">Giá (VNĐ) *</label>
                    <input
                      value={displayPrice}
                      onChange={handlePriceChange}
                      type="text"
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] transition-colors font-semibold text-gray-900"
                    />
                    {priceText && (
                      <p className="text-sm text-[#C4603A] mt-2 font-medium italic animate-fade-in">
                        {priceText}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 font-medium">Thương Hiệu</label>
                    <input
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      type="text"
                      placeholder="Ví dụ: Gucci, Chanel"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-medium">Mô Tả *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Mô tả chi tiết sản phẩm của bạn (Tối thiểu 20 ký tự)..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* HÌNH ẢNH SẢN PHẨM */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-gray-900 font-semibold">Hình Ảnh Sản Phẩm *</h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {uploadedImages.length}/5 ảnh
                </span>
              </div>

              {uploadedImages.length < 5 && (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-[#2D5A3D] hover:bg-[#2D5A3D]/5 transition-all cursor-pointer relative group mb-6">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  
                  {isUploadingImage ? (
                    <div className="text-[#2D5A3D] font-medium flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#2D5A3D] border-t-transparent rounded-full animate-spin"></div>
                      Đang đồng bộ ảnh lên hệ thống...
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 text-gray-400 group-hover:text-[#2D5A3D] mx-auto mb-3 transition-colors" />
                      <p className="text-gray-700 mb-1 font-medium">Nhấp hoặc kéo thả để tải ảnh lên</p>
                      <p className="text-xs text-gray-400">Bạn có thể chọn nhiều ảnh cùng lúc (Tối đa 5 ảnh)</p>
                    </>
                  )}
                </div>
              )}

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                  {uploadedImages.map((imgUrl, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-100 aspect-square">
                      <img src={imgUrl} alt={`Product ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== index))}
                        className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* VIDEO SHORTS PREMIUM */}
            <div className={`bg-white rounded-3xl shadow-sm p-8 border-2 transition-all ${
              enableVideoUpload ? 'border-[#2D5A3D] bg-[#2D5A3D]/[0.02]' : 'border-gray-100'
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${enableVideoUpload ? 'bg-[#2D5A3D] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Upload Video Shorts</h2>
                    <p className="text-sm text-gray-500">Tăng tương tác lên gấp 3 lần</p>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Dùng 1 Nổi Bật</span>
                  <input
                    type="checkbox"
                    checked={enableVideoUpload}
                    onChange={(e) => setEnableVideoUpload(e.target.checked)}
                    disabled={featuredCredits === 0}
                    className="w-5 h-5 accent-[#2D5A3D] rounded border-gray-300 cursor-pointer disabled:cursor-not-allowed"
                  />
                </label>
              </div>

              {enableVideoUpload && (
                <div>
                  {!uploadedVideo ? (
                    <div className="border-2 border-dashed border-[#2D5A3D]/30 rounded-2xl p-8 text-center relative bg-white hover:border-[#2D5A3D] transition-colors">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-8 h-8 text-[#2D5A3D] mx-auto mb-3" />
                      <p className="text-gray-700 font-medium mb-1">Click để đính kèm Video (Tối đa 30s)</p>
                      <p className="text-sm text-gray-400">MP4, MOV, AVI</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-[#2D5A3D]/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#2D5A3D]/10 p-2 rounded-lg">
                          <Video className="w-5 h-5 text-[#2D5A3D]" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">Video đã đính kèm</div>
                          <div className="text-xs text-gray-500">{uploadedVideo}</div>
                        </div>
                      </div>
                      <button type="button" onClick={() => setUploadedVideo(null)} className="text-gray-400 hover:text-red-500 transition-colors p-2"><X className="w-5 h-5" /></button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BANNER BOOST PREMIUM */}
            <div className={`bg-white rounded-3xl shadow-sm p-8 border-2 transition-all ${
              enableBannerBoost ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100'
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${enableBannerBoost ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Banner Nổi Bật</h2>
                    <p className="text-sm text-gray-500">Xuất hiện trên Carousel trang chủ 24h</p>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Dùng 1 Nổi Bật</span>
                  <input
                    type="checkbox"
                    checked={enableBannerBoost}
                    onChange={(e) => setEnableBannerBoost(e.target.checked)}
                    disabled={featuredCredits - (enableVideoUpload ? 1 : 0) === 0}
                    className="w-5 h-5 accent-orange-500 rounded border-gray-300 cursor-pointer disabled:cursor-not-allowed"
                  />
                </label>
              </div>

              {enableBannerBoost && (
                <div className="space-y-4">
                  {!uploadedBanner ? (
                    <div className="border-2 border-dashed border-orange-200 rounded-2xl p-8 text-center relative bg-white hover:border-orange-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                      <p className="text-gray-700 font-medium mb-1">Tải ảnh Banner ngang</p>
                      <p className="text-sm text-gray-400">Khuyến nghị: 1200x400px (Tỷ lệ 3:1)</p>
                    </div>
                  ) : (
                    <div className="relative group rounded-xl overflow-hidden border border-orange-100 shadow-sm">
                      <img src={uploadedBanner} alt="Banner" className="w-full aspect-[3/1] object-cover" />
                      <button type="button" onClick={() => setUploadedBanner(null)} className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all shadow-sm"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 items-start">
                    <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-orange-900 text-sm block mb-1">Đặc quyền Banner:</span>
                      <p className="text-xs text-orange-800/80 leading-relaxed">Tăng lượt tiếp cận khách hàng gấp 5 lần. Sản phẩm hiển thị nổi bật nhất ngay khi khách hàng vừa truy cập ứng dụng.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* SIDEBAR TÍNH TOÁN CREDIT BÊN PHẢI */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Credits Của Bạn</h3>
              
              {isLoadingCredits ? (
                <div className="animate-pulse space-y-4 mb-8">
                  <div className="h-16 bg-gray-100 rounded-2xl"></div>
                  <div className="h-16 bg-gray-100 rounded-2xl"></div>
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden group hover:border-blue-200 transition-colors">
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-blue-100/50 to-transparent"></div>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-blue-800/70 mb-0.5">Đăng Tin</div>
                        <div className="text-2xl font-bold text-blue-700 leading-none">{postingCredits}</div>
                      </div>
                    </div>
                    <button type="button" className="relative z-10 p-2 text-blue-400 hover:text-blue-600 transition-colors"><Info className="w-5 h-5" /></button>
                  </div>

                  <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden group hover:border-orange-200 transition-colors">
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-orange-100/50 to-transparent"></div>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-orange-800/70 mb-0.5">Nổi Bật</div>
                        <div className="text-2xl font-bold text-orange-600 leading-none">{featuredCredits}</div>
                      </div>
                    </div>
                    <button type="button" className="relative z-10 p-2 text-orange-400 hover:text-orange-600 transition-colors"><Info className="w-5 h-5" /></button>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Sẽ Sử Dụng:</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Đăng tin cơ bản</span>
                    <span className="font-bold text-blue-600">-1</span>
                  </div>
                  {enableVideoUpload && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Video Shorts</span>
                      <span className="font-bold text-orange-600">-1</span>
                    </div>
                  )}
                  {enableBannerBoost && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Banner Nổi Bật</span>
                      <span className="font-bold text-orange-600">-1</span>
                    </div>
                  )}

                  <div className="border-t border-dashed border-gray-200 pt-3 mt-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Còn Lại (Dự kiến):</div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Đăng tin:</span>
                      <span className="font-bold text-blue-600">{Math.max(0, postingCredits - 1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Nổi bật:</span>
                      <span className="font-bold text-orange-600">{Math.max(0, featuredCredits - totalFeaturedCreditsUsed)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || postingCredits < 1}
                className="w-full mt-8 bg-[#2D5A3D] text-white py-4 rounded-2xl font-semibold text-sm hover:bg-[#234830] hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Hệ thống đang tải...
                  </>
                ) : (
                  'Đăng Sản Phẩm'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}