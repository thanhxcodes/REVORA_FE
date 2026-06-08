import React, { useState, useMemo } from 'react';
import { Package, RefreshCw, Edit, EyeOff } from 'lucide-react';
import { ProductListCard } from './ProductListCard';
import { ProductResponseDto } from '../../../../features/products/types';

interface ProductsTabProps {
  products: ProductResponseDto[];
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

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-sm">
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
            viewCount={p.viewCount}
            isPremium={p.isPremium}
            location={p.location}
            createdAt={new Date(p.createdAt).toLocaleDateString('vi-VN')}
            expiredAt={
              new Date(new Date(p.createdAt).getTime() + 60 * 24 * 60 * 60 * 1000)
                .toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: '2-digit' })
                .replace(',', '')
            }
            hideAbsoluteWishlist={true}
            actionButtons={
              <>
                <button
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors border border-gray-200"
                  onClick={() => console.log('Edit', p.productId)}
                >
                  <Edit className="w-4 h-4" />
                  <span className="sm:hidden lg:inline">Sửa</span>
                </button>
                <button
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-sm font-semibold transition-colors border border-rose-100"
                  onClick={() => console.log('Hide', p.productId)}
                >
                  <EyeOff className="w-4 h-4" />
                  <span className="sm:hidden lg:inline">Ẩn</span>
                </button>
              </>
            }
          />
        ))}
      </div>
    </div>
  );
};

export default ProductsTab;

