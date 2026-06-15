export interface AdminUserResponseDto {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  roleId: number;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  tradeSuccessCount: number;
}

export interface TransactionResponseDto {
  orderCode: string;
  packageName: string;
  type: string;
  credits: number;
  amount: number;
  status: string;
  createdAt: string;
}

export interface AdminUserOverviewDto {
  postingCredits: number;
  featuredCredits: number;
  totalSpent: number;
  productsPosted: number;
  totalTransactions: number;
  recentTransactions: TransactionResponseDto[];
}
