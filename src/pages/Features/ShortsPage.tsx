import { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, X, Send, ThumbsUp, ChevronUp, ChevronDown, Music2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const shortsVideos = [
  {
    id: 1,
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1420&fit=crop&auto=format',
    title: 'Cách phối đồ vintage cực chất cho mùa thu 🍂',
    price: 450000,
    seller: 'fashionista_vn',
    avatar: 'F',
    likes: 2341,
    comments: 156,
    song: 'Vintage Vibes - Lo-fi Mix',
  },
  {
    id: 2,
    thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1420&fit=crop&auto=format',
    title: 'Review túi xách secondhand hàng hiệu giá sốc 👜',
    price: 2990000,
    seller: 'luxury_deals',
    avatar: 'L',
    likes: 1856,
    comments: 89,
    song: 'Luxury Life - Aesthetic',
  },
  {
    id: 3,
    thumbnail: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=1420&fit=crop&auto=format',
    title: 'Bộ sưu tập giày thể thao cực hiếm 👟',
    price: 850000,
    seller: 'sneaker_head',
    avatar: 'S',
    likes: 3214,
    comments: 234,
    song: 'Sneaker Culture - Hip Hop',
  },
  {
    id: 4,
    thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1420&fit=crop&auto=format',
    title: 'Thrift flip - Biến đồ cũ thành mới siêu xịn ✨',
    price: 320000,
    seller: 'thrift_queen',
    avatar: 'T',
    likes: 4102,
    comments: 567,
    song: 'Thrift Shop Remix - Pop',
  },
  {
    id: 5,
    thumbnail: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=1420&fit=crop&auto=format',
    title: 'Áo khoác da vintage đỉnh cao không thể bỏ qua 🖤',
    price: 1890000,
    seller: 'vintage_style',
    avatar: 'V',
    likes: 2890,
    comments: 198,
    song: 'Dark Aesthetic - Indie',
  },
  {
    id: 6,
    thumbnail: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1420&fit=crop&auto=format',
    title: 'Váy hè xinh xắn giá cực tốt cho mùa nắng ☀️',
    price: 750000,
    seller: 'summer_vibes',
    avatar: 'S',
    likes: 1567,
    comments: 78,
    song: 'Summer Mood - Tropical',
  },
];

interface Comment {
  id: number;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
}

const BASE_COMMENTS: Comment[] = [
  { id: 1, user: 'style_hunter99', avatar: 'S', text: 'Đẹp quá!! Mình thích phong cách này lắm 😍', time: '3 phút trước', likes: 47, liked: false },
  { id: 2, user: 'thu_fashionista', avatar: 'T', text: 'Giá có thể negotiate không bạn ơi? Mình muốn mua lắm', time: '11 phút trước', likes: 12, liked: false },
  { id: 3, user: 'minh_trendyy', avatar: 'M', text: 'Mình đã inbox bạn rồi nhé! Chờ rep nha 🙏', time: '24 phút trước', likes: 5, liked: false },
  { id: 4, user: 'zara_lover_vn', avatar: 'Z', text: 'Phối với quần jeans rách là chuẩn không cần chỉnh luôn 🔥🔥', time: '45 phút trước', likes: 89, liked: false },
  { id: 5, user: 'hanoi_thrift', avatar: 'H', text: 'Ship về Hà Nội được không bạn? Bao nhiêu phí vậy?', time: '1 giờ trước', likes: 8, liked: false },
  { id: 6, user: 'gen_z_fashion', avatar: 'G', text: 'Video quá đỉnh, follow luôn bạn ơi!! 💯', time: '2 giờ trước', likes: 134, liked: false },
  { id: 7, user: 'vintage_collector', avatar: 'V', text: 'Cái này mình thấy ở shop vintage Saigon rồi, authentic nhé mọi người', time: '3 giờ trước', likes: 23, liked: false },
  { id: 8, user: 'linh_trendsetter', avatar: 'L', text: 'Bạn có thêm màu khác không? Mình muốn xem thêm', time: '5 giờ trước', likes: 16, liked: false },
];

const COMMENT_POOL = [
  { user: 'bich_stylish', avatar: 'B', text: 'Wow quá đẹp, sản phẩm còn không bạn?' },
  { user: 'khanh_fashion', avatar: 'K', text: 'Mình đã share cho cả group fashion của mình rồi nhé! ❤️' },
  { user: 'nam_streetwear', avatar: 'N', text: 'Phong cách quá xịn, muốn sở hữu ngay!' },
  { user: 'trang_minimalist', avatar: 'T', text: 'Clean và minimal, đúng gu mình luôn 🖤' },
  { user: 'hoang_sneakerhead', avatar: 'H', text: 'Giá tốt thật, ủng hộ người bán Việt Nam!' },
];

function CommentModal({
  video,
  onClose,
}: {
  video: typeof shortsVideos[0];
  onClose: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>(
    BASE_COMMENTS.slice(0, Math.min(6, video.comments))
  );
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const sendComment = () => {
    if (!inputText.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      user: 'user1',
      avatar: 'M',
      text: inputText.trim(),
      time: 'Vừa xong',
      likes: 0,
      liked: false,
    };
    setComments((prev) => [...prev, newComment]);
    setInputText('');

    const pool = COMMENT_POOL[Math.floor(Math.random() * COMMENT_POOL.length)];
    setTimeout(() => {
      setComments((prev) => [
        ...prev,
        { id: Date.now() + 1, ...pool, time: 'Vừa xong', likes: 0, liked: false },
      ]);
    }, 1800);
  };

  const toggleLike = (id: number) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden sm:mx-4"
        style={{ maxHeight: '80vh' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{video.comments} bình luận</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[240px]">{video.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {comment.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-gray-900">@{comment.user}</span>
                  <span className="text-[10px] text-gray-400">{comment.time}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{comment.text}</p>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => toggleLike(comment.id)}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      comment.liked ? 'text-[#2D5A3D]' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${comment.liked ? 'fill-[#2D5A3D]' : ''}`} />
                    <span>{comment.likes > 0 ? comment.likes : 'Thích'}</span>
                  </button>
                  <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    Trả lời
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div ref={listEndRef} />
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-3 flex-shrink-0 bg-white">
          <div className="w-8 h-8 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            M
          </div>
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendComment()}
              placeholder="Thêm bình luận..."
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={sendComment}
              disabled={!inputText.trim()}
              className="text-[#2D5A3D] disabled:text-gray-300 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpinningDisc() {
  return (
    <div className="w-10 h-10 rounded-full border-[3px] border-white/30 overflow-hidden animate-spin" style={{ animationDuration: '3s' }}>
      <div className="w-full h-full bg-gradient-to-br from-[#2D5A3D] to-[#2a0a16] flex items-center justify-center">
        <div className="w-3 h-3 bg-white/80 rounded-full" />
      </div>
    </div>
  );
}

export default function ShortsPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Set<number>>(new Set());
  const [activeComments, setActiveComments] = useState<typeof shortsVideos[0] | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      const clamped = Math.max(0, Math.min(shortsVideos.length - 1, index));
      if (clamped === currentIndex) return;
      setIsTransitioning(true);
      setCurrentIndex(clamped);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [currentIndex, isTransitioning]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(currentIndex + 1);
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goTo(currentIndex - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, goTo]);

  // Wheel scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastWheel = 0;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheel < 600) return;
      lastWheel = now;
      if (e.deltaY > 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [currentIndex, goTo]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 50) {
      if (delta > 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    }
    touchStartY.current = null;
  };

  const toggleLike = (id: number) => {
    setLikedVideos((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const video = shortsVideos[currentIndex];

  return (
    <div
      ref={containerRef}
      className="relative bg-black select-none overflow-hidden"
      style={{ height: 'calc(100vh - 64px)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video stack — slide up/down with transform */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(-${currentIndex * 100}%)`, height: `${shortsVideos.length * 100}%` }}
      >
        {shortsVideos.map((v) => (
          <div key={v.id} className="relative w-full" style={{ height: `${100 / shortsVideos.length}%` }}>
            {/* Background image */}
            <img
              src={v.thumbnail}
              alt={v.title}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          </div>
        ))}
      </div>

      {/* Fixed overlay UI — always on top */}
      <div className="absolute inset-0 flex pointer-events-none">
        {/* Bottom-left: info */}
        <div className="absolute bottom-0 left-0 right-16 p-5 pointer-events-auto">
          {/* Seller */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white font-bold text-base border-2 border-white/30 shadow-lg">
              {video.avatar}
            </div>
            <div>
              <span className="text-white font-semibold text-sm">@{video.seller}</span>
              <button className="ml-2 text-xs text-[#C4603A] border border-[#C4603A]/60 rounded-full px-2 py-0.5 hover:bg-[#C4603A]/10 transition-colors">
                + Follow
              </button>
            </div>
          </div>

          {/* Title */}
          <p className="text-white text-sm font-medium leading-relaxed mb-2 drop-shadow-md max-w-xs">
            {video.title}
          </p>

          {/* Price tag */}
          <div className="inline-flex items-center gap-1.5 bg-[#2D5A3D]/80 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
            <span className="text-[#C4603A] font-bold text-sm">
              {video.price.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {/* Music info */}
          <div className="flex items-center gap-2">
            <Music2 className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
            <div className="overflow-hidden flex-1 max-w-[200px]">
              <p className="text-white/70 text-xs whitespace-nowrap animate-marquee">
                {video.song}
              </p>
            </div>
          </div>
        </div>

        {/* Right side: action buttons */}
        <div className="absolute right-3 bottom-6 flex flex-col items-center gap-5 pointer-events-auto">
          {/* Like */}
          <button
            onClick={() => toggleLike(video.id)}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                likedVideos.has(video.id)
                  ? 'bg-red-500/20 scale-110'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Heart
                className={`w-6 h-6 transition-all ${
                  likedVideos.has(video.id) ? 'text-red-400 fill-red-400 scale-110' : 'text-white'
                }`}
              />
            </div>
            <span className="text-white text-xs font-medium drop-shadow">
              {(likedVideos.has(video.id) ? video.likes + 1 : video.likes).toLocaleString()}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setActiveComments(video)}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium drop-shadow">{video.comments}</span>
          </button>

          {/* Xem sản phẩm */}
          <button
            onClick={() => navigate(`/product/${video.id}`)}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-11 h-11 bg-[#C4603A] hover:bg-[#A14E2D] rounded-full flex items-center justify-center transition-colors shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium drop-shadow">Xem SP</span>
          </button>

          {/* Spinning disc */}
          <div className="mt-1">
            <SpinningDisc />
          </div>
        </div>

        {/* Progress dots — vertical on left edge */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-auto">
          {shortsVideos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'bg-white h-5 w-1'
                  : 'bg-white/30 h-1.5 w-1 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Navigation arrows */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="w-8 h-8 bg-white/10 hover:bg-white/25 disabled:opacity-20 rounded-full flex items-center justify-center transition-all"
          >
            <ChevronUp className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === shortsVideos.length - 1}
            className="w-8 h-8 bg-white/10 hover:bg-white/25 disabled:opacity-20 rounded-full flex items-center justify-center transition-all"
          >
            <ChevronDown className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Top label */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full px-4 py-1.5">
            <span className="text-white/60 text-xs font-medium">REVORA SHORTS</span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-white/80 text-xs font-semibold">
              {currentIndex + 1} / {shortsVideos.length}
            </span>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      {activeComments && (
        <CommentModal
          video={activeComments}
          onClose={() => setActiveComments(null)}
        />
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
