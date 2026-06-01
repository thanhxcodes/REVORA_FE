import { useState } from 'react';
import { Send, Bell, Users, Calendar, Gift, AlertTriangle, Megaphone, Star, Tag, Trash2, Clock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

type NotifType = 'promotion' | 'announcement' | 'warning' | 'event' | 'feature';
type NotifTarget = 'all' | 'active' | 'new' | 'posting_users' | 'featured_users';

interface NotifTemplate {
  id: string;
  label: string;
  icon: typeof Bell;
  color: string;
  bg: string;
  sampleTitle: string;
  sampleContent: string;
}

interface SentNotif {
  id: string;
  title: string;
  content: string;
  type: NotifType;
  target: NotifTarget;
  sentAt: string;
  recipientCount: number;
  readRate: number;
}

const templates: NotifTemplate[] = [
  { id: 'promotion', label: 'Khuyến mãi', icon: Tag, color: 'text-[#C4603A]', bg: 'bg-orange-50', sampleTitle: '🎉 Sale lớn tháng 6 - Giảm đến 30% gói credits!', sampleContent: 'Chào bạn! Nhân dịp Hè 2024, REVORA tặng ngay ưu đãi giảm giá đặc biệt cho tất cả gói credits. Đừng bỏ lỡ cơ hội bán hàng hiệu quả hơn với chi phí thấp nhất!' },
  { id: 'announcement', label: 'Thông báo', icon: Megaphone, color: 'text-blue-600', bg: 'bg-blue-50', sampleTitle: '📢 Cập nhật chính sách đăng tin mới', sampleContent: 'REVORA vừa cập nhật chính sách đăng tin để đảm bảo trải nghiệm mua bán tốt hơn cho cộng đồng. Vui lòng đọc kỹ các điều khoản mới trước khi đăng sản phẩm.' },
  { id: 'warning', label: 'Cảnh báo', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', sampleTitle: '⚠️ Lưu ý bảo mật tài khoản của bạn', sampleContent: 'Chúng tôi phát hiện hoạt động đăng nhập bất thường. Vui lòng kiểm tra lại bảo mật tài khoản và thay đổi mật khẩu nếu cần thiết.' },
  { id: 'event', label: 'Sự kiện', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', sampleTitle: '🎊 Flash Sale 12/12 - REVORA Birthday!', sampleContent: 'REVORA tròn 1 tuổi! Để kỷ niệm, chúng tôi tổ chức Flash Sale 12/12 với hàng ngàn sản phẩm thời trang second-hand giá cực ưu đãi.' },
  { id: 'feature', label: 'Tính năng mới', icon: Star, color: 'text-[#2D5A3D]', bg: 'bg-green-50', sampleTitle: '✨ Ra mắt tính năng REVORA Match!', sampleContent: 'Chúng tôi vừa ra mắt tính năng REVORA Match - giúp bạn tìm kiếm phong cách phù hợp dựa trên AI. Hãy thử ngay!' },
];

const targetOptions: { value: NotifTarget; label: string; desc: string; count: number }[] = [
  { value: 'all', label: 'Tất cả người dùng', desc: 'Gửi đến toàn bộ tài khoản', count: 1234 },
  { value: 'active', label: 'Người dùng hoạt động', desc: 'Đăng nhập trong 30 ngày qua', count: 892 },
  { value: 'new', label: 'Người dùng mới', desc: 'Tham gia trong 7 ngày qua', count: 156 },
  { value: 'posting_users', label: 'Người dùng có Credit Đăng Tin', desc: 'Đang có credit đăng tin', count: 547 },
  { value: 'featured_users', label: 'Người dùng có Credit Nổi Bật', desc: 'Đang có credit nổi bật', count: 213 },
];

const mockSentNotifs: SentNotif[] = [
  { id: 'N001', title: '🎉 Chào mừng tháng 5 - Ưu đãi đặc biệt!', content: 'Tháng 5 này REVORA tặng bạn 10 credits đăng tin miễn phí khi nạp bất kỳ gói nào.', type: 'promotion', target: 'all', sentAt: '01/05/2024 09:00', recipientCount: 1234, readRate: 68 },
  { id: 'N002', title: '📢 Thay đổi giao diện Shorts mới!', content: 'Chúng tôi đã cập nhật trang Shorts với nút Xem SP giúp bạn xem sản phẩm dễ dàng hơn.', type: 'feature', target: 'all', sentAt: '20/04/2024 14:30', recipientCount: 1234, readRate: 54 },
  { id: 'N003', title: '⚠️ Nhắc nhở: Gia hạn gói trước khi hết hạn', content: 'Gói của bạn sắp hết hạn trong 3 ngày. Gia hạn ngay để không gián đoạn dịch vụ.', type: 'warning', target: 'posting_users', sentAt: '15/04/2024 10:00', recipientCount: 547, readRate: 79 },
];

export default function AdminNotificationsPage() {
  const [selectedType, setSelectedType] = useState<NotifType>('announcement');
  const [selectedTarget, setSelectedTarget] = useState<NotifTarget>('all');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [sentNotifs, setSentNotifs] = useState<SentNotif[]>(mockSentNotifs);

  const currentTemplate = templates.find(t => t.id === selectedType)!;
  const currentTarget = targetOptions.find(t => t.value === selectedTarget)!;
  const TemplateIcon = currentTemplate.icon;

  const applyTemplate = (t: NotifTemplate) => {
    setSelectedType(t.id as NotifType);
    setTitle(t.sampleTitle);
    setContent(t.sampleContent);
  };

  const handleSend = () => {
    if (!title.trim() || !content.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      const newNotif: SentNotif = {
        id: `N${Date.now()}`,
        title,
        content,
        type: selectedType,
        target: selectedTarget,
        sentAt: new Date().toLocaleString('vi-VN'),
        recipientCount: currentTarget.count,
        readRate: 0,
      };
      setSentNotifs([newNotif, ...sentNotifs]);
      setTitle('');
      setContent('');
      setTimeout(() => setSent(false), 3000);
    }, 1500);
  };

  const typeConfig: Record<NotifType, { label: string; color: string }> = {
    promotion: { label: 'Khuyến mãi', color: 'text-[#C4603A]' },
    announcement: { label: 'Thông báo', color: 'text-blue-600' },
    warning: { label: 'Cảnh báo', color: 'text-yellow-600' },
    event: { label: 'Sự kiện', color: 'text-purple-600' },
    feature: { label: 'Tính năng mới', color: 'text-[#2D5A3D]' },
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl text-gray-900 mb-2">Gửi Thông Báo</h2>
        <p className="text-gray-600">Gửi thông báo quan trọng đến tất cả hoặc nhóm người dùng cụ thể</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Compose Panel */}
        <div className="xl:col-span-2 space-y-6">
          {/* Type Templates */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-[#2D5A3D]" />
              <span>Loại thông báo</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {templates.map((t) => {
                const TIcon = t.icon;
                const isActive = selectedType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className={`flex flex-col items-center space-y-1.5 p-3 rounded-xl border-2 transition-all text-xs font-medium ${
                      isActive ? `${t.bg} border-current ${t.color}` : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <TIcon className={`w-5 h-5 ${isActive ? t.color : 'text-gray-400'}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compose Form */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <h3 className="text-base font-semibold text-gray-800 flex items-center space-x-2">
              <Megaphone className="w-5 h-5 text-[#2D5A3D]" />
              <span>Soạn thông báo</span>
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề thông báo *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề thông báo..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung thông báo đầy đủ..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] text-sm resize-none"
              />
              <div className="text-right text-xs text-gray-400 mt-1">{content.length}/500 ký tự</div>
            </div>

            {/* Schedule toggle */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setScheduleMode(!scheduleMode)}
                className={`relative w-10 h-5 rounded-full transition-colors ${scheduleMode ? 'bg-[#2D5A3D]' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${scheduleMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm text-gray-700">Hẹn giờ gửi</span>
              {scheduleMode && (
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D5A3D] text-sm"
                />
              )}
            </div>
          </div>

          {/* Preview */}
          {(title || content) && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Xem trước thông báo</h3>
              <div className={`${currentTemplate.bg} border border-current/20 rounded-2xl p-4`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-9 h-9 rounded-xl ${currentTemplate.bg} border border-current/10 flex items-center justify-center flex-shrink-0`}>
                    <TemplateIcon className={`w-5 h-5 ${currentTemplate.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{title || 'Tiêu đề thông báo'}</div>
                    <div className="text-xs text-gray-600 mt-1 leading-relaxed">{content || 'Nội dung thông báo...'}</div>
                    <div className="text-xs text-gray-400 mt-1.5">Vừa xong · REVORA Admin</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Target Selector */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#2D5A3D]" />
              <span>Đối tượng nhận</span>
            </h3>
            <div className="space-y-2">
              {targetOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedTarget(opt.value)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    selectedTarget === opt.value
                      ? 'border-[#2D5A3D] bg-[#2D5A3D]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{opt.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                    </div>
                    <div className={`text-sm font-bold ${selectedTarget === opt.value ? 'text-[#2D5A3D]' : 'text-gray-400'}`}>
                      {opt.count.toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary + Send */}
          <div className="bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-4">Tổng kết gửi</h3>
            <div className="space-y-2 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-white/70">Loại:</span>
                <span className="font-medium">{currentTemplate.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Đối tượng:</span>
                <span className="font-medium">{currentTarget.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Người nhận:</span>
                <span className="font-bold text-lg">{currentTarget.count.toLocaleString()}</span>
              </div>
              {scheduleMode && scheduledAt && (
                <div className="flex justify-between">
                  <span className="text-white/70">Hẹn giờ:</span>
                  <span className="font-medium text-xs">{new Date(scheduledAt).toLocaleString('vi-VN')}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleSend}
              disabled={!title.trim() || !content.trim() || sending}
              className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                sent
                  ? 'bg-green-400 text-white'
                  : !title.trim() || !content.trim()
                  ? 'bg-white/20 text-white/50 cursor-not-allowed'
                  : 'bg-white text-[#2D5A3D] hover:bg-white/90'
              }`}
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#2D5A3D]/30 border-t-[#2D5A3D] rounded-full animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : sent ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Đã gửi thành công!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{scheduleMode ? 'Hẹn gửi thông báo' : 'Gửi ngay'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sent History */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 rounded-2xl transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#2D5A3D]" />
            <h3 className="text-base font-semibold text-gray-800">Lịch sử thông báo đã gửi</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{sentNotifs.length}</span>
          </div>
          {showHistory ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {showHistory && (
          <div className="border-t border-gray-200">
            <div className="divide-y divide-gray-100">
              {sentNotifs.map((notif) => {
                const tc = typeConfig[notif.type];
                return (
                  <div key={notif.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-xs font-medium ${tc.color}`}>{tc.label}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-500">{notif.sentAt}</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 truncate">{notif.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notif.content}</div>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Users className="w-3.5 h-3.5" />
                            <span>{notif.recipientCount.toLocaleString()} người nhận</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            <span>Tỷ lệ đọc: {notif.readRate}%</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSentNotifs(sentNotifs.filter(n => n.id !== notif.id))}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
