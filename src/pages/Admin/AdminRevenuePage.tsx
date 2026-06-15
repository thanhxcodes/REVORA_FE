import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Filter, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '../../components/common/AdminLayout';
import { authClient } from '../../providers/authProvider/authService';
import * as xlsx from 'xlsx';

interface RevenueStats {
  totalRevenue: number;
  revenueGrowth: number;
  revenueByPackages: { packageName: string; revenue: number }[];
  chartData: { label: string; posting: number; featured: number }[];
  transactions: { id: string; user: string; package: string; amount: number; date: string; status: string }[];
}

export default function AdminRevenuePage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [filterType, setFilterType] = useState('month');
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate years from 2023 to current year + 1
  const years = Array.from({ length: currentYear - 2023 + 2 }, (_, i) => 2023 + i);
  // Generate months 1 to 12
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const fetchStats = async () => {
    // If custom is selected, we need both start and end date to make a valid request
    if (filterType === 'custom' && (!customStartDate || !customEndDate)) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('filterType', filterType);
      
      if (filterType === 'year') {
        params.append('year', year.toString());
      } else if (filterType === 'month') {
        params.append('year', year.toString());
        params.append('month', month.toString());
      } else if (filterType === 'custom') {
        params.append('startDate', customStartDate);
        params.append('endDate', customEndDate);
      }

      const response = await authClient.get(`/Admin/Revenue?${params.toString()}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filterType, year, month, customStartDate, customEndDate]);

  const exportToExcel = () => {
    if (!stats || stats.transactions.length === 0) return;
    
    const ws = xlsx.utils.json_to_sheet(stats.transactions.map(t => ({
      'Mã GD': t.id,
      'Người Dùng': t.user,
      'Gói': t.package,
      'Số Tiền': t.amount,
      'Thời Gian': t.date,
      'Trạng Thái': t.status
    })));
    
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Giao Dịch");
    xlsx.writeFile(wb, `BaoCaoDoanhThu_${filterType}.xlsx`);
  };

  const getFilterLabel = () => {
    if (filterType === 'year') return `Năm ${year}`;
    if (filterType === 'month') return `Tháng ${month}/${year}`;
    if (filterType === 'custom') {
      if (!customStartDate || !customEndDate) return 'Tùy chỉnh';
      const start = new Date(customStartDate).toLocaleDateString('vi-VN');
      const end = new Date(customEndDate).toLocaleDateString('vi-VN');
      return `từ ${start} đến ${end}`;
    }
    return '';
  };

  const postingRevenue = stats?.revenueByPackages.find(p => p.packageName === 'Posting')?.revenue || 0;
  const featuredRevenue = stats?.revenueByPackages.find(p => p.packageName === 'Featured')?.revenue || 0;

  return (
    <AdminLayout>
          <div className="mb-8">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl text-gray-900 mb-2">Quản Lý Doanh Thu</h2>
                <p className="text-gray-600">Theo dõi và phân tích nguồn thu chi tiết</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                
                {/* Loại Bộ Lọc */}
                <div className="relative">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-10 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium"
                  >
                    <option value="year">Theo Năm</option>
                    <option value="month">Theo Tháng</option>
                    <option value="custom">Tùy Chỉnh Khoảng Ngày</option>
                  </select>
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>

                {/* Các Điều Kiện Lọc Tương Ứng */}
                <div className="flex items-center gap-3 border-l border-gray-200 pl-3">
                  {filterType === 'year' && (
                    <select 
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium"
                    >
                      {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
                    </select>
                  )}

                  {filterType === 'month' && (
                    <>
                      <select 
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium"
                      >
                        {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                      </select>
                      <select 
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium"
                      >
                        {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
                      </select>
                    </>
                  )}

                  {filterType === 'custom' && (
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center">
                        <span className="text-xs text-gray-500 mr-2 font-medium">Từ</span>
                        <input 
                          type="date" 
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                      </div>
                      <div className="relative flex items-center">
                        <span className="text-xs text-gray-500 mr-2 font-medium">Đến</span>
                        <input 
                          type="date" 
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-l border-gray-200 pl-3">
                  <button 
                    onClick={exportToExcel}
                    className="flex items-center space-x-2 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white px-5 py-2 rounded-lg hover:shadow-md transition-all text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span>Xuất Excel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Stats */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10">
                    <DollarSign className="w-32 h-32 transform translate-x-8 -translate-y-8" />
                  </div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <span className={`text-sm bg-white/20 px-3 py-1.5 rounded-full font-medium shadow-sm backdrop-blur-sm ${(stats?.revenueGrowth || 0) >= 0 ? '' : 'text-red-100 bg-red-500/30'}`}>
                      {(stats?.revenueGrowth || 0) > 0 ? '+' : ''}{stats?.revenueGrowth}% so với kỳ trước
                    </span>
                  </div>
                  <div className="text-4xl font-bold mb-2 relative z-10 tracking-tight">{stats?.totalRevenue.toLocaleString('vi-VN')}đ</div>
                  <div className="text-sm text-green-100 font-medium relative z-10">Tổng Doanh Thu {getFilterLabel()}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10">
                    <DollarSign className="w-32 h-32 transform translate-x-8 -translate-y-8" />
                  </div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <span className="text-sm bg-white/20 px-3 py-1.5 rounded-full font-medium shadow-sm backdrop-blur-sm">Posting</span>
                  </div>
                  <div className="text-4xl font-bold mb-2 relative z-10 tracking-tight">{postingRevenue.toLocaleString('vi-VN')}đ</div>
                  <div className="text-sm text-blue-100 font-medium relative z-10">Doanh Thu Gói Posting</div>
                </div>

                <div className="bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10">
                    <DollarSign className="w-32 h-32 transform translate-x-8 -translate-y-8" />
                  </div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <span className="text-sm bg-white/20 px-3 py-1.5 rounded-full font-medium shadow-sm backdrop-blur-sm">Featured</span>
                  </div>
                  <div className="text-4xl font-bold mb-2 relative z-10 tracking-tight">{featuredRevenue.toLocaleString('vi-VN')}đ</div>
                  <div className="text-sm text-green-100/80 font-medium relative z-10">Doanh Thu Gói Featured</div>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    Biểu Đồ Thống Kê {getFilterLabel()}
                  </h3>
                </div>
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[600px]">
                    <ResponsiveContainer width="100%" height={380}>
                      <BarChart data={stats?.chartData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="label" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                        <YAxis stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`${value.toLocaleString('vi-VN')}đ`, '']}
                        />
                        <Bar dataKey="posting" name="Gói Posting" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="featured" name="Gói Featured" fill="#2D5A3D" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Chi Tiết Lịch Sử Giao Dịch</h3>
                  <span className="text-sm text-gray-500 font-medium">{stats?.transactions.length} giao dịch</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã GD</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Người Dùng</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Gói Cước</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Số Tiền</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Thời Gian</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stats?.transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center text-gray-400">
                              <DollarSign className="w-12 h-12 mb-2 opacity-20" />
                              <p className="font-medium">Không có giao dịch nào trong thời gian này</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        stats?.transactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-4 px-6 text-sm font-semibold text-gray-900">{txn.id}</td>
                            <td className="py-4 px-6 text-sm text-gray-600">{txn.user}</td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${txn.package.includes('Posting') ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                                {txn.package}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm font-bold text-gray-900">{txn.amount.toLocaleString('vi-VN')}đ</td>
                            <td className="py-4 px-6 text-sm text-gray-500">{txn.date}</td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {txn.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
    </AdminLayout>
  );
}
