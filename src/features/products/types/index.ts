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