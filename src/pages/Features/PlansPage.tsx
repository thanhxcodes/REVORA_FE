import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, Image, Check, X, QrCode, History, TrendingUp, TrendingDown, Calendar, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import CreditDisplay from '../../components/common/CreditDisplay';
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
  durationDays: number;
  originalPrice: number;
  discountRate: number;
  discountedPrice: number;
  rewardBadgeId?: number | null;
  rewardBadge?: RewardBadgeApi | null;
  isActive: boolean;
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
  duration: number;
  badge: string;
  badgeColor: string;
  features: string[];
  cta: string;
  tier: number;
}

type PackagePurchaseState = 'in_use' | 'available' | 'locked' | 'pending';

interface CreditTypePurchaseStatus {
  isTypeLocked: boolean;
  activePackageId: string | null;
  pendingOrderCheckoutUrl?: string | null;
  pendingOrderExpiredAt?: string | null;
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

  const durationMatch = batch.packageName.match(/(\d+)\s*ngày/i);
  if (durationMatch) {
    const packageId = `${creditType}-${durationMatch[1]}`;
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
    return { isTypeLocked: false, activePackageId: null };
  }

  // Không còn paid credits và không có đơn chờ → mở khóa toàn bộ gói paid
  if (!summary.hasActivePaidCredits && !summary.hasPendingPaidOrder) {
    return { isTypeLocked: false, activePackageId: null };
  }

  if (summary.hasPendingPaidOrder && summary.pendingPaidPackageId != null) {
    const pendingPackage = packages.find(
      (pkg) => pkg.paidCreditPackageId === summary.pendingPaidPackageId
    );

    return {
      isTypeLocked: true,
      activePackageId: pendingPackage?.id ?? null,
      pendingOrderCheckoutUrl: summary.pendingOrderCheckoutUrl,
      pendingOrderExpiredAt: summary.pendingOrderExpiredAt,
    };
  }

  const activePaidBatch = summary.batches.find(
    (batch) => batch.isPaid && batch.remainingCredits > 0
  );

  if (activePaidBatch) {
    return {
      isTypeLocked: true,
      activePackageId: resolveActivePackageId(activePaidBatch, packages, creditType),
    };
  }

  // Backend báo còn paid nhưng không có batch khớp — không khóa nhầm UI
  return { isTypeLocked: false, activePackageId: null };
};

const getPackagePurchaseState = (
  packageId: string,
  status: CreditTypePurchaseStatus
): PackagePurchaseState => {
  if (!status.isTypeLocked) {
    return 'available';
  }

  if (status.activePackageId === packageId) {
    return status.pendingOrderCheckoutUrl ? 'pending' : 'in_use';
  }

  return 'locked';
};



const postingPackageMeta: Record<number, Pick<Package, 'badge' | 'badgeColor' | 'cta' | 'tier'>> = {
  1: {
    badge: 'Cơ bản',
    badgeColor: 'bg-blue-100 text-blue-800',
    cta: 'Mua Ngay',
    tier: 1,
  },
  7: {
    badge: 'Phổ Biến',
    badgeColor: 'bg-purple-100 text-purple-800',
    cta: 'Chọn Gói',
    tier: 2,
  },
  30: {
    badge: 'Tiết Kiệm Nhất',
    badgeColor: 'bg-green-100 text-green-800',
    cta: 'Nhận Gói',
    tier: 3,
  },
};

const featuredPackageMeta: Record<number, Pick<Package, 'badge' | 'badgeColor' | 'cta' | 'tier'>> = {
  1: {
    badge: 'Tăng Tốc Nhanh',
    badgeColor: 'bg-orange-100 text-orange-800',
    cta: 'Tăng Tốc',
    tier: 1,
  },
  7: {
    badge: 'Được Đề Xuất',
    badgeColor: 'bg-pink-100 text-pink-800',
    cta: 'Nâng Cấp',
    tier: 2,
  },
  30: {
    badge: 'Tối Ưu Cao Cấp',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    cta: 'Mở Khóa',
    tier: 3,
  },
};

const postingFeatures = (credits: number, durationDays: number, discountRate: number): string[] => {
  const savingsLine =
    discountRate > 0 ? `Tiết kiệm ${discountRate}% so với gói ngày` : null;

  const featuresByDuration: Record<number, string[]> = {
    1: [
      `${credits} credits đăng tin cơ bản`,
      'Hiển thị sản phẩm trong 30 ngày',
      'Liên hệ người mua qua chat/Zalo',
      'Khả năng hiển thị tiêu chuẩn',
    ],
    7: [
      `${credits} credits đăng tin cơ bản`,
      ...(savingsLine ? [savingsLine] : []),
      'Tất cả tính năng Gói 1 Ngày',
    ],
    30: [
      `${credits} credits đăng tin cơ bản`,
      ...(savingsLine ? [savingsLine] : []),
      'Tất cả tính năng Gói 7 Ngày',
    ],
  };

  return featuresByDuration[durationDays] ?? [`${credits} credits đăng tin cơ bản`];
};

const featuredFeatures = (
  credits: number,
  durationDays: number,
  discountRate: number,
  rewardBadge?: RewardBadgeApi | null
): string[] => {
  const savingsLine =
    discountRate > 0 ? `Tiết kiệm ${discountRate}% so với gói ngày` : null;
  const rewardBadgeLine = rewardBadge?.name
    ? `Badge cao cấp "${rewardBadge.name}"`
    : null;

  const featuresByDuration: Record<number, string[]> = {
    1: [
      `${credits} credits nổi bật`,
      'Mở khóa upload video Shorts',
      'Mở khóa hiển thị trên Banner',
      'Hiển thị sản phẩm trong 60 ngày',
      'Viền sản phẩm nổi bật',
      'Xuất hiện trên BXH Tuần',
    ],
    7: [
      `${credits} credits nổi bật`,
      ...(savingsLine ? [savingsLine] : []),
      'Tất cả tính năng Gói 1 Ngày',
    ],
    30: [
      `${credits} credits nổi bật`,
      ...(savingsLine ? [savingsLine] : []),
      ...(rewardBadgeLine ? [rewardBadgeLine] : []),
      'Tất cả tính năng Gói 1 Ngày',
    ],
  };

  return featuresByDuration[durationDays] ?? [`${credits} credits nổi bật`];
};

const buildFeaturedCta = (pkg: CreditPackageApi, durationDays: number) => {
  if (pkg.rewardBadge?.name) {
    return `Mở Khóa ${pkg.rewardBadge.name}`;
  }

  return featuredPackageMeta[durationDays]?.cta ?? 'Mở Khóa';
};

const mapPackagePricing = (pkg: CreditPackageApi) => {
  const hasDiscount = pkg.discountRate > 0;

  return {
    price: pkg.discountedPrice,
    originalPrice: hasDiscount ? pkg.originalPrice : undefined,
    discountPercent: hasDiscount ? pkg.discountRate : undefined,
  };
};

const buildPackageId = (creditTypeName: string, durationDays: number) => {
  const typeSlug = creditTypeName.toLowerCase() === 'featured' ? 'featured' : 'posting';
  return `${typeSlug}-${durationDays}`;
};

const mapCreditPackages = (packages: CreditPackageApi[]): { posting: Package[]; featured: Package[] } => {
  const sortedPackages = [...packages].sort((first, second) => {
    if (first.creditTypeName === second.creditTypeName) {
      return first.durationDays - second.durationDays;
    }

    return first.creditTypeName.toLowerCase() === 'posting' ? -1 : 1;
  });

  const posting = sortedPackages
    .filter((pkg) => pkg.creditTypeName.toLowerCase() === 'posting')
    .map<Package>((pkg) => ({
      id: buildPackageId(pkg.creditTypeName, pkg.durationDays),
      paidCreditPackageId: pkg.paidCreditPackageId,
      title: pkg.name,
      ...mapPackagePricing(pkg),
      credits: pkg.creditAmount,
      duration: pkg.durationDays,
      badge: postingPackageMeta[pkg.durationDays]?.badge ?? 'Gói',
      badgeColor: postingPackageMeta[pkg.durationDays]?.badgeColor ?? 'bg-gray-100 text-gray-800',
      features: postingFeatures(pkg.creditAmount, pkg.durationDays, pkg.discountRate),
      cta: postingPackageMeta[pkg.durationDays]?.cta ?? 'Mở Khóa',
      tier: postingPackageMeta[pkg.durationDays]?.tier ?? pkg.durationDays,
    }));

  const featured = sortedPackages
    .filter((pkg) => pkg.creditTypeName.toLowerCase() === 'featured')
    .map<Package>((pkg) => ({
      id: buildPackageId(pkg.creditTypeName, pkg.durationDays),
      paidCreditPackageId: pkg.paidCreditPackageId,
      title: pkg.name,
      ...mapPackagePricing(pkg),
      credits: pkg.creditAmount,
      duration: pkg.durationDays,
      badge: featuredPackageMeta[pkg.durationDays]?.badge ?? 'Gói',
      badgeColor: featuredPackageMeta[pkg.durationDays]?.badgeColor ?? 'bg-gray-100 text-gray-800',
      features: featuredFeatures(pkg.creditAmount, pkg.durationDays, pkg.discountRate, pkg.rewardBadge),
      cta: buildFeaturedCta(pkg, pkg.durationDays),
      tier: featuredPackageMeta[pkg.durationDays]?.tier ?? pkg.durationDays,
    }));

  return { posting, featured };
};

const PendingPurchaseButton = ({ expiredAt, checkoutUrl, variant }: { expiredAt?: string | null, checkoutUrl?: string | null, variant: CreditType }) => {
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
      ? 'w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all'
      : 'w-full bg-gradient-to-r from-[#C4603A] to-[#d4724a] text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all';

  return (
    <div className="flex flex-col items-center">
      <button 
        type="button" 
        onClick={() => {
          if (checkoutUrl) window.location.href = checkoutUrl;
        }} 
        className={buyButtonClass}
      >
        Tiếp tục thanh toán
      </button>
      {formattedTime && (
        <div className="mt-3 text-red-500 text-sm font-semibold">
          Hết hạn vào {formattedTime}
        </div>
      )}
    </div>
  );
};

const renderPackagePurchaseButton = (
  purchaseState: PackagePurchaseState,
  onBuy: () => void,
  variant: CreditType,
  isLoading: boolean,
  isAnyLoading: boolean,
  status?: CreditTypePurchaseStatus
) => {
  if (purchaseState === 'in_use') {
    return (
      <button
        disabled
        className="w-full bg-gray-300 text-gray-600 py-4 rounded-xl font-bold cursor-not-allowed"
      >
        Đang Sử Dụng
      </button>
    );
  }

  if (purchaseState === 'pending' && status) {
    return <PendingPurchaseButton expiredAt={status.pendingOrderExpiredAt} checkoutUrl={status.pendingOrderCheckoutUrl} variant={variant} />;
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
      ? 'w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all'
      : 'w-full bg-gradient-to-r from-[#C4603A] to-[#d4724a] text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all';

  return (
    <button type="button" onClick={onBuy} className={buyButtonClass}>
      Mua Ngay
    </button>
  );
};

export default function PlansPage() {
  const { initiateCheckout, isCheckoutLoading, loadingPackageId, checkoutError } = useCheckout();
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
  }, [activeTab, loadCreditBatches]);

  useEffect(() => {
    if (activeTab !== 'history') {
      return;
    }

    let isMounted = true;

    const loadTransactions = async () => {
      setIsTransactionsLoading(true);
      setTransactionsError(null);

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
    void initiateCheckout(pkg.paidCreditPackageId);
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl text-gray-900 mb-4">Nâng Cấp Sức Mạnh Đăng Tin</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chọn gói phù hợp để tăng khả năng hiển thị, đăng sản phẩm và nổi bật trong cộng đồng thời trang REVORA
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'packages'
              ? 'bg-[#2D5A3D] text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Gói Credits</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'history'
              ? 'bg-[#2D5A3D] text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            <History className="w-5 h-5" />
            <span>Lịch Sử Giao Dịch</span>
          </button>
        </div>

        {/* Tab Content: Packages */}
        {activeTab === 'packages' && (
          <>
            {/* Current Credits Dashboard */}
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-16">
              <div className="mb-6">
                <h2 className="text-2xl text-gray-900 mb-2">Credits Hiện Tại</h2>
                {creditError && <p className="text-sm text-amber-600">{creditError}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CreditDisplay type="posting" batches={isCreditLoading ? [] : userCreditBatches.posting} />
                <CreditDisplay type="featured" batches={isCreditLoading ? [] : userCreditBatches.featured} />
              </div>
            </div>

            {/* Posting Packages Section */}
            <div className="mb-16">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Image className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl text-gray-900">Gói Credits Đăng Tin</h2>
              </div>
              {packageError && <p className="mb-4 text-sm text-amber-600">{packageError}</p>}
              {creditSummaries.posting?.purchaseBlockReason && (
                <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-800">Thông báo</h4>
                    <p className="text-sm text-amber-700 mt-0.5">{creditSummaries.posting.purchaseBlockReason}</p>
                  </div>
                </div>
              )}
              {checkoutError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-800">Thanh toán không thành công</h4>
                    <p className="text-sm text-red-600 mt-0.5">{checkoutError}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {isPackageLoading ? (
                  <div className="md:col-span-3 bg-white rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                    Đang tải danh sách gói credits...
                  </div>
                ) : postingPackages.length > 0 ? postingPackages.map((pkg) => {
                  const purchaseState = getPackagePurchaseState(pkg.id, postingPurchaseStatus);
                  const isInUse = purchaseState === 'in_use';

                  return (
                    <div
                      key={pkg.id}
                      className={`relative bg-white rounded-3xl shadow-lg p-8 transition-all ${isInUse
                        ? 'ring-4 ring-blue-500 scale-105'
                        : purchaseState === 'available'
                          ? 'hover:shadow-2xl hover:scale-105'
                          : 'opacity-90'
                        }`}
                    >
                      {/* Badge */}
                      <div className="absolute top-6 right-6">
                        <span className={`${pkg.badgeColor} px-4 py-1.5 rounded-full text-xs font-bold`}>
                          {pkg.badge}
                        </span>
                      </div>

                      {/* Active Plan Badge */}
                      {isInUse && (
                        <div className="absolute top-6 left-6">
                          <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1">
                            <Check className="w-3 h-3" />
                            <span>Đang Dùng</span>
                          </span>
                        </div>
                      )}

                      <div className="mt-8">
                        <h3 className="text-2xl text-gray-900 mb-4">{pkg.title}</h3>
                        <div className="mb-6">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-4xl font-bold text-blue-600">
                              {pkg.price.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          {pkg.originalPrice && (
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-gray-500 line-through text-sm">
                                {pkg.originalPrice.toLocaleString('vi-VN')}đ
                              </span>
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                -{pkg.discountPercent}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 mb-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{pkg.credits}</div>
                            <div className="text-sm text-gray-600">Credits Đăng Tin</div>
                          </div>
                        </div>

                        <ul className="space-y-3 mb-8">
                          {pkg.features.map((feature, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {renderPackagePurchaseButton(
                          purchaseState,
                          () => handleSelectPackage(pkg),
                          'posting',
                          loadingPackageId === pkg.paidCreditPackageId,
                          isCheckoutLoading,
                          postingPurchaseStatus
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="md:col-span-3 bg-white rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                    Chưa có gói đăng tin nào khả dụng.
                  </div>
                )}
              </div>
            </div>

            {/* Featured Packages Section */}
            <div className="mb-16">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-[#C4603A]/10 rounded-xl">
                  <Sparkles className="w-6 h-6 text-[#C4603A]" />
                </div>
                <h2 className="text-3xl text-gray-900">Gói Credits Nổi Bật</h2>
              </div>
              {creditSummaries.featured?.purchaseBlockReason && (
                <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-800">Thông báo</h4>
                    <p className="text-sm text-amber-700 mt-0.5">{creditSummaries.featured.purchaseBlockReason}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {isPackageLoading ? (
                  <div className="md:col-span-3 bg-white rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                    Đang tải danh sách gói credits...
                  </div>
                ) : featuredPackages.length > 0 ? featuredPackages.map((pkg) => {
                  const purchaseState = getPackagePurchaseState(pkg.id, featuredPurchaseStatus);
                  const isInUse = purchaseState === 'in_use';

                  return (
                    <div
                      key={pkg.id}
                      className={`relative bg-white rounded-3xl shadow-lg p-8 transition-all ${isInUse
                        ? 'ring-4 ring-[#C4603A] scale-105'
                        : purchaseState === 'available'
                          ? 'hover:shadow-2xl hover:scale-105'
                          : 'opacity-90'
                        }`}
                    >
                      {/* Badge */}
                      <div className="absolute top-6 right-6">
                        <span className={`${pkg.badgeColor} px-4 py-1.5 rounded-full text-xs font-bold`}>
                          {pkg.badge}
                        </span>
                      </div>

                      {/* Active Plan Badge */}
                      {isInUse && (
                        <div className="absolute top-6 left-6">
                          <span className="bg-[#C4603A] text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1">
                            <Check className="w-3 h-3" />
                            <span>Đang Dùng</span>
                          </span>
                        </div>
                      )}

                      <div className="mt-8">
                        <h3 className="text-2xl text-gray-900 mb-4">{pkg.title}</h3>
                        <div className="mb-6">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-4xl font-bold text-[#C4603A]">
                              {pkg.price.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          {pkg.originalPrice && (
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-gray-500 line-through text-sm">
                                {pkg.originalPrice.toLocaleString('vi-VN')}đ
                              </span>
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                -{pkg.discountPercent}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="bg-[#C4603A]/10 rounded-xl p-4 mb-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-[#C4603A]">{pkg.credits}</div>
                            <div className="text-sm text-gray-600">Credits Nổi Bật</div>
                          </div>
                        </div>

                        <ul className="space-y-3 mb-8">
                          {pkg.features.map((feature, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {renderPackagePurchaseButton(
                          purchaseState,
                          () => handleSelectPackage(pkg),
                          'featured',
                          loadingPackageId === pkg.paidCreditPackageId,
                          isCheckoutLoading,
                          featuredPurchaseStatus
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="md:col-span-3 bg-white rounded-3xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                    Chưa có gói nổi bật nào khả dụng.
                  </div>
                )}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl text-gray-900 mb-6 text-center">Câu Hỏi Thường Gặp</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Credits có hết hạn không?</h3>
                  <p className="text-sm text-gray-600">
                    Có, credits sẽ hết hạn theo thời gian của gói bạn đã mua (1/7/30 ngày). Hãy sử dụng trước khi hết hạn.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Tôi có thể mua nhiều gói cùng lúc?</h3>
                  <p className="text-sm text-gray-600">
                    Bạn chỉ có thể mua tối đa 1 gói Đăng Tin và 1 gói Nổi Bật (paid) cùng lúc. Khi credits paid của loại đó về 0, bạn có thể mua gói mới cùng loại. Credits free không chặn mua gói mới nếu paid đã hết; nếu còn cả free và paid thì các gói paid khác sẽ bị khóa cho đến khi paid hết.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Phương thức thanh toán nào được hỗ trợ?</h3>
                  <p className="text-sm text-gray-600">
                    Hiện tại chúng tôi hỗ trợ thanh toán qua PayOS (chuyển khoản, QR Code và các phương thức liên kết).
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Thanh toán thành công thì credits được cộng thế nào?</h3>
                  <p className="text-sm text-gray-600">
                    Hệ thống đối chiếu số tiền thực nhận với giá gói: chuyển đủ thì cộng credits ngay; chuyển thừa thì vẫn cộng credits (phần thừa không hoàn lại); chuyển thiếu thì không cộng credits và số tiền đã chuyển cũng không được hoàn. REVORA hiện không hỗ trợ hoàn tiền cho các giao dịch mua gói credits.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab Content: Transaction History */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl text-gray-900 font-bold flex items-center gap-2">
                <History className="w-6 h-6 text-[#2D5A3D]" />
                Lịch Sử Giao Dịch
              </h2>
              <p className="text-gray-600 text-sm mt-1">Danh sách các giao dịch mua gói credits</p>
              {transactionsError && (
                <p className="text-sm text-amber-600 mt-2">{transactionsError}</p>
              )}
            </div>

            {/* Transaction List */}
            <div className="divide-y divide-gray-50">
              {isTransactionsLoading ? (
                <div className="text-center py-16 text-gray-500">
                  Đang tải lịch sử giao dịch...
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-16">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có giao dịch nào</h3>
                  <p className="text-gray-500 text-sm">Lịch sử mua gói của bạn sẽ hiển thị tại đây</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="px-8 py-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-6">
                      {/* Left: Transaction Info */}
                      <div className="flex items-start gap-4 min-w-0">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.packageType === 'posting' ? 'bg-blue-50' : 'bg-orange-50'
                          }`}>
                          <TrendingUp className={`w-6 h-6 ${tx.packageType === 'posting' ? 'text-blue-600' : 'text-[#C4603A]'
                            }`} />
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{tx.packageName}</h3>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${tx.packageType === 'posting'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-orange-100 text-[#C4603A]'
                              }`}>
                              {tx.creditTypeDisplayName}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center ${getTransactionStatusClass(tx.status)}`}>
                              {getTransactionStatusIcon(tx.status)}
                              {tx.status === 'late_paid' ? 'Thanh toán trễ' : tx.statusLabel}
                            </span>
                            {tx.creditsGranted && tx.status !== 'late_paid' && (
                              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700">
                                Đã cộng credits
                              </span>
                            )}
                          </div>
                          
                          {tx.status === 'late_paid' && (
                            <p className="text-xs text-amber-700/80 mb-2 mt-0.5 leading-snug">
                              Bạn đã chuyển tiền sau khi mã QR hết hạn. Hệ thống đã linh động ghi nhận và cộng credits thành công.
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {tx.date} {tx.time}
                            </span>
                            <span>•</span>
                            <span>Mã đơn: {tx.orderCode}</span>
                            <span>•</span>
                            <span>Mã GD: {tx.transactionCode}</span>
                            <span>•</span>
                            <span>{tx.paymentMethod}</span>
                          </div>
                          {tx.paidAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              Thanh toán lúc: {formatTransactionDateTime(tx.paidAt).date} {formatTransactionDateTime(tx.paidAt).time}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Credits */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <TrendingDown className="w-4 h-4 text-red-500" />
                          <span className="text-lg font-bold text-red-600">
                            -{getTransactionAmount(tx).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        {tx.status === 'completed' && tx.expectedAmount !== tx.receivedAmount && (
                          <p className="text-xs text-gray-400 mb-1">
                            Dự kiến: {tx.expectedAmount.toLocaleString('vi-VN')}đ
                          </p>
                        )}
                        <div className={`text-sm font-semibold ${tx.packageType === 'posting' ? 'text-blue-600' : 'text-[#C4603A]'
                          }`}>
                          +{tx.credits} credits
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary */}
            {!isTransactionsLoading && transactions.length > 0 && (
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tổng số giao dịch:</span>
                  <span className="font-bold text-gray-900">{transactions.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Giao dịch thành công:</span>
                  <span className="font-bold text-green-700">{successfulTransactions.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Tổng chi tiêu:</span>
                  <span className="font-bold text-red-600">
                    {totalSpent.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Tổng credits đã cộng:</span>
                  <span className="font-bold text-[#2D5A3D]">
                    {totalCreditsPurchased} credits
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Checkout Loading Overlay */}
      {isCheckoutLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop Blur */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-md transition-opacity duration-300" />
          
          {/* Loading Card */}
          <div className="relative bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-gray-100 animate-in fade-in zoom-in duration-300">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#2D5A3D] rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#2D5A3D] rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Đang xử lý</h3>
            <p className="text-sm text-gray-500 text-center">
              Đang kết nối an toàn đến cổng thanh toán PayOS...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
