import { useState } from 'react';
import { Heart, Share2, Flag, MessageCircle, Star, Shield, Package, Clock, Send, ThumbsUp } from 'lucide-react';
import { useParams } from 'react-router-dom';
import ProductCard from './components/ProductCard';

interface Comment {
  id: number;
  user: string;
  avatar: string;
  avatarColor: string;
  comment: string;
  date: string;
  likes: number;
  isLiked: boolean;
  badge?: { icon: string; gradient: string } | null;
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    user: 'thu_shopaholic',
    avatar: 'T',
    avatarColor: '#2D5A3D',
    comment: 'Áo này còn không bạn? Mình muốn xem thêm ảnh chi tiết phần cổ áo được không?',
    date: '2 giờ trước',
    likes: 5,
    isLiked: false,
    badge: { icon: '💎', gradient: 'from-purple-500 to-pink-500' },
  },
  {
    id: 2,
    user: 'minh_style',
    avatar: 'M',
    avatarColor: '#0f3460',
    comment: 'Chất lượng da như thế nào bạn? Có bị bong tróc không?',
    date: '5 giờ trước',
    likes: 3,
    isLiked: true,
    badge: { icon: '✓', gradient: 'from-blue-500 to-blue-600' },
  },
  {
    id: 3,
    user: 'linh_trendy',
    avatar: 'L',
    avatarColor: '#533483',
    comment: 'Áo đẹp quá! Giao hàng tận nơi được không bạn?',
    date: '1 ngày trước',
    likes: 8,
    isLiked: false,
    badge: null,
  },
  {
    id: 4,
    user: 'nam_vintage',
    avatar: 'N',
    avatarColor: '#2d6a4f',
    comment: 'Mình cao 1m75 nặng 65kg mặc size này vừa không nhỉ?',
    date: '1 ngày trước',
    likes: 2,
    isLiked: false,
    badge: { icon: '🏆', gradient: 'from-orange-500 to-red-500' },
  },
  {
    id: 5,
    user: 'phuong_collector',
    avatar: 'P',
    avatarColor: '#b5451b',
    comment: 'Áo vintage đúng chuẩn! Mình đã mua đồ của bạn nhiều lần rồi, rất uy tín 👍',
    date: '2 ngày trước',
    likes: 12,
    isLiked: true,
    badge: { icon: '⭐', gradient: 'from-[#2D5A3D] to-[#3D7054]' },
  },
];

// Mock seller info — backend sẽ trả về kèm product
const SELLER_INFO = {
  username: 'fashionista_22',
  name: 'fashionista_22',
  avatar: 'F',
  phone: '0912345678',
  zaloPhone: '0912345678',
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const productInfo = {
    id: id || '1',
    name: 'Áo Khoác Da Vintage Cao Cấp',
    price: '1.890.000đ',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
    seller: SELLER_INFO,
  };

  const openSellerChat = (viaZalo: boolean) => {
    const message = `Chào shop! Sản phẩm "${productInfo.name}" (${productInfo.price}) còn hàng không ạ?`;
    window.dispatchEvent(
      new CustomEvent('revora:openChat', {
        detail: {
          seller: productInfo.seller,
          product: {
            id: productInfo.id,
            name: productInfo.name,
            price: productInfo.price,
            image: productInfo.image,
          },
          prefilledMessage: message,
          autoSend: viaZalo,
          source: viaZalo ? 'zalo' : 'chat',
        },
      })
    );
  };
  const [selectedImage, setSelectedImage] = useState(0);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');

  const handleLikeComment = (commentId: number) => {
    setComments(comments.map(comment =>
      comment.id === commentId
        ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
        : comment
    ));
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: comments.length + 1,
        user: 'user_current',
        avatar: 'U',
        avatarColor: '#2D5A3D',
        comment: newComment,
        date: 'Vừa xong',
        likes: 0,
        isLiked: false,
      };
      setComments([newCommentObj, ...comments]);
      setNewComment('');
    }
  };

  const images = [
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
  ];

  const relatedProducts = [
    {
      id: 10,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
      title: 'Áo Bomber Da Đen',
      price: 1650000,
      condition: 'Tốt',
      seller: 'vintage_co',
      views: 432,
    },
    {
      id: 11,
      image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400',
      title: 'Áo Khoác Da Lộn Nâu',
      price: 2100000,
      condition: 'Tuyệt Vời',
      seller: 'retro_finds',
      views: 678,
    },
    {
      id: 12,
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
      title: 'Áo Khoác Denim Vintage',
      price: 950000,
      condition: 'Như Mới',
      seller: 'jean_collector',
      views: 234,
    },
    {
      id: 13,
      image: 'https://images.unsplash.com/photo-1548126032-079b-6c6b2b5b?w=400',
      title: 'Áo Khoác Phong Cách Quân Đội',
      price: 1400000,
      condition: 'Tốt',
      seller: 'army_surplus',
      views: 321,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg mb-4">
              <div className="aspect-[4/5] bg-gray-100">
                <img
                  src={images[selectedImage]}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-2xl overflow-hidden ${
                    selectedImage === index ? 'ring-4 ring-[#2D5A3D]' : ''
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Video Preview */}
            <div className="mt-6 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="w-5 h-5 text-[#C4603A]" />
                <span className="font-medium">Video Premium</span>
              </div>
              <p className="text-sm text-white/80 mb-4">Xem video review chi tiết và tips phối đồ từ người bán</p>
              <button className="bg-white text-[#2D5A3D] px-6 py-2 rounded-full text-sm hover:shadow-lg transition-all">
                Xem Video
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl text-gray-900 mb-2">Áo Khoác Da Vintage Cao Cấp</h1>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">Like New</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full">Premium</span>
                  </div>
                </div>
                <button className="p-3 rounded-full hover:bg-gray-100 transition-colors">
                  <Heart className="w-6 h-6 text-[#2D5A3D]" />
                </button>
              </div>

              <div className="text-4xl text-[#2D5A3D] mb-6">1.890.000đ</div>

              {/* Product Details */}
              <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Danh Mục</span>
                  <span className="text-gray-900">Áo Khoác</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Kích Thước</span>
                  <span className="text-gray-900">M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Thương Hiệu</span>
                  <span className="text-gray-900">Vintage Collection</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tình Trạng</span>
                  <span className="text-gray-900">Như Mới (9/10)</span>
                </div>
              </div>

              {/* Style Tags */}
              <div className="mb-8">
                <h3 className="text-sm text-gray-600 mb-3">Thẻ Phong Cách</h3>
                <div className="flex flex-wrap gap-2">
                  {['Vintage', 'Da', 'Cổ Điển', 'Mùa Đông', 'Streetwear'].map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Seller Card */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-xl">
                    FA
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">fashionista_22</h3>
                      <div
                        className="w-6 h-6 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-xs"
                        title="Premium Gold"
                      >
                        ⭐
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-600 ml-1">4.9 (234 đánh giá)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div>
                    <div className="text-lg text-gray-900">156</div>
                    <div className="text-xs text-gray-500">Đã Bán</div>
                  </div>
                  <div>
                    <div className="text-lg text-gray-900">98%</div>
                    <div className="text-xs text-gray-500">Đánh Giá</div>
                  </div>
                  <div>
                    <div className="text-lg text-gray-900">2.5k</div>
                    <div className="text-xs text-gray-500">Người Theo Dõi</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => openSellerChat(true)}
                  className="w-full bg-[#25D366] text-white py-4 rounded-full hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Liên hệ qua Zalo</span>
                </button>
                <button
                  onClick={() => openSellerChat(false)}
                  className="w-full bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white py-4 rounded-full hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat với người bán</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <Shield className="w-6 h-6 text-[#2D5A3D] mx-auto mb-2" />
                  <div className="text-xs text-gray-600">Người Bán Uy Tín</div>
                </div>
                <div className="text-center">
                  <Package className="w-6 h-6 text-[#2D5A3D] mx-auto mb-2" />
                  <div className="text-xs text-gray-600">Giao Hàng An Toàn</div>
                </div>
                <div className="text-center">
                  <Clock className="w-6 h-6 text-[#2D5A3D] mx-auto mb-2" />
                  <div className="text-xs text-gray-600">Phản Hồi Nhanh</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl text-gray-900 mb-4">Mô Tả Sản Phẩm</h2>
          <p className="text-gray-600 leading-relaxed">
            Áo khoác da vintage tuyệt đẹp trong tình trạng xuất sắc. Làm từ da thật chất lượng cao với thiết kế
            cổ điển không bao giờ lỗi mốt. Hoàn hảo cho cả dịp thường ngày và bán trang trọng. Áo khoác có form
            thoải mái với túi bên trong và khóa kéo kim loại cao cấp. Dấu hiệu sử dụng nhẹ tạo nên nét vintage
            đích thực. Đã được giặt khô chuyên nghiệp và bảo quản cẩn thận. Đây là món đồ vượt thời gian sẽ nâng
            tầm tủ đồ của bạn!
          </p>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-[#2D5A3D]" />
              Bình Luận ({comments.length})
            </h2>
          </div>

          {/* Comment Input */}
          <div className="mb-8">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                U
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white px-6 py-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>Gửi</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: comment.avatarColor }}
                >
                  {comment.avatar}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-2xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">@{comment.user}</span>
                        {comment.badge && (
                          <div
                            className={`w-5 h-5 bg-gradient-to-r ${comment.badge.gradient} rounded-full flex items-center justify-center text-white text-[10px]`}
                            title="Badge"
                          >
                            {comment.badge.icon}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{comment.date}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{comment.comment}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 ml-2">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        comment.isLiked
                          ? 'text-[#2D5A3D] font-semibold'
                          : 'text-gray-500 hover:text-[#2D5A3D]'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${comment.isLiked ? 'fill-[#2D5A3D]' : ''}`} />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="text-xs text-gray-500 hover:text-[#2D5A3D] transition-colors">
                      Trả lời
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {comments.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
          )}
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-3xl text-gray-900 mb-8">Sản Phẩm Tương Tự</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
