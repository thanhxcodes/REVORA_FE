import { authClient } from '../../../providers/authProvider/authService';
import { ProductResponseDto } from '../types';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Fetch the currently authenticated user's selling products
 */
export const getMyProductsAPI = async (
  pageNumber: number = 1,
  pageSize: number = 100
): Promise<{ success: boolean; data: PagedResult<ProductResponseDto> }> => {
  const response = await authClient.get<{ success: boolean; data: PagedResult<ProductResponseDto> }>(
    '/products/me',
    {
      params: { pageNumber, pageSize },
    }
  );
  return response.data;
};

export const getUserProductsAPI = async (
  sellerId: number,
  pageNumber: number = 1,
  pageSize: number = 100
): Promise<{ success: boolean; data: PagedResult<ProductResponse> }> => {
  const response = await authClient.get<{ success: boolean; data: PagedResult<ProductResponse> }>(
    `/products/seller/${sellerId}`,
    {
      params: { pageNumber, pageSize },
    }
  );
  return response.data;
};
