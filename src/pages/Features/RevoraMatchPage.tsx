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

type MatchStep = 'landing' | 'select-products' | 'select-filters' | 'starting' | 'swiping';

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
  imageUrl: string;
  sellerId: number;
  sellerName: string;
  sellerCity: string;
  isMatchSeed: boolean;
  brand?: string;
  hasBadge?: boolean;
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
  conversationId: number | null;
  partnerUserId: number;
  partnerName: string;
  partnerAvatar: string;
  myProducts: MatchOfferingProductDto[];
  partnerProducts: MatchOfferingProductDto[];
  status: string; // Active, Completed, Cancelled
  myConfirmed: boolean;
  partnerConfirmed: boolean;
  myNegotiateConfirmed: boolean;
  partnerNegotiateConfirmed: boolean;
  mySelectedProductIds: number[];
  partnerSelectedProductIds: number[];
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
  const [showMutualMatchPopup, setShowMutualMatchPopup] = useState(false);
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

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(3600);

  // Bulk Swipe / Negotiate from Inbox
  const [negotiateUser, setNegotiateUser] = useState<{ id: number, name: string } | null>(null);
  const [negotiateProducts, setNegotiateProducts] = useState<MatchOfferingProductDto[]>([]);
  const [negotiateSelectedIds, setNegotiateSelectedIds] = useState<Set<number>>(new Set());

  // Trade History Modal
  const [showTradeHistoryModal, setShowTradeHistoryModal] = useState(false);
  const [tradeHistoryList, setTradeHistoryList] = useState<TradeMatchSummaryDto[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const fetchTradeHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const res = await authClient.get('/match-trade/matches?status=Completed');
      if (res.data.success) setTradeHistoryList(res.data.data);
    } catch (e) {
      console.error(e);
      toast.error('Lỗi khi tải lịch sử giao dịch.');
    } finally {
      setIsHistoryLoading(false);
    }
  };

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

  // Set up real-time SignalR listeners for Match events
  useEffect(() => {
    const handleProductsRemoved = (e: any) => {
      const removedIds: number[] = e.detail;
      setTymList((prev) => prev.filter((p) => !removedIds.includes(p.productId)));
      if (currentSwipeCard && removedIds.includes(currentSwipeCard.productId)) {
        if (activeSession) fetchNextSwipeCard(activeSession.matchSessionId);
      }
    };

    const handleMutualMatch = (e: any) => {
      setNewMutualMatch(e.detail);
      setShowMatchModal(false);
      setShowMutualMatchPopup(true);
    };

    const handlePartnerNegotiated = (e: any) => {
      setNewMutualMatch((prev) => {
        if (prev && prev.tradeMatchId === e.detail.tradeMatchId) {
          return { 
            ...prev, 
            partnerNegotiateConfirmed: true,
            partnerSelectedProductIds: e.detail.selectedProductIds || prev.partnerSelectedProductIds
          };
        }
        return prev;
      });
    };

    const handleChatCreated = (e: any) => {
      setNewMutualMatch((prev) => {
        if (prev && prev.tradeMatchId === e.detail.tradeMatchId) {
          const updated = { ...prev, conversationId: e.detail.conversationId, myNegotiateConfirmed: true, partnerNegotiateConfirmed: true };
          setShowMutualMatchPopup(false);
          setShowChat(true);
          return updated;
        }
        return prev;
      });
    };

    const handleTradeCancelled = (e: any) => {
      setNewMutualMatch((prev) => {
        if (prev && prev.tradeMatchId === e.detail.tradeMatchId) {
          toast.error('Đối phương đã hủy yêu cầu trao đổi.');
          setShowMutualMatchPopup(false);
          return null;
        }
        return prev;
      });
    };

    window.addEventListener('revora_match_products_removed', handleProductsRemoved);
    window.addEventListener('revora_mutual_match_created', handleMutualMatch);
    window.addEventListener('revora_trade_partner_negotiated', handlePartnerNegotiated);
    window.addEventListener('revora_trade_chat_created', handleChatCreated);
    window.addEventListener('revora_trade_cancelled', handleTradeCancelled);

    return () => {
      window.removeEventListener('revora_match_products_removed', handleProductsRemoved);
      window.removeEventListener('revora_mutual_match_created', handleMutualMatch);
      window.removeEventListener('revora_trade_partner_negotiated', handlePartnerNegotiated);
      window.removeEventListener('revora_trade_chat_created', handleChatCreated);
      window.removeEventListener('revora_trade_cancelled', handleTradeCancelled);
    };
  }, [step, isSwipeLoading, activeSession, currentSwipeCard]);

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
            const data: MatchFilterOptionsDto = res.data.data;
            setFilterOptions(data);
            if (data.priceBuckets.length > 0) setSelectedPriceBucket(data.priceBuckets[0]);
            if (data.cities.length > 0) setSelectedCity(data.cities[0]);
          }
        } catch (e) {
          console.error('Failed to fetch filter options', e);
          toast.error('Không thể tải tùy chọn lọc.');
        }
      };
      fetchFilterOptions();
    }

    const handlePoolUpdate = () => {
      if (step === 'select-filters') {
        const fetchFilterOptions = async () => {
          try {
            const res = await authClient.get('/match-trade/filter-options');
            if (res.data.success) setFilterOptions(res.data.data);
          } catch (e) { }
        };
        fetchFilterOptions();
      }
    };

    window.addEventListener('revora_match_pool_updated', handlePoolUpdate);
    return () => window.removeEventListener('revora_match_pool_updated', handlePoolUpdate);
  }, [step]);

  // --- Live filtering preview when BOTH bucket and city are selected on Step 2 ---
  useEffect(() => {
    if (step === 'select-filters' && selectedPriceBucket && selectedCity) {
      const fetchPreview = async () => {
        try {
          const res = await authClient.post('/match-trade/preview', {
            minPrice: selectedPriceBucket.minPrice,
            maxPrice: selectedPriceBucket.maxPrice || 0,
            city: selectedCity.city === 'Tất cả khu vực' ? '' : selectedCity.city,
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

    const handlePoolUpdate = () => {
      if (step === 'select-filters' && selectedPriceBucket && selectedCity) {
        const fetchPreview = async () => {
          try {
            const res = await authClient.post('/match-trade/preview', {
              minPrice: selectedPriceBucket.minPrice,
              maxPrice: selectedPriceBucket.maxPrice || 0,
              city: selectedCity.city === 'Tất cả khu vực' ? '' : selectedCity.city,
            });
            if (res.data.success) setPreviewStats(res.data.data);
          } catch (e) {}
        };
        fetchPreview();
      }
    };

    window.addEventListener('revora_match_pool_updated', handlePoolUpdate);
    return () => window.removeEventListener('revora_match_pool_updated', handlePoolUpdate);
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

  // When swipe card is empty and a pool update happens, try to fetch next card
  useEffect(() => {
    const handlePoolUpdate = () => {
      if (step === 'swiping' && !currentSwipeCard && !isSwipeLoading && activeSession) {
        fetchNextSwipeCard(activeSession.matchSessionId);
      }
    };

    window.addEventListener('revora_match_pool_updated', handlePoolUpdate);
    return () => window.removeEventListener('revora_match_pool_updated', handlePoolUpdate);
  }, [step, currentSwipeCard, isSwipeLoading, activeSession]);

  // Handle products removed from pool dynamically
  useEffect(() => {
    const handleProductsRemoved = (e: any) => {
      const removedIds: number[] = e.detail;
      if (currentSwipeCard && removedIds.includes(currentSwipeCard.productId)) {
        if (activeSession) fetchNextSwipeCard(activeSession.matchSessionId);
      }
    };

    window.addEventListener('revora_match_products_removed', handleProductsRemoved);
    return () => window.removeEventListener('revora_match_products_removed', handleProductsRemoved);
  }, [currentSwipeCard, activeSession]);

  // Prevent back navigation during swiping
  useEffect(() => {
    if (step === 'swiping' || step === 'starting') {
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
        toast('Để thoát Match, vui lòng dùng nút Thoát ở góc trên phải.', {
          icon: '⚠️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [step]);

  // Handle timer countdown
  useEffect(() => {
    if (step !== 'swiping' || showChat) return;
    
    if (timeLeft <= 0) {
      toast.error('Đã hết thời gian phiên Match.');
      handleLeaveSession();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, showChat, timeLeft]);

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

  // Listen for interest notification received real-time
  useEffect(() => {
    const handleInterestReceived = () => {
      // Re-fetch inbox if already shown, or show toast/badge
      fetchInterestInbox();
      toast.success('Có người vừa quan tâm sản phẩm của bạn!', { icon: '🔔' });
    };

    window.addEventListener('revora_match_interest_received', handleInterestReceived);
    return () => window.removeEventListener('revora_match_interest_received', handleInterestReceived);
  }, [fetchInterestInbox]);

  const handleOpenInboxItem = async (userId: number, userName: string) => {
    try {
      const res = await authClient.get(`/match-trade/sessions/user/${userId}/offering-products`);
      if (res.data.success) {
        setNegotiateUser({ id: userId, name: userName });
        setNegotiateProducts(res.data.data);
        setNegotiateSelectedIds(new Set());
        setShowInbox(false);
      }
    } catch (e) {
      console.error(e);
      toast.error('Không thể tải danh sách sản phẩm.');
    }
  };

  const handleConfirmBulkSwipe = async () => {
    if (!activeSession || !negotiateUser) return;
    setIsSwipeLoading(true);
    try {
      const likedProductIds = Array.from(negotiateSelectedIds);

      const res = await authClient.post('/match-trade/notifications/bulk-swipe', {
        targetUserId: negotiateUser.id,
        productIds: likedProductIds
      });

      if (res.data.success) {
        const result = res.data.data;
        setNegotiateUser(null);
        fetchInterestInbox();

        if (result?.isMutualMatch && result?.newMatch) {
          // Mutual match detected! Show the Match Success popup for this user (User B)
          setNewMutualMatch(result.newMatch);
          setShowMatchModal(false);
          setShowMutualMatchPopup(true);
        } else {
          toast.success('Đã gửi phản hồi.');
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSwipeLoading(false);
    }
  };

  // --- Mutual Match Actions ---
  const handleNegotiateMatch = async (selectedIds: number[]) => {
    if (!newMutualMatch) return;
    try {
      const res = await authClient.post(`/match-trade/matches/${newMutualMatch.tradeMatchId}/negotiate`, {
        selectedProductIds: selectedIds
      });
      if (res.data.success) {
        setNewMutualMatch(prev => prev ? { ...prev, myNegotiateConfirmed: true, mySelectedProductIds: selectedIds } : null);
        toast.success('Đã gửi yêu cầu thương lượng.');
        if (res.data.data?.isCompleted) {
           // If somehow it's already completed (e.g. partner confirmed simultaneously), SignalR will handle ChatCreated
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  const handleCancelMatch = async () => {
    if (!newMutualMatch) return;
    try {
      const res = await authClient.post(`/match-trade/matches/${newMutualMatch.tradeMatchId}/leave`);
      if (res.data.success) {
        toast.success('Đã hủy trao đổi. Bạn có thể tiếp tục xem sản phẩm khác.');
        setShowMutualMatchPopup(false);
        setNewMutualMatch(null);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra khi hủy.');
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

  const toggleSelectAll = () => {
    if (selectedProductIds.size === myOfferProducts.length && myOfferProducts.length > 0) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(myOfferProducts.map(p => p.productId)));
    }
  };

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
        maxPrice: selectedPriceBucket?.maxPrice || 0,
        city: selectedCity?.city === 'Tất cả khu vực' ? '' : selectedCity?.city,
      });

      if (res.data.success) {
        setHasSwipedAtLeastOnce(false);
        setExitDirection(null);
        setLikedCount(0);
        const sessionData: MatchSessionResponseDto = res.data.data;
        setActiveSession(sessionData);
        await fetchNextSwipeCard(sessionData.matchSessionId);
        
        setStep('starting');
        setTimeout(() => {
          setStep('swiping');
        }, 5000);
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
          setShowMutualMatchPopup(true);
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

  const showSwipeButtons = step === 'swiping';

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

      <div className="relative z-10 flex items-center justify-between p-6 pb-2">
        <div className="w-24">
          {step !== 'swiping' && step !== 'starting' && (
            <button
              onClick={() => (step === 'landing' ? navigate(-1) : setStep(step === 'select-filters' ? 'select-products' : 'landing'))}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Quay Lại</span>
            </button>
          )}
        </div>
        
        <div className="flex flex-col items-center flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent flex items-center gap-3">
              REVORA MATCH
              {step === 'swiping' && (
                <span className="text-sm font-mono font-medium text-white/80 px-3 py-1 rounded-full bg-white/10 border border-white/20 shadow-inner">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              )}
            </h1>
          </div>
          {step === 'swiping' && activeSession && (
            <div className="flex items-center gap-4 text-xs font-semibold text-white/60">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-orange-400" /> {activeSession.estimatedParticipants.toLocaleString('vi-VN')} người</span>
              <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-pink-400" /> {activeSession.estimatedProducts.toLocaleString('vi-VN')} thẻ</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end w-24">
          {step === 'swiping' && (
            <button
              onClick={handleLeaveSession}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs font-semibold shadow-lg shadow-red-500/10"
              title="Thoát phiên Match"
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

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                if (!getAccessToken()) {
                  toast.error('Vui lòng đăng nhập để bắt đầu Match & Trade.');
                  navigate('/login');
                  return;
                }
                setStep('select-products');
              }}
              className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-red-500/50 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              Bắt Đầu Match & Trade
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => { 
                if (!getAccessToken()) {
                  toast.error('Vui lòng đăng nhập để xem lịch sử.');
                  navigate('/login');
                  return;
                }
                setShowTradeHistoryModal(true); 
                fetchTradeHistory(); 
              }}
              className="w-full py-4 rounded-2xl font-bold text-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              Lịch Sử Trao Đổi
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Chọn sản phẩm đem đi trao đổi */}
      {step === 'select-products' && (
        <div className="relative z-10 max-w-3xl mx-auto px-6 pb-10">
          <h2 className="text-xl font-bold text-white mb-1">Chọn Sản Phẩm Trao Đổi</h2>
          <div className="flex items-center justify-between mb-6">
            <p className="text-white/50 text-sm">
              Chọn một hoặc nhiều sản phẩm đại diện cho phiên Match. Đây là những món bạn sẵn sàng đem đi trao đổi.
            </p>
            {myOfferProducts.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="text-orange-400 text-sm hover:text-orange-300 font-semibold whitespace-nowrap"
              >
                {selectedProductIds.size === myOfferProducts.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            )}
          </div>

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
                            href={`/product/${item.productId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-2 right-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Xem chi tiết sản phẩm"
                          >
                            <span className="bg-black/80 text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur border border-white/20 hover:bg-black/90">
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
          <h2 className="text-xl font-bold text-white mb-2">Điều Kiện Match</h2>
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

      {step === 'starting' && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl text-center flex flex-col items-center"
          >
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full animate-ping opacity-75" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-4 border-4 border-orange-500/20 rounded-full animate-ping opacity-50" style={{ animationDuration: '1.5s' }} />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-2xl shadow-orange-500/50 flex items-center justify-center relative overflow-hidden">
                <Flame className="w-12 h-12 text-white animate-pulse relative z-10" />
                <div className="absolute inset-0 bg-white/20 rotate-45 transform translate-y-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">Đang tổng hợp sản phẩm...</h2>
            <p className="text-white/60 text-sm max-w-sm leading-relaxed mb-6">
              Hệ thống đang quét các bộ lọc và nạp danh sách sản phẩm mới nhất vào phiên của bạn.
            </p>
            <div className="flex items-center gap-2 text-orange-400">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
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

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-6 pt-20">
                        <div className="flex items-center justify-between mb-2">
                          <a href={`/product/${currentSwipeCard.productId}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex-1 pr-4">
                            <h3 className="text-white text-2xl font-bold truncate">{currentSwipeCard.title}</h3>
                          </a>
                          {(currentSwipeCard as any).isPremium && (
                            <span className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold px-2 py-1 rounded-md shadow-lg flex-shrink-0">
                              <Flame className="w-3 h-3" /> PREMIUM
                            </span>
                          )}
                        </div>
                        <p className="text-white/80 text-lg mb-3 font-semibold">{currentSwipeCard.price.toLocaleString('vi-VN')}đ</p>
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-white text-sm border border-white/10">
                            {currentSwipeCard.brand || 'Unbranded'} · {currentSwipeCard.condition || 'Mới'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-sm border border-white/10 p-3 rounded-2xl">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white/20 shadow-md">
                            {(currentSwipeCard as any).sellerAvatar ? (
                              <img src={(currentSwipeCard as any).sellerAvatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              currentSwipeCard.sellerName?.charAt(0) || 'U'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <a href={`/profile?userId=${currentSwipeCard.sellerId}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                              <p className="text-white text-sm font-bold truncate">@{currentSwipeCard.sellerName}</p>
                              {currentSwipeCard.hasBadge && (
                                <span title="Tài khoản uy tín">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                </span>
                              )}
                            </a>
                            <p className="text-white/60 text-xs flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {currentSwipeCard.sellerCity || 'Toàn quốc'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-gray-900/80 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl"
                  >
                    <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                      <div className="absolute inset-2 border-4 border-orange-500/40 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                      <Flame className="w-10 h-10 text-orange-400 animate-pulse relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Đang tìm kiếm thêm...</h3>
                    <p className="text-white/60 text-sm max-w-xs leading-relaxed mb-8">
                      Bạn đã duyệt hết sản phẩm hiện tại. Sản phẩm mới sẽ tự động hiện lên khi có người tham gia, hoặc bạn có thể đổi bộ lọc.
                    </p>
                    <button
                      onClick={handleLeaveSession}
                      className="px-6 py-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/10 hover:border-white/30"
                    >
                      Thoát để đổi bộ lọc
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side Buttons: Inbox + Heart + Tym List Toggle */}
            {showSwipeButtons && (
              <motion.div
                className="fixed right-4 lg:right-12 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4"
                animate={{
                  scale: isDragging && dragOffset > 20 ? 1.25 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Inbox Toggle Button */}
                <div className="relative group">
                  <button
                    onClick={() => {
                      const next = !showInbox;
                      setShowInbox(next);
                      setShowTymList(false);
                      if (next) fetchInterestInbox();
                    }}
                    className="w-12 h-12 md:w-14 md:h-14 bg-white/5 backdrop-blur-md border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 rounded-full flex items-center justify-center transition-all shadow-lg"
                    title="Người quan tâm"
                  >
                    <Bell className="w-6 h-6 md:w-7 md:h-7" />
                    {interestInbox.filter(i => !i.isRead).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-gray-900 shadow-md">
                        {interestInbox.filter(i => !i.isRead).length}
                      </span>
                    )}
                  </button>
                  {/* Dropdown panel for Inbox */}
                  <AnimatePresence>
                    {showInbox && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-0 right-[calc(100%+1rem)] w-80 max-h-96 bg-gray-900/95 backdrop-blur-md border border-purple-500/20 rounded-2xl p-4 shadow-2xl flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-3 flex-shrink-0">
                          <h4 className="text-purple-300 font-semibold text-sm flex items-center gap-2">
                            <Bell className="w-4 h-4 text-purple-400" />
                            Quan tâm ({interestInbox.length})
                          </h4>
                        </div>
                        {isLoadingInbox ? (
                          <p className="text-white/40 text-xs text-center py-4">Đang tải...</p>
                        ) : interestInbox.length === 0 ? (
                          <p className="text-white/40 text-xs text-center py-4">Chưa có ai quan tâm.</p>
                        ) : (
                          <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                            {interestInbox.map((item) => (
                              <div key={item.notificationId} onClick={() => handleOpenInboxItem(item.interestedUserId, item.interestedUserName)} className={`flex items-center gap-3 rounded-xl p-2 cursor-pointer transition-colors ${item.isRead ? 'bg-white/5 hover:bg-white/10' : 'bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20'}`}>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {item.interestedUserName?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="hover:underline text-white text-xs font-semibold block">
                                    @{item.interestedUserName}
                                  </span>
                                  <p className="text-white/50 text-xs truncate">Quan tâm: <span className="text-purple-300">{item.likedProductTitle}</span></p>
                                  <p className="text-white/40 text-xs truncate">Đề nghị đổi: <span className="text-white/60">{item.offeringProductTitle}</span></p>
                                </div>
                                {!item.isRead && <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative group flex flex-col items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSwipe(true)}
                    className={`w-16 h-16 md:w-20 md:h-20 bg-white/5 backdrop-blur-md border rounded-full flex items-center justify-center transition-all ${isDragging && dragOffset > 50
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 border-transparent text-white shadow-lg shadow-red-500/50'
                        : 'border-orange-500/30 text-orange-500 hover:bg-orange-500/10'
                      }`}
                    disabled={isSwipeLoading || currentSwipeCard === null}
                    title="Quan tâm (Phải)"
                  >
                    <Heart className={`w-8 h-8 md:w-10 md:h-10 ${isDragging && dragOffset > 50 ? 'fill-white' : ''}`} />
                  </motion.button>
                  {likedCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-900 shadow-md animate-bounce">
                      {likedCount}
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Right Side Slide-out Tym List */}
            {showSwipeButtons && (
              <div className="fixed right-0 top-1/4 bottom-1/4 z-30 flex items-center">
                <AnimatePresence>
                  {showTymList && (
                    <motion.div
                      initial={{ opacity: 0, x: 20, width: 0 }}
                      animate={{ opacity: 1, x: 0, width: 320 }}
                      exit={{ opacity: 0, x: 20, width: 0 }}
                      className="h-full bg-gray-900/95 backdrop-blur-md border border-orange-500/20 rounded-l-2xl shadow-2xl flex flex-col overflow-hidden mr-2"
                    >
                      <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-white/5">
                        <h4 className="text-orange-300 font-semibold text-sm flex items-center gap-2">
                          <Heart className="w-4 h-4 fill-orange-400 text-orange-400" />
                          Đã Tym ({tymList.length})
                        </h4>
                        <button onClick={() => setShowTymList(false)} className="text-white/40 hover:text-white transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {isLoadingTym ? (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                        </div>
                      ) : tymList.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                          <Heart className="w-10 h-10 text-white/10 mb-3" />
                          <p className="text-white/40 text-sm">Bạn chưa Tym sản phẩm nào.</p>
                          <p className="text-white/30 text-xs mt-1">Vuốt thẻ sang phải để Tym</p>
                        </div>
                      ) : (
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                          {tymList.map((item) => (
                            <div key={item.productId} className="flex gap-3 bg-white/5 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors group">
                              {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-white text-sm font-semibold truncate group-hover:text-orange-300 transition-colors">{item.title}</p>
                                <p className="text-white/60 text-xs mt-0.5">{item.price.toLocaleString('vi-VN')}đ</p>
                              </div>
                              <a href={`/product/${item.productId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-orange-500/20 text-white/40 hover:text-orange-400 transition-all flex-shrink-0" title="Xem chi tiết">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => {
                    const next = !showTymList;
                    setShowTymList(next);
                    setShowInbox(false);
                    if (next && activeSession) fetchTymList(activeSession.matchSessionId);
                  }}
                  className="bg-white/5 backdrop-blur-md border border-r-0 border-orange-500/30 text-orange-400 p-2 rounded-l-xl hover:bg-orange-500/10 transition-all shadow-[-2px_0_10px_rgba(249,115,22,0.1)] flex flex-col items-center gap-2"
                  title="Danh sách đã Tym"
                >
                  <Heart className="w-5 h-5 fill-orange-400" />
                  <span className={`text-xl leading-none font-light transition-transform ${showTymList ? 'rotate-180' : ''}`}>{'<'}</span>
                </button>
              </div>
            )}

          </div>

          <div className="relative z-10 flex items-center justify-center gap-6 pb-6 px-4">
            <p className="text-white/40 text-xs text-center">
              Vuốt sang phải để quan tâm · Sang trái để bỏ qua
            </p>
          </div>
        </>
      )}

      {/* Trade History Modal */}
      <AnimatePresence>
        {showTradeHistoryModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowTradeHistoryModal(false)} />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="relative max-w-lg w-full bg-gray-900 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Lịch Sử Match Thành Công</h2>
                <button onClick={() => setShowTradeHistoryModal(false)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {isHistoryLoading ? (
                <div className="flex-1 flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                </div>
              ) : tradeHistoryList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                  <Heart className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-white/60 font-medium">Chưa có giao dịch Match nào thành công.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                  {tradeHistoryList.map(match => (
                    <div key={match.tradeMatchId} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 hover:bg-white/10 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate mb-1">Giao dịch với @{match.partnerName}</p>
                        <p className="text-white/50 text-xs mb-3">{new Date(match.createdAt).toLocaleDateString('vi-VN')} {new Date(match.createdAt).toLocaleTimeString('vi-VN')}</p>
                        <div className="flex items-center gap-3">
                          <img src={match.myProducts[0]?.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          <span className="text-white/40 text-lg">⇄</span>
                          <img src={match.partnerProducts[0]?.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="bg-green-500/20 border border-green-500/30 rounded-full p-2" title="Thành công">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Modal for Mutual Match Success */}
      {showMutualMatchPopup && newMutualMatch && (
        <MatchSuccessModal
          match={newMutualMatch}
          onNegotiate={handleNegotiateMatch}
          onCancel={handleCancelMatch}
        />
      )}

      {/* Negotiate Bulk Swipe Modal */}
      {negotiateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative max-w-2xl w-full bg-gray-900 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-sm font-bold">{negotiateUser.name.charAt(0)}</span>
                  @{negotiateUser.name}
                </h2>
                <p className="text-white/50 text-sm mt-1">Chọn các sản phẩm bạn muốn trao đổi với người này</p>
              </div>
              <button onClick={() => setNegotiateUser(null)} className="text-white/40 hover:text-white bg-white/5 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[200px]">
              {negotiateProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/50">
                  <Package className="w-10 h-10 mb-2 opacity-30" />
                  <p>Người này không có sản phẩm nào đang trao đổi.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {negotiateProducts.map(p => {
                    const isSelected = negotiateSelectedIds.has(p.productId);
                    return (
                      <div 
                        key={p.productId} 
                        onClick={() => {
                          setNegotiateSelectedIds(prev => {
                            const next = new Set(prev);
                            if (next.has(p.productId)) next.delete(p.productId);
                            else next.add(p.productId);
                            return next;
                          });
                        }}
                        className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-orange-500 scale-[1.02]' : 'border-white/10 hover:border-white/30'}`}
                      >
                        <img src={p.imageUrl} alt="" className="w-full h-32 object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 backdrop-blur-sm">
                          <p className="text-white text-xs font-semibold truncate">{p.title}</p>
                          <p className="text-orange-300 text-[10px] font-bold">{p.price.toLocaleString('vi-VN')}đ</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex-shrink-0">
              <button
                onClick={handleConfirmBulkSwipe}
                disabled={isSwipeLoading}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20 hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                Xác nhận lựa chọn ({negotiateSelectedIds.size})
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}


// --- Dynamic Modal for Mutual Match Success ---
function MatchSuccessModal({
  match,
  onNegotiate,
  onCancel,
}: {
  match: TradeMatchSummaryDto;
  onNegotiate: (selectedPartnerProductIds: number[]) => void;
  onCancel: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(match.mySelectedProductIds || []));

  const togglePartnerProduct = (productId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative max-w-2xl w-full bg-gradient-to-br from-gray-900 to-[#1a0611] rounded-3xl p-8 shadow-2xl border border-white/10 max-h-[90vh] flex flex-col">
        {match.myNegotiateConfirmed ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full border-t-2 border-orange-500 border-solid animate-spin mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Đang chờ đối phương xác nhận...</h2>
            <p className="text-white/60 text-center">
              Bạn đã chọn sản phẩm và gửi yêu cầu thương lượng. Vui lòng giữ màn hình này chờ @{match.partnerName} phản hồi.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-shrink-0">
              <div className="text-center text-6xl mb-4">🔥</div>
              <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent animate-bounce">
                Match Thành Công!
              </h2>
              <p className="text-white/60 text-center mb-6 text-sm">
                Chọn các sản phẩm của đối phương mà bạn muốn thêm vào cuộc thương lượng.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[150px]">
              <div className="flex flex-col gap-6">
                {/* Partner's Products (Selectable) */}
                <div>
                  <h3 className="text-white text-sm font-semibold mb-3 text-center">Sản phẩm của @{match.partnerName} (Bạn có thể chọn)</h3>
                  <div className="flex justify-center flex-wrap gap-3">
                    {match.partnerProducts.map(p => {
                      const isSelected = selectedIds.has(p.productId);
                      return (
                        <div 
                          key={p.productId} 
                          onClick={() => togglePartnerProduct(p.productId)}
                          className={`relative w-24 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-orange-500 scale-[1.05]' : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'}`}
                        >
                          <img src={p.imageUrl} alt={p.title} className="w-full h-24 object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 backdrop-blur-sm">
                            <p className="text-white text-[10px] font-semibold truncate">{p.title}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-3xl text-white/20">⇄</div>
                </div>

                {/* My Products (View only) */}
                <div>
                  <h3 className="text-white text-sm font-semibold mb-3 text-center">Sản phẩm của bạn (Đối phương sẽ chọn)</h3>
                  <div className="flex justify-center flex-wrap gap-3">
                    {match.myProducts.map(p => {
                      const isPartnerSelected = match.partnerSelectedProductIds?.includes(p.productId);
                      return (
                        <div key={p.productId} className={`relative w-24 rounded-xl overflow-hidden border-2 transition-all ${isPartnerSelected ? 'border-orange-500' : 'border-white/10 opacity-50'}`}>
                          <img src={p.imageUrl} alt={p.title} className="w-full h-24 object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 backdrop-blur-sm">
                            <p className="text-white text-[10px] font-semibold truncate">{p.title}</p>
                          </div>
                          {isPartnerSelected && (
                            <div className="absolute top-1 right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-6 flex-shrink-0">
              <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all">
                Hủy
              </button>
              <button 
                onClick={() => onNegotiate(Array.from(selectedIds))} 
                disabled={selectedIds.size === 0}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
              >
                <MessageCircle className="w-5 h-5" />
                Thương lượng ({selectedIds.size})
              </button>
            </div>
          </>
        )}
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
  const [showConfirmRequest, setShowConfirmRequest] = useState(false);
  const [matchData, setMatchData] = useState<TradeMatchSummaryDto>(match);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Compute the products to show in chat header based on negotiated selections
  const myNegotiatedProducts = useMemo(() => {
    // Products of mine that the partner selected (what partner wants from me)
    const partnerSelectedIds = matchData.partnerSelectedProductIds || [];
    if (partnerSelectedIds.length > 0) {
      return matchData.myProducts.filter(p => partnerSelectedIds.includes(p.productId));
    }
    return matchData.myProducts;
  }, [matchData]);

  const partnerNegotiatedProducts = useMemo(() => {
    // Products of partner that I selected (what I want from partner)
    const mySelectedIds = matchData.mySelectedProductIds || [];
    if (mySelectedIds.length > 0) {
      return matchData.partnerProducts.filter(p => mySelectedIds.includes(p.productId));
    }
    return matchData.partnerProducts;
  }, [matchData]);

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

  // 2. Fetch trade summary updates (confirm status + negotiated product selections)
  const fetchMatchStatus = useCallback(async () => {
    try {
      const res = await authClient.get(`/match-trade/matches/${match.tradeMatchId}`);
      if (res.data.success && res.data.data) {
        const data: TradeMatchSummaryDto = res.data.data;
        setMatchData(data);
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

        newConnection.on('TradeConfirmRequested', (data: any) => {
          if (data.tradeMatchId === match.tradeMatchId) {
            setShowConfirmRequest(true);
            fetchMatchStatus(); // Update confirmation state flags
          }
        });

        newConnection.on('TradeConfirmDeclined', (data: any) => {
          if (data.tradeMatchId === match.tradeMatchId) {
            toast.error('Đối phương đã từ chối xác nhận trao đổi.');
            fetchMatchStatus();
          }
        });

        newConnection.on('TradeCompleted', (data: any) => {
          if (data.tradeMatchId === match.tradeMatchId) {
            fetchMatchStatus();
          }
        });
        
        newConnection.on('TradeCancelled', (data: any) => {
          if (data.tradeMatchId === match.tradeMatchId) {
            toast.error('Giao dịch đã bị hủy từ phía đối phương.');
            onLeaveTrade();
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
        productRefId: match.partnerProducts[0]?.productId,
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

  const handleDeclineConfirm = async () => {
    try {
      const res = await authClient.post(`/match-trade/matches/${match.tradeMatchId}/decline-confirm`);
      if (res.data.success) {
        setShowConfirmRequest(false);
        setPartnerConfirmed(false);
        setMyConfirmed(false);
      }
    } catch (e: any) {
      console.error('Failed to decline trade confirmation', e);
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra khi từ chối.');
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
          <div className="w-6" /> {/* Placeholder for alignment instead of ArrowLeft */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2D5A3D] to-[#3D7054] rounded-full overflow-hidden flex items-center justify-center text-white font-bold">
              {match.partnerName?.charAt(0) || 'U'}
            </div>
            <div>
              <a href={`/profile?userId=${match.partnerUserId}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                <p className="text-white font-semibold">@{match.partnerName}</p>
              </a>
              <p className="text-white/60 text-xs">Thương lượng trao đổi Match</p>
            </div>
          </div>
          <button onClick={() => setShowLeaveConfirm(true)} className="text-red-400 hover:text-red-300 transition-colors" title="Hủy trao đổi">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Products Summary Header - Shows negotiated products */}
      <div className="bg-gradient-to-r from-[#2D5A3D]/20 to-purple-500/20 border-b border-white/10 p-4">
        <p className="text-white/60 text-xs text-center mb-3">Tất cả sản phẩm đã Tym nhau</p>
        <div className="flex items-center justify-center gap-6">
          {/* My products that partner selected */}
          <div className="flex flex-col items-center max-w-[45%]">
            <p className="text-white text-xs font-semibold mb-2">Sản phẩm của bạn</p>
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 max-w-full">
              {myNegotiatedProducts.map(p => (
                <a key={p.productId} href={`/product/${p.productId}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0" title={p.title}>
                  <img src={p.imageUrl} alt="" className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-white/10 hover:opacity-80 hover:border-orange-500 transition-all" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="text-2xl text-white/40 font-light flex-shrink-0">⇄</div>
          
          {/* Partner's products that I selected */}
          <div className="flex flex-col items-center max-w-[45%]">
            <p className="text-white text-xs font-semibold mb-2">@{matchData.partnerName}</p>
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 max-w-full">
              {partnerNegotiatedProducts.map(p => (
                <a key={p.productId} href={`/product/${p.productId}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0" title={p.title}>
                  <img src={p.imageUrl} alt="" className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-white/10 hover:opacity-80 hover:border-orange-500 transition-all" />
                </a>
              ))}
            </div>
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

      {/* Trade Confirm Request Popup for User B */}
      {showConfirmRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-[#1a0611] rounded-3xl p-6 max-w-md w-full border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.15)] text-center">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4 border border-orange-500/30 shadow-lg shadow-orange-500/20">
              <CheckCircle2 className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Xác Nhận Trao Đổi</h3>
            <p className="text-white/70 text-sm mb-6 leading-relaxed">
              <strong className="text-white">@{match.partnerName}</strong> đã xác nhận muốn chốt giao dịch trao đổi này. Bạn có đồng ý hoàn tất giao dịch không?
              <br/><br/>
              <span className="text-xs text-white/40">Sản phẩm của cả hai sẽ được chuyển trạng thái sang "Đã Bán" nếu bạn đồng ý.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={handleDeclineConfirm} className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all">
                Từ chối
              </button>
              <button onClick={() => {
                setShowConfirmRequest(false);
                handleConfirmTrade();
              }} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:scale-[1.02] shadow-lg shadow-green-500/30 transition-all">
                Đồng Ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
