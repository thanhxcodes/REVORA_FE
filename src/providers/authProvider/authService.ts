import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { RegisterDto, LoginDto, ChangePasswordDto, ApiResponse, AuthResponse } from '../../features/auth/types';
import { getAccessToken, setAccessToken, clearAccessToken } from '../../features/auth/services/tokenService';

// Mở rộng kiểu dữ liệu cấu hình của Axios để hỗ trợ cờ skipAuthRefresh
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
  }
}

// ==========================================
// 1. In-Memory Token Storage & Helper Functions
// ==========================================
let logoutCallback: (() => void) | null = null;

/**
 * Đăng ký hàm callback từ bên ngoài để xử lý khi người dùng bị ngắt phiên đăng nhập
 */
export const registerLogoutCallback = (callback: () => void): void => {
  logoutCallback = callback;
};

/**
 * Hàm hỗ trợ kích hoạt sự kiện đăng xuất khi phiên đăng nhập hết hạn hoàn toàn
 */
const triggerLogout = (): void => {
  clearAccessToken();
  
  // 1. Kích hoạt hàm callback nếu có đăng ký từ bên ngoài
  if (logoutCallback) {
    logoutCallback();
  }
  
  // 2. Phát một sự kiện Custom Event lên đối tượng window để các thành phần khác có thể lắng nghe độc lập
  window.dispatchEvent(new CustomEvent('auth:unauthorized'));
};

// ==========================================
// 3. Axios Instance Configuration
// ==========================================
export const authClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7015/api/v1',
  withCredentials: true, // Bắt buộc để trình duyệt tự động gửi kèm cookie chứa Refresh Token
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// 4. Request Interceptor (Đính kèm Bearer Token)
// ==========================================
authClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ==========================================
// 5. Response Interceptor (Silent Refresh & Chống Loop)
// ==========================================
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

/**
 * Giải phóng hàng đợi các request thất bại sau khi hoàn tất làm mới token
 */
const processQueue = (error: any, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Thiết lập bộ chặn phản hồi (Response Interceptor)
authClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp response cho các cuộc gọi API thành công
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; skipAuthRefresh?: boolean };

    // Kiểm tra nếu không có phản hồi từ Server hoặc không phải mã lỗi 401
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // BYPASS LOGIC CHO ENDPOINT CÔNG CỘNG:
    // Nếu request cấu hình skipAuthRefresh: true -> Trả lỗi thẳng về UI, không làm mới token
    if (originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    // PHÒNG CHỐNG VÒNG LẶP VÔ HẠN (Infinite Loop Prevention):
    // 1. Nếu chính endpoint /auth/refresh bị lỗi 401 -> Ngay lập tức đăng xuất và báo lỗi
    if (originalRequest.url?.includes('/auth/refresh')) {
      triggerLogout();
      return Promise.reject(error);
    }

    // 2. Nếu request này trước đó đã retry một lần nhưng vẫn bị 401 -> Hủy bỏ để tránh lặp vô hạn
    if (originalRequest._retry) {
      triggerLogout();
      return Promise.reject(error);
    }

    // Nếu đang có một tiến trình refresh token khác đang chạy, xếp request hiện tại vào hàng đợi
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return authClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Đánh dấu bắt đầu tiến trình Refresh và gán cờ _retry cho request gốc
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Gọi API /auth/refresh để lấy Access Token mới (kèm Cookie chứa Refresh Token từ trình duyệt)
      const response = await authClient.post<ApiResponse<AuthResponse>>('/auth/refresh');
      const { accessToken } = response.data.data;

      // Lưu trữ Access Token mới vào RAM
      setAccessToken(accessToken);

      // Giải phóng hàng đợi các request đang chờ với Token mới
      processQueue(null, accessToken);

      // Cập nhật token mới vào Header của request gốc và thực thi lại
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      return authClient(originalRequest);
    } catch (refreshError) {
      // Khi Refresh Token hết hạn hoặc có lỗi nghiêm trọng xảy ra
      processQueue(refreshError, null);
      triggerLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ==========================================
// 6. Strongly-Typed API Functions
// ==========================================

/**
 * API Đăng ký người dùng mới (Public Endpoint)
 */
export const registerAPI = async (dto: RegisterDto): Promise<ApiResponse<null>> => {
  const response = await authClient.post<ApiResponse<null>>('/auth/register', dto, { skipAuthRefresh: true });
  return response.data;
};

/**
 * API Đăng nhập hệ thống (Public Endpoint)
 * Sau khi nhận phản hồi thành công, tự động lưu Access Token vào bộ nhớ tạm (RAM)
 */
export const loginAPI = async (dto: LoginDto): Promise<ApiResponse<AuthResponse>> => {
  const response = await authClient.post<ApiResponse<AuthResponse>>('/auth/login', dto, { skipAuthRefresh: true });
  const { accessToken } = response.data.data;
  
  // Tự động lưu Access Token vào bộ nhớ RAM
  setAccessToken(accessToken);
  
  return response.data;
};

/**
 * API Đăng xuất phiên làm việc hiện tại
 */
export const logoutAPI = async (): Promise<ApiResponse<null>> => {
  try {
    const response = await authClient.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  } finally {
    // Luôn luôn giải phóng bộ nhớ kể cả khi API mạng gặp sự cố
    clearAccessToken();
  }
};

/**
 * API Đăng xuất khỏi toàn bộ các thiết bị đang hoạt động
 */
export const logoutAllAPI = async (): Promise<ApiResponse<null>> => {
  try {
    const response = await authClient.post<ApiResponse<null>>('/auth/logout-all');
    return response.data;
  } finally {
    clearAccessToken();
  }
};

/**
 * API Thay đổi mật khẩu người dùng
 * Chỉ dọn dẹp phiên và yêu cầu đăng nhập lại khi thực sự đổi mật khẩu thành công.
 * Nếu thất bại (gõ sai mật khẩu cũ), giữ nguyên phiên đăng nhập và đẩy lỗi ra ngoài UI.
 */
export const changePasswordAPI = async (dto: ChangePasswordDto): Promise<ApiResponse<null>> => {
  // On success: clear in-memory access token and trigger logout so the user
  // must re-authenticate with the new password.
  // On failure (e.g. wrong current password): Axios throws a 400 — the caller handles the error UI.
  // skipAuthRefresh: true prevents the 4xx interceptor from treating this as a session expiry.
  const response = await authClient.post<ApiResponse<null>>('/auth/change-password', dto, {
    skipAuthRefresh: true,
  });
  clearAccessToken();
  triggerLogout();
  return response.data;
};

export default authClient;
