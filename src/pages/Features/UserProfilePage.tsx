import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Star, MapPin, Calendar, Shield, Heart, Package, Award,
  Camera, Edit3, Save, X, Lock, Eye, EyeOff, Phone,
  Bell, CreditCard, CheckCircle, AlertCircle, Zap,
  FileText, Clock, Mail, MessageSquare, User, UserPlus, Check, Trash2,
} from 'lucide-react';
import ProductCard from '../Products/components/ProductCard';

/* ─── mock data ─────────────────────────────────────────────────────────── */
const userProducts = [
  { id: 20, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400', title: 'Áo Khoác Da Vintage', price: 1890000, condition: 'Như Mới', seller: 'fashionista_22', views: 1234, isPremium: true },
  { id: 21, image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400', title: 'Túi Xách Designer', price: 4500000, condition: 'Tuyệt Vời', seller: 'fashionista_22', views: 892 },
  { id: 22, image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400', title: 'Giày Thể Thao Cao Cổ', price: 1200000, condition: 'Tốt', seller: 'fashionista_22', views: 567 },
  { id: 23, image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400', title: 'Váy Hè', price: 750000, condition: 'Như Mới', seller: 'fashionista_22', views: 423 },
];

interface WishlistProduct {
  id: number;
  image: string;
  title: string;
  price: number;
  condition: string;
  seller: string;
  views: number;
  isPublic: boolean;
}

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

/* ─── types ──────────────────────────────────────────────────────────────── */
interface ProfileData {
  name: string;
  username: string;
  email: string;
  phone: string;
  zalo: string;
  birthday: string;
  gender: string;
  address: string;
  city: string;
  bio: string;
  avatarColor: string;
}

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

/* ─── component ──────────────────────────────────────────────────────────── */
export default function UserProfilePage() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'profile';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

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
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>(INITIAL_WISHLIST);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    name: 'Minh Anh',
    username: 'fashionista_22',
    email: 'minhanh@gmail.com',
    phone: '0912 345 678',
    zalo: '0912 345 678',
    birthday: '1999-05-15',
    gender: 'female',
    address: '123 Đường Hoàng Hoa Thám, Quận Ba Đình',
    city: 'Hà Nội',
    bio: 'Đam mê thời trang và sưu tầm đồ vintage. Tuyển chọn những món đồ độc đáo với tình yêu và sự chăm sóc. Cam kết giao hàng nhanh và giao tiếp tốt!',
    avatarColor: '#2D5A3D',
  });
  const [draft, setDraft] = useState<ProfileData>(profile);

  // Password state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleSave = () => {
    setProfile(draft);
    setIsEditing(false);
    setAvatarPickerOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
    setAvatarPickerOpen(false);
  };

  const handlePasswordChange = () => {
    setPwError('');
    if (!pwForm.current) { setPwError('Vui lòng nhập mật khẩu hiện tại'); return; }
    if (pwForm.current !== '123') { setPwError('Mật khẩu hiện tại không đúng'); return; }
    if (pwForm.next.length < 3) { setPwError('Mật khẩu mới phải có ít nhất 3 ký tự'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('Xác nhận mật khẩu không khớp'); return; }
    setPwSuccess(true);
    setPwForm({ current: '', next: '', confirm: '' });
    setTimeout(() => setPwSuccess(false), 4000);
  };

  const toggleWishlistPublic = (id: number) => {
    setWishlistProducts(prev => prev.map(p => p.id === id ? { ...p, isPublic: !p.isPublic } : p));
  };

  const removeFromWishlist = (id: number) => {
    setWishlistProducts(prev => prev.filter(p => p.id !== id));
  };

  const togglePublicView = () => {
    setPublicViewMode(!publicViewMode);
    setIsEditing(false);
    // Switch to safe tab if current tab is private
    if (!publicViewMode && activeTab === 'security') {
      setActiveTab('profile');
    }
  };

  // Filter tabs based on public view mode
  const visibleTabs = publicViewMode
    ? TABS.filter(tab => ['profile', 'products', 'wishlist'].includes(tab.key))
    : TABS;

  const currentBadge = AVAILABLE_BADGES.find(b => b.id === selectedBadge) || AVAILABLE_BADGES[0];

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

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg select-none"
                  style={{ backgroundColor: isEditing ? draft.avatarColor : profile.avatarColor }}
                >
                  {initials(isEditing ? draft.name : profile.name)}
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

                {/* Color picker */}
                {avatarPickerOpen && isEditing && (
                  <div className="absolute top-36 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-20">
                    <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">Màu avatar</p>
                    <div className="grid grid-cols-4 gap-2">
                      {AVATAR_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setDraft((p) => ({ ...p, avatarColor: color }))}
                          className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                            draft.avatarColor === color ? 'ring-3 ring-offset-2 ring-gray-800 scale-110' : ''
                          }`}
                          style={{ backgroundColor: color, outline: draft.avatarColor === color ? '2px solid #374151' : 'none', outlineOffset: '2px' }}
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
                    <Calendar className="w-4 h-4 text-[#2D5A3D]" /> Tham gia 3/2023
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed max-w-2xl line-clamp-2 mb-3">{profile.bio}</p>

                {/* Rating stars */}
                <div className="flex items-center gap-2">
                  {publicViewMode ? (
                    /* Public view - allow voting */
                    <>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                          <button
                            key={starValue}
                            onClick={() => setUserRating(starValue)}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-5 h-5 transition-colors ${
                                starValue <= (hoverRating || userRating || 0)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {userRating && (
                        <span className="text-xs text-[#2D5A3D] font-medium">
                          Bạn đã đánh giá {userRating} sao
                        </span>
                      )}
                      <span className="text-sm font-semibold text-gray-900 ml-2">4.9</span>
                      <span className="text-sm text-gray-500">(234 đánh giá)</span>
                    </>
                  ) : (
                    /* Private view - just display rating */
                    <>
                      <span className="text-sm font-semibold text-gray-900">⭐ 4.9</span>
                      <span className="text-sm text-gray-500">(234 đánh giá)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white px-6 py-2.5 rounded-full hover:shadow-lg transition-all text-sm font-semibold"
                    >
                      <Save className="w-4 h-4" /> Lưu Thay Đổi
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 px-6 py-2.5 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium"
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
                { label: 'Đã Bán', value: '156' },
                { label: 'Đang Bán', value: '42' },
                { label: 'Người Theo Dõi', value: '2.5k' },
                { label: 'Tỉ Lệ Phản Hồi', value: '98%' },
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

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
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
                      onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                    />
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
                      onChange={(e) => setDraft((p) => ({ ...p, birthday: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giới Tính</label>
                    <select
                      value={draft.gender}
                      onChange={(e) => setDraft((p) => ({ ...p, gender: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                    >
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
                      onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                    />
                  </div>

                  {/* Zalo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zalo</label>
                    <input
                      type="text"
                      value={draft.zalo}
                      onChange={(e) => setDraft((p) => ({ ...p, zalo: e.target.value }))}
                      placeholder="Số Zalo hoặc link Zalo"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white transition-colors text-gray-900"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={draft.email}
                      onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-gray-50 focus:bg-white transition-colors text-gray-900"
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
                    { label: 'Zalo', value: profile.zalo, icon: <MessageSquare className="w-4 h-4" />, public: false },
                    {
                      label: 'Ngày Sinh',
                      value: (() => { try { return new Date(profile.birthday).toLocaleDateString('vi-VN'); } catch { return profile.birthday; } })(),
                      icon: <Calendar className="w-4 h-4" />,
                      public: true,
                    },
                    { label: 'Giới Tính', value: profile.gender === 'female' ? 'Nữ' : profile.gender === 'male' ? 'Nam' : 'Khác', icon: <User className="w-4 h-4" />, public: true },
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
          )}

          {/* ── PRODUCTS TAB ── */}
          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Sản Phẩm Đang Bán (42)</h2>
                <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 bg-white">
                  <option>Mới Nhất</option>
                  <option>Giá: Thấp đến Cao</option>
                  <option>Giá: Cao đến Thấp</option>
                  <option>Phổ Biến Nhất</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {userProducts.map((p) => <ProductCard key={p.id} {...p} />)}
              </div>
            </div>
          )}

          {/* ── WISHLIST TAB ── */}
          {activeTab === 'wishlist' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Danh Sách Yêu Thích ({wishlistProducts.length})</h2>
                <div className="text-sm text-gray-500">
                  {wishlistProducts.filter(p => p.isPublic).length} công khai · {wishlistProducts.filter(p => !p.isPublic).length} riêng tư
                </div>
              </div>
              {wishlistProducts.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có sản phẩm yêu thích</h3>
                  <p className="text-gray-500 text-sm">Khám phá và thêm sản phẩm vào danh sách yêu thích của bạn</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {wishlistProducts.map((product) => (
                    <div key={product.id} className="relative group">
                      <ProductCard {...product} />
                      {/* Control buttons overlay */}
                      {!publicViewMode && (
                        <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleWishlistPublic(product.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all ${
                              product.isPublic
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-800 text-white'
                            }`}
                            title={product.isPublic ? 'Công khai' : 'Riêng tư'}
                          >
                            {product.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all"
                            title="Xóa khỏi yêu thích"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === 'security' && (
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
                    className="bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white px-8 py-3 rounded-full hover:shadow-lg transition-all font-semibold"
                  >
                    Cập Nhật Mật Khẩu
                  </button>
                </div>
              </div>

            </div>
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
