import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../providers/authProvider/AuthContext';

const LOADING_TEXT = 'Đang xác thực thông tin...';

export interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { currentUser, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Hiển thị màn hình Loading toàn trang (Splash Screen) khi đang xác thực phiên
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin text-brand-primary" />
          <p className="text-sm font-semibold text-gray-600 tracking-wide animate-pulse">
            {LOADING_TEXT}
          </p>
        </div>
      </div>
    );
  }

  // 2. Chuyển hướng người dùng về trang Đăng nhập nếu chưa đăng nhập
  if (!isAuthenticated || !currentUser) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // 3. Kiểm tra phân quyền (Role Guarding)
  if (allowedRoles) {
    const hasRole = allowedRoles.some(
      (role) => role.toLowerCase() === currentUser.role.toLowerCase()
    );
    if (!hasRole) {
      return (
        <Navigate
          to="/error/403"
          replace
        />
      );
    }
  }

  // 4. Nếu thỏa mãn tất cả điều kiện, render children hoặc Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
