import { useState, useEffect } from 'react';
import { Eye, EyeOff, Edit2, Trash2, X, CreditCard, TrendingUp, Clock, ArrowDownLeft, Package, Star, RefreshCw, Image, Sparkles, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getMyProductsAPI, toggleProductStatusAPI, deleteProductAPI, getMyDeletedProductsAPI } from '../../features/products/services/productApi';
import { ProductResponseDto } from '../../features/products/types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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

export default function ManageProductsPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'credits' | 'trash'>('products');
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<ProductResponseDto[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponseDto | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [creditTypeFilter, setCreditTypeFilter] = useState<CreditType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const [res, delRes] = await Promise.all([
        getMyProductsAPI(),
        getMyDeletedProductsAPI()
      ]);
      
      if (res.success) {
        setProducts(res.data.items || []);
      }
      if (delRes.success) {
        setDeletedProducts(delRes.data.items || []);
      }
    } catch (error: any) {
      toast.error('Không thể tải danh sách tin đăng.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublic = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Public' ? 'Private' : 'Public';
      const toastId = toast.loading('Đang cập nhật trạng thái...');
      const res = await toggleProductStatusAPI(id, newStatus);
      if (res.success) {
        toast.success('Cập nhật trạng thái thành công!', { id: toastId });
        setProducts((prev) => prev.map((p) => (p.productId === id ? { ...p, productStatus: newStatus } : p)));
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái.');
    }
  };

  const handleRestore = async (product: ProductResponseDto) => {
    try {
      const toastId = toast.loading('Đang khôi phục sản phẩm...');
      const res = await toggleProductStatusAPI(product.productId, 'Private'); // Restore as private
      if (res.success) {
        toast.success('Khôi phục thành công!', { id: toastId });
        setDeletedProducts((prev) => prev.filter(p => p.productId !== product.productId));
        setProducts((prev) => [{...product, productStatus: 'Private'}, ...prev]);
      }
    } catch (error) {
      toast.error('Lỗi khi khôi phục sản phẩm.');
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

  const publicProducts = products.filter((p) => p.productStatus === 'Public');
  const privateProducts = products.filter((p) => p.productStatus !== 'Public');

  const filteredHistory = MOCK_CREDIT_HISTORY.filter(
    (h) => creditTypeFilter === 'all' || h.creditType === creditTypeFilter
  );

  const totalPostingUsed = MOCK_CREDIT_HISTORY.filter(h => h.creditType === 'posting').reduce((s, h) => s + h.amount, 0);
  const totalFeaturedUsed = MOCK_CREDIT_HISTORY.filter(h => h.creditType === 'featured').reduce((s, h) => s + h.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
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
              <span>Tin Đăng ({products.length})</span>
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
          </div>
        </div>
      </div>

      {/* TAB: Tin Đăng */}
      {activeTab === 'products' && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Stats row */}
          <div className="flex items-center space-x-6 mb-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-700">Công khai: {publicProducts.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-gray-700">Riêng tư: {privateProducts.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-700">Tổng: {products.length} sản phẩm</span>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có sản phẩm nào</h3>
              <p className="text-gray-500">Bắt đầu đăng sản phẩm để quản lý tại đây</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <motion.div
                  key={product.productId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
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
                    <img src={product.imageUrl || 'https://via.placeholder.com/400'} alt={product.title} className="w-full h-48 object-cover" />
                    {product.isPremium && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-[#C4603A] to-[#d4724a] text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-semibold flex items-center gap-1.5 animate-pulse">
                        <span className="text-sm">✨</span>
                        <span>Premium</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {product.productStatus === 'Public' ? (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>Công khai</span>
                        </div>
                      ) : (
                        <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                          <EyeOff className="w-3 h-3" />
                          <span>Riêng tư</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
                    <p className="text-[#2D5A3D] font-bold text-lg mb-2">{product.price.toLocaleString()}đ</p>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.condition || 'Chưa cập nhật'}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className="bg-gray-100 px-2 py-1 rounded">{product.location || 'Chưa cập nhật'}</span>
                      <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                      <span>👁️ {product.viewCount} lượt xem</span>
                      <span>❤️ 0 lượt thích</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => togglePublic(product.productId, product.productStatus || 'Public')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
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
                        className="py-2 px-3 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all flex items-center justify-center space-x-1"
                      >
                        <Edit2 className="w-3 h-3" /><span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="py-2 px-3 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-all flex items-center justify-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" /><span>Xóa</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
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
                <motion.div
                  key={product.productId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
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
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
                    <p className="text-gray-500 font-bold text-lg mb-2">{product.price.toLocaleString()}đ</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      <span>Đã xóa vào: {new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-1">
                      <button
                        onClick={() => handleRestore(product)}
                        className="py-2 px-3 rounded-lg text-sm font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-all flex items-center justify-center space-x-2"
                      >
                        <RefreshCcw className="w-4 h-4" /><span>Khôi phục tin đăng</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
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
                <span className="text-4xl font-bold text-blue-600">35</span>
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
                <span className="text-4xl font-bold text-[#C4603A]">18</span>
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
                  Bạn có chắc chắn muốn xóa "{selectedProduct.title}"? Hành động này không thể hoàn tác.
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
    </div>
  );
}
