import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Calendar, Shield, Heart, Package, Award,
  Camera, Edit3, Save, X, Lock, Eye, EyeOff, Phone,
  Bell, CreditCard, CheckCircle, AlertCircle, Zap,
  FileText, Clock, Mail, MessageSquare, User, UserPlus, Check, Trash2,
} from 'lucide-react';
import { useUserProfile } from '../../features/profile/hooks/useUserProfile';
import { useUpdateProfile } from '../../features/profile/hooks/useUpdateProfile';
import { uploadAvatarAPI, getBadgesAPI, updateMyBadgeAPI } from '../../features/profile/services/profileService';
import { UserProfile, BadgeResponseDto } from '../../features/profile/types';
import { useMyProducts } from '../../features/products/hooks/useMyProducts';
import { useAuth } from '../../providers/authProvider/AuthContext';
import { useWishlist } from '../../providers/wishlistProvider/WishlistContext';
import { useToggleFollow } from '../../features/profile/hooks/useFollow';
import toast from 'react-hot-toast';
import ProfileTab, { ProfileData } from './Profile/components/ProfileTab';
import SecurityTab from './Profile/components/SecurityTab';
import ProductsTab from './Profile/components/ProductsTab';
import WishlistTab from './Profile/components/WishlistTab';
import FollowListModal from './Profile/components/FollowListModal';


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

const getBadgeVisuals = (name: string | undefined | null) => {
  if (!name) return null;
  const normalized = name.toLowerCase().replace('-', ' ').trim();
  switch (normalized) {
    case 'premium gold':
      return { gradient: 'from-amber-400 via-yellow-500 to-amber-600', icon: '⭐' };
    case 'top seller':
      return { gradient: 'from-orange-500 to-red-500', icon: '🏆' };
    case 'verified':
      return { gradient: 'from-blue-500 to-blue-600', icon: '✓' };
    case 'trendsetter':
      return { gradient: 'from-purple-500 to-pink-500', icon: '💎' };
    case 'eco warrior':
      return { gradient: 'from-green-500 to-emerald-600', icon: '🌱' };
    case 'vip member':
      return { gradient: 'from-yellow-500 to-amber-600', icon: '👑' };
    default:
      return { gradient: 'from-gray-400 to-gray-600', icon: '🎖️' };
  }
};

/* ─── helpers ────────────────────────────────────────────────────────────── */
function initials(name: string | undefined | null) {
  if (!name) return 'U';
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
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = (searchParams.get('tab') as TabKey) || 'profile';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const {
    profile: userProfile,
    isLoading,
    error,
    refetch,
  } = useUserProfile(id);

  const {
    products: myProducts,
    isLoading: isProductsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useMyProducts(id);

  const { wishlistIds } = useWishlist();
  const { currentUser, changePassword } = useAuth();
  const { updateProfile, isUpdating, updateError } = useUpdateProfile();
  const [profileError, setProfileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; birthday?: string }>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const soldCount = userProfile?.soldCount ?? 156;
  const sellingCount = isProductsLoading ? (userProfile?.sellingCount ?? 0) : myProducts.filter(p => p.productStatus === 'Public').length;
  
  const [localFollowerCount, setLocalFollowerCount] = useState(0);
  const [localFollowingCount, setLocalFollowingCount] = useState(0);

  useEffect(() => {
    setLocalFollowerCount(userProfile?.followerCount ?? 0);
    setLocalFollowingCount(userProfile?.followingCount ?? 0);
  }, [userProfile?.followerCount, userProfile?.followingCount]);


  const formattedFollowers = localFollowerCount >= 1000 
    ? `${(localFollowerCount / 1000).toFixed(1).replace('.0', '')}k`
    : localFollowerCount.toString();
    
  const formattedFollowing = localFollowingCount >= 1000 
    ? `${(localFollowingCount / 1000).toFixed(1).replace('.0', '')}k`
    : localFollowingCount.toString();

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
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);
  const [systemBadges, setSystemBadges] = useState<BadgeResponseDto[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Follow UI states
  const isOwnProfile = !id || !!(currentUser?.id && id && currentUser.id.toString() === id);
  const { toggleFollow, isLoading: isToggleFollowLoading } = useToggleFollow();
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');

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
    setIsFollowing(userProfile.isFollowing ?? false);
    setSelectedBadgeId(userProfile.badgeId ?? null);
  }, [userProfile]);

  useEffect(() => {
    if (isOwnProfile) {
      getBadgesAPI()
        .then((res) => {
          if (res.success && res.data) {
            setSystemBadges(res.data);
          }
        })
        .catch((err) => console.error('Failed to load system badges:', err));
    }
  }, [isOwnProfile]);

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
    { key: 'wishlist' as TabKey, label: 'Yêu Thích', icon: <Heart className="w-4 h-4" />, badge: wishlistIds.length.toString() },
    { key: 'security' as TabKey, label: 'Bảo Mật', icon: <Lock className="w-4 h-4" /> },
  ];

  const visibleTabs = publicViewMode
    ? dynamicTabs.filter(tab => ['profile', 'products'].includes(tab.key))
    : dynamicTabs;

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
      {/* Banner - Abstract Mesh Gradient */}
      <div className="h-72 relative overflow-hidden bg-[#2D5A3D]">
        {/* Animated Mesh Gradients */}
        <div className="absolute top-0 left-0 w-full h-full opacity-60 mix-blend-screen">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-gradient-to-br from-[#3D7054] to-[#C4603A]/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[120%] bg-gradient-to-bl from-[#C4603A]/20 to-[#2D5A3D] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        </div>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile card - Glassmorphism */}
        <div className="relative -mt-40 mb-8">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 md:p-10">
            {saveSuccess && (
              <div className="mb-6 bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-700 rounded-2xl px-5 py-3.5 flex items-center gap-2.5 shadow-sm">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Đã lưu thông tin thành công!</span>
              </div>
            )}

            {(profileError || updateError) && (
              <div className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl px-5 py-3.5 flex items-center gap-2.5 shadow-sm">
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
                  {isEditing && isOwnProfile && (
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
                {avatarPickerOpen && isEditing && isOwnProfile && (
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

                  {/* Badge icon */}
                  {userProfile?.badge ? (
                    <button
                      onClick={() => isOwnProfile && !publicViewMode && setShowBadgeSelector(true)}
                      className={`w-8 h-8 bg-gradient-to-r ${getBadgeVisuals(userProfile.badge.name)?.gradient || 'from-gray-400 to-gray-600'} rounded-full flex items-center justify-center text-white text-lg hover:scale-110 transition-transform ${isOwnProfile && !publicViewMode ? 'cursor-pointer' : 'cursor-default'}`}
                      title={`${userProfile.badge.name}: ${userProfile.badge.description || ''}`}
                      disabled={!isOwnProfile || publicViewMode}
                    >
                      {getBadgeVisuals(userProfile.badge.name)?.icon || '🎖️'}
                    </button>
                  ) : (isOwnProfile && !publicViewMode) ? (
                    <button
                      onClick={() => setShowBadgeSelector(true)}
                      className="px-3 py-1 bg-green-50 hover:bg-green-100 text-[#2D5A3D] border border-dashed border-[#2D5A3D]/40 hover:border-[#2D5A3D] rounded-full flex items-center gap-1 text-xs font-semibold hover:scale-105 transition-all cursor-pointer shadow-sm"
                      title="Chọn huy hiệu hiển thị"
                    >
                      <span>✨</span>
                      <span>Chọn danh hiệu</span>
                    </button>
                  ) : null}
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

              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
                {isEditing && isOwnProfile ? (
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
                ) : !isOwnProfile ? (
                  <>
                    <button
                      onClick={async () => {
                        if (!currentUser) {
                          toast.error('Vui lòng đăng nhập để theo dõi.');
                          navigate('/login');
                          return;
                        }
                        if (userProfile) {
                          const result = await toggleFollow(userProfile.userId);
                          if (result) {
                            setIsFollowing(result.isFollowing);
                            setLocalFollowerCount(prev => result.isFollowing ? prev + 1 : prev - 1);
                          }
                        }
                      }}
                      disabled={isToggleFollowLoading}
                      className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full transition-all text-sm font-semibold ${
                        isFollowing
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white hover:shadow-lg'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isToggleFollowLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : isFollowing ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                      {isFollowing ? 'Đang Theo Dõi' : 'Theo dõi'}
                    </button>
                    <button
                      onClick={() => navigate('/messages', {
                        state: {
                          targetUserId: userProfile?.userId,
                          targetUserName: userProfile?.fullName,
                          targetUserAvatar: userProfile?.avatarUrl
                        }
                      })}
                      className="flex items-center justify-center gap-2 border-2 border-[#2D5A3D] text-[#2D5A3D] px-6 py-2.5 rounded-full hover:bg-[#2D5A3D]/5 transition-colors text-sm font-semibold"
                    >
                      <MessageSquare className="w-4 h-4" /> Nhắn tin
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
                      {publicViewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {publicViewMode ? 'Đang xem công khai' : 'Chế Độ Công Khai'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 mt-8 pt-8 border-t border-gray-200/50">
              <div className="flex flex-col items-center p-4 rounded-2xl hover:bg-white/50 transition-colors">
                <div className="text-3xl font-black text-[#2D5A3D] drop-shadow-sm">{sellingCount}</div>
                <div className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Đang Bán</div>
              </div>
              <div 
                className="flex flex-col items-center p-4 rounded-2xl hover:bg-[#2D5A3D]/5 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => {
                  setFollowModalType('followers');
                  setIsFollowModalOpen(true);
                }}
              >
                <div className="text-3xl font-black text-[#2D5A3D] drop-shadow-sm group-hover:text-[#3D7054] transition-colors">{formattedFollowers}</div>
                <div className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider group-hover:text-[#2D5A3D] transition-colors">Follower</div>
              </div>
              <div 
                className="flex flex-col items-center p-4 rounded-2xl hover:bg-[#2D5A3D]/5 hover:scale-105 transition-all cursor-pointer group"
                onClick={() => {
                  setFollowModalType('following');
                  setIsFollowModalOpen(true);
                }}
              >
                <div className="text-3xl font-black text-[#2D5A3D] drop-shadow-sm group-hover:text-[#3D7054] transition-colors">{formattedFollowing}</div>
                <div className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider group-hover:text-[#2D5A3D] transition-colors">Đã Follow</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Pill format */}
        <div className="mb-8 flex justify-center overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          <div className="bg-white/60 backdrop-blur-md rounded-full shadow-sm p-1.5 inline-flex gap-2 border border-white/40">
            {visibleTabs.map((tab) => {
              if (!isOwnProfile && (tab.key === 'security' || tab.key === 'wishlist')) return null;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full text-[15px] font-semibold transition-all whitespace-nowrap relative ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] rounded-full -z-10 shadow-[0_4px_12px_rgba(45,90,61,0.3)]" />
                  )}
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-16">
          {activeTab === 'profile' && (
            <ProfileTab
              profile={profile}
              draft={draft}
              isEditing={isEditing && isOwnProfile}
              setDraft={setDraft}
              publicViewMode={publicViewMode || !isOwnProfile}
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
              isOwnProfile={isOwnProfile}
              sellerAvatarFallback={userProfile?.avatarUrl ?? undefined}
            />
          )}

          {activeTab === 'wishlist' && (
            <WishlistTab
              publicViewMode={publicViewMode}
              userAvatarFallback={userProfile?.avatarUrl || currentUser?.avatarUrl}
              userNameFallback={userProfile?.fullName || currentUser?.name}
              userUsernameFallback={userProfile?.username || currentUser?.username}
            />
          )}

          {activeTab === 'security' && isOwnProfile && (
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
        {showBadgeSelector && isOwnProfile && !publicViewMode && (
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

                <div className="grid grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
                  {/* None option */}
                  <button
                    onClick={async () => {
                      try {
                        const res = await updateMyBadgeAPI(null);
                        if (res.success) {
                          setSelectedBadgeId(null);
                          toast.success('Đã ẩn huy hiệu hiển thị.');
                          refetch();
                        }
                      } catch (err) {
                        toast.error('Không thể cập nhật huy hiệu.');
                      }
                      setShowBadgeSelector(false);
                    }}
                    className={`relative p-4 rounded-2xl border-2 transition-all hover:scale-105 flex flex-col items-center justify-center gap-2 ${
                      selectedBadgeId === null
                        ? 'border-[#2D5A3D] bg-[#2D5A3D]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {selectedBadgeId === null && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-[#2D5A3D]" />
                      </div>
                    )}
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xl border-2 border-dashed border-gray-300">
                      ✕
                    </div>
                    <span className="text-xs font-semibold text-gray-500 text-center">
                      Không hiển thị
                    </span>
                  </button>

                  {/* Seeded badges */}
                  {systemBadges.map((badge) => {
                    const visuals = getBadgeVisuals(badge.name);
                    const isSelected = selectedBadgeId === badge.badgeId;
                    const isOwned = badge.isOwned;

                    return (
                      <button
                        key={badge.badgeId}
                        disabled={!isOwned}
                        onClick={async () => {
                          if (!isOwned) return;
                          try {
                            const res = await updateMyBadgeAPI(badge.badgeId);
                            if (res.success) {
                              setSelectedBadgeId(badge.badgeId);
                              toast.success(`Đã chọn huy hiệu ${badge.name}!`);
                              refetch();
                            }
                          } catch (err) {
                            toast.error('Không thể cập nhật huy hiệu.');
                          }
                          setShowBadgeSelector(false);
                        }}
                        className={`relative p-4 rounded-2xl border-2 transition-all hover:scale-105 flex flex-col items-center gap-2 ${
                          isSelected
                            ? 'border-[#2D5A3D] bg-[#2D5A3D]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!isOwned ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                        title={badge.description || ''}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <Check className="w-5 h-5 text-[#2D5A3D]" />
                          </div>
                        )}
                        <div className={`w-12 h-12 bg-gradient-to-r ${visuals?.gradient || 'from-gray-400 to-gray-600'} rounded-full flex items-center justify-center text-white text-2xl shadow-sm`}>
                          {visuals?.icon || '🎖️'}
                        </div>
                          <span className="text-xs font-bold text-gray-800 text-center flex flex-col items-center">
                            <span>{badge.name}</span>
                            {badge.expiredAt ? (
                              <span className="text-[10px] text-gray-500 mt-0.5 font-normal">
                                {new Date(badge.expiredAt).getTime() < Date.now() 
                                  ? `Đã hết hạn: ${new Date(badge.expiredAt).toLocaleDateString('vi-VN')}` 
                                  : `HSD: ${new Date(badge.expiredAt).toLocaleDateString('vi-VN')}`}
                              </span>
                            ) : isOwned ? (
                              <span className="text-[10px] text-gray-500 mt-0.5 font-normal">Vĩnh viễn</span>
                            ) : null}
                          </span>
                        {!isOwned && (
                           <div className="absolute top-2 left-2">
                             <Lock className="w-4 h-4 text-gray-400" />
                           </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Follow List Modal */}
        {userProfile && (
          <FollowListModal
            isOpen={isFollowModalOpen}
            onClose={() => setIsFollowModalOpen(false)}
            userId={userProfile.userId}
            type={followModalType}
            onFollowToggle={(targetUserId, newIsFollowing) => {
              if (isOwnProfile) {
                // If viewing own profile, following/unfollowing someone affects YOUR following count
                setLocalFollowingCount(prev => newIsFollowing ? prev + 1 : prev - 1);
              } else if (targetUserId === userProfile.userId) {
                // If viewing someone else's profile, and we toggle follow on THEM
                setIsFollowing(newIsFollowing);
                setLocalFollowerCount(prev => newIsFollowing ? prev + 1 : prev - 1);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
