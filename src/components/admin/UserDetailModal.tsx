import React, { useState, useEffect } from 'react';
import { 
  X, CreditCard, Calendar, CheckCircle2, Clock, XCircle, 
  LayoutDashboard, ShoppingBag, ArrowRightLeft, ShieldAlert, Ban, User, Mail, TrendingUp 
} from 'lucide-react';
import { getUserOverviewAPI, getUserTransactionsAPI } from '../../features/admin/services/adminApi';
import { AdminUserResponseDto, TransactionResponseDto, AdminUserOverviewDto } from '../../types/admin';
import toast from 'react-hot-toast';

interface UserDetailModalProps {
  user: AdminUserResponseDto;
  onClose: () => void;
  onBanClick?: () => void;
}

export default function UserDetailModal({ user, onClose, onBanClick }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [overview, setOverview] = useState<AdminUserOverviewDto | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination for transactions
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTx, setTotalTx] = useState(0);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await getUserOverviewAPI(user.userId);
        if (res.success && res.data) {
          setOverview(res.data);
        }
      } catch (error) {
        toast.error('Lỗi khi tải thông tin tổng quan');
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'overview' && !overview) {
      setIsLoading(true);
      fetchOverview();
    }
  }, [activeTab, user.userId, overview]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const res = await getUserTransactionsAPI(user.userId, { page, pageSize: 10 });
        if (res.success && res.data) {
          setTransactions(res.data.items || []);
          setTotalPages(res.data.totalPages || 1);
          setTotalTx(res.data.totalCount || 0);
        }
      } catch (error) {
        toast.error('Lỗi khi tải lịch sử giao dịch');
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab, page, user.userId]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Success': return <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center w-fit"><CheckCircle2 className="w-3.5 h-3.5 mr-1"/> Thành công</span>;
      case 'Pending': return <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center w-fit"><Clock className="w-3.5 h-3.5 mr-1"/> Chờ xử lý</span>;
      case 'Failed': return <span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center w-fit"><XCircle className="w-3.5 h-3.5 mr-1"/> Thất bại</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold">{status}</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const renderOverviewTab = () => {
    if (isLoading && !overview) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="h-32 bg-gray-100 rounded-2xl"></div>
          <div className="h-32 bg-gray-100 rounded-2xl"></div>
          <div className="md:col-span-2 h-40 bg-gray-100 rounded-2xl"></div>
          <div className="md:col-span-2 h-60 bg-gray-100 rounded-2xl"></div>
        </div>
      );
    }

    if (!overview) return <div className="text-center py-10 text-gray-500">Không có dữ liệu tổng quan.</div>;

    return (
      <div className="space-y-6">
        {/* Bento Grid: 2 Thẻ tín dụng theo thiết kế mới */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md">
            <div className="flex items-center text-indigo-700 mb-3">
              <CreditCard className="w-5 h-5 mr-2" />
              <span className="font-bold text-sm">Credit Đăng Tin</span>
            </div>
            <h3 className="text-4xl font-black text-indigo-700 mb-1">{overview.postingCredits}</h3>
            <p className="text-indigo-600/70 text-sm font-semibold">credits còn lại</p>
          </div>
          
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md">
            <div className="flex items-center text-amber-700 mb-3">
              <TrendingUp className="w-5 h-5 mr-2" />
              <span className="font-bold text-sm">Credit Nổi Bật</span>
            </div>
            <h3 className="text-4xl font-black text-amber-700 mb-1">{overview.featuredCredits}</h3>
            <p className="text-amber-600/70 text-sm font-semibold">credits còn lại</p>
          </div>
        </div>

        {/* 3 Thẻ thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:-translate-y-1 transition-transform">
            <div className="flex items-center text-gray-500 mb-2">
              <ShoppingBag className="w-5 h-5 mr-2 text-indigo-500" />
              <span className="font-semibold text-sm">Tổng chi tiêu</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{formatCurrency(overview.totalSpent)}</p>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:-translate-y-1 transition-transform">
            <div className="flex items-center text-gray-500 mb-2">
              <LayoutDashboard className="w-5 h-5 mr-2 text-emerald-500" />
              <span className="font-semibold text-sm">Sản phẩm đăng</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{overview.productsPosted}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:-translate-y-1 transition-transform">
            <div className="flex items-center text-gray-500 mb-2">
              <ArrowRightLeft className="w-5 h-5 mr-2 text-rose-500" />
              <span className="font-semibold text-sm">Lượt giao dịch</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{overview.totalTransactions}</p>
          </div>
        </div>

        {/* Giao dịch gần đây */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-400" />
              Giao dịch gần đây
            </h4>
            <button 
              onClick={() => setActiveTab('transactions')}
              className="text-[#2D5A3D] text-sm font-semibold hover:underline"
            >
              Xem tất cả
            </button>
          </div>
          
          {overview.recentTransactions.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">Chưa có giao dịch nào.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {overview.recentTransactions.map(tx => (
                <div key={tx.orderCode} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${tx.type === 'Posting' ? 'bg-[#2D5A3D]/10 text-[#2D5A3D]' : 'bg-amber-50 text-amber-600'}`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{tx.packageName}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString('vi-VN')} • #{tx.orderCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#2D5A3D]">+{tx.credits} cr</p>
                    <p className="text-xs font-semibold text-gray-900">{formatCurrency(tx.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTransactionsTab = () => {
    const totalSpent = overview?.totalSpent || 0;
    
    return (
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({length: 4}).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-100 rounded"></div>
                    <div className="h-3 w-24 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2 text-right flex flex-col items-end">
                  <div className="h-4 w-20 bg-gray-100 rounded"></div>
                  <div className="h-4 w-24 bg-gray-100 rounded"></div>
                  <div className="h-5 w-16 bg-gray-100 rounded-full mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white border border-gray-100 rounded-2xl shadow-sm">
            Chưa có giao dịch nào
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const isPosting = tx.type === 'Posting';
              const iconColorClass = isPosting ? 'bg-indigo-50 text-indigo-500' : 'bg-amber-50 text-amber-600';
              const textColorClass = isPosting ? 'text-indigo-600' : 'text-amber-600';
              
              return (
                <div key={tx.orderCode} className="bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconColorClass}`}>
                      {isPosting ? <CreditCard className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{tx.packageName}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {tx.orderCode} <span className="mx-1">•</span> {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end space-y-1">
                    <span className={`text-sm font-bold ${textColorClass}`}>
                      +{tx.credits} credits
                    </span>
                    <span className="text-sm font-black text-gray-900">
                      {formatCurrency(tx.amount)}
                    </span>
                    <div className="mt-1">
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Thống kê Footer & Pagination */}
        {(!isLoading && transactions.length > 0) && (
          <div className="mt-6 space-y-4">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 font-semibold">Tổng chi tiêu:</p>
                <p className="text-sm text-gray-500 font-semibold">Số giao dịch thành công:</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-lg font-black text-[#2D5A3D]">{formatCurrency(totalSpent)}</p>
                <p className="text-sm font-bold text-gray-900">{transactions.filter(t => t.status === 'Success').length}/{totalTx}</p>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-sm text-gray-500 font-medium">Trang {page} / {totalPages}</span>
                <div className="flex space-x-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    Trước
                  </button>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const displayTotalTx = totalTx || overview?.totalTransactions || 0;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative pt-8 pb-6 px-8 border-b border-gray-100 bg-gradient-to-b from-slate-50 to-white">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 bg-white hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start space-x-5">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-2xl flex items-center justify-center text-white text-xl font-bold uppercase overflow-hidden shadow-md ring-4 ring-green-50">
              {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : user.username.substring(0, 2)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{user.fullName || user.username}</h3>
                {user.isActive ? (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Hoạt động</span>
                ) : (
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Bị khóa</span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-500 font-medium">
                <div className="flex items-center"><User className="w-4 h-4 mr-1.5 opacity-70" /> @{user.username}</div>
                <div className="flex items-center"><Mail className="w-4 h-4 mr-1.5 opacity-70" /> {user.email}</div>
                <div className="flex items-center"><Calendar className="w-4 h-4 mr-1.5 opacity-70" /> Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-8 border-b border-gray-100 flex space-x-8">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`py-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'overview' 
                ? 'border-[#2D5A3D] text-[#2D5A3D]' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tổng quan
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center ${
              activeTab === 'transactions' 
                ? 'border-[#2D5A3D] text-[#2D5A3D]' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Lịch sử giao dịch
            {displayTotalTx > 0 && (
               <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                 activeTab === 'transactions' ? 'bg-[#2D5A3D]/10 text-[#2D5A3D]' : 'bg-gray-100 text-gray-600'
               }`}>{displayTotalTx}</span>
            )}
          </button>
        </div>
        
        {/* Content Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-white">
          {activeTab === 'overview' ? renderOverviewTab() : renderTransactionsTab()}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="flex space-x-3">
            {onBanClick && user.isActive && (
              <button 
                onClick={onBanClick}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm shadow-sm"
              >
                <Ban className="w-4 h-4" />
                <span>Khóa tài khoản</span>
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-xl transition-colors font-bold text-sm shadow-md"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
