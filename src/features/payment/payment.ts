export interface CheckoutRequest {
  packageId: number;
}

export interface CheckoutResponse {
  orderId: number;
  orderCode: string;
  payOSOrderCode: number;
  paymentUrl: string;
  expiredAt: string;
  amount: number;
  isExisting: boolean;
}

// PaymentStatus matching Backend's Enums
export enum PaymentStatus {
  Pending = 1,
  Successful = 2,
  Failed = 3,
  Expired = 4,
  Cancelled = 5
}

// OrderStatus matching Backend's Enums
export enum OrderStatus {
  PendingPayment = 0,
  Completed = 1,
  Cancelled = 2
}

export interface PaymentStatusResponse {
  orderCode: string;
  status: OrderStatus;
  statusName: string;
  paymentStatus: PaymentStatus;
  paymentStatusName: string;
  amount: number;
  packageName: string | null;
  createdAt: string;
  paidAt: string | null;
  expiredAt: string | null;
}
