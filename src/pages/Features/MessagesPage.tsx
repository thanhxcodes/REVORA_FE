import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, ChevronLeft, Check, CheckCheck, ImagePlus, MoreVertical, Edit2, Trash2, Ban, Search, Phone, Video, MoreHorizontal, Mail, BellOff, CircleUser } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as signalR from '@microsoft/signalr';
import authClient from '../../providers/authProvider/authService';
import { getAccessToken } from '../../features/auth/services/tokenService';
import { useAuth } from '../../providers/authProvider/AuthContext';

interface ProductRef {
  id: number;
  name: string;
  price: string;
  image: string;
}

interface Message {
  id: number;
  senderId: number;
  receiverId?: number;
  text: string | null;
  time: string;
  read?: boolean;
  isRevoked?: boolean;
  isEdited?: boolean;
  product?: ProductRef;
  viaZalo?: boolean;
  imageUrl?: string | null;
}

interface Conversation {
  conversationId: number;
  lastMessageAt: string;
  unreadCount: number;
  partner: {
    userId: number;
    fullName: string;
    avatarUrl: string;
  };
  lastMessage: {
    content: string | null;
    createdAt: string;
    senderId: number;
    attachmentUrl: string | null;
    isRead?: boolean;
    isRevoked?: boolean;
    isEdited?: boolean;
  } | null;
}

export default function MessagesPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dropdown states
  const [openConvDropdown, setOpenConvDropdown] = useState<number | null>(null);
  const [openMsgDropdown, setOpenMsgDropdown] = useState<number | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<number | null>(null);
  
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeChatRef = useRef<Conversation | null>(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await authClient.get('/Chat/conversations');
      if (res.data.success) {
        setConversations(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch conversations', e);
    }
  }, []);

  const markAsRead = async (partnerId: number) => {
    try {
      await authClient.post(`/Chat/${partnerId}/read`);
      setConversations(prev => prev.map(c => 
        c.partner.userId === partnerId ? { ...c, unreadCount: 0 } : c
      ));
      setMessages(prev => prev.map(m => 
        m.senderId === partnerId ? { ...m, read: true } : m
      ));
    } catch (e) {
      console.error('Failed to mark messages as read', e);
    }
  };

  const markAsUnread = async (e: React.MouseEvent, partnerId: number) => {
    e.stopPropagation();
    setOpenConvDropdown(null);
    try {
      await authClient.post(`/Chat/${partnerId}/unread`);
      fetchConversations();
    } catch (e) {
      console.error('Failed to mark as unread', e);
    }
  };

  const deleteConversation = async (e: React.MouseEvent, partnerId: number) => {
    e.stopPropagation();
    setOpenConvDropdown(null);
    try {
      await authClient.delete(`/Chat/${partnerId}`);
      if (activeChat?.partner.userId === partnerId) {
        setActiveChat(null);
      }
      fetchConversations();
    } catch (e) {
      console.error('Failed to delete conversation', e);
    }
  };

  const revokeMessage = async (msgId: number) => {
    setOpenMsgDropdown(null);
    try {
      const res = await authClient.post(`/Chat/message/${msgId}/revoke`);
      if (res.data.success) {
        setMessages(prev => prev.map(m => m.id === msgId ? res.data.data : m));
        fetchConversations();
      }
    } catch (e: any) {
      console.error('Failed to revoke message', e);
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra khi thu hồi tin nhắn');
    }
  };

  const startEditMessage = (msg: Message) => {
    setOpenMsgDropdown(null);
    setEditingMsgId(msg.id);
    setInputText(msg.text || '');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelEdit = () => {
    setEditingMsgId(null);
    setInputText('');
  };

  const fetchMessages = async (receiverId: number) => {
    try {
      const res = await authClient.get(`/Chat/${receiverId}/messages`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch messages', e);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.partner.userId);
      markAsRead(activeChat.partner.userId);
    }
  }, [activeChat]);

  // Thiết lập SignalR
  useEffect(() => {
    const token = getAccessToken();
    if (!token || !currentUser) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl((import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'https://localhost:7015') + `/chathub?access_token=${token}`)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
    
    newConnection.start()
      .then(() => {
        console.log('Connected to ChatHub');
        
        newConnection.on('ReceiveMessage', (msg: Message) => {
          const currentChat = activeChatRef.current;
          if (currentChat && (
              msg.senderId === currentChat.partner.userId || 
              (msg.senderId === currentUser.id && msg.receiverId === currentChat.partner.userId)
          )) {
            setMessages(prev => {
                if (!prev.find(m => m.id === msg.id)) {
                    return [...prev, msg];
                }
                return prev;
            });
            if (msg.senderId !== currentUser.id) {
                markAsRead(msg.senderId);
            }
          }
          fetchConversations();
        });

        newConnection.on('MessageEdited', (msg: Message) => {
          const currentChat = activeChatRef.current;
          if (currentChat && (msg.senderId === currentChat.partner.userId || (msg.senderId === currentUser.id && msg.receiverId === currentChat.partner.userId))) {
            setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
          }
          fetchConversations();
        });

        newConnection.on('MessageRevoked', (msg: Message) => {
          const currentChat = activeChatRef.current;
          if (currentChat && (msg.senderId === currentChat.partner.userId || (msg.senderId === currentUser.id && msg.receiverId === currentChat.partner.userId))) {
            setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
          }
          fetchConversations();
        });

      })
      .catch(e => console.log('Connection failed: ', e));

    return () => {
      newConnection.stop();
    };
  }, [fetchConversations, currentUser]);

  useEffect(() => {
    if (activeChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat, messages.length, isTyping, editingMsgId]);

  useEffect(() => {
    if (activeChat) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeChat]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat || editingMsgId) return;

    setIsTyping(true);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const uploadRes = await authClient.post('/Media/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data.success && uploadRes.data.urls.length > 0) {
        const imageUrl = uploadRes.data.urls[0];
        const res = await authClient.post('/Chat/send', {
          receiverId: activeChat.partner.userId,
          content: '📷 Hình ảnh đính kèm',
          attachmentUrl: imageUrl,
        });

        if (res.data.success) {
           setMessages(prev => {
               if (!prev.find(m => m.id === res.data.data.id)) {
                   return [...prev, res.data.data];
               }
               return prev;
           });
        }
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isTyping || !activeChat) return;
    
    const content = inputText.trim();
    
    if (editingMsgId) {
      // Gửi sửa tin nhắn
      setIsTyping(true);
      try {
        const res = await authClient.put(`/Chat/message/${editingMsgId}`, { content });
        if (res.data.success) {
          setMessages(prev => prev.map(m => m.id === editingMsgId ? res.data.data : m));
          setEditingMsgId(null);
          setInputText('');
          fetchConversations();
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi sửa tin nhắn');
      } finally {
        setIsTyping(false);
      }
      return;
    }

    // Gửi tin mới
    setInputText('');
    setIsTyping(true);

    try {
      const res = await authClient.post('/Chat/send', {
        receiverId: activeChat.partner.userId,
        content: content,
      });
      if (res.data.success) {
        setMessages(prev => {
            if (!prev.find(m => m.id === res.data.data.id)) {
                return [...prev, res.data.data];
            }
            return prev;
        });
      }
      fetchConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // Close dropdowns if click outside
  useEffect(() => {
    const closeAll = () => { setOpenConvDropdown(null); setOpenMsgDropdown(null); };
    document.addEventListener('click', closeAll);
    return () => document.removeEventListener('click', closeAll);
  }, []);

  const filteredConversations = conversations.filter(c => 
    c.partner.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden bg-white">
        <div className="grid flex-1 min-h-0 grid-cols-1 overflow-hidden md:grid-cols-[400px_1fr]">
          
          {/* LETS SIDEBAR: Conversations List */}
          <aside className={`flex min-h-0 h-full w-full flex-col border-r border-gray-200 bg-gray-50/50 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="px-6 pb-5 pt-6">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Chat</h2>
            </div>

            {/* Search */}
            <div className="px-6 pb-4 flex items-center gap-3">
              <div className="group relative flex-1 flex items-center gap-3 rounded-2xl border-2 border-gray-200 hover:border-gray-400 focus-within:!border-gray-900 bg-white px-4 h-[58px] focus-within:shadow-sm transition-colors duration-200">
                <Search className="h-[22px] w-[22px] text-gray-500 group-focus-within:text-gray-900 shrink-0 transition-colors" strokeWidth={2.5} aria-hidden="true" />
                <div className="relative flex-1 h-full">
                  <label
                    htmlFor="search-input"
                    className={`absolute left-0 top-0 transition-all duration-300 ease-out pointer-events-none select-none ${
                      searchQuery
                        ? "translate-y-[6px] text-[11px] font-bold text-gray-900"
                        : "translate-y-[17px] text-[15px] text-gray-500 group-focus-within:translate-y-[6px] group-focus-within:text-[11px] group-focus-within:font-bold group-focus-within:text-gray-900"
                    }`}
                  >
                    Nhập để bắt đầu tìm kiếm
                  </label>
                  <input
                    id="search-input"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="absolute bottom-1.5 left-0 w-full h-[24px] bg-transparent text-[15px] font-medium text-gray-900 outline-none pr-8 [&::-webkit-search-cancel-button]:hidden"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 mt-1 p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors z-10"
                    >
                      <X className="h-[18px] w-[18px]" strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>
              <button className="shrink-0 p-1.5 text-gray-900 hover:bg-gray-200 rounded-full transition-colors">
                <MoreVertical className="h-6 w-6" strokeWidth={2.5} />
              </button>
            </div>

            {/* List */}
            <nav className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Không có cuộc trò chuyện nào</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const active = activeChat?.conversationId === conv.conversationId;
                  return (
                    <div key={conv.conversationId} className="relative group">
                      <button
                        type="button"
                        onClick={() => setActiveChat(conv)}
                        className={`flex w-full items-center gap-3.5 rounded-3xl p-3.5 text-left transition-all ${
                          active
                            ? "bg-[#2D5A3D] text-white shadow-md"
                            : "bg-white/80 text-gray-900 shadow-sm hover:bg-white"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className="h-14 w-14 overflow-hidden rounded-full flex items-center justify-center font-bold text-xl bg-gray-200 text-gray-600">
                            {conv.partner.avatarUrl && conv.partner.avatarUrl !== "U" ? (
                              <img src={conv.partner.avatarUrl} alt={conv.partner.fullName} className="h-full w-full object-cover" />
                            ) : (
                              conv.partner.fullName?.charAt(0) || 'U'
                            )}
                          </div>
                          {/* Online status indicator mock */}
                          <span
                            className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 ${
                              active ? "border-[#2D5A3D] bg-emerald-400" : "border-white bg-[#2D5A3D]"
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1 pr-4">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate font-semibold">{conv.partner.fullName || 'User'}</span>
                            <span className={`shrink-0 text-xs ${active ? "text-white/80" : "text-gray-500"}`}>
                              {new Date(conv.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <p
                              className={`truncate text-sm ${
                                active ? "text-white/85" : "text-gray-500"
                              }`}
                            >
                              {conv.lastMessage?.senderId === currentUser?.id ? 'Bạn: ' : ''}
                              {conv.lastMessage?.isRevoked ? 'Đã thu hồi một tin nhắn' : (conv.lastMessage?.content || 'Hình ảnh đính kèm')}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span
                                className={`flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                                  active ? "bg-emerald-400 text-[#2D5A3D]" : "bg-[#C4603A] text-white"
                                }`}
                              >
                                {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Dropdown Menu */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenConvDropdown(openConvDropdown === conv.conversationId ? null : conv.conversationId); }}
                          className={`p-1.5 rounded-full transition-colors bg-white shadow-sm border border-gray-100 ${
                            active ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                          } ${openConvDropdown === conv.conversationId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${conv.unreadCount > 0 ? 'hidden group-hover:flex' : 'flex'}`}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        {openConvDropdown === conv.conversationId && (
                          <div className="absolute right-0 top-full mt-3 w-[240px] z-50 drop-shadow-[0_8px_24px_rgba(0,0,0,0.12)]" onClick={(e) => e.stopPropagation()}>
                            {/* Arrow Pointer */}
                            <div className="absolute -top-[6px] right-[10px] w-[14px] h-[14px] bg-white border-l border-t border-gray-100 rotate-45 rounded-tl-[2px] z-30" />
                            {/* Menu Box */}
                            <div className="relative z-20 bg-white border border-gray-100 rounded-2xl overflow-hidden py-2">
                              <button onClick={(e) => markAsUnread(e, conv.partner.userId)} className="w-full text-left px-5 py-3 text-[15px] font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-3.5 transition-colors">
                                <Mail className="w-[22px] h-[22px] text-gray-900" strokeWidth={1.5} /> Đánh dấu là chưa đọc
                              </button>
                              <button className="w-full text-left px-5 py-3 text-[15px] font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-3.5 transition-colors">
                                <BellOff className="w-[22px] h-[22px] text-gray-900" strokeWidth={1.5} /> Tắt thông báo
                              </button>
                              <button onClick={() => navigate(`/profile/${conv.partner.userId}`)} className="w-full text-left px-5 py-3 text-[15px] font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-3.5 transition-colors">
                                <CircleUser className="w-[22px] h-[22px] text-gray-900" strokeWidth={1.5} /> Xem trang cá nhân
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </nav>
          </aside>

          {/* RIGHT AREA: Active Chat Window */}
          <section className={`flex min-h-0 h-full flex-col bg-white ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="w-24 h-24 bg-gray-50 shadow-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-[#2D5A3D]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tin nhắn của bạn</h2>
                <p className="text-gray-500 max-w-sm mx-auto">Chọn một cuộc trò chuyện hoặc bắt đầu gửi tin nhắn để thương lượng, trao đổi dễ dàng.</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => setActiveChat(null)}
                      className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="relative">
                      <div className="h-12 w-12 overflow-hidden rounded-full font-bold flex items-center justify-center bg-gray-200 text-gray-600">
                        {activeChat.partner.avatarUrl && activeChat.partner.avatarUrl !== "U" ? (
                          <img src={activeChat.partner.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                        ) : (
                          activeChat.partner.fullName?.charAt(0) || 'U'
                        )}
                      </div>
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-white bg-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold leading-tight text-gray-900">{activeChat.partner.fullName}</h3>
                      <p className="text-sm text-[#2D5A3D]">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2D5A3D] text-white transition-colors hover:bg-[#2D5A3D]/90 shadow-sm"
                    >
                      <Phone className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2D5A3D] text-white transition-colors hover:bg-[#2D5A3D]/90 shadow-sm"
                    >
                      <Video className="h-5 w-5" />
                    </button>
                  </div>
                </header>

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                  <div className="flex justify-center mb-6">
                    <span className="rounded-full bg-gray-200/50 px-3 py-1 text-xs font-medium text-gray-500 backdrop-blur-sm">Hôm nay</span>
                  </div>
                  {messages.map((msg, index) => {
                    const isMe = msg.senderId === currentUser?.id;
                    const prevMsg = messages[index - 1];
                    const showName = !prevMsg || prevMsg.senderId !== msg.senderId;

                    return (
                      <div key={msg.id} className={`flex w-full gap-3 ${isMe ? "justify-end" : "justify-start"} group`}>
                        {msg.product ? (
                           <div className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                              <div className={`flex max-w-[78%] gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                {!isMe && <div className="w-9 shrink-0" />}
                                <div className="w-full min-w-[300px]">
                                  <div className="w-full overflow-hidden rounded-3xl border-2 border-[#2D5A3D] bg-white p-2.5 shadow-sm">
                                    <div className="flex gap-3.5 p-2">
                                      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
                                        <img src={msg.product.image} alt={msg.product.name} className="h-full w-full object-cover" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <h4 className="text-lg font-semibold leading-tight text-gray-900 text-balance line-clamp-2">
                                          {msg.product.name}
                                        </h4>
                                        <dl className="mt-1.5 space-y-0.5 text-sm text-gray-500">
                                          <div>
                                            <span>Trade Value: </span>
                                            <span className="font-semibold text-[#2D5A3D]">{msg.product.price}</span>
                                          </div>
                                        </dl>
                                      </div>
                                    </div>
                                    <button type="button" className="mt-1.5 w-full rounded-2xl bg-[#2D5A3D] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#2D5A3D]/90">
                                      View Item
                                    </button>
                                  </div>
                                </div>
                              </div>
                           </div>
                        ) : (
                          <div className={`flex w-full gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
                            {!isMe && (
                              <div className="h-9 w-9 shrink-0 self-start overflow-hidden rounded-full font-bold flex items-center justify-center bg-gray-200 text-gray-600">
                                {showName ? (
                                  activeChat.partner.avatarUrl && activeChat.partner.avatarUrl !== "U" ? (
                                    <img src={activeChat.partner.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                                  ) : (activeChat.partner.fullName?.charAt(0) || 'U')
                                ) : null}
                              </div>
                            )}

                            {/* Dropdown Menu Left (for IsMe) */}
                            {isMe && !msg.isRevoked && (
                               <div className="relative opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-center">
                                 <button onClick={(e) => { e.stopPropagation(); setOpenMsgDropdown(openMsgDropdown === msg.id ? null : msg.id); }} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200">
                                    <MoreVertical className="w-4 h-4" />
                                 </button>
                                 {openMsgDropdown === msg.id && (
                                    <div className="absolute right-0 bottom-full mb-1 w-36 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 py-1">
                                      <button onClick={() => startEditMessage(msg)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                        <Edit2 className="w-3.5 h-3.5" /> Sửa
                                      </button>
                                      <button onClick={() => revokeMessage(msg.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                        <Ban className="w-3.5 h-3.5" /> Thu hồi
                                      </button>
                                    </div>
                                 )}
                               </div>
                            )}

                            <div className={`max-w-[72%] ${isMe ? "items-end" : "items-start"}`}>
                              {msg.isRevoked ? (
                                <div className="rounded-3xl rounded-br-md px-4 py-3 text-[15px] border border-gray-200 text-gray-400 italic bg-transparent mb-1 shadow-sm">
                                  Tin nhắn đã bị thu hồi
                                </div>
                              ) : (
                                <div
                                  className={`rounded-3xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                                    isMe
                                      ? "rounded-tr-md bg-[#2D5A3D] text-white"
                                      : "rounded-tl-md border border-gray-200 bg-white text-gray-800"
                                  }`}
                                >
                                  {showName && (
                                    <div className="mb-0.5 flex items-baseline justify-between gap-6">
                                      <span className={`text-sm font-semibold ${isMe ? "text-white" : "text-gray-900"}`}>
                                        {isMe ? "You" : activeChat.partner.fullName}
                                      </span>
                                      <span className={`text-xs ${isMe ? "text-white/70" : "text-gray-500"}`}>
                                        {msg.time}
                                      </span>
                                    </div>
                                  )}
                                  {!showName && (
                                    <div className={`text-[10px] mb-1 ${isMe ? 'text-white/60 text-right' : 'text-gray-400 text-left'}`}>
                                      {msg.time}
                                    </div>
                                  )}

                                  {msg.imageUrl && (
                                    <img
                                      src={msg.imageUrl}
                                      alt="Sent image"
                                      className="max-w-sm w-full rounded-xl mb-2 object-cover"
                                    />
                                  )}
                                  <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && !editingMsgId && (
                    <div className="flex w-full gap-3 justify-start">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full flex items-center justify-center font-bold bg-gray-200 text-gray-600">
                        {activeChat.partner.avatarUrl && activeChat.partner.avatarUrl !== "U" ? (
                          <img src={activeChat.partner.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                        ) : (activeChat.partner.fullName?.charAt(0) || 'U')}
                      </div>
                      <div className="max-w-[72%] items-start">
                        <div className="rounded-3xl rounded-tl-md border border-gray-100 bg-white px-4 py-3.5 shadow-sm">
                           <div className="flex space-x-1.5 items-center h-4">
                            {[0, 150, 300].map((delay) => (
                              <div key={delay} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Edit Alert */}
                {editingMsgId && (
                  <div className="px-6 py-2 bg-gray-50/80 border-t border-gray-200 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-[#2D5A3D] font-medium">
                      <Edit2 className="w-4 h-4" /> Đang sửa tin nhắn...
                    </div>
                    <button onClick={cancelEdit} className="p-1 hover:bg-white/80 rounded-full transition-colors text-gray-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Composer */}
                <div className="border-t border-gray-200 bg-white px-6 py-4">
                  <div className="flex items-end gap-2.5 rounded-3xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[#2D5A3D]/20 transition-all">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {!editingMsgId && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isTyping}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40"
                      >
                        <ImagePlus className="h-5 w-5" />
                      </button>
                    )}
                    
                    <textarea
                      ref={inputRef as any}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder={editingMsgId ? "Nhập nội dung mới..." : "Write a message..."}
                      className="w-full bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-400 resize-none min-h-[40px] max-h-32 py-2.5"
                      rows={1}
                    />
                    
                    <button
                      onClick={sendMessage}
                      disabled={!inputText.trim() || isTyping}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2D5A3D] text-white transition-colors hover:bg-[#2D5A3D]/90 disabled:opacity-50"
                    >
                      {editingMsgId ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4 ml-0.5" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
    </div>
  );
}
