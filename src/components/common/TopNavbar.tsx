import { Search, Bell, Menu, User, LogOut, Sparkles, X, ShoppingBag, MessageCircle, Star, Zap, ListChecks, Heart, Plus, History, BellRing, MessageSquareText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import authClient from '../../providers/authProvider/authService';
import { getAccessToken } from '../../features/auth/services/tokenService';
import type { User as UserType } from '../../features/auth/types';
import { useUserCreditBatches } from '../../features/credits/hooks/useUserCreditBatches';
import NavbarCreditBadge from './NavbarCreditBadge';
import logoImg from '../../assets/images/logo.png';

interface Notification {
  id: number;
  type: 'comment' | 'buy' | 'credit' | 'follow' | 'view' | 'like';
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'buy',
    message: 'Có người muốn mua Áo Khoác Da Vintage của bạn',
    time: '2 phút trước',
    read: false,
  },
  {
    id: 2,
    type: 'comment',
    message: 'Thu Hà đã bình luận: "Bạn có thể giảm giá không?"',
    time: '18 phút trước',
    read: false,
  },
  {
    id: 3,
    type: 'credit',
    message: 'Gói Credit Nổi Bật của bạn sắp hết hạn — còn 3 ngày',
    time: '1 giờ trước',
    read: false,
  },
  {
    id: 4,
    type: 'like',
    message: 'Video của bạn nhận được 200 lượt thích mới 🎉',
    time: '3 giờ trước',
    read: true,
  },
  {
    id: 5,
    type: 'follow',
    message: 'style_hunter99 đã bắt đầu theo dõi bạn',
    time: '5 giờ trước',
    read: true,
  },
  {
    id: 6,
    type: 'view',
    message: 'Sản phẩm của bạn đã đạt 1.000 lượt xem — tuyệt vời!',
    time: '1 ngày trước',
    read: true,
  },
];

const NOTIF_ICONS: Record<string, { icon: React.ReactNode; bg: string }> = {
  buy: { icon: <ShoppingBag className="w-4 h-4 text-[#2D5A3D]" />, bg: 'bg-red-50' },
  comment: { icon: <MessageCircle className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-50' },
  credit: { icon: <Zap className="w-4 h-4 text-amber-600" />, bg: 'bg-amber-50' },
  like: { icon: <Star className="w-4 h-4 text-pink-600" />, bg: 'bg-pink-50' },
  follow: { icon: <User className="w-4 h-4 text-purple-600" />, bg: 'bg-purple-50' },
  view: { icon: <Sparkles className="w-4 h-4 text-green-600" />, bg: 'bg-green-50' },
};

import { useWishlist } from '../../providers/wishlistProvider/WishlistContext';

interface TopNavbarProps {
  onMenuToggle: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  currentUser?: UserType | null;
  /** @deprecated use onLogout instead */
  setIsLoggedIn?: (value: boolean) => void;
}

export default function TopNavbar({
  onMenuToggle,
  isLoggedIn = true,
  onLogout,
  currentUser,
  setIsLoggedIn,
}: TopNavbarProps) {
  const { batches: userCreditBatches } = useUserCreditBatches(isLoggedIn);
  const { wishlistIds } = useWishlist();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const navigate = useNavigate();

  // --- Real-time Notifications Fetching & SignalR ---
  const fetchInterestInbox = async () => {
    try {
      const res = await authClient.get('/match-trade/interest-inbox');
      if (res.data.success && Array.isArray(res.data.data)) {
        const mappedNotifs: Notification[] = res.data.data.map((item: any) => ({
          id: item.notificationId || Math.random(),
          type: 'like',
          message: `${item.interestedUserName || 'Ai đó'} đã thả tym sản phẩm của bạn`,
          time: new Date(item.createdAt).toLocaleString('vi-VN'),
          read: item.isRead
        }));
        // Merge with mock or replace. Let's just replace the MOCK entirely with real data for 'like' type, 
        // or prepend to MOCK. We'll prepend for demo.
        setNotifications((prev) => {
          const others = prev.filter(p => p.type !== 'like');
          return [...mappedNotifs, ...others];
        });
      }
    } catch (e) {
      console.error('Failed to fetch interest inbox', e);
    }
  };

  const fetchUnreadChat = async () => {
    try {
      const res = await authClient.get('/Chat/conversations');
      if (res.data.success) {
        const count = res.data.data.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
        setUnreadChatCount(count);
      }
    } catch (e) {
      console.error('Failed to fetch unread chat count', e);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    
    // Initial fetch
    fetchInterestInbox();
    fetchUnreadChat();

    // Listen to custom window event if triggered locally
    const handleLocalInterest = () => fetchInterestInbox();
    const handleChatUpdate = () => fetchUnreadChat();
    window.addEventListener('revora_match_interest_received', handleLocalInterest);
    window.addEventListener('chat_update', handleChatUpdate);

    // Global SignalR Connection for the Header (if they aren't on MatchPage)
    const token = getAccessToken();
    let hubConnection: signalR.HubConnection | null = null;
    
    if (token) {
      const hostUrl = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:7015/api/v1').replace('/api/v1', '');
      hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${hostUrl}/chatHub?access_token=${token}`)
        .withAutomaticReconnect()
        .build();

      hubConnection.start()
        .then(() => {
          hubConnection!.on('InterestNotificationReceived', () => {
            fetchInterestInbox();
            window.dispatchEvent(new Event('revora_match_interest_received'));
          });
          hubConnection!.on('ReceiveMessage', () => {
            fetchUnreadChat();
          });
          hubConnection!.on('MatchPoolUpdated', () => {
            window.dispatchEvent(new Event('revora_match_pool_updated'));
          });
          hubConnection!.on('ProductsRemoved', (productIds: number[]) => {
            window.dispatchEvent(new CustomEvent('revora_match_products_removed', { detail: productIds }));
          });
          hubConnection!.on('MutualMatchCreated', (matchSummary: any) => {
            window.dispatchEvent(new CustomEvent('revora_mutual_match_created', { detail: matchSummary }));
          });
          hubConnection!.on('PartnerNegotiateConfirmed', (data: any) => {
            window.dispatchEvent(new CustomEvent('revora_trade_partner_negotiated', { detail: data }));
          });
          hubConnection!.on('ChatCreated', (data: any) => {
            window.dispatchEvent(new CustomEvent('revora_trade_chat_created', { detail: data }));
          });
          hubConnection!.on('TradeCancelled', (data: any) => {
            window.dispatchEvent(new CustomEvent('revora_trade_cancelled', { detail: data }));
          });
        })
        .catch(err => console.error('SignalR Header connection failure: ', err));
    }

    return () => {
      window.removeEventListener('revora_match_interest_received', handleLocalInterest);
      window.removeEventListener('chat_update', handleChatUpdate);
      if (hubConnection) {
        hubConnection.stop();
      }
    };
  }, [isLoggedIn]);
  // ------------------------------------------------

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    else if (setIsLoggedIn) setIsLoggedIn(false);
    setShowUserMenu(false);
  };

  const closeAll = () => {
    setShowUserMenu(false);
    setShowNotifications(false);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/all-products?search=${encodeURIComponent(searchQuery.trim())}`);
      closeAll();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#2D5A3D] shadow-lg">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left: Menu + Logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2.5" onClick={closeAll}>
            <img src={logoImg} alt="REVORA Logo" className="w-9 h-9 rounded-full" />
            <div className="flex flex-col leading-none">
              <span className="text-white text-xl font-bold tracking-widest" style={{ fontFamily: 'Raleway, sans-serif', letterSpacing: '0.22em' }}>REVORA</span>
              <span className="text-white/50 text-[8px] tracking-[0.18em] uppercase">Revive Your Aura</span>
            </div>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm thời trang..."
              className="w-full px-4 py-2 pl-10 rounded-full bg-white/10 backdrop-blur-sm text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Right: Actions */}
        {isLoggedIn ? (
          <div className="flex items-center space-x-3">
            {/* Credits badges - gom thành 1 cụm */}
            <div className="hidden lg:flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20">
              <NavbarCreditBadge type="posting" batches={userCreditBatches.posting} />
              <NavbarCreditBadge type="featured" batches={userCreditBatches.featured} />
              <Link
                to="/plans"
                className="w-7 h-7 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition-colors"
                title="Nạp thêm credits"
              >
                <Plus className="w-4 h-4 text-white" />
              </Link>
            </div>

            {/* Nút Đăng tin */}
            <div className="hidden md:flex items-center">
              <Link
                to="/sell"
                className="bg-white text-[#2D5A3D] px-5 py-2 rounded-full hover:shadow-lg transition-all text-sm font-semibold flex items-center gap-1.5"
                onClick={closeAll}
              >
                <Plus className="w-4 h-4" />
                Đăng tin
              </Link>
            </div>

            {/* Nút Liên hệ */}
            <div className="hidden sm:flex items-center">
              <Link
                to="/messages"
                className="relative bg-white text-gray-900 border border-gray-200 px-4 py-[7px] rounded-full hover:bg-gray-100 hover:shadow-md transition-all text-[15px] font-semibold flex items-center gap-2"
                onClick={closeAll}
              >
                <MessageCircle className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
                Liên hệ
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-[#C4603A] rounded-full text-[11px] flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
                    {unreadChatCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Wishlist Icon */}
            <Link
              to="/profile?tab=wishlist"
              className="text-white/80 hover:text-white transition-colors relative p-1"
              onClick={closeAll}
            >
              <Heart className="w-6 h-6" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#C4603A] rounded-full text-[10px] flex items-center justify-center text-white font-bold px-0.5 shadow-sm">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            
            {/* Bell / Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="text-white/80 hover:text-white transition-colors relative p-1"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#C4603A] rounded-full text-[10px] flex items-center justify-center text-[#2D5A3D] font-bold px-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 top-12 w-84 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden" style={{ width: '340px' }}>
                    {/* Notification header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm">Thông Báo</h3>
                        {unreadCount > 0 && (
                          <span className="bg-[#2D5A3D] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-[#2D5A3D] hover:underline font-medium"
                          >
                            Đọc tất cả
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Notification list */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                      {notifications.map((notif) => {
                        const style = NOTIF_ICONS[notif.type] ?? NOTIF_ICONS.view;
                        return (
                          <button
                            key={notif.id}
                            onClick={() => markRead(notif.id)}
                            className={`w-full flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left ${
                              !notif.read ? 'bg-[#2D5A3D]/[0.04]' : ''
                            }`}
                          >
                            <div
                              className={`w-9 h-9 ${style.bg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
                            >
                              {style.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm leading-snug ${
                                  !notif.read ? 'text-gray-900 font-medium' : 'text-gray-600'
                                }`}
                              >
                                {notif.message}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-1">{notif.time}</p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 bg-[#2D5A3D] rounded-full flex-shrink-0 mt-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="px-5 py-3 border-t border-gray-100 text-center">
                      <Link
                        to="/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs text-[#2D5A3D] hover:underline font-medium"
                      >
                        Xem tất cả thông báo
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User avatar menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors font-semibold text-sm overflow-hidden border border-white/20 ${
                  currentUser?.avatarUrl ? 'bg-transparent' : 'bg-white/25 hover:bg-white/35'
                }`}
              >
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  currentUser?.avatar ?? 'U'
                )}
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {/* User info header */}
                    <div className="px-4 py-4 bg-gradient-to-r from-[#2D5A3D]/8 to-[#3D7054]/8 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden ${
                          currentUser?.avatarUrl ? 'bg-transparent' : 'bg-gradient-to-br from-[#2D5A3D] to-[#3D7054]'
                        }`}>
                          {currentUser?.avatarUrl ? (
                            <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            currentUser?.avatar ?? 'U'
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {currentUser?.name ?? 'Người dùng'}
                          </div>
                          <div className="text-xs text-gray-500">@{currentUser?.username ?? 'user'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/plans"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Sparkles className="w-4 h-4 text-[#2D5A3D]" />
                        <span className="text-gray-900 text-sm">Nạp Credits</span>
                      </Link>
                                            <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 text-sm">Trang Cá Nhân</span>
                      </Link>
                      <Link
                        to="/manage-products"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <ListChecks className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900 text-sm">Quản Lí Tin</span>
                      </Link>
                    </div>

                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span className="text-red-600 text-sm font-medium">Đăng Xuất</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-white px-5 py-2 rounded-full hover:bg-white/10 transition-all text-sm"
            >
              Đăng Nhập
            </Link>
            <Link
              to="/login"
              className="bg-white text-[#2D5A3D] px-5 py-2 rounded-full hover:shadow-lg transition-all text-sm font-semibold"
            >
              Đăng Ký
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
