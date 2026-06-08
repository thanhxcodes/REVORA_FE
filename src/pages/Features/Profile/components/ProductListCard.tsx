import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Eye, Zap, Tag, Heart, Calendar, Clock } from 'lucide-react';
import { useWishlist } from '../../../../providers/wishlistProvider/WishlistContext';

interface ProductListCardProps {
  productId: number;
  imageUrl?: string;
  title: string;
  price: number;
  condition?: string;
  location?: string;
  viewCount?: number;
  isPremium?: boolean;
  sellerName?: string;
  createdAt?: string;
  expiredAt?: string;
  hideAbsoluteWishlist?: boolean;
  statusBadge?: React.ReactNode;
  actionButtons?: React.ReactNode;
}

export const ProductListCard: React.FC<ProductListCardProps> = ({
  productId,
  imageUrl,
  title,
  price,
  condition,
  location,
  viewCount,
  isPremium,
  sellerName,
  createdAt,
  expiredAt,
  hideAbsoluteWishlist,
  statusBadge,
  actionButtons,
}) => {
  const { wishlistIds, toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(productId);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  return (
    <div className="group bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/90 hover:border-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-[24px] p-3 flex flex-col sm:flex-row gap-4 sm:items-stretch relative overflow-hidden">
      
      {/* Background Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2D5A3D]/0 via-[#2D5A3D]/0 to-[#2D5A3D]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Image Column */}
      <div className="relative w-full sm:w-40 h-40 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-xs">No Image</span>
          </div>
        )}
        
        {/* Premium Badge overlay */}
        {isPremium && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm backdrop-blur-md border border-white/50">
            <Zap className="w-3 h-3 fill-current" />
            Nổi bật
          </div>
        )}

        {/* Custom Status Badge Overlay */}
        {statusBadge && (
          <div className="absolute bottom-2 left-2">
            {statusBadge}
          </div>
        )}

        {/* Wishlist Toggle Button (Top Right) */}
        {!hideAbsoluteWishlist && (
          <button 
            onClick={handleWishlistClick}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
              wishlisted
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 text-[#2D5A3D] hover:bg-[#2D5A3D] hover:text-white'
            }`}
            title={wishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Info Column */}
      <div className="flex-1 min-w-0 py-1 flex flex-col justify-start">
        <Link to={`/product/${productId}`} className="block group/link">
          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover/link:text-[#2D5A3D] transition-colors mb-1.5">
            {title}
          </h3>
        </Link>
        
        <div className="text-xl font-bold text-[#2D5A3D] tracking-tight mb-3">
          {price.toLocaleString('vi-VN')}₫
        </div>
        {/* Location & Views */}
        <div className="flex flex-wrap items-center gap-3 mt-auto pt-2">
          {sellerName && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#2D5A3D] to-[#4CAF50] text-white flex items-center justify-center text-[8px] font-bold">
                {sellerName.charAt(0).toUpperCase()}
              </div>
              <span className="truncate max-w-[80px] sm:max-w-[100px]">{sellerName}</span>
            </div>
          )}
          
          {condition && (
            <div className="flex items-center gap-1.5 bg-gray-100/80 px-2.5 py-1 rounded-lg">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate max-w-[120px]">{condition}</span>
            </div>
          )}
          
          {location && (
            <div className="flex items-center gap-1.5 bg-gray-100/80 px-2.5 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate max-w-[150px]">{location}</span>
            </div>
          )}

          {typeof viewCount !== 'undefined' && (
            <div className="flex items-center gap-1.5 bg-gray-100/80 px-2.5 py-1 rounded-lg">
              <Eye className="w-3.5 h-3.5 text-gray-400" />
              <span>{viewCount} lượt xem</span>
            </div>
          )}
        </div>

        {/* Dates */}
        {(createdAt || expiredAt) && (
          <div className="mt-3 flex flex-col gap-1 text-[12px] text-gray-400">
            {createdAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-900" />
                <span className="text-gray-900 font-medium">Ngày đăng tin: {createdAt}</span>
              </div>
            )}
            {expiredAt && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-900" />
                <span className="text-gray-900 font-medium">Ngày hết hạn: {expiredAt}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions Column */}
      {actionButtons && (
        <div className="sm:ml-4 sm:pr-2 flex flex-row sm:flex-col gap-2 justify-end sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-6">
          {actionButtons}
        </div>
      )}
    </div>
  );
};

export default ProductListCard;
