import React, { useState, useEffect, useCallback } from 'react';
import { Megaphone, Plus, Search, Edit2, Trash2, Check, X, RefreshCw, Eye, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../../components/common/AdminLayout';
import { authClient } from '../../providers/authProvider/authService';
import { uploadProductImagesAPI } from '../../features/products/services/productApi';
import toast from 'react-hot-toast';

interface AnnouncementDto {
  announcementId: number;
  title: string;
  description: string;
  imageUrl: string;
  redirectUrl: string;
  buttonText: string;
  badgeText?: string;
  priority: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  createdAt: string;
}

const REDIRECT_OPTIONS = [
  { label: 'Trang Chủ', value: '/' },
  { label: 'Match', value: '/match' },
  { label: 'Đăng Tin', value: '/sell' },
  { label: 'Bảng Xếp Hạng', value: '/ranking' },
  { label: 'Short Video', value: '/shorts' },
  { label: 'Gói Credit', value: '/plans' },
  { label: 'Hồ Sơ', value: '/profile' },
  { label: 'Nhắn Tin', value: '/messages' }
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementDto | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    redirectUrl: '/',
    buttonText: 'Khám phá ngay',
    badgeText: '',
    priority: 0,
    startAt: '',
    endAt: '',
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await authClient.get('/announcement');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (e) {
      console.error(e);
      toast.error('Không thể tải danh sách thông báo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 30);

    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      redirectUrl: '/',
      buttonText: 'Khám phá ngay',
      badgeText: '',
      priority: 0,
      startAt: new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      endAt: new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      isActive: true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: AnnouncementDto) => {
    setEditingAnnouncement(a);
    const start = new Date(a.startAt + 'Z');
    const end = new Date(a.endAt + 'Z');
    setFormData({
      title: a.title,
      description: a.description,
      imageUrl: a.imageUrl,
      redirectUrl: a.redirectUrl,
      buttonText: a.buttonText,
      badgeText: a.badgeText || '',
      priority: a.priority,
      startAt: new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      endAt: new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      isActive: a.isActive,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
    try {
      const res = await authClient.delete('/announcement/' + id);
      if (res.data.success) {
        toast.success('Xóa thành công!');
        fetchAnnouncements();
      }
    } catch (e) {
      console.error(e);
      toast.error('Có lỗi xảy ra khi xóa.');
    }
  };

  const handleToggleActive = async (a: AnnouncementDto) => {
    try {
      const updatedData = {
        title: a.title,
        description: a.description,
        imageUrl: a.imageUrl,
        redirectUrl: a.redirectUrl,
        buttonText: a.buttonText,
        badgeText: a.badgeText,
        priority: a.priority,
        startAt: a.startAt,
        endAt: a.endAt,
        isActive: !a.isActive,
      };
      const res = await authClient.put('/announcement/' + a.announcementId, updatedData);
      if (res.data.success) {
        toast.success('Đã ' + (!a.isActive ? 'bật' : 'tắt') + ' thông báo.');
        fetchAnnouncements();
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi khi cập nhật trạng thái.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh không được vượt quá 5MB.');
      e.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ định dạng JPG, PNG, WEBP.');
      e.target.value = '';
      return;
    }

    try {
      setIsUploadingImage(true);
      const toastId = toast.loading('Đang tải ảnh lên máy chủ...');

      const result = await uploadProductImagesAPI([file]);

      if (result.success && result.urls && result.urls.length > 0) {
        setFormData(prev => ({ ...prev, imageUrl: result.urls[0] }));
        toast.success('Upload thành công', { id: toastId });
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Upload thất bại');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Bắt buộc nhập tiêu đề.';
    else if (formData.title.length > 200) errors.title = 'Tiêu đề không được vượt quá 200 ký tự.';

    if (!formData.description.trim()) errors.description = 'Bắt buộc nhập mô tả.';
    else if (formData.description.length > 1000) errors.description = 'Mô tả không được vượt quá 1000 ký tự.';

    if (!formData.imageUrl) errors.imageUrl = 'Bắt buộc tải lên ảnh.';

    if (!formData.buttonText.trim()) errors.buttonText = 'Bắt buộc nhập text nút bấm.';
    else if (formData.buttonText.length > 100) errors.buttonText = 'Text nút bấm không được vượt quá 100 ký tự.';

    if (formData.priority < 0 || formData.priority > 999) errors.priority = 'Priority phải nằm trong khoảng 0 đến 999.';

    const start = new Date(formData.startAt).getTime();
    const end = new Date(formData.endAt).getTime();
    if (isNaN(start)) errors.startAt = 'Ngày bắt đầu không hợp lệ.';
    if (isNaN(end)) errors.endAt = 'Ngày kết thúc không hợp lệ.';
    if (!isNaN(start) && !isNaN(end) && start >= end) {
      errors.startAt = 'Ngày bắt đầu không được lớn hơn hoặc bằng ngày kết thúc.';
      errors.endAt = 'Ngày kết thúc phải lớn hơn ngày bắt đầu.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (editingAnnouncement) {
        const res = await authClient.put('/announcement/' + editingAnnouncement.announcementId, {
          ...formData,
          startAt: new Date(formData.startAt).toISOString(),
          endAt: new Date(formData.endAt).toISOString(),
        });
        if (res.data.success) {
          toast.success('Cập nhật thành công!');
          setIsModalOpen(false);
          fetchAnnouncements();
        }
      } else {
        const res = await authClient.post('/announcement', {
          ...formData,
          startAt: new Date(formData.startAt).toISOString(),
          endAt: new Date(formData.endAt).toISOString(),
        });
        if (res.data.success) {
          toast.success('Tạo mới thành công!');
          setIsModalOpen(false);
          fetchAnnouncements();
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h2 className="text-3xl text-gray-900 mb-2 font-bold tracking-tight">Quản Lý Sự Kiện</h2>
          <p className="text-gray-600">Thêm, sửa, xóa các thông báo sự kiện hiển thị trên trang chủ</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleOpenCreate}
            className="bg-[#2D5A3D] text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 font-semibold hover:bg-[#1a3825] transition-colors shadow-md shadow-[#2D5A3D]/20"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm Mới</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#2D5A3D] transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] transition-all bg-gray-50 hover:bg-white font-medium text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-5 px-6">Thông Báo</th>
                <th className="py-5 px-6">Ưu Tiên</th>
                <th className="py-5 px-6">Thời Gian</th>
                <th className="py-5 px-6">Trạng Thái</th>
                <th className="py-5 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-500 font-medium">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredAnnouncements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-500">
                    Không có thông báo nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredAnnouncements.map((a) => (
                  <tr key={a.announcementId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <img src={a.imageUrl || ''} alt="banner" className="w-16 h-16 object-cover rounded-xl shadow-sm" />
                        <div>
                          <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            {a.title}
                            {a.badgeText && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">{a.badgeText}</span>}
                          </div>
                          <div className="text-xs text-gray-500 max-w-xs truncate mt-0.5">{a.description}</div>
                          <div className="text-xs text-blue-500 mt-1 inline-block">
                            {a.redirectUrl}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                        {a.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs text-gray-500 flex flex-col gap-1">
                        <div><span className="font-semibold text-gray-700">Từ:</span> {new Date(a.startAt + 'Z').toLocaleString('vi-VN')}</div>
                        <div><span className="font-semibold text-gray-700">Đến:</span> {new Date(a.endAt + 'Z').toLocaleString('vi-VN')}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleActive(a)}
                        className={"text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1.5 w-fit font-bold shadow-sm transition-colors " + (
                          a.isActive
                            ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                            : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200'
                        )}>
                        {a.isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        <span>{a.isActive ? 'Đang bật' : 'Đang tắt'}</span>
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(a)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.announcementId)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingAnnouncement ? 'Chỉnh Sửa Thông Báo' : 'Thêm Thông Báo Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col md:flex-row bg-gray-50/50">
              {/* CỘT TRÁI: FORM */}
              <div className="w-full md:w-1/2 p-6 border-r border-gray-100 bg-white">
                <form id="announcement-form" onSubmit={handleSubmit} className="space-y-5">

                  {/* Upload Ảnh */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hình Ảnh *</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center relative hover:border-[#2D5A3D] transition-colors bg-gray-50/50">
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      {isUploadingImage ? (
                        <div className="text-[#2D5A3D] font-medium flex flex-col items-center gap-3">
                          <div className="w-6 h-6 border-4 border-[#2D5A3D] border-t-transparent rounded-full animate-spin"></div>
                          Đang tải ảnh...
                        </div>
                      ) : formData.imageUrl ? (
                        <div className="flex items-center gap-4">
                          <img src={formData.imageUrl} alt="preview" className="w-16 h-16 object-cover rounded-xl shadow-sm border border-gray-100" />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-[#2D5A3D] flex items-center gap-1.5"><Check className="w-4 h-4" /> Upload thành công</p>
                            <p className="text-xs text-gray-500 mt-0.5">Nhấp để chọn ảnh khác</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-700 font-medium text-sm">Nhấp để chọn ảnh (JPG, PNG, WEBP)</p>
                          <p className="text-xs text-gray-500 mt-1">Tối đa 5MB</p>
                        </>
                      )}
                    </div>
                    {formErrors.imageUrl && <p className="text-red-500 text-xs mt-1.5">{formErrors.imageUrl}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề *</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] bg-gray-50 focus:bg-white text-sm" placeholder="VD: 🔥 REVORA MATCH" />
                    {formErrors.title && <p className="text-red-500 text-xs mt-1.5">{formErrors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả chi tiết *</label>
                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] bg-gray-50 focus:bg-white text-sm resize-none h-24" placeholder="VD: Trao đổi quần áo..." />
                    {formErrors.description && <p className="text-red-500 text-xs mt-1.5">{formErrors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Link Đích (Redirect) *</label>
                      <input
                        list="redirect-options"
                        value={formData.redirectUrl}
                        onChange={e => setFormData({ ...formData, redirectUrl: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] bg-gray-50 focus:bg-white text-sm"
                        placeholder="VD: /match hoặc https://..."
                      />
                      <datalist id="redirect-options">
                        {REDIRECT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Text Nút Bấm *</label>
                      <input type="text" value={formData.buttonText} onChange={e => setFormData({ ...formData, buttonText: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] bg-gray-50 focus:bg-white text-sm" placeholder="Khám phá ngay" />
                      {formErrors.buttonText && <p className="text-red-500 text-xs mt-1.5">{formErrors.buttonText}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Badge Text</label>
                      <input type="text" value={formData.badgeText} onChange={e => setFormData({ ...formData, badgeText: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] bg-gray-50 focus:bg-white text-sm" placeholder="HOT, MỚI..." maxLength={50} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Độ Ưu Tiên (0-999)</label>
                      <input type="number" value={formData.priority} onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] bg-gray-50 focus:bg-white text-sm" />
                      {formErrors.priority && <p className="text-red-500 text-xs mt-1.5">{formErrors.priority}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày Bắt Đầu *</label>
                      <input type="datetime-local" value={formData.startAt} onChange={e => setFormData({ ...formData, startAt: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] bg-gray-50 focus:bg-white text-sm" />
                      {formErrors.startAt && <p className="text-red-500 text-xs mt-1.5">{formErrors.startAt}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày Kết Thúc *</label>
                      <input type="datetime-local" value={formData.endAt} onChange={e => setFormData({ ...formData, endAt: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A3D]/20 focus:border-[#2D5A3D] bg-gray-50 focus:bg-white text-sm" />
                      {formErrors.endAt && <p className="text-red-500 text-xs mt-1.5">{formErrors.endAt}</p>}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-[#2D5A3D] bg-gray-100 border-gray-300 rounded focus:ring-[#2D5A3D] cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Kích hoạt hiển thị (Is Active)
                    </label>
                  </div>

                </form>
              </div>

              {/* CỘT PHẢI: PREVIEW */}
              <div className="w-full md:w-1/2 p-6 flex flex-col bg-neutral-950/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Xem trước Popup
                  </h4>
                  <button 
                    type="button"
                    onClick={() => setIsPreviewExpanded(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2D5A3D]/10 text-[#2D5A3D] hover:bg-[#2D5A3D]/20 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Xem Toàn Màn Hình
                  </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
                  {/* Container mô phỏng Popup (Desktop Size thu nhỏ) */}
                  <div className="w-[800px] h-[480px] shrink-0 scale-[0.45] sm:scale-[0.5] lg:scale-[0.55] xl:scale-[0.6] origin-center flex flex-row bg-neutral-900 border border-neutral-800 text-white rounded-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] overflow-hidden relative pointer-events-none">
                    
                    {/* CỘT TRÁI: Hình ảnh */}
                    <div className="w-1/2 h-full relative bg-neutral-950 shrink-0 overflow-hidden group">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600">
                          <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                          <span className="text-sm uppercase tracking-widest font-semibold">Chưa có ảnh</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-neutral-900/90" />
                    </div>

                    {/* CỘT PHẢI: Nội dung */}
                    <div className="w-1/2 h-full flex flex-col p-10 relative bg-neutral-900 justify-between">
                      {/* Nút Đóng giả */}
                      <div className="absolute top-6 right-6 p-2 bg-neutral-800 text-neutral-400 rounded-full border border-neutral-700/50">
                        <X className="w-4 h-4" />
                      </div>

                      {/* Badge HOT */}
                      {formData.badgeText && (
                        <div className="absolute top-8 left-10 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-md z-10">
                          <Sparkles className="w-3 h-3 animate-spin duration-1000" />
                          <span>{formData.badgeText}</span>
                        </div>
                      )}

                      {/* Khu vực text chính */}
                      <div className="flex-1 flex flex-col justify-center pt-8 overflow-y-auto scrollbar-none">
                        <span className="text-[11px] font-bold tracking-[0.1em] text-neutral-400 mb-2 block antialiased uppercase">
                          BẢN TIN ĐẶC BIỆT
                        </span>
                        <h2 className="text-[28px] font-bold text-neutral-100 mb-4 leading-snug tracking-wide font-sans antialiased">
                          {formData.title || 'Tiêu đề thông báo'}
                        </h2>
                        <p className="text-neutral-400 text-base leading-relaxed font-light max-w-[95%] antialiased line-clamp-4">
                          {formData.description || 'Mô tả chi tiết sự kiện sẽ hiển thị ở đây...'}
                        </p>
                      </div>

                      {/* Hệ thống nút bấm */}
                      <div className="mt-6 space-y-4">
                        <div className="flex gap-3">
                          <div className="flex-1 py-3.5 px-6 bg-neutral-100 text-neutral-950 rounded-xl font-medium text-base shadow-lg flex items-center justify-center tracking-wide">
                            {formData.buttonText || 'Khám phá ngay'}
                          </div>
                          <div className="flex-1 py-3.5 text-neutral-400 font-medium rounded-xl border border-neutral-800 text-base flex items-center justify-center">
                            Để xem sau
                          </div>
                        </div>

                        <div className="h-px bg-neutral-800 w-full my-2" />

                        {/* Custom Toggle Switch */}
                        <div className="flex items-center justify-between py-1">
                          <span className="text-neutral-500 text-sm font-light tracking-wide">
                            Không nhắc lại sự kiện này trong hôm nay
                          </span>
                          <div className="w-10 h-[22px] bg-neutral-800 rounded-full relative">
                            <div className="absolute top-[2px] left-[2px] bg-neutral-400 border border-neutral-300 rounded-full h-[18px] w-[18px]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white flex justify-end space-x-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold">
                Hủy
              </button>
              <button type="submit" form="announcement-form" disabled={isSaving || isUploadingImage} className="px-5 py-2.5 bg-[#2D5A3D] hover:bg-[#1a3825] text-white rounded-xl flex items-center space-x-2 font-semibold transition-colors disabled:opacity-50">
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isSaving ? 'Đang lưu...' : 'Lưu Thông Báo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN PREVIEW OVERLAY */}
      {isPreviewExpanded && (
        <div 
          onClick={() => setIsPreviewExpanded(false)}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] w-[95vw] md:w-[85vw] max-w-[1100px] h-[85vh] md:h-[580px] overflow-hidden relative flex flex-col md:flex-row animate-in zoom-in-95 duration-300 cursor-default"
          >
            {/* Nút Đóng */}
            <button 
              onClick={() => setIsPreviewExpanded(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 bg-black/40 hover:bg-black/80 backdrop-blur-md text-neutral-400 hover:text-white rounded-full transition-all duration-200 z-30 border border-neutral-700/50"
            >
              <X className="w-4 h-4 md:w-5 h-5" />
            </button>

            {/* CỘT TRÁI: Hình ảnh */}
            <div className="w-full md:w-1/2 h-[35%] md:h-full relative bg-neutral-950 shrink-0 overflow-hidden group">
              {formData.imageUrl ? (
                <div className="w-full h-full animate-in fade-in zoom-in-105 duration-700 fill-mode-both">
                  <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 bg-neutral-900">
                  <ImageIcon className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-50" />
                  <span className="text-xs md:text-sm uppercase tracking-widest font-semibold">Chưa có ảnh</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/20 md:bg-gradient-to-r md:from-transparent md:to-neutral-900/90" />
            </div>

            {/* CỘT PHẢI: Nội dung */}
            <div className="w-full md:w-1/2 h-[65%] md:h-full flex flex-col p-6 md:p-12 relative bg-neutral-900 justify-between">
              
              {/* Badge HOT */}
              {formData.badgeText && (
                <div className="absolute top-6 left-6 md:top-8 md:left-12 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] md:text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-md z-10 pointer-events-none">
                  <Sparkles className="w-3 h-3 animate-spin duration-1000" />
                  <span>{formData.badgeText}</span>
                </div>
              )}

              {/* Khu vực text chính */}
              <div className="flex-1 flex flex-col justify-center pt-4 md:pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto scrollbar-none">
                <span className="text-[11px] font-bold tracking-[0.1em] text-neutral-400 mb-2 block antialiased uppercase">
                  BẢN TIN ĐẶC BIỆT
                </span>
                <h2 className="text-2xl md:text-[32px] font-bold text-neutral-100 mb-4 leading-snug tracking-wide font-sans antialiased">
                  {formData.title || 'Tiêu đề thông báo'}
                </h2>
                <p className="text-neutral-400 text-sm md:text-base leading-relaxed font-light max-w-[95%] antialiased whitespace-pre-wrap">
                  {formData.description || 'Mô tả chi tiết sự kiện sẽ hiển thị ở đây...'}
                </p>
              </div>

              {/* Hệ thống nút bấm */}
              <div className="mt-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 order-1 sm:order-2 py-3.5 px-6 bg-neutral-100 hover:bg-white text-neutral-950 rounded-xl font-medium text-sm md:text-base transition-all duration-300 shadow-lg flex items-center justify-center tracking-wide">
                    {formData.buttonText || 'Khám phá ngay'}
                  </div>
                  <div className="flex-1 order-2 sm:order-1 py-3.5 text-neutral-400 font-medium rounded-xl border border-neutral-800 text-sm flex items-center justify-center">
                    Để xem sau
                  </div>
                </div>

                <div className="h-px bg-neutral-800 w-full my-1" />

                {/* Custom Toggle Switch */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-neutral-500 text-xs font-light tracking-wide">
                    Không nhắc lại sự kiện này trong hôm nay
                  </span>
                  <div className="w-9 h-5 bg-neutral-800 rounded-full relative">
                    <div className="absolute top-[2px] left-[2px] bg-neutral-400 border border-neutral-300 rounded-full h-4 w-4"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
