import React, { useState, useMemo } from 'react';
import { Package, RefreshCw, Edit2, EyeOff, Eye, Heart, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toggleProductStatusAPI, getProductDetailAPI } from '../../../../features/products/services/productApi';
import toast from 'react-hot-toast';
import { ProductListCard } from './ProductListCard';
import { ProductResponseDto } from '../../../../features/products/types';
import { useAuth } from '../../../../providers/authProvider/AuthContext';
import { useWishlist } from '../../../../providers/wishlistProvider/WishlistContext';

interface ProductsTabProps {
  products: ProductResponseDto[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  isOwnProfile?: boolean;
  sellerAvatarFallback?: string;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  isLoading,
  error,
  onRetry,
  isOwnProfile = false,
  sellerAvatarFallback,
}) => {
  const [sortBy, setSortBy] = useState<string>('newest');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toggleWishlist, wishlistIds } = useWishlist();
  const [isChatLoading, setIsChatLoading] = useState<number | null>(null);

  const handleOpenChat = async (product: any) => {
    let finalSellerId = product.sellerId;
    
    if (!finalSellerId) {
      setIsChatLoading(product.productId);
      try {
        const detailRes = await getProductDetailAPI(product.productId);
        if (detailRes.success && detailRes.data) {
          finalSellerId = detailRes.data.sellerId;
        }
      } catch (e) {
        console.error("Failed to fetch product details for chat", e);
      } finally {
        setIsChatLoading(null);
      }
    }

    if (!finalSellerId) {
      finalSellerId = -Math.floor(Math.random() * 1000000);
    }

    navigate('/messages', { 
      state: { 
        product: { 
          id: product.productId, 
          name: product.title, 
          price: Number(product.price || 0).toLocaleString('vi-VN') + 'đ', 
          image: product.imageUrl 
        }, 
        targetUserId: finalSellerId,
        targetUserName: product.sellerName,
        targetUserAvatar: product.sellerAvatar
      } 
    });
  };

  const [showToggleModal, setShowToggleModal] = useState(false);
  const [productToToggle, setProductToToggle] = useState<ProductResponseDto | null>(null);

  const requestTogglePublic = (product: ProductResponseDto) => {
    setProductToToggle(product);
    setShowToggleModal(true);
  };

  const handleEdit = (productId: number) => {
    navigate(`/sell?edit=${productId}`);
  };

  const confirmTogglePublic = async () => {
    if (!productToToggle) return;
    try {
      const newStatus = productToToggle.productStatus === 'Public' ? 'Private' : 'Public';
      const toastId = toast.loading('Đang cập nhật trạng thái...');
      const res = await toggleProductStatusAPI(productToToggle.productId, newStatus);
      if (res.success) {
        toast.success('Cập nhật trạng thái thành công!', { id: toastId });
        if (onRetry) onRetry();
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái.');
    } finally {
      setShowToggleModal(false);
      setProductToToggle(null);
    }
  };

  const sortedProducts = useMemo(() => {
    // Only show Public products in "Đang Bán" tab (Selling tab)
    const items = products.filter(p => p.productStatus === 'Public');
    if (sortBy === 'priceAsc') {
      return items.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'priceDesc') {
      return items.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'popular') {
      return items.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    }
    // Default newest
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [products, sortBy]);

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-xl w-36 animate-pulse" />
        </div>
        <div className="flex flex-col gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="bg-white/60 backdrop-blur-md rounded-[24px] p-3 flex flex-col sm:flex-row gap-4 border border-white/40 shadow-sm animate-pulse">
              <div className="w-full sm:w-40 h-40 bg-gray-200 rounded-2xl flex-shrink-0" />
              <div className="flex-1 py-2 space-y-4">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-7 bg-gray-200 rounded w-1/3" />
                <div className="flex gap-3">
                  <div className="h-6 bg-gray-200 rounded w-20" />
                  <div className="h-6 bg-gray-200 rounded w-24" />
                </div>
              </div>
              <div className="sm:w-32 flex sm:flex-col gap-2 justify-center border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-4">
                <div className="h-10 bg-gray-200 rounded-xl w-full" />
                <div className="h-10 bg-gray-200 rounded-xl w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Không thể tải sản phẩm</h3>
        <p className="text-gray-500 text-sm max-w-sm mb-6">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Thử lại
          </button>
        )}
      </div>
    );
  }

  if (sortedProducts.length === 0) {
    if (!isOwnProfile) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <div className="relative">
              <Package className="w-8 h-8" />
              <div className="absolute inset-0 m-auto w-[2px] h-10 bg-gray-400 rotate-45 rounded-full shadow-sm" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Chưa có sản phẩm nào đang bán</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            Người dùng này hiện không có sản phẩm nào đang được đăng bán.
          </p>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <div className="relative">
              <Package className="w-8 h-8" />
              <div className="absolute inset-0 m-auto w-[2px] h-10 bg-gray-400 rotate-45 rounded-full shadow-sm" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Chưa có sản phẩm nào đang bán</h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            Bắt đầu đăng bán những món đồ bạn không còn sử dụng để chia sẻ với mọi người và nhận thêm thu nhập.
          </p>
          <button onClick={() => navigate('/sell')} className="px-5 py-2.5 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all cursor-pointer">
            Đăng Bán Ngay
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <div className="relative">
            <Package className="w-8 h-8" />
            <div className="absolute inset-0 m-auto w-[2px] h-10 bg-gray-400 rotate-45 rounded-full shadow-sm" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Tất cả sản phẩm đã được ẩn</h3>
        <p className="text-gray-500 text-sm max-w-sm mb-6">
          Bạn đã ẩn tất cả sản phẩm. Chúng sẽ không được hiển thị công khai trên trang cá nhân của bạn nữa.
        </p>
        <button 
          onClick={() => navigate('/manage-products')} 
          className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all cursor-pointer"
        >
          Quản lý tin đăng
        </button>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-end mb-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-white cursor-pointer"
          >
            <option value="newest">Mới Nhất</option>
            <option value="priceAsc">Giá: Thấp đến Cao</option>
            <option value="priceDesc">Giá: Cao đến Thấp</option>
            <option value="popular">Phổ Biến Nhất</option>
          </select>
        </div>
        <div className="flex flex-col gap-4">
          {sortedProducts.map((p) => (
            <ProductListCard
              key={p.productId}
              productId={p.productId}
              imageUrl={p.imageUrl}
              title={p.title}
              price={p.price}
              condition={p.condition}
              isPremium={p.isPremium}
              location={p.location}
              sellerName={p.sellerName}
              sellerAvatar={p.sellerAvatar || sellerAvatarFallback}
              createdAt={new Date(p.createdAt).toLocaleDateString('vi-VN')}
              expiredAt={
                new Date(new Date(p.createdAt).getTime() + 60 * 24 * 60 * 60 * 1000)
                  .toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit' })
                  .replace(',', '')
              }
              hideAbsoluteWishlist={true}
              actionButtons={
                isOwnProfile ? (
                  <>
                    <button
                      onClick={() => requestTogglePublic(p)}
                      className={`py-2 px-4 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1 ${
                        p.productStatus === 'Public' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {p.productStatus === 'Public' ? (
                        <><EyeOff className="w-3 h-3" /><span>Ẩn</span></>
                      ) : (
                        <><Eye className="w-3 h-3" /><span>Hiện</span></>
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(p.productId)}
                      className="py-2 px-4 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all flex items-center justify-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3" /><span>Sửa</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-row items-center gap-3">
                    {currentUser?.name === p.sellerName || currentUser?.username === p.sellerName ? (
                      <button
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gray-200 text-gray-500 rounded-xl text-sm font-semibold shadow-sm cursor-not-allowed"
                        disabled
                        title="Bạn không thể tự chat với chính mình"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="sm:hidden lg:inline">Sản phẩm của bạn</span>
                      </button>
                    ) : (
                      <button
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#2D5A3D] hover:bg-[#3D7054] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                        disabled={isChatLoading === p.productId}
                        onClick={() => handleOpenChat(p)}
                        title="Chat với người bán"
                      >
                        {isChatLoading === p.productId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MessageSquare className="w-4 h-4" />
                        )}
                        <span className="sm:hidden lg:inline">Chat</span>
                      </button>
                    )}
                    
                    <button
                      className={`p-2 transition-transform hover:scale-110 flex-shrink-0 ${
                        wishlistIds.includes(p.productId) ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      onClick={() => toggleWishlist(p.productId)}
                      title={wishlistIds.includes(p.productId) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                    >
                      <Heart className={`w-6 h-6 transition-colors ${wishlistIds.includes(p.productId) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                )
              }
            />
          ))}
        </div>
      </div>

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
              className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl"
            >
              <div className="text-center mb-6 mt-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  {productToToggle.productStatus === 'Public' ? (
                    <EyeOff className="w-8 h-8 text-blue-500" />
                  ) : (
                    <Eye className="w-8 h-8 text-blue-500" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {productToToggle.productStatus === 'Public' ? 'Ẩn Sản Phẩm?' : 'Hiện Sản Phẩm?'}
                </h2>
                <p className="text-gray-500">
                  Bạn có chắc chắn muốn {productToToggle.productStatus === 'Public' ? 'ẩn' : 'hiển thị'} "{productToToggle.title}" không?
                </p>
              </div>

              <div className="flex space-x-3 mb-2">
                <button onClick={() => setShowToggleModal(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button onClick={confirmTogglePublic} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:shadow-lg transition-shadow">
                  Đồng ý
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductsTab;
