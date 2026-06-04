import authClient from '../../../providers/authProvider/authService';
import { ProductFilterParams, PagedResult, ProductResponseDto } from '../types';
import { CreateProductRequestDto } from '../types';

// API Upload nhiều ảnh
export const uploadProductImagesAPI = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file); // 'files' phải khớp với C#
    });

    // ÉP Axios phải dùng multipart/form-data thay vì application/json mặc định
    const response = await authClient.post('/Media/upload-images', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};

// Thêm hàm này vào file productApi.ts
export const uploadProductVideoAPI = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file); // Gọi API upload video (chỉ 1 file)

    const response = await authClient.post('/Media/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data; // Trả về { success, message, url: "..." }
};

// Thêm vào cuối file productApi.ts
export const getCategoriesAPI = async () => {
    // skipAuthRefresh: true vì API này là AllowAnonymous, không cần token
    const response = await authClient.get('/Categories', { skipAuthRefresh: true });
    return response.data;
};


// API Tạo sản phẩm (Giữ nguyên)
export const createProductAPI = async (data: CreateProductRequestDto) => {
    const response = await authClient.post('/Products', data);
    return response.data;
};

// THÊM HÀM NÀY VÀO CUỐI FILE
export const getMyCreditsAPI = async () => {
    const response = await authClient.get('/Products/my-credits');
    return response.data;
};

// API lấy sản phẩm nổi bật
export const getFeaturedProductsAPI = async (limit = 10) => {
    // Lưu ý: Các API Get public (không cần token) thì bạn có thể dùng axios bình thường 
    // Hoặc dùng authClient cũng được, nhưng nhớ truyền cờ để không bị lỗi 401 nếu chưa đăng nhập
    const response = await authClient.get(`/Products/featured?limit=${limit}`, { skipAuthRefresh: true });
    return response.data;
};

// API lấy sản phẩm mới nhất
export const getNewestProductsAPI = async (limit = 10) => {
    const response = await authClient.get(`/Products/newest?limit=${limit}`, { skipAuthRefresh: true });
    return response.data;
};

// API lấy sản phẩm được yêu thích
export const getLovedProductsAPI = async (limit = 10) => {
    const response = await authClient.get(`/Products/loved?limit=${limit}`, { skipAuthRefresh: true });
    return response.data;
};

export const getFilteredProductsAPI = async (params: ProductFilterParams): Promise<{ success: boolean, data: PagedResult<ProductResponseDto> }> => {
    // Dùng authClient.get và truyền params vào config
    // (skipAuthRefresh: true để guest cũng xem được mà không bị đá ra trang login)
    const response = await authClient.get('/Products', {
        params: params,
        skipAuthRefresh: true
    });
    return response.data;
};

// Lấy chi tiết 1 sản phẩm
export const getProductDetailAPI = async (id: string | number) => {
    const response = await authClient.get(`/Products/${id}`, { skipAuthRefresh: true });
    return response.data;
};


export const getProductCommentsAPI = async (productId: string | number) => {
    const response = await authClient.get(`/Products/${productId}/comments`, { skipAuthRefresh: true });
    return response.data;
};

export const addProductCommentAPI = async (productId: string | number, content: string) => {
    const response = await authClient.post(`/Products/${productId}/comments`, { content });
    return response.data;
};

export const toggleLikeCommentAPI = async (productId: string | number, commentId: number) => {
    const response = await authClient.post(`/Products/${productId}/comments/${commentId}/like`);
    return response.data;
};

// ================= SHORTS API =================
// 1. Lấy danh sách Video Shorts (cho phép lướt)
export const getFeedShortsAPI = async () => {
    const response = await authClient.get('/Shorts', { skipAuthRefresh: true });
    return response.data;
};

// 2. Lấy bình luận của 1 video cụ thể
export const getShortCommentsAPI = async (shortId: string | number) => {
    const response = await authClient.get(`/Shorts/${shortId}/comments`, { skipAuthRefresh: true });
    return response.data;
};

// 3. Gửi bình luận mới vào video
export const addShortCommentAPI = async (shortId: string | number, content: string) => {
    const response = await authClient.post(`/Shorts/${shortId}/comments`, { content });
    return response.data;
};

// 4. Thả tim (hoặc bỏ tim) video
export const toggleLikeShortAPI = async (shortId: string | number) => {
    const response = await authClient.post(`/Shorts/${shortId}/like`);
    return response.data;
};