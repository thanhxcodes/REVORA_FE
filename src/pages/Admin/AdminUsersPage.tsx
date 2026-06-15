import React, { useState, useEffect, useCallback } from 'react';
import { Search, Shield, Ban, AlertCircle, RefreshCw, Check } from 'lucide-react';
import AdminLayout from '../../components/common/AdminLayout';
import { getAdminUsersAPI, toggleUserStatusAPI, getUserTransactionsAPI } from '../../features/admin/services/adminApi';
import toast from 'react-hot-toast';
import { Eye, CreditCard, Calendar, CheckCircle2, Clock, XCircle, X } from 'lucide-react';

import UserDetailModal from '../../components/admin/UserDetailModal';
import { AdminUserResponseDto, TransactionResponseDto } from '../../types/admin';

interface PagedResult {
  items: AdminUserResponseDto[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

function BanUnbanModal({ user, onClose, onSuccess }: { user: AdminUserResponseDto, onClose: () => void, onSuccess: () => void }) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isBanning = user.isActive;

  const handleSubmit = async () => {
    if (reason.length < 5) return;
    setIsLoading(true);
    try {
      await toggleUserStatusAPI(user.userId, !isBanning, reason);
      toast.success(`Đã ${isBanning ? 'khóa' : 'mở khóa'} tài khoản ${user.username} thành công`);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className={`p-6 text-white flex items-center space-x-3 ${isBanning ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-gradient-to-r from-green-600 to-green-500'}`}>
          <div className="bg-white/20 p-2 rounded-xl">
            {isBanning ? <Ban className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </div>
          <h3 className="text-xl font-bold">{isBanning ? 'Xác nhận Khóa Tài Khoản' : 'Xác nhận Mở Khóa'}</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-6 leading-relaxed">
            Bạn đang chuẩn bị {isBanning ? 'khóa' : 'mở khóa'} tài khoản <strong>@{user.username}</strong> ({user.email}). Hành động này sẽ được ghi nhận vào hệ thống lưu vết.
          </p>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lý do (Bắt buộc, tối thiểu 5 ký tự) <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none shadow-sm"
              style={{ minHeight: '100px' }}
              placeholder={isBanning ? "Ví dụ: Vi phạm quy định đăng tin rác nhiều lần..." : "Ví dụ: Đã xử lý xong vi phạm..."}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={reason.length < 5 || isLoading}
              className={`px-5 py-2.5 text-white rounded-xl flex items-center space-x-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg ${
                isBanning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{isLoading ? 'Đang xử lý...' : 'Xác nhận'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserResponseDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [selectedUserForToggle, setSelectedUserForToggle] = useState<AdminUserResponseDto | null>(null);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<AdminUserResponseDto | null>(null);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle status filter change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const isActive = statusFilter === 'all' ? undefined : statusFilter === 'active';
      const data = await getAdminUsersAPI({
        page: currentPage,
        pageSize: 10,
        search: debouncedSearch,
        isActive: isActive
      });
      if (data.success && data.data) {
        setUsers(data.data.items || []);
        setTotalCount(data.data.totalCount || 0);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleSuccess = () => {
    setSelectedUserForToggle(null);
    fetchUsers(); // Refresh list
  };

  return (
    <AdminLayout>
      {selectedUserForToggle && (
        <BanUnbanModal 
          user={selectedUserForToggle} 
          onClose={() => setSelectedUserForToggle(null)} 
          onSuccess={handleToggleSuccess} 
        />
      )}

      {selectedUserForDetail && (
        <UserDetailModal
          user={selectedUserForDetail}
          onClose={() => setSelectedUserForDetail(null)}
          onBanClick={() => {
            setSelectedUserForDetail(null);
            setSelectedUserForToggle(selectedUserForDetail);
          }}
        />
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h2 className="text-3xl text-gray-900 mb-2 font-bold tracking-tight">Quản Lý Người Dùng</h2>
          <p className="text-gray-600">Theo dõi, quản lý trạng thái và phân quyền tài khoản thành viên</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center bg-[#2D5A3D]/5 text-[#2D5A3D] px-4 py-2 rounded-xl border border-[#2D5A3D]/10 font-medium text-sm">
          <Shield className="w-4 h-4 mr-2" />
          Quyền: Administrator
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100 transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2D5A3D] transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] transition-all bg-gray-50 hover:bg-white text-gray-800 font-medium"
            />
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-full md:w-48 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] transition-all bg-gray-50 hover:bg-white cursor-pointer text-gray-700 font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-no-repeat bg-[position:right_1rem_center]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="suspended">Bị khóa</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-5 px-6">Người Dùng</th>
                <th className="py-5 px-6">Email</th>
                <th className="py-5 px-6">Chức Vụ</th>
                <th className="py-5 px-6">Ngày Tham Gia</th>
                <th className="py-5 px-6">Lượt GD</th>
                <th className="py-5 px-6">Trạng Thái</th>
                <th className="py-5 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-[#2D5A3D]/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-[#2D5A3D] rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <Search className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-gray-700 font-bold text-lg">Không tìm thấy người dùng</p>
                    <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">Chưa có dữ liệu người dùng nào phù hợp với bộ lọc và từ khóa hiện tại của bạn.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.userId} className="hover:bg-green-50/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-2xl shadow-sm flex items-center justify-center text-white text-base font-bold uppercase overflow-hidden ring-4 ring-white group-hover:ring-green-50 transition-all">
                          {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : user.username.substring(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm text-gray-900 font-bold">{user.fullName || user.username}</div>
                          <div className="text-xs text-gray-500 font-medium mt-0.5">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 font-medium">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center w-fit ${user.roleName === 'Admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                        {user.roleName === 'Admin' ? <Shield className="w-3 h-3 mr-1" /> : null}
                        {user.roleName}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 font-medium">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="py-4 px-6 text-sm font-bold text-[#2D5A3D] bg-green-50/30">
                      {user.tradeSuccessCount} <span className="text-xs font-normal text-gray-400">lượt</span>
                    </td>
                    <td className="py-4 px-6">
                      {user.isActive ? (
                        <span className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1.5 w-fit font-bold shadow-sm">
                          <Check className="w-3.5 h-3.5" />
                          <span>Hoạt động</span>
                        </span>
                      ) : (
                        <span className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1.5 w-fit font-bold shadow-sm">
                          <Ban className="w-3.5 h-3.5" />
                          <span>Bị khóa</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedUserForDetail(user)}
                          className="flex items-center space-x-1 text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-all text-sm font-bold shadow-sm"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Xem</span>
                        </button>
                        
                        {user.isActive ? (
                          <button
                            onClick={() => setSelectedUserForToggle(user)}
                            className="flex items-center space-x-1.5 text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 px-3 py-1.5 rounded-lg transition-all text-sm font-bold shadow-sm"
                            title="Khóa tài khoản này"
                          >
                            <Ban className="w-4 h-4" />
                            <span>Khóa</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedUserForToggle(user)}
                            className="flex items-center space-x-1.5 text-[#2D5A3D] bg-white border border-green-100 hover:bg-green-50 hover:border-green-200 px-3 py-1.5 rounded-lg transition-all text-sm font-bold shadow-sm"
                            title="Mở khóa tài khoản này"
                          >
                            <Shield className="w-4 h-4" />
                            <span>Mở khóa</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && users.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 bg-gray-50/80 border-t border-gray-100">
            <div className="text-sm text-gray-500 font-medium mb-4 sm:mb-0 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
              Tổng cộng <span className="text-[#2D5A3D] font-bold text-base mx-1">{totalCount}</span> người dùng
            </div>
            <div className="flex items-center space-x-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow active:scale-95"
              >
                Trước
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) pageNum = currentPage - 2 + i;
                    if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                  }
                  
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 ${
                        currentPage === pageNum 
                          ? 'bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] text-white border-transparent shadow-md' 
                          : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-[#2D5A3D]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow active:scale-95"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
