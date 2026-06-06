import { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './providers/authProvider/AuthContext';
import { User } from './features/auth/types';
import TopNavbar from './components/common/TopNavbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import ChatBox from './components/common/ChatBox';
import HomePage from './pages/Home';
import ShortsPage from './pages/Features/ShortsPage';
import PlansPage from './pages/Features/PlansPage';
import ProductDetailPage from './pages/Products/ProductDetailPage';
import SellProductPage from './pages/Products/SellProductPage';
import UserProfilePage from './pages/Features/UserProfilePage';
import LoginPage from './pages/Auth';
import RevoraMatchPage from './pages/Features/RevoraMatchPage';
import ManageProductsPage from './pages/Admin/ManageProductsPage';
import TransactionHistoryPage from './pages/Features/TransactionHistoryPage';
import WeeklyRankingPage from './pages/Features/WeeklyRankingPage';
import AllProductsPage from './pages/Products/AllProductsPage';
import NotificationsPage from './pages/Features/NotificationsPage';
import ErrorPage from './pages/Features/ErrorPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminRevenuePage from './pages/Admin/AdminRevenuePage';
import AdminPackagesPage from './pages/Admin/AdminPackagesPage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import AdminPostsPage from './pages/Admin/AdminPostsPage';
import AdminNotificationsPage from './pages/Admin/AdminNotificationsPage';
import ProtectedRoute from './components/common/ProtectedRoute';

export interface AdminContextType {
  onLogout: () => void;
  currentUser: User | null;
}

export const AdminContext = createContext<AdminContextType>({
  onLogout: () => {},
  currentUser: null,
});

export const useAdminContext = () => useContext(AdminContext);

// ==========================================
// 1. Guest Route Wrapper (Chỉ dành cho khách vãng lai)
// ==========================================
function GuestRoute() {
  const { currentUser, isAuthenticated } = useAuth();

  if (isAuthenticated && currentUser) {
    if (currentUser.role.toLowerCase() === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

// ==========================================
// 2. User Layout Wrapper (Bố cục giao diện chung cho người dùng)
// ==========================================
function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = currentUser !== null;
  const isShortsRoute = location.pathname === '/shorts';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true, state: null });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        currentUser={currentUser}
      />
      <div className="pt-16 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isLoggedIn={isLoggedIn}
        />
        <main className="flex-1">
          <Outlet />
          {!isShortsRoute && <Footer />}
        </main>
      </div>

      {isLoggedIn && currentUser?.role.toLowerCase() === 'user' && (
        <ChatBox currentUser={currentUser} />
      )}
    </div>
  );
}

// ==========================================
// 3. Admin Layout Wrapper (Bố cục giao diện cho Admin)
// ==========================================
function AdminLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true, state: null });
  };

  return (
    <AdminContext.Provider value={{ onLogout: handleLogout, currentUser }}>
      <Outlet />
    </AdminContext.Provider>
  );
}

// ==========================================
// 4. Main Application Routing
// ==========================================
function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#2D5A3D] border-t-transparent rounded-full animate-spin text-[#2D5A3D]" />
      </div>
    );
  }

  return (
    <Routes>
      {/* A. Auth/Guest Group Routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* B. User Portal Group Routes */}
      <Route element={<UserLayout />}>
        {/* Public routes (Xem tự do) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shorts" element={<ShortsPage />} />
        <Route path="/all-products" element={<AllProductsPage />} />
        <Route path="/ranking" element={<WeeklyRankingPage />} />
        <Route path="/match" element={<RevoraMatchPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/category/:name" element={<HomePage />} />
        
        {/* System Error Pages */}
        <Route path="/error/404" element={<ErrorPage errorCode="404" />} />
        <Route path="/error/500" element={<ErrorPage errorCode="500" />} />
        <Route path="/error/403" element={<ErrorPage errorCode="403" />} />

        {/* Private routes (Yêu cầu đăng nhập: Role 'user' hoặc 'admin') */}
        <Route element={<ProtectedRoute allowedRoles={['User', 'Admin']} />}>
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/sell" element={<SellProductPage />} />
          <Route path="/manage-products" element={<ManageProductsPage />} />
          <Route path="/transactions" element={<TransactionHistoryPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Catch-all page */}
        <Route path="*" element={<ErrorPage errorCode="404" />} />
      </Route>

      {/* C. Admin Portal Group Routes (Yêu cầu đăng nhập: Role 'admin' duy nhất) */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/revenue" element={<AdminRevenuePage />} />
          <Route path="/admin/packages" element={<AdminPackagesPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/posts" element={<AdminPostsPage />} />
          <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
