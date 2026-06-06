import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Heart,
  Flame,
  MessageCircle,
  Sparkles,
  ArrowLeft,
  ImagePlus,
  MapPin,
  Package,
  Users,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMyProducts } from '../../features/products/hooks/useMyProducts';

type MatchStep = 'landing' | 'select-products' | 'select-filters' | 'swiping';
type RegionId = 'hanoi' | 'hcm';

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
  region: RegionId;
  hasVideo?: boolean;
  priceRange: string;
  isSeed: boolean;
}

interface MatchSession {
  yourItems: FashionItem[];
  theirItem: FashionItem;
  matchedAt: Date;
}

interface PriceFilterOption {
  label: string;
  value: string;
  productCount: number;
  participantCount: number;
  gradient: string;
}

interface RegionFilterOption {
  id: RegionId;
  label: string;
  productCount: number;
  participantCount: number;
}

const COMMUNITY_STATS = {
  participants: 1248,
  productsWaiting: 5763,
};

const PRICE_FILTERS: PriceFilterOption[] = [
  { label: 'Dưới 100.000đ', value: 'under-100k', productCount: 892, participantCount: 318, gradient: 'from-purple-400 to-pink-400' },
  { label: '100.000đ – 300.000đ', value: '100-300k', productCount: 1532, participantCount: 412, gradient: 'from-pink-400 to-rose-400' },
  { label: '300.000đ – 500.000đ', value: '300-500k', productCount: 986, participantCount: 231, gradient: 'from-rose-400 to-red-500' },
  { label: 'Trên 500.000đ', value: '500k-plus', productCount: 353, participantCount: 87, gradient: 'from-red-500 to-[#2D5A3D]' },
];

const REGION_FILTERS: RegionFilterOption[] = [
  { id: 'hanoi', label: 'Hà Nội', productCount: 1843, participantCount: 538 },
  { id: 'hcm', label: 'Hồ Chí Minh', productCount: 1256, participantCount: 421 },
];

/** Chủ sở hữu demo sẽ "thích lại" sản phẩm của bạn để tạo Match */
const MUTUAL_MATCH_OWNERS = new Set(['fashionista_22', 'vintage_style', 'sneaker_head']);

const RAW_MOCK_ITEMS: Omit<FashionItem, 'region' | 'isSeed'>[] = [
  { id: '1', name: 'Áo Thun Trắng Basic', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', value: 'Dưới 100k', category: 'Quần Áo', tags: ['Basic', 'Casual'], owner: 'minimal_closet', ownerAvatar: 'M', distance: 'TP.HCM - Quận 1', priceRange: 'under-100k' },
  { id: '2', name: 'Quần Jean Xanh Cơ Bản', image: 'https://images.unsplash.com/photo-1542272454315-7ad9f8388fe8?w=800', value: 'Dưới 100k', category: 'Quần Áo', tags: ['Denim', 'Vintage'], owner: 'thrift_queen', ownerAvatar: 'T', distance: 'TP.HCM - Quận 3', hasVideo: true, priceRange: 'under-100k' },
  { id: '3', name: 'Túi Tote Canvas', image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800', value: 'Dưới 100k', category: 'Túi Xách', tags: ['Canvas', 'Eco'], owner: 'vintage_style', ownerAvatar: 'V', distance: 'TP.HCM - Quận 7', priceRange: 'under-100k' },
  { id: '4', name: 'Mũ Lưỡi Trai Đen', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800', value: 'Dưới 100k', category: 'Phụ Kiện', tags: ['Streetwear'], owner: 'streetwear_vn', ownerAvatar: 'S', distance: 'TP.HCM - Quận 2', priceRange: 'under-100k' },
  { id: '5', name: 'Dây Lưng Da Basic', image: 'https://images.unsplash.com/photo-1624222247344-550fb60583b2?w=800', value: 'Dưới 100k', category: 'Phụ Kiện', tags: ['Da', 'Classic'], owner: 'retro_fashion', ownerAvatar: 'R', distance: 'TP.HCM - Quận 5', priceRange: 'under-100k' },
  { id: '6', name: 'Áo Hoodie Oversized', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', value: '100k - 300k', category: 'Quần Áo', tags: ['Streetwear'], owner: 'fashionista_22', ownerAvatar: 'F', distance: 'TP.HCM - Quận 1', hasVideo: true, priceRange: '100-300k' },
  { id: '7', name: 'Áo Khoác Denim Vintage', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', value: '100k - 300k', category: 'Quần Áo', tags: ['Vintage'], owner: 'vintage_style', ownerAvatar: 'V', distance: 'Hà Nội - Hoàn Kiếm', priceRange: '100-300k' },
  { id: '8', name: 'Giày Converse Chuck 70', image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800', value: '100k - 300k', category: 'Giày Dép', tags: ['Converse'], owner: 'sneaker_head', ownerAvatar: 'S', distance: 'TP.HCM - Quận 4', hasVideo: true, priceRange: '100-300k' },
  { id: '9', name: 'Túi Xách Mini Đeo Chéo', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', value: '100k - 300k', category: 'Túi Xách', tags: ['Mini'], owner: 'bag_collector', ownerAvatar: 'B', distance: 'TP.HCM - Quận 3', priceRange: '100-300k' },
  { id: '10', name: 'Kính Mát Đen Gọng Tròn', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800', value: '100k - 300k', category: 'Phụ Kiện', tags: ['Retro'], owner: 'style_maven', ownerAvatar: 'M', distance: 'Hà Nội - Cầu Giấy', priceRange: '100-300k' },
  { id: '11', name: 'Giày Nike Air Force 1', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800', value: '300k - 500k', category: 'Giày Dép', tags: ['Nike'], owner: 'sneaker_head', ownerAvatar: 'S', distance: 'TP.HCM - Quận 1', hasVideo: true, priceRange: '300-500k' },
  { id: '12', name: 'Áo Sơ Mi Lụa Cao Cấp', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', value: '300k - 500k', category: 'Quần Áo', tags: ['Silk'], owner: 'fashionista_22', ownerAvatar: 'F', distance: 'Hà Nội - Đống Đa', priceRange: '300-500k' },
  { id: '13', name: 'Giày Adidas Stan Smith', image: 'https://images.unsplash.com/photo-1612902456551-333ac5afa26e?w=800', value: '300k - 500k', category: 'Giày Dép', tags: ['Adidas'], owner: 'minimal_closet', ownerAvatar: 'M', distance: 'TP.HCM - Quận 2', priceRange: '300-500k' },
  { id: '14', name: 'Túi Xách Da Thật', image: 'https://images.unsplash.com/photo-1591348278863-a4fd8430d0ce?w=800', value: '300k - 500k', category: 'Túi Xách', tags: ['Leather'], owner: 'luxury_deals', ownerAvatar: 'L', distance: 'TP.HCM - Quận 1', priceRange: '300-500k' },
  { id: '15', name: 'Áo Khoác Bomber', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800', value: '300k - 500k', category: 'Quần Áo', tags: ['Bomber'], owner: 'streetwear_vn', ownerAvatar: 'S', distance: 'TP.HCM - Quận 10', priceRange: '300-500k' },
  { id: '16', name: 'Giày Adidas Yeezy Boost', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800', value: '500k+', category: 'Giày Dép', tags: ['Yeezy'], owner: 'sneaker_head', ownerAvatar: 'S', distance: 'TP.HCM - Quận 1', hasVideo: true, priceRange: '500k-plus' },
  { id: '17', name: 'Áo Hoodie Supreme', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800', value: '500k+', category: 'Quần Áo', tags: ['Supreme'], owner: 'thrift_queen', ownerAvatar: 'T', distance: 'Hà Nội - Ba Đình', priceRange: '500k-plus' },
  { id: '18', name: 'Túi Louis Vuitton', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', value: '500k+', category: 'Túi Xách', tags: ['LV'], owner: 'luxury_deals', ownerAvatar: 'L', distance: 'TP.HCM - Quận 1', priceRange: '500k-plus' },
  { id: '19', name: 'Túi Chanel Classic', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800', value: '500k+', category: 'Túi Xách', tags: ['Chanel'], owner: 'bag_collector', ownerAvatar: 'B', distance: 'Hà Nội - Hoàn Kiếm', priceRange: '500k-plus' },
  { id: '20', name: 'Giày Jordan 1 Retro', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800', value: '500k+', category: 'Giày Dép', tags: ['Jordan'], owner: 'streetwear_vn', ownerAvatar: 'S', distance: 'TP.HCM - Quận 7', hasVideo: true, priceRange: '500k-plus' },
];

const MATCH_ITEMS: FashionItem[] = RAW_MOCK_ITEMS.map((item, index) => ({
  ...item,
  region: item.distance.toLowerCase().includes('hà nội') ? 'hanoi' : 'hcm',
  isSeed: index < 5 || index >= 15,
}));

const toFashionItemFromProduct = (product: {
  productId: number;
  title: string;
  price: number;
  imageUrl: string;
  location: string;
}): FashionItem => ({
  id: `mine-${product.productId}`,
  name: product.title,
  image: product.imageUrl,
  value: `${product.price.toLocaleString('vi-VN')}đ`,
  category: 'Sản phẩm của bạn',
  tags: [],
  owner: 'Bạn',
  ownerAvatar: 'B',
  distance: product.location,
  region: product.location.toLowerCase().includes('hà nội') ? 'hanoi' : 'hcm',
  priceRange: '',
  isSeed: false,
});

export default function RevoraMatchPage() {
  const navigate = useNavigate();
  const { products: myProducts, isLoading: isProductsLoading } = useMyProducts();

  const [step, setStep] = useState<MatchStep>('landing');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
  const [sessionLikedIds, setSessionLikedIds] = useState<Set<string>>(new Set());
  const [sessionSeenIds, setSessionSeenIds] = useState<Set<string>>(new Set());
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<MatchSession | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const myOfferItems = useMemo(() => {
    if (myProducts.length > 0) {
      return myProducts.map(toFashionItemFromProduct);
    }
    return [
      toFashionItemFromProduct({ productId: 1, title: 'Áo Thun Vintage', price: 150000, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', location: 'TP.HCM' }),
      toFashionItemFromProduct({ productId: 2, title: 'Quần Jean Slim', price: 280000, imageUrl: 'https://images.unsplash.com/photo-1542272454315-7ad9f8388fe8?w=400', location: 'TP.HCM' }),
      toFashionItemFromProduct({ productId: 3, title: 'Giày Sneaker Trắng', price: 450000, imageUrl: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400', location: 'Hà Nội' }),
    ];
  }, [myProducts]);

  const selectedOfferItems = useMemo(
    () => myOfferItems.filter((item) => selectedProductIds.has(Number(item.id.replace('mine-', '')))),
    [myOfferItems, selectedProductIds]
  );

  const swipeQueue = useMemo(() => {
    if (!selectedPriceRange || !selectedRegion) return [];

    const realItems = MATCH_ITEMS.filter(
      (item) =>
        !item.isSeed &&
        item.priceRange === selectedPriceRange &&
        item.region === selectedRegion &&
        !sessionSeenIds.has(item.id)
    );

    const seedItems = MATCH_ITEMS.filter(
      (item) =>
        item.isSeed &&
        item.priceRange === selectedPriceRange &&
        item.region === selectedRegion &&
        !sessionSeenIds.has(item.id)
    );

    return [...realItems, ...seedItems];
  }, [selectedPriceRange, selectedRegion, sessionSeenIds]);

  const currentItem = swipeQueue[0];

  const filterPreview = useMemo(() => {
    if (!selectedPriceRange || !selectedRegion) {
      return { products: 0, participants: 0 };
    }

    const priceMeta = PRICE_FILTERS.find((f) => f.value === selectedPriceRange);
    const regionMeta = REGION_FILTERS.find((f) => f.id === selectedRegion);

    return {
      products: Math.round(((priceMeta?.productCount ?? 0) + (regionMeta?.productCount ?? 0)) / 2),
      participants: Math.round(((priceMeta?.participantCount ?? 0) + (regionMeta?.participantCount ?? 0)) / 2),
    };
  }, [selectedPriceRange, selectedRegion]);

  const resetSession = useCallback(() => {
    setSessionLikedIds(new Set());
    setSessionSeenIds(new Set());
    setCurrentMatch(null);
    setShowMatchModal(false);
    setShowChat(false);
    setSessionNotice(null);
  }, []);

  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleStartSession = () => {
    resetSession();
    setStep('swiping');
  };

  const handleSwipe = (liked: boolean) => {
    if (!currentItem) return;

    setSessionSeenIds((prev) => new Set(prev).add(currentItem.id));

    if (liked) {
      if (currentItem.isSeed) {
        setSessionNotice('Đã quan tâm (dữ liệu mẫu — không thể tạo Match thật)');
        setTimeout(() => setSessionNotice(null), 3000);
      } else {
        const newLiked = new Set(sessionLikedIds);
        newLiked.add(currentItem.id);
        setSessionLikedIds(newLiked);
        setSessionNotice(`Đã gửi thông báo quan tâm đến @${currentItem.owner}`);

        if (MUTUAL_MATCH_OWNERS.has(currentItem.owner) && selectedOfferItems.length > 0) {
          const match: MatchSession = {
            yourItems: selectedOfferItems,
            theirItem: currentItem,
            matchedAt: new Date(),
          };
          setCurrentMatch(match);
          setShowMatchModal(true);
        }
      }
    }

    setTimeout(() => setSessionNotice(null), liked ? 2500 : 300);
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

  const handleTradeComplete = () => {
    resetSession();
    setStep('landing');
  };

  const handleLeaveSession = () => {
    resetSession();
    setStep('landing');
  };

  if (showChat && currentMatch) {
    return (
      <ChatInterface
        match={currentMatch}
        onClose={() => {
          setShowChat(false);
          setStep('swiping');
        }}
        onLeaveTrade={handleLeaveSession}
        onTradeSuccess={handleTradeComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a0611] to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#2D5A3D]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex items-center justify-between p-6">
        <button
          onClick={() => (step === 'landing' ? navigate(-1) : setStep(step === 'swiping' ? 'select-filters' : step === 'select-filters' ? 'select-products' : 'landing'))}
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

      {/* Bước 0: Landing + thống kê cộng đồng */}
      {step === 'landing' && (
        <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-orange-300 font-semibold text-sm">Match & Trade</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Trao Đổi Thời Trang Kiểu Tinder</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Thích sản phẩm của nhau — không phải tài khoản. Khi cả hai cùng quan tâm sản phẩm đối phương, hệ thống tạo Match và mở kênh trao đổi riêng.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <Users className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{COMMUNITY_STATS.participants.toLocaleString('vi-VN')}</p>
              <p className="text-white/50 text-sm mt-1">người đang tham gia</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <Package className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{COMMUNITY_STATS.productsWaiting.toLocaleString('vi-VN')}</p>
              <p className="text-white/50 text-sm mt-1">sản phẩm chờ trao đổi</p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {[
              { step: '1', title: 'Chọn sản phẩm muốn trao đổi', desc: 'Từ danh sách đang đăng bán' },
              { step: '2', title: 'Thiết lập khoảng giá & khu vực', desc: 'Xem số sản phẩm và người tham gia' },
              { step: '3', title: 'Vuốt & Match', desc: 'Trái bỏ qua · Phải quan tâm trao đổi' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                <span className="w-7 h-7 rounded-full bg-orange-500/30 text-orange-300 text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {item.step}
                </span>
                <div>
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  <p className="text-white/50 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('select-products')}
            className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-red-500/50 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
          >
            Bắt Đầu Match & Trade
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Bước 1: Chọn sản phẩm */}
      {step === 'select-products' && (
        <div className="relative z-10 max-w-3xl mx-auto px-6 pb-10">
          <h2 className="text-xl font-bold text-white mb-1">Chọn Sản Phẩm Trao Đổi</h2>
          <p className="text-white/50 text-sm mb-6">
            Chọn một hoặc nhiều sản phẩm đại diện cho phiên Match. Đây là những món bạn sẵn sàng đem đi trao đổi.
          </p>

          {isProductsLoading ? (
            <p className="text-white/50 text-center py-12">Đang tải sản phẩm...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {myOfferItems.map((item) => {
                const productId = Number(item.id.replace('mine-', ''));
                const isSelected = selectedProductIds.has(productId);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleProductSelection(productId)}
                    className={`relative text-left rounded-2xl overflow-hidden border-2 transition-all ${
                      isSelected ? 'border-orange-500 scale-[1.02]' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
                    <div className="p-4 bg-white/5">
                      <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-orange-300 text-sm mt-1">{item.value}</p>
                      <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.distance}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setStep('select-filters')}
            disabled={selectedProductIds.size === 0}
            className={`w-full py-4 rounded-2xl font-bold transition-all ${
              selectedProductIds.size > 0
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:scale-[1.02]'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Tiếp Tục ({selectedProductIds.size} sản phẩm đã chọn)
          </button>
        </div>
      )}

      {/* Bước 2: Chọn điều kiện Match */}
      {step === 'select-filters' && (
        <div className="relative z-10 max-w-2xl mx-auto px-6 pb-10">
          <h2 className="text-xl font-bold text-white mb-1">Điều Kiện Match</h2>
          <p className="text-white/50 text-sm mb-6">Chọn khoảng giá và khu vực bạn muốn tìm sản phẩm trao đổi.</p>

          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="text-orange-400">₫</span> Khoảng Giá Mong Muốn
          </h3>
          <div className="space-y-3 mb-8">
            {PRICE_FILTERS.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => setSelectedPriceRange(range.value)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedPriceRange === range.value
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <p className="text-white font-semibold">{range.label}</p>
                <p className="text-white/50 text-sm mt-1">
                  {range.productCount.toLocaleString('vi-VN')} sản phẩm · {range.participantCount.toLocaleString('vi-VN')} người tham gia
                </p>
              </button>
            ))}
          </div>

          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" /> Khu Vực
          </h3>
          <div className="space-y-3 mb-8">
            {REGION_FILTERS.map((region) => (
              <button
                key={region.id}
                type="button"
                onClick={() => setSelectedRegion(region.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedRegion === region.id
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <p className="text-white font-semibold">{region.label}</p>
                <p className="text-white/50 text-sm mt-1">
                  {region.productCount.toLocaleString('vi-VN')} sản phẩm · {region.participantCount.toLocaleString('vi-VN')} người tham gia
                </p>
              </button>
            ))}
          </div>

          {selectedPriceRange && selectedRegion && (
            <div className="bg-[#2D5A3D]/20 border border-[#2D5A3D]/40 rounded-2xl p-4 mb-6">
              <p className="text-white/70 text-sm">Dự kiến trong phiên này bạn có thể tương tác với:</p>
              <p className="text-white font-bold text-lg mt-1">
                ~{filterPreview.products.toLocaleString('vi-VN')} sản phẩm · ~{filterPreview.participants.toLocaleString('vi-VN')} người
              </p>
              <p className="text-white/40 text-xs mt-2">
                Hệ thống có thể bổ sung dữ liệu mẫu nếu chưa đủ nội dung. Dữ liệu mẫu chỉ để trải nghiệm, không tạo Match thật.
              </p>
            </div>
          )}

          <button
            onClick={handleStartSession}
            disabled={!selectedPriceRange || !selectedRegion}
            className={`w-full py-4 rounded-2xl font-bold transition-all ${
              selectedPriceRange && selectedRegion
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:scale-[1.02]'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Bắt Đầu Match
          </button>
        </div>
      )}

      {/* Bước 3–4: Vuốt sản phẩm */}
      {step === 'swiping' && (
        <>
          {sessionNotice && (
            <div className="relative z-20 max-w-md mx-auto px-4 mb-2">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-2 text-white text-sm text-center">
                {sessionNotice}
              </div>
            </div>
          )}

          {swipeQueue.length === 0 || !currentItem ? (
            <div className="relative z-10 text-center py-20 px-6">
              <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">Không còn sản phẩm phù hợp</p>
              <p className="text-white/50 text-sm mb-6">Thử đổi khoảng giá hoặc khu vực khác</p>
              <button
                onClick={() => setStep('select-filters')}
                className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Đổi Điều Kiện
              </button>
            </div>
          ) : (
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-160px)] p-4">
              <div className="relative w-full max-w-md">
                {[2, 1, 0].map((offset) => {
                  const item = swipeQueue[offset];
                  if (!item) return null;

                  return (
                    <motion.div
                      key={`${item.id}-${offset}`}
                      drag={offset === 0 ? 'x' : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      onDrag={(_, info) => {
                        if (offset === 0) {
                          setIsDragging(true);
                          setDragOffset(info.offset.x);
                        }
                      }}
                      onDragEnd={handleDragEnd}
                      animate={{ scale: 1 - offset * 0.05, y: offset * 10, opacity: 1 - offset * 0.2 }}
                      style={{ zIndex: 10 - offset, rotate: offset === 0 ? dragOffset / 20 : 0 }}
                      className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
                    >
                      <div className="relative h-[600px] bg-white rounded-3xl overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />

                        {item.isSeed && (
                          <div className="absolute top-4 left-4 bg-amber-500/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Dữ liệu mẫu
                          </div>
                        )}
                        {item.hasVideo && (
                          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            <span className="text-white text-xs font-semibold">Có Video</span>
                          </div>
                        )}

                        <AnimatePresence>
                          {isDragging && (
                            <>
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: dragOffset > 50 ? 1 : 0 }} className="absolute top-1/3 left-8 border-4 border-green-400 rounded-xl px-4 py-2 rotate-[-15deg]">
                                <span className="text-green-400 font-bold text-xl">QUAN TÂM</span>
                              </motion.div>
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: dragOffset < -50 ? 1 : 0 }} className="absolute top-1/3 right-8 border-4 border-red-400 rounded-xl px-4 py-2 rotate-[15deg]">
                                <span className="text-red-400 font-bold text-xl">BỎ QUA</span>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                          <h3 className="text-white text-2xl font-bold mb-2">{item.name}</h3>
                          <p className="text-white/80 text-lg mb-3">{item.value}</p>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">{item.category}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-xs">
                              {item.ownerAvatar}
                            </div>
                            <div>
                              <p className="text-white text-sm font-semibold">@{item.owner}</p>
                              <p className="text-white/60 text-xs">{item.distance}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-6">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleSwipe(false)} className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center" title="Bỏ qua">
                  <X className="w-8 h-8 text-red-500" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleSwipe(true)} className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-lg shadow-red-500/50 flex items-center justify-center" title="Quan tâm trao đổi">
                  <Heart className="w-10 h-10 text-white fill-white" />
                </motion.button>
              </div>
            </div>
          )}

          <div className="relative z-10 text-center pb-6">
            <p className="text-white/40 text-xs">
              Vuốt trái bỏ qua · Vuốt phải quan tâm · Còn {swipeQueue.length} sản phẩm
            </p>
            <button onClick={handleLeaveSession} className="text-white/50 text-xs mt-2 hover:text-white/80 underline">
              Thoát phiên Match (xóa danh sách tạm)
            </button>
          </div>
        </>
      )}

      <AnimatePresence>
        {showMatchModal && currentMatch && (
          <MatchSuccessModal match={currentMatch} onOpenChat={handleOpenChat} onClose={() => setShowMatchModal(false)} />
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
  match: MatchSession;
  onOpenChat: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative max-w-2xl w-full bg-gradient-to-br from-gray-900 to-[#1a0611] rounded-3xl p-8 shadow-2xl border border-white/10">
        <div className="text-center text-6xl mb-4">🔥</div>
        <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
          Match Thành Công!
        </h2>
        <p className="text-white/60 text-center mb-2 text-sm">
          Cả hai cùng thích sản phẩm của nhau — không cần giá trị tương đương, hai bên tự thỏa thuận.
        </p>
        <p className="text-white/40 text-center mb-6 text-xs">
          REVORA không xử lý thanh toán hay vận chuyển. Trao đổi diễn ra trực tiếp giữa hai người dùng.
        </p>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="text-center flex-1">
            <div className="flex flex-wrap justify-center gap-1 mb-2">
              {match.yourItems.slice(0, 2).map((item) => (
                <img key={item.id} src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
              ))}
            </div>
            <p className="text-white text-xs font-semibold">Sản phẩm của bạn ({match.yourItems.length})</p>
          </div>
          <div className="text-3xl">⇄</div>
          <div className="text-center flex-1">
            <img src={match.theirItem.image} alt={match.theirItem.name} className="w-20 h-20 object-cover rounded-xl mx-auto mb-2" />
            <p className="text-white text-xs font-semibold">@{match.theirItem.owner}</p>
            <p className="text-white/50 text-xs">{match.theirItem.name}</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20">
            Tiếp Tục Duyệt
          </button>
          <button onClick={onOpenChat} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Mở Chat Trao Đổi
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ChatMessage {
  id: string;
  sender: 'me' | 'them' | 'system';
  text: string;
  time: Date;
}

function ChatInterface({
  match,
  onClose,
  onLeaveTrade,
  onTradeSuccess,
}: {
  match: MatchSession;
  onClose: () => void;
  onLeaveTrade: () => void;
  onTradeSuccess: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'them',
      text: `Chào bạn! Mình quan tâm ${match.yourItems[0]?.name ?? 'sản phẩm'} của bạn. Mình có ${match.theirItem.name}, bạn muốn trao đổi không?`,
      time: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [myAgreed, setMyAgreed] = useState(false);
  const [theirAgreed, setTheirAgreed] = useState(false);
  const [tradeCompleted, setTradeCompleted] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (myAgreed && !theirAgreed) {
      const timer = setTimeout(() => setTheirAgreed(true), 2500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [myAgreed, theirAgreed]);

  useEffect(() => {
    if (myAgreed && theirAgreed && !tradeCompleted) {
      setTradeCompleted(true);
      setMessages((prev) => [
        ...prev,
        { id: 'trade-success', sender: 'system', text: '🎉 Cả hai đã đồng ý trao đổi! Match được ghi nhận thành công.', time: new Date() },
      ]);
    }
  }, [myAgreed, theirAgreed, tradeCompleted]);

  const handleAgreeTrade = () => {
    if (tradeCompleted) return;
    setMyAgreed(true);
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'me', text: 'Tôi đồng ý trao đổi ✓', time: new Date() },
    ]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'me', text: newMessage, time: new Date() }]);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a0611] to-gray-900 flex flex-col">
      <div className="bg-black/40 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white">
              {match.theirItem.ownerAvatar}
            </div>
            <div>
              <p className="text-white font-semibold">@{match.theirItem.owner}</p>
              <p className="text-white/60 text-xs">Chat trao đổi riêng</p>
            </div>
          </div>
          <button onClick={() => setShowLeaveConfirm(true)} className="text-red-400 hover:text-red-300" title="Rời khỏi trao đổi">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#2D5A3D]/20 to-purple-500/20 border-b border-white/10 p-4">
        <p className="text-white/60 text-xs text-center mb-3">Sản phẩm trao đổi</p>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <img src={match.yourItems[0]?.image} alt="" className="w-16 h-16 object-cover rounded-lg mx-auto mb-1" />
            <p className="text-white text-xs">{match.yourItems[0]?.name}</p>
          </div>
          <div className="text-xl text-white/60">⇄</div>
          <div className="text-center">
            <img src={match.theirItem.image} alt="" className="w-16 h-16 object-cover rounded-lg mx-auto mb-1" />
            <p className="text-white text-xs">{match.theirItem.name}</p>
          </div>
        </div>
      </div>

      {theirAgreed && !myAgreed && (
        <div className="bg-blue-500/20 border-b border-blue-500/30 px-4 py-2 text-center">
          <p className="text-blue-300 text-sm font-medium">Đối phương đã đồng ý trao đổi.</p>
        </div>
      )}

      {tradeCompleted && (
        <div className="bg-green-500/20 border-b border-green-500/30 px-4 py-3 text-center">
          <p className="text-green-300 text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Trao đổi thành công — đã ghi nhận Trade Success
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
            {msg.sender === 'system' ? (
              <p className="text-white/60 text-xs bg-white/5 px-4 py-2 rounded-full">{msg.text}</p>
            ) : (
              <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender === 'me' ? 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white' : 'bg-white/10 text-white'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {!tradeCompleted && (
        <div className="bg-black/40 border-t border-white/10 p-3 space-y-2">
          {myAgreed && !theirAgreed && (
            <p className="text-center text-amber-300 text-xs">Đang chờ đối phương xác nhận...</p>
          )}
          <div className="flex gap-2">
            <button onClick={() => setShowLeaveConfirm(true)} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20">
              Rời Khỏi Trao Đổi
            </button>
            <button
              onClick={handleAgreeTrade}
              disabled={myAgreed}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold ${
                myAgreed ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
              }`}
            >
              {myAgreed ? 'Đã Đồng Ý ✓' : 'Đồng Ý Trao Đổi'}
            </button>
          </div>
        </div>
      )}

      {tradeCompleted && (
        <div className="bg-black/40 border-t border-white/10 p-4">
          <button onClick={onTradeSuccess} className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold">
            Hoàn Tất & Quay Lại
          </button>
        </div>
      )}

      <div className="bg-black/60 border-t border-white/10 p-4">
        <div className="flex space-x-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-3 rounded-full bg-white/10 text-white">
            <ImagePlus className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Trao đổi thông tin, hẹn gặp..."
            className="flex-1 px-4 py-3 rounded-full bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none"
          />
          <button onClick={handleSendMessage} className="px-6 py-3 rounded-full bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white font-semibold">
            Gửi
          </button>
        </div>
      </div>

      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-white/10">
            <h3 className="text-white font-bold mb-2">Rời khỏi trao đổi?</h3>
            <p className="text-white/60 text-sm mb-6">Match sẽ bị đóng. Danh sách yêu thích tạm của phiên Match sẽ bị xóa.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-white">
                Ở Lại
              </button>
              <button onClick={onLeaveTrade} className="flex-1 py-2 rounded-xl bg-red-600 text-white font-semibold">
                Rời Khỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
