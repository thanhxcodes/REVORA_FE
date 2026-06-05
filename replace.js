const fs = require('fs');
let code = fs.readFileSync('src/pages/Features/ShortsPage.tsx', 'utf-8');

const replacement = `import { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, X, Send, ChevronUp, ChevronDown, Music2, ShoppingBag, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../providers/authProvider/AuthContext';

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
  if (minutes < 60) return \`\${minutes} phút trước\`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return \`\${hours} giờ trước\`;
  return \`\${Math.floor(hours / 24)} ngày trước\`;
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
function ShortVideoPlayer({ src, isActive }: { src: string; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isActive) {
      if (video.readyState === 0) {
        video.load();
      }
      video.play().catch((e) => console.log("Auto-play prevented:", e));
    } else {
      video.pause();
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={isActive ? src : undefined}
      style={{ transform: 'translateZ(0)' }}
      className="absolute inset-0 w-full h-full object-contain bg-black"
      loop
      playsInline
      preload={isActive ? "auto" : "none"}
    />
  );
}

// -------------------------------------------------------------
// COMPONENT POPUP BÌNH LUẬN VIDEO
// -------------------------------------------------------------
function CommentModal({ shortId, onClose }: { shortId: number; onClose: () => void }) {
  const [comments, setComments] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: number; name: string } | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: number; content: string } | null>(null);
  
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
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const sendComment = async () => {
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

  const handleDelete = async (commentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    try {
      const res = await deleteShortCommentAPI(shortId, commentId);
      if (res.success) {
        setComments((prev) => prev.filter(c => c.commentId !== commentId && c.parentId !== commentId));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  const handleLike = async (commentId: number) => {
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
  };

  const rootComments = comments.filter(c => !c.parentId);
  const childComments = comments.filter(c => c.parentId);

  const renderComment = (comment: any, isReply = false) => {
    const replies = childComments.filter(c => c.parentId === comment.commentId);
    const isOwner = currentUser?.userId === comment.userId;

    return (
      <div key={comment.commentId} className={\`flex gap-3 \${isReply ? 'ml-10 mt-3' : 'mt-5'}\`}>
        <div className={\`\${isReply ? 'w-7 h-7' : 'w-9 h-9'} bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden\`}>
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
                  <span className="text-sm font-bold text-gray-900">{comment.fullName}</span>
                  <span className="text-[10px] text-gray-400">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed break-words">{comment.content}</p>
                
                {isOwner && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white/90 px-2 rounded-full shadow-sm">
                     <button onClick={() => startEdit(comment.commentId, comment.content)} className="text-blue-500 hover:text-blue-700 p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                     <button onClick={() => handleDelete(comment.commentId)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
             </div>
             
             <div className="flex flex-col items-center ml-3 pt-2">
                <button onClick={() => handleLike(comment.commentId)}>
                   <Heart className={\`w-4 h-4 \${comment.isLikedByCurrentUser ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}\`} />
                </button>
                <span className="text-xs text-gray-500 mt-1">{comment.likeCount}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-4 mt-1.5 ml-2">
            {!isReply && (
                <button onClick={() => startReply(comment.commentId, comment.fullName)} className="text-xs font-medium text-gray-500 hover:text-gray-800">
                    Trả lời
                </button>
            )}
          </div>

          {replies.length > 0 && (
            <div className="replies-container">
               {replies.map(r => renderComment(r, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden sm:mx-4" style={{ maxHeight: '80vh', height: '600px' }}>
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-semibold text-gray-900 text-sm">Bình luận ({comments.length})</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
          {isLoading ? (
            <div className="text-center py-10"><div className="w-6 h-6 border-2 border-[#2D5A3D] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-sm">Chưa có bình luận nào.</div>
          ) : (
            rootComments.map(c => renderComment(c))
          )}
          <div ref={listEndRef} />
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex flex-col gap-2 flex-shrink-0 bg-white">
          {(replyingTo || editingComment) && (
            <div className="flex items-center justify-between px-2 text-xs text-gray-500">
              <span>{replyingTo ? \`Đang trả lời @\${replyingTo.name}\` : 'Đang sửa bình luận'}</span>
              <button onClick={cancelAction} className="text-red-500 font-medium">Hủy</button>
            </div>
          )}
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendComment()}
              placeholder={replyingTo ? \`Trả lời @\${replyingTo.name}...\` : "Thêm bình luận..."}
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
      </div>
    </div>
  );
}`;

const startIdx = code.indexOf('import { useState');
const endIdx = code.indexOf('// -------------------------------------------------------------\r\n// TRANG SHORTS CHÍNH');
if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + replacement + '\n\n' + code.substring(endIdx);
  fs.writeFileSync('src/pages/Features/ShortsPage.tsx', code);
  console.log('Successfully replaced code!');
} else {
  console.log('Could not find indices! startIdx: ' + startIdx + ', endIdx: ' + endIdx);
}
