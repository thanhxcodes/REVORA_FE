import { DollarSign, Package, Users, TrendingUp, Eye, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 12400, users: 340 },
  { month: 'Feb', revenue: 18500, users: 480 },
  { month: 'Mar', revenue: 22100, users: 620 },
  { month: 'Apr', revenue: 29800, users: 790 },
  { month: 'May', revenue: 35600, users: 950 },
  { month: 'Jun', revenue: 42300, users: 1200 },
];

const packageDistribution = [
  { name: 'Free', count: 450 },
  { name: 'Basic', count: 280 },
  { name: 'Plus', count: 320 },
  { name: 'Max', count: 150 },
  { name: 'Silver', count: 120 },
  { name: 'Gold', count: 80 },
  { name: 'Platinum', count: 30 },
];

const pendingProducts = [
  { id: 1, title: 'Vintage Leather Jacket', seller: 'fashionista_22', price: 189, status: 'pending' },
  { id: 2, title: 'Designer Handbag Authentic', seller: 'luxury_deals', price: 450, status: 'pending' },
  { id: 3, title: 'Limited Edition Sneakers', seller: 'sneaker_head', price: 320, status: 'pending' },
  { id: 4, title: 'Silk Evening Gown', seller: 'style_maven', price: 280, status: 'pending' },
];

const recentUsers = [
  { id: 1, name: 'fashionista_22', email: 'fashion@example.com', package: 'Premium Gold', date: '2024-05-18' },
  { id: 2, name: 'vintage_co', email: 'vintage@example.com', package: 'Standard Plus', date: '2024-05-18' },
  { id: 3, name: 'luxury_deals', email: 'luxury@example.com', package: 'Premium Silver', date: '2024-05-17' },
  { id: 4, name: 'sneaker_head', email: 'sneakers@example.com', package: 'Standard Basic', date: '2024-05-17' },
];

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your REVORA marketplace</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-500 text-sm">+12.5%</span>
            </div>
            <div className="text-3xl text-gray-900 mb-1">$42,300</div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-500 text-sm">+8.2%</span>
            </div>
            <div className="text-3xl text-gray-900 mb-1">1,234</div>
            <div className="text-sm text-gray-600">Active Listings</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-500 text-sm">+15.3%</span>
            </div>
            <div className="text-3xl text-gray-900 mb-1">1,200</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C4603A] to-[#B8941F] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-500 text-sm">+22.1%</span>
            </div>
            <div className="text-3xl text-gray-900 mb-1">430</div>
            <div className="text-sm text-gray-600">Premium Users</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl text-gray-900 mb-6">Revenue Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D5A3D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2D5A3D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#2D5A3D" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Package Distribution */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl text-gray-900 mb-6">Package Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={packageDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="count" fill="#2D5A3D" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Moderation */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-gray-900">Pending Product Approvals</h2>
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                {pendingProducts.length} pending
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Seller</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Price</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                        <span className="text-gray-900">{product.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{product.seller}</td>
                    <td className="py-4 px-4 text-gray-900">${product.price}</td>
                    <td className="py-4 px-4">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        Pending Review
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl text-gray-900 mb-6">Recent User Registrations</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Username</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Package</th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600">Join Date</th>
                  <th className="text-right py-3 px-4 text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-sm">
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{user.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        user.package.includes('Premium')
                          ? 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.package}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{user.date}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-sm text-[#2D5A3D] hover:underline">View</button>
                        <button className="text-sm text-gray-600 hover:underline">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
