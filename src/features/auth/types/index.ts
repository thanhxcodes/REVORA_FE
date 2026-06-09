// ==========================================
// TypeScript Interfaces & DTOs for Auth
// ==========================================

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  permissions: string[];
  name: string;   // Tên hiển thị người dùng (tương thích ngược cho UI)
  avatar: string; // Ký tự đại diện ảnh đại diện (tương thích ngược cho UI)
  avatarUrl?: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string; // ISO DateTime string
}

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<{ isFirstLogin?: boolean }>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (dto: ChangePasswordDto) => Promise<void>;
}
