import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Heart,
  Flame,
  MessageCircle,
  ArrowLeft,
  ImagePlus,
  MapPin,
  Package,
  Users,
  ChevronRight,
  CheckCircle2,
  LogOut,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bell,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authClient from '../../providers/authProvider/authService';
import { getAccessToken } from '../../features/auth/services/tokenService';
import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';

type MatchStep = 'landing' | 'select-products' | 'select-filters' | 'swiping';

// --- API DTOs & Interfaces ---
interface MatchCommunityStatsDto {
  activeParticipants: number;
  productsWaitingTrade: number;
}

interface MatchOfferingProductDto {
  productId: number;
  title: string;
  price: number;
  imageUrl: string;
  productStatus: string;
}

interface PriceBucketDto {
  label: string;
  minPrice: number | null;
  maxPrice: number | null;
  productCount: number;
  participantCount: number;
}

interface CityOptionDto {
  city: string;
  productCount: number;
  participantCount: number;
}

interface MatchFilterOptionsDto {
  priceBuckets: PriceBucketDto[];
  cities: CityOptionDto[];
}

interface MatchSessionResponseDto {
  matchSessionId: number;
  status: string;
  minPrice: number | null;
  maxPrice: number | null;
  city: string | null;
  offeringProducts: MatchOfferingProductDto[];
  estimatedProducts: number;
  estimatedParticipants: number;
  startedAt: string;
}

interface NextProductDto {
  productId: number;
  title: string;
  price: number;
  condition: string;
  brand: string;
  imageUrl: string;
  sellerName: string;
  sellerCity: string;
  isMatchSeed: boolean;
}

interface MatchLikedProductDto {
  productId: number;
  title: string;
  price: number;
  imageUrl: string;
  sellerName: string;
  swipedAt: string;
}

interface MatchInterestInboxItemDto {
  notificationId: number;
  interestedUserId: number;
  interestedUserName: string;
  interestedUserAvatar: string | null;
  likedProductId: number;
  likedProductTitle: string;
  likedProductImage: string | null;
  offeringProductId: number;
  offeringProductTitle: string;
  offeringProductImage: string | null;
  isRead: boolean;
  createdAt: string;
}

interface TradeMatchSummaryDto {
  tradeMatchId: number;
  conversationId: number;
  partnerUserId: number;
  partnerName: string;
  partnerAvatar: string;
  myProduct: MatchOfferingProductDto;
  partnerProduct: MatchOfferingProductDto;
  status: string; // Active, Completed, Cancelled
  myConfirmed: boolean;
  partnerConfirmed: boolean;
  createdAt: string;
}

interface MatchSwipeResultDto {
  hasMore: boolean;
  nextProduct: NextProductDto | null;
  isMutualMatch?: boolean;
  newMatch?: TradeMatchSummaryDto | null;
  message?: string;
}

interface ChatMessage {
  id: number;
  senderId: number;
  text?: string | null;
  content?: string | null;
  time: string;
  read?: boolean;
  imageUrl?: string | null;
}

export default function RevoraMatchPage() {
  const navigate = useNavigate();

  // Navigation Steps and general states
  const [step, setStep] = useState<MatchStep>('landing');
  const [stats, setStats] = useState<MatchCommunityStatsDto | null>(null);
  const [virtualParticipants, setVirtualParticipants] = useState(1001);
  const [virtualProducts, setVirtualProducts] = useState(2512);

  // Selection / Filter States
  const [myOfferProducts, setMyOfferProducts] = useState<MatchOfferingProductDto[]>([]);
  const [isMyProductsLoading, setIsMyProductsLoading] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());

  const [filterOptions, setFilterOptions] = useState<MatchFilterOptionsDto | null>(null);
  const [selectedPriceBucket, setSelectedPriceBucket] = useState<PriceBucketDto | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityOptionDto | null>(null);
  const [previewStats, setPreviewStats] = useState<{ estimatedProducts: number; estimatedParticipants: number } | null>(null);

  // Active session and swiping
  const [activeSession, setActiveSession] = useState<MatchSessionResponseDto | null>(null);
  const [currentSwipeCard, setCurrentSwipeCard] = useState<NextProductDto | null>(null);
  const [hasMoreCards, setHasMoreCards] = useState(true);
  const [isSwipeLoading, setIsSwipeLoading] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  // Match & Chat Modal States
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [newMutualMatch, setNewMutualMatch] = useState<TradeMatchSummaryDto | null>(null);
  const [showChat, setShowChat] = useState(false);

  // New UI/UX states
  const ITEMS_PER_PAGE = 8; // 4-col x 2 rows
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSwipedAtLeastOnce, setHasSwipedAtLeastOnce] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [likedCount, setLikedCount] = useState(0);

  // Dropdown panel states
  const [showTymList, setShowTymList] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [tymList, setTymList] = useState<MatchLikedProductDto[]>([]);
  const [interestInbox, setInterestInbox] = useState<MatchInterestInboxItemDto[]>([]);
  const [isLoadingTym, setIsLoadingTym] = useState(false);
  const [isLoadingInbox, setIsLoadingInbox] = useState(false);

  // --- Initial Data Loading: Stats & Active Session Recovery ---
  useEffect(() => {
    // 1. Fetch community statistics (anonymous endpoint)
    const fetchStats = async () => {
      try {
        const res = await authClient.get('/match-trade/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (e) {
        console.error('Failed to fetch stats', e);
      }
    };
    fetchStats();

    // 2. Recovery: Check if user has an active session currently running
    const checkActiveSession = async () => {
      try {
        const res = await authClient.get('/match-trade/sessions/active');
        if (res.data.success && res.data.data) {
          const sessionData: MatchSessionResponseDto = res.data.data;
          setActiveSession(sessionData);

          // Populate the selected product IDs
          if (sessionData.offeringProducts) {
            setSelectedProductIds(new Set(sessionData.offeringProducts.map(p => p.productId)));
          }

          // Fetch the first swipe card
          await fetchNextSwipeCard(sessionData.matchSessionId);
          setStep('swiping');
        }
      } catch (e: any) {
        // 404 means no active session is currently running, which is expected
        if (e.response?.status !== 404) {
          console.error('Failed to check active session status', e);
        }
      }
    };
    checkActiveSession();
  }, []);

  // Update virtual stats when real stats are loaded
  useEffect(() => {
    if (stats) {
      setVirtualParticipants(stats.activeParticipants);
      setVirtualProducts(stats.productsWaitingTrade);
    }
  }, [stats]);

  // Periodic random fluctuation to make numbers feel "live"
  useEffect(() => {
    const timer = setInterval(() => {
      setVirtualParticipants((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(10, prev + delta);
      });
      setVirtualProducts((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        return Math.max(10, prev + delta);
      });
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  // Synchronize virtual stats with localStorage and trigger custom event
  useEffect(() => {
    localStorage.setItem('revora_match_participants', String(virtualParticipants));
    localStorage.setItem('revora_match_products', String(virtualProducts));
    window.dispatchEvent(new Event('revora_match_stats_updated'));
  }, [virtualParticipants, virtualProducts]);

  // --- Load User's Exchangeable Products on Step 1 ---
  useEffect(() => {
    if (step === 'select-products') {
      const fetchMyProducts = async () => {
        setIsMyProductsLoading(true);
        try {
          const res = await authClient.get('/match-trade/my-products');
          if (res.data.success) {
            setMyOfferProducts(res.data.data);
          }
        } catch (e) {
          console.error('Failed to fetch offering products', e);
          toast.error('Không thể tải danh sách sản phẩm của bạn.');
        } finally {
          setIsMyProductsLoading(false);
        }
      };
      fetchMyProducts();
    }
  }, [step]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return myOfferProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [myOfferProducts, currentPage]);

  const totalPages = Math.ceil(myOfferProducts.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (step === 'select-products') {
      setCurrentPage(1);
    }
  }, [step]);

  // --- Fetch filter options (Price Ranges & Cities) on Step 2 ---
  useEffect(() => {
    if (step === 'select-filters') {
      const fetchFilterOptions = async () => {
        try {
          const res = await authClient.get('/match-trade/filter-options');
          if (res.data.success) {
            setFilterOptions(res.data.data);
          }
        } catch (e) {
          console.error('Failed to fetch filter options', e);
          toast.error('Không thể tải tùy chọn lọc.');
        }
      };
      fetchFilterOptions();
    }
  }, [step]);

  // --- Live filtering preview when BOTH bucket and city are selected on Step 2 ---
  useEffect(() => {
    if (step === 'select-filters' && selectedPriceBucket && selectedCity) {
      const fetchPreview = async () => {
        try {
          const res = await authClient.post('/match-trade/preview', {
            minPrice: selectedPriceBucket.minPrice,
            maxPrice: selectedPriceBucket.maxPrice,
            city: selectedCity.city,
          });
          if (res.data.success) {
            setPreviewStats(res.data.data);
          }
        } catch (e) {
          console.error('Failed to fetch preview stats', e);
        }
      };
      fetchPreview();
    } else {
      setPreviewStats(null);
    }
  }, [selectedPriceBucket, selectedCity, step]);

  // --- Helper to fetch next swiping card ---
  const fetchNextSwipeCard = async (sessionId: number) => {
    try {
      setIsSwipeLoading(true);
      setExitDirection(null);
      const res = await authClient.get(`/match-trade/sessions/${sessionId}/next`);
      if (res.data.success) {
        setHasMoreCards(res.data.data.hasMore);
        setCurrentSwipeCard(res.data.data.nextProduct);
      }
    } catch (e) {
      console.error('Failed to fetch next card', e);
      toast.error('Có lỗi xảy ra khi tải sản phẩm tiếp theo.');
    } finally {
      setIsSwipeLoading(false);
    }
  };

  // --- Actions ---
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

  const fetchTymList = useCallback(async (sessionId: number) => {
    setIsLoadingTym(true);
    try {
      const res = await authClient.get(`/match-trade/sessions/${sessionId}/my-likes`);
      if (res.data.success) setTymList(res.data.data);
    } catch (e) {
      console.error('Failed to fetch tym list', e);
    } finally {
      setIsLoadingTym(false);
    }
  }, []);

  const fetchInterestInbox = useCallback(async () => {
    setIsLoadingInbox(true);
    try {
      const res = await authClient.get('/match-trade/interest-inbox');
      if (res.data.success) setInterestInbox(res.data.data);
    } catch (e) {
      console.error('Failed to fetch interest inbox', e);
    } finally {
      setIsLoadingInbox(false);
    }
  }, []);

  const resetSession = useCallback(() => {
    setActiveSession(null);
    setCurrentSwipeCard(null);
    setHasMoreCards(true);
    setNewMutualMatch(null);
    setShowMatchModal(false);
    setShowChat(false);
    setSessionNotice(null);
    setHasSwipedAtLeastOnce(false);
    setExitDirection(null);
    setLikedCount(0);
    setTymList([]);
    setInterestInbox([]);
    setShowTymList(false);
    setShowInbox(false);
  }, []);

  const handleStartSession = async () => {
    if (selectedProductIds.size === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm.');
      return;
    }

    try {
      const res = await authClient.post('/match-trade/sessions', {
        productIds: Array.from(selectedProductIds),
        minPrice: selectedPriceBucket?.minPrice ?? null,
        maxPrice: selectedPriceBucket?.maxPrice ?? null,
        city: selectedCity?.city ?? null,
      });

      if (res.data.success) {
        setHasSwipedAtLeastOnce(false);
        setExitDirection(null);
        setLikedCount(0);
        const sessionData: MatchSessionResponseDto = res.data.data;
        setActiveSession(sessionData);
        await fetchNextSwipeCard(sessionData.matchSessionId);
        setStep('swiping');
      }
    } catch (e: any) {
      console.error('Failed to start session', e);
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra khi bắt đầu phiên Match.');
    }
  };

  const handleSwipe = async (liked: boolean) => {
    if (!activeSession || !currentSwipeCard || isSwipeLoading) return;

    const direction = liked ? 'like' : 'pass';
    const productId = currentSwipeCard.productId;

    setHasSwipedAtLeastOnce(true);
    // Standard exit direction: Like (liked === true) flies to the right, Pass (liked === false) flies to the left
    setExitDirection(liked ? 'right' : 'left');
    setCurrentSwipeCard(null);

    if (liked) {
      setLikedCount((prev) => prev + 1);
    }

    try {
      setIsSwipeLoading(true);
      const res = await authClient.post(`/match-trade/sessions/${activeSession.matchSessionId}/swipe`, {
        productId,
        direction,
      });

      if (res.data.success) {
        const result: MatchSwipeResultDto = res.data.data;

        if (direction === 'like') {
          setSessionNotice(res.data.message || 'Đã gửi thông báo quan tâm.');
        }

        if (result.isMutualMatch && result.newMatch) {
          setNewMutualMatch(result.newMatch);
          setShowMatchModal(true);
        }

        setHasMoreCards(result.hasMore);
        setCurrentSwipeCard(result.nextProduct);
      }
    } catch (e: any) {
      console.error('Failed to swipe', e);
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra khi thực hiện vuốt.');
    } finally {
      setIsSwipeLoading(false);
      setTimeout(() => setSessionNotice(null), liked ? 2500 : 300);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragOffset) > 100) {
      // Swiping Right (dragOffset > 0) means Like/Tym (true)
      // Swiping Left (dragOffset < 0) means Pass (false)
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

  const handleLeaveSession = async () => {
    if (activeSession) {
      try {
        await authClient.delete(`/match-trade/sessions/${activeSession.matchSessionId}`);
      } catch (e) {
        console.error('Failed to end session', e);
      }
    }
    resetSession();
    setStep('landing');
  };

  const showSwipeButtons = step === 'swiping' && (hasMoreCards || currentSwipeCard !== null || isSwipeLoading);

  if (showChat && newMutualMatch) {
    return (
      <ChatInterface
        match={newMutualMatch}
        onClose={() => {
          setShowChat(false);
          setStep('swiping');
        }}
        onLeaveTrade={handleTradeComplete}
        onTradeSuccess={handleTradeComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a0611] to-gray-900 relative overflow-hidden">
      {/* Dynamic Aesthetic Background Circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#2D5A3D]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex items-center justify-between p-6">
        <button
          onClick={() => (step === 'landing' ? navigate(-1) : setStep(step === 'swiping' ? 'select-filters' : step === 'select-filters' ? 'select-products' : 'landing'))}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors w-24"
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
        <div className="flex items-center justify-end w-24">
          {step === 'swiping' && (
            <button
              onClick={handleLeaveSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs font-semibold"
              title="Thoát phiên Match (xóa danh sách tạm)"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          )}
        </div>
      </div>

      {/* Step 0: Landing + Community Statistics */}
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
              <p className="text-3xl font-bold text-white">{virtualParticipants.toLocaleString('vi-VN')}</p>
              <p className="text-white/50 text-sm mt-1">người đang tham gia</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <Package className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{virtualProducts.toLocaleString('vi-VN')}</p>
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

      {/* Step 1: Chọn sản phẩm đem đi trao đổi */}
      {step === 'select-products' && (
        <div className="relative z-10 max-w-3xl mx-auto px-6 pb-10">
          <h2 className="text-xl font-bold text-white mb-1">Chọn Sản Phẩm Trao Đổi</h2>
          <p className="text-white/50 text-sm mb-6">
            Chọn một hoặc nhiều sản phẩm đại diện cho phiên Match. Đây là những món bạn sẵn sàng đem đi trao đổi.
          </p>

          {isMyProductsLoading ? (
            <p className="text-white/50 text-center py-12">Đang tải sản phẩm của bạn...</p>
          ) : myOfferProducts.length === 0 ? (
            <div className="text-center py-12 text-white/50 bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
              <Package className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="font-semibold text-white">Bạn chưa có sản phẩm nào đang đăng bán</p>
              <p className="text-xs text-white/40 mt-1">Vui lòng đăng bán sản phẩm công khai trước để đem đi trao đổi.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {paginatedProducts.map((item) => {
                  const isSelected = selectedProductIds.has(item.productId);
                  return (
                    <div key={item.productId} className="relative group">
                      <button
                        type="button"
                        onClick={() => toggleProductSelection(item.productId)}
                        className={`relative w-full text-left rounded-xl overflow-hidden border-2 transition-all ${isSelected ? 'border-orange-500 scale-[1.02]' : 'border-white/10 hover:border-white/30'}`}
                      >
                        <div className="relative">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-28 object-cover" />
                          <a
                            href={`/products/${item.productId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                            title="Xem chi tiết sản phẩm"
                          >
                            <span className="bg-black/80 text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1 backdrop-blur border border-white/20">
                              <ExternalLink className="w-3 h-3" /> Chi tiết
                            </span>
                          </a>
                        </div>
                        <div className="p-2 bg-white/5">
                          <p className="text-white font-semibold text-xs truncate">{item.title}</p>
                          <p className="text-orange-300 text-xs mt-0.5">{item.price.toLocaleString('vi-VN')}đ</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mb-8">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    Trước
                  </button>
                  <span className="text-white/60 text-sm">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}

          <button
            onClick={() => setStep('select-filters')}
            disabled={selectedProductIds.size === 0}
            className={`w-full py-4 rounded-2xl font-bold transition-all ${selectedProductIds.size > 0
              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:scale-[1.02]'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
          >
            Tiếp Tục ({selectedProductIds.size} sản phẩm đã chọn)
          </button>
        </div>
      )}

      {/* Step 2: Chọn điều kiện lọc và xem trước kết quả */}
      {step === 'select-filters' && (
        <div className="relative z-10 max-w-2xl mx-auto px-6 pb-10">
          <h2 className="text-xl font-bold text-white mb-1">Điều Kiện Match</h2>
          <p className="text-white/50 text-sm mb-6">Chọn khoảng giá và khu vực bạn muốn tìm sản phẩm trao đổi.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Price Bucket Filter */}
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-orange-400">₫</span> Khoảng Giá Mong Muốn
              </h3>
              <div className="space-y-3">
                {filterOptions?.priceBuckets.map((bucket, index) => {
                  const isSelected = selectedPriceBucket?.label === bucket.label;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedPriceBucket(bucket)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${isSelected
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <p className="text-white font-semibold text-sm">{bucket.label}</p>
                      <p className="text-white/50 text-xs mt-1">
                        {bucket.productCount.toLocaleString('vi-VN')} sản phẩm · {bucket.participantCount.toLocaleString('vi-VN')} người
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Filter */}
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" /> Khu Vực
              </h3>
              <div className="space-y-3">
                {filterOptions?.cities.map((cityOpt, index) => {
                  const isSelected = selectedCity?.city === cityOpt.city;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedCity(cityOpt)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${isSelected
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                      <p className="text-white font-semibold text-sm">{cityOpt.city}</p>
                      <p className="text-white/50 text-xs mt-1">
                        {cityOpt.productCount.toLocaleString('vi-VN')} sản phẩm · {cityOpt.participantCount.toLocaleString('vi-VN')} người
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {previewStats && (
            <div className="bg-[#2D5A3D]/20 border border-[#2D5A3D]/40 rounded-2xl p-4 mb-6">
              <p className="text-white/70 text-sm">Dự kiến trong phiên này bạn có thể tương tác với:</p>
              <p className="text-white font-bold text-lg mt-1">
                ~{previewStats.estimatedProducts.toLocaleString('vi-VN')} sản phẩm · ~{previewStats.estimatedParticipants.toLocaleString('vi-VN')} người
              </p>
            </div>
          )}

          <button
            onClick={handleStartSession}
            disabled={!selectedPriceBucket || !selectedCity}
            className={`w-full py-4 rounded-2xl font-bold transition-all ${selectedPriceBucket && selectedCity
              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:scale-[1.02]'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
          >
            Bắt Đầu Match
          </button>
        </div>
      )}

      {/* Step 3–4: Vuốt thẻ sản phẩm */}
      {step === 'swiping' && (
        <>
          {sessionNotice && (
            <div className="relative z-20 max-w-md mx-auto px-4 mb-2">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-2 text-white text-sm text-center">
                {sessionNotice}
              </div>
            </div>
          )}

          <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-160px)] p-4">
            {/* Left Side Button: Pass (X) */}
            {showSwipeButtons && (
              <motion.div
                className="fixed left-4 lg:left-12 top-1/2 -translate-y-1/2 z-20"
                animate={{
                  scale: isDragging && dragOffset < -20 ? 1.25 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSwipe(false)}
                  className={`w-16 h-16 md:w-20 md:h-20 bg-white/5 backdrop-blur-md border rounded-full flex items-center justify-center transition-all ${isDragging && dragOffset < -50
                      ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/50'
                      : 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                    }`}
                  disabled={isSwipeLoading}
                  title="Bỏ qua (Trái)"
                >
                  <X className="w-8 h-8 md:w-10 md:h-10" />
                </motion.button>
              </motion.div>
            )}

            {/* Center: Card Deck Container */}
            <div className="relative w-full max-w-md h-[600px] z-10">
              {/* Card visual stack depth */}
              {hasMoreCards && currentSwipeCard && (
                <div
                  className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-gray-800 opacity-40 translate-y-3 scale-95 pointer-events-none"
                  style={{ zIndex: 1 }}
                />
              )}

              <AnimatePresence mode="popLayout" custom={exitDirection}>
                {currentSwipeCard ? (
                  <motion.div
                    key={currentSwipeCard.productId}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDrag={(_, info) => {
                      setIsDragging(true);
                      setDragOffset(info.offset.x);
                    }}
                    onDragEnd={handleDragEnd}
                    initial={{ scale: 0.95, y: 10, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1, x: dragOffset }}
                    exit={{
                      x: exitDirection === 'left' ? -800 : exitDirection === 'right' ? 800 : 0,
                      y: 100,
                      scale: 0.1,
                      opacity: 0,
                      rotate: exitDirection === 'left' ? -45 : exitDirection === 'right' ? 45 : 0,
                      transition: { duration: 0.4, ease: 'easeIn' }
                    }}
                    custom={exitDirection}
                    style={{ zIndex: 10, rotate: dragOffset / 20 }}
                    className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
                  >
                    <div className="relative h-[600px] bg-white rounded-3xl overflow-hidden">
                      <img src={currentSwipeCard.imageUrl} alt={currentSwipeCard.title} className="w-full h-full object-cover animate-fade-in pointer-events-none" />

                      <AnimatePresence>
                        {isDragging && (
                          <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: dragOffset < -50 ? 1 : 0 }} className="absolute top-1/3 left-8 border-4 border-red-400 rounded-xl px-4 py-2 rotate-[-15deg] bg-black/40">
                              <span className="text-red-400 font-bold text-xl">BỎ QUA</span>
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: dragOffset > 50 ? 1 : 0 }} className="absolute top-1/3 right-8 border-4 border-green-400 rounded-xl px-4 py-2 rotate-[15deg] bg-black/40">
                              <span className="text-green-400 font-bold text-xl">QUAN TÂM</span>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-6">
                        <h3 className="text-white text-2xl font-bold mb-2">{currentSwipeCard.title}</h3>
                        <p className="text-white/80 text-lg mb-3">{currentSwipeCard.price.toLocaleString('vi-VN')}đ</p>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
                            {currentSwipeCard.brand || 'Unbranded'} · {currentSwipeCard.condition || 'Mới'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {currentSwipeCard.sellerName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold">@{currentSwipeCard.sellerName}</p>
                            <p className="text-white/60 text-xs">{currentSwipeCard.sellerCity}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 bg-gray-800/40 rounded-3xl border border-white/10 flex items-center justify-center h-[600px]" style={{ zIndex: 10 }}>
                    <div className="text-center text-white/50 p-6 w-full">
                      {isSwipeLoading ? (
                        <>
                          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                            {/* Pulsing radar rings */}
                            <div className="absolute inset-0 rounded-full border border-orange-500/30 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
                            <div className="absolute inset-2 rounded-full border border-orange-500/20 animate-ping opacity-50" style={{ animationDuration: '2s' }} />
                            <div className="absolute inset-4 rounded-full border border-orange-500/10 animate-ping opacity-25" style={{ animationDuration: '1.5s' }} />
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                              <Flame className="w-8 h-8 text-white animate-pulse" />
                            </div>
                          </div>
                          <p className="text-white font-semibold text-lg mb-2 animate-pulse">Đang tìm kiếm sản phẩm phù hợp...</p>
                          <p className="text-white/50 text-sm leading-relaxed max-w-[280px] mx-auto">
                            Hệ thống đang quét các sản phẩm thuộc khoảng giá và khu vực đã chọn.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                            <Package className="w-8 h-8 text-white/40" />
                          </div>
                          <p className="text-white font-semibold text-lg mb-2">
                            {hasSwipedAtLeastOnce ? 'Đã hết sản phẩm phù hợp' : 'Không tìm thấy sản phẩm phù hợp'}
                          </p>
                          <p className="text-white/50 text-sm mb-8 leading-relaxed max-w-[280px] mx-auto">
                            Vui lòng thay đổi bộ lọc khoảng giá hoặc khu vực khác để tiếp tục tìm kiếm sản phẩm trao đổi.
                          </p>
                          <div className="max-w-[200px] mx-auto">
                            <button
                              onClick={() => setStep('select-filters')}
                              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:scale-[1.02] transition-transform text-sm shadow-lg shadow-orange-500/20"
                            >
                              Thay Đổi Bộ Lọc
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side Button: Heart (Like) + Tym List Dropdown */}
            {showSwipeButtons && (
              <motion.div
                className="fixed right-4 lg:right-12 top-1/2 -translate-y-1/2 z-20"
                animate={{
                  scale: isDragging && dragOffset > 20 ? 1.25 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="relative flex flex-col items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSwipe(true)}
                    className={`w-16 h-16 md:w-20 md:h-20 bg-white/5 backdrop-blur-md border rounded-full flex items-center justify-center transition-all ${isDragging && dragOffset > 50
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 border-transparent text-white shadow-lg shadow-red-500/50'
                        : 'border-orange-500/30 text-orange-500 hover:bg-orange-500/10'
                      }`}
                    disabled={isSwipeLoading}
                    title="Quan tâm (Phải)"
                  >
                    <Heart className={`w-8 h-8 md:w-10 md:h-10 ${isDragging && dragOffset > 50 ? 'fill-white' : ''}`} />
                  </motion.button>
                  {likedCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-md animate-bounce">
                      {likedCount}
                    </span>
                  )}
                  {/* Tym List Toggle */}
                  <button
                    onClick={() => {
                      const next = !showTymList;
                      setShowTymList(next);
                      setShowInbox(false);
                      if (next && activeSession) fetchTymList(activeSession.matchSessionId);
                    }}
                    className="flex items-center gap-1 text-orange-400/70 hover:text-orange-300 transition-colors text-xs"
                    title="Xem danh sách đã Tym"
                  >
                    {showTymList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Tym List Dropdown Panel */}
          <AnimatePresence>
            {showTymList && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative z-20 max-w-2xl mx-auto px-4 mb-4"
              >
                <div className="bg-gray-900/95 backdrop-blur-md border border-orange-500/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-orange-300 font-semibold text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4 fill-orange-400 text-orange-400" />
                      Sản phẩm đã Tym ({tymList.length})
                    </h4>
                    <button onClick={() => setShowTymList(false)} className="text-white/40 hover:text-white/80 transition-colors">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                  {isLoadingTym ? (
                    <p className="text-white/40 text-xs text-center py-4">Đang tải...</p>
                  ) : tymList.length === 0 ? (
                    <p className="text-white/40 text-xs text-center py-4">Bạn chưa Tym sản phẩm nào trong phiên này.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {tymList.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3 bg-white/5 rounded-xl p-2">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate">{item.title}</p>
                            <p className="text-orange-300 text-xs">{item.price.toLocaleString('vi-VN')}đ</p>
                          </div>
                          <a
                            href={`/products/${item.productId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
                            title="Xem chi tiết"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interest Inbox Panel */}
          <AnimatePresence>
            {showInbox && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative z-20 max-w-2xl mx-auto px-4 mb-4"
              >
                <div className="bg-gray-900/95 backdrop-blur-md border border-purple-500/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-purple-300 font-semibold text-sm flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-400" />
                      Người quan tâm sản phẩm của bạn ({interestInbox.length})
                    </h4>
                    <button onClick={() => setShowInbox(false)} className="text-white/40 hover:text-white/80 transition-colors">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                  {isLoadingInbox ? (
                    <p className="text-white/40 text-xs text-center py-4">Đang tải...</p>
                  ) : interestInbox.length === 0 ? (
                    <p className="text-white/40 text-xs text-center py-4">Chưa có ai quan tâm sản phẩm của bạn.</p>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {interestInbox.map((item) => (
                        <div key={item.notificationId} className={`flex items-center gap-3 rounded-xl p-2 ${item.isRead ? 'bg-white/5' : 'bg-purple-500/10 border border-purple-500/20'}`}>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {item.interestedUserName?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold">@{item.interestedUserName}</p>
                            <p className="text-white/50 text-xs truncate">
                              Quan tâm: <span className="text-purple-300">{item.likedProductTitle}</span>
                            </p>
                            <p className="text-white/40 text-xs truncate">
                              Đề nghị đổi: <span className="text-white/60">{item.offeringProductTitle}</span>
                            </p>
                          </div>
                          {!item.isRead && <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 flex items-center justify-center gap-6 pb-6 px-4">
            <p className="text-white/40 text-xs text-center">
              Vuốt sang phải để quan tâm · Sang trái để bỏ qua
            </p>
            {/* Inbox Toggle Button */}
            <button
              onClick={() => {
                const next = !showInbox;
                setShowInbox(next);
                setShowTymList(false);
                if (next) fetchInterestInbox();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-all text-xs font-medium"
            >
              <Bell className="w-3.5 h-3.5" />
              Quan tâm tôi
              {interestInbox.filter(i => !i.isRead).length > 0 && (
                <span className="bg-purple-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {interestInbox.filter(i => !i.isRead).length}
                </span>
              )}
              {showInbox ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </>
      )}

      <AnimatePresence>
        {showMatchModal && newMutualMatch && (
          <MatchSuccessModal match={newMutualMatch} onOpenChat={handleOpenChat} onClose={() => setShowMatchModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}


// --- Dynamic Modal for Mutual Match Success ---
function MatchSuccessModal({
  match,
  onOpenChat,
  onClose,
}: {
  match: TradeMatchSummaryDto;
  onOpenChat: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative max-w-2xl w-full bg-gradient-to-br from-gray-900 to-[#1a0611] rounded-3xl p-8 shadow-2xl border border-white/10">
        <div className="text-center text-6xl mb-4">🔥</div>
        <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent animate-bounce">
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
            <img src={match.myProduct.imageUrl} alt={match.myProduct.title} className="w-20 h-20 object-cover rounded-xl mx-auto mb-2 border border-white/10" />
            <p className="text-white text-xs font-semibold">Sản phẩm của bạn</p>
            <p className="text-white/50 text-xs truncate max-w-[150px] mx-auto mt-0.5">{match.myProduct.title}</p>
          </div>
          <div className="text-3xl text-white/40 animate-pulse">⇄</div>
          <div className="text-center flex-1">
            <img src={match.partnerProduct.imageUrl} alt={match.partnerProduct.title} className="w-20 h-20 object-cover rounded-xl mx-auto mb-2 border border-white/10" />
            <p className="text-white text-xs font-semibold">@{match.partnerName}</p>
            <p className="text-white/50 text-xs truncate max-w-[150px] mx-auto mt-0.5">{match.partnerProduct.title}</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all">
            Tiếp Tục Duyệt
          </button>
          <button onClick={onOpenChat} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
            <MessageCircle className="w-5 h-5 animate-pulse" />
            Chat Ngay
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Live Chat & Trade Confirmation Screen ---
function ChatInterface({
  match,
  onClose,
  onLeaveTrade,
  onTradeSuccess,
}: {
  match: TradeMatchSummaryDto;
  onClose: () => void;
  onLeaveTrade: () => void;
  onTradeSuccess: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [myConfirmed, setMyConfirmed] = useState(match.myConfirmed);
  const [partnerConfirmed, setPartnerConfirmed] = useState(match.partnerConfirmed);
  const [isCompleted, setIsCompleted] = useState(match.status === 'Completed');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch chat history between the 2 users
  const fetchHistory = useCallback(async () => {
    try {
      const res = await authClient.get(`/chat/${match.partnerUserId}/messages`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch chat history', e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [match.partnerUserId]);

  // 2. Fetch trade summary updates (confirm status of both parties)
  const fetchMatchStatus = useCallback(async () => {
    try {
      const res = await authClient.get(`/match-trade/matches/${match.tradeMatchId}`);
      if (res.data.success && res.data.data) {
        const data: TradeMatchSummaryDto = res.data.data;
        setMyConfirmed(data.myConfirmed);
        setPartnerConfirmed(data.partnerConfirmed);
        if (data.status === 'Completed') {
          setIsCompleted(true);
        }
        if (data.status === 'Cancelled') {
          toast.error('Giao dịch đã bị hủy từ phía đối phương.');
          onLeaveTrade();
        }
      }
    } catch (e) {
      console.error('Failed to get match summary status', e);
    }
  }, [match.tradeMatchId, onLeaveTrade]);

  // Establish history load & polling interval
  useEffect(() => {
    fetchHistory();
    fetchMatchStatus();

    const interval = setInterval(fetchMatchStatus, 4000);
    return () => clearInterval(interval);
  }, [fetchHistory, fetchMatchStatus]);

  // Establish SignalR connection for real-time chat messages
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const hostUrl = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:7015/api/v1').replace('/api/v1', '');
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${hostUrl}/chatHub?access_token=${token}`)
      .withAutomaticReconnect()
      .build();

    newConnection.start()
      .then(() => {
        console.log('Connected to ChatHub in RevoraMatchPage ChatInterface');

        newConnection.on('ReceiveMessage', (msg: any) => {
          // Check if message belongs to this conversation
          if (msg.senderId === match.partnerUserId || msg.senderId === token) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        });
      })
      .catch((err) => console.error('SignalR ChatHub connection failure in ChatInterface: ', err));

    return () => {
      newConnection.stop();
    };
  }, [match.partnerUserId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Chat Actions ---
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isCompleted) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      const res = await authClient.post('/chat/send', {
        receiverId: match.partnerUserId,
        content: content,
        productRefId: match.partnerProduct.productId,
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể gửi tin nhắn.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isCompleted) return;

    try {
      const formData = new FormData();
      formData.append('files', file);

      const uploadRes = await authClient.post('/Media/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (uploadRes.data.success && uploadRes.data.urls.length > 0) {
        const imageUrl = uploadRes.data.urls[0];
        const res = await authClient.post('/chat/send', {
          receiverId: match.partnerUserId,
          content: '📷 Hình ảnh đính kèm',
          attachmentUrl: imageUrl,
        });

        if (res.data.success) {
          setMessages((prev) => [...prev, res.data.data]);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải hình ảnh lên.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmTrade = async () => {
    if (isCompleted) return;

    try {
      const res = await authClient.post(`/match-trade/matches/${match.tradeMatchId}/confirm`);
      if (res.data.success) {
        const result = res.data.data;
        setMyConfirmed(result.myConfirmed);
        setPartnerConfirmed(result.partnerConfirmed);

        if (result.isCompleted) {
          setIsCompleted(true);
          toast.success('Giao dịch thành công! Trạng thái sản phẩm đã chuyển sang Sold.');
        } else {
          toast.success('Bạn đã đồng ý trao đổi. Đang chờ đối phương xác nhận.');
        }
      }
    } catch (e: any) {
      console.error('Failed to confirm trade', e);
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra khi đồng ý trao đổi.');
    }
  };

  const handleCancelTrade = async () => {
    try {
      const res = await authClient.post(`/match-trade/matches/${match.tradeMatchId}/leave`);
      if (res.data.success) {
        toast.success('Đã rời khỏi trao đổi.');
        onLeaveTrade();
      }
    } catch (e: any) {
      console.error('Failed to leave trade', e);
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra khi rời khỏi trao đổi.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a0611] to-gray-900 flex flex-col">
      {/* Header bar */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full overflow-hidden flex items-center justify-center text-white font-bold">
              {match.partnerName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-white font-semibold">@{match.partnerName}</p>
              <p className="text-white/60 text-xs">Thương lượng trao đổi Match</p>
            </div>
          </div>
          <button onClick={() => setShowLeaveConfirm(true)} className="text-red-400 hover:text-red-300 transition-colors" title="Hủy trao đổi">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Products Summary Header */}
      <div className="bg-gradient-to-r from-[#2D5A3D]/20 to-purple-500/20 border-b border-white/10 p-4">
        <p className="text-white/60 text-xs text-center mb-3">Sản phẩm trao đổi</p>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center max-w-[140px]">
            <img src={match.myProduct.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg mx-auto mb-1 border border-white/10" />
            <p className="text-white text-xs truncate">{match.myProduct.title}</p>
          </div>
          <div className="text-xl text-white/60">⇄</div>
          <div className="text-center max-w-[140px]">
            <img src={match.partnerProduct.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg mx-auto mb-1 border border-white/10" />
            <p className="text-white text-xs truncate">{match.partnerProduct.title}</p>
          </div>
        </div>
      </div>

      {/* Confirmation Alerts */}
      {partnerConfirmed && !myConfirmed && (
        <div className="bg-blue-500/20 border-b border-blue-500/30 px-4 py-2 text-center animate-pulse">
          <p className="text-blue-300 text-sm font-medium">Đối phương đã đồng ý trao đổi.</p>
        </div>
      )}

      {isCompleted && (
        <div className="bg-green-500/20 border-b border-green-500/30 px-4 py-3 text-center">
          <p className="text-green-300 text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 animate-bounce" />
            Trao đổi thành công — đã ghi nhận Trade Success
          </p>
        </div>
      )}

      {/* Messaging Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingHistory ? (
          <p className="text-white/40 text-center py-6">Đang tải lịch sử tin nhắn...</p>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-white/30">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-55" />
            <p className="text-sm">Hãy gửi tin nhắn để bắt đầu thương lượng!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId !== match.partnerUserId;
            const contentText = msg.text || msg.content || '';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isMe
                  ? 'bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white rounded-br-sm'
                  : 'bg-white/10 text-white rounded-bl-sm border border-white/5'
                  }`}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Chat attachment" className="max-w-full rounded-lg mb-2 border border-white/10" />
                  )}
                  <p className="text-sm whitespace-pre-wrap">{contentText}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Confirmation & Agreements Action Bar */}
      {!isCompleted && (
        <div className="bg-black/40 border-t border-white/10 p-3 space-y-2">
          {myConfirmed && !partnerConfirmed && (
            <p className="text-center text-amber-300 text-xs animate-pulse">Đang chờ đối phương xác nhận...</p>
          )}
          <div className="flex gap-2">
            <button onClick={() => setShowLeaveConfirm(true)} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all">
              Rời Khỏi Trao Đổi
            </button>
            <button
              onClick={handleConfirmTrade}
              disabled={myConfirmed}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${myConfirmed ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90'
                }`}
            >
              {myConfirmed ? 'Đã Đồng Ý ✓' : 'Đồng Ý Trao Đổi'}
            </button>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="bg-black/40 border-t border-white/10 p-4">
          <button onClick={onTradeSuccess} className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold transition-all hover:scale-[1.01]">
            Hoàn Tất & Quay Lại
          </button>
        </div>
      )}

      {/* Input panel */}
      <div className="bg-black/60 border-t border-white/10 p-4">
        <div className="flex space-x-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
            <ImagePlus className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Trao đổi thông tin, hẹn gặp..."
            className="flex-1 px-4 py-3 rounded-full bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#2D5A3D]/40 text-sm"
          />
          <button onClick={handleSendMessage} className="px-6 py-3 rounded-full bg-gradient-to-r from-[#2D5A3D] to-[#3D7054] text-white font-semibold hover:opacity-90 transition-all text-sm">
            Gửi
          </button>
        </div>
      </div>

      {/* Confirm Leaving modal dialog */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl">
            <h3 className="text-white font-bold mb-2">Rời khỏi trao đổi?</h3>
            <p className="text-white/60 text-sm mb-6">Match này sẽ bị hủy bỏ hoàn toàn. Bạn có chắc chắn muốn thoát?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLeaveConfirm(false)} className="flex-1 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
                Ở Lại
              </button>
              <button onClick={handleCancelTrade} className="flex-1 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all">
                Hủy Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
