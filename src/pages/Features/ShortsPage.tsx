import { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, X, Send, ChevronUp, ChevronDown, Music2, ShoppingBag, Edit2, Trash2, MoreHorizontal, Play, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../providers/authProvider/AuthContext';
import { useToggleFollow } from '../../features/profile/hooks/useFollow';

// Import API
import { 
  getFeedShortsAPI, 
  getShortCommentsAPI, 
  addShortCommentAPI, 
  toggleLikeShortAPI,
  editShortCommentAPI,
  deleteShortCommentAPI,
  toggleLikeShortCommentAPI
} from '../../features/products/services/productApi';

// Helper Format Thời Gian
const timeAgo = (dateStr: string) => {
  const diff = new Date().getTime() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
};

const getBadgeVisuals = (name: string | undefined | null) => {
  if (!name) return null;
  const normalized = name.toLowerCase().replace('-', ' ').trim();
  switch (normalized) {
    case 'premium gold':
      return { gradient: 'from-amber-400 via-yellow-500 to-amber-600', icon: '⭐' };
    case 'top seller':
      return { gradient: 'from-orange-500 to-red-500', icon: '🏆' };
    case 'verified':
      return { gradient: 'from-blue-500 to-blue-600', icon: '✓' };
    case 'trendsetter':
      return { gradient: 'from-purple-500 to-pink-500', icon: '💎' };
    case 'eco warrior':
      return { gradient: 'from-green-500 to-emerald-600', icon: '🌱' };
    case 'vip member':
      return { gradient: 'from-yellow-500 to-amber-600', icon: '👑' };
    default:
      return { gradient: 'from-gray-400 to-gray-600', icon: '🎖️' };
  }
};

// Component Đĩa Nhạc Xoay
function SpinningDisc() {
  return (
    <div className="w-10 h-10 rounded-full border-[3px] border-white/30 overflow-hidden animate-spin" style={{ animationDuration: '3s' }}>
      <div className="w-full h-full bg-gradient-to-br from-[#2D5A3D] to-[#2a0a16] flex items-center justify-center">
        <div className="w-3 h-3 bg-white/80 rounded-full" />
      </div>
    </div>
  );
}

// Component Video Player
function ShortVideoPlayer({ src, isActive, volume, isMuted }: { src: string; isActive: boolean; volume: number; isMuted: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
  }, [volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isActive) {
      if (video.readyState === 0) {
        video.load();
      }
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlaying(true)).catch((e) => {
          console.log("Auto-play prevented:", e);
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(true);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-black cursor-pointer" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={isActive ? src : ""}
        className="absolute inset-0 w-full h-full object-contain"
        style={{ 
          opacity: isActive ? 1 : 0.99,
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
        loop
        playsInline
        muted={!isActive || isMuted}
        preload={isActive ? "auto" : "none"}
      />
      {isActive && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/30 w-20 h-20 rounded-full flex items-center justify-center animate-pulse">
            <Play className="w-10 h-10 text-white opacity-90 ml-2" fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );
}

const CommentInput = ({ 
  currentUser, inputText, setInputText, sendComment, isSubmittingComment, 
  editingCommentId, replyingToName, cancelReplyOrEdit, autoFocus = false 
}: any) => {
  return (
    <div className="flex gap-3 w-full">
      <div className="w-8 h-8 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
        {(currentUser?.fullName || 'U').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#2D5A3D]/30 focus-within:border-transparent transition-all">
        {(replyingToName || editingCommentId) && (
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 flex items-center gap-2">
              {editingCommentId ? <Edit2 className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />}
              {editingCommentId ? 'Đang sửa bình luận' : `Đang trả lời ${replyingToName}`}
            </span>
            <button onClick={cancelReplyOrEdit} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={editingCommentId ? "Sửa bình luận..." : replyingToName ? `Trả lời ${replyingToName}...` : "Bạn có thắc mắc gì về sản phẩm này?"}
          className="w-full px-4 py-2.5 focus:outline-none resize-none bg-transparent text-sm"
          rows={2}
          autoFocus={autoFocus}
        />
        <div className="flex justify-end px-3 pb-2.5">
          <button
            onClick={sendComment}
            disabled={!inputText.trim() || isSubmittingComment}
            className="flex items-center gap-1.5 bg-[#2D5A3D] text-white px-4 py-1.5 rounded-xl hover:bg-[#234830] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs shadow-sm"
          >
            <Send className="w-3 h-3" />
            <span>{isSubmittingComment ? 'Đang gửi...' : (editingCommentId ? 'Cập nhật' : 'Gửi')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// COMPONENT RENDER BÌNH LUẬN (CHUYỂN RA NGOÀI ĐỂ TRÁNH RE-RENDER MẤT SCROLL)
// -------------------------------------------------------------
const CommentItem = ({ 
  comment, isReply, parentComment, 
  currentUser, openDropdownId, setOpenDropdownId, confirmDeleteId, setConfirmDeleteId,
  startEdit, executeDelete, handleLike, startReply, inputProps
}: any) => {
  const isOwner = currentUser?.id === comment.userId;
  const showParentName = isReply && parentComment;

  return (
    <div className={`flex gap-3 ${isReply ? 'mt-3' : 'mt-5'}`}>
      <div className={`${isReply ? 'w-7 h-7' : 'w-9 h-9'} bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden`}>
        {comment.avatarUrl && comment.avatarUrl.length > 1 ? (
           <img src={comment.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : (
           comment.fullName.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
           <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 relative group">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                  {comment.fullName}
                  {comment.userBadgeName && (
                    <span
                      title={comment.userBadgeName}
                      className={`inline-flex w-3.5 h-3.5 bg-gradient-to-r ${getBadgeVisuals(comment.userBadgeName)?.gradient || 'from-gray-400 to-gray-600'} rounded-full items-center justify-center text-white text-[7px] flex-shrink-0`}
                    >
                      {getBadgeVisuals(comment.userBadgeName)?.icon || '🎖️'}
                    </span>
                  )}
                  {showParentName && (
                    <>
                      <span className="text-gray-400 font-normal mx-1.5 text-xs">▶</span>
                      <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        {parentComment.fullName}
                        {parentComment.userBadgeName && (
                          <span
                            title={parentComment.userBadgeName}
                            className={`inline-flex w-3 h-3 bg-gradient-to-r ${getBadgeVisuals(parentComment.userBadgeName)?.gradient || 'from-gray-400 to-gray-600'} rounded-full items-center justify-center text-white text-[6px] flex-shrink-0`}
                          >
                            {getBadgeVisuals(parentComment.userBadgeName)?.icon || '🎖️'}
                          </span>
                        )}
                      </span>
                    </>
                  )}
                </span>
                <span className="text-[10px] text-gray-400">{timeAgo(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed break-words">{comment.content}</p>
              
              {isOwner && (
                <div className="absolute top-2 right-2">
                   <button 
                     onClick={() => {
                       if (openDropdownId === comment.commentId) {
                         setOpenDropdownId(null);
                         setConfirmDeleteId(null);
                       } else {
                         setOpenDropdownId(comment.commentId);
                       }
                     }} 
                     className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                   >
                     <MoreHorizontal className="w-4 h-4" />
                   </button>
                   {openDropdownId === comment.commentId && (
                     <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 py-1">
                       {confirmDeleteId === comment.commentId ? (
                          <div className="p-3">
                             <p className="text-xs text-gray-800 font-medium mb-3 text-center">Chắc chắn xóa?</p>
                             <div className="flex gap-2 justify-center">
                                <button onClick={() => setConfirmDeleteId(null)} className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Hủy</button>
                                <button onClick={() => executeDelete(comment.commentId)} className="flex-1 px-2 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">Xóa</button>
                             </div>
                          </div>
                       ) : (
                         <>
                           <button 
                             onClick={() => { startEdit(comment.commentId, comment.content); setOpenDropdownId(null); }}
                             className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                           >
                             <Edit2 className="w-3.5 h-3.5" /> Sửa
                           </button>
                           <button 
                             onClick={() => setConfirmDeleteId(comment.commentId)}
                             className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                           >
                             <Trash2 className="w-3.5 h-3.5" /> Xóa
                           </button>
                         </>
                       )}
                     </div>
                   )}
                </div>
              )}
           </div>
           
           <div className="flex flex-col items-center ml-3 pt-2">
              <button onClick={() => handleLike(comment.commentId)}>
                 <Heart className={`w-4 h-4 ${comment.isLikedByCurrentUser ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}`} />
              </button>
              <span className="text-xs text-gray-500 mt-1">{comment.likeCount}</span>
           </div>
        </div>
        
        <div className="flex items-center gap-4 mt-1.5 ml-2">
          <button onClick={() => startReply(comment.commentId, comment.fullName)} className="text-xs font-medium text-gray-500 hover:text-gray-800">
              Trả lời
          </button>
        </div>
        
        {/* Render CommentInput trực tiếp bên dưới nếu đang Trả lời hoặc Sửa bình luận này */}
        {inputProps && ((inputProps.replyingToCommentId === comment.commentId) || (inputProps.editingCommentId === comment.commentId)) && (
          <div className="mt-3">
             <CommentInput {...inputProps} autoFocus={true} />
          </div>
        )}
      </div>
    </div>
  );
};

const CommentThread = ({ 
  rootComment, allComments, 
  currentUser, openDropdownId, setOpenDropdownId, confirmDeleteId, setConfirmDeleteId,
  startEdit, executeDelete, handleLike, startReply, inputProps
}: any) => {
  const [visibleCount, setVisibleCount] = useState(2);
  
  const getDescendants = (parentId: number): any[] => {
    const children = allComments.filter((c: any) => c.parentId === parentId).sort((a: any,b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    let descendants: any[] = [];
    for (const child of children) {
      descendants.push(child);
      descendants = descendants.concat(getDescendants(child.commentId));
    }
    return descendants;
  };

  const descendants = getDescendants(rootComment.commentId).sort((a: any,b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const visibleReplies = descendants.slice(0, visibleCount);
  const remaining = descendants.length - visibleCount;

  const commonProps = { currentUser, openDropdownId, setOpenDropdownId, confirmDeleteId, setConfirmDeleteId, startEdit, executeDelete, handleLike, startReply, inputProps };

  return (
    <div key={rootComment.commentId}>
      <CommentItem comment={rootComment} isReply={false} {...commonProps} />
      
      {descendants.length > 0 && (
        <div className="ml-[44px]">
          {visibleReplies.map((reply: any) => (
            <CommentItem 
              key={reply.commentId} 
              comment={reply} 
              isReply={true} 
              parentComment={allComments.find((c: any) => c.commentId === reply.parentId)} 
              {...commonProps}
            />
          ))}
          
          {remaining > 0 && (
            <button 
              onClick={() => setVisibleCount(prev => prev + 3)}
              className="mt-3 text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <span className="w-6 h-[1px] bg-gray-300 inline-block"></span> 
              Xem thêm {remaining} câu trả lời
              <ChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// COMPONENT POPUP BÌNH LUẬN VIDEO
// -------------------------------------------------------------
function CommentModal({ shortId, onClose }: { shortId: number; onClose: () => void }) {
  const navigate = useNavigate();
  const [comments, setComments] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: number; name: string } | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: number; content: string } | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  const { currentUser } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await getShortCommentsAPI(shortId);
        if (res.success) setComments(res.data);
      } catch (error) {
        toast.error("Không thể tải bình luận.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchComments();
  }, [shortId]);

  useEffect(() => {
    // Chỉ cuộn xuống đáy trong lần load đầu tiên nếu cần, hoặc khi thêm bình luận mới (tuỳ chọn)
    // listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const sendComment = async () => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để bình luận.');
      navigate('/login');
      return;
    }
    if (!inputText.trim()) return;
    try {
      setIsSubmitting(true);
      if (editingComment) {
        const res = await editShortCommentAPI(shortId, editingComment.id, inputText);
        if (res.success) {
          setComments((prev) => prev.map(c => c.commentId === editingComment.id ? res.data : c));
          setEditingComment(null);
        }
      } else {
        const res = await addShortCommentAPI(shortId, inputText, replyingTo?.id);
        if (res.success) {
          setComments((prev) => [...prev, res.data]);
        }
      }
      setInputText('');
      setReplyingTo(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeDelete = async (commentId: number) => {
    try {
      const res = await deleteShortCommentAPI(shortId, commentId);
      if (res.success) {
        // Đệ quy xóa cả cây bình luận trong state
        const getIdsToDelete = (id: number): number[] => {
          const children = comments.filter(c => c.parentId === id);
          return [id, ...children.flatMap(c => getIdsToDelete(c.commentId))];
        };
        const idsToDelete = getIdsToDelete(commentId);
        setComments((prev) => prev.filter(c => !idsToDelete.includes(c.commentId)));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setConfirmDeleteId(null);
      setOpenDropdownId(null);
    }
  };

  const handleLike = async (commentId: number) => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để thả tim.');
      navigate('/login');
      return;
    }
    try {
      setComments(prev => prev.map(c => {
        if (c.commentId === commentId) {
          return { ...c, isLikedByCurrentUser: !c.isLikedByCurrentUser, likeCount: c.isLikedByCurrentUser ? c.likeCount - 1 : c.likeCount + 1 };
        }
        return c;
      }));
      await toggleLikeShortCommentAPI(shortId, commentId);
    } catch (error) {
       toast.error('Vui lòng đăng nhập để thả tim.');
       setComments(prev => prev.map(c => {
        if (c.commentId === commentId) {
          return { ...c, isLikedByCurrentUser: !c.isLikedByCurrentUser, likeCount: !c.isLikedByCurrentUser ? c.likeCount - 1 : c.likeCount + 1 };
        }
        return c;
      }));
    }
  };

  const startReply = (commentId: number, name: string) => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để trả lời bình luận.');
      navigate('/login');
      return;
    }
    setEditingComment(null);
    setReplyingTo({ id: commentId, name });
    inputRef.current?.focus();
  };

  const startEdit = (commentId: number, content: string) => {
    setReplyingTo(null);
    setEditingComment({ id: commentId, content });
    setInputText(content);
    inputRef.current?.focus();
  };

  const cancelAction = () => {
    setReplyingTo(null);
    setEditingComment(null);
    setInputText('');
    setOpenDropdownId(null);
  };

  const inputProps = { 
    currentUser, 
    inputText, 
    setInputText, 
    sendComment, 
    isSubmittingComment: isSubmitting, 
    editingCommentId: editingComment?.id, 
    replyingToName: replyingTo?.name, 
    replyingToCommentId: replyingTo?.id,
    cancelReplyOrEdit: cancelAction 
  };

  const rootComments = comments.filter(c => !c.parentId);
  const commonProps = { currentUser, openDropdownId, setOpenDropdownId, confirmDeleteId, setConfirmDeleteId, startEdit, executeDelete, handleLike, startReply, allComments: comments, inputProps };

  return (
    <>
      {/* Overlay: Chỉ hiển thị trên mobile */}
      <div className="sm:hidden fixed inset-0 bg-black/40 z-40 cursor-pointer" onClick={onClose} />
      {/* Panel bình luận */}
      <div 
        className="fixed bottom-0 left-0 right-0 sm:absolute sm:top-0 sm:right-0 sm:bottom-0 sm:left-auto w-full sm:w-[350px] md:w-[400px] lg:w-[420px] h-[60vh] sm:h-full bg-white rounded-t-2xl sm:rounded-none sm:border-l sm:border-gray-200 shadow-[-20px_0_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-slide-in z-50 sm:z-10"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-semibold text-gray-900 text-sm">Bình luận ({comments.length})</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
          {isLoading ? (
            <div className="text-center py-10"><div className="w-6 h-6 border-2 border-[#2D5A3D] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-sm">Chưa có bình luận nào.</div>
          ) : (
            rootComments.map(c => <CommentThread key={c.commentId} rootComment={c} {...commonProps} />)
          )}
          <div ref={listEndRef} className="h-4 sm:h-16 flex-shrink-0" />
        </div>

        {/* NHẬP BÌNH LUẬN GỐC (Chỉ hiển thị nếu KHÔNG ĐANG SỬA VÀ KHÔNG ĐANG TRẢ LỜI) */}
        {!editingComment && !replyingTo && (
          <div className="pl-4 pr-4 sm:pr-[90px] py-3 border-t border-gray-100 flex flex-col gap-2 flex-shrink-0 bg-white">
            <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendComment()}
                placeholder="Thêm bình luận..."
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                disabled={isSubmitting}
              />
              <button
                onClick={sendComment}
                disabled={!inputText.trim() || isSubmitting}
                className="text-[#2D5A3D] disabled:text-gray-300 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// -------------------------------------------------------------
// TRANG SHORTS CHÍNH
// -------------------------------------------------------------
export default function ShortsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toggleFollow, isLoading: isToggleLoading } = useToggleFollow();
  
  // Dữ liệu từ API
  const [shortsVideos, setShortsVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Giao diện
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCommentsId, setActiveCommentsId] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  // FETCH DỮ LIỆU KHI VÀO TRANG
  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const res = await getFeedShortsAPI();
        if (res.success && res.data) {
          setShortsVideos(res.data);
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh sách video.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchShorts();
  }, []);

  // ĐIỀU HƯỚNG TRƯỢT VIDEO
  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || shortsVideos.length === 0) return;
      const clamped = Math.max(0, Math.min(shortsVideos.length - 1, index));
      if (clamped === currentIndex) return;
      
      setIsTransitioning(true);
      setCurrentIndex(clamped);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [currentIndex, isTransitioning, shortsVideos.length]
  );

  // Bắt sự kiện phím
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(currentIndex + 1);
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goTo(currentIndex - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, goTo]);

  // Đồng bộ Comment Modal khi lướt video
  useEffect(() => {
    setActiveCommentsId((prev) => {
      if (prev !== null && shortsVideos[currentIndex]) {
        return shortsVideos[currentIndex].shortId;
      }
      return prev;
    });
  }, [currentIndex, shortsVideos]);

  // Bắt sự kiện lăn chuột
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastWheel = 0;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheel < 600) return; // Debounce 600ms
      lastWheel = now;
      if (e.deltaY > 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [currentIndex, goTo]);

  // Bắt sự kiện Vuốt màn hình điện thoại
  const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 50) {
      if (delta > 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    }
    touchStartY.current = null;
  };

  // LOGIC THẢ TIM API (Optimistic UI Update)
  const toggleLike = async (id: number) => {
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để thả tim.');
      navigate('/login');
      return;
    }
    // 1. Cập nhật giao diện mượt trước
    setShortsVideos(prev => prev.map(v => {
      if (v.shortId === id) {
        return { 
          ...v, 
          isLikedByCurrentUser: !v.isLikedByCurrentUser, 
          likeCount: v.isLikedByCurrentUser ? v.likeCount - 1 : v.likeCount + 1 
        };
      }
      return v;
    }));

    // 2. Gửi lệnh lên máy chủ
    try {
      await toggleLikeShortAPI(id);
    } catch (error) {
      toast.error('Vui lòng đăng nhập để thả tim.');
      // 3. Rollback nếu lỗi
      setShortsVideos(prev => prev.map(v => {
        if (v.shortId === id) {
          return { 
            ...v, 
            isLikedByCurrentUser: !v.isLikedByCurrentUser, 
            likeCount: !v.isLikedByCurrentUser ? v.likeCount - 1 : v.likeCount + 1 
          };
        }
        return v;
      }));
    }
  };

  const handleFollowSeller = async (sellerId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error('Vui lòng đăng nhập để theo dõi.');
      navigate('/login');
      return;
    }
    const res = await toggleFollow(sellerId);
    if (res) {
      setShortsVideos(prev => prev.map(v => {
        if (v.sellerId === sellerId) {
          return { ...v, isFollowingSeller: res.isFollowing };
        }
        return v;
      }));
    }
  };

  // Nếu đang Load hoặc Hết Data
  if (isLoading) {
    return <div className="h-screen bg-black flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#2D5A3D] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (shortsVideos.length === 0) {
    return <div className="h-screen bg-black flex flex-col items-center justify-center text-white"><h2 className="text-xl font-bold">Chưa có video nào</h2><p className="text-gray-400 mt-2">Vui lòng quay lại sau.</p></div>;
  }

  // Lấy video đang chiếu
  const video = shortsVideos[currentIndex];

  const infoOverlayContent = (
    <>
      {/* Seller */}
      <div className="flex items-center gap-2 mb-3">
        <div 
          onClick={(e) => { e.stopPropagation(); navigate(`/profile/${video.sellerId}`); }}
          className="w-10 h-10 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white font-bold text-base border-2 border-white/30 shadow-lg overflow-hidden flex-shrink-0 cursor-pointer"
        >
           {video.sellerAvatar && video.sellerAvatar.length > 1 ? (
              <img src={video.sellerAvatar} alt="avatar" className="w-full h-full object-cover" />
           ) : (
              video.sellerName.charAt(0).toUpperCase()
           )}
        </div>
        <div>
          <span 
            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${video.sellerId}`); }}
            className="text-white font-semibold text-sm drop-shadow-md cursor-pointer hover:underline flex items-center gap-1"
          >
            {video.sellerName}
            {video.sellerBadgeName && (
              <span
                title={video.sellerBadgeName}
                className={`inline-flex w-3.5 h-3.5 bg-gradient-to-r ${getBadgeVisuals(video.sellerBadgeName)?.gradient || 'from-gray-400 to-gray-600'} rounded-full items-center justify-center text-white text-[7px] flex-shrink-0`}
              >
                {getBadgeVisuals(video.sellerBadgeName)?.icon || '🎖️'}
              </span>
            )}
          </span>
          {(!currentUser || currentUser.id !== video.sellerId) && (
            <button 
              onClick={(e) => handleFollowSeller(video.sellerId, e)}
              disabled={isToggleLoading}
              className={`ml-2 text-xs border rounded-full px-2 py-0.5 transition-colors disabled:opacity-50 ${
                video.isFollowingSeller 
                  ? 'text-white border-white/50 bg-white/20 hover:bg-white/30' 
                  : 'text-[#C4603A] border-[#C4603A]/60 bg-black/20 hover:bg-[#C4603A]/10'
              }`}
            >
              {video.isFollowingSeller ? 'Đang theo dõi' : '+ Follow'}
            </button>
          )}
        </div>
      </div>

      <p className="text-white text-sm font-medium leading-relaxed mb-2 drop-shadow-md max-w-xs">
        {video.caption}
      </p>

      {video.productId && video.productPrice && (
        <div className="inline-flex items-center gap-1.5 bg-[#2D5A3D]/90 backdrop-blur-sm rounded-full px-4 py-1.5 mb-3 cursor-pointer hover:bg-[#2D5A3D] transition-colors pointer-events-auto" onClick={() => navigate(`/product/${video.productId}`)}>
          <ShoppingBag className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-sm">
            Đang bán: {Number(video.productPrice).toLocaleString('vi-VN')}đ
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Music2 className="w-4 h-4 text-white flex-shrink-0 drop-shadow-md" />
        <div className="overflow-hidden flex-1 max-w-[200px]">
          <p className="text-white text-xs whitespace-nowrap animate-marquee drop-shadow-md">
            Nhạc nền gốc - @{video.sellerName}
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div
      ref={containerRef}
      className={`relative bg-[#0F0F0F] select-none overflow-hidden flex items-center justify-center sm:py-6 transition-all duration-500 ease-in-out ${activeCommentsId ? 'sm:pr-[350px] md:pr-[400px] lg:pr-[420px]' : ''}`}
      style={{ height: 'calc(100vh - 64px)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* THÔNG TIN VIDEO (Desktop) - Hiển thị ở góc dưới bên trái màn hình như cũ */}
      <div className="hidden sm:block absolute bottom-8 left-8 w-[300px] md:w-[350px] pointer-events-auto z-10">
        {infoOverlayContent}
      </div>

      {/* Tối ưu desktop: Khung video (giới hạn tỷ lệ) */}
      <div 
         className="relative w-full sm:w-[350px] md:w-[400px] lg:w-[420px] h-full bg-black sm:rounded-2xl transition-all duration-500 ease-in-out flex-shrink-0"
      >
        {/* Khung chứa video có overflow-hidden để cắt phần trượt */}
        <div className="absolute inset-0 overflow-hidden sm:rounded-2xl">
          {/* Video stack */}
          <div
            className="absolute inset-0 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(-${(currentIndex * 100) / shortsVideos.length}%)`, height: `${shortsVideos.length * 100}%` }}
          >
            {shortsVideos.map((v, i) => (
              <div key={v.shortId} className="relative w-full" style={{ height: `${100 / shortsVideos.length}%` }}>
                {Math.abs(currentIndex - i) <= 1 && (
                  <ShortVideoPlayer src={v.videoUrl} isActive={i === currentIndex} volume={volume} isMuted={isMuted} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* OVERLAY UI BÊN TRÊN VIDEO */}
        <div className="absolute inset-0 pointer-events-none">
          
          {/* Góc trái dưới: THÔNG TIN VIDEO (Mobile) - Chỉ hiển thị trên mobile */}
          <div className="absolute bottom-0 left-0 right-16 p-4 pointer-events-auto sm:hidden">
            {infoOverlayContent}
          </div>

          {/* NÚT TƯƠNG TÁC (Tym, Comment...) */}
          {/* Mobile: Bên trong video, góc phải dưới */}
          {/* Desktop: Bên ngoài video, lề phải */}
          <div className="absolute right-3 sm:-right-16 bottom-6 sm:bottom-4 flex flex-col items-center gap-4 sm:gap-5 pointer-events-auto">
            {/* Mũi tên lên xuống (Chỉ Desktop) */}
            <div className="hidden sm:flex flex-col items-center gap-2 mb-2">
              <button onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0} className="w-10 h-10 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all">
                <ChevronUp className="w-6 h-6 text-white" />
              </button>
              <button onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === shortsVideos.length - 1} className="w-10 h-10 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all">
                <ChevronDown className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Like */}
            <button onClick={() => toggleLike(video.shortId)} className="flex flex-col items-center gap-1">
              <div className={`w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${video.isLikedByCurrentUser ? 'bg-red-500/20 sm:bg-white/10 scale-110' : 'bg-white/10 sm:bg-white/10 hover:bg-white/20'}`}>
                <Heart className={`w-7 h-7 sm:w-5 sm:h-5 transition-all ${video.isLikedByCurrentUser ? 'text-red-500 fill-red-500 scale-110' : 'text-white sm:text-white'}`} />
              </div>
              <span className="text-white sm:text-white/80 text-xs font-semibold drop-shadow">{video.likeCount}</span>
            </button>

            {/* Comment */}
            <button onClick={() => setActiveCommentsId(activeCommentsId === video.shortId ? null : video.shortId)} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 sm:w-10 sm:h-10 bg-white/10 sm:bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <MessageCircle className="w-7 h-7 sm:w-5 sm:h-5 text-white sm:text-white" />
              </div>
              <span className="text-white sm:text-white/80 text-xs font-semibold drop-shadow">{video.commentCount}</span>
            </button>

            {/* Chia sẻ */}
            <button className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 sm:w-10 sm:h-10 bg-white/10 sm:bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              </div>
              <span className="text-white sm:text-white/80 text-xs font-semibold drop-shadow">Chia sẻ</span>
            </button>

            {/* Âm lượng (Chỉ Desktop) */}
            <div className="hidden sm:flex flex-col items-center gap-1 relative"
                 onMouseEnter={() => setShowVolumeSlider(true)}
                 onMouseLeave={() => setShowVolumeSlider(false)}
            >
              {showVolumeSlider && (
                <div className="absolute bottom-[50px] mb-2 bg-black/60 rounded-full py-3 px-2 flex flex-col items-center justify-center backdrop-blur-md z-50 h-[100px]">
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setVolume(val);
                      if (val > 0) setIsMuted(false);
                      else setIsMuted(true);
                    }}
                    className="w-1.5 h-20 appearance-none bg-white/30 rounded-full outline-none cursor-pointer overflow-hidden"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl', WebkitAppearance: 'slider-vertical' } as any}
                  />
                </div>
              )}
              <button onClick={() => setIsMuted(!isMuted)} className="flex flex-col items-center gap-1 mt-2">
                <div className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                </div>
              </button>
            </div>

            {/* Đĩa nhạc (Chỉ hiển thị trên mobile) */}
            <div className="mt-2 sm:hidden"><SpinningDisc /></div>
          </div>
        </div>
      </div>

      {/* (Mũi tên toàn màn hình đã được dời vào bên trong video) */}

      {/* Modal Gọi API Bình luận */}
      {activeCommentsId && (
        <CommentModal shortId={activeCommentsId} onClose={() => setActiveCommentsId(null)} />
      )}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        .animate-marquee { animation: marquee 8s linear infinite; }
        @keyframes slideInMobile { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideInDesktop { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slideInMobile 0.3s ease-out; }
        @media (min-width: 640px) {
          .animate-slide-in { animation: slideInDesktop 0.3s ease-out; }
        }
      `}</style>
    </div>
  );
}