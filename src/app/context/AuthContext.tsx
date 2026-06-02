import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  ApiResponse,
  AuthResponse,
  authClient,
  loginAPI,
  registerAPI,
  logoutAPI,
  changePasswordAPI,
  setAccessToken,
  registerLogoutCallback,
} from '../../services/authService';

// ==========================================
// 1. TypeScript Interfaces
// ==========================================

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  permissions: string[];
  name: string;   // Tên hiển thị người dùng (tương thích ngược cho UI)
  avatar: string; // Ký tự đại diện ảnh đại diện (tương thích ngược cho UI)
}

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (dto: ChangePasswordDto) => Promise<void>;
}

// Đối tượng mã hóa của JWT từ phía Backend .NET
interface DecodedTokenPayload {
  sub: string;
  email: string;
  unique_name: string;
  role?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
  permission?: string | string[];
}

// Khởi tạo Context với giá trị mặc định là undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// 2. Helper Function: Giải mã Access Token thành User Object
// ==========================================
export const decodeJwtToUser = (token: string): User => {
  const decoded = jwtDecode<DecodedTokenPayload>(token);
  
  // Trích xuất vai trò từ claim chuẩn hoặc claim đặc thù của Microsoft .NET Core
  const role = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 'User';
  
  // Trích xuất quyền hạn (permissions) hỗ trợ cả dạng chuỗi đơn lẻ hoặc mảng chuỗi
  const permissions = Array.isArray(decoded.permission)
    ? decoded.permission
    : decoded.permission
    ? [decoded.permission]
    : [];

  const name = decoded.unique_name || decoded.email || 'User';
  const avatar = name ? name[0].toUpperCase() : 'U';

  return {
    id: decoded.sub ? parseInt(decoded.sub, 10) : 0,
    email: decoded.email || '',
    username: decoded.unique_name || '',
    role,
    permissions,
    name,
    avatar,
  };
};

// ==========================================
// 3. Auth Provider Component
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
        setAccessToken(null);
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
  const login = async (dto: LoginDto): Promise<void> => {
    // Gửi yêu cầu đăng nhập và tự động lưu Access Token vào RAM thông qua loginAPI
    const apiResponse = await loginAPI(dto);
    const { accessToken } = apiResponse.data;
    
    // Giải mã thông tin người dùng và cập nhật state React
    const user = decodeJwtToUser(accessToken);
    setCurrentUser(user);
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
      await logoutAPI();
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
