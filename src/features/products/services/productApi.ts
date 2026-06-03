import authClient from '../../../providers/authProvider/authService';
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