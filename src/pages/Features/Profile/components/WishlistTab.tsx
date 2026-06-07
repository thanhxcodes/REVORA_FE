import React, { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import ProductCard from '../../../Products/components/ProductCard';
import { getMyWishlistAPI } from '../../../../features/products/services/wishlistApi';
import { ProductResponseDto } from '../../../../features/products/types';
import { useWishlist } from '../../../../providers/wishlistProvider/WishlistContext';

interface WishlistTabProps {
  publicViewMode: boolean;
}

export const WishlistTab: React.FC<WishlistTabProps> = ({
  publicViewMode,
}) => {
  const [wishlistProducts, setWishlistProducts] = useState<ProductResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toggleWishlist, wishlistIds } = useWishlist();

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Update local list when global wishlistIds changes (e.g. removed from ProductCard)
  useEffect(() => {
    setWishlistProducts(prev => prev.filter(p => wishlistIds.includes(p.productId)));
  }, [wishlistIds]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const res = await getMyWishlistAPI();
      if (res.success && res.data) {
        setWishlistProducts(res.data);
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
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-[#2D5A3D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Danh Sách Yêu Thích ({wishlistProducts.length})</h2>
      </div>
      {wishlistProducts.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có sản phẩm yêu thích</h3>
          <p className="text-gray-500 text-sm">Khám phá và thêm sản phẩm vào danh sách yêu thích của bạn</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <div key={product.productId} className="relative group">
              <ProductCard
                productId={product.productId}
                imageUrl={product.imageUrl}
                imageUrls={product.imageUrl ? [product.imageUrl] : []}
                title={product.title}
                price={product.price}
                condition={product.condition || 'Chưa phân loại'}
                sellerName={product.sellerName}
                viewCount={product.viewCount}
                isPremium={product.isPremium}
                location={product.location}
              />
              {/* Control buttons overlay */}
              {!publicViewMode && (
                <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => removeFromWishlist(product.productId)}
                    className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all"
                    title="Xóa khỏi yêu thích"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistTab;
