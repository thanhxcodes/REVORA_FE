import { useState, useEffect, useCallback, useRef } from 'react';
import { toggleFollowAPI, getFollowersAPI, getFollowingAPI } from '../services/followService';
import { UserSummaryDto, PagedResult } from '../types';
import axios from 'axios';

export const useToggleFollow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFollow = async (userId: number): Promise<{ isFollowing: boolean } | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await toggleFollowAPI(userId);
      
      // Phát sự kiện toàn cục để cập nhật các danh sách
      const event = new CustomEvent('follow_status_changed', {
        detail: { userId, isFollowing: response.data.isFollowing }
      });
      window.dispatchEvent(event);

      return response.data;
    } catch (err: any) {
      console.error('Error toggling follow:', err);
      const serverMessage = err.response?.data?.message || 'Có lỗi xảy ra khi thực hiện hành động này.';
      setError(serverMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { toggleFollow, isLoading, error };
};

export const useFollowers = (userId: number | null, pageNumber: number = 1, pageSize: number = 10) => {
  const [data, setData] = useState<PagedResult<UserSummaryDto> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  const controllerRef = useRef<AbortController | null>(null);

  const refetch = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!userId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    const loadFollowers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiResponse = await getFollowersAPI(userId, pageNumber, pageSize);
        setData(apiResponse.data);
      } catch (err: any) {
        if (axios.isCancel(err) || err.name === 'CanceledError') return;
        console.error('Error fetching followers:', err);
        setError(err.response?.data?.message || 'Không thể tải danh sách người theo dõi.');
        setData(null);
      } finally {
        if (controllerRef.current === controller) {
          setIsLoading(false);
        }
      }
    };

    loadFollowers();

    return () => {
      controller.abort();
    };
  }, [userId, pageNumber, pageSize, retryCount]);

  useEffect(() => {
    const handleFollowStatusChanged = (e: any) => {
      const { userId: targetId, isFollowing } = e.detail;
      setData((prev) => {
        if (!prev) return prev;
        
        // Nếu người này đã có trong list, cập nhật trạng thái isFollowing (để modal cập nhật nút)
        const itemExists = prev.items.some(item => item.userId === targetId);
        
        if (itemExists) {
          return {
            ...prev,
            items: prev.items.map((item) => 
              item.userId === targetId ? { ...item, isFollowing: isFollowing } : item
            )
          };
        }
        return prev;
      });
    };

    window.addEventListener('follow_status_changed', handleFollowStatusChanged);
    return () => window.removeEventListener('follow_status_changed', handleFollowStatusChanged);
  }, []);

  return { data, isLoading, error, refetch };
};

export const useFollowing = (userId: number | null, pageNumber: number = 1, pageSize: number = 10) => {
  const [data, setData] = useState<PagedResult<UserSummaryDto> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  const controllerRef = useRef<AbortController | null>(null);

  const refetch = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!userId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    const loadFollowing = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiResponse = await getFollowingAPI(userId, pageNumber, pageSize);
        setData(apiResponse.data);
      } catch (err: any) {
        if (axios.isCancel(err) || err.name === 'CanceledError') return;
        console.error('Error fetching following:', err);
        setError(err.response?.data?.message || 'Không thể tải danh sách đang theo dõi.');
        setData(null);
      } finally {
        if (controllerRef.current === controller) {
          setIsLoading(false);
        }
      }
    };

    loadFollowing();

    return () => {
      controller.abort();
    };
  }, [userId, pageNumber, pageSize, retryCount]);

  useEffect(() => {
    const handleFollowStatusChanged = (e: any) => {
      const { userId: targetId, isFollowing } = e.detail;
      setData((prev) => {
        if (!prev) return prev;
        
        // Nếu người này đã có trong list, chỉ cần cập nhật trạng thái isFollowing (để modal không bị mất item)
        const itemExists = prev.items.some(item => item.userId === targetId);
        
        if (itemExists) {
          return {
            ...prev,
            items: prev.items.map((item) => 
              item.userId === targetId ? { ...item, isFollowing: isFollowing } : item
            )
          };
        } else if (isFollowing) {
          // Nếu follow người mới chưa có trong list, trigger refetch để lấy data thật
          refetch();
          return prev;
        }
        return prev;
      });
    };

    window.addEventListener('follow_status_changed', handleFollowStatusChanged);
    return () => window.removeEventListener('follow_status_changed', handleFollowStatusChanged);
  }, [refetch]);

  return { data, isLoading, error, refetch };
};
