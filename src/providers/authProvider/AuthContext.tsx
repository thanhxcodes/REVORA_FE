import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import {
  authClient,
  loginAPI,
  registerAPI,
  logoutAPI,
  changePasswordAPI,
  registerLogoutCallback,
} from './authService';
import {
  User,
  AuthContextType,
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  ApiResponse,
  AuthResponse,
} from '../../features/auth/types';
import { setAccessToken, clearAccessToken } from '../../features/auth/services/tokenService';
import { decodeJwtToUser } from '../../features/auth/utils/jwt';

// Khởi tạo Context với giá trị mặc định là undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// 2. Auth Provider Component
// ==========================================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Cờ hiệu useRef giúp kiểm soát và tránh việc gọi trùng lặp API 2 lần do StrictMode của React 18+
  const initialized = useRef<boolean>(false);

  // Định nghĩa thuộc tính tính toán trạng thái đăng nhập
  const isAuthenticated = !!currentUser;

  // Luồng xử lý khởi tạo ứng dụng (App Initialization & Silent Refresh)
  useEffect(() => {
    // 1. Đăng ký hàm callback đăng xuất tự động khi interceptor phát hiện token hết hạn
    registerLogoutCallback(() => {
      setCurrentUser(null);
    });

    const initAuth = async () => {
      // Đảm bảo chỉ thực thi luồng làm mới phiên duy nhất 1 lần khi khởi tạo
      if (initialized.current) return;
      initialized.current = true;

      try {
        setIsLoading(true);
        // Gọi API refresh âm thầm để lấy Access Token mới qua Refresh Cookie HttpOnly
        const response = await authClient.post<ApiResponse<AuthResponse>>('/auth/refresh');
        const { accessToken } = response.data.data;
        
        // Lưu token vào bộ nhớ RAM và khôi phục thông tin User trong React State
        setAccessToken(accessToken);
        const user = decodeJwtToUser(accessToken);
        setCurrentUser(user);
      } catch (error) {
        // Nếu không có Cookie hoặc Cookie hết hạn, dọn sạch bộ nhớ và bắt đầu phiên khách
        clearAccessToken();
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ==========================================
  // 4. Nghiệp vụ Auth (API Actions)
  // ==========================================

  /**
   * Đăng nhập người dùng bằng email và password
   */
  const login = async (dto: LoginDto): Promise<{ isFirstLogin?: boolean }> => {
    // Gửi yêu cầu đăng nhập và tự động lưu Access Token vào RAM thông qua loginAPI
    const apiResponse = await loginAPI(dto);
    const { accessToken, isFirstLogin } = apiResponse.data as any;
    
    // Giải mã thông tin người dùng và cập nhật state React
    const user = decodeJwtToUser(accessToken);
    setCurrentUser(user);
    
    return { isFirstLogin };
  };

  /**
   * Đăng nhập bằng Google
   */
  const googleLogin = async (idToken: string): Promise<{ isFirstLogin?: boolean }> => {
    const apiResponse = await authClient.post<ApiResponse<AuthResponse>>('/auth/google-login', { idToken }, { skipAuthRefresh: true });
    const { accessToken, isFirstLogin } = apiResponse.data.data as any;
    
    setAccessToken(accessToken);
    
    const user = decodeJwtToUser(accessToken);
    setCurrentUser(user);
    
    return { isFirstLogin };
  };

  /**
   * Đăng ký tài khoản người dùng mới
   */
  const register = async (dto: RegisterDto): Promise<void> => {
    await registerAPI(dto);
  };

  /**
   * Đăng xuất khỏi hệ thống phiên hiện tại
   */
  const logout = async (): Promise<void> => {
    try {
      // Chủ động dọn dẹp phiên Match đang hoạt động (nếu có) trước khi xóa Token
      try {
        await authClient.delete('/match-trade/sessions/active');
      } catch (matchError) {
        // Bỏ qua lỗi nếu token đã hết hạn hoặc không có phiên nào
        console.warn('Không thể dọn dẹp phiên Match hoặc không có phiên Active', matchError);
      }

      await logoutAPI();
    } catch (error) {
      console.error('Lỗi khi gọi API đăng xuất:', error);
    } finally {
      // Đảm bảo luôn dọn dẹp state ở Client kể cả khi API logout gặp lỗi mạng
      setCurrentUser(null);
    }
  };

  /**
   * Đổi mật khẩu tài khoản hiện tại
   * Luôn lưu ý: Nếu đổi mật khẩu thành công, authService sẽ tự động xóa token và trigger đăng xuất
   */
  const changePassword = async (dto: ChangePasswordDto): Promise<void> => {
    await changePasswordAPI(dto);
  };

  // Tối ưu hóa hiệu năng render bằng cách lưu vết dữ liệu Value qua useMemo
  const contextValue = useMemo<AuthContextType>(() => ({
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    googleLogin,
    register,
    logout,
    changePassword,
  }), [currentUser, isAuthenticated, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// 5. Custom Hook: useAuth
// ==========================================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  // Ném lỗi trực quan để ngăn chặn lập trình viên gọi ngoài AuthProvider
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
