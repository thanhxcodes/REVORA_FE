import { DollarSign, TrendingUp, CreditCard, Users, LogOut, Home, Shield, FileText, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminContext } from '../App';
import logoImg from '../../imports/logo1.jpg';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminNavItem = ({ to, icon: Icon, label, active }: any) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
      active ? 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white' : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </Link>
);

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { onLogout, currentUser } = useAdminContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
          {/* Logo + User */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2.5 mb-5">
              <img src={logoImg} alt="REVORA Logo" className="w-8 h-8 rounded-lg" />
              <div>
                <h1 className="text-lg font-black text-gray-900 leading-none">REVORA</h1>
                <p className="text-[10px] text-[#2D5A3D] font-semibold uppercase tracking-wider">Admin Panel</p>
              </div>
            </div>

            {/* User card */}
            {currentUser && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-[#2D5A3D]/6 to-[#3D7054]/6 rounded-xl px-3 py-2.5 border border-[#2D5A3D]/10">
                <div className="w-9 h-9 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {currentUser.avatar}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Shield className="w-3 h-3 text-[#2D5A3D]" />
                    <span className="text-[11px] text-[#2D5A3D] font-medium">Quản trị viên</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            <AdminNavItem
              to="/admin/dashboard"
              icon={TrendingUp}
              label="Tổng Quan"
              active={location.pathname === '/admin/dashboard'}
            />
            <AdminNavItem
              to="/admin/revenue"
              icon={DollarSign}
              label="Doanh Thu"
              active={location.pathname === '/admin/revenue'}
            />
            <AdminNavItem
              to="/admin/packages"
              icon={CreditCard}
              label="Quản Lý Gói"
              active={location.pathname === '/admin/packages'}
            />
            <AdminNavItem
              to="/admin/users"
              icon={Users}
              label="Người Dùng"
              active={location.pathname === '/admin/users'}
            />
            <AdminNavItem
              to="/admin/posts"
              icon={FileText}
              label="Bài Đăng"
              active={location.pathname === '/admin/posts'}
            />
            <AdminNavItem
              to="/admin/notifications"
              icon={Bell}
              label="Thông Báo"
              active={location.pathname === '/admin/notifications'}
            />
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-gray-100 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors text-sm"
            >
              <Home className="w-4 h-4" />
              <span>Về trang chủ</span>
            </Link>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium group"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
