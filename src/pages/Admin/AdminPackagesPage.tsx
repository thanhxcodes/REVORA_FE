import { useEffect, useState } from 'react';
import { Sparkles, Edit2, Check, X, Plus, Trash2, Save, ArrowUp, ArrowDown } from 'lucide-react';
import AdminLayout from '../../components/common/AdminLayout';
import { authClient } from '../../providers/authProvider/authService';
import type { ApiResponse } from '../../features/auth/types';
import { updateCreditPackage } from '../../features/credits/services/creditPackageService';

interface BadgeApi {
  badgeId: number;
  name: string;
  iconUrl: string;
  description: string;
}

interface CreditPackageApi {
  paidCreditPackageId: number;
  name: string;
  creditTypeId: number;
  creditTypeName: string;
  creditAmount: number;
  durationDays: number | null;
  originalPrice: number;
  discountRate: number;
  discountedPrice: number;
  rewardBadgeId?: number | null;
  isActive: boolean;
  descriptions: string[];
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<CreditPackageApi[]>([]);
  const [badges, setBadges] = useState<BadgeApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingPackage, setEditingPackage] = useState<CreditPackageApi | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const response = await authClient.get<ApiResponse<CreditPackageApi[]>>(
        '/CreditPackages/active',
        { skipAuthRefresh: true }
      );
      setPackages(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải danh sách gói.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await authClient.get<ApiResponse<BadgeApi[]>>('/Admin/Badges');
      setBadges(response.data.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách badges', err);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchBadges();
  }, []);

  const postingPackages = packages.filter((p) => p.creditTypeName.toLowerCase() !== 'featured');
  const featuredPackages = packages.filter((p) => p.creditTypeName.toLowerCase() === 'featured');

  const handleEditClick = (pkg: CreditPackageApi) => {
    setEditingPackage({ ...pkg, descriptions: [...(pkg.descriptions || [])] });
    setFormError(null);
  };

  const handleSave = async () => {
    if (!editingPackage) return;
    
    // Validation
    if (!editingPackage.name.trim()) {
      setFormError('Tên gói không được để trống.');
      return;
    }
    if (editingPackage.originalPrice < 0) {
      setFormError('Giá gốc không hợp lệ.');
      return;
    }
    if (editingPackage.discountRate < 0 || editingPackage.discountRate > 100) {
      setFormError('Phần trăm khuyến mãi phải từ 0 đến 100.');
      return;
    }
    if (editingPackage.discountedPrice < 0 || editingPackage.discountedPrice > editingPackage.originalPrice) {
      setFormError('Giá khuyến mãi phải lớn hơn bằng 0 và không được vượt quá giá gốc.');
      return;
    }

    setFormError(null);
    setIsSaving(true);
    try {
      await updateCreditPackage(editingPackage.paidCreditPackageId, {
        name: editingPackage.name,
        originalPrice: editingPackage.originalPrice,
        discountRate: editingPackage.discountRate,
        discountedPrice: editingPackage.discountedPrice,
        isActive: editingPackage.isActive,
        rewardBadgeId: editingPackage.rewardBadgeId || null,
        descriptions: editingPackage.descriptions.filter(d => d.trim() !== ''),
      });
      setEditingPackage(null);
      fetchPackages();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu.');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto calculate discounted price when rate or original price changes
  const handleOriginalPriceChange = (val: number) => {
    if (!editingPackage) return;
    const originalPrice = isNaN(val) || val < 0 ? 0 : val;
    let discountRate = editingPackage.discountRate;
    let discountedPrice = editingPackage.discountedPrice;

    if (originalPrice === 0) {
      discountRate = 0;
      discountedPrice = 0;
    } else {
      discountedPrice = Math.round(originalPrice * (1 - discountRate / 100));
    }

    setEditingPackage({
      ...editingPackage,
      originalPrice,
      discountRate,
      discountedPrice
    });
  };

  const handleDiscountRateChange = (val: number) => {
    if (!editingPackage) return;
    const rate = isNaN(val) ? 0 : Math.max(0, Math.min(100, val));
    const discountedPrice = Math.round(editingPackage.originalPrice * (1 - rate / 100));
    setEditingPackage({
      ...editingPackage,
      discountRate: rate,
      discountedPrice
    });
  };

  const handleDiscountedPriceChange = (val: number) => {
    if (!editingPackage) return;
    const price = isNaN(val) ? 0 : Math.max(0, val);
    setEditingPackage({
      ...editingPackage,
      discountedPrice: price
    });
  };

  const handleDescChange = (index: number, val: string) => {
    if (!editingPackage) return;
    const newDescs = [...editingPackage.descriptions];
    newDescs[index] = val;
    setEditingPackage({ ...editingPackage, descriptions: newDescs });
  };

  const handleAddDesc = () => {
    if (!editingPackage) return;
    setEditingPackage({ ...editingPackage, descriptions: [...editingPackage.descriptions, ''] });
  };

  const handleRemoveDesc = (index: number) => {
    if (!editingPackage) return;
    const newDescs = [...editingPackage.descriptions];
    newDescs.splice(index, 1);
    setEditingPackage({ ...editingPackage, descriptions: newDescs });
  };

  const handleMoveDescUp = (index: number) => {
    if (!editingPackage || index === 0) return;
    const newDescs = [...editingPackage.descriptions];
    const temp = newDescs[index - 1];
    newDescs[index - 1] = newDescs[index];
    newDescs[index] = temp;
    setEditingPackage({ ...editingPackage, descriptions: newDescs });
  };

  const handleMoveDescDown = (index: number) => {
    if (!editingPackage || index === editingPackage.descriptions.length - 1) return;
    const newDescs = [...editingPackage.descriptions];
    const temp = newDescs[index + 1];
    newDescs[index + 1] = newDescs[index];
    newDescs[index] = temp;
    setEditingPackage({ ...editingPackage, descriptions: newDescs });
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#2D5A3D]" />
            Quản Lý Gói Tín Dụng
          </h1>
          <p className="text-gray-500 mt-2">Đồng bộ với giao diện hiển thị cho người dùng.</p>
        </div>

        {isLoading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-16">
            {/* GÓI ĐĂNG TIN */}
            <section>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Gói Đăng Tin</h2>
                <p className="text-gray-500">Giúp người bán tăng số lượng tin đăng tiêu chuẩn</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {postingPackages.map((pkg) => (
                  <div key={pkg.paidCreditPackageId} className="relative bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all border border-gray-100 flex flex-col">
                    <div className="absolute top-6 right-6">
                      <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold">
                        Đăng Tin
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-4xl font-black text-gray-900">
                        {pkg.discountedPrice.toLocaleString('vi-VN')}đ
                      </span>
                      {pkg.discountRate > 0 && pkg.originalPrice > 0 && (
                        <span className="text-lg text-gray-400 line-through">
                          {pkg.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>

                    <div className="bg-blue-50/50 rounded-2xl p-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                          <span className="font-bold text-blue-600">+{pkg.creditAmount}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Credits Đăng Tin</p>
                          <p className="text-sm text-gray-500">HSD: Vĩnh viễn</p>
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                      {pkg.descriptions.map((desc, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="text-gray-600 leading-relaxed">{desc}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleEditClick(pkg)}
                      className="w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mt-auto"
                    >
                      <Edit2 className="w-5 h-5" />
                      <span>Chỉnh Sửa Gói</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* GÓI NỔI BẬT */}
            <section>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Gói Nổi Bật</h2>
                <p className="text-gray-500">Tiếp cận hàng ngàn khách hàng tiềm năng</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {featuredPackages.map((pkg) => (
                  <div key={pkg.paidCreditPackageId} className="relative bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all border border-gray-100 flex flex-col">
                    <div className="absolute top-6 right-6">
                      <span className="bg-orange-100 text-[#C4603A] px-4 py-1.5 rounded-full text-xs font-bold">
                        Nổi Bật
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-4xl font-black text-gray-900">
                        {pkg.discountedPrice.toLocaleString('vi-VN')}đ
                      </span>
                      {pkg.discountRate > 0 && pkg.originalPrice > 0 && (
                        <span className="text-lg text-gray-400 line-through">
                          {pkg.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>

                    <div className="bg-orange-50/50 rounded-2xl p-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                          <span className="font-bold text-[#C4603A]">+{pkg.creditAmount}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Credits Nổi Bật</p>
                          <p className="text-sm text-gray-500">HSD: Vĩnh viễn</p>
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                      {pkg.descriptions.map((desc, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="text-gray-600 leading-relaxed">{desc}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleEditClick(pkg)}
                      className="w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mt-auto"
                    >
                      <Edit2 className="w-5 h-5" />
                      <span>Chỉnh Sửa Gói</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa: {editingPackage.name}</h2>
              <button onClick={() => setEditingPackage(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              {formError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên gói</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D] focus:border-[#2D5A3D] transition-all outline-none"
                    value={editingPackage.name}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái (IsActive)</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D] focus:border-[#2D5A3D] transition-all outline-none"
                    value={editingPackage.isActive ? 'true' : 'false'}
                    onChange={(e) => setEditingPackage({ ...editingPackage, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">Hiển thị (Active)</option>
                    <option value="false">Ẩn (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Giá gốc (VNĐ)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D] focus:border-[#2D5A3D] transition-all outline-none"
                    value={editingPackage.originalPrice}
                    onChange={(e) => handleOriginalPriceChange(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Khuyến mãi (%)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D] focus:border-[#2D5A3D] transition-all outline-none disabled:bg-gray-100 disabled:text-gray-400"
                    value={editingPackage.discountRate}
                    onChange={(e) => handleDiscountRateChange(Number(e.target.value))}
                    min="0"
                    max="100"
                    disabled={editingPackage.originalPrice === 0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Giá sau KM (VNĐ)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D] focus:border-[#2D5A3D] transition-all outline-none disabled:bg-gray-100 disabled:text-gray-400"
                    value={editingPackage.discountedPrice}
                    onChange={(e) => handleDiscountedPriceChange(Number(e.target.value))}
                    min="0"
                    disabled={editingPackage.originalPrice === 0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reward Badge (Tuỳ chọn)</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D] focus:border-[#2D5A3D] transition-all outline-none"
                  value={editingPackage.rewardBadgeId || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, rewardBadgeId: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">-- Không có Badge --</option>
                  {badges.map(b => (
                    <option key={b.badgeId} value={b.badgeId}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Danh sách quyền lợi (Descriptions)</label>
                <div className="space-y-3">
                  {editingPackage.descriptions.map((desc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button 
                        onClick={() => handleMoveDescUp(i)} 
                        disabled={i === 0}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowUp className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleMoveDescDown(i)} 
                        disabled={i === editingPackage.descriptions.length - 1}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowDown className="w-5 h-5" />
                      </button>
                      <input
                        type="text"
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D] focus:border-[#2D5A3D] outline-none"
                        value={desc}
                        onChange={(e) => handleDescChange(i, e.target.value)}
                      />
                      <button onClick={() => handleRemoveDesc(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={handleAddDesc} className="flex items-center gap-2 text-[#2D5A3D] font-medium hover:underline p-2">
                    <Plus className="w-4 h-4" /> Thêm quyền lợi
                  </button>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button onClick={() => setEditingPackage(null)} className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
                Hủy
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#2D5A3D] hover:bg-[#1f422b] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? 'Đang lưu...' : <><Save className="w-5 h-5" /> Lưu Thay Đổi</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
