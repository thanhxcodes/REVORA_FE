import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, ChevronLeft, Check, CheckCheck, ImagePlus, Minus, MoreHorizontal, Edit2, Trash2, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import * as signalR from '@microsoft/signalr';
import authClient from '../../providers/authProvider/authService';
import { getAccessToken } from '../../features/auth/services/tokenService';

interface User {
  id: number;
  username: string;
  name: string;
  avatar: string;
  role: string;
}

interface ProductRef {
  id: number;
  name: string;
  price: string;
  image: string;
}

interface Message {
  id: number;
  senderId: number;
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

interface ChatBoxProps {
  currentUser: User;
}

export default function ChatBox({ currentUser }: ChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<ProductRef | null>(null);
  
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
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, fetchConversations]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.partner.userId);
      markAsRead(activeChat.partner.userId);
    }
  }, [activeChat]);

  // Thiết lập SignalR
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

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
          if (currentChat && msg.senderId === currentChat.partner.userId) {
            setMessages(prev => {
                if (!prev.find(m => m.id === msg.id)) {
                    return [...prev, msg];
                }
                return prev;
            });
            markAsRead(msg.senderId);
          }
          fetchConversations();
        });

        newConnection.on('MessageEdited', (msg: Message) => {
          const currentChat = activeChatRef.current;
          if (currentChat && msg.senderId === currentChat.partner.userId) {
            setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
          }
          fetchConversations();
        });

        newConnection.on('MessageRevoked', (msg: Message) => {
          const currentChat = activeChatRef.current;
          if (currentChat && msg.senderId === currentChat.partner.userId) {
            setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
          }
          fetchConversations();
        });

      })
      .catch(e => console.log('Connection failed: ', e));

    return () => {
      newConnection.stop();
    };
  }, [fetchConversations]);

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

  // Handle open chat from anywhere
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        seller: { id: number; username: string; name: string; avatar: string; phone: string };
        product: ProductRef;
        prefilledMessage: string;
        autoSend: boolean;
        source: 'zalo' | 'chat';
      };
      if (!detail) return;
      if (detail.seller.id === currentUser.id) return;

      setIsOpen(true);
      setIsMinimized(false);
      
      const partner = {
         userId: detail.seller.id,
         fullName: detail.seller.name,
         avatarUrl: detail.seller.avatar
      };
      
      setActiveChat({ conversationId: 0, lastMessageAt: new Date().toISOString(), partner, lastMessage: null, unreadCount: 0 });
      setMessages([]);

      if (!detail.autoSend) {
        setInputText(detail.prefilledMessage);
        setPendingProduct(detail.product);
        setEditingMsgId(null);
      }
    };
    window.addEventListener('revora:openChat', handler);
    return () => window.removeEventListener('revora:openChat', handler);
  }, [currentUser.id]);

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
           setMessages(prev => [...prev, res.data.data]);
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
    const productId = pendingProduct?.id;
    setInputText('');
    setPendingProduct(null);
    setIsTyping(true);

    try {
      const res = await authClient.post('/Chat/send', {
        receiverId: activeChat.partner.userId,
        content: content,
        productRefId: productId,
      });
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
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

  const totalUnreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const other = activeChat?.partner;

  return (
    <>
      {/* Chat panel */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-24 right-6 w-80 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] px-4 py-3 flex items-center justify-between flex-shrink-0">
            {activeChat ? (
              <div className="flex items-center flex-1 min-w-0">
                <button
                  onClick={() => {
                    setActiveChat(null);
                    setEditingMsgId(null);
                    setInputText('');
                    fetchConversations(); 
                  }}
                  className="text-white/80 hover:text-white transition-colors mr-2 flex-shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 bg-white/25 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mr-2">
                  {other?.avatarUrl && other.avatarUrl !== "U" ? <img src={other.avatarUrl} alt="avatar" /> : other?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="text-white text-sm font-semibold leading-tight">{other?.fullName || 'User'}</div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span className="text-white/70 text-xs">Đang hoạt động</span>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-white font-semibold text-sm">Tin Nhắn {totalUnreadCount > 0 && `(${totalUnreadCount})`}</span>
            )}
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMinimized(true)} className="text-white/80 hover:text-white transition-colors flex-shrink-0">
                <Minus className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!activeChat ? (
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-2 text-[10px] text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100 font-semibold">
                Cuộc trò chuyện gần đây
              </div>
              {conversations.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-400 text-xs">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có cuộc trò chuyện nào</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div key={conv.conversationId} className="relative group">
                    <button
                      onClick={() => setActiveChat(conv)}
                      className="w-full flex items-center space-x-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full overflow-hidden flex items-center justify-center text-white text-lg font-bold">
                          {conv.partner.avatarUrl && conv.partner.avatarUrl !== "U" ? <img src={conv.partner.avatarUrl} alt="avatar" /> : conv.partner.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className={`font-semibold text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>{conv.partner.fullName || 'User'}</div>
                        <div className={`text-xs truncate mt-0.5 leading-tight ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                          {conv.lastMessage?.senderId === currentUser.id ? 'Bạn: ' : ''}
                          {conv.lastMessage?.isRevoked ? 'Đã thu hồi một tin nhắn' : (conv.lastMessage?.content || 'Hình ảnh đính kèm')}
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="absolute right-4 w-5 h-5 bg-[#C4603A] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm animate-pulse">
                          {conv.unreadCount}
                        </div>
                      )}
                    </button>
                    
                    {/* 3 dots menu for conversation */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenConvDropdown(openConvDropdown === conv.conversationId ? null : conv.conversationId); }}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors ${openConvDropdown === conv.conversationId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${conv.unreadCount > 0 ? 'hidden group-hover:flex' : 'flex'}`}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openConvDropdown === conv.conversationId && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 py-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => markAsUnread(e, conv.partner.userId)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Check className="w-4 h-4" /> Đánh dấu chưa đọc
                        </button>
                        <button onClick={(e) => deleteConversation(e, conv.partner.userId)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Xóa hội thoại
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 group ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="w-7 h-7 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] overflow-hidden rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {other?.avatarUrl && other.avatarUrl !== "U" ? <img src={other.avatarUrl} alt="avatar" /> : other?.fullName?.charAt(0) || 'U'}
                        </div>
                      )}

                      {/* Msg Action Menu */}
                      {isMe && !msg.isRevoked && (
                         <div className="relative opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mb-3">
                           <button onClick={(e) => { e.stopPropagation(); setOpenMsgDropdown(openMsgDropdown === msg.id ? null : msg.id); }} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200">
                              <MoreHorizontal className="w-4 h-4" />
                           </button>
                           {openMsgDropdown === msg.id && (
                              <div className="absolute right-0 bottom-full mb-1 w-36 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 py-1" onClick={e => e.stopPropagation()}>
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

                      <div className={`max-w-[72%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {msg.isRevoked ? (
                           <div className={`px-4 py-2 rounded-2xl text-sm border border-gray-200 text-gray-400 italic bg-transparent`}>
                             Tin nhắn đã bị thu hồi
                           </div>
                        ) : (
                          <div
                            className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-br-sm'
                                : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
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
                        )}
                        <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[10px] text-gray-400">{msg.time}</span>
                          {!msg.isRevoked && msg.isEdited && <span className="text-[10px] text-gray-400 italic">(đã chỉnh sửa)</span>}
                          {isMe && !msg.isRevoked && (
                            msg.read ? <CheckCheck className="w-3 h-3 text-[#2D5A3D]" /> : <Check className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isTyping && !editingMsgId && (
                  <div className="flex items-end gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] overflow-hidden rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {other?.avatarUrl && other.avatarUrl !== "U" ? <img src={other.avatarUrl} alt="avatar" /> : other?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
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
              
              {editingMsgId && (
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex-shrink-0 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 flex items-center gap-1"><Edit2 className="w-3 h-3"/> Đang sửa tin nhắn</span>
                  <button onClick={cancelEdit} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                    <X className="w-3 h-3"/>
                  </button>
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
                {!editingMsgId && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isTyping}
                    className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-[#2D5A3D] transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Đăng tải ảnh"
                  >
                    <ImagePlus className="w-4 h-4" />
                  </button>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={editingMsgId ? "Nhập nội dung mới..." : "Nhập tin nhắn..."}
                  className="flex-1 px-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/25 text-gray-800 placeholder-gray-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="w-9 h-9 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white hover:shadow-md transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editingMsgId ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Chat bubble */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
          if (!isOpen) {
             fetchConversations();
          }
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow z-50"
        title="Mở chat"
      >
        <MessageCircle className="w-6 h-6" />
        {!isOpen && totalUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#C4603A] rounded-full text-xs flex items-center justify-center text-white font-bold animate-pulse">
            {totalUnreadCount}
          </span>
        )}
      </button>
    </>
  );
}
