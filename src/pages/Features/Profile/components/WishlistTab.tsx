import React, { useCallback } from 'react';
import { Heart, Eye, EyeOff, Trash2 } from 'lucide-react';
import ProductCard from '../../../Products/components/ProductCard';

export interface WishlistProduct {
  id: number;
  image: string;
  title: string;
  price: number;
  condition: string;
  seller: string;
  views: number;
  isPublic: boolean;
}

interface WishlistTabProps {
  wishlistProducts: WishlistProduct[];
  publicViewMode: boolean;
  setWishlistProducts: React.Dispatch<React.SetStateAction<WishlistProduct[]>>;
}

export const WishlistTab: React.FC<WishlistTabProps> = ({
  wishlistProducts,
  publicViewMode,
  setWishlistProducts,
}) => {
  const toggleWishlistPublic = useCallback((id: number) => {
    setWishlistProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPublic: !p.isPublic } : p))
    );
  }, [setWishlistProducts]);

  const removeFromWishlist = useCallback((id: number) => {
    setWishlistProducts((prev) => prev.filter((p) => p.id !== id));
  }, [setWishlistProducts]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Danh Sách Yêu Thích ({wishlistProducts.length})</h2>
        <div className="text-sm text-gray-500">
          {wishlistProducts.filter((p) => p.isPublic).length} công khai ·{' '}
          {wishlistProducts.filter((p) => !p.isPublic).length} riêng tư
        </div>
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
            <div key={product.id} className="relative group">
              <ProductCard
                productId={product.id}
                imageUrl={product.image}
                imageUrls={[product.image]}
                title={product.title}
                price={product.price}
                condition={product.condition}
                sellerName={product.seller}
                viewCount={product.views}
              />
              {/* Control buttons overlay */}
              {!publicViewMode && (
                <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleWishlistPublic(product.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      product.isPublic
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-800 text-white'
                    }`}
                    title={product.isPublic ? 'Công khai' : 'Riêng tư'}
                  >
                    {product.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product.id)}
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
