import { Heart, Eye, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  productId: number;
  imageUrls: string[];
  title: string;
  price: number;
  condition: string;
  sellerName: string;
  viewCount?: number;
  isPremium?: boolean;
  viewMode?: 'grid' | 'list';
  sellerBadge?: { icon: string; gradient: string } | null;
  location?: string;
  imageUrl?: string;
}

export default function ProductCard({
  productId,
  imageUrls,
  imageUrl: propImageUrl,
  title,
  price,
  condition,
  sellerName,
  viewCount,
  isPremium,
  viewMode = 'grid',
  sellerBadge,
  location,
}: ProductCardProps) {

  const finalImageUrl = propImageUrl || (imageUrls && imageUrls.length > 0 ? imageUrls[0] : undefined);

  // Fake badge for demo
  const badge = sellerBadge || (() => {
    if (sellerName === 'admin') return { icon: '⭐', gradient: 'from-[#2D5A3D] to-[#3D7054]' };
    if (sellerName === 'user1') return { icon: '💎', gradient: 'from-purple-500 to-pink-500' };
    return null;
  })();

  // CÁC ĐOẠN DƯỚI NÀY GIỮ NGUYÊN HOÀN TOÀN, CHỈ SỬA BIẾN:
  // - id -> productId
  // - image -> imageUrls
  // - seller -> sellerName
  // - views -> viewCount

  if (viewMode === 'list') {
    return (
      <Link to={`/product/${productId}`}>
        <div className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${isPremium ? 'ring-2 ring-[#C4603A] shadow-[0_0_20px_rgba(196,96,58,0.3)] hover:shadow-[0_0_30px_rgba(196,96,58,0.5)]' : ''
          }`}>
          {isPremium && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C4603A]/10 to-transparent animate-[shimmer_3s_ease-in-out_infinite]"
                style={{ backgroundSize: '200% 100%' }} />
            </div>
          )}

          <div className="flex gap-4 p-4">
            <div className="relative w-40 h-40 flex-shrink-0 overflow-hidden bg-gray-100 rounded-xl">
              <img
                src={finalImageUrl || 'https://via.placeholder.com/400'}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {isPremium && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-[#C4603A] to-[#d4724a] text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-semibold flex items-center gap-1.5 animate-pulse">
                  <span className="text-sm">✨</span>
                  <span>Premium</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 text-lg">{title}</h3>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl text-[#2D5A3D] font-semibold">{price.toLocaleString('vi-VN')}₫</span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{condition}</span>
                </div>
                {location && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="truncate">Bởi {sellerName}</span>
                  {badge && (
                    <div className={`w-4 h-4 bg-gradient-to-r ${badge.gradient} rounded-full flex items-center justify-center text-white text-[8px] flex-shrink-0`} title="Badge">
                      {badge.icon}
                    </div>
                  )}
                </div>
                {viewCount !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{viewCount.toLocaleString()} lượt xem</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <button className="bg-white/90 backdrop-blur-sm p-3 rounded-full border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#2D5A3D] hover:border-[#2D5A3D] hover:text-white">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/product/${productId}`}>
      <div className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col ${isPremium ? 'ring-2 ring-[#C4603A] shadow-[0_0_20px_rgba(196,96,58,0.3)] hover:shadow-[0_0_30px_rgba(196,96,58,0.5)]' : ''
        }`}>
        {isPremium && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C4603A]/10 to-transparent animate-[shimmer_3s_ease-in-out_infinite]"
              style={{ backgroundSize: '200% 100%' }} />
          </div>
        )}

        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            src={finalImageUrl || 'https://via.placeholder.com/400'}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {isPremium && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-[#C4603A] to-[#d4724a] text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-semibold flex items-center gap-1.5 animate-pulse">
              <span className="text-sm">✨</span>
              <span>Premium</span>
            </div>
          )}
          <button className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="w-4 h-4 text-[#2D5A3D]" />
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">{title}</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg text-[#2D5A3D] font-semibold">{price.toLocaleString('vi-VN')}₫</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{condition}</span>
            </div>
            {location && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="truncate">{sellerName}</span>
              {badge && (
                <div className={`w-4 h-4 bg-gradient-to-r ${badge.gradient} rounded-full flex items-center justify-center text-white text-[8px] flex-shrink-0`} title="Badge">
                  {badge.icon}
                </div>
              )}
            </div>
            {viewCount !== undefined && (
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span className="text-xs">{viewCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}