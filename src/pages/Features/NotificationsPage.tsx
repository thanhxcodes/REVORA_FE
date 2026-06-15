import React, { useState, useEffect } from 'react';
import { ShoppingBag, MessageCircle, Star, Zap, Sparkles, User, Filter, Check, Bell, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '../../providers/authProvider/authService';

interface Notification {
  id: string;
  type: 'post' | 'credit' | 'follow' | 'like' | 'system' | 'comment' | 'buy' | 'view' | 'warning';
  title: string;
  message: string;
  time: string;
  read: boolean;
  referenceId?: string;
}

const NOTIF_ICONS: Record<string, { icon: React.ReactNode; bg: string; label: string }> = {
  post: { icon: <Sparkles className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50', label: 'Đăng tin' },
  credit: { icon: <Zap className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50', label: 'Nạp Credit' },
  like: { icon: <Star className="w-5 h-5 text-pink-600" />, bg: 'bg-pink-50', label: 'Lượt tim' },
  follow: { icon: <User className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50', label: 'Theo dõi' },
  system: { icon: <Bell className="w-5 h-5 text-gray-600" />, bg: 'bg-gray-50', label: 'Hệ thống' },
  buy: { icon: <ShoppingBag className="w-5 h-5 text-green-600" />, bg: 'bg-green-50', label: 'Mua bán' },
  comment: { icon: <MessageCircle className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', label: 'Bình luận' },
  view: { icon: <Sparkles className="w-5 h-5 text-[#2D5A3D]" />, bg: 'bg-green-50', label: 'Lượt xem' },
  warning: { icon: <AlertTriangle className="w-5 h-5 text-orange-600" />, bg: 'bg-orange-50', label: 'Cảnh báo' },
};

type FilterType = 'all' | 'unread' | 'post' | 'credit' | 'like' | 'follow' | 'system' | 'comment' | 'buy' | 'view' | 'warning';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await authClient.get('/Notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      await authClient.put('/Notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const markRead = async (id: string) => {
    try {
      await authClient.put(`/Notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link
                to="/"
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="w-6 h-6 text-[#2D5A3D]" />
                  Tất Cả Thông Báo
                </h1>
                <p className="text-gray-600 text-sm mt-0.5">
                  {unreadCount > 0 ? (
                    <span><span className="font-semibold text-[#2D5A3D]">{unreadCount}</span> thông báo chưa đọc</span>
                  ) : (
                    "Bạn đã đọc tất cả thông báo"
                  )}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center space-x-2 px-4 py-2 bg-[#2D5A3D] hover:bg-green-800 text-white rounded-full transition-colors text-sm font-medium"
              >
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0 mr-1" />
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label={`Tất cả (${notifications.length})`} />
            <FilterButton active={filter === 'unread'} onClick={() => setFilter('unread')} label={`Chưa đọc (${unreadCount})`} />
            
            <div className="w-px h-6 bg-gray-300 mx-2 flex-shrink-0"></div>
            
            {/* Display important types first even if count is 0, to match requirements */}
            {['post', 'credit', 'follow', 'like', 'system'].map((key) => {
              const count = notifications.filter(n => n.type === key).length;
              const config = NOTIF_ICONS[key];
              return (
                <FilterButton 
                  key={key}
                  active={filter === key as FilterType} 
                  onClick={() => setFilter(key as FilterType)} 
                  label={`${config.label} (${count})`} 
                />
              );
            })}
            
            {/* Display other types only if they have notifications */}
            {['buy', 'comment', 'view', 'warning'].map((key) => {
              const count = notifications.filter(n => n.type === key).length;
              if (count === 0) return null;
              const config = NOTIF_ICONS[key];
              return (
                <FilterButton 
                  key={key}
                  active={filter === key as FilterType} 
                  onClick={() => setFilter(key as FilterType)} 
                  label={`${config.label} (${count})`} 
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Không có thông báo nào</h3>
            <p className="text-gray-500">Bạn đã xem hết tất cả thông báo trong mục này.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notif) => {
                  const iconConfig = NOTIF_ICONS[notif.type] || NOTIF_ICONS['system'];
                  
                  return (
                    <div 
                      key={notif.id} 
                      className={`p-4 sm:p-5 transition-colors cursor-pointer relative group ${
                        notif.read ? 'bg-white hover:bg-gray-50' : 'bg-green-50/30 hover:bg-green-50/50'
                      }`}
                      onClick={() => {
                        if (!notif.read) markRead(notif.id);
                        if (notif.referenceId) {
                          if (notif.referenceId.startsWith('/')) {
                            navigate(notif.referenceId);
                          } else if (notif.type === 'post') {
                            navigate(`/product/${notif.referenceId}`);
                          } else if (notif.type === 'comment' || notif.type === 'like') {
                            if (notif.title?.includes('Shorts')) {
                              navigate(`/shorts`);
                            } else {
                              navigate(`/product/${notif.referenceId}`);
                            }
                          }
                        }
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconConfig.bg}`}>
                          {iconConfig.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0 pr-8">
                          <p className={`text-base font-semibold mb-0.5 ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notif.title}
                          </p>
                          <p className={`text-sm leading-snug mb-1 ${notif.read ? 'text-gray-500' : 'text-gray-800'}`}>
                            {notif.message}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                              {notif.time}
                              {!notif.read && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2D5A3D] text-white uppercase tracking-wider">
                                  Mới
                                </span>
                              )}
                            </span>
                            
                            {notif.referenceId && (
                              <span className="text-xs font-medium text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                {notif.referenceId}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Unread indicator dot */}
                        {!notif.read && (
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#2D5A3D] rounded-full"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
        active
          ? 'bg-[#2D5A3D] text-white shadow-md'
          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
      }`}
    >
      {label}
    </button>
  );
}
