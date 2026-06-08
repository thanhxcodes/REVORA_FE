import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../authProvider/AuthContext';
import { getMyWishlistIdsAPI, toggleWishlistAPI } from '../../features/products/services/wishlistApi';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlistIds: number[];
  toggleWishlist: (productId: number) => Promise<void>;
  isWishlisted: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchWishlistIds();
    } else {
      setWishlistIds([]);
    }
  }, [currentUser]);

  const fetchWishlistIds = async () => {
    try {
      const res = await getMyWishlistIdsAPI();
      if (res.success) {
        setWishlistIds(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist ids:', error);
    }
  };

  const toggleWishlist = async (productId: number) => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng yêu thích.');
      return;
    }

    // Optimistic update
    const isCurrentlyWishlisted = wishlistIds.includes(productId);
    if (isCurrentlyWishlisted) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
    } else {
      setWishlistIds((prev) => [...prev, productId]);
    }

    try {
      const res = await toggleWishlistAPI(productId);
      if (res.success) {
        toast.success(res.message);
      } else {
        // Revert on error
        if (isCurrentlyWishlisted) {
          setWishlistIds((prev) => [...prev, productId]);
        } else {
          setWishlistIds((prev) => prev.filter((id) => id !== productId));
        }
        toast.error('Có lỗi xảy ra, vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      // Revert on error
      if (isCurrentlyWishlisted) {
        setWishlistIds((prev) => [...prev, productId]);
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      }
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };

  const isWishlisted = (productId: number) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};
