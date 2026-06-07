import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Star, MapPin, Calendar, Shield, Heart, Package, Award,
  Camera, Edit3, Save, X, Lock, Eye, EyeOff, Phone,
  Bell, CreditCard, CheckCircle, AlertCircle, Zap,
  FileText, Clock, Mail, MessageSquare, User, UserPlus, Check, Trash2,
} from 'lucide-react';
import { useUserProfile } from '../../features/profile/hooks/useUserProfile';
import { useUpdateProfile } from '../../features/profile/hooks/useUpdateProfile';
import { uploadAvatarAPI } from '../../features/profile/services/profileService';
import { UserProfile } from '../../features/profile/types';
import { useMyProducts } from '../../features/products/hooks/useMyProducts';
import { useAuth } from '../../providers/authProvider/AuthContext';
import toast from 'react-hot-toast';
import ProfileTab, { ProfileData } from './Profile/components/ProfileTab';
import SecurityTab from './Profile/components/SecurityTab';
import ProductsTab from './Profile/components/ProductsTab';
import WishlistTab, { WishlistProduct } from './Profile/components/WishlistTab';


const INITIAL_WISHLIST: WishlistProduct[] = [
  { id: 30, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', title: 'Áo Bomber Da Đen', price: 1650000, condition: 'Tốt', seller: 'vintage_co', views: 432, isPublic: true },
  { id: 31, image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400', title: 'Áo Da Lộn Nâu', price: 2100000, condition: 'Tuyệt Vời', seller: 'retro_finds', views: 678, isPublic: false },
  { id: 32, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', title: 'Áo Khoác Denim Vintage', price: 950000, condition: 'Như Mới', seller: 'jean_collector', views: 234, isPublic: true },
];

const AVATAR_COLORS = [
  '#2D5A3D', '#1a1a2e', '#0f3460', '#533483', '#2d6a4f', '#b5451b', '#774936', '#374151',
];

const VIETNAM_CITIES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Nghệ An', 'Quảng Ninh', 'Bình Dương', 'Đồng Nai', 'Huế', 'Nha Trang', 'Đà Lạt',
];

type TabKey = 'profile' | 'products' | 'wishlist' | 'security';

const TABS: { key: TabKey; label: string; icon: React.ReactNode; badge?: string }[] = [
  { key: 'profile', label: 'Hồ Sơ', icon: <User className="w-4 h-4" /> },
  { key: 'products', label: 'Đang Bán', icon: <Package className="w-4 h-4" />, badge: '42' },
  { key: 'wishlist', label: 'Yêu Thích', icon: <Heart className="w-4 h-4" />, badge: '12' },
  { key: 'security', label: 'Bảo Mật', icon: <Lock className="w-4 h-4" /> },
];

const AVAILABLE_BADGES = [
  { id: 'premium-gold', name: 'Premium Gold', gradient: 'from-[#2D5A3D] to-[#3D7054]', icon: '⭐' },
  { id: 'top-seller', name: 'Top Seller', gradient: 'from-orange-500 to-red-500', icon: '🏆' },
  { id: 'verified', name: 'Verified', gradient: 'from-blue-500 to-blue-600', icon: '✓' },
  { id: 'trendsetter', name: 'Trendsetter', gradient: 'from-purple-500 to-pink-500', icon: '💎' },
  { id: 'eco-warrior', name: 'Eco Warrior', gradient: 'from-green-500 to-emerald-600', icon: '🌱' },
  { id: 'vip', name: 'VIP Member', gradient: 'from-yellow-500 to-amber-600', icon: '👑' },
];

/* ─── helpers ────────────────────────────────────────────────────────────── */
function initials(name: string) {
  return name.trim().split(' ').map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase();
}

// ─── Password Validation (pure, reusable) ────────────────────────────────────
export function validateNewPassword(
  password: string,
  username?: string,
  email?: string
): string | null {
  if (password.length < 8)
    return 'Mật khẩu mới phải có ít nhất 8 ký tự';
  if (!/[A-Z]/.test(password))
    return 'Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z)';
  if (!/[a-z]/.test(password))
    return 'Mật khẩu phải chứa ít nhất 1 chữ thường (a-z)';
  if (!/[0-9]/.test(password))
    return 'Mật khẩu phải chứa ít nhất 1 chữ số (0-9)';
  if (!/[@#$!%*?&]/.test(password))
    return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@, #, $, !, %, *, ?, &)';

  const lower = password.toLowerCase();
  if (username && username.length >= 3 && lower.includes(username.toLowerCase()))
    return 'Mật khẩu không được chứa tên đăng nhập của bạn';

  if (email) {
    const emailLocal = email.split('@')[0].toLowerCase();
    if (emailLocal.length >= 4 && lower.includes(emailLocal))
      return 'Mật khẩu không được chứa thông tin email của bạn';
  }

  return null;
}


const mapProfileToUI = (profile: UserProfile): ProfileData => ({
  name: profile.fullName,
  username: profile.username,
  email: profile.email,
  phone: profile.phone ?? '',
  birthday: profile.birthday ? profile.birthday.split('T')[0] : '',
  gender: profile.gender?.toLowerCase() ?? '',
  address: profile.address ?? '',
  city: profile.city ?? '',
  bio: profile.bio ?? '',
  avatarColor: '#2D5A3D',
  avatarUrl: profile.avatarUrl ?? '',
});

/* ─── component ──────────────────────────────────────────────────────────── */
export default function UserProfilePage() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'profile';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const {
    profile: userProfile,
    isLoading,
    error,
    refetch,
  } = useUserProfile();

  const {
    products: myProducts,
    isLoading: isProductsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useMyProducts();

  const { changePassword } = useAuth();
  const { updateProfile, isUpdating, updateError } = useUpdateProfile();
  const [profileError, setProfileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; birthday?: string }>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const soldCount = userProfile?.soldCount ?? 156;
  const sellingCount = isProductsLoading ? (userProfile?.sellingCount ?? 0) : myProducts.length;
  const followerCount = userProfile?.followerCount ?? 2500;
  const responseRate = userProfile?.responseRate ?? 98;

  const formattedFollowers = followerCount >= 1000 
    ? `${(followerCount / 1000).toFixed(1).replace('.0', '')}k`
    : followerCount.toString();

  const joinedDate = userProfile?.createdAt ? new Date(userProfile.createdAt) : null;
  const joinedStr = joinedDate 
    ? `Tham gia ${joinedDate.getMonth() + 1}/${joinedDate.getFullYear()}`
    : 'Tham gia —';

  useEffect(() => {
    const t = searchParams.get('tab') as TabKey | null;
    if (t) setActiveTab(t);
  }, [searchParams]);

  const [isEditing, setIsEditing] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [publicViewMode, setPublicViewMode] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showBadgeSelector, setShowBadgeSelector] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState('premium-gold');
  const [isOnline, setIsOnline] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>(INITIAL_WISHLIST);

  const DEFAULT_PROFILE: ProfileData = {
    name: '',
    username: '',
    email: '',
    phone: '',
    birthday: '',
    gender: '',
    address: '',
    city: '',
    bio: '',
    avatarColor: '#2D5A3D',
    avatarUrl: '',
  };

  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [draft, setDraft] = useState<ProfileData>(DEFAULT_PROFILE);

  useEffect(() => {
    if (!userProfile) return;

    const mapped = mapProfileToUI(userProfile);

    setProfile(mapped);
    setDraft(mapped);
  }, [userProfile]);

  // Password state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Khai báo refs cho các timeout để tránh memory leak
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pwTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (pwTimeoutRef.current) clearTimeout(pwTimeoutRef.current);
    };
  }, []);

  const clearError = useCallback((field: 'name' | 'phone' | 'birthday') => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleSave = useCallback(async () => {
    setProfileError(null);
    const newErrors: { name?: string; phone?: string; birthday?: string } = {};

    // Validation
    if (!draft.name.trim()) {
      newErrors.name = 'Họ và Tên không được để trống.';
    }

    if (draft.phone) {
      const phoneRegex = /^[0][0-9]{9}$/;
      if (!phoneRegex.test(draft.phone)) {
        newErrors.phone = 'Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 chữ số.';
      }
    }

    if (draft.birthday) {
      const today = new Date();
      const birthDate = new Date(draft.birthday);
      if (birthDate > today) {
        newErrors.birthday = 'Ngày sinh không được ở tương lai.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await updateProfile({
        fullName: draft.name,
        phone: draft.phone || undefined,
        birthday: draft.birthday || undefined,
        gender: draft.gender || undefined,
        address: draft.address || undefined,
        city: draft.city || undefined,
        bio: draft.bio || undefined,
        avatarUrl: draft.avatarUrl || undefined,
      });

      setProfile(draft);
      setIsEditing(false);
      setAvatarPickerOpen(false);
      setSaveSuccess(true);
      
      refetch();

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
    }
  }, [draft, updateProfile, refetch]);

  const handleCancel = useCallback(() => {
    setDraft(profile);
    setProfileError(null);
    setErrors({});
    setIsEditing(false);
    setAvatarPickerOpen(false);
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh vượt quá giới hạn 5MB.');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const res = await uploadAvatarAPI(file);
      if (res.success && res.url) {
        setDraft((prev) => ({ ...prev, avatarUrl: res.url }));
        toast.success('Đã tải ảnh lên thành công. Vui lòng nhấn Lưu thay đổi để hoàn tất!');
        // Update the current profile to show the image immediately in UI preview
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải ảnh lên.');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handlePasswordChange = useCallback(async () => {
    setPwError('');
    setPwSuccess(false);
    setHasAttemptedSubmit(true);

    const hasEmpty = !pwForm.current || !pwForm.next || !pwForm.confirm;
    const complexityError = validateNewPassword(pwForm.next, profile.username, profile.email);
    const isMismatch = pwForm.next !== pwForm.confirm;

    if (hasEmpty || complexityError || isMismatch) {
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword({
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
        confirmPassword: pwForm.confirm
      });
      setPwSuccess(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setHasAttemptedSubmit(false);

      if (pwTimeoutRef.current) clearTimeout(pwTimeoutRef.current);
      pwTimeoutRef.current = setTimeout(() => setPwSuccess(false), 4000);
    } catch (err: any) {
      console.error('Lỗi khi đổi mật khẩu:', err);
      setPwError(err.response?.data?.detail || 'Có lỗi xảy ra khi đổi mật khẩu.');
    } finally {
      setIsChangingPassword(false);
    }
  }, [pwForm, changePassword, profile.username, profile.email]);


  const togglePublicView = useCallback(() => {
    setPublicViewMode((prev) => {
      const nextMode = !prev;
      setIsEditing(false);
      if (!nextMode && activeTab === 'security') {
        setActiveTab('profile');
      }
      return nextMode;
    });
  }, [activeTab]);

  // Filter tabs based on public view mode
  const dynamicTabs = [
    { key: 'profile' as TabKey, label: 'Hồ Sơ', icon: <User className="w-4 h-4" /> },
    { key: 'products' as TabKey, label: 'Đang Bán', icon: <Package className="w-4 h-4" />, badge: sellingCount.toString() },
    { key: 'wishlist' as TabKey, label: 'Yêu Thích', icon: <Heart className="w-4 h-4" />, badge: '12' },
    { key: 'security' as TabKey, label: 'Bảo Mật', icon: <Lock className="w-4 h-4" /> },
  ];

  const visibleTabs = publicViewMode
    ? dynamicTabs.filter(tab => ['profile', 'products', 'wishlist'].includes(tab.key))
    : dynamicTabs;

  const currentBadge = AVAILABLE_BADGES.find(b => b.id === selectedBadge) || AVAILABLE_BADGES[0];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-[#2D5A3D] text-white rounded cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div
        className="h-52 relative overflow-hidden bg-gradient-to-r from-[#2D5A3D] via-[#3D7054] to-[#2D5A3D]"
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='35' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile card */}
        <div className="relative -mt-36 mb-6">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {saveSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-3.5 flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Đã lưu thông tin thành công!</span>
              </div>
            )}

            {(profileError || updateError) && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-3.5 flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{profileError || updateError}</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg select-none bg-cover bg-center overflow-hidden"
                  style={{ 
                    backgroundColor: isEditing ? draft.avatarColor : profile.avatarColor,
                    backgroundImage: (isEditing ? draft.avatarUrl : profile.avatarUrl) ? `url(${isEditing ? draft.avatarUrl : profile.avatarUrl})` : 'none'
                  }}
                >
                  {!(isEditing ? draft.avatarUrl : profile.avatarUrl) && initials(isEditing ? draft.name : profile.name)}
                  {isEditing && (
                    <button
                      onClick={() => setAvatarPickerOpen(!avatarPickerOpen)}
                      className="absolute inset-0 bg-black/35 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                  )}
                </div>

                {/* Online/Offline indicator */}
                <div className="absolute -bottom-1 -right-1">
                  <div className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                    isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
                  </div>
                </div>

                {/* Color/Image picker */}
                {avatarPickerOpen && isEditing && (
                  <div className="absolute top-36 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-20 min-w-[200px]">
                    <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">Ảnh đại diện</p>
                    <div className="mb-4 flex flex-col gap-2">
                        <input type="file" id="avatarUpload" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                        <label htmlFor="avatarUpload" className={`flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-medium rounded-lg transition-colors border border-gray-200 justify-center ${isUploadingAvatar ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                            {isUploadingAvatar ? (
                                <div className="w-4 h-4 border-2 border-[#2D5A3D] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Camera className="w-4 h-4" />
                            )}
                            {isUploadingAvatar ? 'Đang tải lên...' : 'Tải ảnh lên'}
                        </label>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">Hoặc chọn màu</p>
                    <div className="grid grid-cols-4 gap-2">
                      {AVATAR_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setDraft((p) => ({ ...p, avatarColor: color, avatarUrl: '' }))}
                          className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                            draft.avatarColor === color && !draft.avatarUrl ? 'ring-3 ring-offset-2 ring-gray-800 scale-110' : ''
                          }`}
                          style={{ backgroundColor: color, outline: draft.avatarColor === color && !draft.avatarUrl ? '2px solid #374151' : 'none', outlineOffset: '2px' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>

                  {/* Badge icon only */}
                  <button
                    onClick={() => !publicViewMode && setShowBadgeSelector(true)}
                    className={`w-8 h-8 bg-gradient-to-r ${currentBadge.gradient} rounded-full flex items-center justify-center text-white text-lg hover:scale-110 transition-transform ${!publicViewMode ? 'cursor-pointer' : 'cursor-default'}`}
                    title={currentBadge.name}
                  >
                    {currentBadge.icon}
                  </button>
                </div>
                <p className="text-gray-400 text-sm mb-3">@{profile.username}</p>
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#2D5A3D]" /> {profile.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#2D5A3D]" /> {joinedStr}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed max-w-2xl line-clamp-2 mb-3">{profile.bio}</p>

                {/* Rating stars */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">⭐ 4.9</span>
                  <span className="text-sm text-gray-500">(234 đánh giá)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isUpdating}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white px-6 py-2.5 rounded-full hover:shadow-lg transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Lưu Thay Đổi
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isUpdating}
                      className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 px-6 py-2.5 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Hủy
                    </button>
                  </>
                ) : publicViewMode ? (
                  <>
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full transition-all text-sm font-semibold ${
                        isFollowing
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white hover:shadow-lg'
                      }`}
                    >
                      <UserPlus className="w-4 h-4" /> {isFollowing ? 'Đang Theo Dõi' : 'Theo Dõi'}
                    </button>
                    <button
                      onClick={togglePublicView}
                      className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 px-6 py-2.5 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium"
                      title="Quay lại chế độ riêng tư"
                    >
                      <EyeOff className="w-4 h-4" /> Chế Độ Riêng Tư
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setIsEditing(true); setActiveTab('profile'); }}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white px-6 py-2.5 rounded-full hover:shadow-lg transition-all text-sm font-semibold"
                    >
                      <Edit3 className="w-4 h-4" /> Sửa Hồ Sơ
                    </button>
                    <button
                      onClick={togglePublicView}
                      className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 px-6 py-2.5 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium"
                      title="Xem ở chế độ công khai"
                    >
                      <Eye className="w-4 h-4" /> Chế Độ Công Khai
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-100">
              {[
                { label: 'Đã Bán', value: soldCount.toString() },
                { label: 'Đang Bán', value: sellingCount.toString() },
                { label: 'Người Theo Dõi', value: formattedFollowers },
                { label: 'Tỉ Lệ Phản Hồi', value: `${responseRate}%` },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold text-[#2D5A3D]">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto pb-1">
          <div className="bg-white rounded-2xl shadow-sm p-1.5 inline-flex gap-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-16">
          {activeTab === 'profile' && (
            <ProfileTab
              profile={profile}
              draft={draft}
              isEditing={isEditing}
              setDraft={setDraft}
              publicViewMode={publicViewMode}
              errors={errors}
              clearError={clearError}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              products={myProducts}
              isLoading={isProductsLoading}
              error={productsError}
              onRetry={refetchProducts}
            />
          )}

          {activeTab === 'wishlist' && (
            <WishlistTab
              wishlistProducts={wishlistProducts}
              publicViewMode={publicViewMode}
              setWishlistProducts={setWishlistProducts}
            />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              pwForm={pwForm}
              setPwForm={setPwForm}
              showPw={showPw}
              setShowPw={setShowPw}
              pwError={pwError}
              pwSuccess={pwSuccess}
              handlePasswordChange={handlePasswordChange}
              isSubmitting={isChangingPassword}
              username={profile.username}
              email={profile.email}
              hasAttemptedSubmit={hasAttemptedSubmit}
              setHasAttemptedSubmit={setHasAttemptedSubmit}
            />
          )}
        </div>

        {/* Badge Selection Modal */}
        {showBadgeSelector && !publicViewMode && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowBadgeSelector(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
                <button
                  onClick={() => setShowBadgeSelector(false)}
                  className="absolute top-6 right-6 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">Chọn Badge Hiển Thị</h3>
                <p className="text-gray-600 text-sm mb-6">Badge này sẽ hiển thị cạnh tên của bạn</p>

                <div className="grid grid-cols-2 gap-4">
                  {AVAILABLE_BADGES.map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() => {
                        setSelectedBadge(badge.id);
                        setShowBadgeSelector(false);
                      }}
                      className={`relative p-4 rounded-2xl border-2 transition-all hover:scale-105 ${
                        selectedBadge === badge.id
                          ? 'border-[#2D5A3D] bg-[#2D5A3D]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {selectedBadge === badge.id && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-5 h-5 text-[#2D5A3D]" />
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 bg-gradient-to-r ${badge.gradient} rounded-full flex items-center justify-center text-white text-2xl`}>
                          {badge.icon}
                        </div>
                        <span className="text-xs font-medium text-gray-900 text-center">
                          {badge.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
