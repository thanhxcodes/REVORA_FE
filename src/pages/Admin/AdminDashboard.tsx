import React, { useState, useEffect } from 'react';
import { DollarSign, Package, Users, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from '../../components/common/AdminLayout';
import { authClient } from '../../providers/authProvider/authService';

interface RevenueChartItem {
  label: string;
  posting: number;
  featured: number;
}

interface PackageDistributionItem {
  name: string;
  value: number;
  color: string;
}

interface RecentActivityItem {
  user: string;
  action: string;
  amount: number;
  time: string;
}

interface DashboardStats {
  currentMonthRevenue: number;
  revenueGrowth: number;
  packagesSold: number;
  packagesSoldGrowth: number;
  totalUsers: number;
  totalUsersGrowth: number;
  activeProducts: number;
  activeProductsGrowth: number;
  revenueChart7Days: RevenueChartItem[];
  packageDistribution: PackageDistributionItem[];
  recentActivities: RecentActivityItem[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await authClient.get('/Admin/Dashboard');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        </div>
      </AdminLayout>
    );
  }

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
                <span className={`text-sm ${stats && stats.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats && stats.revenueGrowth > 0 ? '+' : ''}{stats?.revenueGrowth}%
                </span>
              </div>
              <div className="text-3xl text-gray-900 mb-1">{stats?.currentMonthRevenue.toLocaleString('vi-VN')}đ</div>
              <div className="text-sm text-gray-600">Doanh Thu Tháng Này</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm ${stats && stats.packagesSoldGrowth >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                  {stats && stats.packagesSoldGrowth > 0 ? '+' : ''}{stats?.packagesSoldGrowth}%
                </span>
              </div>
              <div className="text-3xl text-gray-900 mb-1">{stats?.packagesSold.toLocaleString('vi-VN')}</div>
              <div className="text-sm text-gray-600">Gói Đã Bán Tháng Này</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm ${stats && stats.totalUsersGrowth >= 0 ? 'text-purple-500' : 'text-red-500'}`}>
                  {stats && stats.totalUsersGrowth > 0 ? '+' : ''}{stats?.totalUsersGrowth}%
                </span>
              </div>
              <div className="text-3xl text-gray-900 mb-1">{stats?.totalUsers.toLocaleString('vi-VN')}</div>
              <div className="text-sm text-gray-600">Người Dùng Hoạt Động</div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm ${stats && stats.activeProductsGrowth >= 0 ? 'text-[#2D5A3D]' : 'text-red-500'}`}>
                  {stats && stats.activeProductsGrowth > 0 ? '+' : ''}{stats?.activeProductsGrowth}%
                </span>
              </div>
              <div className="text-3xl text-gray-900 mb-1">{stats?.activeProducts.toLocaleString('vi-VN')}</div>
              <div className="text-sm text-gray-600">Sản Phẩm Đang Bán</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl text-gray-900 mb-6">Doanh Thu 7 Ngày Qua</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats?.revenueChart7Days || []}>
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
                  <XAxis dataKey="label" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString('vi-VN')}đ`, '']}
                  />
                  <Area type="monotone" dataKey="posting" name="Gói Posting" stroke="#3B82F6" strokeWidth={2} fill="url(#postingGradient)" />
                  <Area type="monotone" dataKey="featured" name="Gói Featured" stroke="#2D5A3D" strokeWidth={2} fill="url(#featuredGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Package Distribution */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl text-gray-900 mb-6">Phân Bổ Gói Đã Bán Tháng Này</h3>
              {stats?.packageDistribution.length === 0 ? (
                 <div className="flex justify-center items-center h-[300px] text-gray-400">
                   Chưa có dữ liệu gói được bán
                 </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats?.packageDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats?.packageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {stats?.packageDistribution.map((pkg) => (
                      <div key={pkg.name} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pkg.color }} />
                        <span className="text-xs text-gray-600">{pkg.name}: {pkg.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-xl text-gray-900 mb-6">Hoạt Động Gần Đây</h3>
            <div className="space-y-4">
              {stats?.recentActivities.length === 0 ? (
                 <div className="text-center text-gray-400 py-4">Chưa có hoạt động giao dịch nào.</div>
              ) : (
                stats?.recentActivities.map((activity, index) => (
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
                    <div className="text-sm font-bold text-green-600">+{activity.amount.toLocaleString('vi-VN')}đ</div>
                  </div>
                ))
              )}
            </div>
          </div>
    </AdminLayout>
  );
}
