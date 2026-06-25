import { useState, useEffect } from 'react';
import { Eye, EyeOff, Edit2, Trash2, X, CreditCard, TrendingUp, Clock, ArrowDownLeft, Package, Star, RefreshCw, Image, Sparkles, RefreshCcw, Heart, ChevronDown, ChevronUp, Info, CheckCircle, Video, Plus, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getMyProductsAPI, toggleProductStatusAPI, deleteProductAPI, getMyDeletedProductsAPI, renewProductAPI, uploadProductImagesAPI, changeShortStatusAPI, submitAppealAPI } from '../../features/products/services/productApi';
import { ProductResponseDto } from '../../features/products/types';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchMyUsageHistory, fetchUserCreditBatches } from '../../features/credits/services/creditPackageService';

type CreditType = 'posting' | 'featured';
type CreditAction = 'post_new' | 'renew' | 'boost_featured' | 'extend_featured';

interface CreditUsage {
  id: string;
  date: string;
  time: string;
  action: CreditAction;
  creditType: CreditType;
  amount: number;
  productName: string;
  productId: string;
  balanceAfter: number;
}

const MOCK_CREDIT_HISTORY: CreditUsage[] = [
  { id: 'CU001', date: '22/05/2026', time: '14:32', action: 'post_new', creditType: 'posting', amount: 1, productName: 'Giày Converse Chuck 70', productId: '5', balanceAfter: 34 },
  { id: 'CU002', date: '22/05/2026', time: '14:33', action: 'boost_featured', creditType: 'featured', amount: 1, productName: 'Giày Converse Chuck 70', productId: '5', balanceAfter: 17 },
  { id: 'CU003', date: '21/05/2026', time: '09:15', action: 'post_new', creditType: 'posting', amount: 1, productName: 'Áo Hoodie Supreme', productId: '4', balanceAfter: 35 },
  { id: 'CU004', date: '20/05/2026', time: '16:44', action: 'post_new', creditType: 'posting', amount: 1, productName: 'Túi Xách Da Cao Cấp', productId: '3', balanceAfter: 36 },
  { id: 'CU005', date: '20/05/2026', time: '16:50', action: 'boost_featured', creditType: 'featured', amount: 2, productName: 'Túi Xách Da Cao Cấp', productId: '3', balanceAfter: 18 },
  { id: 'CU006', date: '18/05/2026', time: '11:20', action: 'post_new', creditType: 'posting', amount: 1, productName: 'Giày Nike Air Force 1', productId: '2', balanceAfter: 37 },
  { id: 'CU007', date: '18/05/2026', time: '11:25', action: 'boost_featured', creditType: 'featured', amount: 1, productName: 'Giày Nike Air Force 1', productId: '2', balanceAfter: 20 },
  { id: 'CU008', date: '17/05/2026', time: '08:05', action: 'renew', creditType: 'posting', amount: 1, productName: 'Giày Nike Air Force 1', productId: '2', balanceAfter: 38 },
  { id: 'CU009', date: '15/05/2026', time: '10:00', action: 'post_new', creditType: 'posting', amount: 1, productName: 'Áo Khoác Da Vintage', productId: '1', balanceAfter: 39 },
  { id: 'CU010', date: '15/05/2026', time: '10:05', action: 'extend_featured', creditType: 'featured', amount: 3, productName: 'Áo Khoác Da Vintage', productId: '1', balanceAfter: 21 },
  { id: 'CU011', date: '14/05/2026', time: '19:30', action: 'renew', creditType: 'posting', amount: 1, productName: 'Áo Khoác Da Vintage', productId: '1', balanceAfter: 40 },
];

const actionConfig: Record<CreditAction, { label: string; icon: typeof Package; desc: string }> = {
  post_new:       { label: 'Đăng tin mới',       icon: Package,    desc: 'Dùng 1 credit để đăng sản phẩm mới' },
  renew:          { label: 'Gia hạn tin đăng',    icon: RefreshCw,  desc: 'Gia hạn hiển thị tin đã đăng' },
  boost_featured: { label: 'Bật nổi bật',         icon: Star,       desc: 'Kích hoạt badge nổi bật cho sản phẩm' },
  extend_featured:{ label: 'Gia hạn nổi bật',     icon: TrendingUp, desc: 'Gia hạn thêm thời gian nổi bật' },
};

const formatVNTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z'));
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function ManageProductsPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'shorts' | 'credits' | 'trash' | 'violated'>('products');
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<ProductResponseDto[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponseDto | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [productToToggle, setProductToToggle] = useState<ProductResponseDto | null>(null);
  const [creditTypeFilter, setCreditTypeFilter] = useState<CreditType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Filter state
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'public' | 'private' | 'expired' | 'violated' | 'normal' | 'premium'>('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [violatedProductsCount, setViolatedProductsCount] = useState(0);

  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealProduct, setAppealProduct] = useState<ProductResponseDto | null>(null);
  const [appealReason, setAppealReason] = useState('');
  const [isAppealing, setIsAppealing] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const [expandedProductIds, setExpandedProductIds] = useState<Set<number>>(new Set());
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [productToRenew, setProductToRenew] = useState<ProductResponseDto | null>(null);

  const [renewProductOption, setRenewProductOption] = useState(false);
  const [renewBannerOption, setRenewBannerOption] = useState(false);
  const [renewShortOption, setRenewShortOption] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [showRenewInfoModal, setShowRenewInfoModal] = useState(false);

  const isProductExpired = productToRenew?.productExpiredAt ? new Date(productToRenew.productExpiredAt + (productToRenew.productExpiredAt.endsWith('Z') ? '' : 'Z')).getTime() <= new Date().getTime() : false;

  useEffect(() => {
    if (!productToRenew) return;
    
    if (isProductExpired || renewShortOption) {
      setRenewProductOption(true);
    }
  }, [renewShortOption, productToRenew, isProductExpired]);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const renewProductId = searchParams.get('renewProductId');

  const [usageHistory, setUsageHistory] = useState<CreditUsage[]>([]);
  const [totalPostingRemaining, setTotalPostingRemaining] = useState(0);
  const [totalFeaturedRemaining, setTotalFeaturedRemaining] = useState(0);
  const [totalPostingPermanent, setTotalPostingPermanent] = useState(0);
  const [totalFeaturedPermanent, setTotalFeaturedPermanent] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchCreditData();
  }, [activeTab, productStatusFilter, page]);

  const fetchCreditData = async () => {
    try {
      setIsLoading(true);
      const [historyRes, summaryRes] = await Promise.all([
        fetchMyUsageHistory(),
        fetchUserCreditBatches()
      ]);
      
      if (historyRes.data.success) {
        setUsageHistory(historyRes.data.data || []);
      }
      
      const postingRemaining = summaryRes.posting.reduce((acc, b) => acc + b.credits, 0);
      const featuredRemaining = summaryRes.featured.reduce((acc, b) => acc + b.credits, 0);
      setTotalPostingRemaining(postingRemaining);
      setTotalFeaturedRemaining(featuredRemaining);

      const postingPerm = summaryRes.posting.filter(b => b.expiresDate === 'Vĩnh viễn').reduce((acc, b) => acc + b.credits, 0);
      const featuredPerm = summaryRes.featured.filter(b => b.expiresDate === 'Vĩnh viễn').reduce((acc, b) => acc + b.credits, 0);
      setTotalPostingPermanent(postingPerm);
      setTotalFeaturedPermanent(featuredPerm);
    } catch (error) {
      toast.error('Không tải được lịch sử credit.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const actualStatusFilter = activeTab === 'violated' ? 'violated' : productStatusFilter;
      const [res, delRes, violatedRes] = await Promise.all([
        getMyProductsAPI(actualStatusFilter, page, pageSize),
        getMyDeletedProductsAPI(),
        getMyProductsAPI('violated', 1, 1)
      ]);
      
      if (res.success) {
        setProducts(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalProductsCount(res.data.totalCount || 0);
      }
      if (delRes.success) {
        setDeletedProducts(delRes.data.items || []);
      }
      if (violatedRes && violatedRes.success) {
        setViolatedProductsCount(violatedRes.data.totalCount || 0);
      }
    } catch (error: any) {
      toast.error('Không thể tải danh sách tin đăng.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestTogglePublic = (product: ProductResponseDto) => {
    setProductToToggle(product);
    setShowToggleModal(true);
  };

  const confirmTogglePublic = async () => {
    if (!productToToggle) return;
    try {
      const newStatus = productToToggle.productStatus === 'Public' ? 'Private' : 'Public';
      const toastId = toast.loading('Đang cập nhật trạng thái...');
      const res = await toggleProductStatusAPI(productToToggle.productId, newStatus);
      if (res.success) {
        toast.success('Cập nhật trạng thái thành công!', { id: toastId });
        setProducts((prev) => prev.map((p) => (p.productId === productToToggle.productId ? { ...p, productStatus: newStatus } : p)));
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái.');
    } finally {
      setShowToggleModal(false);
      setProductToToggle(null);
    }
  };

  const handleToggleShortStatus = async (product: ProductResponseDto) => {
    if (!product.shortId) return;
    try {
      const newStatus = product.shortStatus === 'Active' ? 'Hidden' : 'Active';
      const toastId = toast.loading('Đang cập nhật trạng thái Video...');
      const res = await changeShortStatusAPI(product.shortId, newStatus);
      if (res.success) {
        toast.success('Cập nhật trạng thái Video thành công!', { id: toastId });
        setProducts((prev) => prev.map((p) => (p.productId === product.productId ? { ...p, shortStatus: newStatus } : p)));
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái Video.');
    }
  };

  const formatCountdown = (expiredAtStr?: string) => {
    if (!expiredAtStr) return '';
    const expiredAt = new Date(expiredAtStr + (expiredAtStr.endsWith('Z') ? '' : 'Z'));
    const now = new Date();
    const diffMs = expiredAt.getTime() - now.getTime();
    if (diffMs <= 0) return 'Đã hết hạn';
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      return `còn ${diffDays} ngày`;
    }
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `còn ${diffHours} giờ ${diffMins} phút`;
  };

  const handleRestore = async (product: ProductResponseDto) => {
    if (product.productStatus === 'AdminDeleted') {
      toast.error('Bài viết này đã bị quản trị viên xóa. Vui lòng liên hệ với quản trị viên để khôi phục.');
      return;
    }

    try {
      const toastId = toast.loading('Đang khôi phục sản phẩm...');
      const res = await toggleProductStatusAPI(product.productId, 'Private'); // Restore as private
      if (res.success) {
        toast.success('Khôi phục thành công!', { id: toastId });
        setDeletedProducts((prev) => prev.filter(p => p.productId !== product.productId));
        setProducts((prev) => [{...product, productStatus: 'Private'}, ...prev]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi khôi phục sản phẩm.');
    }
  };

  const openAppealModal = (product: ProductResponseDto) => {
    setAppealProduct(product);
    setAppealReason('');
    setShowAppealModal(true);
  };

  const handleAppealSubmit = async () => {
    if (!appealProduct) return;
    if (!appealReason.trim()) {
      toast.error('Vui lòng nhập lý do kháng cáo.');
      return;
    }

    try {
      setIsAppealing(true);
      const res = await submitAppealAPI(appealProduct.productId, appealReason);
      if (res.success) {
        toast.success('Gửi yêu cầu kháng cáo thành công.');
        setShowAppealModal(false);
        // Cập nhật local state
        setProducts(prev => prev.map(p => 
          p.productId === appealProduct.productId ? { ...p, productStatus: 'AppealPending' } : p
        ));
        setDeletedProducts(prev => prev.map(p => 
          p.productId === appealProduct.productId ? { ...p, productStatus: 'AppealPending' } : p
        ));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gửi kháng cáo thất bại.');
    } finally {
      setIsAppealing(false);
    }
  };

  const handleEdit = (product: ProductResponseDto) => {
    navigate(`/sell?edit=${product.productId}`);
  };

  const handleDelete = (product: ProductResponseDto) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      const toastId = toast.loading('Đang xóa sản phẩm...');
      const res = await deleteProductAPI(selectedProduct.productId);
      if (res.success) {
        toast.success('Xóa sản phẩm thành công!', { id: toastId });
        setProducts((prev) => prev.filter((p) => p.productId !== selectedProduct.productId));
        setDeletedProducts((prev) => [{...selectedProduct, productStatus: 'Deleted'}, ...prev]);
      }
    } catch (error) {
      toast.error('Lỗi khi xóa sản phẩm.');
    } finally {
      setShowDeleteModal(false);
      setSelectedProduct(null);
    }
  };

  const toggleExpand = (productId: number) => {
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const openRenewModal = (product: ProductResponseDto) => {
    setProductToRenew(product);
    
    // Kiểm tra nếu sản phẩm đã hết hạn
    const isExpired = product.productExpiredAt ? new Date(product.productExpiredAt + (product.productExpiredAt.endsWith('Z') ? '' : 'Z')).getTime() <= new Date().getTime() : false;
    
    setRenewProductOption(isExpired); // Tự động chọn nếu hết hạn, ngược lại không cho chọn
    setRenewBannerOption(false);
    setRenewShortOption(false);
    setShowRenewModal(true);
  };

  useEffect(() => {
    if (renewProductId && products.length > 0) {
      const prod = products.find(p => p.productId === Number(renewProductId));
      if (prod) {
        openRenewModal(prod);
        // Remove param from URL
        setSearchParams(new URLSearchParams());
      }
    }
  }, [renewProductId, products, setSearchParams]);

  const confirmRenew = async () => {
    if (!productToRenew) return;
    if (!renewProductOption && !renewBannerOption && !renewShortOption) {
      toast.error('Vui lòng chọn ít nhất một dịch vụ để gia hạn.');
      return;
    }
    
    setIsRenewing(true);
    const toastId = toast.loading('Đang xử lý gia hạn...');
    try {
      const res = await renewProductAPI(productToRenew.productId, {
        renewProduct: renewProductOption,
        renewBanner: renewBannerOption,
        renewShort: renewShortOption,
        newBannerUrl: undefined
      });

      if (res.success) {
        toast.success('Gia hạn thành công!', { id: toastId });
        setShowRenewModal(false);
        fetchProducts(); // Refresh list to get new dates
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi gia hạn sản phẩm.', { id: toastId });
    } finally {
      setIsRenewing(false);
    }
  };

  const filteredHistory = usageHistory.filter(
    (h) => creditTypeFilter === 'all' || h.creditType === creditTypeFilter
  );

  const totalPostingUsed = usageHistory.filter(h => h.creditType === 'posting').reduce((s, h) => s + h.amount, 0);
  const totalFeaturedUsed = usageHistory.filter(h => h.creditType === 'featured').reduce((s, h) => s + h.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <h1 className="text-2xl font-bold text-gray-900">Quản Lí Tin Đăng</h1>
          <p className="text-gray-600 text-sm mt-0.5">Quản lý sản phẩm và theo dõi lịch sử sử dụng credit</p>

          {/* Tabs */}
          <div className="flex items-center space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'products'
                  ? 'bg-[#2D5A3D] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Tin Đăng</span>
            </button>
            <button
              onClick={() => setActiveTab('shorts')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'shorts'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Short Video</span>
            </button>
            <button
              onClick={() => setActiveTab('credits')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'credits'
                  ? 'bg-[#2D5A3D] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Lịch Sử Credit</span>
            </button>
            <button
              onClick={() => setActiveTab('trash')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'trash'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Thùng Rác ({deletedProducts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('violated')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'violated'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Vi phạm ({violatedProductsCount})</span>
            </button>
          </div>

          {/* Filter & Stats (Moved to Sticky Header) */}
          {(activeTab === 'products' || activeTab === 'violated') && (
            <div className="mt-4 flex items-center justify-between bg-gray-50/50 p-2 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2 text-sm px-2">
                <span className="text-gray-700 font-medium">Tổng: {totalProductsCount} sản phẩm</span>
              </div>
              <div>
                <select
                  value={productStatusFilter}
                  onChange={(e) => {
                    setProductStatusFilter(e.target.value as any);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="public">Công khai</option>
                  <option value="private">Riêng tư</option>
                  <option value="expired">Hết hạn</option>
                  <option value="normal">Bài viết thường</option>
                  <option value="premium">Bài viết nổi bật</option>
                  {activeTab === 'violated' && <option value="violated">Vi phạm</option>}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TAB: Tin Đăng */}
      {(activeTab === 'products' || activeTab === 'violated') && (
        <div className="max-w-7xl mx-auto px-4 py-6">

          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có sản phẩm nào</h3>
              <p className="text-gray-500">Bắt đầu đăng sản phẩm để quản lý tại đây</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const isExpired = product.productExpiredAt && new Date(product.productExpiredAt + (product.productExpiredAt.endsWith('Z') ? '' : 'Z')).getTime() <= new Date().getTime();
                return (
                <div
                  key={product.productId}
                  className={`relative bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all ${
                    product.isPremium ? 'ring-2 ring-[#C4603A] border-transparent shadow-[0_0_20px_rgba(196,96,58,0.3)]' : 'border-gray-200'
                  }`}
                >
                  {product.isPremium && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C4603A]/10 to-transparent animate-[shimmer_3s_ease-in-out_infinite]"
                        style={{ backgroundSize: '200% 100%' }} />
                    </div>
                  )}
                  <div className="relative">
                    <img src={product.imageUrl || 'https://via.placeholder.com/400'} alt={product.title} className={`w-full h-48 object-cover ${isExpired ? 'grayscale' : ''}`} />
                    {isExpired && <div className="absolute inset-0 bg-red-900/10"></div>}
                    {product.isPremium && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-[#C4603A] to-[#d4724a] text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-semibold flex items-center gap-1.5 animate-pulse">
                        <span className="text-sm">✨</span>
                        <span>Premium</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
                      {isExpired && (
                        <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-sm">
                          <Clock className="w-3 h-3" />
                          <span>Đã hết hạn</span>
                        </div>
                      )}
                      {!isExpired && product.productStatus === 'Public' ? (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-sm">
                          <Eye className="w-3 h-3" />
                          <span>Công khai</span>
                        </div>
                      ) : !isExpired && product.productStatus === 'Violated' ? (
                        <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-sm">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Vi phạm</span>
                        </div>
                      ) : !isExpired && product.productStatus === 'AppealPending' ? (
                        <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-sm">
                          <Clock className="w-3 h-3" />
                          <span>Chờ kháng cáo</span>
                        </div>
                      ) : !isExpired ? (
                        <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-sm">
                          <EyeOff className="w-3 h-3" />
                          <span>Riêng tư</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
                    <p className="text-[#2D5A3D] font-bold text-lg mb-2">{product.price.toLocaleString()}đ</p>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.condition || 'Chưa cập nhật'}</p>
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">{product.location || 'Chưa cập nhật'}</span>
                        <span className="font-medium text-[#2D5A3D]">Ngày đăng: {formatVNTime(product.createdAt)}</span>
                      </div>
                      {product.productExpiredAt && (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Hết hạn: {formatVNTime(product.productExpiredAt)}</span>
                          <span className="text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded">{formatCountdown(product.productExpiredAt)}</span>
                        </div>
                      )}
                      
                      <div className="mt-2 border-t border-gray-100 pt-3">
                        <button 
                          onClick={() => toggleExpand(product.productId)}
                          className="flex items-center space-x-1 text-sm font-semibold text-gray-700 hover:text-[#2D5A3D] transition-colors"
                        >
                          <span>Xem thêm</span>
                          {expandedProductIds.has(product.productId) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {expandedProductIds.has(product.productId) && (
                        <div className="mt-2 space-y-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          {product.bannerExpiredAt ? (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-600">Hạn Banner:</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{formatVNTime(product.bannerExpiredAt)}</span>
                                <span className="text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded text-[10px]">{formatCountdown(product.bannerExpiredAt)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-600">Hạn Banner:</span>
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-400 italic">Không dùng</span>
                                <button onClick={() => handleEdit(product)} className="w-5 h-5 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-colors ml-1" title="Thêm Banner">
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                          {product.shortExpiredAt ? (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-600">Hạn Video Short:</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{formatVNTime(product.shortExpiredAt)}</span>
                                <span className="text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded text-[10px]">{formatCountdown(product.shortExpiredAt)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-600">Hạn Video Short:</span>
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-400 italic">Không dùng</span>
                                <button onClick={() => handleEdit(product)} className="w-5 h-5 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-colors ml-1" title="Thêm Video Short">
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                          {product.highlightExpiredAt ? (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-600">Hạn Viền Nổi Bật:</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{formatVNTime(product.highlightExpiredAt)}</span>
                                <span className="text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded text-[10px]">{formatCountdown(product.highlightExpiredAt)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-600">Hạn Viền Nổi Bật:</span>
                              <span className="text-gray-400 italic">Không dùng</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                      <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-blue-500"/> {product.viewCount} lượt xem</span>
                      <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-red-500"/> {product.likeCount || 0} lượt thích</span>
                    </div>

                    {product.productStatus === 'Violated' || product.productStatus === 'AppealPending' ? (
                      <div className="grid grid-cols-2 gap-2">
                        {product.productStatus === 'Violated' ? (
                          <>
                            <button
                              onClick={() => handleEdit(product)}
                              className="py-2.5 px-2 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all flex items-center justify-center space-x-1 border border-blue-200 shadow-sm"
                            >
                              <Edit2 className="w-4 h-4" /><span>Sửa bài</span>
                            </button>
                            <button
                              onClick={() => openAppealModal(product)}
                              className="py-2.5 px-2 rounded-xl text-sm font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 transition-all flex items-center justify-center space-x-1 border border-orange-200 shadow-sm"
                            >
                              <AlertTriangle className="w-4 h-4" /><span>Gửi duyệt lại</span>
                            </button>
                          </>
                        ) : (
                          <div className="col-span-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gray-50 text-gray-500 flex items-center justify-center space-x-2 w-full border border-gray-200 cursor-not-allowed">
                            <Clock className="w-4 h-4" /><span>Đang chờ Admin duyệt kháng cáo</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          onClick={() => requestTogglePublic(product)}
                          className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                            product.productStatus === 'Public' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {product.productStatus === 'Public' ? (
                            <span className="flex items-center justify-center space-x-1">
                              <EyeOff className="w-3 h-3" /><span>Ẩn</span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center space-x-1">
                              <Eye className="w-3 h-3" /><span>Hiện</span>
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="py-2 px-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all flex items-center justify-center space-x-1"
                        >
                          <Edit2 className="w-3 h-3" /><span>Sửa</span>
                        </button>
                        <button
                          onClick={() => openRenewModal(product)}
                          className="py-2 px-2 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all flex items-center justify-center space-x-1"
                        >
                          <RefreshCw className="w-3 h-3" /><span>Gia hạn</span>
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="py-2 px-2 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-all flex items-center justify-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" /><span>Xóa</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-gray-700">Trang {page} / {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB: Short Video */}
      {activeTab === 'shorts' && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-6 mb-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">Sản phẩm có Video: {products.filter(p => p.shortId).length}</span>
            </div>
          </div>

          {products.filter(p => p.shortId).length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📹</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có sản phẩm nào đính kèm Video</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter(p => p.shortId).map((product) => (
                <div
                  key={product.productId}
                  className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="relative">
                    <img src={product.imageUrl || 'https://via.placeholder.com/400'} alt={product.title} className="w-full h-48 object-cover" />
                    <div className="absolute top-2 right-2">
                      {product.shortStatus === 'Active' ? (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>Video Đang Hiện</span>
                        </div>
                      ) : (
                        <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                          <EyeOff className="w-3 h-3" />
                          <span>Video Đang Ẩn</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Trạng thái sản phẩm: <span className={product.productStatus === 'Public' ? 'text-green-600' : 'text-gray-500'}>{product.productStatus === 'Public' ? 'Công khai' : 'Riêng tư'}</span></span>
                      </div>
                      {product.shortExpiredAt && (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Hết hạn Video: {formatVNTime(product.shortExpiredAt)}</span>
                          <span className="text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded">{formatCountdown(product.shortExpiredAt)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleToggleShortStatus(product)}
                        className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center space-x-1 ${
                          product.shortStatus === 'Active' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        {product.shortStatus === 'Active' ? (
                          <><EyeOff className="w-4 h-4" /><span>Ẩn Video</span></>
                        ) : (
                          <><Eye className="w-4 h-4" /><span>Hiện Video</span></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Thùng Rác */}
      {activeTab === 'trash' && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-6 mb-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 font-semibold">Thùng rác: {deletedProducts.length} sản phẩm</span>
            </div>
          </div>

          {deletedProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 text-gray-300"><Trash2 className="w-16 h-16 mx-auto mb-2 opacity-30" /></div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Thùng rác trống</h3>
              <p className="text-gray-500">Các sản phẩm bạn xóa sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deletedProducts.map((product) => (
                <div
                  key={product.productId}
                  className="relative bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden opacity-90 hover:opacity-100 transition-all"
                >
                  <div className="relative">
                    <img src={product.imageUrl || 'https://via.placeholder.com/400'} alt={product.title} className="w-full h-48 object-cover grayscale" />
                    <div className="absolute inset-0 bg-red-900/10"></div>
                    <div className="absolute top-2 right-2">
                      <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <Trash2 className="w-3 h-3" />
                        <span>Đã Xóa</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-xs font-bold py-1.5 text-center shadow-sm">
                      Còn {(() => {
                        if (!product.deletedAt) return 30;
                        const dDate = new Date(product.deletedAt + (product.deletedAt.endsWith('Z') ? '' : 'Z'));
                        const now = new Date();
                        const diffTime = Math.abs(now.getTime() - dDate.getTime());
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        const left = 30 - diffDays;
                        return left > 0 ? left : 0;
                      })()} ngày trước khi bị xóa vĩnh viễn
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
                    <p className="text-gray-500 font-bold text-lg mb-2">{product.price.toLocaleString()}đ</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      <span>Đã xóa vào: {product.deletedAt ? new Date(product.deletedAt + (product.deletedAt.endsWith('Z') ? '' : 'Z')).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')}</span>
                    </div>

                    {product.productStatus === 'AdminDeleted' ? (
                      <div className="flex flex-col gap-2">
                        <div className="py-2 px-3 rounded-lg text-sm font-semibold bg-red-50 text-red-700 text-center border border-red-100 leading-snug">
                           Bài viết đã bị quản trị viên xóa do vi phạm nghiêm trọng quy định.
                        </div>
                      </div>
                    ) : product.productStatus === 'AppealPending' ? (
                      <div className="flex flex-col gap-2">
                        <div className="py-2 px-3 rounded-lg text-sm font-semibold bg-gray-50 text-gray-500 flex items-center justify-center space-x-2 border border-gray-200 cursor-not-allowed">
                           <Clock className="w-4 h-4" /><span>Đang chờ Admin duyệt kháng cáo</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1">
                        <button
                          onClick={() => handleRestore(product)}
                          className="py-2 px-3 rounded-lg text-sm font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-all flex items-center justify-center space-x-2"
                        >
                          <RefreshCcw className="w-4 h-4" /><span>Khôi phục tin đăng</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Lịch Sử Credit */}
      {activeTab === 'credits' && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-5">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Image className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-blue-700">Credit Đăng Tin</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-blue-600">{totalPostingRemaining}</span>
                <span className="text-sm text-gray-600">còn lại</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">Đã dùng: <span className="font-semibold">{totalPostingUsed}</span> credits</div>
            </div>
            <div className="bg-orange-50 rounded-2xl border-2 border-orange-200 p-5">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-[#C4603A]" />
                </div>
                <span className="text-sm font-semibold text-[#C4603A]">Credit Nổi Bật</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-[#C4603A]">{totalFeaturedRemaining}</span>
                <span className="text-sm text-gray-600">còn lại</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">Đã dùng: <span className="font-semibold">{totalFeaturedUsed}</span> credits</div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-medium">Lọc theo:</span>
            {(['all', 'posting', 'featured'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setCreditTypeFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  creditTypeFilter === f
                    ? f === 'posting'
                      ? 'bg-blue-600 text-white'
                      : f === 'featured'
                      ? 'bg-[#C4603A] text-white'
                      : 'bg-[#2D5A3D] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Tất cả' : f === 'posting' ? 'Credit Đăng Tin' : 'Credit Nổi Bật'}
              </button>
            ))}
          </div>

          {/* History list */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#2D5A3D]" />
              <span className="text-sm font-semibold text-gray-800">Lịch sử trừ credit</span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{filteredHistory.length} giao dịch</span>
            </div>

            <div className="divide-y divide-gray-50">
              {filteredHistory.map((item) => {
                const action = actionConfig[item.action];
                const isPosting = item.creditType === 'posting';
                const CreditIcon = isPosting ? Image : Sparkles;

                return (
                  <div key={item.id} className="px-5 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPosting ? 'bg-blue-50' : 'bg-orange-50'}`}>
                        <CreditIcon className={`w-5 h-5 ${isPosting ? 'text-blue-600' : 'text-[#C4603A]'}`} />
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-900">{action.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isPosting ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {isPosting ? 'Đăng Tin' : 'Nổi Bật'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center space-x-1.5">
                          <span className="truncate max-w-48">{item.productName}</span>
                          <span className="text-gray-300">·</span>
                          <span>{item.date} {item.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deduction */}
                    <div className="text-right flex-shrink-0">
                      <div className={`flex items-center space-x-1 justify-end font-bold text-sm ${isPosting ? 'text-blue-600' : 'text-[#C4603A]'}`}>
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        <span>-{item.amount} credit</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Còn lại: <span className="font-medium text-gray-600">{item.balanceAfter}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredHistory.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Không có lịch sử nào</p>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Xóa Sản Phẩm?</h2>
                <p className="text-gray-600">
                  Bạn có chắc chắn muốn xóa "{selectedProduct.title}"? <br/>
                  <span className="text-red-500 font-semibold mt-1 block">Bài viết sẽ tự động bị xóa vĩnh viễn sau 30 ngày.</span>
                </p>
              </div>

              <div className="flex space-x-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button onClick={confirmDelete} className="flex-1 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-lg transition-shadow">
                  Xóa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Confirmation Modal */}
      <AnimatePresence>
        {showToggleModal && productToToggle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowToggleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {productToToggle.productStatus === 'Public' ? (
                    <EyeOff className="w-8 h-8 text-blue-600" />
                  ) : (
                    <Eye className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {productToToggle.productStatus === 'Public' ? 'Ẩn Sản Phẩm?' : 'Hiện Sản Phẩm?'}
                </h2>
                <p className="text-gray-600">
                  Bạn có chắc chắn muốn {productToToggle.productStatus === 'Public' ? 'ẩn' : 'hiển thị'} "{productToToggle.title}" không?
                </p>
              </div>

              <div className="flex space-x-3">
                <button onClick={() => setShowToggleModal(false)} className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button onClick={confirmTogglePublic} className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:shadow-lg transition-shadow">
                  Đồng ý
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Renew Modal */}
      <AnimatePresence>
        {showRenewModal && productToRenew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => !isRenewing && setShowRenewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl my-8"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-gray-900">Gia Hạn Dịch Vụ</h2>
                  <button onClick={() => setShowRenewInfoModal(true)} className="text-blue-500 hover:text-blue-600 transition-colors p-1">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
                <button onClick={() => !isRenewing && setShowRenewModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-4">
                <div className="flex-1">
                  <span className="text-xs text-blue-700 font-semibold block">Credit Đăng Tin vĩnh viễn</span>
                  <span className="text-lg font-bold text-blue-800">{totalPostingPermanent}</span>
                </div>
                <div className="flex-1 border-l border-blue-200 pl-4">
                  <span className="text-xs text-blue-700 font-semibold block">Credit Nổi Bật vĩnh viễn</span>
                  <span className="text-lg font-bold text-blue-800">{totalFeaturedPermanent}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột 1: Lựa chọn dịch vụ */}
                <div className="flex flex-col">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm đang chọn</label>
                    <input type="text" value={productToRenew.title} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 font-medium" />
                  </div>

                  <div className="space-y-4">
                    {/* Renew Product */}
                    <label className={`flex items-start space-x-3 p-3 border rounded-xl transition-colors ${(isRenewing || isProductExpired || renewShortOption) ? 'opacity-70 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'}`}>
                      <input type="checkbox" checked={renewProductOption} onChange={(e) => setRenewProductOption(e.target.checked)} className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300" disabled={isRenewing || isProductExpired || renewShortOption} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="block text-sm font-semibold text-gray-900">Gia hạn Sản Phẩm</span>
                          {isProductExpired && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Đã hết hạn</span>}
                        </div>
                        <span className="block text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Image className="w-3.5 h-3.5 text-blue-500" /> Tốn 1 Credit Đăng Tin vĩnh viễn</span>
                      </div>
                    </label>

                {/* Renew Banner */}
                {!!productToRenew.bannerExpiredAt && (
                  <label className="flex items-start space-x-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <input type="checkbox" checked={renewBannerOption} onChange={(e) => setRenewBannerOption(e.target.checked)} className="mt-1 w-4 h-4 text-orange-500 rounded border-gray-300" disabled={isRenewing} />
                    <div>
                      <span className="block text-sm font-semibold text-gray-900">Gia hạn Banner (+24h)</span>
                      <span className="block text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-orange-500" /> Tốn 1 Credit Nổi Bật vĩnh viễn</span>
                    </div>
                  </label>
                )}

                {/* Renew Short */}
                {!!productToRenew.shortExpiredAt && (
                  <label className="flex items-start space-x-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" checked={renewShortOption} onChange={(e) => setRenewShortOption(e.target.checked)} className="mt-1 w-4 h-4 text-orange-500 rounded border-gray-300" disabled={isRenewing} />
                  <div>
                    <span className="block text-sm font-semibold text-gray-900">Gia hạn Short Video</span>
                    <span className="block text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-orange-500" /> Tốn 1 Credit Nổi Bật vĩnh viễn (Không hỗ trợ đổi Video)</span>
                  </div>
                  </label>
                )}
              </div>
            </div>

              {/* Cột 2: Tổng kết */}
              <div className="flex flex-col h-full">
                <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 h-full flex flex-col justify-center">
                  <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#2D5A3D]" />
                    Dự kiến sau khi gia hạn
                  </h3>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 mb-4">
                    <div className="flex justify-between items-center text-sm mb-3">
                      <span className="text-gray-600 flex items-center gap-1.5"><Image className="w-4 h-4 text-blue-500" /> Credit Đăng Tin:</span>
                      <span className={`font-bold text-base ${renewProductOption ? 'text-red-600' : 'text-gray-400'}`}>
                        {renewProductOption ? '-1' : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-orange-500" /> Credit Nổi Bật:</span>
                      <span className={`font-bold text-base ${(renewBannerOption || renewShortOption) ? 'text-red-600' : 'text-gray-400'}`}>
                        -{(renewBannerOption ? 1 : 0) + (renewShortOption ? 1 : 0)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-[#2D5A3D] font-medium bg-green-50/70 p-4 rounded-xl border border-green-100/50 flex-grow flex flex-col justify-center">
                    {(() => {
                      let productDays = 0;
                      let highlightDays = 0;
                      
                      if (renewShortOption) {
                        productDays = 60;
                        highlightDays = 60;
                      }
                      else if (renewProductOption && renewBannerOption) {
                        productDays = 60;
                        highlightDays = 60;
                      }
                      else if (renewProductOption) {
                        productDays = 30;
                      }
                      else if (renewBannerOption) {
                        productDays = 30;
                        highlightDays = 30;
                      }

                      const results = [];
                      if (productDays > 0) results.push(`+ ${productDays} ngày Sản Phẩm`);
                      if (renewShortOption) results.push(`+ 60 ngày Video Short`);
                      if (renewBannerOption) results.push(`+ 24 giờ Banner`);
                      if (highlightDays > 0) results.push(`+ ${highlightDays} ngày Viền Nổi Bật`);
                      
                      if (results.length === 0) return <span className="text-gray-500 font-normal italic text-center w-full block">Vui lòng chọn dịch vụ để xem trước.</span>;
                      return results.map((res, i) => <div key={i} className="flex items-center space-x-2"><CheckCircle className="w-4 h-4 text-[#2D5A3D] flex-shrink-0" /><span>{res}</span></div>);
                    })()}
                  </div>
                </div>
              </div>
            </div>

              <div className="mt-6 flex space-x-3">
                <button onClick={() => setShowRenewModal(false)} disabled={isRenewing} className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50">
                  Hủy
                </button>
                <button onClick={confirmRenew} disabled={isRenewing} className="flex-1 py-2.5 rounded-lg bg-[#2D5A3D] text-white font-semibold hover:bg-[#2D5A3D]/90 transition-colors disabled:opacity-50">
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Renew Info Modal */}
      {showRenewInfoModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowRenewInfoModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Quy định Gia hạn Dịch vụ</h3>
              </div>
              <button onClick={() => setShowRenewInfoModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-gray-50/30">
              <div className="space-y-4 text-sm text-gray-700">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="font-semibold text-gray-900 mb-1">1. Gia hạn Sản phẩm (Cơ bản)</p>
                  <p className="text-gray-600">Sử dụng <strong>1 Credit Đăng tin</strong>, gia hạn thời gian tồn tại của sản phẩm thêm <strong>30 ngày</strong>.</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="font-semibold text-gray-900 mb-1">2. Gia hạn Banner (Nổi bật)</p>
                  <p className="text-gray-600">Sử dụng <strong>1 Credit Nổi bật</strong>, gia hạn thời gian hiển thị Banner VIP thêm <strong>24 giờ</strong>. <span className="text-[#2D5A3D] font-medium block mt-1">🎁 Đặc biệt: Sản phẩm của bạn được cộng thêm miễn phí 30 ngày (không mất thêm Credit Đăng tin).</span></p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="font-semibold text-gray-900 mb-1">3. Gia hạn Video Short</p>
                  <p className="text-gray-600">Sử dụng <strong>1 Credit Nổi bật</strong> & <strong>1 Credit Đăng tin</strong>. Hệ thống sẽ gia hạn thêm <strong>60 ngày</strong> cho cả Video Short và Sản phẩm của bạn.</p>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <p className="font-semibold text-blue-900 mb-2">Lưu ý quan trọng:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-blue-800/80">
                    <li><strong>Điều kiện Credit:</strong> Chỉ có thể sử dụng Credit vĩnh viễn để gia hạn dịch vụ. Credit có thời hạn chỉ dùng để đăng tin mới.</li>
                    <li>Nếu sản phẩm <strong>đã hết hạn</strong>, bạn bắt buộc phải gia hạn Sản phẩm.</li>
                    <li>Gia hạn nhiều dịch vụ cùng lúc, thời hạn sản phẩm sẽ được ưu tiên theo mức cao nhất (ví dụ: 60 ngày nếu có gia hạn Short Video).</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="p-6 pt-4 bg-white border-t border-gray-100">
              <button onClick={() => setShowRenewInfoModal(false)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Appeal Modal */}
      <AnimatePresence>
        {showAppealModal && appealProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="bg-orange-50 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Kháng cáo vi phạm</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Sản phẩm <span className="font-semibold">"{appealProduct.title}"</span> đã bị đánh dấu vi phạm. Hãy cho chúng tôi biết lý do vì sao bạn cho rằng sản phẩm này hợp lệ.
                </p>
              </div>
              <div className="p-6">
                <textarea
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 min-h-[100px] resize-none"
                  placeholder="Nhập lý do kháng cáo của bạn..."
                  value={appealReason}
                  onChange={e => setAppealReason(e.target.value)}
                />
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowAppealModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleAppealSubmit}
                    disabled={isAppealing}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {isAppealing ? 'Đang gửi...' : 'Gửi kháng cáo'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
