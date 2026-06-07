import { useState, useEffect, useCallback, useRef } from 'react';
import { getMyProductsAPI } from '../services/productService';
import { ProductResponseDto } from '../types';
import axios from 'axios';

export interface UseMyProductsResult {
  products: ProductResponseDto[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useMyProducts = (): UseMyProductsResult => {
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const controllerRef = useRef<AbortController | null>(null);

  const refetch = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getMyProductsAPI();
        if (response.success && response.data) {
          setProducts(response.data.items);
          setTotalCount(response.data.totalCount);
        } else {
          setError('Không thể tải danh sách sản phẩm.');
        }
      } catch (err: any) {
        if (axios.isCancel(err) || err.name === 'CanceledError') {
          return;
        }
        console.error('Error fetching user products:', err);
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải sản phẩm.');
      } finally {
        if (controllerRef.current === controller) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [retryCount]);

  return { products, totalCount, isLoading, error, refetch };
};
