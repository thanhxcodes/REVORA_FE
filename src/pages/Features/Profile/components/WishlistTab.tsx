import React, { useState, useEffect } from 'react';
import { Heart, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { ProductListCard } from './ProductListCard';
import { getMyWishlistAPI } from '../../../../features/products/services/wishlistApi';
import { getProductDetailAPI } from '../../../../features/products/services/productApi';
import { ProductResponseDto } from '../../../../features/products/types';
import { useWishlist } from '../../../../providers/wishlistProvider/WishlistContext';
import { useAuth } from '../../../../providers/authProvider/AuthContext';
import { useNavigate } from 'react-router-dom';

interface WishlistTabProps {
  publicViewMode: boolean;
  userAvatarFallback?: string;
  userNameFallback?: string;
  userUsernameFallback?: string;
}

export const WishlistTab: React.FC<WishlistTabProps> = ({
  publicViewMode,
  userAvatarFallback,
  userNameFallback,
  userUsernameFallback,
}) => {
  const matchName = (n1?: string | null, n2?: string | null) => {
    if (!n1 || !n2) return false;
    return n1.trim().toLowerCase() === n2.trim().toLowerCase();
  };
  const [wishlistProducts, setWishlistProducts] = useState<ProductResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState<number | null>(null);
  const { toggleWishlist, wishlistIds } = useWishlist();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleOpenChat = async (product: any) => {
    let finalSellerId = product.sellerId;
    
    // Nếu API wishlist chưa trả về sellerId, fetch chi tiết sản phẩm để lấy
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
      // Nếu vẫn không có, fallback ID ảo để test UI nhưng không gửi tin được
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

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Removed the sync useEffect so products don't disappear instantly on toggle
  // User will only see the heart toggle off, and it will disappear on reload
  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const res = await getMyWishlistAPI();
      if (res.success && res.data) {
        setWishlistProducts(res.data);
        
        // Asynchronously fetch missing seller details (e.g. avatar, sellerId) since wishlist API might omit them
        const productsToUpdate = [...res.data];
        let hasUpdates = false;
        
        Promise.all(
          productsToUpdate.map(async (p, index) => {
            if (!p.sellerAvatar || !p.sellerId) {
              try {
                const detailRes = await getProductDetailAPI(p.productId);
                if (detailRes.success && detailRes.data) {
                  if (detailRes.data.sellerAvatar || detailRes.data.sellerId) {
                    productsToUpdate[index] = {
                      ...p,
                      sellerAvatar: detailRes.data.sellerAvatar || p.sellerAvatar,
                      sellerId: detailRes.data.sellerId || p.sellerId,
                    };
                    hasUpdates = true;
                  }
                }
              } catch (e) {
                // Ignore individual errors
              }
            }
          })
        ).then(() => {
          if (hasUpdates) {
            setWishlistProducts([...productsToUpdate]);
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (id: number) => {
    await toggleWishlist(id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-6">
        {[...Array(3)].map((_, idx) => (
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
    );
  }

  return (
    <div>
      {wishlistProducts.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-sm p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có sản phẩm yêu thích</h3>
          <p className="text-gray-500 text-sm">Khám phá và thêm sản phẩm vào danh sách yêu thích của bạn</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {wishlistProducts.map((product) => {
            const isWishlisted = wishlistIds.includes(product.productId);
            return (
              <ProductListCard
                key={product.productId}
                productId={product.productId}
                imageUrl={product.imageUrl}
                title={product.title}
                price={product.price}
                sellerName={product.sellerName}
                sellerAvatar={
                  product.sellerAvatar || 
                  (matchName(userNameFallback, product.sellerName) || matchName(userUsernameFallback, product.sellerName) ? userAvatarFallback : undefined) ||
                  (currentUser && (matchName(currentUser.name, product.sellerName) || matchName(currentUser.username, product.sellerName)) ? currentUser.avatarUrl : undefined)
                }
                location={product.location}
                hideAbsoluteWishlist={true} // Hide the top-right absolute heart
                actionButtons={
                  !publicViewMode && (
                  <div className="flex flex-row items-center gap-3">
                    {currentUser?.name === product.sellerName || currentUser?.username === product.sellerName ? (
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
                        disabled={isChatLoading === product.productId}
                        onClick={() => handleOpenChat(product)}
                        title="Chat với người bán"
                      >
                        {isChatLoading === product.productId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MessageSquare className="w-4 h-4" />
                        )}
                        <span className="sm:hidden lg:inline">Chat</span>
                      </button>
                    )}
                    
                    <button
                      className={`p-2 transition-transform hover:scale-110 flex-shrink-0 ${
                        isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      onClick={() => toggleWishlist(product.productId)}
                      title={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                    >
                      <Heart className={`w-6 h-6 transition-colors ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                )
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistTab;
