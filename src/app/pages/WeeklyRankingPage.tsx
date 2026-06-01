import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Award, Info, ChevronRight, Flame, Clock, Star, Users, Heart, Eye, Gift, Sparkles, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

interface RankingUser {
  id: string;
  username: string;
  avatar: string;
  soldCount: number;
  styleScore: number;
  rank: number;
  trendChange: number;
  badge?: string;
}

interface RankingProduct {
  id: string;
  name: string;
  image: string;
  seller: string;
  sellerAvatar: string;
  sales: number;
  likes: number;
  wishlist: number;
  views: number;
  rank: number;
  trending: boolean;
}

interface PredictionSlot {
  type: 'seller' | 'product';
  position: 1 | 2 | 3;
  targetId: string | null;
  targetName: string | null;
}

const MOCK_SELLERS: RankingUser[] = [
  {
    id: 'user1',
    username: 'Minh Anh',
    avatar: 'M',
    soldCount: 47,
    styleScore: 98,
    rank: 1,
    trendChange: 2,
    badge: 'Fashion Icon',
  },
  {
    id: 'user2',
    username: 'Thảo Nguyên',
    avatar: 'T',
    soldCount: 39,
    styleScore: 95,
    rank: 2,
    trendChange: 1,
    badge: 'Top Seller',
  },
  {
    id: 'user3',
    username: 'Khánh Linh',
    avatar: 'K',
    soldCount: 34,
    styleScore: 92,
    rank: 3,
    trendChange: -1,
    badge: 'Rising Star',
  },
  {
    id: 'user4',
    username: 'Mai Phương',
    avatar: 'M',
    soldCount: 28,
    styleScore: 88,
    rank: 4,
    trendChange: 0,
  },
  {
    id: 'user5',
    username: 'Hương Giang',
    avatar: 'H',
    soldCount: 25,
    styleScore: 85,
    rank: 5,
    trendChange: 3,
  },
  {
    id: 'user6',
    username: 'Lan Anh',
    avatar: 'L',
    soldCount: 23,
    styleScore: 82,
    rank: 6,
    trendChange: -2,
  },
  {
    id: 'user7',
    username: 'Bảo Trâm',
    avatar: 'B',
    soldCount: 21,
    styleScore: 80,
    rank: 7,
    trendChange: 1,
  },
  {
    id: 'user8',
    username: 'Quỳnh Chi',
    avatar: 'Q',
    soldCount: 19,
    styleScore: 78,
    rank: 8,
    trendChange: 0,
  },
  {
    id: 'user9',
    username: 'Thanh Tâm',
    avatar: 'T',
    soldCount: 18,
    styleScore: 75,
    rank: 9,
    trendChange: 2,
  },
  {
    id: 'user10',
    username: 'Phương Linh',
    avatar: 'P',
    soldCount: 17,
    styleScore: 73,
    rank: 10,
    trendChange: -1,
  },
  {
    id: 'user11',
    username: 'Ngọc Mai',
    avatar: 'N',
    soldCount: 16,
    styleScore: 71,
    rank: 11,
    trendChange: 0,
  },
  {
    id: 'user12',
    username: 'Thu Hà',
    avatar: 'T',
    soldCount: 15,
    styleScore: 69,
    rank: 12,
    trendChange: 1,
  },
  {
    id: 'user13',
    username: 'Diệu Linh',
    avatar: 'D',
    soldCount: 14,
    styleScore: 67,
    rank: 13,
    trendChange: -3,
  },
  {
    id: 'user14',
    username: 'Kim Ngân',
    avatar: 'K',
    soldCount: 13,
    styleScore: 65,
    rank: 14,
    trendChange: 2,
  },
  {
    id: 'user15',
    username: 'Hoài An',
    avatar: 'H',
    soldCount: 12,
    styleScore: 63,
    rank: 15,
    trendChange: 0,
  },
  {
    id: 'user16',
    username: 'Trúc Ly',
    avatar: 'T',
    soldCount: 11,
    styleScore: 61,
    rank: 16,
    trendChange: -1,
  },
  {
    id: 'user17',
    username: 'Ánh Dương',
    avatar: 'A',
    soldCount: 10,
    styleScore: 59,
    rank: 17,
    trendChange: 1,
  },
  {
    id: 'user18',
    username: 'Minh Châu',
    avatar: 'M',
    soldCount: 9,
    styleScore: 57,
    rank: 18,
    trendChange: 0,
  },
  {
    id: 'user19',
    username: 'Ý Nhi',
    avatar: 'Y',
    soldCount: 8,
    styleScore: 55,
    rank: 19,
    trendChange: -2,
  },
  {
    id: 'user20',
    username: 'Thiên Kim',
    avatar: 'T',
    soldCount: 7,
    styleScore: 53,
    rank: 20,
    trendChange: 1,
  },
];

const MOCK_PRODUCTS: RankingProduct[] = [
  {
    id: 'p1',
    name: 'Vintage Denim Jacket',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    seller: 'Minh Anh',
    sellerAvatar: 'M',
    sales: 12,
    likes: 234,
    wishlist: 89,
    views: 1247,
    rank: 1,
    trending: true,
  },
  {
    id: 'p2',
    name: 'Y2K Mini Skirt',
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400',
    seller: 'Thảo Nguyên',
    sellerAvatar: 'T',
    sales: 10,
    likes: 198,
    wishlist: 76,
    views: 1089,
    rank: 2,
    trending: true,
  },
  {
    id: 'p3',
    name: 'Oversized Blazer',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
    seller: 'Khánh Linh',
    sellerAvatar: 'K',
    sales: 9,
    likes: 187,
    wishlist: 65,
    views: 956,
    rank: 3,
    trending: true,
  },
  {
    id: 'p4',
    name: 'Retro Sneakers',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    seller: 'Mai Phương',
    sellerAvatar: 'M',
    sales: 8,
    likes: 156,
    wishlist: 54,
    views: 823,
    rank: 4,
    trending: false,
  },
  {
    id: 'p5',
    name: 'Vintage Handbag',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
    seller: 'Hương Giang',
    sellerAvatar: 'H',
    sales: 7,
    likes: 143,
    wishlist: 48,
    views: 745,
    rank: 5,
    trending: false,
  },
  {
    id: 'p6',
    name: 'Leather Boots',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',
    seller: 'Lan Anh',
    sellerAvatar: 'L',
    sales: 6,
    likes: 132,
    wishlist: 42,
    views: 689,
    rank: 6,
    trending: false,
  },
  {
    id: 'p7',
    name: 'Crop Top',
    image: 'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=400',
    seller: 'Bảo Trâm',
    sellerAvatar: 'B',
    sales: 6,
    likes: 128,
    wishlist: 40,
    views: 654,
    rank: 7,
    trending: false,
  },
  {
    id: 'p8',
    name: 'Wide Leg Jeans',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    seller: 'Quỳnh Chi',
    sellerAvatar: 'Q',
    sales: 5,
    likes: 121,
    wishlist: 38,
    views: 612,
    rank: 8,
    trending: false,
  },
  {
    id: 'p9',
    name: 'Knit Sweater',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
    seller: 'Thanh Tâm',
    sellerAvatar: 'T',
    sales: 5,
    likes: 115,
    wishlist: 35,
    views: 587,
    rank: 9,
    trending: false,
  },
  {
    id: 'p10',
    name: 'Sunglasses',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
    seller: 'Phương Linh',
    sellerAvatar: 'P',
    sales: 5,
    likes: 109,
    wishlist: 33,
    views: 545,
    rank: 10,
    trending: false,
  },
  {
    id: 'p11',
    name: 'Maxi Dress',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    seller: 'Ngọc Mai',
    sellerAvatar: 'N',
    sales: 4,
    likes: 102,
    wishlist: 31,
    views: 521,
    rank: 11,
    trending: false,
  },
  {
    id: 'p12',
    name: 'Bucket Hat',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
    seller: 'Thu Hà',
    sellerAvatar: 'T',
    sales: 4,
    likes: 98,
    wishlist: 29,
    views: 498,
    rank: 12,
    trending: false,
  },
  {
    id: 'p13',
    name: 'Platform Heels',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',
    seller: 'Diệu Linh',
    sellerAvatar: 'D',
    sales: 4,
    likes: 94,
    wishlist: 27,
    views: 476,
    rank: 13,
    trending: false,
  },
  {
    id: 'p14',
    name: 'Chain Necklace',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    seller: 'Kim Ngân',
    sellerAvatar: 'K',
    sales: 3,
    likes: 89,
    wishlist: 25,
    views: 445,
    rank: 14,
    trending: false,
  },
  {
    id: 'p15',
    name: 'Cargo Pants',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400',
    seller: 'Hoài An',
    sellerAvatar: 'H',
    sales: 3,
    likes: 85,
    wishlist: 23,
    views: 421,
    rank: 15,
    trending: false,
  },
  {
    id: 'p16',
    name: 'Tote Bag',
    image: 'https://images.unsplash.com/photo-1590393086243-a53d193d716b?w=400',
    seller: 'Trúc Ly',
    sellerAvatar: 'T',
    sales: 3,
    likes: 81,
    wishlist: 21,
    views: 398,
    rank: 16,
    trending: false,
  },
  {
    id: 'p17',
    name: 'Striped Shirt',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
    seller: 'Ánh Dương',
    sellerAvatar: 'A',
    sales: 3,
    likes: 77,
    wishlist: 19,
    views: 376,
    rank: 17,
    trending: false,
  },
  {
    id: 'p18',
    name: 'Ankle Boots',
    image: 'https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=400',
    seller: 'Minh Châu',
    sellerAvatar: 'M',
    sales: 2,
    likes: 73,
    wishlist: 17,
    views: 354,
    rank: 18,
    trending: false,
  },
  {
    id: 'p19',
    name: 'Silk Scarf',
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400',
    seller: 'Ý Nhi',
    sellerAvatar: 'Y',
    sales: 2,
    likes: 69,
    wishlist: 15,
    views: 332,
    rank: 19,
    trending: false,
  },
  {
    id: 'p20',
    name: 'Crossbody Bag',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
    seller: 'Thiên Kim',
    sellerAvatar: 'T',
    sales: 2,
    likes: 65,
    wishlist: 13,
    views: 310,
    rank: 20,
    trending: false,
  },
];

const PREDICTION_COSTS = {
  1: { posting: 10, featured: 8 },
  2: { posting: 7, featured: 5 },
  3: { posting: 5, featured: 3 },
};

export default function WeeklyRankingPage() {
  const [activeTab, setActiveTab] = useState<'seller' | 'product'>('seller');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [predictions, setPredictions] = useState<PredictionSlot[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<{
    type: 'seller' | 'product';
    position: 1 | 2 | 3;
  } | null>(null);
  const [userCredits] = useState({ posting: 25, featured: 12 });
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isPredictionLocked = timeLeft.days === 0 && timeLeft.hours < 24;

  const handlePredictionSelect = (type: 'seller' | 'product', position: 1 | 2 | 3, targetId: string, targetName: string) => {
    const cost = PREDICTION_COSTS[position];

    if (userCredits.posting >= cost.posting || userCredits.featured >= cost.featured) {
      setPredictions((prev) => {
        const existing = prev.find((p) => p.type === type && p.position === position);
        if (existing) {
          return prev.map((p) =>
            p.type === type && p.position === position
              ? { ...p, targetId, targetName }
              : p
          );
        }
        return [...prev, { type, position, targetId, targetName }];
      });
      setSelectedPrediction(null);
      setShowPredictionModal(false);
      setShowRewardModal(true);
    }
  };

  const getPredictionForPosition = (type: 'seller' | 'product', position: 1 | 2 | 3) => {
    return predictions.find((p) => p.type === type && p.position === position);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#1a0a0f] via-[#2a0f1a] to-[#1a0a0f] text-white">
        {/* Fixed Top Bar */}
        <div className="sticky top-16 z-40 bg-gradient-to-r from-[#1a0a0f]/95 via-[#2a0f1a]/95 to-[#1a0a0f]/95 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Left: Rules Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowRulesModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 transition-all"
                >
                  <Info className="w-5 h-5 text-[#C4603A]" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Thể lệ & Hướng dẫn</p>
              </TooltipContent>
            </Tooltip>

            {/* Center: Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-[#C4603A] to-white bg-clip-text text-transparent flex items-center gap-2">
                <Trophy className="w-6 h-6 text-[#C4603A]" />
                Weekly Fashion Challenge
              </h1>
            </div>

            {/* Right: Countdown */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
              <Clock className="w-5 h-5 text-[#C4603A]" />
              <span className="text-sm text-white/80">
                Còn: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('seller')}
              className={`flex-1 px-8 py-4 rounded-2xl font-medium transition-all ${
                activeTab === 'seller'
                  ? 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white shadow-xl shadow-[#2D5A3D]/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 backdrop-blur-xl border border-white/10'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <Flame className="w-5 h-5" />
                <span>Top Seller Tuần</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('product')}
              className={`flex-1 px-8 py-4 rounded-2xl font-medium transition-all ${
                activeTab === 'product'
                  ? 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white shadow-xl shadow-[#2D5A3D]/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 backdrop-blur-xl border border-white/10'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <TrendingUp className="w-5 h-5" />
                <span>Top Sản Phẩm Hot</span>
              </div>
            </button>
          </div>

          {/* Prediction Button */}
          {!isPredictionLocked && (
            <div className="mb-8 flex justify-center">
              <button
                onClick={() => setShowPredictionModal(true)}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C4603A] to-[#2D5A3D] hover:from-[#2D5A3D] hover:to-[#C4603A] transition-all shadow-xl shadow-[#C4603A]/30 hover:scale-105"
              >
                <Target className="w-6 h-6" />
                <span className="text-lg font-bold">Dự đoán ngay</span>
              </button>
            </div>
          )}

          {/* Ranking Content */}
          {activeTab === 'seller' ? (
            <div className="space-y-6">
              {/* Podium for Top 3 */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[2, 1, 3].map((position) => {
                  const user = MOCK_SELLERS.find((u) => u.rank === position);
                  if (!user) return null;

                  return (
                    <div
                      key={position}
                      className={`relative ${position === 1 ? 'scale-110 z-10' : ''}`}
                    >
                      <div className={`p-6 rounded-2xl backdrop-blur-xl border transition-all hover:scale-105 ${
                        position === 1
                          ? 'bg-gradient-to-br from-[#C4603A]/20 to-[#2D5A3D]/20 border-[#C4603A]/30 shadow-xl shadow-[#C4603A]/20'
                          : position === 2
                          ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                          : 'bg-gradient-to-br from-[#2D5A3D]/10 to-white/5 border-[#2D5A3D]/20'
                      }`}>
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative">
                            <div className={`absolute inset-0 rounded-full blur-xl ${
                              position === 1 ? 'bg-[#C4603A]/30' : 'bg-white/10'
                            }`} />
                            <div className={`relative w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                              position === 1
                                ? 'bg-gradient-to-br from-[#C4603A] to-[#2D5A3D] text-white'
                                : position === 2
                                ? 'bg-gradient-to-br from-white/30 to-white/10 text-white'
                                : 'bg-gradient-to-br from-[#2D5A3D]/30 to-white/10 text-white'
                            }`}>
                              {user.avatar}
                            </div>
                            <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              position === 1
                                ? 'bg-[#C4603A] text-white'
                                : position === 2
                                ? 'bg-white/80 text-gray-800'
                                : 'bg-[#2D5A3D] text-white'
                            }`}>
                              {position}
                            </div>
                          </div>

                          <div className="text-center">
                            <h3 className="font-bold text-white">{user.username}</h3>
                            {user.badge && (
                              <span className="text-xs text-[#C4603A]">{user.badge}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-white">{user.soldCount}</div>
                                  <div className="text-xs text-white/60">Đã bán</div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Số sản phẩm đã bán</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-[#C4603A]">{user.styleScore}</div>
                                  <div className="text-xs text-white/60">Điểm</div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Style Score tổng hợp</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          {user.trendChange !== 0 && (
                            <Tooltip>
                              <TooltipTrigger>
                                <div className={`flex items-center gap-1 text-xs ${
                                  user.trendChange > 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  <TrendingUp className={`w-4 h-4 ${user.trendChange < 0 ? 'rotate-180' : ''}`} />
                                  <span>{user.trendChange > 0 ? '+' : ''}{user.trendChange}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Thay đổi hạng so với tuần trước</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rest of the ranking 4-20 */}
              <div className="space-y-3">
                {MOCK_SELLERS.slice(3).map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/60">
                          {user.rank}
                        </div>

                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D5A3D]/30 to-white/10 flex items-center justify-center text-lg font-bold text-white">
                          {user.avatar}
                        </div>

                        <div>
                          <div className="font-medium text-white">{user.username}</div>
                          <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
                            <Tooltip>
                              <TooltipTrigger>
                                <span>{user.soldCount}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Đã bán</p>
                              </TooltipContent>
                            </Tooltip>
                            <span>•</span>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="text-[#C4603A]">{user.styleScore}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Style Score</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>

                      {user.trendChange !== 0 && (
                        <Tooltip>
                          <TooltipTrigger>
                            <div className={`flex items-center gap-1 text-sm ${
                              user.trendChange > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              <TrendingUp className={`w-4 h-4 ${user.trendChange < 0 ? 'rotate-180' : ''}`} />
                              <span>{user.trendChange > 0 ? '+' : ''}{user.trendChange}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Thay đổi hạng so với tuần trước</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top 3 Products */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[2, 1, 3].map((position) => {
                  const product = MOCK_PRODUCTS.find((p) => p.rank === position);
                  if (!product) return null;

                  return (
                    <div
                      key={position}
                      className={`relative ${position === 1 ? 'scale-110 z-10' : ''}`}
                    >
                      <div className={`p-6 rounded-2xl backdrop-blur-xl border transition-all hover:scale-105 ${
                        position === 1
                          ? 'bg-gradient-to-br from-[#C4603A]/20 to-[#2D5A3D]/20 border-[#C4603A]/30 shadow-xl shadow-[#C4603A]/20'
                          : position === 2
                          ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                          : 'bg-gradient-to-br from-[#2D5A3D]/10 to-white/5 border-[#2D5A3D]/20'
                      }`}>
                        <div className="space-y-4">
                          <div className="relative aspect-square rounded-xl overflow-hidden">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                            <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              position === 1
                                ? 'bg-[#C4603A] text-white'
                                : position === 2
                                ? 'bg-white/80 text-gray-800'
                                : 'bg-[#2D5A3D] text-white'
                            }`}>
                              {position}
                            </div>
                            {product.trending && (
                              <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-red-500/90 text-white text-xs font-medium flex items-center gap-1">
                                <Flame className="w-3 h-3" />
                                <span>Hot</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <h3 className="font-bold text-white text-sm">{product.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#2D5A3D]/30 to-white/10 flex items-center justify-center text-xs font-bold text-white">
                                {product.sellerAvatar}
                              </div>
                              <span className="text-xs text-white/60">{product.seller}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 text-white/70">
                                  <Heart className="w-3 h-3 text-red-400" />
                                  <span>{product.likes}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Lượt thích</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 text-white/70">
                                  <Eye className="w-3 h-3 text-blue-400" />
                                  <span>{product.views}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Lượt xem</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 text-white/70">
                                  <Star className="w-3 h-3 text-[#C4603A]" />
                                  <span>{product.wishlist}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Wishlist</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger>
                                <div className="flex items-center gap-1 text-white/70">
                                  <Users className="w-3 h-3 text-green-400" />
                                  <span>{product.sales}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Đã bán</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rest of products 4-20 */}
              <div className="grid grid-cols-2 gap-4">
                {MOCK_PRODUCTS.slice(3).map((product) => (
                  <div
                    key={product.id}
                    className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/60 flex-shrink-0">
                        {product.rank}
                      </div>

                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm truncate">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#2D5A3D]/30 to-white/10 flex items-center justify-center text-xs font-bold text-white">
                            {product.sellerAvatar}
                          </div>
                          <span className="text-xs text-white/60">{product.seller}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-white/60">
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {product.likes}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Lượt thích</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {product.views}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Lượt xem</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Prediction Modal */}
        <Dialog open={showPredictionModal} onOpenChange={setShowPredictionModal}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a0f] to-[#2a0f1a] border-white/10 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-6 h-6 text-[#C4603A]" />
                Dự đoán BXH Tuần
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Step 1: Choose Type */}
              <div>
                <h3 className="font-medium mb-3">1. Chọn bảng xếp hạng:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedPrediction({ type: 'seller', position: 1 })}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Flame className="w-6 h-6 text-orange-400" />
                      <div>
                        <div className="font-medium">Top Seller</div>
                        <div className="text-xs text-white/60">Dự đoán seller xuất sắc nhất</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedPrediction({ type: 'product', position: 1 })}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-[#C4603A]" />
                      <div>
                        <div className="font-medium">Top Sản Phẩm</div>
                        <div className="text-xs text-white/60">Dự đoán sản phẩm hot nhất</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {selectedPrediction && (
                <>
                  {/* Step 2: Choose Position */}
                  <div>
                    <h3 className="font-medium mb-3">2. Chọn vị trí dự đoán:</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {([1, 2, 3] as const).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setSelectedPrediction({ ...selectedPrediction, position: pos })}
                          className={`p-4 rounded-xl border transition-all ${
                            selectedPrediction.position === pos
                              ? 'bg-gradient-to-br from-[#C4603A]/20 to-[#2D5A3D]/20 border-[#C4603A]/30'
                              : 'bg-white/5 hover:bg-white/10 border-white/10'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#C4603A] mb-1">Top {pos}</div>
                            <div className="text-xs text-white/60 mb-2">Chi phí:</div>
                            <div className="text-sm">
                              <div className="text-blue-400">{PREDICTION_COSTS[pos].posting} lượt đăng</div>
                              <div className="text-white/50">hoặc</div>
                              <div className="text-[#C4603A]">{PREDICTION_COSTS[pos].featured} lượt nổi bật</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Choose Target */}
                  <div>
                    <h3 className="font-medium mb-3">3. Chọn {selectedPrediction.type === 'seller' ? 'seller' : 'sản phẩm'}:</h3>
                    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                      {(selectedPrediction.type === 'seller' ? MOCK_SELLERS : MOCK_PRODUCTS).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (selectedPrediction.type === 'seller') {
                              const seller = item as RankingUser;
                              handlePredictionSelect('seller', selectedPrediction.position, seller.id, seller.username);
                            } else {
                              const product = item as RankingProduct;
                              handlePredictionSelect('product', selectedPrediction.position, product.id, product.name);
                            }
                          }}
                          className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
                        >
                          {selectedPrediction.type === 'seller' ? (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D5A3D]/30 to-white/10 flex items-center justify-center text-lg font-bold text-white">
                                {(item as RankingUser).avatar}
                              </div>
                              <div>
                                <div className="font-medium text-white">{(item as RankingUser).username}</div>
                                <div className="text-sm text-white/60">{(item as RankingUser).soldCount} đã bán • {(item as RankingUser).styleScore} điểm</div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={(item as RankingProduct).image}
                                  alt={(item as RankingProduct).name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium text-white">{(item as RankingProduct).name}</div>
                                <div className="text-sm text-white/60">{(item as RankingProduct).seller} • {(item as RankingProduct).sales} bán</div>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Reward Modal */}
        <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a0f] to-[#2a0f1a] border-white/10 text-white">
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#C4603A] to-[#2D5A3D] flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-2">Dự đoán thành công! 🎉</h3>
                <p className="text-white/70">
                  Chúc bạn may mắn! Kết quả sẽ được công bố vào Chủ nhật 23:59.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-[#2D5A3D]/20 to-[#3D7054]/20 border border-white/10">
                <div className="text-sm text-white/80">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-[#C4603A]" />
                    <span className="font-medium">Phần thưởng nếu đúng:</span>
                  </div>
                  <div className="text-2xl font-bold text-[#C4603A]">x2 Lượt</div>
                </div>
              </div>

              <button
                onClick={() => setShowRewardModal(false)}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] hover:from-[#3D7054] hover:to-[#2D5A3D] transition-all font-medium"
              >
                Tiếp tục khám phá
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Rules Modal */}
        <Dialog open={showRulesModal} onOpenChange={setShowRulesModal}>
          <DialogContent className="bg-gradient-to-br from-[#1a0a0f] to-[#2a0f1a] border-white/10 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Info className="w-6 h-6 text-[#C4603A]" />
                Thể lệ & Hướng dẫn
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Section 1 */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] flex items-center justify-center text-sm">
                    1
                  </div>
                  Cách tham gia dự đoán
                </h3>
                <div className="space-y-3 text-sm text-white/80 ml-10">
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                    <span>Chọn BXH bạn muốn dự đoán: Top Seller hoặc Top Sản Phẩm</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                    <span>Chọn vị trí dự đoán: Top 1, Top 2, hoặc Top 3</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                    <span>Chọn seller/sản phẩm bạn tin sẽ đạt vị trí đó</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                    <span>Xác nhận dự đoán bằng Lượt đăng tin hoặc Lượt nổi bật</span>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] flex items-center justify-center text-sm">
                    2
                  </div>
                  Cách tính BXH
                </h3>
                <div className="space-y-4 text-sm text-white/80 ml-10">
                  <div>
                    <div className="font-medium text-white mb-2">Top Seller Tuần:</div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                        <span>Xếp hạng theo số lượng sản phẩm bán thành công</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                        <span>Style Score: Điểm tổng hợp từ đánh giá và tương tác</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-white mb-2">Top Sản Phẩm Hot:</div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                        <span>Lượt bán (trọng số 40%)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                        <span>Lượt thích (trọng số 30%)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                        <span>Wishlist (trọng số 20%)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                        <span>Lượt xem (trọng số 10%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] flex items-center justify-center text-sm">
                    3
                  </div>
                  Cách nhận phần thưởng
                </h3>
                <div className="space-y-3 text-sm text-white/80 ml-10">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="font-medium text-green-300 mb-2">✓ Dự đoán chính xác:</div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-200">Nhận x2 số lượt đã dùng để dự đoán</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <div className="font-medium text-yellow-300 mb-2">○ Dự đoán chưa chính xác:</div>
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-200">Hoàn lại 50% số lượt đã dùng</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-lg bg-[#C4603A]/10 border border-[#C4603A]/30">
                    <div className="font-medium text-[#C4603A] mb-2">🏆 Phần thưởng đặc biệt cho Top Seller:</div>
                    <div className="space-y-2 text-[#EBC9A8]">
                      <div className="flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Badge danh hiệu độc quyền</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Ưu tiên hiển thị profile</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>Tặng Lượt nổi bật miễn phí</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] flex items-center justify-center text-sm">
                    4
                  </div>
                  Thời gian khóa dự đoán
                </h3>
                <div className="space-y-3 text-sm text-white/80 ml-10">
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                    <span>BXH cập nhật: Mỗi 1 giờ</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                    <span>Dự đoán đóng: 24 giờ trước khi kết thúc tuần</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                    <span>Công bố kết quả: Chủ nhật 23:59</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                    <span>Trao thưởng: Trong vòng 24h sau khi công bố</span>
                  </div>
                </div>
              </div>

              {/* Section 5 */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] flex items-center justify-center text-sm">
                    5
                  </div>
                  Reset mùa mới
                </h3>
                <div className="space-y-3 text-sm text-white/80 ml-10">
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                    <span>BXH reset: Mỗi Thứ 2 lúc 00:00</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                    <span>Badge và phần thưởng được giữ lại vĩnh viễn</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                    <span>Lịch sử dự đoán có thể xem trong Profile</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-[#C4603A] flex-shrink-0" />
                    <span>Mỗi tuần là một cơ hội mới để tham gia!</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-[#2D5A3D]/20 to-[#3D7054]/20 border border-white/10 text-center">
                <p className="text-sm text-white/80">
                  💡 <span className="font-medium text-white">Mẹo nhỏ:</span> Theo dõi BXH thường xuyên để đưa ra dự đoán chính xác nhất!
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
