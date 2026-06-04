import { DollarSign, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '../../components/common/AdminLayout';

const monthlyRevenue = [
  { month: 'T1', posting: 12400000, featured: 8900000 },
  { month: 'T2', posting: 18500000, featured: 12300000 },
  { month: 'T3', posting: 22100000, featured: 15800000 },
  { month: 'T4', posting: 29800000, featured: 19200000 },
  { month: 'T5', posting: 35600000, featured: 24100000 },
];

const transactions = [
  { id: 'TXN001', user: 'fashionista_22', package: 'Featured Week', amount: 149000, date: '20/05/2026 14:30', status: 'Thành công' },
  { id: 'TXN002', user: 'vintage_style', package: 'Posting Month', amount: 199000, date: '20/05/2026 14:15', status: 'Thành công' },
  { id: 'TXN003', user: 'sneaker_head', package: 'Featured Day', amount: 49000, date: '20/05/2026 13:45', status: 'Thành công' },
  { id: 'TXN004', user: 'luxury_deals', package: 'Posting Week', amount: 79000, date: '20/05/2026 12:20', status: 'Thành công' },
  { id: 'TXN005', user: 'thrift_queen', package: 'Featured Month', amount: 349000, date: '20/05/2026 11:10', status: 'Thành công' },
  { id: 'TXN006', user: 'style_maven', package: 'Posting Day', amount: 19000, date: '20/05/2026 10:05', status: 'Thành công' },
  { id: 'TXN007', user: 'bag_queen', package: 'Featured Week', amount: 149000, date: '19/05/2026 18:45', status: 'Thành công' },
  { id: 'TXN008', user: 'denim_lover', package: 'Posting Week', amount: 79000, date: '19/05/2026 16:30', status: 'Thành công' },
];

export default function AdminRevenuePage() {
  return (
    <AdminLayout>
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl text-gray-900 mb-2">Quản Lý Doanh Thu</h2>
                <p className="text-gray-600">Theo dõi và phân tích nguồn thu</p>
              </div>
              <button className="flex items-center space-x-2 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white px-6 py-3 rounded-full hover:shadow-lg transition-all">
                <Download className="w-5 h-5" />
                <span>Xuất Báo Cáo</span>
              </button>
            </div>
          </div>

          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8" />
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">+18.2%</span>
              </div>
              <div className="text-3xl font-bold mb-1">59.700.000đ</div>
              <div className="text-sm text-white/80">Tổng Doanh Thu Tháng 5</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8" />
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Posting</span>
              </div>
              <div className="text-3xl font-bold mb-1">35.600.000đ</div>
              <div className="text-sm text-white/80">Doanh Thu Gói Posting</div>
            </div>

            <div className="bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8" />
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Featured</span>
              </div>
              <div className="text-3xl font-bold mb-1">24.100.000đ</div>
              <div className="text-sm text-white/80">Doanh Thu Gói Featured</div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h3 className="text-xl text-gray-900 mb-6">Biểu Đồ Doanh Thu 5 Tháng</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="posting" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="featured" fill="#2D5A3D" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-xl text-gray-900 mb-6">Lịch Sử Giao Dịch</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Mã GD</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Người Dùng</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Gói</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Số Tiền</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Thời Gian</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-600">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900">{txn.id}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{txn.user}</td>
                      <td className="py-4 px-4 text-sm text-gray-700">{txn.package}</td>
                      <td className="py-4 px-4 text-sm font-bold text-green-600">{txn.amount.toLocaleString('vi-VN')}đ</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{txn.date}</td>
                      <td className="py-4 px-4">
                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
    </AdminLayout>
  );
}
