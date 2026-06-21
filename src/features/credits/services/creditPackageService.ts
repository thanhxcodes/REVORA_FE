import { authClient } from '../../../providers/authProvider/authService';
import type { ApiResponse } from '../../auth/types';
import type { CreditBatch, UserCreditBatches, UserCreditSummaryApi } from '../types';

const creditPackagesUrl = (path: string) => `/CreditPackages/${path}`;

export interface AdminUpdatePackagePayload {
  name: string;
  originalPrice: number;
  discountRate: number;
  discountedPrice: number;
  isActive: boolean;
  rewardBadgeId: number | null;
  descriptions: string[];
}

const formatDate = (expiresAt: string | null) => {
  if (!expiresAt) return 'Vĩnh viễn';
  const utcString = expiresAt.endsWith('Z') ? expiresAt : `${expiresAt}Z`;
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(utcString));
};

const getDaysUntilExpiry = (expiresAt: string | null) => {
  if (!expiresAt) return undefined;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffInMs = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffInMs / (1000 * 60 * 60 * 24)));
};

export const mapCreditBatches = (batches: UserCreditSummaryApi['batches']): CreditBatch[] =>
  batches.map((batch) => ({
    credits: batch.remainingCredits,
    expiresDate: formatDate(batch.expiresAt),
    expiresIn: getDaysUntilExpiry(batch.expiresAt),
    packageName: batch.packageName,
    expiresAtIso: batch.expiresAt,
  }));

export const fetchPostingCreditSummary = () =>
  authClient.get<ApiResponse<UserCreditSummaryApi>>(creditPackagesUrl('my-posting-credits'));

export const fetchFeaturedCreditSummary = () =>
  authClient.get<ApiResponse<UserCreditSummaryApi>>(creditPackagesUrl('my-featured-credits'));

export const fetchUserCreditBatches = async (): Promise<UserCreditBatches> => {
  const [postingResult, featuredResult] = await Promise.allSettled([
    fetchPostingCreditSummary(),
    fetchFeaturedCreditSummary(),
  ]);

  const postingSummary =
    postingResult.status === 'fulfilled' ? postingResult.value.data.data ?? null : null;
  const featuredSummary =
    featuredResult.status === 'fulfilled' ? featuredResult.value.data.data ?? null : null;

  return {
    posting: postingSummary ? mapCreditBatches(postingSummary.batches) : [],
    featured: featuredSummary ? mapCreditBatches(featuredSummary.batches) : [],
  };
};

export const fetchMyUsageHistory = () =>
  authClient.get<ApiResponse<any[]>>(creditPackagesUrl('my-usage-history'));

export const updateCreditPackage = (id: number, payload: AdminUpdatePackagePayload) =>
  authClient.put<ApiResponse<any>>(`/CreditPackages/${id}`, payload);
