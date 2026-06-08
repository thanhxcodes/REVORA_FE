// thanh start
export interface ProductResponse {
  productId: number;
  title: string;
  price: number;
  condition: string;
  location: string;
  imageUrl: string;
  sellerName: string;
  isPremium: boolean;
  bannerUrl?: string;
  viewCount: number;
  createdAt: string;
}
// thanh end

export interface CreateProductRequestDto {
    categoryId: number;
    title: string;
    description: string;
    price: number;
    brand: string;
    condition: string;
    imageUrls: string[];
    enableVideoUpload: boolean;
    videoUrl: string | null;
    enableBannerBoost: boolean;
    bannerUrl: string | null;
}

export interface ProductResponseDto {
    productId: number;
    title: string;
    price: number;
    condition: string;
    location: string;
    imageUrl: string;
    sellerName: string;
    sellerId?: number;
    sellerAvatar?: string;
    isPremium: boolean;
    bannerUrl?: string;
    viewCount: number;
    createdAt: string;
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

export interface ProductFilterParams {
    keyword?: string;
    categoryId?: number;
    brand?: string;
    condition?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    pageNumber: number;
    pageSize: number;
}

export interface ProductDetailResponseDto {
    productId: number;
    title: string;
    description: string;
    price: number;
    brand: string;
    condition: string;
    categoryName: string;
    imageUrls: string[];
    videoUrl?: string;
    isPremium: boolean;
    viewCount: number;
    createdAt: string;
    sellerName: string;
    sellerId: number;
    sellerUsername: string;
    sellerAvatar: string;
    sellerPhone: string;
    isFollowingSeller?: boolean;
}