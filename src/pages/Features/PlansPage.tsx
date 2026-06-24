import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, Image, Check, X, QrCode, History, TrendingUp, TrendingDown, Calendar, CheckCircle, Clock, AlertCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import CreditDisplay from '../../components/common/CreditDisplay';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { authClient } from '../../providers/authProvider/authService';
import type { ApiResponse } from '../../features/auth/types';
import { useCheckout } from '../../features/payment/hooks/useCheckout';
import {
  fetchFeaturedCreditSummary,
  fetchPostingCreditSummary,
  mapCreditBatches,
} from '../../features/credits/services/creditPackageService';
import type { CreditBatch, UserCreditBatchItemApi, UserCreditSummaryApi } from '../../features/credits/types';

interface RewardBadgeApi {
  badgeId: number;
  name: string;
  iconUrl: string;
  description: string;
}

interface CreditPackageApi {
  paidCreditPackageId: number;
  name: string;
  creditTypeId: number;
  creditTypeName: string;
  creditAmount: number;
  durationDays: number | null;
  originalPrice: number;
  discountRate: number;
  discountedPrice: number;
  rewardBadgeId?: number | null;
  rewardBadge?: RewardBadgeApi | null;
  isActive: boolean;
  descriptions: string[];
}

const formatTransactionDateTime = (isoDate: string) => {
  const date = new Date(isoDate);
  return {
    date: new Intl.DateTimeFormat('vi-VN').format(date),
    time: new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(date),
  };
};

interface PaymentTransactionApi {
  orderId: number;
  orderCode: string;
  transactionCode: string;
  packageName: string;
  creditTypeId: number;
  creditTypeName: string;
  creditTypeDisplayName: string;
  paymentStatus: number | string;
  paymentStatusLabel: string;
  transactionAt: string;
  createdAt: string;
  paidAt: string | null;
  paymentMethod: string;
  expectedAmount: number;
  receivedAmount: number;
  creditsGranted: boolean;
  creditAmount: number;
}

type CreditType = 'posting' | 'featured';
type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled' | 'late_paid';

interface Transaction {
  id: number;
  orderCode: string;
  transactionCode: string;
  date: string;
  time: string;
  packageName: string;
  packageType: CreditType;
  creditTypeDisplayName: string;
  credits: number;
  expectedAmount: number;
  receivedAmount: number;
  paymentMethod: string;
  status: TransactionStatus;
  statusLabel: string;
  creditsGranted: boolean;
  paidAt: string | null;
}

const mapPaymentStatus = (paymentStatus: number | string, createdAt: string, paidAt: string | null): TransactionStatus => {
  const normalized = String(paymentStatus).trim().toLowerCase();

  if (normalized === '2' || normalized === 'successful' || normalized === 'success') {
    if (paidAt) {
      const createdDate = new Date(createdAt);
      const paidDate = new Date(paidAt);
      const diffMinutes = (paidDate.getTime() - createdDate.getTime()) / (1000 * 60);
      if (diffMinutes > 15) {
        return 'late_paid';
      }
    }
    return 'completed';
  }

  if (normalized === '1' || normalized === 'pending' || normalized === 'processing') return 'pending';
  if (normalized === '5' || normalized === 'cancelled' || normalized === 'canceled') return 'cancelled';

  return 'failed';
};

const toCreditType = (creditTypeName: string): CreditType =>
  creditTypeName.toLowerCase() === 'featured' ? 'featured' : 'posting';

const mapPaymentTransactions = (transactions: PaymentTransactionApi[]): Transaction[] =>
  [...transactions]
    .sort(
      (first, second) =>
        new Date(second.transactionAt).getTime() - new Date(first.transactionAt).getTime()
    )
    .map((transaction) => {
      const { date, time } = formatTransactionDateTime(transaction.transactionAt);

      return {
        id: transaction.orderId,
        orderCode: transaction.orderCode,
        transactionCode: transaction.transactionCode,
        date,
        time,
        packageName: transaction.packageName,
        packageType: toCreditType(transaction.creditTypeName),
        creditTypeDisplayName: transaction.creditTypeDisplayName,
        credits: transaction.creditAmount,
        expectedAmount: transaction.expectedAmount,
        receivedAmount: transaction.receivedAmount,
        paymentMethod: transaction.paymentMethod,
        status: mapPaymentStatus(transaction.paymentStatus, transaction.createdAt, transaction.paidAt),
        statusLabel: transaction.paymentStatusLabel,
        creditsGranted: transaction.creditsGranted,
        paidAt: transaction.paidAt,
      };
    });

const getTransactionAmount = (transaction: Transaction) =>
  transaction.status === 'completed' || transaction.status === 'late_paid'
    ? transaction.receivedAmount
    : transaction.expectedAmount;

const getTransactionStatusClass = (status: TransactionStatus) => {
  switch (status) {
    case 'completed': return 'bg-emerald-50 text-emerald-700';
    case 'late_paid': return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'pending': return 'bg-blue-50 text-blue-700';
    case 'cancelled': return 'bg-gray-100 text-gray-600 opacity-80';
    case 'failed': return 'bg-red-50 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getTransactionStatusIcon = (status: TransactionStatus) => {
  switch (status) {
    case 'completed': return <CheckCircle className="w-3.5 h-3.5 mr-1" />;
    case 'late_paid': return <Clock className="w-3.5 h-3.5 mr-1" />;
    case 'pending': return <Clock className="w-3.5 h-3.5 mr-1" />;
    case 'cancelled': return <XCircle className="w-3.5 h-3.5 mr-1" />;
    case 'failed': return <AlertCircle className="w-3.5 h-3.5 mr-1" />;
    default: return null;
  }
};

interface Package {
  id: string;
  paidCreditPackageId: number;
  title: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  credits: number;
  duration: number | null;
  badge: string;
  badgeColor: string;
  features: string[];
  cta: string;
  tier: number;
}

type PackagePurchaseState = 'available' | 'locked' | 'pending';

interface CreditTypePurchaseStatus {
  pendingOrdersByPackageId: Record<number, import('../../features/credits/types').PendingOrderInfoDto>;
}

const resolveActivePackageId = (
  batch: UserCreditBatchItemApi,
  packages: Package[],
  creditType: CreditType
): string | null => {
  if (!batch.isPaid || batch.remainingCredits <= 0) {
    return null;
  }

  const matchedByPaidId = packages.find(
    (pkg) => pkg.paidCreditPackageId === batch.packageId
  );
  if (matchedByPaidId) {
    return matchedByPaidId.id;
  }

  const normalizedName = batch.packageName.trim().toLowerCase();
  const matchedByName = packages.find(
    (pkg) => pkg.title.trim().toLowerCase() === normalizedName
  );
  if (matchedByName) {
    return matchedByName.id;
  }

  const nameMatch = batch.packageName.match(/(Cơ Bản|Tiêu Chuẩn|Nâng Cao|Khởi Động|Tăng Tốc|Bứt Phá|Spotlight|Trending|Premium)/i);
  if (nameMatch) {
    const packageId = `${creditType}-${batch.packageId}`;
    if (packages.some((pkg) => pkg.id === packageId)) {
      return packageId;
    }
  }

  return null;
};

const computeCreditTypePurchaseStatus = (
  summary: UserCreditSummaryApi | null,
  packages: Package[],
  creditType: CreditType
): CreditTypePurchaseStatus => {
  if (!summary) {
    return { pendingOrdersByPackageId: {} };
  }

  const pendingOrdersByPackageId: Record<number, import('../../features/credits/types').PendingOrderInfoDto> = {};
  if (summary.pendingOrders) {
    summary.pendingOrders.forEach((po) => {
      pendingOrdersByPackageId[po.packageId] = po;
    });
  }

  return { pendingOrdersByPackageId };
};

const getPackagePurchaseState = (
  packageIdNum: number,
  status: CreditTypePurchaseStatus
): PackagePurchaseState => {
  if (status.pendingOrdersByPackageId[packageIdNum]) {
    return 'pending';
  }
  return 'available';
};

const postingPackageMeta: Record<string, Pick<Package, 'badge' | 'badgeColor' | 'cta' | 'tier'>> = {
  'Khởi Động': {
    badge: 'Cơ bản',
    badgeColor: 'bg-blue-100 text-blue-800',
    cta: 'Mua Ngay',
    tier: 1,
  },
  'Tăng Tốc': {
    badge: 'Tiêu Chuẩn',
    badgeColor: 'bg-purple-100 text-purple-800',
    cta: 'Chọn Gói',
    tier: 2,
  },
  'Bứt Phá': {
    badge: 'Tiết Kiệm Nhất',
    badgeColor: 'bg-green-100 text-green-800',
    cta: 'Nhận Gói',
    tier: 3,
  },
};

const featuredPackageMeta: Record<string, Pick<Package, 'badge' | 'badgeColor' | 'cta' | 'tier'>> = {
  'Spotlight': {
    badge: 'Tăng Tốc Nhanh',
    badgeColor: 'bg-orange-100 text-orange-800',
    cta: 'Tăng Tốc',
    tier: 1,
  },
  'Trending': {
    badge: 'Thịnh Hành',
    badgeColor: 'bg-pink-100 text-pink-800',
    cta: 'Nâng Cấp',
    tier: 2,
  },
  'Premium': {
    badge: 'Tối Ưu Cao Cấp',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    cta: 'Mở Khóa',
    tier: 3,
  },
};

const buildFeaturedCta = (pkg: CreditPackageApi) => {
  if (pkg.rewardBadge?.name) {
    return `Mở Khóa ${pkg.rewardBadge.name}`;
  }

  return featuredPackageMeta[pkg.name]?.cta ?? 'Mở Khóa';
};

const mapPackagePricing = (pkg: CreditPackageApi) => {
  const hasDiscount = pkg.discountRate > 0;

  return {
    price: pkg.discountedPrice,
    originalPrice: hasDiscount ? pkg.originalPrice : undefined,
    discountPercent: hasDiscount ? pkg.discountRate : undefined,
  };
};

const buildPackageId = (creditTypeName: string, name: string, packageId: number) => {
  const typeSlug = creditTypeName.toLowerCase() === 'featured' ? 'featured' : 'posting';
  return `${typeSlug}-${packageId}`;
};

const mapCreditPackages = (packages: CreditPackageApi[]): { posting: Package[]; featured: Package[] } => {
  const sortedPackages = [...packages].sort((first, second) => {
    if (first.creditTypeName === second.creditTypeName) {
      return first.creditAmount - second.creditAmount;
    }

    return first.creditTypeName.toLowerCase() === 'posting' ? -1 : 1;
  });

  const posting = sortedPackages
    .filter((pkg) => pkg.creditTypeName.toLowerCase() === 'posting')
    .map<Package>((pkg) => ({
      id: buildPackageId(pkg.creditTypeName, pkg.name, pkg.paidCreditPackageId),
      paidCreditPackageId: pkg.paidCreditPackageId,
      title: pkg.name,
      ...mapPackagePricing(pkg),
      credits: pkg.creditAmount,
      duration: pkg.durationDays,
      badge: postingPackageMeta[pkg.name]?.badge ?? 'Gói',
      badgeColor: postingPackageMeta[pkg.name]?.badgeColor ?? 'bg-gray-100 text-gray-800',
      features: pkg.descriptions ?? [],
      cta: postingPackageMeta[pkg.name]?.cta ?? 'Mở Khóa',
      tier: postingPackageMeta[pkg.name]?.tier ?? 1,
    }));

  const featured = sortedPackages
    .filter((pkg) => pkg.creditTypeName.toLowerCase() === 'featured')
    .map<Package>((pkg) => ({
      id: buildPackageId(pkg.creditTypeName, pkg.name, pkg.paidCreditPackageId),
      paidCreditPackageId: pkg.paidCreditPackageId,
      title: pkg.name,
      ...mapPackagePricing(pkg),
      credits: pkg.creditAmount,
      duration: pkg.durationDays,
      badge: featuredPackageMeta[pkg.name]?.badge ?? 'Gói',
      badgeColor: featuredPackageMeta[pkg.name]?.badgeColor ?? 'bg-gray-100 text-gray-800',
      features: pkg.descriptions ?? [],
      cta: buildFeaturedCta(pkg),
      tier: featuredPackageMeta[pkg.name]?.tier ?? 1,
    }));

  return { posting, featured };
};

const PendingPurchaseButton = ({ expiredAt, checkoutUrl, orderCode, variant, onCancel }: { expiredAt?: string | null, checkoutUrl?: string | null, orderCode?: string, variant: CreditType, onCancel: (orderCode: string) => void }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showContinueConfirm, setShowContinueConfirm] = useState(false);

  let formattedTime = '';
  if (expiredAt) {
    const utcExpiredAt = expiredAt.endsWith('Z') ? expiredAt : `${expiredAt}Z`;
    const d = new Date(utcExpiredAt);
    formattedTime = d.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  const buyButtonClass =
    variant === 'posting'
      ? 'flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all'
      : 'flex-1 bg-gradient-to-r from-[#C4603A] to-[#d4724a] text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all';

  const handleCancel = async () => {
    if (!orderCode) return;
    setIsCancelling(true);
    await onCancel(orderCode);
    setIsCancelling(false);
    setShowCancelConfirm(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex w-full space-x-3">
        <button
          type="button"
          onClick={() => {
            if (checkoutUrl) setShowContinueConfirm(true);
          }}
          className={buyButtonClass}
        >
          Tiếp tục thanh toán
        </button>
        <button
          type="button"
          onClick={() => setShowCancelConfirm(true)}
          disabled={isCancelling}
          className="px-6 py-4 bg-white border-2 border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center whitespace-nowrap hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow"
        >
          {isCancelling ? 'Đang hủy...' : 'Hủy đơn'}
        </button>
      </div>
      {formattedTime && (
        <div className="mt-3 text-red-500 text-sm font-medium bg-red-50 px-3 py-1 rounded-full border border-red-100">
          Hết hạn vào {formattedTime}
        </div>
      )}

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title="Hủy đơn hàng chờ"
        message="Bạn có chắc chắn muốn hủy đơn hàng đang chờ thanh toán này không? Đơn hàng sẽ bị vô hiệu hóa ngay lập tức."
        confirmText="Đồng ý hủy"
        cancelText="Quay lại"
        type="danger"
        isLoading={isCancelling}
      />

      <ConfirmModal
        isOpen={showContinueConfirm}
        onClose={() => setShowContinueConfirm(false)}
        onConfirm={() => {
          if (checkoutUrl) window.location.href = checkoutUrl;
        }}
        title="Tiếp tục thanh toán"
        message="Hệ thống sẽ chuyển hướng bạn đến trang thanh toán của PayOS. Đơn hàng sẽ được duyệt tự động sau khi bạn chuyển khoản thành công."
        confirmText="Chuyển đến thanh toán"
        cancelText="Đóng"
        type="info"
      />
    </div>
  );
};

const renderPackagePurchaseButton = (
  purchaseState: PackagePurchaseState,
  onBuy: () => void,
  variant: CreditType,
  isLoading: boolean,
  isAnyLoading: boolean,
  status?: CreditTypePurchaseStatus,
  packageIdNum?: number,
  onCancelOrder?: (orderCode: string) => void
) => {

  if (purchaseState === 'pending' && status && packageIdNum) {
    const pendingOrderInfo = status.pendingOrdersByPackageId[packageIdNum];
    if (pendingOrderInfo) {
      return (
        <PendingPurchaseButton
          expiredAt={pendingOrderInfo.expiredAt}
          checkoutUrl={pendingOrderInfo.checkoutUrl}
          orderCode={pendingOrderInfo.orderCode}
          variant={variant}
          onCancel={(orderCode) => onCancelOrder?.(orderCode)}
        />
      );
    }
  }

  if (purchaseState === 'locked' || isAnyLoading) {
    return (
      <button
        disabled
        className={`w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center transition-all ${variant === 'posting'
          ? 'bg-blue-300 cursor-not-allowed'
          : 'bg-[#C4603A]/50 cursor-not-allowed'
          }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center space-x-2 text-white/80">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Đang Xử Lý...</span>
          </span>
        ) : (
          'Mua Ngay'
        )}
      </button>
    );
  }

  const buyButtonClass =
    variant === 'posting'
      ? 'w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all'
      : 'w-full bg-gradient-to-r from-[#C4603A] to-[#d4724a] text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all';

  return (
    <button type="button" onClick={onBuy} className={buyButtonClass}>
      Mua Ngay
    </button>
  );
};

export default function PlansPage() {
  const { initiateCheckout, isCheckoutLoading, loadingPackageId, checkoutError, cancelOrder } = useCheckout();

  const handleCancelOrder = async (orderCode: string) => {
    const success = await cancelOrder(orderCode);
    if (success) {
      void loadCreditBatches();
    }
  };

  const [selectedPackageForBuy, setSelectedPackageForBuy] = useState<Package | null>(null);
  const [activeTab, setActiveTab] = useState<'packages' | 'history'>('packages');
  const [creditPackages, setCreditPackages] = useState<CreditPackageApi[]>([]);
  const [userCreditBatches, setUserCreditBatches] = useState<{ posting: CreditBatch[]; featured: CreditBatch[] }>({
    posting: [],
    featured: [],
  });
  const [creditSummaries, setCreditSummaries] = useState<{
    posting: UserCreditSummaryApi | null;
    featured: UserCreditSummaryApi | null;
  }>({
    posting: null,
    featured: null,
  });
  const [isCreditLoading, setIsCreditLoading] = useState(true);
  const [isPackageLoading, setIsPackageLoading] = useState(true);
  const [creditError, setCreditError] = useState<string | null>(null);
  const [packageError, setPackageError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadCreditBatches = useCallback(async () => {
    setIsCreditLoading(true);
    setCreditError(null);

    const [postingResult, featuredResult] = await Promise.allSettled([
      fetchPostingCreditSummary(),
      fetchFeaturedCreditSummary(),
    ]);

    const postingSummary =
      postingResult.status === 'fulfilled' ? postingResult.value.data.data ?? null : null;
    const featuredSummary =
      featuredResult.status === 'fulfilled' ? featuredResult.value.data.data ?? null : null;

    setCreditSummaries({
      posting: postingSummary,
      featured: featuredSummary,
    });
    setUserCreditBatches({
      posting: postingSummary ? mapCreditBatches(postingSummary.batches) : [],
      featured: featuredSummary ? mapCreditBatches(featuredSummary.batches) : [],
    });

    if (postingResult.status === 'rejected' || featuredResult.status === 'rejected') {
      setCreditError('Không tải được một số credit hiện tại.');
    }

    setIsCreditLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab !== 'packages') {
      return;
    }

    void loadCreditBatches();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void loadCreditBatches();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void loadCreditBatches();
      }
    };

    const handleFocus = () => {
      void loadCreditBatches();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeTab, loadCreditBatches]);

  useEffect(() => {
    if (activeTab !== 'history') {
      return;
    }

    let isMounted = true;

    const loadTransactions = async () => {
      setIsTransactionsLoading(true);
      setTransactionsError(null);
      setCurrentPage(1);

      try {
        const response = await authClient.get<ApiResponse<PaymentTransactionApi[]>>(
          '/payment/transactions'
        );

        if (!isMounted) {
          return;
        }

        setTransactions(mapPaymentTransactions(response.data.data ?? []));
      } catch {
        if (!isMounted) {
          return;
        }

        setTransactions([]);
        setTransactionsError('Không tải được lịch sử giao dịch.');
      } finally {
        if (isMounted) {
          setIsTransactionsLoading(false);
        }
      }
    };

    void loadTransactions();

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  useEffect(() => {
    let isMounted = true;

    const loadCreditPackages = async () => {
      setIsPackageLoading(true);
      setPackageError(null);

      try {
        const response = await authClient.get<ApiResponse<CreditPackageApi[]>>(
          '/CreditPackages/active',
          { skipAuthRefresh: true }
        );

        if (!isMounted) {
          return;
        }

        setCreditPackages(response.data.data ?? []);
      } catch {
        if (!isMounted) {
          return;
        }

        setCreditPackages([]);
        setPackageError('Không tải được danh sách gói credits hiện tại.');
      } finally {
        if (isMounted) {
          setIsPackageLoading(false);
        }
      }
    };

    void loadCreditPackages();

    return () => {
      isMounted = false;
    };
  }, []);

  const { posting: postingPackages, featured: featuredPackages } = mapCreditPackages(creditPackages);

  const postingPurchaseStatus = useMemo(
    () => computeCreditTypePurchaseStatus(creditSummaries.posting, postingPackages, 'posting'),
    [creditSummaries.posting, postingPackages]
  );

  const featuredPurchaseStatus = useMemo(
    () => computeCreditTypePurchaseStatus(creditSummaries.featured, featuredPackages, 'featured'),
    [creditSummaries.featured, featuredPackages]
  );

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackageForBuy(pkg);
  };

  const handleConfirmBuy = async () => {
    if (selectedPackageForBuy) {
      await initiateCheckout(selectedPackageForBuy.paidCreditPackageId);
      setSelectedPackageForBuy(null);
    }
  };

  const successfulTransactions = transactions.filter((tx) => tx.status === 'completed');
  const totalSpent = successfulTransactions.reduce(
    (sum, tx) => sum + tx.receivedAmount,
    0
  );
  const totalCreditsPurchased = successfulTransactions.reduce(
    (sum, tx) => sum + (tx.creditsGranted ? tx.credits : 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f4f6f5]">

      {/* ── Premium Dark Hero Header ── */}
      <div 
        className="relative bg-[#0b1a12] overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.12) 2px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* Ambient glows and Stars */}
        <div className="absolute inset-0 pointer-events-none">
          <Sparkles className="absolute top-10 left-[10%] w-5 h-5 text-emerald-400 opacity-60 animate-pulse" />
          <Sparkles className="absolute top-24 left-[20%] w-3 h-3 text-emerald-200 opacity-40 animate-ping delay-300" />
          <Sparkles className="absolute top-16 right-[15%] w-6 h-6 text-emerald-300 opacity-50 animate-pulse delay-150" />
          <Sparkles className="absolute top-32 right-[8%] w-4 h-4 text-emerald-400 opacity-70 animate-bounce delay-700" />
          <Sparkles className="absolute top-48 left-[5%] w-4 h-4 text-emerald-500 opacity-30 animate-pulse delay-500" />
          
          <div className="absolute -top-24 left-1/3 w-[500px] h-[500px] bg-[#2D5A3D]/25 rounded-full blur-[120px]" />
          <div className="absolute top-8 right-1/4 w-64 h-64 bg-[#C4603A]/12 rounded-full blur-[80px]" />
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(45,90,61,0.4), transparent)' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-[#2D5A3D]/20 border border-[#2D5A3D]/30 text-emerald-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase">
              <Sparkles className="w-3 h-3" />
              Gói Credits REVORA
            </div>
            <h1 className="text-4xl md:text-[52px] font-black text-white tracking-tight leading-tight mb-4">
              Nâng Cấp Sức Mạnh{' '}
              <span
                className="italic"
                style={{ background: 'linear-gradient(90deg, #4ade80, #86efac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Đăng Tin
              </span>
            </h1>
            <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
              Chọn gói phù hợp để tăng khả năng hiển thị, đăng sản phẩm và nổi bật trong cộng đồng thời trang REVORA
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Content (lifted up over hero bottom) ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16 z-10">

        {/* Tabs */}
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex bg-white rounded-2xl shadow-lg shadow-black/8 p-1.5 border border-gray-100/80">
            <button
              onClick={() => setActiveTab('packages')}
              className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'packages'
                  ? 'bg-[#2D5A3D] text-white shadow-md shadow-[#2D5A3D]/30'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Gói Credits
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-[#2D5A3D] text-white shadow-md shadow-[#2D5A3D]/30'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <History className="w-4 h-4" />
              Lịch Sử Giao Dịch
            </button>
          </div>
        </div>

        {/* ── Tab: Packages ── */}
        {activeTab === 'packages' && (
          <>
            {/* Current Credits Dashboard */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-12">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-1 h-5 rounded-full bg-[#2D5A3D]" />
                <h2 className="text-base font-bold text-gray-900">Credits Hiện Tại</h2>
                {creditError && <p className="text-xs text-amber-600 ml-1">{creditError}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CreditDisplay type="posting" batches={isCreditLoading ? [] : userCreditBatches.posting} />
                <CreditDisplay type="featured" batches={isCreditLoading ? [] : userCreditBatches.featured} />
              </div>
            </div>

            {/* ── Posting Packages ── */}
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                  <Image className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Gói Credits Đăng Tin</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Đăng sản phẩm lên cộng đồng REVORA</p>
                </div>
              </div>

              {packageError && <p className="mb-4 text-sm text-amber-600">{packageError}</p>}

              {creditSummaries.posting?.purchaseBlockReason && (
                <div className="mb-7 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-800">Thông báo</h4>
                    <p className="text-sm text-amber-700 mt-0.5">{creditSummaries.posting.purchaseBlockReason}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isPackageLoading ? (
                  <div className="md:col-span-3 bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400 text-sm">
                    Đang tải danh sách gói credits...
                  </div>
                ) : postingPackages.length > 0 ? postingPackages.map((pkg) => {
                  const purchaseState = getPackagePurchaseState(pkg.paidCreditPackageId, postingPurchaseStatus);
                  const isHighlighted = pkg.tier === 2;
                  const isDark = pkg.tier === 3;

                  return (
                    <div
                      key={pkg.id}
                      className={`relative rounded-2xl transition-all duration-300 p-[2px] ${
                        purchaseState === 'available' ? 'hover:-translate-y-1' : 'opacity-90'
                      } ${
                        isDark
                          ? 'bg-gradient-to-br from-[#4ade80] via-[#2D5A3D] to-[#022c22] shadow-2xl shadow-[#2D5A3D]/40'
                          : isHighlighted
                          ? 'bg-gradient-to-br from-blue-300 via-blue-400 to-blue-600 shadow-xl shadow-blue-200'
                          : 'bg-transparent border border-blue-100 shadow-sm'
                      }`}
                    >
                      <div
                        className="relative h-full rounded-[14px]"
                        style={isDark ? {
                          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.08) 1.5px, transparent 0), linear-gradient(145deg, #0d2118 0%, #18372a 100%)',
                          backgroundSize: '20px 20px, auto'
                        } : isHighlighted ? {
                          background: 'linear-gradient(145deg, #dbeafe 0%, #eff6ff 100%)',
                        } : {
                          background: 'linear-gradient(145deg, #f0f7ff 0%, #e8f3ff 100%)',
                        }}
                      >
                        {/* Sparkles for Premium */}
                        {isDark && (
                          <>
                            <Sparkles className="absolute top-4 left-4 w-6 h-6 text-emerald-300 opacity-90 animate-pulse z-10" />
                            <Sparkles className="absolute bottom-6 right-6 w-8 h-8 text-emerald-400 opacity-70 animate-pulse delay-150 z-10" />
                            <Sparkles className="absolute top-1/3 -left-3 w-5 h-5 text-emerald-200 opacity-80 animate-bounce delay-300 z-10" />
                            <Sparkles className="absolute top-6 right-1/4 w-4 h-4 text-emerald-300 opacity-60 animate-ping delay-700 z-10" />
                          </>
                        )}

                        {/* "Popular" ribbon for tier 2 */}
                        {isHighlighted && (
                          <div className="absolute -top-3.5 inset-x-0 flex justify-center z-10">
                            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-md uppercase tracking-widest whitespace-nowrap">
                              Phổ Biến
                            </span>
                          </div>
                        )}

                        <div className="p-7">
                        {/* Badge row */}
                        <div className="flex items-start justify-between mb-5">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                            isDark
                              ? 'bg-white/15 text-emerald-300'
                              : pkg.badgeColor
                          }`}>
                            {pkg.badge}
                          </span>
                          {pkg.discountPercent && (
                            <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                              -{pkg.discountPercent}%
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {pkg.title}
                        </h3>

                        {/* Price */}
                        <div className="mb-5">
                          <span className={`text-[32px] font-black leading-none ${isDark ? 'text-white' : 'text-blue-600'}`}>
                            {pkg.price.toLocaleString('vi-VN')}đ
                          </span>
                          {pkg.originalPrice && (
                            <div className="mt-1">
                              <span className={`text-sm line-through ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                                {pkg.originalPrice.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Credits highlight */}
                        <div className={`rounded-xl p-4 mb-5 text-center ${
                          isDark ? 'bg-white/10 border border-white/15' : 'bg-blue-50 border border-blue-100'
                        }`}>
                          <div className={`text-4xl font-black tabular-nums ${isDark ? 'text-emerald-300' : 'text-blue-600'}`}>
                            {pkg.credits}
                          </div>
                          <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-white/55' : 'text-gray-500'}`}>
                            Credits Đăng Tin
                          </div>
                        </div>

                        {/* Features */}
                        <ul className="space-y-2.5 mb-6">
                          {pkg.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2.5">
                              <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 mt-px ${
                                isDark ? 'bg-emerald-400/20' : 'bg-green-100'
                              }`}>
                                <Check className={`w-2.5 h-2.5 ${isDark ? 'text-emerald-300' : 'text-green-600'}`} />
                              </div>
                              <span className={`text-sm leading-snug ${isDark ? 'text-white/75' : 'text-gray-600'}`}>
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {renderPackagePurchaseButton(
                          purchaseState,
                          () => handleSelectPackage(pkg),
                          'posting',
                          loadingPackageId === pkg.paidCreditPackageId,
                          isCheckoutLoading,
                          postingPurchaseStatus,
                          pkg.paidCreditPackageId,
                          handleCancelOrder
                        )}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="md:col-span-3 bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400 text-sm">
                    Chưa có gói đăng tin nào khả dụng.
                  </div>
                )}
              </div>
            </div>

            {/* ── Featured Packages ── */}
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-100">
                  <Sparkles className="w-5 h-5 text-[#C4603A]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Gói Credits Nổi Bật</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Tăng tốc độ hiển thị và vượt qua đối thủ</p>
                </div>
              </div>

              {creditSummaries.featured?.purchaseBlockReason && (
                <div className="mb-7 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-800">Thông báo</h4>
                    <p className="text-sm text-amber-700 mt-0.5">{creditSummaries.featured.purchaseBlockReason}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isPackageLoading ? (
                  <div className="md:col-span-3 bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400 text-sm">
                    Đang tải danh sách gói credits...
                  </div>
                ) : featuredPackages.length > 0 ? featuredPackages.map((pkg) => {
                  const purchaseState = getPackagePurchaseState(pkg.paidCreditPackageId, featuredPurchaseStatus);
                  const isRecommended = pkg.tier === 2;
                  const isPremium = pkg.tier === 3;

                  return (
                    <div
                      key={pkg.id}
                      className={`relative rounded-2xl transition-all duration-300 p-[2px] ${
                        purchaseState === 'available' ? 'hover:-translate-y-1' : 'opacity-90'
                      } ${
                        isPremium
                          ? 'bg-gradient-to-br from-[#fbd38d] via-[#C4603A] to-[#7b341e] shadow-2xl shadow-[#C4603A]/40'
                          : isRecommended
                          ? 'bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 shadow-xl shadow-orange-200'
                          : 'bg-transparent border border-orange-100 shadow-sm'
                      }`}
                    >
                      <div
                        className="relative h-full rounded-[14px]"
                        style={isPremium ? {
                          backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.08) 1.5px, transparent 0), linear-gradient(145deg, #1f0d08 0%, #3d1f12 100%)',
                          backgroundSize: '20px 20px, auto'
                        } : isRecommended ? {
                          background: 'linear-gradient(145deg, #ffedd5 0%, #fff7ed 100%)',
                        } : {
                          background: 'linear-gradient(145deg, #fff7f0 0%, #fff0e6 100%)',
                        }}
                      >
                        {/* Sparkles for Premium */}
                        {isPremium && (
                          <>
                            <Sparkles className="absolute top-4 right-4 w-6 h-6 text-yellow-300 opacity-90 animate-pulse z-10" />
                            <Sparkles className="absolute bottom-6 left-6 w-8 h-8 text-yellow-400 opacity-70 animate-pulse delay-150 z-10" />
                            <Sparkles className="absolute top-1/3 -right-3 w-5 h-5 text-yellow-200 opacity-80 animate-bounce delay-300 z-10" />
                            <Sparkles className="absolute top-6 left-1/4 w-4 h-4 text-orange-300 opacity-60 animate-ping delay-700 z-10" />
                          </>
                        )}

                        {/* "Recommended" ribbon for tier 2 */}
                        {isRecommended && (
                          <div className="absolute -top-3.5 inset-x-0 flex justify-center z-10">
                            <span className="bg-gradient-to-r from-[#C4603A] to-[#d4724a] text-white text-[10px] font-black px-4 py-1 rounded-full shadow-md uppercase tracking-widest whitespace-nowrap">
                              Được Đề Xuất
                            </span>
                          </div>
                        )}

                        <div className="p-7">
                        {/* Badge row */}
                        <div className="flex items-start justify-between mb-5">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                            isPremium
                              ? 'bg-white/15 text-orange-300'
                              : pkg.badgeColor
                          }`}>
                            {pkg.badge}
                          </span>
                          {pkg.discountPercent && (
                            <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                              -{pkg.discountPercent}%
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className={`text-xl font-bold mb-3 ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                          {pkg.title}
                        </h3>

                        {/* Price */}
                        <div className="mb-5">
                          <span className={`text-[32px] font-black leading-none ${isPremium ? 'text-white' : 'text-[#C4603A]'}`}>
                            {pkg.price.toLocaleString('vi-VN')}đ
                          </span>
                          {pkg.originalPrice && (
                            <div className="mt-1">
                              <span className={`text-sm line-through ${isPremium ? 'text-white/40' : 'text-gray-400'}`}>
                                {pkg.originalPrice.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Credits highlight */}
                        <div className={`rounded-xl p-4 mb-5 text-center ${
                          isPremium ? 'bg-white/10 border border-white/15' : 'bg-orange-50 border border-orange-100'
                        }`}>
                          <div className={`text-4xl font-black tabular-nums ${isPremium ? 'text-orange-300' : 'text-[#C4603A]'}`}>
                            {pkg.credits}
                          </div>
                          <div className={`text-xs font-medium mt-0.5 ${isPremium ? 'text-white/55' : 'text-gray-500'}`}>
                            Credits Nổi Bật
                          </div>
                        </div>

                        {/* Features */}
                        <ul className="space-y-2.5 mb-6">
                          {pkg.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2.5">
                              <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 mt-px ${
                                isPremium ? 'bg-orange-400/20' : 'bg-orange-100'
                              }`}>
                                <Check className={`w-2.5 h-2.5 ${isPremium ? 'text-orange-300' : 'text-[#C4603A]'}`} />
                              </div>
                              <span className={`text-sm leading-snug ${isPremium ? 'text-white/75' : 'text-gray-600'}`}>
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {renderPackagePurchaseButton(
                          purchaseState,
                          () => handleSelectPackage(pkg),
                          'featured',
                          loadingPackageId === pkg.paidCreditPackageId,
                          isCheckoutLoading,
                          featuredPurchaseStatus,
                          pkg.paidCreditPackageId,
                          handleCancelOrder
                        )}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="md:col-span-3 bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400 text-sm">
                    Chưa có gói nổi bật nào khả dụng.
                  </div>
                )}
              </div>
            </div>

            {/* ── Payment Guide CTA ── */}
            <div
              className="relative rounded-2xl overflow-hidden p-8"
              style={{ background: 'linear-gradient(130deg, #0b1a12 0%, #122b1e 60%, #1a2e1a 100%)' }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#2D5A3D]/20 rounded-full blur-[80px] pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">Hỗ Trợ</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1.5">Câu Hỏi Thường Gặp &amp; Hướng Dẫn</h2>
                  <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                    Tìm hiểu về thanh toán, chính sách hoàn tiền và cách sử dụng credits sau khi mua.
                  </p>
                </div>
                <button
                  onClick={() => window.location.href = '/payment-guide'}
                  className="flex-shrink-0 bg-white text-[#2D5A3D] px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 active:scale-[0.98] transition-all shadow-lg whitespace-nowrap"
                >
                  Xem Hướng Dẫn
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Tab: Transaction History ── */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-7 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-[#2D5A3D]/10 rounded-xl">
                <History className="w-5 h-5 text-[#2D5A3D]" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-900">Lịch Sử Giao Dịch</h2>
                <p className="text-xs text-gray-500">Danh sách các giao dịch mua gói credits</p>
              </div>
              {transactionsError && (
                <p className="text-xs text-amber-600">{transactionsError}</p>
              )}
            </div>

            {/* Transaction rows */}
            <div className="divide-y divide-gray-50">
              {isTransactionsLoading ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                  Đang tải lịch sử giao dịch...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <History className="w-7 h-7 text-gray-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Chưa có giao dịch nào</h3>
                  <p className="text-gray-400 text-xs">Lịch sử mua gói của bạn sẽ hiển thị tại đây</p>
                </div>
              ) : (
                (() => {
                  const ITEMS_PER_PAGE = 5;
                  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
                  const currentTransactions = transactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

                  return (
                    <>
                      {currentTransactions.map((tx) => (
                        <div key={tx.id} className="px-7 py-4 hover:bg-gray-50/70 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            {/* Left */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          tx.packageType === 'posting' ? 'bg-blue-50' : 'bg-orange-50'
                        }`}>
                          <TrendingUp className={`w-5 h-5 ${
                            tx.packageType === 'posting' ? 'text-blue-500' : 'text-[#C4603A]'
                          }`} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900">{tx.packageName}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              tx.packageType === 'posting' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-[#C4603A]'
                            }`}>
                              {tx.creditTypeDisplayName}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center ${getTransactionStatusClass(tx.status)}`}>
                              {getTransactionStatusIcon(tx.status)}
                              {tx.status === 'late_paid' ? 'Thanh toán trễ' : tx.statusLabel}
                            </span>
                            {tx.creditsGranted && tx.status !== 'late_paid' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700">
                                Đã cộng credits
                              </span>
                            )}
                          </div>

                          {tx.status === 'late_paid' && (
                            <p className="text-[11px] text-amber-700/80 mb-1.5 leading-snug">
                              Bạn đã chuyển tiền sau khi mã QR hết hạn. Hệ thống đã linh động ghi nhận và cộng credits thành công.
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {tx.date} {tx.time}
                            </span>
                            <span>·</span>
                            <span>Mã đơn: {tx.orderCode}</span>
                            <span>·</span>
                            <span>Mã GD: {tx.transactionCode}</span>
                            <span>·</span>
                            <span>{tx.paymentMethod}</span>
                          </div>
                          {tx.paidAt && (
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Thanh toán lúc: {formatTransactionDateTime(tx.paidAt).date} {formatTransactionDateTime(tx.paidAt).time}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end mb-0.5">
                          <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-sm font-bold text-red-600">
                            -{getTransactionAmount(tx).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        {tx.status === 'completed' && tx.expectedAmount !== tx.receivedAmount && (
                          <p className="text-[10px] text-gray-400 mb-0.5">
                            Dự kiến: {tx.expectedAmount.toLocaleString('vi-VN')}đ
                          </p>
                        )}
                        <div className={`text-[11px] font-bold ${tx.packageType === 'posting' ? 'text-blue-600' : 'text-[#C4603A]'}`}>
                          +{tx.credits} credits
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="px-7 py-4 flex items-center justify-between border-t border-gray-50">
                          <span className="text-xs text-gray-500">
                            Trang {currentPage} / {totalPages}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()
              )}
            </div>

            {/* Summary stats */}
            {!isTransactionsLoading && transactions.length > 0 && (
              <div className="px-7 py-5 border-t border-gray-100 bg-gray-50/60">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-black text-gray-900 tabular-nums">{transactions.length}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">Tổng giao dịch</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-emerald-700 tabular-nums">{successfulTransactions.length}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">Thành công</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-red-600 tabular-nums">{totalSpent.toLocaleString('vi-VN')}đ</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">Tổng chi tiêu</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-[#2D5A3D] tabular-nums">{totalCreditsPurchased}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">Credits đã cộng</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Checkout Loading Overlay */}
      {isCheckoutLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/35 backdrop-blur-md transition-opacity duration-300" />
          <div className="relative bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-gray-100">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-[#2D5A3D] rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#2D5A3D] rounded-full animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Đang xử lý</h3>
            <p className="text-sm text-gray-500 text-center">
              Đang kết nối an toàn đến cổng thanh toán PayOS...
            </p>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!selectedPackageForBuy}
        onClose={() => setSelectedPackageForBuy(null)}
        onConfirm={handleConfirmBuy}
        title="Xác nhận mua gói"
        message={`Bạn đang chuẩn bị chuyển hướng sang PayOS để thanh toán cho ${selectedPackageForBuy?.title}. Vui lòng xác nhận để tiếp tục.`}
        confirmText="Xác nhận mua"
        cancelText="Hủy"
        type="info"
        isLoading={isCheckoutLoading}
      />
    </div>
  );
}
