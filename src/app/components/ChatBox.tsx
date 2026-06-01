import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ChevronLeft, Check, CheckCheck, ImagePlus, Minus } from 'lucide-react';

interface User {
  username: string;
  name: string;
  avatar: string;
  role: 'user' | 'admin';
}

interface ProductRef {
  id: string;
  name: string;
  price: string;
  image: string;
}

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  read: boolean;
  product?: ProductRef;
  viaZalo?: boolean;
  imageUrl?: string;
}

const OTHER_USER: Record<string, { username: string; name: string; avatar: string; status: string }> = {
  user1: { username: 'user2', name: 'Thu Hà', avatar: 'T', status: 'Đang hoạt động' },
  user2: { username: 'user1', name: 'Minh Anh', avatar: 'M', status: 'Hoạt động 5 phút trước' },
};

const INITIAL_MESSAGES: Message[] = [
  { id: 1, sender: 'user2', text: 'Chào bạn! Áo khoác da vintage còn hàng không?', time: '09:30', read: true },
  { id: 2, sender: 'user1', text: 'Còn bạn ơi! Còn 1 cái size M và 1 cái size L nha 😊', time: '09:32', read: true },
  { id: 3, sender: 'user2', text: 'Cho mình xin ảnh thật nhé? Và giá có thể thương lượng không?', time: '09:33', read: true },
  { id: 4, sender: 'user1', text: 'Được bạn! Mình có thể bớt 100k nếu bạn mua luôn hôm nay 🎉', time: '09:35', read: true },
  { id: 5, sender: 'user2', text: 'Ok mình chốt size M nhé! Bạn ship về Hà Nội không?', time: '09:36', read: true },
  { id: 6, sender: 'user1', text: 'Ship toàn quốc bạn ơi, phí ship tính riêng nha', time: '09:38', read: false },
];

const AUTO_REPLIES = [
  'Mình hiểu rồi, cảm ơn bạn nhiều nhé! 😊',
  'Ok bạn, mình sẽ xem xét và phản hồi sớm',
  'Giá có thể giảm thêm chút không bạn?',
  'Bạn có thể giao hàng không?',
  'Sản phẩm còn bảo hành không ạ?',
  'Cho mình đặt cọc trước được không?',
  'Mình muốn xem thêm ảnh thật nha bạn',
];

interface ChatBoxProps {
  currentUser: User;
}

export default function ChatBox({ currentUser }: ChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeChat, setActiveChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<ProductRef | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const other = OTHER_USER[currentUser.username];
  if (!other) return null;

  const unreadCount = messages.filter(
    (m) => m.sender !== currentUser.username && !m.read
  ).length;
  const lastMessage = messages[messages.length - 1];

  useEffect(() => {
    if (activeChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat, messages.length, isTyping]);

  useEffect(() => {
    if (activeChat) {
      setMessages((prev) =>
        prev.map((m) => (m.sender !== currentUser.username ? { ...m, read: true } : m))
      );
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeChat, currentUser.username]);

  // Listen for "open chat with seller" event from ProductDetailPage
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        seller: { username: string; name: string; avatar: string; phone: string };
        product: ProductRef;
        prefilledMessage: string;
        autoSend: boolean;
        source: 'zalo' | 'chat';
      };
      if (!detail) return;

      setIsOpen(true);
      setIsMinimized(false);
      setActiveChat(true);
      const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      if (detail.autoSend) {
        // Zalo: tự động gửi tin nhắn với sản phẩm đính kèm
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: currentUser.username,
            text: detail.prefilledMessage,
            time,
            read: false,
            product: detail.product,
            viaZalo: true,
          },
        ]);
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const replyTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: detail.seller.username,
              text: `Chào bạn! Sản phẩm vẫn còn nha. Bạn cần mình tư vấn thêm gì không? 😊`,
              time: replyTime,
              read: true,
            },
          ]);
        }, 1500);
      } else {
        // Chat: prefill input, gắn sản phẩm để chờ user gửi
        setInputText(detail.prefilledMessage);
        setPendingProduct(detail.product);
      }
    };
    window.addEventListener('revora:openChat', handler);
    return () => window.removeEventListener('revora:openChat', handler);
  }, [currentUser.username]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: currentUser.username, text: '📷 Ảnh', time, read: false, imageUrl },
      ]);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: other.username, text: 'Ảnh đẹp quá bạn ơi! 😍', time: replyTime, read: true },
        ]);
      }, 1500 + Math.random() * 1000);
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = () => {
    if (!inputText.trim() || isTyping) return;
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: currentUser.username,
        text: inputText.trim(),
        time,
        read: false,
        product: pendingProduct ?? undefined,
      },
    ]);
    setInputText('');
    setPendingProduct(null);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const replyTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: other.username, text: reply, time: replyTime, read: true },
      ]);
    }, 1500 + Math.random() * 1000);
  };

  return (
    <>
      {/* Chat panel — fixed position bottom-right */}
      {isOpen && !isMinimized && (
        <div
          className="fixed bottom-24 right-6 w-80 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col z-50"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] px-4 py-3 flex items-center justify-between flex-shrink-0">
            {activeChat ? (
              <div className="flex items-center flex-1 min-w-0">
                <button
                  onClick={() => setActiveChat(false)}
                  className="text-white/80 hover:text-white transition-colors mr-2 flex-shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 bg-white/25 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mr-2">
                  {other.avatar}
                </div>
                <div className="min-w-0">
                  <div className="text-white text-sm font-semibold leading-tight">{other.name}</div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span className="text-white/70 text-xs">{other.status}</span>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-white font-semibold text-sm">Tin Nhắn</span>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="text-white/80 hover:text-white transition-colors flex-shrink-0"
                title="Thu nhỏ"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!activeChat ? (
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-2 text-[10px] text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100 font-semibold">
                Cuộc trò chuyện gần đây
              </div>
              <button
                onClick={() => setActiveChat(true)}
                className="w-full flex items-center space-x-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {other.avatar}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">{other.name}</div>
                  <div className="text-gray-500 text-xs truncate mt-0.5 leading-tight">
                    {lastMessage?.sender === currentUser.username ? 'Bạn: ' : ''}
                    {lastMessage?.text}
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 ml-2">
                  <span className="text-gray-400 text-[10px]">{lastMessage?.time}</span>
                  {unreadCount > 0 && (
                    <span className="mt-1.5 min-w-[20px] h-5 bg-[#2D5A3D] rounded-full text-white text-[10px] flex items-center justify-center px-1 font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </button>
              <div className="px-6 py-8 text-center text-gray-400 text-xs">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Nhắn tin với người bán để trao đổi trực tiếp</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                <div className="flex items-center justify-center">
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Hôm nay</span>
                </div>
                {messages.map((msg) => {
                  const isMe = msg.sender === currentUser.username;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="w-7 h-7 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {other.avatar}
                        </div>
                      )}
                      <div className={`max-w-[72%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-br-sm'
                              : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                          }`}
                        >
                          {msg.product && (
                            <div className={`mb-2 flex items-center gap-2 p-2 rounded-xl ${
                              isMe ? 'bg-white/15' : 'bg-gray-50 border border-gray-100'
                            }`}>
                              <img
                                src={msg.product.image}
                                alt={msg.product.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className={`text-xs font-semibold truncate ${isMe ? 'text-white' : 'text-gray-900'}`}>
                                  {msg.product.name}
                                </div>
                                <div className={`text-[11px] ${isMe ? 'text-white/80' : 'text-[#2D5A3D]'} font-bold`}>
                                  {msg.product.price}
                                </div>
                                {msg.viaZalo && (
                                  <div className={`text-[10px] mt-0.5 ${isMe ? 'text-white/70' : 'text-[#25D366]'}`}>
                                    Liên hệ qua Zalo
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="Sent image"
                              className="max-w-full rounded-lg mb-1"
                            />
                          )}
                          {msg.text}
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[10px] text-gray-400">{msg.time}</span>
                          {isMe && (
                            msg.read
                              ? <CheckCheck className="w-3 h-3 text-[#2D5A3D]" />
                              : <Check className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex items-end gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {other.avatar}
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex space-x-1 items-center h-4">
                        {[0, 150, 300].map((delay) => (
                          <div
                            key={delay}
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              {pendingProduct && (
                <div className="px-3 pt-2 bg-white border-t border-gray-100 flex-shrink-0">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-100 rounded-xl">
                    <img
                      src={pendingProduct.image}
                      alt={pendingProduct.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-gray-900 truncate">{pendingProduct.name}</div>
                      <div className="text-[11px] text-[#2D5A3D] font-bold">{pendingProduct.price}</div>
                    </div>
                    <button
                      onClick={() => setPendingProduct(null)}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
              <div className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 flex-shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isTyping}
                  className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-[#2D5A3D] transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Đăng tải ảnh"
                >
                  <ImagePlus className="w-4 h-4" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/25 text-gray-800 placeholder-gray-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="w-9 h-9 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white hover:shadow-md transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Chat bubble — fixed bottom-right */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow z-50"
        title="Mở chat"
      >
        <MessageCircle className="w-6 h-6" />
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C4603A] rounded-full text-xs flex items-center justify-center text-white font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
    </>
  );
}
