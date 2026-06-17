import { Heart, Eye, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../../providers/wishlistProvider/WishlistContext';
import toast from 'react-hot-toast';
import { useAuth } from '../../../providers/authProvider/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  productId: number;
  imageUrls: string[];
  title: string;
  price: number;
  condition: string;
  sellerName: string;
  viewCount?: number;
  likeCount?: number;
  isPremium?: boolean;
  viewMode?: 'grid' | 'list';
  sellerBadge?: { icon: string; gradient: string } | null;
  location?: string;
  imageUrl?: string;
  sellerFullName?: string;
  createdAt?: string;
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
  likeCount,
  isPremium,
  viewMode = 'grid',
  sellerBadge,
  location,
  sellerFullName,
  createdAt,
}: ProductCardProps) {



  const { wishlistIds, toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(productId);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn Link trigger
    e.stopPropagation();
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích.');
      navigate('/login');
      return;
    }
    toggleWishlist(productId);
  };

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
      <Link to={`/product/${productId}`} className="block">
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
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate">Bởi {sellerFullName || sellerName}</span>
                    {badge && (
                      <div className={`w-4 h-4 bg-gradient-to-r ${badge.gradient} rounded-full flex items-center justify-center text-white text-[8px] flex-shrink-0`} title="Badge">
                        {badge.icon}
                      </div>
                    )}
                  </div>
                  {createdAt && (
                    <span className="text-xs text-gray-400">Đăng ngày {new Date(createdAt).toLocaleDateString('vi-VN')}</span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {viewCount !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span>{viewCount.toLocaleString()}</span>
                    </div>
                  )}
                  {likeCount !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-[#C4603A]" />
                      <span>{likeCount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <button 
                onClick={handleWishlistClick}
                className={`p-3 rounded-full border transition-all ${
                  wishlisted 
                    ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' 
                    : 'bg-white/90 backdrop-blur-sm border-gray-200 opacity-0 group-hover:opacity-100 hover:bg-[#2D5A3D] hover:border-[#2D5A3D] hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/product/${productId}`} className="block h-full">
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
          <button 
            onClick={handleWishlistClick}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
              wishlisted
                ? 'bg-red-50 text-red-500'
                : 'bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
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
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate">{sellerFullName || sellerName}</span>
                {badge && (
                  <div className={`w-4 h-4 bg-gradient-to-r ${badge.gradient} rounded-full flex items-center justify-center text-white text-[8px] flex-shrink-0`} title="Badge">
                    {badge.icon}
                  </div>
                )}
              </div>
              {createdAt && (
                <span className="text-[10px] text-gray-400">Ngày đăng: {new Date(createdAt).toLocaleDateString('vi-VN')}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {viewCount !== undefined && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3 text-gray-500" />
                  <span className="text-xs">{viewCount}</span>
                </div>
              )}
              {likeCount !== undefined && (
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3 text-[#C4603A]" />
                  <span className="text-xs">{likeCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}