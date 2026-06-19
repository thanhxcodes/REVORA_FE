import { useState, useEffect } from 'react';
import { Mail, Calendar, CheckCircle, Clock, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { authClient } from '../../providers/authProvider/authService';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/common/AdminLayout';

interface Feedback {
  feedbackId: number;
  userId: number | null;
  username: string | null;
  fullName: string | null;
  email: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchFeedbacks(currentPage);
  }, [currentPage]);

  const fetchFeedbacks = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await authClient.get(`/Feedback?page=${page}&pageSize=${pageSize}`);
      if (response.data?.success) {
        setFeedbacks(response.data.data.items || []);
        setTotalPages(response.data.data.totalPages || 1);
      } else {
        toast.error(response.data?.message || 'Không thể tải danh sách ý kiến');
      }
    } catch (error: any) {
      console.error('Lỗi khi tải feedbacks:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (feedbackId: number, newStatus: string) => {
    try {
      const response = await authClient.put(`/Feedback/${feedbackId}/status`, `"${newStatus}"`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.data?.success) {
        toast.success('Cập nhật trạng thái thành công');
        setFeedbacks(prev => prev.map(f => f.feedbackId === feedbackId ? { ...f, status: newStatus } : f));
      } else {
        toast.error(response.data?.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error: any) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ý Kiến Đóng Góp</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý và xem xét các phản hồi từ người dùng</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600 text-sm">Người Dùng</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Nội Dung</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm w-40">Thời Gian</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm w-40 text-center">Trạng Thái</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm w-32 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                  </tr>
                ) : feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">Chưa có ý kiến đóng góp nào.</td>
                  </tr>
                ) : (
                  feedbacks.map((item) => (
                    <tr key={item.feedbackId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-1">
                          {item.userId ? (
                            <>
                              <span className="font-semibold text-gray-900 text-sm">{item.fullName}</span>
                              <span className="text-xs text-gray-500">@{item.username}</span>
                            </>
                          ) : (
                            <span className="font-semibold text-gray-500 text-sm italic">Khách vãng lai</span>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <Mail className="w-3.5 h-3.5" />
                            {item.email}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.message}</p>
                        </div>
                      </td>
                      <td className="p-4 align-top text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="p-4 align-top text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          item.status === 'New' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {item.status === 'New' ? (
                            <><Clock className="w-3.5 h-3.5" /> Chờ xử lý</>
                          ) : (
                            <><CheckCircle className="w-3.5 h-3.5" /> Đã xem</>
                          )}
                        </span>
                      </td>
                      <td className="p-4 align-top text-center">
                        {item.status === 'New' && (
                          <button
                            onClick={() => handleUpdateStatus(item.feedbackId, 'Reviewed')}
                            className="text-xs font-semibold text-brand-primary hover:text-brand-secondary bg-brand-primary/10 hover:bg-brand-primary/20 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Đánh dấu đã xem
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                Trang {currentPage} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
