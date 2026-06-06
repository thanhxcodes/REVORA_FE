import React, { useMemo } from 'react';
import { Lock, CheckCircle, EyeOff, Eye, AlertCircle, ShieldCheck, Info } from 'lucide-react';
import { validateNewPassword } from '../../UserProfilePage';

interface SecurityTabProps {
  pwForm: { current: string; next: string; confirm: string };
  setPwForm: React.Dispatch<React.SetStateAction<{ current: string; next: string; confirm: string }>>;
  showPw: { current: boolean; next: boolean; confirm: boolean };
  setShowPw: React.Dispatch<React.SetStateAction<{ current: boolean; next: boolean; confirm: boolean }>>;
  pwError: string;
  pwSuccess: boolean;
  handlePasswordChange: () => void;
  isSubmitting?: boolean;
  username?: string;
  email?: string;
  hasAttemptedSubmit: boolean;
  setHasAttemptedSubmit: React.Dispatch<React.SetStateAction<boolean>>;
}

// ─── Password Strength Logic ──────────────────────────────────────────────────

interface StrengthResult {
  score: number;    // 0 – 5
  label: string;
  color: string;
  textColor: string;
  rules: { text: string; passed: boolean }[];
}

function calcPasswordStrength(password: string): StrengthResult {
  const rules = [
    { text: 'Ít nhất 8 ký tự',                              passed: password.length >= 8 },
    { text: 'Chứa chữ hoa (A–Z)',                           passed: /[A-Z]/.test(password) },
    { text: 'Chứa chữ thường (a–z)',                        passed: /[a-z]/.test(password) },
    { text: 'Chứa chữ số (0–9)',                             passed: /[0-9]/.test(password) },
    { text: 'Chứa ký tự đặc biệt (@#$!%*?&)',              passed: /[@#$!%*?&]/.test(password) },
  ];

  const score = Math.min(5, rules.filter((r) => r.passed).length);

  const levels: Omit<StrengthResult, 'score' | 'rules'>[] = [
    { label: 'Rất yếu',    color: 'bg-red-500',    textColor: 'text-red-600'     },
    { label: 'Yếu',        color: 'bg-orange-400',  textColor: 'text-orange-500'  },
    { label: 'Trung bình', color: 'bg-yellow-400',  textColor: 'text-yellow-600'  },
    { label: 'Khá mạnh',   color: 'bg-lime-500',    textColor: 'text-lime-600'    },
    { label: 'Mạnh',       color: 'bg-green-500',   textColor: 'text-green-600'   },
    { label: 'Rất mạnh',   color: 'bg-emerald-600', textColor: 'text-emerald-700' },
  ];

  return { score, rules, ...levels[score] };
}

// ─── Password Strength Meter Component ───────────────────────────────────────

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
  const strength = useMemo(() => calcPasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-2">
      {/* Segmented Bar — 5 segments */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < strength.score ? strength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Strength label */}
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${strength.textColor}`}>
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Độ mạnh: {strength.label}</span>
      </div>

      {/* Checklist */}
      <ul className="space-y-1">
        {strength.rules.map((rule) => (
          <li
            key={rule.text}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              rule.passed ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <span className="w-3 h-3 flex-shrink-0">
              {rule.passed ? (
                <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                  <circle cx="6" cy="6" r="6" className="fill-green-500" />
                  <path
                    d="M3.5 6l2 2 3-3"
                    stroke="white"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                  <circle cx="6" cy="6" r="5.5" stroke="#d1d5db" />
                </svg>
              )}
            </span>
            {rule.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─── Main SecurityTab ─────────────────────────────────────────────────────────

export const SecurityTab: React.FC<SecurityTabProps> = ({
  pwForm,
  setPwForm,
  showPw,
  setShowPw,
  pwError,
  pwSuccess,
  handlePasswordChange,
  isSubmitting = false,
  username,
  email,
  hasAttemptedSubmit,
  setHasAttemptedSubmit,
}) => {
  const errors = useMemo(() => {
    const errs: { current?: string; next?: string; confirm?: string } = {};

    if (hasAttemptedSubmit) {
      if (!pwForm.current) {
        errs.current = 'Vui lòng nhập mật khẩu hiện tại';
      }

      if (!pwForm.next) {
        errs.next = 'Vui lòng nhập mật khẩu mới';
      } else {
        const nextErr = validateNewPassword(pwForm.next, username, email);
        if (nextErr) {
          errs.next = nextErr;
        }
      }

      if (!pwForm.confirm) {
        errs.confirm = 'Vui lòng xác nhận mật khẩu mới';
      } else if (pwForm.confirm !== pwForm.next) {
        errs.confirm = 'Xác nhận mật khẩu mới không khớp';
      }
    } else {
      if (pwForm.confirm && pwForm.confirm !== pwForm.next) {
        errs.confirm = 'Xác nhận mật khẩu mới không khớp';
      }
    }

    return errs;
  }, [pwForm, hasAttemptedSubmit, username, email]);

  return (
    <div className="space-y-6">
      {/* Change password */}
      <div className="bg-white rounded-3xl shadow-sm p-8">
        <h3 className="font-bold text-gray-900 text-lg mb-6">
          Thay Đổi Mật Khẩu
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-6">
            {pwSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-3.5 flex items-center gap-2.5 animate-slide-down">
                <CheckCircle className="w-5 h-5 flex-shrink-0" /> Đổi mật khẩu thành công!
              </div>
            )}

            <div className="space-y-5">
              {(
                [
                  { field: 'current' as const, label: 'Mật Khẩu Hiện Tại' },
                  { field: 'next' as const, label: 'Mật Khẩu Mới' },
                  { field: 'confirm' as const, label: 'Xác Nhận Mật Khẩu Mới' },
                ] as const
              ).map(({ field, label }) => (
                <div key={field} className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPw[field] ? 'text' : 'password'}
                      value={pwForm[field]}
                      onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-all duration-200 text-gray-900 ${
                        errors[field]
                          ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200/50'
                          : 'border-gray-200 focus:ring-[#2D5A3D]/30'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => ({ ...p, [field]: !p[field] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw[field] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Inline feedback error messages */}
                  {field === 'current' && errors.current && (
                    <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1.5 animate-slide-down">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      {errors.current}
                    </p>
                  )}
                  {field === 'next' && errors.next && !pwForm.next && (
                    <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1.5 animate-slide-down">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      {errors.next}
                    </p>
                  )}
                  {field === 'confirm' && errors.confirm && (
                    <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1.5 animate-slide-down">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      {errors.confirm}
                    </p>
                  )}

                  {/* Strength meter only for the new-password field */}
                  {field === 'next' && (
                    <PasswordStrengthMeter password={pwForm.next} />
                  )}
                </div>
              ))}
            </div>

            {pwError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-down">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" /> {pwError}
              </div>
            )}

            <button
              onClick={handlePasswordChange}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white px-8 py-3 rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đổi Mật Khẩu'
              )}
            </button>
          </div>

          {/* Right Column: Premium Side Guidance Panel */}
          <div className="lg:col-span-5 space-y-5 animate-slide-down lg:border-l lg:border-gray-100 lg:pl-8">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#2D5A3D]">
                <Info className="w-5 h-5 flex-shrink-0" />
                <span className="font-bold text-gray-800 text-sm">Quy tắc đặt mật khẩu</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số, ký tự đặc biệt
                (@, #, $, !, %, *, ?, &) và không chứa thông tin tài khoản (tên đăng nhập, email).
              </p>
            </div>

            <div className="bg-[#2D5A3D]/5 border border-[#2D5A3D]/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#2D5A3D]">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#2D5A3D] flex-shrink-0" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span className="font-bold text-gray-800 text-sm">Khuyến nghị bảo mật</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-500 list-disc pl-4 leading-relaxed">
                <li>Sử dụng mật khẩu mạnh và không trùng lặp với các dịch vụ khác.</li>
                <li>Thay đổi mật khẩu định kỳ 6 tháng một lần để bảo vệ tài khoản.</li>
                <li>Không bao giờ chia sẻ mật khẩu của bạn với bất kỳ ai, kể cả quản trị viên hệ thống.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
