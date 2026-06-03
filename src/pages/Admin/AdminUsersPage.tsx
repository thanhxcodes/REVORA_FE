import { useState } from 'react';
import { Search, Shield, Ban, Eye, X, CreditCard, Package, ChevronRight, TrendingUp, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/common/AdminLayout';

interface UserData {
  id: number;
  username: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'suspended';
  credits: { posting: number; featured: number };
  totalSpent: number;
  itemsSold: number;
  avatar: string;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  date: string;
  package: string;
  type: 'posting' | 'featured';
  credits: number;
  amount: number;
  status: 'success' | 'pending' | 'failed';
}

const mockUsers: UserData[] = [
  {
    id: 1,
    username: 'fashionista_22',
    email: 'fashionista@example.com',
    phone: '0901234567',
    joinDate: '15/03/2023',
    status: 'active',
    credits: { posting: 35, featured: 18 },
    totalSpent: 428000,
    itemsSold: 156,
    avatar: 'FA',
    transactions: [
      { id: 'TXN001', date: '28/05/2024', package: 'Posting Month', type: 'posting', credits: 120, amount: 199000, status: 'success' },
      { id: 'TXN002', date: '10/04/2024', package: 'Featured Week', type: 'featured', credits: 15, amount: 149000, status: 'success' },
      { id: 'TXN003', date: '02/03/2024', package: 'Posting Week', type: 'posting', credits: 30, amount: 79000, status: 'success' },
      { id: 'TXN004', date: '15/01/2024', package: 'Featured Day', type: 'featured', credits: 3, amount: 49000, status: 'success' },
    ],
  },
  {
    id: 2,
    username: 'vintage_style',
    email: 'vintage@example.com',
    phone: '0912345678',
    joinDate: '20/04/2023',
    status: 'active',
    credits: { posting: 12, featured: 5 },
    totalSpent: 298000,
    itemsSold: 89,
    avatar: 'VS',
    transactions: [
      { id: 'TXN010', date: '20/05/2024', package: 'Posting Week', type: 'posting', credits: 30, amount: 79000, status: 'success' },
      { id: 'TXN011', date: '05/04/2024', package: 'Featured Week', type: 'featured', credits: 15, amount: 149000, status: 'success' },
      { id: 'TXN012', date: '12/02/2024', package: 'Posting Day', type: 'posting', credits: 5, amount: 19000, status: 'failed' },
    ],
  },
  {
    id: 3,
    username: 'sneaker_head',
    email: 'sneakers@example.com',
    phone: '0923456789',
    joinDate: '10/05/2023',
    status: 'active',
    credits: { posting: 8, featured: 0 },
    totalSpent: 99000,
    itemsSold: 45,
    avatar: 'SH',
    transactions: [
      { id: 'TXN020', date: '15/05/2024', package: 'Posting Week', type: 'posting', credits: 30, amount: 79000, status: 'success' },
      { id: 'TXN021', date: '10/03/2024', package: 'Posting Day', type: 'posting', credits: 5, amount: 19000, status: 'success' },
    ],
  },
  {
    id: 4,
    username: 'luxury_deals',
    email: 'luxury@example.com',
    phone: '0934567890',
    joinDate: '05/02/2023',
    status: 'active',
    credits: { posting: 50, featured: 25 },
    totalSpent: 697000,
    itemsSold: 234,
    avatar: 'LD',
    transactions: [
      { id: 'TXN030', date: '29/05/2024', package: 'Posting Month', type: 'posting', credits: 120, amount: 199000, status: 'success' },
      { id: 'TXN031', date: '01/05/2024', package: 'Featured Month', type: 'featured', credits: 50, amount: 349000, status: 'success' },
      { id: 'TXN032', date: '05/03/2024', package: 'Posting Month', type: 'posting', credits: 120, amount: 199000, status: 'success' },
    ],
  },
  {
    id: 5,
    username: 'thrift_queen',
    email: 'thrift@example.com',
    phone: '0945678901',
    joinDate: '12/01/2023',
    status: 'suspended',
    credits: { posting: 0, featured: 0 },
    totalSpent: 149000,
    itemsSold: 12,
    avatar: 'TQ',
    transactions: [
      { id: 'TXN040', date: '01/02/2024', package: 'Posting Week', type: 'posting', credits: 30, amount: 79000, status: 'success' },
      { id: 'TXN041', date: '15/01/2024', package: 'Featured Day', type: 'featured', credits: 3, amount: 49000, status: 'success' },
    ],
  },
];

function UserDetailModal({ user, onClose }: { user: UserData; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] p-6 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white text-lg font-bold">
              {user.avatar}
            </div>
            <div>
              <h3 className="text-xl font-bold">{user.username}</h3>
              <p className="text-white/80 text-sm">{user.email}</p>
              <p className="text-white/70 text-xs mt-0.5">{user.phone} · Tham gia {user.joinDate}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status badge */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-[#2D5A3D] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'bg-[#2D5A3D] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Lịch sử giao dịch ({user.transactions.length})
            </button>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">Credit Đăng Tin</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">{user.credits.posting}</div>
                  <div className="text-xs text-blue-500 mt-1">credits còn lại</div>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[#C4603A]" />
                    <span className="text-sm text-orange-700 font-medium">Credit Nổi Bật</span>
                  </div>
                  <div className="text-3xl font-bold text-[#C4603A]">{user.credits.featured}</div>
                  <div className="text-xs text-orange-500 mt-1">credits còn lại</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{user.totalSpent.toLocaleString('vi-VN')}đ</div>
                  <div className="text-xs text-gray-500 mt-1">Tổng chi tiêu</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.itemsSold}</div>
                  <div className="text-xs text-gray-500 mt-1">Sản phẩm đăng</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#2D5A3D]">{user.transactions.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Giao dịch</div>
                </div>
              </div>

              {/* Quick transaction preview */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2 text-[#2D5A3D]" />
                  Giao dịch gần đây
                </h4>
                <div className="space-y-2">
                  {user.transactions.slice(0, 3).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'posting' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                          <CreditCard className={`w-4 h-4 ${tx.type === 'posting' ? 'text-blue-600' : 'text-[#C4603A]'}`} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tx.package}</div>
                          <div className="text-xs text-gray-500">{tx.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">+{tx.credits} credits</div>
                        <div className="text-xs text-gray-500">{tx.amount.toLocaleString('vi-VN')}đ</div>
                      </div>
                    </div>
                  ))}
                </div>
                {user.transactions.length > 3 && (
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="w-full mt-2 text-sm text-[#2D5A3D] hover:underline flex items-center justify-center py-2"
                  >
                    Xem tất cả {user.transactions.length} giao dịch <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="p-6">
              <div className="space-y-3">
                {user.transactions.map((tx) => (
                  <div key={tx.id} className="border border-gray-200 rounded-2xl p-4 hover:border-[#2D5A3D]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'posting' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                          <CreditCard className={`w-5 h-5 ${tx.type === 'posting' ? 'text-blue-600' : 'text-[#C4603A]'}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{tx.package}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {tx.id} · {tx.date}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${tx.type === 'posting' ? 'text-blue-600' : 'text-[#C4603A]'}`}>
                          +{tx.credits} credits
                        </div>
                        <div className="text-sm font-bold text-gray-900 mt-0.5">{tx.amount.toLocaleString('vi-VN')}đ</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                          tx.status === 'success' ? 'bg-green-100 text-green-700' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status === 'success' ? 'Thành công' : tx.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-[#2D5A3D]/5 rounded-2xl p-4 border border-[#2D5A3D]/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Tổng chi tiêu:</span>
                  <span className="text-lg font-bold text-[#2D5A3D]">{user.totalSpent.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-gray-700">Số giao dịch thành công:</span>
                  <span className="text-sm font-bold text-gray-900">{user.transactions.filter(t => t.status === 'success').length}/{user.transactions.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex space-x-2">
            {user.status === 'active' ? (
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium">
                <Ban className="w-4 h-4" />
                <span>Khóa tài khoản</span>
              </button>
            ) : (
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium">
                <Shield className="w-4 h-4" />
                <span>Mở khóa</span>
              </button>
            )}
            <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition-colors text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>Cảnh báo</span>
            </button>
          </div>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockUsers.filter((u) => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}

      <div className="mb-8">
        <h2 className="text-3xl text-gray-900 mb-2">Quản Lý Người Dùng</h2>
        <p className="text-gray-600">Theo dõi, quản lý tài khoản và xem lịch sử giao dịch</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="suspended">Bị khóa</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Tổng Người Dùng</div>
          <div className="text-3xl font-bold text-gray-900">1,234</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Hoạt Động</div>
          <div className="text-3xl font-bold text-green-600">1,189</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Bị Khóa</div>
          <div className="text-3xl font-bold text-red-600">45</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="text-sm text-gray-600 mb-1">Người Dùng Mới (T5)</div>
          <div className="text-3xl font-bold text-blue-600">156</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 text-sm text-gray-600">Người Dùng</th>
                <th className="text-left py-4 px-6 text-sm text-gray-600">Email</th>
                <th className="text-left py-4 px-6 text-sm text-gray-600">Ngày Tham Gia</th>
                <th className="text-left py-4 px-6 text-sm text-gray-600">Credits</th>
                <th className="text-left py-4 px-6 text-sm text-gray-600">Chi Tiêu</th>
                <th className="text-left py-4 px-6 text-sm text-gray-600">Đã Đăng</th>
                <th className="text-left py-4 px-6 text-sm text-gray-600">Trạng Thái</th>
                <th className="text-right py-4 px-6 text-sm text-gray-600">Chi Tiết</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUser(user)}>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user.avatar}
                      </div>
                      <div>
                        <div className="text-sm text-gray-900 font-medium">{user.username}</div>
                        <div className="text-xs text-gray-500">ID: #{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{user.email}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{user.joinDate}</td>
                  <td className="py-4 px-6">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-blue-600 font-medium">{user.credits.posting} đăng tin</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-[#C4603A] rounded-full"></span>
                        <span className="text-[#C4603A] font-medium">{user.credits.featured} nổi bật</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-green-600">
                    {user.totalSpent.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">{user.itemsSold}</td>
                  <td className="py-4 px-6">
                    {user.status === 'active' ? (
                      <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full flex items-center space-x-1 w-fit">
                        <Shield className="w-3 h-3" />
                        <span>Hoạt động</span>
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full flex items-center space-x-1 w-fit">
                        <Ban className="w-3 h-3" />
                        <span>Bị khóa</span>
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                        className="flex items-center space-x-1.5 text-[#2D5A3D] hover:bg-[#2D5A3D]/10 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Xem</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">Hiển thị {filtered.length} trong 1,234 người dùng</div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">Trước</button>
            <button className="px-4 py-2 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-lg text-sm">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">3</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">Sau</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
