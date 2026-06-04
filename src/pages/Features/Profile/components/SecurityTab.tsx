import React from 'react';
import { Lock, CheckCircle, EyeOff, Eye, AlertCircle } from 'lucide-react';

interface SecurityTabProps {
  pwForm: { current: string; next: string; confirm: string };
  setPwForm: React.Dispatch<React.SetStateAction<{ current: string; next: string; confirm: string }>>;
  showPw: { current: boolean; next: boolean; confirm: boolean };
  setShowPw: React.Dispatch<React.SetStateAction<{ current: boolean; next: boolean; confirm: boolean }>>;
  pwError: string;
  pwSuccess: boolean;
  handlePasswordChange: () => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  pwForm,
  setPwForm,
  showPw,
  setShowPw,
  pwError,
  pwSuccess,
  handlePasswordChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Change password */}
      <div className="bg-white rounded-3xl shadow-sm p-8">
        <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#2D5A3D]" /> Đổi Mật Khẩu
        </h3>

        {pwSuccess && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-3.5 flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 flex-shrink-0" /> Đổi mật khẩu thành công!
          </div>
        )}

        <div className="space-y-5 max-w-md">
          {(
            [
              { field: 'current' as const, label: 'Mật Khẩu Hiện Tại' },
              { field: 'next' as const, label: 'Mật Khẩu Mới' },
              { field: 'confirm' as const, label: 'Xác Nhận Mật Khẩu Mới' },
            ] as const
          ).map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPw[field] ? 'text' : 'password'}
                  value={pwForm[field]}
                  onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => ({ ...p, [field]: !p[field] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw[field] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ))}

          {pwError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {pwError}
            </div>
          )}

          <button
            onClick={handlePasswordChange}
            className="bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white px-8 py-3 rounded-full hover:shadow-lg transition-all font-semibold cursor-pointer"
          >
            Cập Nhật Mật Khẩu
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
