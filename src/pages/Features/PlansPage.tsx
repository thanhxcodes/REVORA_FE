import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Image, Check, X, QrCode, History, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import CreditDisplay from '../../components/common/CreditDisplay';
import { authClient } from '../../providers/authProvider/authService';
import type { ApiResponse } from '../../features/auth/types';

interface CreditBatch {
  credits: number;
  expiresDate: string;
  expiresIn?: number;
  packageName?: string;
}

interface UserCreditBatchItemApi {
  userCreditBatchId: number;
  creditTypeId: number;
  creditTypeName: string;
  remainingCredits: number;
  expiresAt: string;
  isPaid: boolean;
  packageId: number;
  packageName: string;
}

interface UserCreditSummaryApi {
  creditTypeId: number;
  creditTypeName: string;
  totalRemainingCredits: number;
  paidRemainingCredits: number;
  freeRemainingCredits: number;
  hasActivePaidCredits: boolean;
  hasPendingPaidOrder: boolean;
  pendingPaidPackageId: number | null;
  canPurchasePaidPackage: boolean;
  purchaseBlockReason: string | null;
  batches: UserCreditBatchItemApi[];
}

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

const formatDate = (expiresAt: string) =>
  new Intl.DateTimeFormat('vi-VN').format(new Date(expiresAt));

const getDaysUntilExpiry = (expiresAt: string) => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffInMs = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffInMs / (1000 * 60 * 60 * 24)));
};

const mapCreditBatches = (batches: UserCreditBatchItemApi[]): CreditBatch[] =>
  batches.map((batch) => ({
    credits: batch.remainingCredits,
    expiresDate: formatDate(batch.expiresAt),
    expiresIn: getDaysUntilExpiry(batch.expiresAt),
    packageName: batch.packageName,
  }));

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
  paymentStatus: string;
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
type TransactionStatus = 'completed' | 'pending' | 'failed';

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

const mapPaymentStatus = (paymentStatus: string): TransactionStatus => {
  const normalized = paymentStatus.trim().toLowerCase();

  if (normalized === 'successful' || normalized === 'success') {
    return 'completed';
  }

  if (normalized === 'pending' || normalized === 'processing') {
    return 'pending';
  }

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
        status: mapPaymentStatus(transaction.paymentStatus),
        statusLabel: transaction.paymentStatusLabel,
        creditsGranted: transaction.creditsGranted,
        paidAt: transaction.paidAt,
      };
    });

const getTransactionAmount = (transaction: Transaction) =>
  transaction.status === 'completed' ? transaction.receivedAmount : transaction.expectedAmount;

const getTransactionStatusClass = (status: TransactionStatus) => {
  if (status === 'completed') {
    return 'bg-green-100 text-green-700';
  }

  if (status === 'pending') {
    return 'bg-yellow-100 text-yellow-700';
  }

  return 'bg-red-100 text-red-700';
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

type PackagePurchaseState = 'in_use' | 'available' | 'locked';

interface CreditTypePurchaseStatus {
  isTypeLocked: boolean;
  activePackageId: string | null;
}

const resolveActivePackageId = (
  batch: UserCreditBatchItemApi,
  packages: Package[],
  creditType: CreditType
): string | null => {
  if (batch.isPaid) {
    const matchedByPaidId = packages.find(
      (pkg) => pkg.paidCreditPackageId === batch.packageId
    );
    if (matchedByPaidId) {
      return matchedByPaidId.id;
    }
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
  if (!summary || summary.canPurchasePaidPackage) {
    return { isTypeLocked: false, activePackageId: null };
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

  if (summary.pendingPaidPackageId != null) {
    const pendingPackage = packages.find(
      (pkg) => pkg.paidCreditPackageId === summary.pendingPaidPackageId
    );
    return {
      isTypeLocked: true,
      activePackageId: pendingPackage?.id ?? null,
    };
  }

  return { isTypeLocked: true, activePackageId: null };
};

const getPackagePurchaseState = (
  packageId: string,
  status: CreditTypePurchaseStatus
): PackagePurchaseState => {
  if (!status.isTypeLocked) {
    return 'available';
  }

  if (status.activePackageId === packageId) {
    return 'in_use';
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

const renderPackagePurchaseButton = (
  purchaseState: PackagePurchaseState,
  onBuy: () => void,
  variant: CreditType
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

  if (purchaseState === 'locked') {
    return (
      <button
        disabled
        className="w-full bg-gray-200 text-gray-400 py-4 rounded-xl font-bold cursor-not-allowed"
      >
        Mua Ngay
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
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [packageType, setPackageType] = useState<'posting' | 'featured'>('posting');
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

  useEffect(() => {
    let isMounted = true;

    const loadCreditBatches = async () => {
      setIsCreditLoading(true);
      setCreditError(null);

      const [postingResult, featuredResult] = await Promise.allSettled([
        authClient.get<ApiResponse<UserCreditSummaryApi>>(
          'https://localhost:7015/api/CreditPackages/my-posting-credits'
        ),
        authClient.get<ApiResponse<UserCreditSummaryApi>>(
          'https://localhost:7015/api/CreditPackages/my-featured-credits'
        ),
      ]);

      if (!isMounted) {
        return;
      }

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
    };

    void loadCreditBatches();

    return () => {
      isMounted = false;
    };
  }, []);

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
          'https://localhost:7015/api/Payment/transactions'
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
          'https://localhost:7015/api/CreditPackages/active',
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

  const handleSelectPackage = (pkg: Package, type: CreditType) => {
    setSelectedPackage(pkg);
    setPackageType(type);
    setShowQRModal(true);
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
                <p className="mb-4 text-sm text-amber-600">{creditSummaries.posting.purchaseBlockReason}</p>
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
                          () => handleSelectPackage(pkg, 'posting'),
                          'posting'
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
                <p className="mb-4 text-sm text-amber-600">{creditSummaries.featured.purchaseBlockReason}</p>
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
                          () => handleSelectPackage(pkg, 'featured'),
                          'featured'
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

            {/* VNPay QR Modal */}
            {showQRModal && selectedPackage && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 z-50"
                  onClick={() => setShowQRModal(false)}
                />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
                    <button
                      onClick={() => setShowQRModal(false)}
                      className="absolute top-6 right-6 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="text-center mb-6">
                      <h3 className="text-2xl text-gray-900 mb-2">Thanh Toán VNPay</h3>
                      <p className="text-gray-600">Quét mã QR để thanh toán</p>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-6">
                      <div className="bg-white p-6 rounded-xl shadow-inner flex items-center justify-center">
                        <div className="text-center">
                          <QrCode className="w-48 h-48 text-gray-300 mx-auto mb-4" />
                          <p className="text-sm text-gray-500">QR Code VNPay</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className={`rounded-2xl p-6 mb-6 ${packageType === 'posting'
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-[#C4603A]/10 border-2 border-[#C4603A]'
                      }`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-700">Gói:</span>
                        <span className="font-bold text-gray-900">{selectedPackage.title}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-700">Loại:</span>
                        <span className="font-bold text-gray-900">
                          {packageType === 'posting' ? 'Credits Đăng Tin' : 'Credits Nổi Bật'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-700">Credits:</span>
                        <span className="font-bold text-gray-900">{selectedPackage.credits} credits</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-700">Thời hạn:</span>
                        <span className="font-bold text-gray-900">{selectedPackage.duration} ngày</span>
                      </div>
                      {selectedPackage.originalPrice && (
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-700">Giá gốc:</span>
                          <span className="text-gray-500 line-through">
                            {selectedPackage.originalPrice.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                        <span className="text-lg font-bold text-gray-900">Tổng thanh toán:</span>
                        <span className={`text-2xl font-bold ${packageType === 'posting' ? 'text-blue-600' : 'text-[#C4603A]'
                          }`}>
                          {selectedPackage.price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                      Sau khi thanh toán thành công, credits sẽ được cập nhật tự động vào tài khoản của bạn trong vòng 1-2 phút
                    </p>
                  </div>
                </div>
              </>
            )}

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
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{tx.packageName}</h3>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${tx.packageType === 'posting'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-orange-100 text-[#C4603A]'
                              }`}>
                              {tx.creditTypeDisplayName}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getTransactionStatusClass(tx.status)}`}>
                              {tx.statusLabel}
                            </span>
                            {tx.creditsGranted && (
                              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700">
                                Đã cộng credits
                              </span>
                            )}
                          </div>
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
    </div>
  );
}
