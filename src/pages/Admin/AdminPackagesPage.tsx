import { useState } from 'react';
import { Save, Edit2, Check, X, Plus, Trash2, Tag } from 'lucide-react';
import AdminLayout from '../../components/common/AdminLayout';

interface PackageConfig {
  id: string;
  name: string;
  type: 'posting' | 'featured';
  originalPrice: number;
  discountPercent: number;
  credits: number;
  duration: number;
  description: string;
  perks: string[];
  isPopular?: boolean;
}

function calcFinalPrice(originalPrice: number, discountPercent: number): number {
  return Math.round(originalPrice * (1 - discountPercent / 100));
}

const defaultPerksPosting = ['Đăng sản phẩm lên marketplace', 'Hiển thị trong kết quả tìm kiếm', 'Nhận liên hệ từ người mua', 'Quản lý tin đăng dễ dàng'];
const defaultPerksFeatured = ['Hiển thị nổi bật trên trang chủ', 'Ưu tiên trong tìm kiếm', 'Badge "Nổi Bật" trên sản phẩm', 'Tăng lượt xem gấp 5 lần'];

const initialPackages: PackageConfig[] = [
  { id: 'posting-day', name: 'Posting Day', type: 'posting', originalPrice: 25000, discountPercent: 24, credits: 5, duration: 1, description: 'Gói ngắn hạn, phù hợp thử nghiệm', perks: [...defaultPerksPosting] },
  { id: 'posting-week', name: 'Posting Week', type: 'posting', originalPrice: 100000, discountPercent: 21, credits: 30, duration: 7, description: 'Gói tuần, tiết kiệm hơn gói ngày', perks: [...defaultPerksPosting, 'Hỗ trợ ưu tiên'], isPopular: false },
  { id: 'posting-month', name: 'Posting Month', type: 'posting', originalPrice: 280000, discountPercent: 29, credits: 120, duration: 30, description: 'Gói tháng, giá trị nhất cho người bán thường xuyên', perks: [...defaultPerksPosting, 'Hỗ trợ ưu tiên', 'Báo cáo hiệu suất'], isPopular: true },
  { id: 'featured-day', name: 'Featured Day', type: 'featured', originalPrice: 70000, discountPercent: 30, credits: 3, duration: 1, description: 'Tăng độ hiển thị nhanh chóng trong 1 ngày', perks: [...defaultPerksFeatured] },
  { id: 'featured-week', name: 'Featured Week', type: 'featured', originalPrice: 200000, discountPercent: 25, credits: 15, duration: 7, description: 'Nổi bật liên tục trong suốt 1 tuần', perks: [...defaultPerksFeatured, 'Hiển thị trong email newsletter'], isPopular: true },
  { id: 'featured-month', name: 'Featured Month', type: 'featured', originalPrice: 499000, discountPercent: 30, credits: 50, duration: 30, description: 'Tối đa hoá doanh số với gói nổi bật cả tháng', perks: [...defaultPerksFeatured, 'Hiển thị trong email newsletter', 'Phân tích chuyên sâu', 'Hỗ trợ VIP'] },
];

function PackageEditor({
  pkg,
  onSave,
  onCancel,
  colorScheme,
}: {
  pkg: PackageConfig;
  onSave: (updated: PackageConfig) => void;
  onCancel: () => void;
  colorScheme: 'blue' | 'orange';
}) {
  const [form, setForm] = useState<PackageConfig>({ ...pkg });
  const [newPerk, setNewPerk] = useState('');

  const accent = colorScheme === 'blue' ? 'focus:ring-blue-500 border-blue-300' : 'focus:ring-[#C4603A] border-orange-300';
  const finalPrice = calcFinalPrice(form.originalPrice, form.discountPercent);

  const addPerk = () => {
    if (newPerk.trim()) {
      setForm({ ...form, perks: [...form.perks, newPerk.trim()] });
      setNewPerk('');
    }
  };

  const removePerk = (i: number) => {
    setForm({ ...form, perks: form.perks.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Tên gói</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm ${accent}`}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Mô tả ngắn</label>
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm ${accent}`}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Giá gốc (đ)</label>
          <input
            type="number"
            value={form.originalPrice}
            onChange={(e) => setForm({ ...form, originalPrice: parseInt(e.target.value) || 0 })}
            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm ${accent}`}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">% Giảm giá</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="99"
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: Math.min(99, parseInt(e.target.value) || 0) })}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm pr-7 ${accent}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>
        </div>
      </div>

      {/* Auto-calculated final price */}
      <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center justify-between">
        <span className="text-xs text-gray-500 flex items-center space-x-1">
          <Tag className="w-3.5 h-3.5" />
          <span>Giá chính thức (tự tính):</span>
        </span>
        <span className={`font-bold text-sm ${colorScheme === 'blue' ? 'text-blue-600' : 'text-[#C4603A]'}`}>
          {finalPrice.toLocaleString('vi-VN')}đ
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Số Credits</label>
          <input
            type="number"
            value={form.credits}
            onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) || 0 })}
            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm ${accent}`}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Thời hạn (ngày)</label>
          <input
            type="number"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })}
            className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-sm ${accent}`}
          />
        </div>
      </div>

      {/* Perks */}
      <div>
        <label className="block text-xs text-gray-500 mb-2">Đặc quyền gói</label>
        <div className="space-y-1.5 mb-2">
          {form.perks.map((perk, i) => (
            <div key={i} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-1.5">
              <span className="text-xs text-gray-700 flex-1">{perk}</span>
              <button onClick={() => removePerk(i)} className="text-red-400 hover:text-red-600 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            value={newPerk}
            onChange={(e) => setNewPerk(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPerk()}
            placeholder="Thêm đặc quyền mới..."
            className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 text-xs ${accent}`}
          />
          <button onClick={addPerk} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex space-x-2 pt-2">
        <button
          onClick={() => onSave(form)}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-white text-sm font-medium transition-colors ${colorScheme === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#C4603A] hover:bg-[#b35534]'}`}
        >
          <Check className="w-4 h-4" />
          <span>Lưu thay đổi</span>
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PackageCard({ pkg, colorScheme, onEdit }: { pkg: PackageConfig; colorScheme: 'blue' | 'orange'; onEdit: () => void }) {
  const finalPrice = calcFinalPrice(pkg.originalPrice, pkg.discountPercent);
  const borderColor = colorScheme === 'blue' ? 'border-blue-200' : 'border-[#C4603A]/30';
  const accentColor = colorScheme === 'blue' ? 'text-blue-600' : 'text-[#C4603A]';
  const bgColor = colorScheme === 'blue' ? 'bg-blue-50' : 'bg-orange-50';
  const badgeBg = colorScheme === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700';

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 ${borderColor} p-6 relative flex flex-col`}>
      {pkg.isPopular && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full font-semibold ${badgeBg}`}>
          Phổ biến nhất
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold text-gray-900">{pkg.name}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{pkg.description}</p>
        </div>
        <button
          onClick={onEdit}
          className={`p-2 rounded-xl transition-colors ${colorScheme === 'blue' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-orange-50 text-[#C4603A] hover:bg-orange-100'}`}
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Pricing */}
      <div className={`${bgColor} rounded-xl p-4 mb-4`}>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-bold ${accentColor}`}>{finalPrice.toLocaleString('vi-VN')}đ</span>
          {pkg.discountPercent > 0 && (
            <span className="text-sm text-gray-400 line-through">{pkg.originalPrice.toLocaleString('vi-VN')}đ</span>
          )}
        </div>
        {pkg.discountPercent > 0 && (
          <div className={`text-xs font-medium mt-1 ${accentColor}`}>Giảm {pkg.discountPercent}%</div>
        )}
        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-600">
          <span className="font-semibold">{pkg.credits} credits</span>
          <span>·</span>
          <span>{pkg.duration} ngày</span>
          <span>·</span>
          <span>{Math.round(finalPrice / pkg.credits).toLocaleString('vi-VN')}đ/credit</span>
        </div>
      </div>

      {/* Perks */}
      <div className="space-y-1.5 flex-1">
        {pkg.perks.map((perk, i) => (
          <div key={i} className="flex items-start space-x-2 text-xs text-gray-600">
            <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${colorScheme === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-[#C4603A]'}`}>
              <Check className="w-2.5 h-2.5" />
            </span>
            <span>{perk}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageConfig[]>(initialPackages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = (updated: PackageConfig) => {
    setPackages(packages.map((p) => (p.id === updated.id ? updated : p)));
    setEditingId(null);
  };

  const handleSaveAll = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl text-gray-900 mb-2">Quản Lý Gói Credits</h2>
        <p className="text-gray-600">Cấu hình giá, credits và đặc quyền cho từng gói — đồng bộ với trang nạp credit của người dùng</p>
      </div>

      {/* Posting Packages */}
      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
            <Tag className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Gói Credit Đăng Tin</h3>
            <p className="text-xs text-gray-500">Dùng để đăng sản phẩm lên marketplace</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {packages.filter((p) => p.type === 'posting').map((pkg) => (
            <div key={pkg.id}>
              {editingId === pkg.id ? (
                <div className="bg-white rounded-2xl shadow-sm border-2 border-blue-300 p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Chỉnh sửa: {pkg.name}</h4>
                  <PackageEditor
                    pkg={pkg}
                    colorScheme="blue"
                    onSave={handleSave}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <PackageCard pkg={pkg} colorScheme="blue" onEdit={() => setEditingId(pkg.id)} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Featured Packages */}
      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
            <Tag className="w-4 h-4 text-[#C4603A]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Gói Credit Nổi Bật</h3>
            <p className="text-xs text-gray-500">Dùng để nâng cao hiển thị sản phẩm</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {packages.filter((p) => p.type === 'featured').map((pkg) => (
            <div key={pkg.id}>
              {editingId === pkg.id ? (
                <div className="bg-white rounded-2xl shadow-sm border-2 border-[#C4603A]/40 p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Chỉnh sửa: {pkg.name}</h4>
                  <PackageEditor
                    pkg={pkg}
                    colorScheme="orange"
                    onSave={handleSave}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <PackageCard pkg={pkg} colorScheme="orange" onEdit={() => setEditingId(pkg.id)} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save All */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveAll}
          className={`flex items-center space-x-2 px-8 py-4 rounded-full transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white hover:shadow-lg hover:scale-105'
          }`}
        >
          {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          <span>{saved ? 'Đã lưu thành công!' : 'Lưu Tất Cả Cấu Hình'}</span>
        </button>
      </div>
    </AdminLayout>
  );
}
