import { useState, useEffect } from 'react';
import { Heart, Flag, MessageCircle, Star, Shield, Package, Send, ThumbsUp } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { 
  getProductDetailAPI, 
  getProductCommentsAPI, 
  addProductCommentAPI, 
  toggleLikeCommentAPI 
} from '../../features/products/services/productApi';
import { ProductDetailResponseDto } from '../../features/products/types';

// Hàm helper tính thời gian đăng bình luận
const timeAgo = (dateStr: string) => {
  const diff = new Date().getTime() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States Sản Phẩm
  const [productDetail, setProductDetail] = useState<ProductDetailResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // States Bình Luận
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // FETCH DỮ LIỆU TỪ BACKEND
  useEffect(() => {
    window.scrollTo(0, 0); 

    const fetchData = async () => {
      if (!id) {
        setIsLoading(false);
        setProductDetail(null);
        return;
      }

      try {
        setIsLoading(true);
        setProductDetail(null); 
        
        // Gọi API song song để tối ưu tốc độ
        const [productRes, commentsRes] = await Promise.all([
          getProductDetailAPI(id),
          getProductCommentsAPI(id).catch(() => ({ success: false, data: [] })) // Fallback nếu lỗi comment
        ]);
        
        if (productRes && productRes.success && productRes.data) {
          setProductDetail(productRes.data);
        } else if (productRes && productRes.productId) {
          setProductDetail(productRes);
        } else {
          setProductDetail(null);
        }

        if (commentsRes && commentsRes.success) {
          setComments(commentsRes.data);
        }

      } catch (error) {
        console.error('Lỗi lấy dữ liệu:', error);
        toast.error('Không thể tải thông tin sản phẩm.');
        setProductDetail(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // LOGIC NHÚNG ZALO & CHAT NỘI BỘ
  const openZaloChat = () => {
    if (!productDetail?.sellerPhone) {
      return toast.error('Người bán chưa cập nhật số điện thoại Zalo.');
    }
    
    let phone = productDetail.sellerPhone.replace(/\s+/g, '');
    if (phone.startsWith('+84')) phone = '0' + phone.slice(3);

    window.open(`https://zalo.me/${phone}`, '_blank');
  };

  const openInternalChat = () => {
    if (!productDetail) return;
    const formattedPrice = Number(productDetail.price || 0).toLocaleString('vi-VN') + 'đ';
    const message = `Chào shop! Sản phẩm "${productDetail.title}" (${formattedPrice}) còn hàng không ạ?`;
    
    window.dispatchEvent(
      new CustomEvent('revora:openChat', {
        detail: {
          seller: { 
            username: productDetail.sellerUsername, 
            name: productDetail.sellerName, 
            avatar: productDetail.sellerAvatar 
          },
          product: { 
            id: productDetail.productId, 
            name: productDetail.title, 
            price: formattedPrice, 
            image: productDetail.imageUrls && productDetail.imageUrls.length > 0 ? productDetail.imageUrls[0] : ''
          },
          prefilledMessage: message,
          autoSend: false,
          source: 'chat',
        },
      })
    );
  };

  // THÊM BÌNH LUẬN
  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;
    
    try {
      setIsSubmittingComment(true);
      const res = await addProductCommentAPI(id, newComment);
      if (res.success) {
        setComments([res.data, ...comments]); // Đẩy bình luận mới lên đầu
        setNewComment('');
        toast.success('Đã gửi bình luận!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Vui lòng đăng nhập để bình luận.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // LIKE BÌNH LUẬN (Optimistic UI Update)
  const handleLikeComment = async (commentId: number) => {
    if (!id) return;

    // Cập nhật UI trước cho mượt
    setComments(comments.map(c => 
      c.commentId === commentId 
        ? { ...c, isLikedByCurrentUser: !c.isLikedByCurrentUser, likeCount: c.isLikedByCurrentUser ? c.likeCount - 1 : c.likeCount + 1 } 
        : c
    ));

    try {
      await toggleLikeCommentAPI(id, commentId);
    } catch (error) {
      toast.error('Vui lòng đăng nhập để thích bình luận.');
      // Hoàn tác UI nếu lỗi
      setComments(comments.map(c => 
        c.commentId === commentId 
          ? { ...c, isLikedByCurrentUser: !c.isLikedByCurrentUser, likeCount: !c.isLikedByCurrentUser ? c.likeCount - 1 : c.likeCount + 1 } 
          : c
      ));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-[#2D5A3D]/20 border-t-[#2D5A3D] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!productDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-32">
        <div className="text-6xl mb-4 opacity-50">📦</div>
        <h2 className="text-2xl text-gray-900 font-bold mb-2">Sản phẩm không tồn tại</h2>
        <p className="text-gray-500 mb-6">Sản phẩm này có thể đã bị xóa hoặc không còn trên hệ thống.</p>
        <button onClick={() => navigate('/all-products')} className="px-6 py-2 bg-[#2D5A3D] text-white rounded-full">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const images = productDetail.imageUrls && productDetail.imageUrls.length > 0 
    ? productDetail.imageUrls 
    : ['https://via.placeholder.com/800x1000?text=Chưa+Có+Ảnh'];

  const formattedPrice = Number(productDetail.price || 0).toLocaleString('vi-VN') + 'đ';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* CỘT TRÁI: HÌNH ẢNH & VIDEO */}
          <div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg mb-4 border border-gray-100">
              <div className="aspect-[4/5] bg-gray-100 relative">
                <img
                  src={images[selectedImage]}
                  alt={productDetail.title}
                  className="w-full h-full object-cover"
                />
                {productDetail.isPremium && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-[#C4603A] to-[#d4724a] text-white text-sm px-4 py-2 rounded-full shadow-lg font-semibold flex items-center gap-1.5 animate-pulse">
                    <span>✨ Premium</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Thumbnails nhỏ */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-[#2D5A3D]' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Video Shorts */}
            {productDetail.videoUrl && (
              <div className="mt-6 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-5 h-5 text-[#C4603A]" />
                  <span className="font-medium text-lg">Video Premium Shorts</span>
                </div>
                <video 
                  src={productDetail.videoUrl} 
                  controls 
                  className="w-full rounded-xl aspect-video object-contain bg-black mb-4 shadow-md" 
                />
              </div>
            )}
          </div>

          {/* CỘT PHẢI: THÔNG TIN SP & NGƯỜI BÁN */}
          <div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="pr-4">
                  <h1 className="text-3xl text-gray-900 font-bold mb-3">{productDetail.title}</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold bg-green-100 text-green-800 px-3 py-1.5 rounded-full">
                      {productDetail.condition}
                    </span>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full">
                      {productDetail.categoryName}
                    </span>
                  </div>
                </div>
                <button className="p-3 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0 text-gray-400">
                  <Heart className="w-6 h-6" />
                </button>
              </div>

              <div className="text-4xl font-bold text-[#2D5A3D] mb-8">{formattedPrice}</div>

              {/* Chi tiết kĩ thuật */}
              <div className="space-y-4 mb-8 pb-8 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Thương Hiệu</span>
                  <span className="text-gray-900 font-semibold">{productDetail.brand || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Đăng ngày</span>
                  <span className="text-gray-900">{productDetail.createdAt ? new Date(productDetail.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Lượt xem</span>
                  <span className="text-gray-900">{productDetail.viewCount} lượt</span>
                </div>
              </div>

              {/* Box Người bán */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-sm">
                    {productDetail.sellerAvatar && productDetail.sellerAvatar.length > 1 ? (
                      <img src={productDetail.sellerAvatar} alt={productDetail.sellerName} className="w-full h-full object-cover" />
                    ) : (
                      productDetail.sellerName ? productDetail.sellerName.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">{productDetail.sellerName}</h3>
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]" title="Đã xác thực">✓</div>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">@{productDetail.sellerUsername}</div>
                  </div>
                </div>

                {/* Các nút liên hệ */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={openZaloChat}
                    className="w-full bg-[#0068FF] text-white py-3.5 rounded-xl hover:bg-[#0055D4] transition-colors font-semibold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat Zalo
                  </button>
                  <button
                    onClick={openInternalChat}
                    className="w-full bg-[#2D5A3D] text-white py-3.5 rounded-xl hover:bg-[#234830] transition-colors font-semibold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat Nội Bộ
                  </button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <Shield className="w-6 h-6 text-[#2D5A3D] mx-auto mb-2 opacity-80" />
                  <div className="text-xs text-gray-600 font-medium">Bảo Vệ Người Mua</div>
                </div>
                <div className="text-center">
                  <Package className="w-6 h-6 text-[#2D5A3D] mx-auto mb-2 opacity-80" />
                  <div className="text-xs text-gray-600 font-medium">Giao Dịch An Toàn</div>
                </div>
                <div className="text-center">
                  <Flag className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors cursor-pointer mx-auto mb-2" />
                  <div className="text-xs text-gray-600 font-medium">Báo Cáo Vi Phạm</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MÔ TẢ CHI TIẾT */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Mô Tả Sản Phẩm</h2>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {productDetail.description}
          </div>
        </div>

        {/* BÌNH LUẬN (Real Data) */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-[#2D5A3D]" />
              Hỏi Đáp & Đánh Giá ({comments.length})
            </h2>
          </div>

          <div className="mb-8">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                U
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Bạn có thắc mắc gì về sản phẩm này?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 resize-none bg-gray-50 focus:bg-white"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="flex items-center gap-2 bg-[#2D5A3D] text-white px-6 py-2.5 rounded-full hover:bg-[#234830] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingComment ? 'Đang gửi...' : 'Gửi câu hỏi'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.commentId} className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm flex-shrink-0 overflow-hidden">
                  {comment.avatarUrl && comment.avatarUrl.length > 1 ? (
                     <img src={comment.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                     (comment.fullName || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{comment.fullName}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 ml-2">
                    <button
                      onClick={() => handleLikeComment(comment.commentId)}
                      className={`flex items-center gap-1.5 text-xs transition-colors font-medium ${
                        comment.isLikedByCurrentUser ? 'text-[#2D5A3D]' : 'text-gray-500 hover:text-[#2D5A3D]'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${comment.isLikedByCurrentUser ? 'fill-[#2D5A3D]' : ''}`} />
                      <span>{comment.likeCount > 0 ? comment.likeCount : 'Hữu ích'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}