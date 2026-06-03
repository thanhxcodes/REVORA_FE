import { useState } from 'react';
import { ShoppingBag, MessageCircle, Star, Zap, Sparkles, User, Filter, Check, Bell, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Notification {
  id: number;
  type: 'comment' | 'buy' | 'credit' | 'follow' | 'view' | 'like' | 'system';
  message: string;
  time: string;
  date: string;
  read: boolean;
  productName?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'buy', message: 'Có người muốn mua Áo Khoác Da Vintage của bạn', time: '14:32', date: '01/06/2026', read: false, productName: 'Áo Khoác Da Vintage' },
  { id: 2, type: 'comment', message: 'Thu Hà đã bình luận: "Bạn có thể giảm giá không?"', time: '14:14', date: '01/06/2026', read: false, productName: 'Giày Nike Air Force 1' },
  { id: 3, type: 'credit', message: 'Gói Credit Nổi Bật của bạn sắp hết hạn — còn 3 ngày', time: '13:00', date: '01/06/2026', read: false },
  { id: 4, type: 'like', message: 'Video của bạn nhận được 200 lượt thích mới 🎉', time: '11:22', date: '01/06/2026', read: true, productName: 'Túi Xách Da Cao Cấp' },
  { id: 5, type: 'follow', message: 'style_hunter99 đã bắt đầu theo dõi bạn', time: '09:45', date: '01/06/2026', read: true },
  { id: 6, type: 'view', message: 'Sản phẩm của bạn đã đạt 1.000 lượt xem — tuyệt vời!', time: '08:15', date: '01/06/2026', read: true, productName: 'Áo Hoodie Supreme' },
  { id: 7, type: 'system', message: 'REVORA ra mắt tính năng mới: Revora Match - tìm outfit hoàn hảo!', time: '16:30', date: '31/05/2026', read: true },
  { id: 8, type: 'buy', message: 'Minh Tú muốn mua Giày Converse Chuck 70 của bạn', time: '15:20', date: '31/05/2026', read: true, productName: 'Giày Converse Chuck 70' },
  { id: 9, type: 'comment', message: 'Lan Anh đã trả lời bình luận của bạn', time: '14:05', date: '31/05/2026', read: true },
  { id: 10, type: 'like', message: '50 người đã thích sản phẩm Áo Khoác Da Vintage', time: '12:40', date: '31/05/2026', read: true, productName: 'Áo Khoác Da Vintage' },
  { id: 11, type: 'credit', message: 'Bạn vừa nạp thành công gói Credit Đăng Tin 7 ngày', time: '10:00', date: '31/05/2026', read: true },
  { id: 12, type: 'follow', message: 'vintage_lover2k đã bắt đầu theo dõi bạn', time: '09:30', date: '30/05/2026', read: true },
  { id: 13, type: 'view', message: 'Sản phẩm Túi Xách Da Cao Cấp đạt 500 lượt xem', time: '18:45', date: '30/05/2026', read: true, productName: 'Túi Xách Da Cao Cấp' },
  { id: 14, type: 'system', message: 'Chương trình khuyến mãi 30% cho gói Credit Nổi Bật - chỉ còn 2 ngày!', time: '08:00', date: '30/05/2026', read: true },
  { id: 15, type: 'buy', message: 'Hoàng Nam muốn mua Áo Hoodie Supreme của bạn', time: '20:15', date: '29/05/2026', read: true, productName: 'Áo Hoodie Supreme' },
];

const NOTIF_ICONS: Record<string, { icon: React.ReactNode; bg: string; label: string }> = {
  buy: { icon: <ShoppingBag className="w-5 h-5 text-green-600" />, bg: 'bg-green-50', label: 'Mua bán' },
  comment: { icon: <MessageCircle className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', label: 'Bình luận' },
  credit: { icon: <Zap className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50', label: 'Credits' },
  like: { icon: <Star className="w-5 h-5 text-pink-600" />, bg: 'bg-pink-50', label: 'Thích' },
  follow: { icon: <User className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50', label: 'Theo dõi' },
  view: { icon: <Sparkles className="w-5 h-5 text-[#2D5A3D]" />, bg: 'bg-green-50', label: 'Lượt xem' },
  system: { icon: <Bell className="w-5 h-5 text-gray-600" />, bg: 'bg-gray-50', label: 'Hệ thống' },
};

type FilterType = 'all' | 'unread' | 'buy' | 'comment' | 'credit' | 'like' | 'follow' | 'view' | 'system';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<FilterType>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  // Group by date
  const groupedNotifications: Record<string, Notification[]> = {};
  filteredNotifications.forEach((n) => {
    if (!groupedNotifications[n.date]) {
      groupedNotifications[n.date] = [];
    }
    groupedNotifications[n.date].push(n);
  });

  const getDateLabel = (date: string) => {
    if (date === '01/06/2026') return 'Hôm nay';
    if (date === '31/05/2026') return 'Hôm qua';
    return date;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
                  {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Bạn đã đọc tất cả thông báo'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center space-x-2 px-4 py-2 bg-[#2D5A3D] text-white rounded-xl hover:bg-[#3D7054] transition-colors text-sm font-semibold"
              >
                <Check className="w-4 h-4" />
                <span>Đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {(['all', 'unread', 'buy', 'comment', 'credit', 'like', 'follow', 'view', 'system'] as const).map((f) => {
              const count = f === 'all'
                ? notifications.length
                : f === 'unread'
                ? unreadCount
                : notifications.filter((n) => n.type === f).length;

              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    filter === f
                      ? 'bg-[#2D5A3D] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>
                    {f === 'all' ? 'Tất cả' : f === 'unread' ? 'Chưa đọc' : NOTIF_ICONS[f]?.label}
                  </span>
                  <span className={`${filter === f ? 'text-white/80' : 'text-gray-400'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {Object.keys(groupedNotifications).length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Không có thông báo</h3>
            <p className="text-gray-500 text-sm">
              {filter === 'unread'
                ? 'Bạn đã đọc tất cả thông báo'
                : `Không có thông báo loại ${filter === 'all' ? 'nào' : NOTIF_ICONS[filter]?.label.toLowerCase()}`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([date, notifs]) => (
              <div key={date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Date header */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700">{getDateLabel(date)}</h3>
                </div>

                {/* Notifications for this date */}
                <div className="divide-y divide-gray-50">
                  {notifs.map((notif) => {
                    const style = NOTIF_ICONS[notif.type] ?? NOTIF_ICONS.view;
                    return (
                      <button
                        key={notif.id}
                        onClick={() => markRead(notif.id)}
                        className={`w-full flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left ${
                          !notif.read ? 'bg-[#2D5A3D]/[0.04]' : ''
                        }`}
                      >
                        <div
                          className={`w-11 h-11 ${style.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}
                        >
                          {style.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm leading-relaxed ${
                              !notif.read ? 'text-gray-900 font-medium' : 'text-gray-600'
                            }`}
                          >
                            {notif.message}
                          </p>
                          {notif.productName && (
                            <p className="text-xs text-[#2D5A3D] mt-1 font-medium">
                              📦 {notif.productName}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs text-gray-400">{notif.time}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              !notif.read
                                ? 'bg-[#2D5A3D] text-white font-semibold'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {!notif.read ? 'Mới' : style.label}
                            </span>
                          </div>
                        </div>
                        {!notif.read && (
                          <div className="w-2.5 h-2.5 bg-[#2D5A3D] rounded-full flex-shrink-0 mt-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
