export interface CreditBatch {
  credits: number;
  expiresDate: string;
  expiresIn?: number;
  packageName?: string;
}

export interface UserCreditBatchItemApi {
  userCreditBatchId: number;
  creditTypeId: number;
  creditTypeName: string;
  remainingCredits: number;
  expiresAt: string;
  isPaid: boolean;
  packageId: number;
  packageName: string;
}

export interface UserCreditSummaryApi {
  creditTypeId: number;
  creditTypeName: string | null;
  totalRemainingCredits: number;
  paidRemainingCredits: number;
  freeRemainingCredits: number;
  hasActivePaidCredits: boolean;

  batches: UserCreditBatchItemApi[];
}

export interface UserCreditBatches {
  posting: CreditBatch[];
  featured: CreditBatch[];
}
