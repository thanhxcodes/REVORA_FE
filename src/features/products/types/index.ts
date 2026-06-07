// thanh start
export interface ProductResponseDto {
  productId: number;
  title: string;
  price: number;
  condition: string | null;
  location: string;
  imageUrl: string | null;
  sellerName: string;
  sellerFullName: string;
  isPremium: boolean;
  bannerUrl: string | null;
  viewCount: number;
  createdAt: string;
  productStatus?: string;
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
}