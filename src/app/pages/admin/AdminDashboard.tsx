import { DollarSign, Package, Users, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from '../../components/AdminLayout';

const revenueData = [
  { date: '15/05', posting: 380000, featured: 490000 },
  { date: '16/05', posting: 420000, featured: 530000 },
  { date: '17/05', posting: 560000, featured: 680000 },
  { date: '18/05', posting: 490000, featured: 720000 },
  { date: '19/05', posting: 630000, featured: 850000 },
  { date: '20/05', posting: 720000, featured: 920000 },
];

const packageSales = [
  { name: 'Posting Day', value: 45, color: '#3B82F6' },
  { name: 'Posting Week', value: 120, color: '#8B5CF6' },
  { name: 'Posting Month', value: 65, color: '#10B981' },
  { name: 'Featured Day', value: 38, color: '#F59E0B' },
  { name: 'Featured Week', value: 95, color: '#EF4444' },
  { name: 'Featured Month', value: 42, color: '#2D5A3D' },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
          <div className="mb-8">
            <h2 className="text-3xl text-gray-900 mb-2">Tổng Quan</h2>
            <p className="text-gray-600">Thống kê và quản lý hệ thống REVORA</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-500 text-sm">+12.5%</span>
              </div>
              <div className="text-3xl text-gray-900 mb-1">15.240.000đ</div>
              <div className="text-sm text-gray-600">Doanh Thu Tháng Này</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-blue-500 text-sm">+8.2%</span>
              </div>
              <div className="text-3xl text-gray-900 mb-1">405</div>
              <div className="text-sm text-gray-600">Gói Đã Bán</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-purple-500 text-sm">+15.3%</span>
              </div>
              <div className="text-3xl text-gray-900 mb-1">1.234</div>
              <div className="text-sm text-gray-600">Người Dùng Hoạt Động</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-[#2D5A3D] text-sm">+22.1%</span>
              </div>
              <div className="text-3xl text-gray-900 mb-1">2.567</div>
              <div className="text-sm text-gray-600">Sản Phẩm Đang Bán</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl text-gray-900 mb-6">Doanh Thu 7 Ngày Qua</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="postingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="featuredGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D5A3D" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2D5A3D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Area type="monotone" dataKey="posting" stroke="#3B82F6" strokeWidth={2} fill="url(#postingGradient)" />
                  <Area type="monotone" dataKey="featured" stroke="#2D5A3D" strokeWidth={2} fill="url(#featuredGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Package Distribution */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl text-gray-900 mb-6">Phân Bổ Gói Đã Bán</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={packageSales}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {packageSales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {packageSales.map((pkg) => (
                  <div key={pkg.name} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pkg.color }} />
                    <span className="text-xs text-gray-600">{pkg.name}: {pkg.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-xl text-gray-900 mb-6">Hoạt Động Gần Đây</h3>
            <div className="space-y-4">
              {[
                { user: 'fashionista_22', action: 'mua gói Featured Week', amount: '149.000đ', time: '2 phút trước' },
                { user: 'vintage_style', action: 'mua gói Posting Month', amount: '199.000đ', time: '15 phút trước' },
                { user: 'sneaker_head', action: 'mua gói Featured Day', amount: '49.000đ', time: '1 giờ trước' },
                { user: 'luxury_deals', action: 'mua gói Posting Week', amount: '79.000đ', time: '2 giờ trước' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-sm">
                      {activity.user.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-green-600">{activity.amount}</div>
                </div>
              ))}
            </div>
          </div>
    </AdminLayout>
  );
}
