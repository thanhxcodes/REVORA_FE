import { useState } from 'react';
import { History, ArrowDownCircle, ArrowUpCircle, Search, Filter } from 'lucide-react';

interface Transaction {
  id: number;
  type: 'buy' | 'use';
  creditType: 'posting' | 'featured';
  amount: number;
  description: string;
  date: string;
  packageName?: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, type: 'buy', creditType: 'posting', amount: 30, description: 'Mua gói Posting Week', date: '25/05/2026', packageName: 'Gói 7 Ngày' },
  { id: 2, type: 'use', creditType: 'posting', amount: -1, description: 'Đăng tin: Áo Khoác Da Vintage', date: '24/05/2026' },
  { id: 3, type: 'buy', creditType: 'featured', amount: 15, description: 'Mua gói Featured Week', date: '23/05/2026', packageName: 'Gói 7 Ngày' },
  { id: 4, type: 'use', creditType: 'featured', amount: -1, description: 'Nổi bật: Túi Xách Designer', date: '22/05/2026' },
  { id: 5, type: 'use', creditType: 'posting', amount: -1, description: 'Đăng tin: Giày Thể Thao', date: '20/05/2026' },
  { id: 6, type: 'buy', creditType: 'posting', amount: 5, description: 'Mua gói Posting Day', date: '18/05/2026', packageName: 'Gói 1 Ngày' },
  { id: 7, type: 'use', creditType: 'featured', amount: -1, description: 'Nổi bật: Váy Hè Thanh Lịch', date: '15/05/2026' },
  { id: 8, type: 'buy', creditType: 'featured', amount: 3, description: 'Mua gói Featured Day', date: '12/05/2026', packageName: 'Gói 1 Ngày' },
];

type FilterType = 'all' | 'buy' | 'use';
type FilterCredit = 'all' | 'posting' | 'featured';

export default function TransactionHistoryPage() {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCredit, setFilterCredit] = useState<FilterCredit>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_TRANSACTIONS.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCredit !== 'all' && t.creditType !== filterCredit) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalBought = MOCK_TRANSACTIONS.filter((t) => t.type === 'buy').reduce((s, t) => s + t.amount, 0);
  const totalUsed = MOCK_TRANSACTIONS.filter((t) => t.type === 'use').reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-[#2D5A3D]/10 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 text-[#2D5A3D]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lịch Sử Giao Dịch</h1>
              <p className="text-gray-600 text-sm">Theo dõi tất cả giao dịch credits của bạn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tổng credits đã mua</div>
            <div className="text-2xl font-bold text-green-600 mt-1">+{totalBought}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tổng credits đã dùng</div>
            <div className="text-2xl font-bold text-orange-600 mt-1">-{totalUsed}</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Tổng giao dịch</div>
            <div className="text-2xl font-bold text-[#2D5A3D] mt-1">{MOCK_TRANSACTIONS.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mô tả..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-white"
          >
            <option value="all">Tất cả loại</option>
            <option value="buy">Mua credits</option>
            <option value="use">Sử dụng</option>
          </select>
          <select
            value={filterCredit}
            onChange={(e) => setFilterCredit(e.target.value as FilterCredit)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-white"
          >
            <option value="all">Tất cả credits</option>
            <option value="posting">Credits Đăng Tin</option>
            <option value="featured">Credits Nổi Bật</option>
          </select>
        </div>

        {/* Transaction list */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không có giao dịch nào phù hợp</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-4 px-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      transaction.type === 'buy' ? 'bg-green-50' : 'bg-orange-50'
                    }`}>
                      {transaction.type === 'buy' ? (
                        <ArrowDownCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowUpCircle className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{transaction.description}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {transaction.date} •{' '}
                        <span className={transaction.creditType === 'posting' ? 'text-blue-600' : 'text-[#C4603A]'}>
                          {transaction.creditType === 'posting' ? 'Credits Đăng Tin' : 'Credits Nổi Bật'}
                        </span>
                        {transaction.packageName && ` • ${transaction.packageName}`}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold text-sm ${
                    transaction.type === 'buy' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
