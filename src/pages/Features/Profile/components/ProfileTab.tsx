import React from 'react';
import { User, Mail, Phone, MessageSquare, Calendar, MapPin, AlertCircle, Lock } from 'lucide-react';

export interface ProfileData {
  name: string;
  username: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
  address: string;
  city: string;
  bio: string;
  avatarColor: string;
}

interface ProfileTabProps {
  profile: ProfileData;
  draft: ProfileData;
  isEditing: boolean;
  setDraft: React.Dispatch<React.SetStateAction<ProfileData>>;
  publicViewMode: boolean;
  errors?: {
    name?: string;
    phone?: string;
    birthday?: string;
  };
  clearError?: (field: 'name' | 'phone' | 'birthday') => void;
}

const VIETNAM_CITIES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Nghệ An', 'Quảng Ninh', 'Bình Dương', 'Đồng Nai', 'Huế', 'Nha Trang', 'Đà Lạt',
];

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  draft,
  isEditing,
  setDraft,
  publicViewMode,
  errors,
  clearError,
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-7">Thông Tin Cá Nhân</h2>

      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và Tên</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => {
                setDraft((p) => ({ ...p, name: e.target.value }));
                if (clearError) clearError('name');
              }}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-colors text-gray-900 ${
                errors?.name
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50/10'
                  : 'border-gray-200 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white'
              }`}
            />
            {errors?.name && (
              <span className="text-xs text-red-500 mt-1.5 block font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
              </span>
            )}
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiểu Sử</label>
            <textarea
              value={draft.bio}
              onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white transition-colors resize-none text-gray-900"
            />
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày Sinh</label>
            <input
              type="date"
              value={draft.birthday}
              onChange={(e) => {
                setDraft((p) => ({ ...p, birthday: e.target.value }));
                if (clearError) clearError('birthday');
              }}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-colors text-gray-900 ${
                errors?.birthday
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50/10'
                  : 'border-gray-200 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white'
              }`}
            />
            {errors?.birthday && (
              <span className="text-xs text-red-500 mt-1.5 block font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.birthday}
              </span>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới Tính</label>
            <select
              value={draft.gender}
              onChange={(e) => setDraft((p) => ({ ...p, gender: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white transition-colors text-gray-900"
            >
              {draft.gender === '' && <option value="" disabled>Chọn giới tính</option>}
              <option value="female">Nữ</option>
              <option value="male">Nam</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số Điện Thoại</label>
            <input
              type="tel"
              value={draft.phone}
              onChange={(e) => {
                setDraft((p) => ({ ...p, phone: e.target.value }));
                if (clearError) clearError('phone');
              }}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-colors text-gray-900 ${
                errors?.phone
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50/10'
                  : 'border-gray-200 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white'
              }`}
            />
            {errors?.phone && (
              <span className="text-xs text-red-500 mt-1.5 block font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={draft.email}
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed transition-colors select-none focus:outline-none"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh / Thành Phố</label>
            <select
              value={draft.city}
              onChange={(e) => setDraft((p) => ({ ...p, city: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white transition-colors text-gray-900"
            >
              {VIETNAM_CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa Chỉ</label>
            <input
              type="text"
              value={draft.address}
              onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))}
              placeholder="Số nhà, đường, phường/xã..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white transition-colors text-gray-900"
            />
          </div>
        </div>
      ) : (
        /* View mode */
        <div className="divide-y divide-gray-50">
          {[
            { label: 'Họ và Tên', value: profile.name, icon: <User className="w-4 h-4" />, public: true },
            { label: 'Email', value: profile.email, icon: <Mail className="w-4 h-4" />, public: false },
            { label: 'Số Điện Thoại', value: profile.phone, icon: <Phone className="w-4 h-4" />, public: false },
            {
              label: 'Ngày Sinh',
              value: (() => {
                if (!profile.birthday) return '';
                try {
                  const d = new Date(profile.birthday);
                  if (isNaN(d.getTime())) return '';
                  return d.toLocaleDateString('vi-VN');
                } catch {
                  return '';
                }
              })(),
              icon: <Calendar className="w-4 h-4" />,
              public: true,
            },
            {
              label: 'Giới Tính',
              value: profile.gender === 'female' ? 'Nữ' : profile.gender === 'male' ? 'Nam' : profile.gender === 'other' ? 'Khác' : '',
              icon: <User className="w-4 h-4" />,
              public: true,
            },
            { label: 'Thành Phố', value: profile.city, icon: <MapPin className="w-4 h-4" />, public: true },
            { label: 'Địa Chỉ', value: profile.address, icon: <MapPin className="w-4 h-4" />, public: false },
          ]
            .filter(field => !publicViewMode || field.public)
            .map((field, i) => (
              <div key={i} className="flex items-start gap-4 py-4">
                <div className="w-9 h-9 bg-[#2D5A3D]/8 rounded-xl flex items-center justify-center text-[#2D5A3D] flex-shrink-0">
                  {field.icon}
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{field.label}</div>
                  <div className="text-gray-800 mt-0.5 font-medium">{field.value || '—'}</div>
                </div>
              </div>
            ))}
          <div className="py-4">
            <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2">Tiểu Sử</div>
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;
