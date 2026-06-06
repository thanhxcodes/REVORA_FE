import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, AlertTriangle, X, Check, Image, User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../../components/common/AdminLayout';
import { getAllProductsForAdminAPI, updateProductStatusAPI } from '../../features/admin/services/adminApi';
import toast from 'react-hot-toast';

type PostStatus = 'Public' | 'Private' | 'Expired' | 'Deleted' | 'Violated';

interface Post {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  owner: { username: string; email: string; avatar: string };
  createdAt: string;
  status: PostStatus;
  views: number;
  contactCount: number;
  isFeatured: boolean;
  condition: string;
  size: string;
  brand: string;
}

// Xóa mockPosts

const statusConfig: Record<PostStatus, { label: string; color: string; bg: string }> = {
  Public: { label: 'Đang hiển thị', color: 'text-green-700', bg: 'bg-green-100' },
  Private: { label: 'Chờ duyệt', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  Expired: { label: 'Hết hạn', color: 'text-gray-700', bg: 'bg-gray-200' },
  Deleted: { label: 'Đã xóa', color: 'text-gray-600', bg: 'bg-gray-100' },
  Violated: { label: 'Vi phạm', color: 'text-red-700', bg: 'bg-red-100' },
};

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: { isOpen: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-6 border border-gray-100">
        <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex space-x-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Hủy</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-[#2D5A3D] text-white rounded-xl text-sm font-medium hover:bg-[#1E4029] transition-colors">Xác nhận</button>
        </div>
      </div>
    </div>
  );
}

function PostDetailModal({ post, onClose, onUpdateStatus }: { post: Post; onClose: () => void; onUpdateStatus: (id: string, status: PostStatus, note?: string) => void }) {
  const [violationNote, setViolationNote] = useState('');
  const [showViolationForm, setShowViolationForm] = useState(false);

  const statusInfo = statusConfig[post.status];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] p-5 text-white flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-bold text-lg">Chi tiết bài đăng</h3>
            <p className="text-white/70 text-xs mt-0.5">ID: {post.id}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Product Image + Info */}
          <div className="flex space-x-4">
            <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
              <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
                <>
                  <h4 className="font-bold text-gray-900 text-base leading-snug">{post.title}</h4>
                  <div className="text-lg font-bold text-[#C4603A] mt-1">{post.price.toLocaleString('vi-VN')}đ</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{post.category}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{post.condition}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">Size {post.size}</span>
                    {post.isFeatured && <span className="text-xs bg-orange-100 text-[#C4603A] px-2 py-0.5 rounded-md font-medium">Nổi bật</span>}
                  </div>
                </>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Mô tả</label>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">{post.description}</p>
          </div>

          {/* Owner + Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#2D5A3D]/5 rounded-xl p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center space-x-1">
                <User className="w-3.5 h-3.5" />
                <span>Người đăng</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {post.owner.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{post.owner.username}</div>
                  <div className="text-xs text-gray-500">{post.owner.email}</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Thống kê</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Ngày đăng:</span>
                  <span className="font-medium text-gray-900">{post.createdAt}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Lượt xem:</span>
                  <span className="font-medium text-gray-900">{post.views}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Liên hệ:</span>
                  <span className="font-medium text-gray-900">{post.contactCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-500">Trạng thái:</span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusInfo.bg} ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Violation form */}
          {showViolationForm && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <h5 className="text-sm font-semibold text-red-700 mb-2 flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Thông báo vi phạm</span>
              </h5>
              <textarea
                rows={3}
                value={violationNote}
                onChange={(e) => setViolationNote(e.target.value)}
                placeholder="Nhập lý do vi phạm để thông báo đến người dùng..."
                className="w-full px-3 py-2 rounded-xl border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm resize-none"
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => {
                    if (!violationNote.trim()) {
                      toast.error('Vui lòng nhập lý do vi phạm');
                      return;
                    }
                    onUpdateStatus(post.id, 'Violated', violationNote);
                    setShowViolationForm(false);
                    onClose();
                  }}
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Xác nhận vi phạm
                </button>
                <button onClick={() => setShowViolationForm(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  Huỷ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex space-x-2">
            {post.status !== 'Deleted' && (
              <>
                <button
                  onClick={() => setShowViolationForm(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 transition-colors text-sm font-medium"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Vi phạm</span>
                </button>
                <button
                  onClick={() => { onUpdateStatus(post.id, 'Deleted'); }}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa mềm</span>
                </button>
              </>
            )}
            {post.status === 'Deleted' && (
              <button
                onClick={() => { onUpdateStatus(post.id, 'Public'); }}
                className="flex items-center space-x-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium"
              >
                <Check className="w-4 h-4" />
                <span>Khôi phục</span>
              </button>
            )}
          </div>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal Xác nhận
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, action: () => void }>({ isOpen: false, title: '', message: '', action: () => {} });

  const confirmAction = (title: string, message: string, action: () => void) => {
    setConfirmModal({ isOpen: true, title, message, action });
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await getAllProductsForAdminAPI();
        if (res.success) {
          setPosts(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch posts', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const categories = ['all', ...Array.from(new Set(posts.map(p => p.category)))];

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.owner.username.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const handleUpdateStatus = async (id: string, status: PostStatus, note?: string) => {
    const doUpdate = async () => {
      try {
        const res = await updateProductStatusAPI(id, status, note);
        if (res.success) {
          setPosts(posts.map(p => p.id === id ? { ...p, status } : p));
          if (selectedPost?.id === id) setSelectedPost(prev => prev ? { ...prev, status } : null);
          toast.success(status === 'Violated' ? 'Đã gửi cảnh báo vi phạm thành công!' : 'Cập nhật trạng thái thành công!');
        } else {
          toast.error('Cập nhật trạng thái thất bại');
        }
      } catch (error) {
        toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
      } finally {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    };

    if (status === 'Deleted') {
      confirmAction('Xác nhận xóa bài đăng', 'Bạn có chắc chắn muốn xóa mềm bài đăng này? Bài đăng sẽ bị gỡ khỏi ứng dụng nhưng không mất dữ liệu gốc.', doUpdate);
    } else if (status === 'Public') {
      confirmAction('Xác nhận khôi phục', 'Bạn có chắc chắn muốn khôi phục bài đăng này? Người dùng sẽ xem lại được bài đăng này trên ứng dụng.', doUpdate);
    } else {
      doUpdate();
    }
  };

  const stats = {
    total: posts.length,
    active: posts.filter(p => p.status === 'Public').length,
    violated: posts.filter(p => p.status === 'Violated').length,
    deleted: posts.filter(p => p.status === 'Deleted').length,
  };

  // Tính toán phân trang
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Đổi trang hoặc filter reset về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, itemsPerPage]);

  return (
    <AdminLayout>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      <div className="mb-8">
        <h2 className="text-3xl text-gray-900 mb-2">Quản Lý Bài Đăng</h2>
        <p className="text-gray-600">Xem, duyệt và quản lý các bài đăng sản phẩm của người dùng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tổng bài đăng', value: stats.total, color: 'text-gray-900' },
          { label: 'Đang hiển thị', value: stats.active, color: 'text-green-600' },
          { label: 'Vi phạm', value: stats.violated, color: 'text-red-600' },
          { label: 'Đã xóa', value: stats.deleted, color: 'text-gray-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, người đăng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PostStatus | 'all')}
            className="px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Public">Đang hiển thị</option>
            <option value="Private">Chờ duyệt</option>
            <option value="Expired">Hết hạn</option>
            <option value="Violated">Vi phạm</option>
            <option value="Deleted">Đã xóa</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] text-sm"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'Tất cả danh mục' : c}</option>)}
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-5 text-sm text-gray-600">Sản phẩm</th>
                <th className="text-left py-4 px-5 text-sm text-gray-600">Người đăng</th>
                <th className="text-left py-4 px-5 text-sm text-gray-600">Giá</th>
                <th className="text-left py-4 px-5 text-sm text-gray-600">Ngày đăng</th>
                <th className="text-left py-4 px-5 text-sm text-gray-600">Lượt xem</th>
                <th className="text-left py-4 px-5 text-sm text-gray-600">Trạng thái</th>
                <th className="text-right py-4 px-5 text-sm text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((post) => {
                const si = statusConfig[post.status] || { label: 'Không xác định', bg: 'bg-gray-100', color: 'text-gray-600' };
                return (
                  <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedPost(post)}>
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-48">{post.title}</div>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <span className="text-xs text-gray-400">{post.category}</span>
                            {post.isFeatured && <span className="text-xs bg-orange-100 text-[#C4603A] px-1.5 py-0.5 rounded-md font-medium">Nổi bật</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {post.owner.avatar}
                        </div>
                        <span className="text-sm text-gray-700">{post.owner.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-sm font-bold text-[#C4603A]">{post.price.toLocaleString('vi-VN')}đ</td>
                    <td className="py-4 px-5 text-sm text-gray-500">{post.createdAt}</td>
                    <td className="py-4 px-5 text-sm text-gray-700">{post.views}</td>
                    <td className="py-4 px-5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${si.bg} ${si.color}`}>{si.label}</span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}
                          className="p-2 text-[#2D5A3D] hover:bg-[#2D5A3D]/10 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {post.status !== 'Deleted' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(post.id, 'Deleted'); }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa mềm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-16 text-gray-400">
            <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Không tìm thấy bài đăng nào</p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)} trong {filtered.length} bài đăng
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Số dòng:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2D5A3D]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Simple page numbers */}
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === i + 1 
                      ? 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white' 
                      : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
