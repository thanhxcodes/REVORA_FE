import { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import TopNavbar from './components/TopNavbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ChatBox from './components/ChatBox';
import HomePage from './pages/HomePage';
import ShortsPage from './pages/ShortsPage';
import PlansPage from './pages/PlansPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SellProductPage from './pages/SellProductPage';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';
import RevoraMatchPage from './pages/RevoraMatchPage';
import ManageProductsPage from './pages/ManageProductsPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import WeeklyRankingPage from './pages/WeeklyRankingPage';
import AllProductsPage from './pages/AllProductsPage';
import NotificationsPage from './pages/NotificationsPage';
import ErrorPage from './pages/ErrorPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRevenuePage from './pages/admin/AdminRevenuePage';
import AdminPackagesPage from './pages/admin/AdminPackagesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';

export interface AdminContextType {
  onLogout: () => void;
  currentUser: User | null;
}

export const AdminContext = createContext<AdminContextType>({
  onLogout: () => {},
  currentUser: null,
});

export const useAdminContext = () => useContext(AdminContext);

// Định dạng User được quản lý tập trung thông qua AuthContext

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = currentUser !== null;
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginRoute = location.pathname === '/login';
  const isShortsRoute = location.pathname === '/shorts';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isForgotPasswordRoute = location.pathname === '/forgot-password';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#2D5A3D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAdminRoute || isLoginRoute || isForgotPasswordRoute) {
    return (
      <AdminContext.Provider value={{ onLogout: handleLogout, currentUser }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/revenue" element={<AdminRevenuePage />} />
          <Route path="/admin/packages" element={<AdminPackagesPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/posts" element={<AdminPostsPage />} />
          <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
        </Routes>
      </AdminContext.Provider>
    );
  }

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
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shorts" element={<ShortsPage />} />
            <Route path="/all-products" element={<AllProductsPage />} />
            <Route path="/ranking" element={<WeeklyRankingPage />} />
            <Route path="/match" element={<RevoraMatchPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/sell" element={<SellProductPage />} />
            <Route path="/manage-products" element={<ManageProductsPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/transactions" element={<TransactionHistoryPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/error/404" element={<ErrorPage errorCode="404" />} />
            <Route path="/error/500" element={<ErrorPage errorCode="500" />} />
            <Route path="/error/403" element={<ErrorPage errorCode="403" />} />
            <Route path="/category/:name" element={<HomePage />} />
            <Route path="*" element={<ErrorPage errorCode="404" />} />
          </Routes>
          {!isShortsRoute && <Footer />}
        </main>
      </div>

      {isLoggedIn && currentUser?.role === 'user' && (
        <ChatBox currentUser={currentUser} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
