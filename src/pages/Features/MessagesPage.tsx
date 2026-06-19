import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { MessageCircle, X, Send, ChevronLeft, Check, CheckCheck, ImagePlus, MoreVertical, Edit2, Trash2, Ban, Search, Phone, Video, MoreHorizontal, Mail, BellOff, CircleUser, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
    isOnline?: boolean;
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
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const [attachedProduct, setAttachedProduct] = useState<ProductRef | null>(location.state?.product || null);
  
  // Dropdown states
  const [openConvDropdown, setOpenConvDropdown] = useState<number | null>(null);
  const [openMsgDropdown, setOpenMsgDropdown] = useState<number | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<number | null>(null);
  
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeChatRef = useRef<Conversation | null>(null);
  const prevMessagesLengthRef = useRef(0);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await authClient.get('/Chat/conversations');
      if (res.data.success) {
        setConversations(prev => {
          const apiConvs = res.data.data;
          // Keep fake conversations if the API didn't return a real one for that user
          const tempConvs = prev.filter(c => c.conversationId < 0 && !apiConvs.find((a: any) => a.partner.userId === c.partner.userId));
          return [...tempConvs, ...apiConvs];
        });
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
      window.dispatchEvent(new Event('chat_update'));
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
      window.dispatchEvent(new Event('chat_update'));
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

  // Handle auto-select conversation if passed from location.state
  useEffect(() => {
    if (location.state?.targetUserId && conversations.length >= 0) {
      const conv = conversations.find(c => c.partner.userId === location.state.targetUserId);
      if (conv) {
        if (activeChat?.conversationId !== conv.conversationId) {
          setActiveChat(conv);
        }
      } else {
        // Create a temporary conversation
        const tempConv: Conversation = {
          conversationId: -Date.now(), // Fake ID
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          partner: {
            userId: location.state.targetUserId,
            fullName: location.state.targetUserName || 'Người dùng',
            avatarUrl: location.state.targetUserAvatar || 'U',
            isOnline: false,
          },
          lastMessage: null
        };
        // Avoid infinite loop by checking if we already added a fake one for this user
        if (!conversations.find(c => c.partner.userId === tempConv.partner.userId)) {
          setConversations(prev => [tempConv, ...prev]);
        }
        if (activeChat?.partner.userId !== tempConv.partner.userId) {
          setActiveChat(tempConv);
        }
      }
      
      // Clear location state to prevent getting stuck on this chat
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, conversations, activeChat, navigate]);

  useEffect(() => {
    if (activeChat) {
      setMessages([]);
      prevMessagesLengthRef.current = 0;
      fetchMessages(activeChat.partner.userId);
      markAsRead(activeChat.partner.userId);
    }
  }, [activeChat]);

  // Sync activeChat with real conversation if it was a temp one
  useEffect(() => {
    if (activeChat && activeChat.conversationId < 0) {
      const realConv = conversations.find(c => c.partner.userId === activeChat.partner.userId && c.conversationId >= 0);
      if (realConv) {
        setActiveChat(realConv);
      }
    }
  }, [conversations, activeChat]);

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

        newConnection.on('MessagesRead', (readerId: number) => {
          const currentChat = activeChatRef.current;
          if (currentChat && readerId === currentChat.partner.userId) {
            setMessages(prev => prev.map(m => 
              m.senderId === currentUser.id ? { ...m, read: true } : m
            ));
          }
        });

      })
      .catch(e => console.log('Connection failed: ', e));

    return () => {
      newConnection.stop();
    };
  }, [fetchConversations, currentUser]);


  useLayoutEffect(() => {
    if (activeChat) {
      const behavior = prevMessagesLengthRef.current === 0 ? 'auto' : 'smooth';
      messagesEndRef.current?.scrollIntoView({ behavior });
      prevMessagesLengthRef.current = messages.length;
    }
  }, [activeChat, messages.length, isSending, editingMsgId]);

  useEffect(() => {
    if (activeChat) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeChat]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat || editingMsgId) return;

    setIsSending(true);
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
          content: '',
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
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isSending || !activeChat) return;
    
    const content = inputText.trim();
    const currentProduct = attachedProduct;
    
    if (editingMsgId) {
      // Gửi sửa tin nhắn
      setIsSending(true);
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
        setIsSending(false);
      }
      return;
    }

    // Gửi tin mới
    setInputText('');
    setAttachedProduct(null); // Xóa attached product sau khi gửi
    setIsSending(true);

    try {
      const payload: any = {
        receiverId: activeChat.partner.userId,
        content: content,
      };
      // Giả lập frontend: thêm productRefId nếu API hỗ trợ, hoặc đính kèm vào payload gửi lên
      if (currentProduct) {
        payload.productRefId = currentProduct.id;
      }
      
      const res = await authClient.post('/Chat/send', payload);
      if (res.data.success) {
        // Nếu API không trả về thông tin product trong response, chúng ta tự gắn (mock) vào tin nhắn trả về để UI hiển thị được ngay lập tức
        const newMsg = res.data.data;
        if (currentProduct && !newMsg.product) {
          newMsg.product = currentProduct;
        }
        
        setMessages(prev => {
            if (!prev.find(m => m.id === newMsg.id)) {
                return [...prev, newMsg];
            }
            return prev;
        });
      }
      fetchConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
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
  
  const currentConversation = conversations.find(c => c.partner.userId === activeChat?.partner.userId);
  const activePartner = currentConversation ? currentConversation.partner : activeChat?.partner;

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
                            ? "bg-[#EBF4F0] text-gray-900"
                            : "bg-white text-gray-900 hover:bg-gray-50"
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
                          {/* Online status indicator */}
                          <span
                            className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 ${conv.partner.isOnline ? 'bg-emerald-400' : 'bg-gray-400'} ${
                              active ? "border-[#EBF4F0]" : "border-white"
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1 pr-4">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate font-semibold">{conv.partner.fullName || 'User'}</span>
                            <span className="shrink-0 text-xs text-gray-500">
                              {new Date(conv.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <p className="truncate text-sm text-gray-500">
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
                        {activePartner?.avatarUrl && activePartner.avatarUrl !== "U" ? (
                          <img src={activePartner.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                        ) : (
                          activePartner?.fullName?.charAt(0) || 'U'
                        )}
                      </div>
                      <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${activePartner?.isOnline ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold leading-tight text-gray-900">{activePartner?.fullName}</h3>
                      <p className={`text-sm ${activePartner?.isOnline ? 'text-[#2D5A3D]' : 'text-gray-500'}`}>{activePartner?.isOnline ? 'Online' : 'Offline'}</p>
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
                  {(() => {
                    const lastReadMessageIndex = [...messages].reverse().findIndex(m => m.senderId === currentUser?.id && m.read === true);
                    const lastReadMessageId = lastReadMessageIndex !== -1 ? messages[messages.length - 1 - lastReadMessageIndex].id : null;

                    return messages.map((msg, index) => {
                    const isMe = msg.senderId === currentUser?.id;
                    const prevMsg = messages[index - 1];
                    const showName = !prevMsg || prevMsg.senderId !== msg.senderId;

                    return (
                      <div key={msg.id} className={`flex w-full gap-3 ${isMe ? "justify-end" : "justify-start"} group`}>
                        {!isMe && (
                          <div className={`shrink-0 self-start ${showName ? 'h-9 w-9 overflow-hidden rounded-full font-bold flex items-center justify-center bg-gray-200 text-gray-600' : 'w-9'}`}>
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
                            <>
                              <div
                                className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                                  isMe
                                    ? "rounded-tr-sm bg-[#EBF4F0] text-gray-900"
                                    : "rounded-tl-sm border border-gray-200 bg-white text-gray-900"
                                }`}
                              >

                              {msg.product && (
                                <Link to={`/product/${msg.product.id}`} className="block mb-2.5 flex gap-3 relative pl-3 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#E2A62C] before:rounded-full hover:opacity-80 transition-opacity">
                                  <img src={msg.product.image} alt={msg.product.name} className="w-12 h-12 rounded-md object-cover bg-white flex-shrink-0 border border-black/5" />
                                  <div className="min-w-0 flex flex-col justify-center">
                                    <h4 className="text-[14px] font-semibold text-gray-900 line-clamp-2 leading-snug">{msg.product.name}</h4>
                                    <p className="text-[13px] font-bold text-[#2D5A3D] mt-0.5">{msg.product.price}</p>
                                  </div>
                                </Link>
                              )}

                              {msg.imageUrl && (
                                <img
                                  src={msg.imageUrl}
                                  alt="Sent image"
                                  className="max-w-sm w-full rounded-xl mb-2 object-cover border border-black/5"
                                />
                              )}
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                              <div className={`mt-1 flex items-center gap-1.5 text-[11px] text-gray-500 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span>{msg.time}</span>
                                {isMe && msg.id === lastReadMessageId && (
                                  <>
                                    <span className="text-gray-400">|</span>
                                    <span>Đã đọc</span>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" />
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}


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
                  {attachedProduct && (
                    <div className="mb-3 relative rounded-xl border border-gray-200 bg-white p-3 shadow-sm flex flex-col gap-2 max-w-sm">
                      <div className="text-xs font-bold text-gray-900">Tư vấn sản phẩm</div>
                      <div className="flex gap-3 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-yellow-400 before:rounded-l-sm pl-3">
                        <img src={attachedProduct.image} alt={attachedProduct.name} className="w-12 h-12 rounded object-cover flex-shrink-0 bg-gray-100" />
                        <div className="flex-1 min-w-0 pr-6">
                          <h4 className="text-sm text-gray-800 line-clamp-1 truncate">{attachedProduct.name}</h4>
                          <p className="text-sm font-semibold text-[#2D5A3D]">{attachedProduct.price}</p>
                        </div>
                        <button 
                          onClick={() => setAttachedProduct(null)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  
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
                        disabled={isSending}
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
                      placeholder={attachedProduct ? "Nhập tin nhắn..." : (editingMsgId ? "Nhập nội dung mới..." : "Write a message...")}
                      className="w-full bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-400 resize-none min-h-[40px] max-h-32 py-2.5"
                      rows={1}
                    />
                    
                    <button
                      onClick={sendMessage}
                      disabled={!inputText.trim() || isSending}
                      className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#2D5A3D] text-white transition-colors hover:bg-[#2D5A3D]/90 disabled:bg-gray-200 disabled:text-gray-400"
                    >
                      {editingMsgId ? <Check className="h-4 w-4" /> : <Send className="h-5 w-5 ml-0.5" />}
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
