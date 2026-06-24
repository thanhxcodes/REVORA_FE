import { Search, Bell, Menu, User, LogOut, Sparkles, X, ShoppingBag, MessageCircle, Star, Zap, ListChecks, Heart, Plus, History, BellRing, MessageSquareText, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import authClient from '../../providers/authProvider/authService';
import { getAccessToken } from '../../features/auth/services/tokenService';
import type { User as UserType } from '../../features/auth/types';
import { useUserCreditBatches } from '../../features/credits/hooks/useUserCreditBatches';
import NavbarCreditBadge from './NavbarCreditBadge';
import logoImg from '../../assets/images/logo.jpg';

interface Notification {
  id: string;
  type: 'post' | 'credit' | 'follow' | 'like' | 'system' | 'comment' | 'buy' | 'view' | 'warning';
  title: string;
  message: string;
  time: string;
  read: boolean;
  referenceId?: string;
}

const NOTIF_ICONS: Record<string, { icon: React.ReactNode; bg: string }> = {
  post: { icon: <Sparkles className="w-4 h-4 text-indigo-600" />, bg: 'bg-indigo-50' },
  credit: { icon: <Zap className="w-4 h-4 text-amber-600" />, bg: 'bg-amber-50' },
  like: { icon: <Star className="w-4 h-4 text-pink-600" />, bg: 'bg-pink-50' },
  follow: { icon: <User className="w-4 h-4 text-purple-600" />, bg: 'bg-purple-50' },
  system: { icon: <Bell className="w-4 h-4 text-gray-600" />, bg: 'bg-gray-50' },
  buy: { icon: <ShoppingBag className="w-4 h-4 text-green-600" />, bg: 'bg-green-50' },
  comment: { icon: <MessageCircle className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-50' },
  view: { icon: <Sparkles className="w-4 h-4 text-[#2D5A3D]" />, bg: 'bg-green-50' },
  warning: { icon: <AlertTriangle className="w-4 h-4 text-orange-600" />, bg: 'bg-orange-50' },
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const navigate = useNavigate();

  // --- Real-time Notifications Fetching & SignalR ---
  const fetchNotifications = async () => {
    try {
      const res = await authClient.get('/Notifications');
      if (res.data.success) {
        setNotifications(res.data.data.slice(0, 10)); // Take top 10 for navbar
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
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
    fetchNotifications();
    fetchUnreadChat();

    // Listen to custom window event if triggered locally
    const handleLocalInterest = () => fetchNotifications();
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
            fetchNotifications();
            window.dispatchEvent(new Event('revora_match_interest_received'));
          });
          hubConnection!.on('NewNotification', (newNotif: Notification) => {
            setNotifications(prev => [newNotif, ...prev]);
          });
          hubConnection!.on('InterestNotificationRemoved', (data: any) => {
            window.dispatchEvent(new CustomEvent('revora_interest_notification_removed', { detail: data }));
          });
          hubConnection!.on('ReceiveMessage', () => {
            fetchUnreadChat();
          });
          hubConnection!.on('MatchStatsUpdated', (payload: any) => {
            window.dispatchEvent(new CustomEvent('revora_match_stats_updated', { detail: payload }));
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
          hubConnection!.on('MatchCancelled', (data: any) => {
            window.dispatchEvent(new CustomEvent('revora_match_cancelled', { detail: data }));
          });
          hubConnection!.on('SessionTerminated', (data: any) => {
            window.dispatchEvent(new CustomEvent('revora_session_terminated', { detail: data }));
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

  const markAllRead = async () => {
    try {
      await authClient.put('/Notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  const markRead = async (id: string) => {
    try {
      await authClient.put(`/Notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error('Failed to mark as read', e);
    }
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#244831] shadow-lg">
      {/* Animated Background & Sparkles */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 2px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      >
        <Sparkles className="absolute top-2 left-[20%] w-4 h-4 text-emerald-300 opacity-50 animate-pulse delay-150" />
        <Sparkles className="absolute top-4 right-[25%] w-3 h-3 text-emerald-400 opacity-70 animate-bounce delay-700" />
        <Sparkles className="absolute top-10 right-[15%] w-2 h-2 text-emerald-500 opacity-40 animate-pulse delay-500" />
      </div>

      <div className="flex items-center justify-between h-16 px-4 relative z-10">
        {/* Left: Menu + Logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2.5" onClick={closeAll}>
            <img src={logoImg} alt="REVORA Logo" className="w-9 h-9 rounded-full object-cover" />
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
            <div className="hidden md:flex items-center relative">
              <style>{`
                @keyframes shimmer {
                  0% { transform: translateX(-150%) skewX(-20deg); }
                  100% { transform: translateX(150%) skewX(-20deg); }
                }
                .btn-sparkle::after {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 50%;
                  height: 100%;
                  background: linear-gradient(to right, transparent, rgba(255,255,255,0.6), transparent);
                  transform: translateX(-150%) skewX(-20deg);
                  animation: shimmer 2s infinite;
                }
              `}</style>
              <Link
                to="/sell"
                className="btn-sparkle relative bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white px-6 py-2 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.7)] hover:shadow-[0_0_25px_rgba(245,158,11,0.9)] hover:scale-105 transition-all duration-300 text-[15px] font-bold flex items-center gap-1.5 border border-amber-300/50 overflow-hidden"
                onClick={closeAll}
              >
                <Sparkles className="w-4 h-4 text-yellow-100 animate-pulse" />
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
                            onClick={() => {
                              markRead(notif.id);
                              if (notif.referenceId) {
                                if (notif.referenceId.startsWith('/')) {
                                  navigate(notif.referenceId);
                                  setShowNotifications(false);
                                } else if (notif.type === 'post') {
                                  navigate(`/product/${notif.referenceId}`);
                                  setShowNotifications(false);
                                } else if (notif.type === 'comment' || notif.type === 'like') {
                                  if (notif.title?.includes('Shorts')) {
                                    navigate(`/shorts`);
                                    setShowNotifications(false);
                                  } else {
                                    navigate(`/product/${notif.referenceId}`);
                                    setShowNotifications(false);
                                  }
                                }
                              }
                            }}
                            className={`w-full flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left ${!notif.read ? 'bg-[#2D5A3D]/[0.04]' : ''
                              }`}
                          >
                            <div
                              className={`w-9 h-9 ${style.bg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
                            >
                              {style.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm leading-snug font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-700'
                                  }`}
                              >
                                {notif.title}
                              </p>
                              <p
                                className={`text-sm leading-snug mt-0.5 ${!notif.read ? 'text-gray-800' : 'text-gray-500'
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
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors font-semibold text-sm overflow-hidden border border-white/20 ${currentUser?.avatarUrl ? 'bg-transparent' : 'bg-white/25 hover:bg-white/35'
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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden ${currentUser?.avatarUrl ? 'bg-transparent' : 'bg-gradient-to-br from-[#2D5A3D] to-[#3D7054]'
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
