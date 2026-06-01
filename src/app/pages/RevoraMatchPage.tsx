import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Flame, MessageCircle, Sparkles, ArrowLeft, ImagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FashionItem {
  id: string;
  name: string;
  image: string;
  value: string;
  category: string;
  tags: string[];
  owner: string;
  ownerAvatar: string;
  distance: string;
  hasVideo?: boolean;
  priceRange: string;
}

interface Match {
  yourItem: FashionItem;
  theirItem: FashionItem;
  matchedAt: Date;
}

const MOCK_ITEMS: FashionItem[] = [
  // Under 100k (5 items)
  {
    id: '1',
    name: 'Áo Thun Trắng Basic',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    value: 'Dưới 100k',
    category: 'Quần Áo',
    tags: ['Basic', 'Casual', 'Unisex'],
    owner: 'minimal_closet',
    ownerAvatar: 'M',
    distance: 'TP.HCM - Quận 1',
    priceRange: 'under-100k',
  },
  {
    id: '2',
    name: 'Quần Jean Xanh Cơ Bản',
    image: 'https://images.unsplash.com/photo-1542272454315-7ad9f8388fe8?w=800',
    value: 'Dưới 100k',
    category: 'Quần Áo',
    tags: ['Denim', 'Casual', 'Vintage'],
    owner: 'thrift_queen',
    ownerAvatar: 'T',
    distance: 'TP.HCM - Quận 3',
    hasVideo: true,
    priceRange: 'under-100k',
  },
  {
    id: '3',
    name: 'Túi Tote Canvas',
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800',
    value: 'Dưới 100k',
    category: 'Túi Xách',
    tags: ['Canvas', 'Eco', 'Đơn Giản'],
    owner: 'vintage_style',
    ownerAvatar: 'V',
    distance: 'TP.HCM - Quận 7',
    priceRange: 'under-100k',
  },
  {
    id: '4',
    name: 'Mũ Lưỡi Trai Đen',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
    value: 'Dưới 100k',
    category: 'Phụ Kiện',
    tags: ['Streetwear', 'Casual', 'Đen'],
    owner: 'streetwear_vn',
    ownerAvatar: 'S',
    distance: 'TP.HCM - Quận 2',
    hasVideo: true,
    priceRange: 'under-100k',
  },
  {
    id: '5',
    name: 'Dây Lưng Da Basic',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583b2?w=800',
    value: 'Dưới 100k',
    category: 'Phụ Kiện',
    tags: ['Da', 'Classic', 'Formal'],
    owner: 'retro_fashion',
    ownerAvatar: 'R',
    distance: 'TP.HCM - Quận 5',
    priceRange: 'under-100k',
  },

  // 100k - 300k (5 items)
  {
    id: '6',
    name: 'Áo Hoodie Oversized',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
    value: '100k - 300k',
    category: 'Quần Áo',
    tags: ['Streetwear', 'Oversized', 'Casual'],
    owner: 'fashionista_22',
    ownerAvatar: 'F',
    distance: 'TP.HCM - Quận 1',
    hasVideo: true,
    priceRange: '100-300k',
  },
  {
    id: '7',
    name: 'Áo Khoác Denim Vintage',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    value: '100k - 300k',
    category: 'Quần Áo',
    tags: ['Vintage', 'Denim', 'Retro'],
    owner: 'vintage_style',
    ownerAvatar: 'V',
    distance: 'TP.HCM - Quận 10',
    priceRange: '100-300k',
  },
  {
    id: '8',
    name: 'Giày Converse Chuck 70',
    image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800',
    value: '100k - 300k',
    category: 'Giày Dép',
    tags: ['Converse', 'Classic', 'Vintage'],
    owner: 'sneaker_head',
    ownerAvatar: 'S',
    distance: 'TP.HCM - Quận 4',
    hasVideo: true,
    priceRange: '100-300k',
  },
  {
    id: '9',
    name: 'Túi Xách Mini Đeo Chéo',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
    value: '100k - 300k',
    category: 'Túi Xách',
    tags: ['Mini', 'Crossbody', 'Trendy'],
    owner: 'bag_collector',
    ownerAvatar: 'B',
    distance: 'TP.HCM - Quận 3',
    priceRange: '100-300k',
  },
  {
    id: '10',
    name: 'Kính Mát Đen Gọng Tròn',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
    value: '100k - 300k',
    category: 'Phụ Kiện',
    tags: ['Sunglasses', 'Retro', 'Đen'],
    owner: 'style_maven',
    ownerAvatar: 'M',
    distance: 'TP.HCM - Quận 7',
    hasVideo: true,
    priceRange: '100-300k',
  },

  // 300k - 500k (5 items)
  {
    id: '11',
    name: 'Giày Nike Air Force 1',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
    value: '300k - 500k',
    category: 'Giày Dép',
    tags: ['Nike', 'Sneakers', 'Classic'],
    owner: 'sneaker_head',
    ownerAvatar: 'S',
    distance: 'TP.HCM - Quận 1',
    hasVideo: true,
    priceRange: '300-500k',
  },
  {
    id: '12',
    name: 'Áo Sơ Mi Lụa Cao Cấp',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    value: '300k - 500k',
    category: 'Quần Áo',
    tags: ['Silk', 'Elegant', 'Premium'],
    owner: 'fashionista_22',
    ownerAvatar: 'F',
    distance: 'TP.HCM - Quận 3',
    priceRange: '300-500k',
  },
  {
    id: '13',
    name: 'Giày Adidas Stan Smith',
    image: 'https://images.unsplash.com/photo-1612902456551-333ac5afa26e?w=800',
    value: '300k - 500k',
    category: 'Giày Dép',
    tags: ['Adidas', 'Classic', 'White'],
    owner: 'minimal_closet',
    ownerAvatar: 'M',
    distance: 'TP.HCM - Quận 2',
    hasVideo: true,
    priceRange: '300-500k',
  },
  {
    id: '14',
    name: 'Túi Xách Da Thật',
    image: 'https://images.unsplash.com/photo-1591348278863-a4fd8430d0ce?w=800',
    value: '300k - 500k',
    category: 'Túi Xách',
    tags: ['Leather', 'Premium', 'Elegant'],
    owner: 'luxury_deals',
    ownerAvatar: 'L',
    distance: 'TP.HCM - Quận 1',
    priceRange: '300-500k',
  },
  {
    id: '15',
    name: 'Áo Khoác Bomber',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
    value: '300k - 500k',
    category: 'Quần Áo',
    tags: ['Bomber', 'Streetwear', 'Cool'],
    owner: 'streetwear_vn',
    ownerAvatar: 'S',
    distance: 'TP.HCM - Quận 10',
    hasVideo: true,
    priceRange: '300-500k',
  },

  // 500k+ (5 items)
  {
    id: '16',
    name: 'Giày Adidas Yeezy Boost',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800',
    value: '500k+',
    category: 'Giày Dép',
    tags: ['Yeezy', 'Limited', 'Hype'],
    owner: 'sneaker_head',
    ownerAvatar: 'S',
    distance: 'TP.HCM - Quận 1',
    hasVideo: true,
    priceRange: '500k-plus',
  },
  {
    id: '17',
    name: 'Áo Hoodie Supreme',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
    value: '500k+',
    category: 'Quần Áo',
    tags: ['Supreme', 'Hype', 'Limited'],
    owner: 'thrift_queen',
    ownerAvatar: 'T',
    distance: 'TP.HCM - Quận 3',
    hasVideo: true,
    priceRange: '500k-plus',
  },
  {
    id: '18',
    name: 'Túi Louis Vuitton',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    value: '500k+',
    category: 'Túi Xách',
    tags: ['LV', 'Luxury', 'Designer'],
    owner: 'luxury_deals',
    ownerAvatar: 'L',
    distance: 'TP.HCM - Quận 1',
    hasVideo: true,
    priceRange: '500k-plus',
  },
  {
    id: '19',
    name: 'Túi Chanel Classic',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
    value: '500k+',
    category: 'Túi Xách',
    tags: ['Chanel', 'Luxury', 'Timeless'],
    owner: 'bag_collector',
    ownerAvatar: 'B',
    distance: 'TP.HCM - Quận 1',
    hasVideo: true,
    priceRange: '500k-plus',
  },
  {
    id: '20',
    name: 'Giày Jordan 1 Retro',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
    value: '500k+',
    category: 'Giày Dép',
    tags: ['Jordan', 'Sneakers', 'Hype'],
    owner: 'streetwear_vn',
    ownerAvatar: 'S',
    distance: 'TP.HCM - Quận 7',
    hasVideo: true,
    priceRange: '500k-plus',
  },
];

export default function RevoraMatchPage() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);

  const priceRanges = [
    { label: 'Dưới 100k', value: 'under-100k', gradient: 'from-purple-400 to-pink-400' },
    { label: '100k - 300k', value: '100-300k', gradient: 'from-pink-400 to-rose-400' },
    { label: '300k - 500k', value: '300-500k', gradient: 'from-rose-400 to-red-500' },
    { label: 'Trên 500k', value: '500k-plus', gradient: 'from-red-500 to-[#2D5A3D]' },
  ];

  // Filter items by selected price range
  const filteredItems = selectedPriceRange
    ? MOCK_ITEMS.filter(item => item.priceRange === selectedPriceRange)
    : MOCK_ITEMS;

  const currentItem = filteredItems[currentItemIndex];

  const handleStartMatching = () => {
    if (!selectedPriceRange) return;
    setShowIntro(false);
    setCurrentItemIndex(0);
    setSwipeCount(0);
    setLikedItems(new Set());
  };

  const handleSwipe = (liked: boolean) => {
    if (liked) {
      const newLikedItems = new Set(likedItems);
      newLikedItems.add(currentItem.id);
      setLikedItems(newLikedItems);

      // Auto match on 3rd swipe (swipeCount === 2) for demo
      if (swipeCount === 2) {
        const match: Match = {
          yourItem: filteredItems[Math.floor(Math.random() * filteredItems.length)],
          theirItem: currentItem,
          matchedAt: new Date(),
        };
        setCurrentMatch(match);
        setShowMatchModal(true);
      }
    }

    setSwipeCount(swipeCount + 1);

    // Move to next item
    setTimeout(() => {
      if (currentItemIndex < filteredItems.length - 1) {
        setCurrentItemIndex(currentItemIndex + 1);
      } else {
        // Reset when all items viewed
        setCurrentItemIndex(0);
        setLikedItems(new Set());
        setSwipeCount(0);
      }
    }, 300);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragOffset) > 100) {
      handleSwipe(dragOffset > 0);
    }
    setDragOffset(0);
  };

  const handleOpenChat = () => {
    setShowMatchModal(false);
    setShowChat(true);
  };

  if (showChat && currentMatch) {
    return <ChatInterface match={currentMatch} onClose={() => setShowChat(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a0611] to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#2D5A3D]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay Lại</span>
        </button>
        <div className="flex items-center space-x-2">
          <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            REVORA MATCH
          </h1>
        </div>
        <div className="w-20" />
      </div>

      {/* Introduction Modal */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-2xl w-full bg-gradient-to-br from-gray-900 to-[#1a0611] rounded-3xl p-8 shadow-2xl border border-white/10"
            >
              {/* Close Button */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors group"
              >
                <X className="w-5 h-5 text-white/60 group-hover:text-white" />
              </button>

              {/* Flame Animation */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50"
                >
                  <Flame className="w-12 h-12 text-white" />
                </motion.div>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Khám Phá Giao Dịch Thời Trang
              </h2>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  {
                    icon: '👕',
                    title: 'Vuốt Sản Phẩm',
                    desc: 'Duyệt qua món đồ độc đáo',
                  },
                  {
                    icon: '❤️',
                    title: 'Thích Để Trao Đổi',
                    desc: 'Bày tỏ sự quan tâm',
                  },
                  {
                    icon: '🔥',
                    title: 'Ghép Đôi Thành Công!',
                    desc: 'Khi cả hai thích nhau',
                  },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center"
                  >
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-white/60 text-sm">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Price Range Selection */}
              <div className="mb-8">
                <h3 className="text-white text-lg font-semibold mb-4 text-center">
                  Chọn Khoảng Giá Của Bạn
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {priceRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setSelectedPriceRange(range.value)}
                      className={`relative p-4 rounded-2xl transition-all duration-300 ${
                        selectedPriceRange === range.value
                          ? 'scale-105 shadow-lg shadow-[#2D5A3D]/50'
                          : 'scale-100'
                      }`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${range.gradient} rounded-2xl opacity-${
                          selectedPriceRange === range.value ? '100' : '20'
                        } transition-opacity`}
                      />
                      <div className="relative z-10 text-white font-semibold">
                        {range.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleStartMatching}
                disabled={!selectedPriceRange}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  selectedPriceRange
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-red-500/50 hover:scale-105'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Bắt Đầu Ghép Đôi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Interface */}
      {!showIntro && currentItem && (
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
          <div className="relative w-full max-w-md">
            {/* Card Stack Effect */}
            {[2, 1, 0].map((offset) => {
              const item = filteredItems[currentItemIndex + offset];
              if (!item) return null;

              return (
                <motion.div
                  key={item.id}
                  drag={offset === 0 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDrag={(e, info) => {
                    if (offset === 0) {
                      setIsDragging(true);
                      setDragOffset(info.offset.x);
                    }
                  }}
                  onDragEnd={handleDragEnd}
                  animate={{
                    scale: 1 - offset * 0.05,
                    y: offset * 10,
                    opacity: 1 - offset * 0.2,
                  }}
                  style={{
                    zIndex: 10 - offset,
                    rotate: offset === 0 ? dragOffset / 20 : 0,
                  }}
                  className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
                >
                  <div className="relative h-[600px] bg-white rounded-3xl overflow-hidden">
                    {/* Item Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Video Badge */}
                    {item.hasVideo && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-xs font-semibold">Có Video</span>
                      </div>
                    )}

                    {/* Swipe Indicators */}
                    <AnimatePresence>
                      {isDragging && (
                        <>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: dragOffset > 50 ? 1 : 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-20deg]"
                          >
                            <div className="text-8xl">❤️</div>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: dragOffset < -50 ? 1 : 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[20deg]"
                          >
                            <div className="text-8xl">❌</div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>

                    {/* Item Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                      <h3 className="text-white text-2xl font-bold mb-2">{item.name}</h3>
                      <p className="text-white/80 text-lg mb-3">{item.value}</p>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                          {item.category}
                        </span>
                        {item.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white/80 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-xs">
                            {item.ownerAvatar}
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold">{item.owner}</p>
                            <p className="text-white/60 text-xs">{item.distance}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe(false)}
              className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
            >
              <X className="w-8 h-8 text-red-500" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe(true)}
              className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-lg shadow-red-500/50 flex items-center justify-center hover:shadow-xl transition-shadow"
            >
              <Heart className="w-10 h-10 text-white fill-white" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Match Success Modal */}
      <AnimatePresence>
        {showMatchModal && currentMatch && (
          <MatchSuccessModal
            match={currentMatch}
            onOpenChat={handleOpenChat}
            onClose={() => setShowMatchModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MatchSuccessModal({
  match,
  onOpenChat,
  onClose,
}: {
  match: Match;
  onOpenChat: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Confetti Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: -20,
              rotate: 0,
            }}
            animate={{
              y: window.innerHeight + 20,
              rotate: 360,
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              delay: Math.random() * 0.5,
              ease: 'linear',
            }}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94'][
                i % 5
              ],
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        className="relative max-w-2xl w-full bg-gradient-to-br from-gray-900 to-[#1a0611] rounded-3xl p-8 shadow-2xl border border-white/10"
      >
        {/* Animated Flame */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="flex justify-center mb-6"
        >
          <div className="text-8xl">🔥</div>
        </motion.div>

        {/* Title */}
        <h2 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
          Ghép Đôi Thành Công!
        </h2>
        <p className="text-white/60 text-center mb-8">
          Cả hai đều thích đồ của nhau
        </p>

        {/* Item Cards */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 max-w-[200px]"
          >
            <img
              src={match.yourItem.image}
              alt={match.yourItem.name}
              className="w-full h-48 object-cover rounded-2xl shadow-lg"
            />
            <p className="text-white text-center mt-2 text-sm font-semibold">
              Đồ Của Bạn
            </p>
            <p className="text-white/60 text-center text-xs">{match.yourItem.name}</p>
          </motion.div>

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            className="text-4xl"
          >
            💕
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 max-w-[200px]"
          >
            <img
              src={match.theirItem.image}
              alt={match.theirItem.name}
              className="w-full h-48 object-cover rounded-2xl shadow-lg"
            />
            <p className="text-white text-center mt-2 text-sm font-semibold">
              Đồ Của Họ
            </p>
            <p className="text-white/60 text-center text-xs">{match.theirItem.name}</p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
          >
            Tiếp Tục Duyệt
          </button>
          <button
            onClick={onOpenChat}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold shadow-lg shadow-red-500/50 hover:scale-105 transition-transform flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Mở Chat</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ChatInterface({ match, onClose }: { match: Match; onClose: () => void }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'them',
      text: `Chào bạn! Mình rất thích ${match.yourItem.name} của bạn! 😍`,
      time: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const message = {
      id: Date.now().toString(),
      sender: 'me',
      text: `📸 [Đã gửi ảnh: ${file.name}]`,
      time: new Date(),
    };

    setMessages([...messages, message]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Simulate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'them',
          text: 'Ảnh đẹp quá bạn ơi! 😍',
          time: new Date(),
        },
      ]);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      sender: 'me',
      text: newMessage,
      time: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'them',
          text: 'Tuyệt vời! Khi nào mình có thể gặp để trao đổi nhỉ?',
          time: new Date(),
        },
      ]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a0611] to-gray-900">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white">
              {match.theirItem.ownerAvatar}
            </div>
            <div>
              <p className="text-white font-semibold">{match.theirItem.owner}</p>
              <p className="text-white/60 text-xs">Đang hoạt động</p>
            </div>
          </div>
          <div className="w-6" />
        </div>
      </div>

      {/* Trade Preview */}
      <div className="bg-gradient-to-r from-[#2D5A3D]/20 to-purple-500/20 backdrop-blur-sm border-b border-white/10 p-4">
        <p className="text-white/60 text-xs text-center mb-3">Thảo Luận Trao Đổi</p>
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <img
              src={match.yourItem.image}
              alt={match.yourItem.name}
              className="w-20 h-20 object-cover rounded-lg shadow-lg mb-1"
            />
            <p className="text-white text-xs font-semibold">{match.yourItem.name}</p>
          </div>
          <div className="text-2xl">⇄</div>
          <div className="text-center">
            <img
              src={match.theirItem.image}
              alt={match.theirItem.name}
              className="w-20 h-20 object-cover rounded-lg shadow-lg mb-1"
            />
            <p className="text-white text-xs font-semibold">{match.theirItem.name}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-320px)]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.sender === 'me'
                  ? 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white'
                  : 'bg-white/10 backdrop-blur-sm text-white'
              }`}
            >
              <p>{msg.text}</p>
              <p className="text-xs opacity-60 mt-1">
                {msg.time.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-black/40 backdrop-blur-sm border-t border-white/10 p-3">
        <div className="flex space-x-2 mb-3">
          <button className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold shadow-lg shadow-green-500/30 hover:scale-105 transition-transform">
            Vẫn Quan Tâm ✓
          </button>
          <button className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform">
            Xác Nhận Trao Đổi 🤝
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="bg-black/60 backdrop-blur-sm border-t border-white/10 p-4">
        <div className="flex space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all flex items-center justify-center"
            title="Đăng tải ảnh"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-[#2D5A3D]"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white font-semibold shadow-lg shadow-[#2D5A3D]/50 hover:scale-105 transition-transform"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
