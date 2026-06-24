import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Info, Trash2, Tag, Briefcase, Camera, Video, ArrowLeft, Gem, Upload, X, Crown, Image as ImageIcon, Sparkles, FileText, ShoppingBag, Shirt, Scissors } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import toast, { Toaster } from 'react-hot-toast';
import { uploadProductImagesAPI, uploadProductVideoAPI, createProductAPI, getMyCreditsAPI, getCategoriesAPI, getProductDetailAPI, updateProductAPI } from '../../features/products/services/productApi';
import CreditDisplay from '../../components/common/CreditDisplay';
import RenewModal from '../../features/products/components/RenewModal';
import InsufficientCreditsModal from '../../features/products/components/InsufficientCreditsModal';
import { fetchUserCreditBatches } from '../../features/credits/services/creditPackageService';
import { ProductDetailResponseDto } from '../../features/products/types';
import type { CreditBatch } from '../../features/credits/types';

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

function SpotlightCard({ children, className = '', ...props }: any) {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl ${className}`}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-500 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(45, 90, 61, 0.05),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

export default function SellProductPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [formData, setFormData] = useState({
    title: '',
    categoryId: 0,
    condition: '',
    price: 0,
    brand: '',
    description: '',
  });

  const [displayPrice, setDisplayPrice] = useState('');
  const [priceText, setPriceText] = useState('');

  const [categories, setCategories] = useState<{ categoryId: number, name: string }[]>([]);

  const [acceptRules, setAcceptRules] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [uploadedBanner, setUploadedBanner] = useState<string | null>(null);

  const [isShortActive, setIsShortActive] = useState(false);
  const [isBannerActive, setIsBannerActive] = useState(false);

  const [hasShortHistory, setHasShortHistory] = useState(false);
  const [hasBannerHistory, setHasBannerHistory] = useState(false);

  const [productToRenew, setProductToRenew] = useState<ProductDetailResponseDto | null>(null);
  const [showRenewModal, setShowRenewModal] = useState(false);
  
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditModalType, setCreditModalType] = useState<'posting' | 'featured'>('posting');

  const [enableVideoUpload, setEnableVideoUpload] = useState(false);
  const [enableBannerBoost, setEnableBannerBoost] = useState(false);

  const [postingCredits, setPostingCredits] = useState(0);
  const [featuredCredits, setFeaturedCredits] = useState(0);
  const [userCreditBatches, setUserCreditBatches] = useState<{ posting: CreditBatch[]; featured: CreditBatch[] }>({
    posting: [],
    featured: [],
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Thêm state lưu thời gian tạo sản phẩm và phút còn lại để sửa
  const [productCreatedAt, setProductCreatedAt] = useState<string | null>(null);
  const [editTimeLeft, setEditTimeLeft] = useState<number | null>(null);

  const totalFeaturedCreditsUsed = (enableVideoUpload ? 1 : 0) + (enableBannerBoost ? 1 : 0);

  const isAddingNewBanner = isEditMode && !hasBannerHistory && enableBannerBoost;
  const isAddingNewShort = isEditMode && !hasShortHistory && enableVideoUpload;
  const isAddingAnyNew = isAddingNewBanner || isAddingNewShort;

  const getHighlightDurationString = () => {
    if (!productCreatedAt) return "30 ngày 0 giờ";
    const utcDateStr = productCreatedAt + (productCreatedAt.endsWith('Z') ? '' : 'Z');
    const createdDate = new Date(utcDateStr).getTime();
    const now = new Date().getTime();
    const remainingMs = Math.max(0, (30 * 24 * 60 * 60 * 1000) - (now - createdDate));
    const extra30DaysMs = 30 * 24 * 60 * 60 * 1000;
    const totalRemainingMs = remainingMs + extra30DaysMs;
    const days = Math.floor(totalRemainingMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((totalRemainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    return `${days} ngày ${hours} giờ`;
  };

  const highlightDurationString = getHighlightDurationString();
  const newFeaturedCreditsUsed = (isAddingNewShort ? 1 : 0) + (isAddingNewBanner ? 1 : 0);

  // LOAD ĐỒNG THỜI CATEGORIES VÀ CREDITS TỪ BACKEND
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);

      // Reset form immediately when switching route/mode to prevent state bleeding
      setFormData({
        title: '',
        categoryId: 0,
        condition: '',
        price: 0,
        brand: '',
        description: '',
      });
      setDisplayPrice('');
      setPriceText('');
      setUploadedImages([]);
      setUploadedVideo(null);
      setUploadedBanner(null);
      setEnableVideoUpload(false);
      setEnableBannerBoost(false);
      setHasShortHistory(false);
      setHasBannerHistory(false);
      setIsShortActive(false);
      setIsBannerActive(false);
      setProductCreatedAt(null);
      setEditTimeLeft(null);
      setProductToRenew(null);

      try {
        const [creditRes, categoryRes, batchesRes] = await Promise.all([
          getMyCreditsAPI(),
          getCategoriesAPI(),
          fetchUserCreditBatches()
        ]);

        if (creditRes.success) {
          setPostingCredits(creditRes.data.postingCredits);
          setFeaturedCredits(creditRes.data.featuredCredits);
          
          if (!isEditMode && creditRes.data.postingCredits < 1) {
            setCreditModalType('posting');
            setShowCreditModal(true);
          }
        }
        if (batchesRes) {
          setUserCreditBatches(batchesRes);
        }
        if (categoryRes.success) {
          setCategories(categoryRes.data);
        }

        if (isEditMode && editId) {
          const detailRes = await getProductDetailAPI(editId);
          if (detailRes.success) {
            const prod = detailRes.data;
            setProductToRenew(prod);
            const matchedCategory = categoryRes.data?.find((c: any) => c.name === prod.categoryName)?.categoryId || 0;
            
            setFormData({
              title: prod.title || '',
              categoryId: matchedCategory,
              condition: prod.condition || '',
              price: prod.price || 0,
              brand: prod.brand || '',
              description: prod.description || '',
            });

            setDisplayPrice(new Intl.NumberFormat('en-US').format(prod.price));
            if (prod.price) {
              let text = DOCSO.doc(prod.price);
              if (text) setPriceText(text.charAt(0).toUpperCase() + text.slice(1) + ' đồng');
            }

            setUploadedImages(prod.imageUrls || []);
            if (prod.videoUrl) {
              setEnableVideoUpload(true);
              setUploadedVideo(prod.videoUrl);
            }
            if (prod.isPremium || prod.bannerUrl) {
              setEnableBannerBoost(true);
              if (prod.bannerUrl) setUploadedBanner(prod.bannerUrl);
            }
            
            if (prod.shortExpiredAt) {
              setHasShortHistory(true);
              const shortExp = new Date(prod.shortExpiredAt + (prod.shortExpiredAt.endsWith('Z') ? '' : 'Z')).getTime();
              if (shortExp > new Date().getTime()) setIsShortActive(true);
            }
            if (prod.bannerExpiredAt) {
              setHasBannerHistory(true);
              const bannerExp = new Date(prod.bannerExpiredAt + (prod.bannerExpiredAt.endsWith('Z') ? '' : 'Z')).getTime();
              if (bannerExp > new Date().getTime()) setIsBannerActive(true);
            }
            
            if (prod.createdAt) {
              setProductCreatedAt(prod.createdAt);
            }
          }
        }
      } catch (error) {
        toast.error("Không thể tải dữ liệu hệ thống.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [isEditMode, editId]);

  useEffect(() => {
    if (isEditMode && productCreatedAt) {
      const calculateTimeLeft = () => {
        // Appending 'Z' if missing ensures it's parsed as UTC if backend returns UTC string without Z
        const utcDateStr = productCreatedAt + (productCreatedAt.endsWith('Z') ? '' : 'Z');
        const createdDate = new Date(utcDateStr);
        const now = new Date();
        const diffMs = now.getTime() - createdDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const remaining = 30 - diffMins;
        setEditTimeLeft(remaining > 0 ? remaining : 0);
      };

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 60000); // Cập nhật mỗi phút
      return () => clearInterval(interval);
    }
  }, [isEditMode, productCreatedAt]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 15) value = value.substring(0, 15);

    if (!value) {
      setDisplayPrice('');
      setPriceText('');
      setFormData({ ...formData, price: 0 });
      return;
    }

    setDisplayPrice(new Intl.NumberFormat('en-US').format(Number(value)));
    const numericValue = parseInt(value, 10);
    setFormData({ ...formData, price: numericValue });

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

    if (uploadedImages.length + files.length > 5) {
      return toast.error(`Tối đa 5 ảnh. Đang có sẵn ${uploadedImages.length} ảnh.`);
    }

    try {
      setIsUploadingImage(true);
      const toastId = toast.loading(`Đang tải ${files.length} ảnh lên máy chủ...`);

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
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      toast.error('Dung lượng video không được vượt quá 30MB.');
      e.target.value = '';
      return;
    }

    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';

    videoElement.onloadedmetadata = async () => {
      window.URL.revokeObjectURL(videoElement.src);

      if (videoElement.duration > 61) {
        toast.error('Video của bạn không được dài quá 1 phút (60 giây).');
        e.target.value = '';
        return;
      }

      try {
        setIsUploadingVideo(true);
        const toastId = toast.loading('Đang xử lý và tải Video Shorts lên máy chủ...');

        const result = await uploadProductVideoAPI(file);

        if (result.success) {
          setUploadedVideo(result.url);
          toast.success('Tải Video thành công!', { id: toastId });
        }
      } catch (error: any) {
        toast.dismiss();
        toast.error(error.response?.data?.message || 'Lỗi mạng khi tải video.');
      } finally {
        setIsUploadingVideo(false);
        e.target.value = '';
      }
    };
    videoElement.src = URL.createObjectURL(file);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBanner(true);
      const toastId = toast.loading('Đang thiết lập Banner Nổi Bật...');

      const result = await uploadProductImagesAPI([file]);

      if (result.success && result.urls.length > 0) {
        setUploadedBanner(result.urls[0]);
        toast.success('Banner đã sẵn sàng!', { id: toastId });
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Lỗi khi tải ảnh banner.');
    } finally {
      setIsUploadingBanner(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return toast.error('Vui lòng nhập Tên sản phẩm.');
    if (formData.categoryId === 0) return toast.error('Vui lòng chọn Danh mục.');
    if (!formData.condition) return toast.error('Vui lòng chọn Tình trạng sản phẩm.');
    if (formData.price < 1000) return toast.error('Giá sản phẩm tối thiểu là 1,000 VNĐ.');
    if (!formData.description.trim()) return toast.error('Vui lòng nhập Mô tả sản phẩm.');
    if (uploadedImages.length === 0) return toast.error('Vui lòng tải lên ít nhất 1 hình ảnh.');
    
    if (!isEditMode) {
      if (postingCredits < 1) {
        setCreditModalType('posting');
        setShowCreditModal(true);
        return;
      }
      if (enableVideoUpload && !uploadedVideo) return toast.error('Vui lòng chọn file Video Shorts.');
      if (enableBannerBoost && !uploadedBanner) return toast.error('Vui lòng chọn ảnh cho Banner nổi bật.');
      if (totalFeaturedCreditsUsed > featuredCredits) {
        setCreditModalType('featured');
        setShowCreditModal(true);
        return;
      }
    } else {
      if (newFeaturedCreditsUsed > featuredCredits) {
        setCreditModalType('featured');
        setShowCreditModal(true);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const toastId = toast.loading(isEditMode ? 'Hệ thống đang cập nhật tin đăng của bạn...' : 'Hệ thống đang xuất bản tin đăng của bạn...');

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

      let result;
      if (isEditMode && editId) {
          result = await updateProductAPI(editId, payload);
      } else {
          result = await createProductAPI(payload);
      }

      if (result.success) {
        window.dispatchEvent(new Event('revora_credit_updated'));
        toast.success(isEditMode ? 'Sản phẩm đã được cập nhật thành công!' : 'Sản phẩm của bạn đã được đăng thành công!', { id: toastId, duration: 3000 });
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
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background decorations for the white area */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
        <motion.div 
          animate={{ x: [-30, 30, -30], y: [-30, 30, -30] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2D5A3D]/5 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ x: [30, -30, 30], y: [30, -30, 30] }} 
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-[#C4603A]/5 rounded-full blur-[80px]" 
        />
        <motion.div
          animate={{ rotate: [0, 10, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-10 text-[#2D5A3D] opacity-[0.03]"
        >
           <Shirt className="w-[400px] h-[400px]" />
        </motion.div>
        <motion.div
          animate={{ rotate: [0, -10, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-10 text-[#C4603A] opacity-[0.03]"
        >
           <ShoppingBag className="w-[300px] h-[300px]" />
        </motion.div>
      </div>

      {/* ── Premium Dark Hero Header ── */}
      <div
        className="relative z-10 bg-[#0b1a12] overflow-hidden pt-12 pb-24"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.08) 2px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* Ambient glows and Stars & Fashion Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <Sparkles className="absolute top-10 left-[15%] w-5 h-5 text-emerald-400 opacity-60 animate-pulse" />
          <Sparkles className="absolute top-24 right-[20%] w-4 h-4 text-orange-400 opacity-40 animate-ping delay-300" />
          <Sparkles className="absolute bottom-16 left-[25%] w-6 h-6 text-emerald-300 opacity-50 animate-pulse delay-150" />
          
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-8 right-[10%] text-[#C4603A] opacity-20">
            <ShoppingBag className="w-16 h-16" />
          </motion.div>
          <motion.div animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-12 left-[8%] text-[#2D5A3D] opacity-20">
            <Shirt className="w-20 h-20" />
          </motion.div>
          <motion.div animate={{ y: [0, -8, 0], rotate: [15, 25, 15] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 left-[30%] text-emerald-500 opacity-10">
            <Scissors className="w-12 h-12" />
          </motion.div>

          <div className="absolute -top-24 left-1/3 w-[500px] h-[500px] bg-[#2D5A3D]/25 rounded-full blur-[120px]" />
          <div className="absolute top-8 right-1/4 w-64 h-64 bg-[#C4603A]/12 rounded-full blur-[80px]" />
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(45,90,61,0.4), transparent)' }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center relative"
          >
            {isEditMode && (
              <button
                type="button"
                onClick={() => navigate('/manage-products')}
                className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-white hover:text-emerald-300 transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Quay lại</span>
              </button>
            )}
            <h1 className="text-4xl md:text-[52px] font-black text-white mb-4 tracking-tight">
              {isEditMode ? 'Chỉnh Sửa ' : 'Đăng Sản Phẩm '}
              <span className="italic" style={{ background: 'linear-gradient(90deg, #4ade80, #86efac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Thời Trang
              </span>
            </h1>
            <p className="text-gray-400 text-base max-w-xl mx-auto">
              {isEditMode ? 'Chỉnh sửa thông tin sản phẩm của bạn' : 'Điền thông tin và chọn tính năng nâng cao để tối đa hóa lượt tiếp cận'}
            </p>
          </motion.div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 z-10 pb-16">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >

            {/* THÔNG TIN SẢN PHẨM */}
            <SpotlightCard className="bg-white shadow-sm border border-gray-100 p-8">
              
              {isEditMode && editTimeLeft !== null && (
                <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${editTimeLeft > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                  <Info className={`w-5 h-5 shrink-0 ${editTimeLeft > 0 ? 'text-amber-500' : 'text-red-500'}`} />
                  <div>
                    <h3 className="font-semibold text-sm">
                      {editTimeLeft > 0 ? `Bạn còn ${editTimeLeft} phút để sửa toàn bộ thông tin` : 'Đã hết thời gian sửa Tên và Danh mục'}
                    </h3>
                    <p className="text-sm mt-1">
                      Theo quy định, bạn có 30 phút sau khi đăng để sửa mọi thông tin. Sau thời gian này, Tên sản phẩm và Danh mục không thể thay đổi.
                    </p>
                  </div>
                </div>
              )}

              <h2 className="text-xl text-gray-900 mb-6 font-semibold">Thông Tin Sản Phẩm</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-medium">Tên Sản Phẩm *</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    type="text"
                    disabled={isEditMode && editTimeLeft === 0}
                    placeholder="Ví dụ: Áo Khoác Da Vintage"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#2D5A3D]/10 focus:border-[#2D5A3D] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 font-medium">Danh Mục *</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      disabled={isLoadingData || (isEditMode && editTimeLeft === 0)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#2D5A3D]/10 focus:border-[#2D5A3D] transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value={0}>{isLoadingData ? "Đang tải danh mục..." : "Chọn danh mục"}</option>
                      {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 font-medium">Tình Trạng *</label>
                    <select name="condition" value={formData.condition} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#2D5A3D]/10 focus:border-[#2D5A3D] transition-all bg-white">
                      <option value="">Chọn tình trạng</option>
                      {conditions.map((cond) => <option key={cond} value={cond}>{cond}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 font-medium">Giá (VNĐ) *</label>
                    <input value={displayPrice} onChange={handlePriceChange} type="text" placeholder="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#2D5A3D]/10 focus:border-[#2D5A3D] transition-all font-semibold text-gray-900" />
                    {priceText && <p className="text-sm text-[#C4603A] mt-2 font-medium italic animate-fade-in">{priceText}</p>}
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700 font-medium">Thương Hiệu</label>
                    <input name="brand" value={formData.brand} onChange={handleChange} type="text" placeholder="Ví dụ: Gucci, Chanel" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2D5A3D]/10 focus:border-[#2D5A3D] transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-medium">Mô Tả *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Mô tả chi tiết sản phẩm của bạn..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#2D5A3D]/10 focus:border-[#2D5A3D] transition-all resize-none" />
                </div>
              </div>
            </SpotlightCard>

            {/* HÌNH ẢNH SẢN PHẨM */}
            <SpotlightCard className="bg-white shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-gray-900 font-semibold">Hình Ảnh Sản Phẩm *</h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{uploadedImages.length}/5 ảnh</span>
              </div>

              {uploadedImages.length < 5 && (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-[#2D5A3D] hover:bg-[#2D5A3D]/5 transition-all cursor-pointer relative group mb-6 hover:shadow-inner">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                  {isUploadingImage ? (
                    <div className="text-[#2D5A3D] font-medium flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#2D5A3D] border-t-transparent rounded-full animate-spin"></div>
                      Đang đồng bộ ảnh lên hệ thống...
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 text-gray-400 group-hover:text-[#2D5A3D] mx-auto mb-3 transition-colors" />
                      <p className="text-gray-700 mb-1 font-medium">Nhấp hoặc kéo thả để tải ảnh lên</p>
                      <p className="text-xs text-gray-400">Bạn có thể chọn tối đa 5 ảnh cùng lúc</p>
                    </>
                  )}
                </div>
              )}

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                  {uploadedImages.map((imgUrl, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-100 aspect-square">
                      <img src={imgUrl} alt={`Product ${index}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== index))} className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </SpotlightCard>

            {/* VIDEO SHORTS PREMIUM */}
            <SpotlightCard className={`bg-white shadow-sm p-8 border-2 transition-all ${(isEditMode && hasShortHistory && !isShortActive) ? 'opacity-80' : ''} ${enableVideoUpload ? 'border-[#2D5A3D] bg-[#2D5A3D]/[0.02]' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${enableVideoUpload ? 'bg-[#2D5A3D] text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Tính năng Video Shorts</h2>
                      <p className="text-sm text-gray-500">Người dùng sẽ xem review ngay trên bảng feed</p>
                    </div>
                  </div>
                  {isEditMode ? (
                    hasShortHistory ? (
                      isShortActive ? (
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-full whitespace-nowrap">Sửa Video (Còn hạn)</span>
                      ) : (
                        <div className="flex items-center gap-2 pointer-events-auto">
                          <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-full whitespace-nowrap">Đã hết hạn</span>
                          <button type="button" onClick={() => setShowRenewModal(true)} className="text-xs font-bold text-white bg-[#2D5A3D] hover:bg-[#2D5A3D]/90 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors shadow-sm">
                            Gia hạn ngay
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-3 pointer-events-auto">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full whitespace-nowrap">Chưa có</span>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Dùng 1 Nổi Bật</span>
                          <input type="checkbox" checked={enableVideoUpload} onChange={(e) => {
                            if (e.target.checked && featuredCredits - (enableBannerBoost ? 1 : 0) <= 0) {
                              setCreditModalType('featured');
                              setShowCreditModal(true);
                            } else {
                              setEnableVideoUpload(e.target.checked);
                            }
                          }} className="w-5 h-5 accent-[#2D5A3D] rounded border-gray-300 cursor-pointer" />
                        </label>
                      </div>
                    )
                  ) : (
                    <label className="flex items-center gap-3 cursor-pointer group pointer-events-auto">
                      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Dùng 1 Nổi Bật</span>
                      <input type="checkbox" checked={enableVideoUpload} onChange={(e) => {
                        if (e.target.checked && featuredCredits - (enableBannerBoost ? 1 : 0) <= 0) {
                          setCreditModalType('featured');
                          setShowCreditModal(true);
                        } else {
                          setEnableVideoUpload(e.target.checked);
                        }
                      }} className="w-5 h-5 accent-[#2D5A3D] rounded border-gray-300 cursor-pointer" />
                    </label>
                  )}
                </div>

                  {enableVideoUpload && (
                    <div>
                      {!uploadedVideo ? (
                        <div className="border-2 border-dashed border-[#2D5A3D]/30 rounded-2xl p-8 text-center relative bg-white hover:border-[#2D5A3D] transition-colors">
                          <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={isUploadingVideo} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                          {isUploadingVideo ? (
                            <div className="text-[#2D5A3D] font-medium flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-4 border-[#2D5A3D] border-t-transparent rounded-full animate-spin"></div>
                              Đang tải lên và mã hóa Video...
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-[#2D5A3D] mx-auto mb-3" />
                              <p className="text-gray-700 font-medium mb-1">Click tải lên Video (Tối đa 1 phút, 30MB)</p>
                              <p className="text-sm text-gray-400">MP4, MOV, AVI</p>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="relative group rounded-xl overflow-hidden border border-[#2D5A3D]/20 shadow-sm aspect-video bg-black flex items-center justify-center">
                          <video src={uploadedVideo} controls className="w-full h-full object-contain" />
                          <button type="button" onClick={() => setUploadedVideo(null)} className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-500 p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-all shadow-md"><X className="w-5 h-5" /></button>
                        </div>
                      )}
                    </div>
                  )}
            </SpotlightCard>
            {/* BANNER BOOST PREMIUM */}
            <SpotlightCard className={`bg-white shadow-sm p-8 border-2 transition-all ${(isEditMode && hasBannerHistory && !isBannerActive) ? 'opacity-80' : ''} ${enableBannerBoost ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${enableBannerBoost ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Tính năng Banner VIP</h2>
                      <p className="text-sm text-gray-500">Chiếm trọn sự chú ý trong 24 giờ đầu</p>
                    </div>
                  </div>
                  {isEditMode ? (
                    hasBannerHistory ? (
                      isBannerActive ? (
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-full whitespace-nowrap">Sửa Ảnh (Còn hạn)</span>
                      ) : (
                        <div className="flex items-center gap-2 pointer-events-auto">
                          <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-full whitespace-nowrap">Đã hết hạn</span>
                          <button type="button" onClick={() => setShowRenewModal(true)} className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors shadow-sm">
                            Gia hạn ngay
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-3 pointer-events-auto">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full whitespace-nowrap">Chưa có</span>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Dùng 1 Nổi Bật</span>
                          <input type="checkbox" checked={enableBannerBoost} onChange={(e) => {
                            if (e.target.checked && featuredCredits - (enableVideoUpload ? 1 : 0) <= 0) {
                              setCreditModalType('featured');
                              setShowCreditModal(true);
                            } else {
                              setEnableBannerBoost(e.target.checked);
                            }
                          }} className="w-5 h-5 accent-orange-500 rounded border-gray-300 cursor-pointer" />
                        </label>
                      </div>
                    )
                  ) : (
                    <label className="flex items-center gap-3 cursor-pointer group pointer-events-auto">
                      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Dùng 1 Nổi Bật</span>
                      <input type="checkbox" checked={enableBannerBoost} onChange={(e) => {
                        if (e.target.checked && featuredCredits - (enableVideoUpload ? 1 : 0) <= 0) {
                          setCreditModalType('featured');
                          setShowCreditModal(true);
                        } else {
                          setEnableBannerBoost(e.target.checked);
                        }
                      }} className="w-5 h-5 accent-orange-500 rounded border-gray-300 cursor-pointer" />
                    </label>
                  )}
                </div>

                  {enableBannerBoost && (
                    <div className="space-y-4">
                      {!uploadedBanner ? (
                        <div className="border-2 border-dashed border-orange-200 rounded-2xl p-8 text-center relative bg-white hover:border-orange-400 transition-colors">
                          <input type="file" accept="image/*" onChange={handleBannerUpload} disabled={isUploadingBanner} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                          {isUploadingBanner ? (
                            <div className="text-orange-500 font-medium flex flex-col items-center gap-3">
                              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                              Đang tạo Banner...
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                              <p className="text-gray-700 font-medium mb-1">Tải ảnh Banner nằm ngang (Tỷ lệ 3:1)</p>
                              <p className="text-sm text-gray-400">Được dùng làm ảnh bìa cỡ lớn trên App</p>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="relative group rounded-xl overflow-hidden border border-orange-100 shadow-sm">
                          <img src={uploadedBanner} alt="Banner" className="w-full aspect-[3/1] object-cover" />
                          <button type="button" onClick={() => setUploadedBanner(null)} className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-500 p-2 rounded-full hover:bg-red-50 transition-all shadow-sm"><X className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  )}
            </SpotlightCard>
          </motion.div>

          {/* SIDEBAR TÍNH TOÁN CREDIT BÊN PHẢI */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <SpotlightCard className="bg-white shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Credits Của Bạn</h3>

              {isLoadingData ? (
                <div className="animate-pulse space-y-4 mb-8">
                  <div className="h-16 bg-gray-100 rounded-2xl"></div>
                  <div className="h-16 bg-gray-100 rounded-2xl"></div>
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  <CreditDisplay type="posting" batches={userCreditBatches.posting} className="w-full" />
                  <CreditDisplay type="featured" batches={userCreditBatches.featured} className="w-full" />
                </div>
              )}

              {(!isEditMode || isAddingAnyNew) && (
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Chi Phí Dự Kiến:</h4>
                    <div className="space-y-3">
                      {!isEditMode && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Phí lên sàn</span>
                          <span className="font-bold text-blue-600">-1</span>
                        </div>
                      )}
                      {(!isEditMode && enableVideoUpload || isAddingNewShort) && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Tích hợp Video Shorts</span>
                          <span className="font-bold text-orange-600">-1</span>
                        </div>
                      )}
                      {(!isEditMode && enableBannerBoost || isAddingNewBanner) && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Banner VIP</span>
                          <span className="font-bold text-orange-600">-1</span>
                        </div>
                      )}

                      <div className="border-t border-dashed border-gray-200 pt-3 mt-4">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Số dư khả dụng sau khi lưu:</div>
                        {!isEditMode && (
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Đăng tin:</span>
                            <span className="font-bold text-blue-600">{Math.max(0, postingCredits - 1)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm mb-4">
                          <span className="text-gray-600">Nổi bật:</span>
                          <span className="font-bold text-orange-600">{Math.max(0, featuredCredits - (!isEditMode ? totalFeaturedCreditsUsed : newFeaturedCreditsUsed))}</span>
                        </div>
                        <div className="space-y-2 text-sm bg-green-50 p-3 rounded-xl border border-green-100 mt-4">
                          <div className="text-green-800 font-semibold mb-1">Dự kiến thời gian hiển thị:</div>
                          {!isEditMode ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-green-700 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Bài đăng:</span>
                                <span className="font-bold text-green-700">+ {totalFeaturedCreditsUsed > 0 ? 60 : 30} ngày</span>
                              </div>
                              {enableBannerBoost && (
                                <div className="flex justify-between">
                                  <span className="text-green-700 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Banner VIP:</span>
                                  <span className="font-bold text-green-700">+ 24 giờ</span>
                                </div>
                              )}
                              {enableVideoUpload && (
                                <div className="flex justify-between">
                                  <span className="text-green-700 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Video Short:</span>
                                  <span className="font-bold text-green-700">+ 60 ngày</span>
                                </div>
                              )}
                              {(enableBannerBoost || enableVideoUpload) && (
                                <div className="flex justify-between">
                                  <span className="text-green-700 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Viền nổi bật:</span>
                                  <span className="font-bold text-green-700">+ 60 ngày</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span className="text-green-700 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Bài đăng:</span>
                                <span className="font-bold text-green-700">+ 30 ngày</span>
                              </div>
                              {isAddingNewBanner && (
                                <div className="flex justify-between">
                                  <span className="text-green-700 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Banner VIP:</span>
                                  <span className="font-bold text-green-700">+ 24 giờ</span>
                                </div>
                              )}
                              {isAddingNewShort && (
                                <div className="flex justify-between">
                                  <span className="text-green-700 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Video Short:</span>
                                  <span className="font-bold text-green-700">+ {highlightDurationString}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-green-700 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Viền nổi bật:</span>
                                <span className="font-bold text-green-700">+ {highlightDurationString}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
              )}

              <div className="mt-6 flex items-start gap-3">
                <input 
                  type="checkbox" 
                  id="acceptRules" 
                  checked={acceptRules} 
                  onChange={(e) => setAcceptRules(e.target.checked)} 
                  className="mt-1 w-5 h-5 accent-[#2D5A3D] rounded border-gray-300 cursor-pointer" 
                />
                <label htmlFor="acceptRules" className="text-sm text-gray-600 cursor-pointer select-none">
                  Tôi đã đọc và đồng ý với <span onClick={(e) => { e.preventDefault(); setShowRulesModal(true); }} className="text-[#2D5A3D] font-semibold hover:underline">Quy định đăng tin</span>
                </label>
              </div>

              <motion.button
                whileHover={!isSubmitting && acceptRules ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isSubmitting && acceptRules ? { scale: 0.98 } : {}}
                type="submit"
                disabled={isSubmitting || !acceptRules}
                onClick={(e) => {
                  if (!isEditMode && postingCredits < 1) {
                    e.preventDefault();
                    setCreditModalType('posting');
                    setShowCreditModal(true);
                  }
                }}
                className="w-full mt-5 bg-[#2D5A3D] text-white py-4 rounded-2xl font-semibold text-sm hover:bg-[#234830] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{isEditMode ? 'Đang cập nhật...' : 'Hệ thống đang xuất bản...'}</>
                ) : (
                  isEditMode ? 'Lưu Thay Đổi' : 'Đăng Sản Phẩm'
                )}
              </motion.button>
            </SpotlightCard>
          </motion.div>
        </div>
      </form>

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2D5A3D]/10 flex items-center justify-center text-[#2D5A3D]">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Quy định đăng tin</h3>
              </div>
              <button onClick={() => setShowRulesModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-5 text-sm text-gray-600">
                <div className="flex gap-3">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#2D5A3D] shrink-0" />
                  <p><strong className="text-gray-900">Thời gian chỉnh sửa:</strong> 30 phút sau khi đăng tin, bạn được phép sửa tất cả thông tin. Sau 30 phút, bạn sẽ không thể thay đổi <strong className="text-gray-900">Tên sản phẩm</strong> và <strong className="text-gray-900">Danh mục</strong>.</p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#2D5A3D] shrink-0" />
                  <p><strong className="text-gray-900">Sản phẩm Cơ bản (1 Credit Đăng tin):</strong> Mặc định hiển thị liên tục trên hệ thống trong vòng 30 ngày.</p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#2D5A3D] shrink-0" />
                  <p><strong className="text-gray-900">Sản phẩm Nổi bật (Sử dụng Credit Nổi bật):</strong> Sản phẩm của bạn sẽ được ưu tiên hiển thị trong 60 ngày, có viền nổi bật bắt mắt, và cơ hội xuất hiện trên Bảng Xếp Hạng (BXH) Tuần.</p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#2D5A3D] shrink-0" />
                  <p><strong className="text-gray-900">Sử dụng Credit:</strong> Đăng tin có thể dùng cả Credit có thời hạn và vĩnh viễn. Tuy nhiên, việc gia hạn tin đăng chỉ chấp nhận Credit vĩnh viễn.</p>
                </div>
                <p className="pt-2 text-xs italic text-gray-500 text-center border-t border-gray-100">Việc tuân thủ quy định giúp tạo ra môi trường giao dịch minh bạch và an toàn cho mọi người.</p>
              </div>
            </div>
            <div className="p-6 pt-4 bg-gray-50 border-t border-gray-100">
              <button onClick={() => { setAcceptRules(true); setShowRulesModal(false); }} className="w-full bg-[#2D5A3D] text-white py-3 rounded-xl font-semibold hover:bg-[#234830] transition-colors">
                Đã hiểu & Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {productToRenew && (
        <RenewModal
          isOpen={showRenewModal}
          onClose={() => setShowRenewModal(false)}
          productToRenew={productToRenew}
          totalPostingPermanent={userCreditBatches.posting.filter(b => b.isPermanent).reduce((acc, curr) => acc + curr.quantity, 0)}
          totalFeaturedPermanent={userCreditBatches.featured.filter(b => b.isPermanent).reduce((acc, curr) => acc + curr.quantity, 0)}
          onRenewSuccess={() => {
            setShowRenewModal(false);
            if (editId) getProductDetailAPI(editId).then(res => {
              if (res.success) {
                setProductToRenew(res.data);
                if (res.data.shortExpiredAt) {
                  setHasShortHistory(true);
                  const shortExp = new Date(res.data.shortExpiredAt + (res.data.shortExpiredAt.endsWith('Z') ? '' : 'Z')).getTime();
                  if (shortExp > new Date().getTime()) setIsShortActive(true);
                }
                if (res.data.bannerExpiredAt) {
                  setHasBannerHistory(true);
                  const bannerExp = new Date(res.data.bannerExpiredAt + (res.data.bannerExpiredAt.endsWith('Z') ? '' : 'Z')).getTime();
                  if (bannerExp > new Date().getTime()) setIsBannerActive(true);
                }
              }
            });
          }}
        />
      )}

      <InsufficientCreditsModal 
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        type={creditModalType}
      />
    </div>
  );
} 