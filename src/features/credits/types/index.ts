export interface CreditBatch {
  credits: number;
  expiresDate: string;
  expiresIn?: number;
  packageName?: string;
  expiresAtIso?: string | null;
}

export interface UserCreditBatchItemApi {
  userCreditBatchId: number;
  creditTypeId: number;
  creditTypeName: string;
  remainingCredits: number;
  expiresAt: string | null;
  isPaid: boolean;
  packageId: number;
  packageName: string;
}

export interface PendingOrderInfoDto {
  packageId: number;
  orderCode: string;
  checkoutUrl: string;
  expiredAt: string;
}

export interface UserCreditSummaryApi {
  creditTypeId: number;
  creditTypeName: string | null;
  totalRemainingCredits: number;
  paidRemainingCredits: number;
  freeRemainingCredits: number;
  hasActivePaidCredits: boolean;
  pendingOrders: PendingOrderInfoDto[];
  canPurchasePaidPackage: boolean;
  purchaseBlockReason: string | null;
  batches: UserCreditBatchItemApi[];
}

export interface UserCreditBatches {
  posting: CreditBatch[];
  featured: CreditBatch[];
}
