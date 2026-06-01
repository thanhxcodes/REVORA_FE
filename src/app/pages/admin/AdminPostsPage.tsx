import { useState } from 'react';
import { Search, Eye, Edit2, Trash2, AlertTriangle, X, Check, Filter, Image, Tag, User, Calendar, ChevronDown } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

type PostStatus = 'active' | 'deleted' | 'violated' | 'pending';

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

const mockPosts: Post[] = [
  { id: 'P001', title: 'Áo len vintage Zara size M', description: 'Áo len cổ tròn màu kem vintage, còn mới 95%, mặc 2 lần. Form dáng basic dễ phối đồ. Không có hà tì gì.', price: 180000, category: 'Áo', images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200'], owner: { username: 'fashionista_22', email: 'fashionista@example.com', avatar: 'FA' }, createdAt: '28/05/2024', status: 'active', views: 342, contactCount: 12, isFeatured: true, condition: 'Gần như mới', size: 'M', brand: 'Zara' },
  { id: 'P002', title: 'Quần jeans baggy high waist', description: 'Quần jeans ống rộng cạp cao vintage wash, size 27. Mua ở thị trường Mỹ về. Chưa mặc lần nào còn tag.', price: 250000, category: 'Quần', images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=200'], owner: { username: 'vintage_style', email: 'vintage@example.com', avatar: 'VS' }, createdAt: '25/05/2024', status: 'active', views: 198, contactCount: 8, isFeatured: false, condition: 'Mới', size: '27', brand: 'Levi\'s' },
  { id: 'P003', title: 'Giày sneaker Nike Air Force 1', description: 'Nike AF1 trắng size 40, mặc khoảng 10 lần. Còn hộp đầy đủ. Độ bền tốt, đế còn nguyên.', price: 650000, category: 'Giày', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'], owner: { username: 'sneaker_head', email: 'sneakers@example.com', avatar: 'SH' }, createdAt: '22/05/2024', status: 'active', views: 520, contactCount: 25, isFeatured: true, condition: 'Đã qua sử dụng', size: '40', brand: 'Nike' },
  { id: 'P004', title: 'Túi da thật Coach size nhỡ', description: 'Túi Coach da bò thật màu nâu caramel, hàng auth mua tại Mỹ. Còn receipt đầy đủ.', price: 1200000, category: 'Túi', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200'], owner: { username: 'luxury_deals', email: 'luxury@example.com', avatar: 'LD' }, createdAt: '20/05/2024', status: 'active', views: 867, contactCount: 41, isFeatured: true, condition: 'Gần như mới', size: 'One size', brand: 'Coach' },
  { id: 'P005', title: 'Váy hoa babydoll cotton', description: 'Váy hoa nhí cotton mỏng nhẹ thoáng mát, màu trắng nền hoa vàng. Size S form dáng oversize.', price: 120000, category: 'Váy', images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200'], owner: { username: 'thrift_queen', email: 'thrift@example.com', avatar: 'TQ' }, createdAt: '15/05/2024', status: 'violated', views: 89, contactCount: 3, isFeatured: false, condition: 'Đã qua sử dụng', size: 'S', brand: 'Không rõ' },
  { id: 'P006', title: 'Áo khoác bomber đen basic', description: 'Áo khoác bomber đen form regular, chất liệu poly cao cấp. Size L fit chuẩn. Ít mặc còn mới.', price: 320000, category: 'Áo khoác', images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=200'], owner: { username: 'fashionista_22', email: 'fashionista@example.com', avatar: 'FA' }, createdAt: '10/05/2024', status: 'deleted', views: 156, contactCount: 5, isFeatured: false, condition: 'Gần như mới', size: 'L', brand: 'H&M' },
];

const statusConfig: Record<PostStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Đang hiển thị', color: 'text-green-700', bg: 'bg-green-100' },
  deleted: { label: 'Đã xóa', color: 'text-gray-600', bg: 'bg-gray-100' },
  violated: { label: 'Vi phạm', color: 'text-red-700', bg: 'bg-red-100' },
  pending: { label: 'Chờ duyệt', color: 'text-yellow-700', bg: 'bg-yellow-100' },
};

function PostDetailModal({ post, onClose, onUpdateStatus }: { post: Post; onClose: () => void; onUpdateStatus: (id: string, status: PostStatus, note?: string) => void }) {
  const [editMode, setEditMode] = useState(false);
  const [violationNote, setViolationNote] = useState('');
  const [showViolationForm, setShowViolationForm] = useState(false);
  const [editForm, setEditForm] = useState({ title: post.title, description: post.description, price: post.price });

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
              {editMode ? (
                <div className="space-y-2">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] text-sm font-medium"
                  />
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] text-sm"
                  />
                </div>
              ) : (
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
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Mô tả</label>
            {editMode ? (
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] text-sm resize-none"
              />
            ) : (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">{post.description}</p>
            )}
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
                    onUpdateStatus(post.id, 'violated', violationNote);
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
            {!editMode && post.status !== 'deleted' && (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => setShowViolationForm(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 transition-colors text-sm font-medium"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Vi phạm</span>
                </button>
                <button
                  onClick={() => { onUpdateStatus(post.id, 'deleted'); onClose(); }}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa mềm</span>
                </button>
              </>
            )}
            {editMode && (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-[#2D5A3D] text-white rounded-xl hover:bg-[#1E4029] transition-colors text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu</span>
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Huỷ
                </button>
              </>
            )}
            {post.status === 'deleted' && (
              <button
                onClick={() => { onUpdateStatus(post.id, 'active'); onClose(); }}
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
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', ...Array.from(new Set(mockPosts.map(p => p.category)))];

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.owner.username.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const handleUpdateStatus = (id: string, status: PostStatus, note?: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, status } : p));
    if (selectedPost?.id === id) setSelectedPost(prev => prev ? { ...prev, status } : null);
  };

  const stats = {
    total: posts.length,
    active: posts.filter(p => p.status === 'active').length,
    violated: posts.filter(p => p.status === 'violated').length,
    deleted: posts.filter(p => p.status === 'deleted').length,
  };

  return (
    <AdminLayout>
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
            <option value="active">Đang hiển thị</option>
            <option value="violated">Vi phạm</option>
            <option value="deleted">Đã xóa</option>
            <option value="pending">Chờ duyệt</option>
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
              {filtered.map((post) => {
                const si = statusConfig[post.status];
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
                        {post.status !== 'deleted' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(post.id, 'deleted'); }}
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

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Không tìm thấy bài đăng nào</p>
          </div>
        )}

        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">Hiển thị {filtered.length} trong {posts.length} bài đăng</div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Trước</button>
            <button className="px-4 py-2 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-lg text-sm">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Sau</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
