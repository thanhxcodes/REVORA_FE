import React, { useState, useMemo } from 'react';
import { Package, RefreshCw } from 'lucide-react';
import ProductCard from '../../../Products/components/ProductCard';
import { ProductResponse } from '../../../../features/products/types';

interface ProductsTabProps {
  products: ProductResponse[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  isLoading,
  error,
  onRetry,
}) => {
  const [sortBy, setSortBy] = useState<string>('newest');

  const sortedProducts = useMemo(() => {
    const items = [...products];
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse border border-gray-100">
              <div className="aspect-[3/4] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
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

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Chưa có sản phẩm nào đang bán</h3>
        <p className="text-gray-500 text-sm max-w-sm mb-6">
          Bắt đầu đăng bán những món đồ bạn không còn sử dụng để chia sẻ với mọi người và nhận thêm thu nhập.
        </p>
        <button className="px-5 py-2.5 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all cursor-pointer">
          Đăng Bán Ngay
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Sản Phẩm Đang Bán ({products.length})</h2>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedProducts.map((p) => (
          <ProductCard
            key={p.productId}
            id={p.productId}
            image={p.imageUrl}
            title={p.title}
            price={p.price}
            condition={p.condition}
            seller={p.sellerName}
            views={p.viewCount}
            isPremium={p.isPremium}
            location={p.location}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductsTab;

