import { authClient } from '../../providers/authProvider/authService';
import type { ApiResponse } from '../auth/types';
import { CheckoutRequest, CheckoutResponse, PaymentStatusResponse } from './payment';

export const checkoutAPI = async (dto: CheckoutRequest): Promise<ApiResponse<CheckoutResponse>> => {
  const response = await authClient.post<ApiResponse<CheckoutResponse>>('/payment/checkout', dto);
  return response.data;
};

export const getPaymentStatusAPI = async (orderCode: string): Promise<ApiResponse<PaymentStatusResponse>> => {
  const response = await authClient.get<ApiResponse<PaymentStatusResponse>>(`/payment/status/${orderCode}`);
  return response.data;
};

export const cancelPaymentAPI = async (orderCode: string): Promise<ApiResponse<boolean>> => {
  const response = await authClient.post<ApiResponse<boolean>>(`/payment/cancel/${orderCode}`);
  return response.data;
};
