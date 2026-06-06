import { authClient } from '../../../providers/authProvider/authService';
import type { ApiResponse } from '../../auth/types';
import type { CreditBatch, UserCreditBatches, UserCreditSummaryApi } from '../types';

const getApiRoot = () =>
  import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') || 'https://localhost:7015';

const creditPackagesUrl = (path: string) => `${getApiRoot()}/api/CreditPackages/${path}`;

const formatDate = (expiresAt: string) =>
  new Intl.DateTimeFormat('vi-VN').format(new Date(expiresAt));

const getDaysUntilExpiry = (expiresAt: string) => {
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
